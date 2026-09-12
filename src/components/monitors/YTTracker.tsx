"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import type { YTPosition } from "@/lib/types";
import { parseCorners, projectPositions } from "@/lib/layoutProjection";

function useYTPositions(terminalCode: string) {
  const [positions, setPositions] = useState<YTPosition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(
        `/api/yt-tracking?terminal=${terminalCode}&t=${Date.now()}`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.details || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPositions(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch YT tracking data";
      setError(
        (err as Error)?.name === "AbortError"
          ? "YT tracking request timed out"
          : message,
      );
    } finally {
      clearTimeout(timeout);
    }
  }, [terminalCode]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 0);
    const interval = setInterval(fetchData, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchData]);

  return { positions, error, lastUpdated };
}

function parseViewBox(svgText: string) {
  const match = svgText.match(/viewBox="([^"]*)"/);
  if (!match) return { minX: 0, minY: 0, w: 1000, h: 600 };
  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  return { minX: parts[0] || 0, minY: parts[1] || 0, w: parts[2] || 1000, h: parts[3] || 600 };
}

function useTerminalLayout(terminalCode: string) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/TerminalLayout_${terminalCode}.svg?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setSvg(text);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to parse terminal SVG:", err);
        setError(err instanceof Error ? err.message : "Failed to load terminal layout");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [terminalCode]);

  const viewBox = useMemo(() => (svg ? parseViewBox(svg) : null), [svg]);

  return { svg, viewBox, error, loading };
}

function headingToArrow(heading: number): string {
  if (heading >= 315 || heading < 45) return "▲";
  if (heading >= 45 && heading < 135) return "▶";
  if (heading >= 135 && heading < 225) return "▼";
  return "◀";
}

function statusColor(status: string): string {
  if (status === "MOVING") return "var(--accent-load)";
  if (status === "IDLE") return "var(--accent-reefer)";
  return "var(--accent-discharge)";
}

const ANGLED_VIEW = "rotateX(46deg) rotateZ(-32deg) scale(1.45)";

function PerspectiveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
    </svg>
  );
}

function TopViewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" strokeLinecap="round" />
    </svg>
  );
}

interface MapMarker {
  key: string;
  label: string;
  left: number; // % of viewBox width
  top: number; // % of viewBox height
  heading: number;
  status: string;
}

export default function YTTracker({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [cameraView, setCameraView] = useState<"angled" | "top">("angled");

  const { positions, error: trackingError, lastUpdated } = useYTPositions(terminalCode);
  const { svg, viewBox, error: layoutError, loading: layoutLoading } = useTerminalLayout(terminalCode);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(3, Math.max(0.3, s + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const { minX: mapMinX, minY: mapMinY, w: mapW, h: mapH } =
    viewBox || { minX: 0, minY: 0, w: 1000, h: 600 };

  const isGeo = positions.some(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  const corners = useMemo(
    () => (svg && isGeo ? parseCorners(svg, terminalCode) : null),
    [svg, isGeo, terminalCode],
  );

  const projected = useMemo(() => projectPositions(positions, corners), [positions, corners]);

  const markers: MapMarker[] = useMemo(
    () =>
      projected.map((p) => ({
        key: p.key,
        label: p.label,
        left: ((p.x - mapMinX) / mapW) * 100,
        top: ((p.z - mapMinY) / mapH) * 100,
        heading: p.heading,
        status: p.status,
      })),
    [projected, mapMinX, mapMinY, mapW, mapH],
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} YT Tracker`}
        stats={`${positions.length} YT${positions.length === 1 ? "" : "s"} Tracked`}
        lastUpdated={lastUpdated}
        error={trackingError}
      />

      {/* Map area */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={() => {
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }}
        style={{ background: "var(--bg-vessel-viz)", perspective: "1400px" }}
      >
        {layoutLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-page)]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
                Loading Terminal Layout
              </p>
            </div>
          </div>
        ) : layoutError || !svg ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-page)]">
            <div className="text-center">
              <p className="text-sm font-mono text-red-500 mb-2">Failed to load terminal layout</p>
              <p className="text-xs font-mono text-[var(--text-tertiary)]">{layoutError}</p>
            </div>
          </div>
        ) : (
          <div
            className={`absolute inset-0 transition-transform duration-500 ease-out ${cameraView === "angled" ? "preserve-3d" : ""}`}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) ${
                cameraView === "angled" ? ANGLED_VIEW : ""
              }`,
              transformOrigin: "center center",
            }}
          >
            {/* Terminal layout map */}
            <div
              className="absolute inset-0 terminal-map"
              dangerouslySetInnerHTML={{ __html: svg }}
            />

            {/* YT vehicle markers overlaid on the map */}
            <div className="absolute inset-0 pointer-events-none">
              {markers.map((marker) => {
                const color = statusColor(marker.status);
                return (
                  <div
                    key={marker.key}
                    className="absolute"
                    style={{
                      left: `${marker.left}%`,
                      top: `${marker.top}%`,
                      transform: "translate(-50%, -90%)",
                    }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full animate-pulse ${marker.status === "MOVING" ? "" : "opacity-80"}`}
                        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                      />
                      <svg viewBox="-28 -34 56 40" className="w-11 h-10 overflow-visible">
                        <circle r="16" fill={color} opacity="0.18" className="animate-pulse" />
                        <rect x="-14" y="-8" width="28" height="16" rx="4" fill={color} stroke="#1e293b" strokeWidth="2" />
                        <rect x="2" y="-6" width="10" height="12" rx="2" fill="#0284c7" opacity="0.9" />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize="9"
                          fontWeight="900"
                          fontFamily="var(--font-mono)"
                          transform={`rotate(${marker.heading})`}
                        >
                          {headingToArrow(marker.heading)}
                        </text>
                      </svg>
                      <div className="mt-0.5 px-1.5 py-px rounded bg-[var(--bg-panel)]/90 border border-[var(--border)] text-[9px] font-mono font-black text-[var(--text-primary)] whitespace-nowrap">
                        {marker.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View toggle */}
        {!layoutLoading && !layoutError && svg && (
          <button
            type="button"
            onClick={() => setCameraView((v) => (v === "angled" ? "top" : "angled"))}
            aria-label={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
            aria-pressed={cameraView === "top"}
            title={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)]/55 bg-[var(--bg-panel)]/60 text-[var(--text-primary)] shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--bg-header)]/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
          >
            {cameraView === "angled" ? <PerspectiveIcon /> : <TopViewIcon />}
          </button>
        )}
      </div>
    </div>
  );
}