"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import type { YTPosition } from "@/lib/types";
import { parseCorners, projectPositions, type LayoutCorners } from "@/lib/layoutProjection";

const TRAIL_LENGTH = 20;

interface YTWithTrail extends YTPosition {
  trail: { x: number; z: number }[];
  _trackKey: string;
}

function headingToArrow(heading: number): string {
  if (heading >= 315 || heading < 45) return "▲";
  if (heading >= 45 && heading < 135) return "▶";
  if (heading >= 135 && heading < 225) return "▼";
  return "◀";
}

function statusColor(status: string | undefined): string {
  if (status === "MOVING") return "var(--accent-load)";
  if (status === "IDLE") return "var(--accent-reefer)";
  return "var(--accent-discharge)";
}

function useLayoutSvg(terminalCode: string) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/TerminalLayout_${terminalCode}.svg?t=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        setSvg(text);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load layout");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [terminalCode]);

  const corners: LayoutCorners | null = useMemo(
    () => (svg ? parseCorners(svg, terminalCode) : null),
    [svg, terminalCode],
  );

  return { corners, error, loading };
}

function useYTPositionsWithTrail(
  terminalCode: string,
  corners: LayoutCorners | null,
) {
  const [positions, setPositions] = useState<YTWithTrail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const trailMap = useRef<Map<string, { x: number; z: number }[]>>(new Map());

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
      const data: YTPosition[] = await res.json();
      const updated = data.map((pos) => {
        const [proj] = projectPositions([pos], corners);
        const trackKey = proj.key;
        const prevTrail = trailMap.current.get(trackKey) ?? [];
        const newTrail = [...prevTrail, { x: proj.x, z: proj.z }].slice(
          -TRAIL_LENGTH,
        );
        trailMap.current.set(trackKey, newTrail);
        return {
          ...pos,
          x: proj.x,
          z: proj.z,
          heading: proj.heading,
          status: proj.status,
          trail: newTrail,
          _trackKey: trackKey,
        } satisfies YTWithTrail;
      });
      setPositions(updated);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch";
      setError(
        (err as Error)?.name === "AbortError" ? "Request timed out" : message,
      );
    } finally {
      clearTimeout(timeout);
    }
  }, [terminalCode, corners]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { positions, error, lastUpdated };
}

export default function YTTrail({ terminalCode }: { terminalCode: string }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const { corners, error: layoutError, loading: layoutLoading } = useLayoutSvg(terminalCode);
  const { positions, error: trackingError, lastUpdated } =
    useYTPositionsWithTrail(terminalCode, corners);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(3, Math.max(0.3, s + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset.x, offset.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const maxX = positions.length > 0 ? Math.max(...positions.map((p) => p.x ?? 0)) : 1000;
  const maxZ = positions.length > 0 ? Math.max(...positions.map((p) => p.z ?? 0)) : 600;
  const svgW = Math.max(maxX * 1.1, 800);
  const svgH = Math.max(maxZ * 1.1, 500);

  if (layoutLoading && !positions.length) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
        <MonitorHeader
          title={`${terminalCode} YT Trail`}
          stats={undefined}
          lastUpdated={null}
          error={null}
        />
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
              Loading Terminal Layout
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} YT Trail`}
        stats={`${positions.length} YT${positions.length === 1 ? "" : "s"} Tracked`}
        lastUpdated={lastUpdated}
        error={trackingError}
      />
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
        style={{ background: "var(--bg-vessel-viz)" }}
      >
        {layoutError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-page)]">
            <div className="text-center">
              <p className="text-sm font-mono text-red-500 mb-2">Failed to load terminal layout</p>
              <p className="text-xs font-mono text-[var(--text-tertiary)]">{layoutError}</p>
            </div>
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <svg width={svgW} height={svgH} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <defs>
              <pattern id="grid-trail" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--border-light)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-trail)" />
            {positions.map((pos) => {
              const x = pos.x ?? 0;
              const z = pos.z ?? 0;
              const color = statusColor(pos.status);
              return (
                <g key={pos._trackKey}>
                  {pos.trail.length > 1 && (
                    <polyline
                      points={pos.trail.map((t) => `${t.x},${t.z}`).join(" ")}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  <circle cx={x} cy={z} r="18" fill={color} opacity="0.15" />
                  <rect
                    x={x - 10} y={z - 6} width="20" height="12" rx="3"
                    fill={color}
                    stroke="var(--bg-vessel-viz)"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                  <text
                    x={x} y={z}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                    transform={`rotate(${pos.heading ?? 0} ${x} ${z})`}
                  >
                    {headingToArrow(pos.heading ?? 0)}
                  </text>
                  <text
                    x={x} y={z + 16}
                    textAnchor="middle"
                    fill="var(--text-tertiary)"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pos._trackKey}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}