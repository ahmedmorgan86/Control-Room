"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount } from "@/lib/ui";

interface TruckPosition {
  truckId: string;
  latitude: number;
  longitude: number;
  updateTime: string;
  previousLatitude?: number;
  previousLongitude?: number;
  driverName?: string;
  status?: string;
}

export function YTTracker({ terminal }: { terminal: Terminal }) {
  const { data, lastUpdated, error } = usePolling<TruckPosition[]>(
    `/api/yt-tracking?terminal=${terminal}`,
    5000,
  );
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgLoading, setSvgLoading] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<"angled" | "top">("angled");
  const [now, setNow] = useState<Date>(new Date());
  const [selectedTruck, setSelectedTruck] = useState<TruckPosition | null>(null);

  // Live clock tick matching original
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load terminal SVG layout
  useEffect(() => {
    let active = true;
    fetch(`/api/terminal-layout?terminal=${terminal}`)
      .then((res) => res.text())
      .then((text) => {
        if (active) {
          setSvgContent(text);
          setSvgLoading(false);
        }
      })
      .catch(() => {
        if (active) setSvgLoading(false);
      });
    return () => {
      active = false;
    };
  }, [terminal]);

  const trucks = useMemo(() => data ?? [], [data]);

  const toggleCameraView = useCallback(() => {
    setCameraView((prev) => (prev === "angled" ? "top" : "angled"));
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      {/* Exact Original Header */}
      <header className="flex items-center justify-between px-6 h-14 shrink-0 bg-[var(--bg-panel)] border-b border-[var(--border)]">
        <div className="flex items-center flex-1 pl-2">
          <h1 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-[0.05em]">
            {terminal} YT Tracker
          </h1>
        </div>

        <div className="flex items-center justify-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
              Live
            </span>
          </div>

          <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
            {formatCount(trucks.length)} YT{trucks.length === 1 ? "" : "s"} Tracked
          </span>

          {lastUpdated && (
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}

          {error && (
            <span className="text-xs font-mono font-bold text-[var(--accent-discharge)]">
              Tracking Fault
            </span>
          )}
        </div>

        <div className="flex items-center justify-end flex-1 pr-2">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] tabular-nums leading-none">
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-xs font-mono font-semibold text-[var(--text-tertiary)] uppercase leading-none mt-1">
              {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
      </header>

      {/* Map Viewport & Sidebar */}
      <div className="relative flex-1 min-h-0 flex gap-3 p-3">
        {svgLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-panel)] rounded-xl border border-[var(--border)]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
                Loading Terminal Layout
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl relative overflow-hidden flex flex-col shadow-sm">
            <div
              className={`flex-1 w-full h-full relative overflow-auto flex items-center justify-center transition-transform duration-500 ${
                cameraView === "angled" ? "perspective-[1000px]" : ""
              }`}
            >
              <div
                className={`w-full h-full flex items-center justify-center transition-all duration-500 ${
                  cameraView === "angled" ? "transform rotateX(15deg) scale(0.95)" : ""
                }`}
                style={
                  svgContent
                    ? undefined
                    : { background: "var(--bg-page)" }
                }
              >
                {svgContent ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="text-xs font-mono text-[var(--text-tertiary)]">
                    Terminal Layout SVG Not Found
                  </div>
                )}
              </div>
            </div>

            {/* View Toggle Button matching original */}
            <button
              type="button"
              onClick={toggleCameraView}
              aria-label={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
              title={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-panel)]/80 text-[var(--text-primary)] shadow-md backdrop-blur-sm transition-colors hover:bg-[var(--bg-header)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
            >
              {cameraView === "angled" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Fleet Sidebar */}
        <div className="w-[320px] shrink-0 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-[var(--bg-header)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] font-bold">
              Active Fleet ({trucks.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
              Online
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[var(--border)]">
            {trucks.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-[var(--text-tertiary)]">
                No active truck telemetry
              </div>
            ) : (
              trucks.map((t) => {
                const isSelected = selectedTruck?.truckId === t.truckId;
                return (
                  <div
                    key={t.truckId}
                    onClick={() => setSelectedTruck(t)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-[var(--bg-nav-hover)] ${
                      isSelected ? "bg-[var(--accent-blue)]/10 border-l-4 border-[var(--accent-blue)]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                          YT #{t.truckId}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        {new Date(t.updateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[var(--text-secondary)] mt-1">
                      <div>
                        <span className="text-[var(--text-tertiary)]">Lat:</span> {t.latitude.toFixed(4)}
                      </div>
                      <div>
                        <span className="text-[var(--text-tertiary)]">Lon:</span> {t.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
