"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import type { YTPosition } from "@/lib/types";

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

export default function YTTracker({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const { positions, error: trackingError, lastUpdated } = useYTPositions(terminalCode);

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

  const maxX = positions.length > 0 ? Math.max(...positions.map((p) => p.x)) : 1000;
  const maxY = positions.length > 0 ? Math.max(...positions.map((p) => p.z)) : 600;
  const svgW = Math.max(maxX * 1.1, 800);
  const svgH = Math.max(maxY * 1.1, 500);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} YT Tracker`}
        stats={`${positions.length} YT${positions.length === 1 ? "" : "s"} Tracked`}
        lastUpdated={lastUpdated}
        error={trackingError}
      />

      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-2 py-1 bg-[var(--bg-panel)] border-b border-[var(--border)] shrink-0">
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-nav-hover)] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Zoom +
        </button>
        <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] px-2">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
          className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-nav-hover)] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Zoom -
        </button>
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded border border-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-nav-hover)] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Reset
        </button>
      </div>

      {/* Map area */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ background: "var(--bg-vessel-viz)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Grid */}
          <svg width={svgW} height={svgH} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--border-light)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* YT markers */}
            {positions.map((pos) => (
              <g key={pos.equNo} transform={`translate(${pos.x}, ${pos.z})`}>
                {/* Glow */}
                <circle r="18" fill={statusColor(pos.status)} opacity="0.15" />
                {/* Box */}
                <rect
                  x="-10" y="-6" width="20" height="12" rx="3"
                  fill={statusColor(pos.status)}
                  stroke="var(--bg-vessel-viz)"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                {/* Arrow */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  transform={`rotate(${pos.heading})`}
                >
                  {headingToArrow(pos.heading)}
                </text>
                {/* Label */}
                <text
                  y="16"
                  textAnchor="middle"
                  fill="var(--text-tertiary)"
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {pos.equNo}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-[var(--bg-panel)]/90 backdrop-blur-sm border border-[var(--border)] rounded-lg px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "var(--accent-load)" }} />
            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">Moving</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "var(--accent-reefer)" }} />
            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "var(--accent-discharge)" }} />
            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">Stopped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
