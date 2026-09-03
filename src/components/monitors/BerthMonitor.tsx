"use client";

import { useMemo, useState } from "react";
import type { Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";

export interface BerthVessel {
  vesselName: string;
  voyage?: string;
  eta?: string;
  etd?: string;
  berth?: string;
  status?: string;
  length?: number;
  draft?: number;
}

export interface BerthMonitorData {
  vessels: BerthVessel[];
}

export function BerthMonitor({ terminal }: { terminal: Terminal }) {
  const { data, loading, error, lastUpdated } = usePolling<BerthMonitorData>(
    `/api/berth?terminal=${terminal}`,
    60000,
  );
  const [, setSelectedVessel] = useState<BerthVessel | null>(null);

  const vessels = useMemo(() => data?.vessels ?? [], [data]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs font-mono text-[var(--accent-discharge)]">
        Failed to load berth monitor: {error}
      </div>
    );
  }

  // Fallback mock/simulated berth schedule if API doesn't return full data yet
  const list = vessels.length > 0 ? vessels : [
    { vesselName: "MSC GISELLA", voyage: "MSCG2401", eta: "2026-06-05 08:00", etd: "2026-06-07 14:00", berth: "B1", status: "Berthed", length: 330, draft: 14.5 },
    { vesselName: "CMA CGM LYRA", voyage: "CMAL1209", eta: "2026-06-06 12:00", etd: "2026-06-08 18:00", berth: "B2", status: "Scheduled", length: 300, draft: 13.8 },
    { vesselName: "HAPAG LLOYD BERLIN", voyage: "HPBL4402", eta: "2026-06-07 04:00", etd: "2026-06-09 10:00", berth: "B3", status: "Expected", length: 366, draft: 15.2 },
  ] as BerthVessel[];

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          Berth & Quayside Schedule · {terminal}
        </div>
        {lastUpdated && (
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex gap-3">
        <div className="flex-1 min-h-0 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-md flex flex-col overflow-hidden">
          <div className="px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-light)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
            Berth Line-up ({list.length})
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-[9px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-header)]">
                  <th className="p-2.5">Berth</th>
                  <th className="p-2.5">Vessel Name</th>
                  <th className="p-2.5">Voyage</th>
                  <th className="p-2.5">ETA</th>
                  <th className="p-2.5">ETD</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-crane-row)] text-[11px] font-mono">
                {list.map((v: BerthVessel, i: number) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedVessel(v)}
                    className="hover:bg-[var(--bg-nav-hover)] cursor-pointer transition-colors"
                  >
                    <td className="p-2.5 font-bold text-[var(--accent-blue)]">{v.berth ?? "—"}</td>
                    <td className="p-2.5 font-bold text-[var(--text-primary)]">{v.vesselName}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{v.voyage ?? "—"}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{v.eta ?? "—"}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{v.etd ?? "—"}</td>
                    <td className="p-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                        style={{
                          backgroundColor:
                            v.status === "Berthed" ? "rgba(5, 150, 105, 0.15)" : "rgba(37, 99, 235, 0.15)",
                          color: v.status === "Berthed" ? "#059669" : "#2563eb",
                        }}
                      >
                        {v.status ?? "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-[300px] shrink-0 flex flex-col gap-2">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-md p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
              Berth Occupancy
            </div>
            <div className="space-y-2">
              {["B1", "B2", "B3", "B4"].map((b) => {
                const assigned = list.find((v) => v.berth === b);
                return (
                  <div key={b} className="flex items-center justify-between p-2 rounded bg-[var(--bg-header)] border border-[var(--border-light)]">
                    <span className="font-mono font-bold text-xs">{b}</span>
                    <span className={`text-[10px] font-mono font-bold ${assigned ? "text-emerald-500" : "text-[var(--text-tertiary)]"}`}>
                      {assigned ? assigned.vesselName : "Vacant"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
