"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type { Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount } from "@/lib/ui";
import { LiveStatus } from "@/components/ui";

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
  const { data, lastUpdated, error, now: pollNow } = usePolling<TruckPosition[]>(
    `/api/yt-tracking?terminal=${terminal}`,
    5000,
  );
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgLoading, setSvgLoading] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<"angled" | "top">("angled");
  const [now, setNow] = useState<Date>(new Date());
  const [selectedTruck, setSelectedTruck] = useState<TruckPosition | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#060a14]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-11 shrink-0 bg-[#0e1321] border-b border-[#1c273e]">
        <div className="flex items-center flex-1 pl-2">
          <h1 className="text-xl font-black text-[#dee2f6] uppercase tracking-[0.05em]">
            {terminal} YT Tracker
          </h1>
        </div>

        <div className="flex items-center justify-center gap-5 flex-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]" />
            </span>
            <span className="text-sm font-bold text-[#10b981] uppercase tracking-widest">
              Live
            </span>
          </div>

          <span className="text-sm font-mono font-semibold text-[#94a3b8]">
            {formatCount(trucks.length)} YT{trucks.length === 1 ? "" : "s"} Tracked
          </span>

          {lastUpdated && <LiveStatus lastUpdated={lastUpdated} now={pollNow} error={error} intervalMs={5000} />}
        </div>

        <div className="flex items-center justify-end flex-1 pr-2">
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-[#dee2f6] tabular-nums leading-none">
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-xs font-mono font-semibold text-[#64748b] uppercase leading-none mt-1">
              {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
      </header>

      {/* Map Viewport & Sidebar */}
      <div className="relative flex-1 min-h-0 flex gap-3 p-3">
        {svgLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#0e1321] rounded border border-[#1c273e]">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#64748b]">
                Loading Terminal Layout
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 bg-[#0e1321] border border-[#1c273e] rounded-xl relative overflow-hidden flex flex-col shadow-lg">
            <div
              className={`flex-1 w-full h-full relative overflow-auto flex items-center justify-center transition-transform duration-500 ${
                cameraView === "angled" ? "perspective-[1000px]" : ""
              }`}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-all duration-500"
                style={{
                  transform: cameraView === "angled" ? "rotateX(15deg) scale(0.95)" : undefined,
                  background: svgContent ? undefined : "#060a14",
                }}
              >
                {svgContent ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="text-xs font-mono text-[#64748b]">
                    Terminal Layout SVG Not Found
                  </div>
                )}
              </div>
            </div>

            {/* View Toggle Button */}
            <button
              type="button"
              onClick={toggleCameraView}
              aria-label={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
              title={cameraView === "angled" ? "Switch to top view" : "Switch to perspective view"}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-[#1c273e]/55 bg-[#0e1321]/60 text-[#dee2f6] shadow-sm backdrop-blur-sm transition-colors hover:bg-[#141c2e]/75 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            >
              {cameraView === "angled" ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="1.5" />
                  <path d="M8 8h8v8H8zM12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Fleet Sidebar */}
        <div className="w-[320px] shrink-0 bg-[#0e1321] border border-[#1c273e] rounded-xl flex flex-col overflow-hidden shadow-lg">
          <div className="px-4 py-3 bg-[#141c2e] border-b border-[#1c273e] flex items-center justify-between shrink-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[#dee2f6] font-bold">
              Active Fleet ({trucks.length})
            </span>
            <span className="text-[10px] font-mono text-[#10b981] font-bold uppercase">
              Online
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#1c273e]">
            {trucks.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-[#64748b]">
                No active truck telemetry
              </div>
            ) : (
              trucks.map((t) => {
                const isSelected = selectedTruck?.truckId === t.truckId;
                return (
                  <div
                    key={t.truckId}
                    onClick={() => setSelectedTruck(t)}
                    className={`p-3 cursor-pointer transition-colors hover:bg-[#00f0ff]/5 ${
                      isSelected ? "bg-[#00f0ff]/10 border-l-4 border-[#00f0ff]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="font-mono font-bold text-xs text-[#dee2f6]">
                          YT #{t.truckId}
                        </span>
                        {t.status && (
                          <span className="text-[9px] font-mono font-bold uppercase px-1 rounded bg-[#00f0ff]/15 text-[#00f0ff]">
                            {t.status}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#64748b]">
                        {new Date(t.updateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    {t.driverName && (
                      <div className="text-[10px] font-mono text-[#94a3b8] truncate mb-0.5">
                        {t.driverName}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#94a3b8] mt-1">
                      <div>
                        <span className="text-[#64748b]">Lat:</span> {t.latitude.toFixed(4)}
                      </div>
                      <div>
                        <span className="text-[#64748b]">Lon:</span> {t.longitude.toFixed(4)}
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
