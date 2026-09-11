"use client";

import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";

interface GateTransaction {
  id: string;
  timestamp: string;
  type: "IN" | "OUT";
  truckId: string;
  driverName: string;
  containerNo: string;
  containerSize: string;
  chassisNo: string;
  status: "COMPLETED" | "PENDING" | "REJECTED";
  gate: string;
}

interface GateData {
  transactions: GateTransaction[];
  summary: {
    totalIn: number;
    totalOut: number;
    pendingCount: number;
    rejectedCount: number;
    avgProcessTime: number;
  };
}

function statusColor(s: string) {
  if (s === "COMPLETED") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (s === "PENDING") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-red-500 bg-red-500/10 border-red-500/20";
}

export default function GateMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = useMonitorData<GateData>({
    url: `/api/gate?terminal=${terminalCode}`,
    interval: 15000,
  });

  const txns = data?.transactions || [];
  const summary = data?.summary;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Gate Monitor`}
        stats={summary ? `${summary.totalIn} IN · ${summary.totalOut} OUT · ${summary.pendingCount} Pending` : undefined}
        lastUpdated={lastUpdated}
        error={error}
      />
      <main className="flex-1 min-h-0 p-3 overflow-auto">
        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {summary && (
              <div className="grid grid-cols-5 gap-2 shrink-0">
                {[
                  { label: "Gate IN", value: summary.totalIn, color: "var(--accent-loading)" },
                  { label: "Gate OUT", value: summary.totalOut, color: "var(--accent-blue)" },
                  { label: "Pending", value: summary.pendingCount, color: "var(--accent-reefer)" },
                  { label: "Rejected", value: summary.rejectedCount, color: "var(--accent-discharge)" },
                  { label: "Avg Time", value: `${summary.avgProcessTime}m`, color: "var(--accent-crane)" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center p-2 rounded-lg border bg-[var(--bg-panel)]" style={{ borderColor: `${s.color}40` }}>
                    <span className="text-lg font-mono font-black tabular-nums" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 min-h-0 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] overflow-hidden">
              <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 220px)" }}>
                <table className="w-full border-collapse" role="grid" aria-label="Gate transactions">
                  <thead>
                    <tr className="bg-[var(--bg-header)] border-b border-[var(--border)] text-[10px] font-mono font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      <th className="text-left px-4 py-2 font-bold">Time</th>
                      <th className="text-left px-4 py-2 font-bold">Gate</th>
                      <th className="text-left px-4 py-2 font-bold">Truck</th>
                      <th className="text-left px-4 py-2 font-bold">Driver</th>
                      <th className="text-left px-4 py-2 font-bold">Container</th>
                      <th className="text-left px-4 py-2 font-bold">Size</th>
                      <th className="text-left px-4 py-2 font-bold">Direction</th>
                      <th className="text-left px-4 py-2 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <span className="text-xs font-mono text-[var(--text-tertiary)]">No gate transactions</span>
                        </td>
                      </tr>
                    ) : (
                      txns.map((txn) => (
                        <tr
                          key={txn.id}
                          className="border-b border-[var(--border-light)] hover:bg-[var(--bg-nav-hover)] transition-colors text-[11px] font-mono"
                        >
                          <td className="px-4 py-1.5 text-[var(--text-secondary)] tabular-nums">{new Date(txn.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                          <td className="px-4 py-1.5 font-bold text-[var(--text-primary)]">{txn.gate}</td>
                          <td className="px-4 py-1.5 font-bold text-[var(--text-primary)]">{txn.truckId}</td>
                          <td className="px-4 py-1.5 text-[var(--text-secondary)] truncate">{txn.driverName}</td>
                          <td className="px-4 py-1.5 font-bold text-[var(--text-primary)]">{txn.containerNo}</td>
                          <td className="px-4 py-1.5 text-[var(--text-secondary)]">{txn.containerSize}</td>
                          <td className={`px-4 py-1.5 font-bold ${txn.type === "IN" ? "text-emerald-500" : "text-blue-500"}`}>{txn.type}</td>
                          <td className="px-4 py-1.5"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${statusColor(txn.status)}`}>{txn.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
