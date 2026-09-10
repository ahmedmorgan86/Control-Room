"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Vessel, Crane } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatArrival, formatCount } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

const QC_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e0b", QC11: "#f59e0b", QC12: "#f59e0b",
  QC13: "#ef4444", QC14: "#ef4444", QC15: "#ef4444", QC16: "#ef4444",
};

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

function useMouseTilt(intensity = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setStyle({ transform: `perspective(700px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(8px)` });
  }, [intensity]);
  const onLeave = useCallback(() => setStyle({ transform: "perspective(700px) rotateX(0) rotateY(0) translateZ(0)" }), []);
  return { ref, style, onMove, onLeave };
}

function ShipSVG({ vesselName, cranes }: { vesselName: string; cranes: Crane[] }) {
  const active = useMemo(() => cranes.filter((c) => c.movesDone < c.movesTotal).sort(compareCranes), [cranes]);
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#060a14] to-[#0a0f1c] rounded-lg overflow-hidden flex items-center justify-center">
      <svg viewBox="0 0 800 300" className="w-full h-auto max-h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`hull-${vesselName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2332" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id={`crane-${vesselName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect fill="#0ea5e9" opacity="0.06" width="800" height="60" y="255" />
        <line stroke="#fbbf24" strokeDasharray="10 5" strokeWidth="1.5" x1="0" x2="800" y1="248" y2="248" />
        <path d="M 70,245 L 710,245 C 730,245 745,235 748,220 L 743,200 L 95,200 C 80,200 72,210 72,220 Z" fill={`url(#hull-${vesselName})`} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <path d="M 72,245 L 743,245 L 738,260 L 77,260 Z" fill="#991b1b" opacity="0.7" />
        <line stroke="#ef4444" strokeWidth="1.5" x1="72" x2="743" y1="245" y2="245" />
        <rect fill="#e2e8f0" height="55" rx="3" stroke="#94a3b8" strokeWidth="0.8" width="55" x="665" y="145" />
        <rect fill="#0ea5e9" height="6" opacity="0.7" rx="1" width="50" x="668" y="150" />
        <rect fill="#0f172a" height="28" rx="2" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" width="18" x="687" y="115" />
        {[0,1,2,3,4,5,6,7,8,9,10].map((bay) => {
          const x = 130 + bay * 47;
          const tiers = 2 + (bay % 3);
          const cols = ["#dc2626", "#16a34a", "#2563eb", "#ea580c", "#06b6d4"];
          return Array.from({ length: tiers }).map((_, t) => (
            <rect key={`${bay}-${t}`} fill={cols[(bay+t)%cols.length]} height="9" width="38" x={x} y={200 - t * 9} stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" rx="1" />
          ));
        })}
        <text x="400" y="135" textAnchor="middle" fontSize="15" fontFamily="Space Grotesk, sans-serif" fill="#e2e8f0" fontWeight="600" letterSpacing="3">
          {vesselName}
        </text>
        {active.slice(0,4).map((crane, idx) => {
          const x = 190 + idx * 145;
          const color = QC_COLORS[crane.craneId] ?? "#22d3ee";
          return (
            <g key={crane.craneId}>
              <path d={`M ${x-10},260 L ${x-5},140 L ${x+5},140 L ${x+10},260`} fill={`url(#crane-${vesselName})`} stroke="#92400e" strokeWidth="0.8" />
              <path d={`M ${x+26},260 L ${x+31},140 L ${x+41},140`} fill={`url(#crane-${vesselName})`} stroke="#92400e" strokeWidth="0.8" />
              <line stroke="#fbbf24" strokeWidth="3" x1={x-28} x2={x+48} y1="140" y2="140" />
              <text x={x+10} y="128" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono, monospace" fill={color} fontWeight="bold">{crane.craneId}</text>
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
    <div className="bg-[var(--bg-deep)] border-t border-white/[0.04]">
      <table className="w-full text-[10px] font-mono">
        <thead>
          <tr className="text-[var(--text-dim)] text-[9px] uppercase tracking-wider text-left border-b border-white/[0.04]">
            <th className="px-3 py-1 font-semibold">Crane</th>
            <th className="px-3 py-1 font-semibold">Progress</th>
            <th className="px-3 py-1 font-semibold text-right">Load</th>
            <th className="px-3 py-1 font-semibold text-right">Disch</th>
            <th className="px-3 py-1 font-semibold text-right">MPH</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const color = QC_COLORS[c.craneId] ?? "#22d3ee";
            const pct = c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0;
            const done = c.movesDone >= c.movesTotal;
            return (
              <tr key={c.craneId} className={`border-b border-white/[0.03] ${done ? "opacity-40" : ""}`}>
                <td className="px-3 py-1"><span className="font-bold" style={{ color }}>{c.craneId}</span></td>
                <td className="px-3 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full progress-glow" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[var(--text-secondary)] tabular-nums whitespace-nowrap">{c.movesDone}/{c.movesTotal}</span>
                    <span className="font-bold tabular-nums" style={{ color }}>{pct}%</span>
                  </div>
                </td>
                <td className="px-3 py-1 text-right tabular-nums">{c.loadingDone}<span className="text-[var(--text-dim)]">/{c.loadingTotal}</span></td>
                <td className="px-3 py-1 text-right tabular-nums">{c.dischargingDone}<span className="text-[var(--text-dim)]">/{c.dischargingTotal}</span></td>
                <td className="px-3 py-1 text-right">
                  <span className="tabular-nums font-bold" style={{ color: c.mph >= 25 ? "#10b981" : c.mph >= 15 ? color : c.mph > 0 ? "#f59e0b" : "#475569" }}>{c.mph}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function VesselCard({ vessel, index }: { vessel: Vessel; index: number }) {
  const pct = vessel.totalMoves > 0 ? Math.min(100, Math.round((vessel.totalDone / vessel.totalMoves) * 100)) : 0;
  const t = useMouseTilt(5);
  const delay = `d${index + 1}`;

  return (
    <div
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className={`card-3d-lg flex flex-col h-full bg-[var(--bg-surface)] border border-white/[0.06] rounded-2xl overflow-hidden animate-fade-up ${delay}`}
      style={t.style}
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] status-dot" style={{ color: "var(--green)" }} />
              <span className="text-sm font-bold text-[var(--text-bright)] uppercase tracking-wide truncate">{vessel.vesselName}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-[var(--text-secondary)]">
              <span>VOY {vessel.voyageNumber}</span>
              <span className="text-white/[0.1]">|</span>
              <span>ARR {formatArrival(vessel.arrivalTime)}</span>
              <span className="text-white/[0.1]">|</span>
              <span className="text-[var(--amber)] font-bold">QC {vessel.cranes.length}</span>
            </div>
          </div>
          <div className="w-11 h-11 bg-gradient-to-br from-[var(--cyan)]/10 to-[var(--blue)]/10 rounded-xl flex flex-col items-center justify-center shrink-0 ml-2 border border-[var(--cyan)]/20 animate-breathe">
            <span className="text-[5px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-dim)]">GMPH</span>
            <span className="text-base font-mono font-black text-[var(--cyan)] leading-none tabular-nums">{vessel.gmph}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[var(--green)]">\u25B2</span>
            <span className="text-[var(--text-dim)]">LOAD</span>
            <span className="font-bold text-[var(--green)]">{formatCount(vessel.loadingDone)}</span>
            <span className="text-[var(--text-dim)]">/{formatCount(vessel.loadingTotal)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[var(--amber)]">\u25BC</span>
            <span className="text-[var(--text-dim)]">DISCH</span>
            <span className="font-bold text-[var(--amber)]">{formatCount(vessel.dischargingDone)}</span>
            <span className="text-[var(--text-dim)]">/{formatCount(vessel.dischargingTotal)}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[var(--text-dim)]">TOTAL</span>
            <span className="font-bold text-[var(--text-bright)]">{formatCount(vessel.totalDone)}</span>
            <span className="text-[var(--text-dim)]">/{formatCount(vessel.totalMoves)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-1.5">
          <div className="relative h-1 w-full rounded-full overflow-hidden bg-white/[0.06]">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--blue)] transition-all duration-700 progress-glow" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[7px] font-mono text-[var(--text-dim)] mt-0.5">
            <span>PROGRESS</span>
            <span className="font-bold text-[var(--cyan)]">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Ship */}
      <div className="flex-1 min-h-0" style={{ minHeight: "100px" }}>
        <ShipSVG vesselName={vessel.vesselName} cranes={vessel.cranes} />
      </div>

      {/* Table */}
      <CraneTable cranes={vessel.cranes} />
    </div>
  );
}

export function VesselMonitor({ terminalCode }: { terminalCode: string }) {
  const { data: vessels, loading, error, lastUpdated } = usePolling<Vessel[]>(`/api/vessels?terminal=${terminalCode}`, 60000);
  const count = vessels?.length ?? 0;

  if (loading && !vessels) return (
    <>
      <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[var(--cyan)] rounded-full animate-spin mb-3" />
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-dim)]">Connecting</p>
      </div>
    </>
  );

  if (error && !vessels) return (
    <>
      <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
      <div className="flex-1 flex items-center justify-center">
        <div className="glass rounded-2xl px-10 py-6 text-center card-3d shadow-depth-3 gradient-border">
          <div className="text-[10px] font-bold font-mono text-[var(--red)] uppercase tracking-[0.2em] mb-1">Connection Fault</div>
          <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-3">{error}</p>
          <button className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--red)] hover:bg-[var(--red)]/80 rounded transition-all">Retry</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <MonitorHeader title={`${terminalCode} Vessel Monitoring`} stats={<span className="text-[11px] font-mono text-[var(--text-secondary)]">{count} {count === 1 ? "Vessel" : "Vessels"}</span>} lastUpdated={lastUpdated} />
      <main className="flex-1 min-h-0 p-3 overflow-hidden flex items-center justify-center perspective-root bg-mesh bg-grid">
        <div className="w-full max-w-[1800px] h-full flex items-center justify-center">
          {!vessels || vessels.length === 0 ? (
            <div className="glass rounded-2xl px-12 py-8 text-center card-3d gradient-border">
              <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] mb-1">No Vessel Data</div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">Waiting for GC order data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full h-full items-center">
              {vessels.map((v, i) => (
                <div key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`} className="h-full max-h-[calc(100vh-120px)] flex flex-col">
                  <VesselCard vessel={v} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
