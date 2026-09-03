"use client";

import { useMemo, useState } from "react";
import type { Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";

interface GateTruck {
  truckNo: string;
  driverName?: string;
  transId: string;
  laneNo: string;
  status: string;
  timeIn: string;
}

export function GateMonitor({ terminal }: { terminal: Terminal }) {
  const { data, lastUpdated } = usePolling<{ trucks: GateTruck[] }>(
    `/api/gate?terminal=${terminal}`,
    30000,
  );
  const [filter, setFilter] = useState<string>("all");

  const trucks = useMemo(() => data?.trucks ?? [
    { truckNo: "TR-8901", driverName: "Ahmed Al-Mansoori", transId: "TX-40291", laneNo: "L1", status: "Inbound", timeIn: "10:42" },
    { truckNo: "TR-4421", driverName: "Khaled Omar", transId: "TX-40292", laneNo: "L2", status: "Processing", timeIn: "10:45" },
    { truckNo: "TR-9012", driverName: "Salem Rashed", transId: "TX-40293", laneNo: "L3", status: "Outbound", timeIn: "10:38" },
    { truckNo: "TR-1102", driverName: "Nasser Bin Ali", transId: "TX-40294", laneNo: "L1", status: "Inbound", timeIn: "10:48" },
  ], [data]);

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          Gate & Truck Traffic Monitor · {terminal}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-full p-0.5">
            {["all", "Inbound", "Processing", "Outbound"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide transition-colors ${
                  filter === f ? "bg-[var(--accent-blue)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-md flex flex-col overflow-hidden">
        <div className="px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-light)] text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          Active Gate Trucks ({trucks.length})
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-light)] text-[9px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-header)]">
                <th className="p-2.5">Truck #</th>
                <th className="p-2.5">Driver</th>
                <th className="p-2.5">Transaction ID</th>
                <th className="p-2.5">Gate Lane</th>
                <th className="p-2.5">Time In</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-crane-row)] text-[11px] font-mono">
              {trucks
                .filter((t) => filter === "all" || t.status.toLowerCase() === filter.toLowerCase())
                .map((t, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-nav-hover)] transition-colors">
                    <td className="p-2.5 font-bold text-[var(--text-primary)]">{t.truckNo}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{t.driverName ?? "—"}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{t.transId}</td>
                    <td className="p-2.5 font-bold text-[var(--accent-blue)]">{t.laneNo}</td>
                    <td className="p-2.5 text-[var(--text-secondary)]">{t.timeIn}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/15 text-blue-500">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
