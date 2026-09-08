"use client";

import { useMemo } from "react";
import type { Vessel, Crane } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatArrival, formatCount } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

const CRANE_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e0b", QC11: "#f59e0b", QC12: "#f59e0b",
  QC13: "#ef4444", QC14: "#ef4444", QC15: "#ef4444", QC16: "#ef4444",
};

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

function ShipSVG({ vesselName, cranes }: { vesselName: string; cranes: Crane[] }) {
  const activeCranes = useMemo(
    () => cranes.filter((c) => c.movesDone < c.movesTotal).sort(compareCranes),
    [cranes],
  );

  return (
    <div className="relative w-full h-full bg-[#060a14] rounded-lg overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 800 300" className="w-full h-auto max-h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`hull-${vesselName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={`crane-${vesselName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Water */}
        <rect fill="#0c4a6e" opacity="0.15" width="800" height="50" y="260" />

        {/* Berth line */}
        <line stroke="#facc15" strokeDasharray="8 4" strokeWidth="2" x1="0" x2="800" y1="250" y2="250" />

        {/* Ship hull */}
        <path
          d="M 80,245 L 700,245 C 720,245 740,235 745,220 L 740,200 L 100,200 C 85,200 80,210 80,220 Z"
          fill={`url(#hull-${vesselName})`}
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Red antifouling */}
        <path d="M 80,245 L 740,245 L 735,260 L 85,260 Z" fill="#991b1b" opacity="0.8" />
        <line stroke="#ef4444" strokeWidth="1.5" x1="80" x2="740" y1="245" y2="245" />

        {/* Superstructure */}
        <rect fill="#f8fafc" height="60" rx="2" stroke="#94a3b8" strokeWidth="1" width="60" x="660" y="140" />
        <rect fill="#0284c7" height="8" opacity="0.8" rx="1" width="55" x="663" y="145" />
        <rect fill="#0f172a" height="30" rx="2" stroke="#334155" strokeWidth="1" width="20" x="685" y="110" />

        {/* Container stacks (simple) */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bay) => {
          const x = 140 + bay * 45;
          const tiers = 2 + (bay % 3);
          const colors = ["#0284c7", "#1d4ed8", "#ea580c", "#059669", "#06b6d4"];
          return Array.from({ length: tiers }).map((_, t) => (
            <rect
              key={`${bay}-${t}`}
              fill={colors[(bay + t) % colors.length]}
              height="10"
              width="35"
              x={x}
              y={200 - t * 10}
              stroke="#090e1c"
              strokeWidth="0.5"
            />
          ));
        })}

        {/* Vessel name */}
        <text x="400" y="130" textAnchor="middle" fontSize="16" fontFamily="Inter, sans-serif" fill="#dee2f6" fontWeight="700" letterSpacing="2">
          {vesselName}
        </text>

        {/* Cranes */}
        {activeCranes.slice(0, 4).map((crane, idx) => {
          const x = 200 + idx * 140;
          const color = CRANE_COLORS[crane.craneId] ?? "#00f0ff";
          return (
            <g key={crane.craneId}>
              {/* Portal legs */}
              <path d={`M ${x - 12},260 L ${x - 6},140 L ${x + 6},140 L ${x + 12},260`} fill={`url(#crane-${vesselName})`} stroke="#854d0e" strokeWidth="1" />
              <path d={`M ${x + 28},260 L ${x + 34},140 L ${x + 46},140`} fill={`url(#crane-${vesselName})`} stroke="#854d0e" strokeWidth="1" />
              {/* Boom */}
              <line stroke="#facc15" strokeWidth="4" x1={x - 30} x2={x + 50} y1="140" y2="140" />
              {/* Crane label */}
              <text x={x + 10} y="125" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace" fill={color} fontWeight="bold">
                {crane.craneId}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CraneTable({ cranes }: { cranes: Crane[] }) {
  const sorted = useMemo(() => [...cranes].sort(compareCranes), [cranes]);

  return (
    <div className="bg-[#0e1321] border-t border-[#1c273e]">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-[#64748b] text-[10px] uppercase tracking-wider text-left border-b border-[#1c273e]">
            <th className="px-3 py-1.5 font-semibold">Crane</th>
            <th className="px-3 py-1.5 font-semibold">Progress</th>
            <th className="px-3 py-1.5 font-semibold text-right">Load</th>
            <th className="px-3 py-1.5 font-semibold text-right">Disch</th>
            <th className="px-3 py-1.5 font-semibold text-right">MPH</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const color = CRANE_COLORS[c.craneId] ?? "#00f0ff";
            const pct = c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0;
            const done = c.movesDone >= c.movesTotal;

            return (
              <tr key={c.craneId} className={`border-b border-[#1c273e] ${done ? "opacity-50" : ""}`}>
                <td className="px-3 py-1.5">
                  <span className="font-bold" style={{ color }}>{c.craneId}</span>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-[#1c273e] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[#94a3b8] tabular-nums whitespace-nowrap">{c.movesDone}/{c.movesTotal}</span>
                    <span className="font-bold tabular-nums" style={{ color }}>{pct}%</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">{c.loadingDone}<span className="text-[#64748b]">/{c.loadingTotal}</span></td>
                <td className="px-3 py-1.5 text-right tabular-nums">{c.dischargingDone}<span className="text-[#64748b]">/{c.dischargingTotal}</span></td>
                <td className="px-3 py-1.5 text-right">
                  <span className="tabular-nums font-bold" style={{
                    color: c.mph >= 25 ? "#10b981" : c.mph >= 15 ? color : c.mph > 0 ? "#f59e0b" : "#64748b"
                  }}>
                    {c.mph}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VesselCard({ vessel }: { vessel: Vessel }) {
  const overallPct = vessel.totalMoves > 0 ? Math.min(100, Math.round((vessel.totalDone / vessel.totalMoves) * 100)) : 0;

  return (
    <div className="flex flex-col h-full bg-[#0e1321] border border-[#1c273e] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#141c2e] border-b border-[#1c273e] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-base font-extrabold text-[#dee2f6] uppercase tracking-wide truncate">
                {vessel.vesselName}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-[#94a3b8]">
              <span>VOY {vessel.voyageNumber}</span>
              <span className="text-[#1c273e]">|</span>
              <span>ARR {formatArrival(vessel.arrivalTime)}</span>
              <span className="text-[#1c273e]">|</span>
              <span className="text-[#f59e0b] font-bold">QC {vessel.cranes.length}</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-[#060a14] rounded-lg flex flex-col items-center justify-center shrink-0 ml-2 border border-[#1c273e]">
            <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-[#64748b]">GMPH</span>
            <span className="text-lg font-mono font-black text-[#00f0ff] leading-none tabular-nums">{vessel.gmph}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-[#64748b]">LOAD</span>
            <span className="font-bold text-[#10b981]">{formatCount(vessel.loadingDone)}</span>
            <span className="text-[#64748b]">/ {formatCount(vessel.loadingTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[#64748b]">DISCH</span>
            <span className="font-bold text-[#f59e0b]">{formatCount(vessel.dischargingDone)}</span>
            <span className="text-[#64748b]">/ {formatCount(vessel.dischargingTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#64748b]">TOTAL</span>
            <span className="font-bold text-white">{formatCount(vessel.totalDone)}</span>
            <span className="text-[#64748b]">/ {formatCount(vessel.totalMoves)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="relative h-2 w-full rounded-full overflow-hidden bg-[#1c273e]">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-[#00f0ff] to-[#0284c7] rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[#64748b] mt-0.5">
            <span>PROGRESS</span>
            <span className="font-bold text-[#00f0ff]">{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* Ship visualization */}
      <div className="flex-1 min-h-0" style={{ minHeight: "160px" }}>
        <ShipSVG vesselName={vessel.vesselName} cranes={vessel.cranes} />
      </div>

      {/* Crane Table */}
      <CraneTable cranes={vessel.cranes} />
    </div>
  );
}

export function VesselMonitor({ terminalCode }: { terminalCode: string }) {
  const { data: vessels, loading, error, lastUpdated } = usePolling<Vessel[]>(`/api/vessels?terminal=${terminalCode}`, 60000);

  const vesselCount = vessels?.length ?? 0;

  if (loading && !vessels) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
          <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-[0.2em]">Connecting to Terminal Database</p>
        </div>
      </>
    );
  }
  if (error && !vessels) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="border border-[#ef4444]/50 bg-[#ef4444]/10 px-8 py-6 text-center max-w-md rounded-xl">
            <div className="text-xs font-bold font-mono text-[#ef4444] uppercase tracking-widest mb-2">Connection Fault</div>
            <p className="text-[11px] font-mono text-[#94a3b8] mb-4">{error}</p>
            <button className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-[#ef4444] hover:bg-[#ef4444]/90 transition-opacity">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MonitorHeader
        title={`${terminalCode} Vessel Monitoring`}
        stats={
          <span className="text-sm font-mono font-semibold text-[#94a3b8]">
            {vesselCount} {vesselCount === 1 ? "Vessel" : "Vessels"}
          </span>
        }
        lastUpdated={lastUpdated}
      />

      <main className="flex-1 min-h-0 p-3 overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-[1800px] h-full flex items-center justify-center">
          {!vessels || vessels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
              <div className="border border-[#1c273e] px-12 py-8 text-center rounded-xl">
                <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Vessel Data</div>
                <p className="text-[11px] font-mono text-[#64748b]">Waiting for GC order data.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-fr gap-4 w-full h-full items-center justify-center">
              {vessels.map((v) => (
                <div
                  key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`}
                  className="h-full max-h-[calc(100vh-130px)] flex flex-col"
                >
                  <VesselCard vessel={v} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
