"use client";

import { useMemo } from "react";
import type { Vessel } from "@/lib/types";
import { formatCount } from "@/lib/ui";

export function MetricCards({ vessels }: { vessels: Vessel[] }) {
  const metrics = useMemo(() => {
    const totalGmph =
      vessels.length > 0
        ? vessels.reduce((s, v) => s + v.gmph, 0) / vessels.length
        : 0;
    const totalDone = vessels.reduce((s, v) => s + v.totalDone, 0);
    const totalMoves = vessels.reduce((s, v) => s + v.totalMoves, 0);
    const dischargePct = totalMoves > 0 ? ((totalDone / totalMoves) * 100).toFixed(1) : "0.0";
    const remaining = Math.max(0, totalMoves - totalDone);
    const totalCranes = vessels.reduce((s, v) => s + v.cranes.length, 0);
    const onlineCranes = vessels.reduce(
      (s, v) => s + v.cranes.filter((c) => c.movesDone < c.movesTotal).length,
      0,
    );

    return { totalGmph, totalDone, totalMoves, dischargePct, remaining, totalCranes, onlineCranes };
  }, [vessels]);

  const { totalGmph, totalDone, totalMoves, dischargePct, remaining, totalCranes, onlineCranes } = metrics;

  return (
    <section className="max-w-[1920px] mx-auto px-6 py-3">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Crane Fleet Productivity */}
        <div className="bg-[#090e1c] border border-[#1c273e] rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">Crane Fleet Productivity</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-mono">
              {formatCount(onlineCranes)} Active
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-black text-[#10b981] font-mono">{metrics.totalGmph.toFixed(1)}</span>
            <span className="text-xs text-[#64748b] font-mono">GMPH (Gross Moves/Hr)</span>
          </div>
          <div className="w-full bg-[#060a14] h-2 rounded-full mt-3 overflow-hidden border border-[#1c273e]/50">
            <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${Math.min(100, (metrics.totalGmph / 40) * 100)}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-1">
            <span>Target: 30.0</span>
            <span>{formatCount(metrics.totalCranes)} QCs Total</span>
          </div>
        </div>

        {/* Total Containers Discharged */}
        <div className="bg-[#090e1c] border border-[#1c273e] rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">Total Containers Discharged</span>
            <span className="text-xs font-mono text-[#00f0ff] font-bold">{metrics.dischargePct}% Done</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-[#00f0ff] font-mono">{formatCount(metrics.totalDone)}</span>
            <span className="text-sm text-[#64748b] font-mono">/ {formatCount(metrics.totalMoves)} TEU</span>
          </div>
          <div className="w-full bg-[#060a14] h-2 rounded-full mt-3 overflow-hidden border border-[#1c273e]/50 flex">
            <div className="bg-[#00f0ff] h-full" style={{ width: `${metrics.dischargePct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-1">
            <span>Remaining: {formatCount(metrics.remaining)} TEU</span>
            <span>{vessels.length} Vessel{vessels.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Vessel Count */}
        <div className="bg-[#090e1c] border border-[#1c273e] rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">Vessels at Berth</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] font-mono">{vessels.length} Active</span>
          </div>
          <div className="mt-2 space-y-1">
            {vessels.slice(0, 3).map((v) => {
              const pct = v.totalMoves > 0 ? Math.round((v.totalDone / v.totalMoves) * 100) : 0;
              return (
                <div key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#dee2f6] truncate max-w-[120px]">{v.vesselName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#1c273e] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00f0ff] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[#00f0ff] font-bold tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
            {vessels.length === 0 && (
              <p className="text-[11px] font-mono text-[#64748b]">No vessels at berth</p>
            )}
          </div>
        </div>

        {/* Laser Anti-Collision / Crane Safety */}
        <div className="bg-[#090e1c] border border-[#1c273e] rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#64748b]">Crane Operations</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-mono font-bold">
              ONLINE
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-black text-[#10b981] font-mono">{formatCount(onlineCranes)}</span>
            <span className="text-xs text-[#64748b] font-mono">Active Cranes</span>
          </div>
          <div className="w-full bg-[#060a14] h-2 rounded-full mt-3 overflow-hidden border border-[#1c273e]/50">
            <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${metrics.totalCranes > 0 ? (onlineCranes / metrics.totalCranes) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-[#64748b] mt-1">
            <span>Total: {formatCount(metrics.totalCranes)}</span>
            <span>Utilization: {metrics.totalCranes > 0 ? Math.round((onlineCranes / metrics.totalCranes) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
