"use client";

import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";
import { getFillBarColor } from "@/lib/ui";

interface Berth {
  berthId: string;
  status: "OCCUPIED" | "EMPTY" | "RESERVED";
  vesselCode?: string;
  arrivalTime?: string;
  eta?: string;
  operation?: string;
  pctComplete?: number;
}

interface BerthData {
  berths: Berth[];
  summary: {
    occupied: number;
    empty: number;
    reserved: number;
    utilization: number;
  };
}

function statusStyle(s: string) {
  if (s === "OCCUPIED") return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-500", text: "text-emerald-600" };
  if (s === "RESERVED") return { bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500", text: "text-amber-600" };
  return { bg: "bg-[var(--bg-panel)]", border: "border-[var(--border)]", dot: "bg-slate-400", text: "text-[var(--text-tertiary)]" };
}

export default function BerthMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = useMonitorData<BerthData>({
    url: `/api/berth?terminal=${terminalCode}`,
    interval: 30000,
  });

  const berths = data?.berths || [];
  const summary = data?.summary;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Berth Monitor`}
        stats={summary ? `${summary.occupied} Occupied · ${summary.empty} Empty · ${summary.reserved} Reserved` : undefined}
        lastUpdated={lastUpdated}
        error={error}
      />
      <main className="flex-1 min-h-0 p-4 overflow-auto">
        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {summary && (
              <div className="flex items-center gap-4 px-2 shrink-0">
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">Utilization</span>
                <div className="flex-1 h-3 bg-[var(--bg-progress)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(summary.utilization * 100)}%`, background: getFillBarColor(summary.utilization) }}
                  />
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)]">{Math.round(summary.utilization * 100)}%</span>
              </div>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[clamp(8px,1.2vh,16px)]">
              {berths.map((berth) => {
                const style = statusStyle(berth.status);
                return (
                  <div
                    key={berth.berthId}
                    className={`flex flex-col rounded-xl border-2 p-3 ${style.bg} ${style.border} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-mono font-black text-[var(--text-primary)]">{berth.berthId}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span className={`text-[10px] font-mono font-bold uppercase ${style.text}`}>{berth.status}</span>
                      </div>
                    </div>
                    {berth.vesselCode && (
                      <div className="mb-2">
                        <span className="text-sm font-mono font-black text-[var(--text-primary)]">{berth.vesselCode}</span>
                        {berth.operation && (
                          <span className="text-[10px] font-mono text-[var(--text-secondary)] ml-2">{berth.operation}</span>
                        )}
                      </div>
                    )}
                    {berth.pctComplete !== undefined && (
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-mono text-[var(--text-tertiary)]">Progress</span>
                          <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">{berth.pctComplete}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-progress)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full progress-shimmer" style={{ width: `${berth.pctComplete}%` }} />
                        </div>
                      </div>
                    )}
                    {berth.status === "EMPTY" && berth.eta && (
                      <div className="mt-auto text-[10px] font-mono text-[var(--text-tertiary)]">
                        ETA: {new Date(berth.eta).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
