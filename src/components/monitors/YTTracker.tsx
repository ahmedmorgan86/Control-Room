"use client";

import { useMemo, useState } from "react";
import { usePolling } from "@/lib/usePolling";
import { MonitorHeader } from "@/components/MonitorHeader";

interface YTPosition {
  equNo: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  isOnline: boolean;
  jobType: string | null;
  assignedQc: string | null;
  lastUpdate: string;
}

export function YTTracker({ terminal }: { terminal: string }) {
  const { data, loading, error, lastUpdated } = usePolling<YTPosition[]>(`/api/yt-tracking?terminal=${terminal}`, 15000);
  const [selected, setSelected] = useState<string | null>(null);

  const yts = data ?? [];
  const online = useMemo(() => yts.filter((y) => y.isOnline), [yts]);
  const moving = useMemo(() => yts.filter((y) => y.speed > 0), [yts]);

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminal} YT Tracker`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
          <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-[0.2em]">Loading YT GPS Data</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminal} YT Tracker`} />
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="border border-[#ef4444]/50 bg-[#ef4444]/10 px-8 py-6 text-center max-w-md rounded-xl">
            <div className="text-xs font-bold font-mono text-[#ef4444] uppercase tracking-widest mb-2">Connection Fault</div>
            <p className="text-[11px] font-mono text-[#94a3b8] mb-4">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MonitorHeader
        title={`${terminal} YT Tracker`}
        stats={
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#10b981]">{online.length} Online</span>
            <span className="text-[#00f0ff]">{moving.length} Moving</span>
          </div>
        }
        lastUpdated={lastUpdated}
      />
      <div className="flex-1 min-h-0 flex">
        {/* Map viewport */}
        <div className="flex-1 relative bg-[#060a14] grid-lines-pattern">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-mono text-[#64748b] uppercase tracking-widest mb-2">GPS Fleet View</div>
              <div className="text-[10px] font-mono text-[#475569]">Terminal Layout Map</div>
              <div className="grid grid-cols-6 gap-1 mt-4 max-w-md mx-auto">
                {online.slice(0, 18).map((yt) => (
                  <div
                    key={yt.equNo}
                    className={`w-8 h-8 rounded border flex items-center justify-center text-[8px] font-mono cursor-pointer transition-all ${
                      selected === yt.equNo
                        ? "bg-[#00f0ff]/30 border-[#00f0ff] text-[#00f0ff] glow-cyan"
                        : "bg-[#0e1321] border-[#1c273e] text-[#64748b] hover:border-[#00f0ff]/50"
                    }`}
                    onClick={() => setSelected(selected === yt.equNo ? null : yt.equNo)}
                    style={{ transform: `rotate(${yt.heading}deg)` }}
                  >
                    ▲
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet sidebar */}
        <div className="w-64 bg-[#0e1321] border-l border-[#1c273e] p-3 overflow-y-auto scrollbar-thin">
          <div className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-3">Fleet Status</div>
          <div className="space-y-1.5">
            {online.map((yt) => (
              <div
                key={yt.equNo}
                className={`bg-[#060a14] border rounded p-2 cursor-pointer transition-all ${
                  selected === yt.equNo ? "border-[#00f0ff]" : "border-[#1c273e] hover:border-[#00f0ff]/50"
                }`}
                onClick={() => setSelected(selected === yt.equNo ? null : yt.equNo)}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#00f0ff] font-bold">{yt.equNo}</span>
                  <span className={`px-1 py-0.5 rounded ${yt.speed > 0 ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#64748b]/20 text-[#64748b]"}`}>
                    {yt.speed > 0 ? `${yt.speed.toFixed(0)} km/h` : "Idle"}
                  </span>
                </div>
                {yt.jobType && (
                  <div className="text-[9px] font-mono text-[#f59e0b] mt-0.5">{yt.jobType} → {yt.assignedQc ?? "—"}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
