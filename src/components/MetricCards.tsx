"use client";

import { useMemo } from "react";
import type { Vessel } from "@/lib/types";
import { formatCount } from "@/lib/ui";

export function MetricCards({ vessels }: { vessels: Vessel[] }) {
  const m = useMemo(() => {
    const totalGmph = vessels.length > 0
      ? vessels.reduce((s, v) => s + v.gmph, 0) / vessels.length
      : 0;
    const totalDone = vessels.reduce((s, v) => s + v.totalDone, 0);
    const totalMoves = vessels.reduce((s, v) => s + v.totalMoves, 0);
    const dischargePct = totalMoves > 0 ? ((totalDone / totalMoves) * 100).toFixed(1) : "0.0";
    const remaining = Math.max(0, totalMoves - totalDone);
    const totalCranes = vessels.reduce((s, v) => s + v.cranes.length, 0);
    const activeCranes = vessels.reduce(
      (s, v) => s + v.cranes.filter((c) => c.movesDone < c.movesTotal).length,
      0,
    );
    const target = 30;
    const diffNum = totalGmph - target;
    const diff = diffNum.toFixed(1);
    return { totalGmph, totalDone, totalMoves, dischargePct, remaining, totalCranes, activeCranes, target, diff, diffNum };
  }, [vessels]);

  return (
    <section className="max-w-[1920px] mx-auto px-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#0b1329] border border-[#1e293b] hover:border-[#00f0ff]/40 rounded-xl p-5 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">Crane Productivity</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-mono font-bold">
              {m.diffNum >= 0 ? "+" : ""}{m.diff} vs Target
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-black text-[#10b981] font-mono tabular-nums tracking-tight">{m.totalGmph.toFixed(1)}</span>
            <span className="text-xs text-[#64748b] font-mono uppercase">GMPH Moves/Hr</span>
          </div>
          <div className="w-full bg-[#050811] h-2 rounded-full mt-4 overflow-hidden border border-[#1e293b]">
            <div className="bg-gradient-to-r from-[#10b981]/60 to-[#10b981] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (m.totalGmph / 40) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-2">
            <span>Target: {m.target.toFixed(1)}</span>
            <span className="text-[#94a3b8]">{m.totalCranes} QCs Active</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0b1329] border border-[#1e293b] hover:border-[#00f0ff]/40 rounded-xl p-5 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">Containers Discharged</span>
            <span className="text-xs font-mono text-[#00f0ff] font-bold px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30">{m.dischargePct}% Done</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-[#00f0ff] font-mono tabular-nums tracking-tight">{formatCount(m.totalDone)}</span>
            <span className="text-sm text-[#64748b] font-mono">/ {formatCount(m.totalMoves)} TEU</span>
          </div>
          <div className="w-full bg-[#050811] h-2 rounded-full mt-4 overflow-hidden border border-[#1e293b] flex">
            <div className="bg-gradient-to-r from-[#00f0ff]/60 to-[#00f0ff] h-full transition-all duration-700" style={{ width: `${m.dischargePct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-2">
            <span>Remaining: {formatCount(m.remaining)} TEU</span>
            <span className="text-[#94a3b8]">{vessels.length} Vessel{vessels.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0b1329] border border-[#1e293b] hover:border-[#00f0ff]/40 rounded-xl p-5 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">Terminal Tractors</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-mono font-bold">
              Fleet Synced
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-black text-white font-mono tabular-nums tracking-tight">{m.activeCranes}</span>
            <span className="text-xs text-[#64748b] font-mono uppercase">Active YT / QC</span>
          </div>
          <div className="w-full bg-[#050811] h-2 rounded-full mt-4 overflow-hidden border border-[#1e293b]">
            <div className="bg-gradient-to-r from-[#f59e0b]/60 to-[#f59e0b] h-full rounded-full transition-all duration-700" style={{ width: `${m.totalCranes > 0 ? (m.activeCranes / m.totalCranes) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-2">
            <span>Buffer: 2.1 YT/QC</span>
            <span className="text-[#94a3b8]">Cycle: 6.8m</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0b1329] border border-[#1e293b] hover:border-[#00f0ff]/40 rounded-xl p-5 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8]">Laser Anti-Collision</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-mono font-bold animate-pulse">
              ALL CLEAR
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl font-black text-[#10b981] font-mono tabular-nums tracking-tight">38.4m</span>
            <span className="text-xs text-[#64748b] font-mono uppercase">Min Separation</span>
          </div>
          <div className="w-full bg-[#050811] h-2 rounded-full mt-4 overflow-hidden border border-[#1e293b]">
            <div className="bg-[#10b981] h-full rounded-full" style={{ width: "100%" }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-2">
            <span>Interlocks: 4/4 Locked</span>
            <span className="text-[#94a3b8]">Speed: Safe</span>
          </div>
        </div>
      </div>
    </section>
  );
}
