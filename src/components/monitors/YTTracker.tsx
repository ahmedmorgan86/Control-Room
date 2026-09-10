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
  const { data, loading, error, lastUpdated, refresh } = usePolling<YTPosition[]>(`/api/yt-tracking?terminal=${terminal}`, 15000);
  const [selected, setSelected] = useState<string | null>(null);

  const yts = data ?? [];
  const online = useMemo(() => yts.filter((y) => y.isOnline), [yts]);
  const offline = useMemo(() => yts.filter((y) => !y.isOnline), [yts]);
  const moving = useMemo(() => yts.filter((y) => y.speed > 0), [yts]);

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminal} YT Tracker`} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[var(--cyan)] rounded-full animate-spin mb-3" />
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-dim)]">Loading YT GPS Data</p>
        </div>
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminal} YT Tracker`} />
        <div className="flex-1 flex items-center justify-center">
          <div className="glass rounded-2xl px-10 py-6 text-center card-3d">
            <div className="text-[10px] font-bold font-mono text-[var(--red)] uppercase tracking-[0.2em] mb-1">Connection Fault</div>
            <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-3">{error}</p>
            <button onClick={() => refresh()} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--red)] hover:opacity-80 rounded transition-all">Retry</button>
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
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-[var(--green)]">{online.length} Online</span>
            <span className="text-[var(--cyan)]">{moving.length} Moving</span>
            <span className="text-[var(--text-dim)]">{offline.length} Offline</span>
          </div>
        }
        lastUpdated={lastUpdated}
      />
      <div className="flex-1 min-h-0 flex">
        {/* Map viewport */}
        <div className="flex-1 relative bg-[var(--bg-void)] grid-lines-pattern">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest mb-2">GPS Fleet View</div>
              <div className="text-[9px] font-mono text-[var(--text-dim)]">Terminal Layout Map</div>
              <div className="grid grid-cols-6 gap-1 mt-4 max-w-md mx-auto">
                {online.slice(0, 18).map((yt) => (
                  <div
                    key={yt.equNo}
                    className={`w-8 h-8 rounded border flex items-center justify-center text-[8px] font-mono cursor-pointer transition-all ${
                      selected === yt.equNo
                        ? "bg-[var(--cyan)]/30 border-[var(--cyan)] text-[var(--cyan)] glow-cyan"
                        : "bg-[var(--bg-deep)] border-white/[0.06] text-[var(--text-dim)] hover:border-[var(--cyan)]/50"
                    }`}
                    onClick={() => setSelected(selected === yt.equNo ? null : yt.equNo)}
                    style={{ transform: `rotate(${yt.heading}deg)` }}
                  >
                    &#9650;
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet sidebar */}
        <div className="w-56 bg-[var(--bg-deep)] border-l border-white/[0.06] p-3 overflow-y-auto scrollbar-thin">
          <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Fleet Status</div>
          <div className="space-y-1.5">
            {online.map((yt) => (
              <div
                key={yt.equNo}
                className={`bg-[var(--bg-void)] border rounded p-2 cursor-pointer transition-all ${
                  selected === yt.equNo ? "border-[var(--cyan)]" : "border-white/[0.06] hover:border-[var(--cyan)]/50"
                }`}
                onClick={() => setSelected(selected === yt.equNo ? null : yt.equNo)}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--cyan)] font-bold">{yt.equNo}</span>
                  <span className={`px-1 py-0.5 rounded ${yt.speed > 0 ? "bg-[var(--green)]/20 text-[var(--green)]" : "bg-[var(--text-dim)]/20 text-[var(--text-dim)]"}`}>
                    {yt.speed > 0 ? `${yt.speed.toFixed(0)} km/h` : "Idle"}
                  </span>
                </div>
                {yt.jobType && (
                  <div className="text-[9px] font-mono text-[var(--amber)] mt-0.5">{yt.jobType} &rarr; {yt.assignedQc ?? "—"}</div>
                )}
              </div>
            ))}
            {offline.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <div className="text-[8px] font-mono text-[var(--text-dim)] uppercase tracking-wider mb-1">Offline ({offline.length})</div>
                {offline.map((yt) => (
                  <div key={yt.equNo} className="flex items-center justify-between text-[9px] font-mono py-0.5">
                    <span className="text-[var(--text-dim)]">{yt.equNo}</span>
                    <span className="text-[var(--text-dim)]">{yt.jobType ?? "Idle"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
