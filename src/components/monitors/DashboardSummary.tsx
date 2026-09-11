"use client";

import { useMonitorData } from "@/lib/useMonitorData";
import MonitorHeader from "@/components/MonitorHeader";
import type { VesselData, YardDataWithViolations, EquipmentData, YTPosition } from "@/lib/types";

interface DashboardProps {
  terminalCode: string;
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border bg-[var(--bg-panel)]" style={{ borderColor: `${color}40` }}>
      <span className="text-2xl font-mono font-black tabular-nums" style={{ color }}>{value}</span>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1">{label}</span>
      {sub && <span className="text-[9px] font-mono text-[var(--text-tertiary)] mt-0.5">{sub}</span>}
    </div>
  );
}

export default function DashboardSummary({ terminalCode }: DashboardProps) {
  const { data: vessels, loading: vLoad, error: vError, lastUpdated } = useMonitorData<VesselData[]>({
    url: `/api/vessels?terminal=${terminalCode}`,
    interval: 60000,
  });
  const { data: yard, loading: yLoad } = useMonitorData<YardDataWithViolations>({
    url: `/api/yard?terminal=${terminalCode}`,
    interval: 60000,
  });
  const { data: equipment, loading: eLoad } = useMonitorData<EquipmentData>({
    url: `/api/equipment?terminal=${terminalCode}`,
    interval: 30000,
  });
  const { data: ytData } = useMonitorData<YTPosition[]>({
    url: `/api/yt-tracking?terminal=${terminalCode}`,
    interval: 30000,
  });

  const loading = vLoad || yLoad || eLoad;

  const vesselCount = vessels?.length || 0;
  const totalCranes = vessels?.reduce((acc, v) => acc + v.cranes.filter((c) => c.movesDone < c.movesTotal).length, 0) || 0;
  const totalMoves = vessels?.reduce((acc, v) => acc + v.cranes.reduce((a, c) => a + c.movesDone, 0), 0) || 0;
  const totalMovesTarget = vessels?.reduce((acc, v) => acc + v.cranes.reduce((a, c) => a + c.movesTotal, 0), 0) || 0;

  const yardFill = yard?.summary.overallFillRatio ? Math.round(yard.summary.overallFillRatio * 100) : 0;
  const totalTEU = yard?.summary.totalOccupied || 0;
  const violations = yard?.summary.totalViolations || 0;

  const activeQC = equipment?.qcGroups.length || 0;
  const activeEquipment = equipment?.totalActive || 0;
  const onlineEquipment = equipment?.totalOnline || 0;

  const ytCount = ytData?.length || 0;
  const ytMoving = ytData?.filter((y) => y.status === "MOVING").length || 0;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Dashboard`}
        stats={`${vesselCount} Vessels · ${activeQC} QC Ops · ${ytCount} YTs`}
        lastUpdated={lastUpdated}
        error={vError}
      />
      <main className="flex-1 min-h-0 p-4 overflow-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(8px,1.2vh,16px)] h-full">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Vessels</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Vessels" value={vesselCount} color="#2563eb" />
                <StatCard label="Cranes" value={totalCranes} color="#eab308" />
                <StatCard label="Moves" value={totalMoves} color="#22c55e" sub={`of ${totalMovesTarget}`} />
                <StatCard label="Progress" value={`${totalMovesTarget > 0 ? Math.round((totalMoves / totalMovesTarget) * 100) : 0}%`} color="#0ea5e9" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
                </svg>
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Yard</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Fill" value={`${yardFill}%`} color={yardFill > 85 ? "#dc2626" : yardFill > 70 ? "#eab308" : "#22c55e"} />
                <StatCard label="TEU" value={totalTEU.toLocaleString()} color="#8b5cf6" />
                <StatCard label="Reefers" value={yard?.summary.reeferCount || 0} color="#3b82f6" />
                <StatCard label="Violations" value={violations} color={violations > 0 ? "#dc2626" : "#22c55e"} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Equipment</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Active" value={activeEquipment} color="#22c55e" />
                <StatCard label="Online" value={onlineEquipment} color="#0ea5e9" />
                <StatCard label="QC Ops" value={activeQC} color="#eab308" />
                <StatCard label="Online %" value={`${activeEquipment > 0 ? Math.round((onlineEquipment / activeEquipment) * 100) : 0}%`} color="#8b5cf6" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" />
                  <path d="M3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">YT Fleet</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Total YT" value={ytCount} color="#06b6d4" />
                <StatCard label="Moving" value={ytMoving} color="#22c55e" />
                <StatCard label="Idle" value={ytData?.filter((y) => y.status === "IDLE").length || 0} color="#eab308" />
                <StatCard label="Moving %" value={`${ytCount > 0 ? Math.round((ytMoving / ytCount) * 100) : 0}%`} color="#8b5cf6" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
