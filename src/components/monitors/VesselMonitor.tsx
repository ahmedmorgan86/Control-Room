"use client";

import { useMemo } from "react";
import type { Vessel, YardData, EquipmentData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatArrival } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";
import { MetricCards } from "@/components/MetricCards";
import { VesselVisualization } from "@/components/VesselVisualization";
import { CraneHUDOverlay } from "@/components/CraneHUDOverlay";
import { BottomTicker } from "@/components/BottomTicker";
import { YTFleetPanel, YardBlockPanel, GangDispatchPanel } from "@/components/BottomPanels";

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

const CRANE_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e0b", QC11: "#f59e0b", QC12: "#f59e0b",
  QC13: "#ef4444", QC14: "#ef4444", QC15: "#ef4444", QC16: "#ef4444",
};

function CraneTable({ cranes, duplicateIds }: { cranes: Vessel["cranes"]; duplicateIds: Set<string> }) {
  const sorted = useMemo(() => [...cranes].sort(compareCranes), [cranes]);

  return (
    <div className="bg-[#0e1321] border-t border-[#1c273e]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#64748b] text-[11px] uppercase tracking-wider text-left border-b border-[#1c273e]">
            <th className="px-3 py-2 font-semibold">Crane</th>
            <th className="px-3 py-2 font-semibold">Progress</th>
            <th className="px-3 py-2 font-semibold text-right">Load</th>
            <th className="px-3 py-2 font-semibold text-right">Disch</th>
            <th className="px-3 py-2 font-semibold text-right">MPH</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const conflict = duplicateIds.has(c.craneId);
            const done = c.movesDone >= c.movesTotal;
            const color = CRANE_COLORS[c.craneId] ?? "#00f0ff";
            const pct = c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0;

            return (
              <tr
                key={c.craneId}
                className={`border-b border-[#1c273e] hover:bg-[#141c2e] transition-colors ${done ? "opacity-50" : ""} ${conflict ? "bg-[#ef4444]/10" : ""}`}
              >
                <td className="px-3 py-2">
                  <span className="font-mono font-bold" style={{ color: conflict ? "#ef4444" : color }}>
                    {c.craneId}
                  </span>
                  {conflict && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-[#ef4444] text-white rounded font-black animate-pulse ml-2">
                      CONFLICT
                    </span>
                  )}
                  {done && !conflict && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] bg-[#10b981] text-white rounded font-black ml-2">
                      DONE
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-[#1c273e] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[#94a3b8] tabular-nums whitespace-nowrap text-xs">{c.movesDone}/{c.movesTotal}</span>
                    <span className="font-mono font-bold tabular-nums text-xs" style={{ color }}>{pct}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{c.loadingDone}<span className="text-[#64748b]">/{c.loadingTotal}</span></td>
                <td className="px-3 py-2 text-right tabular-nums text-xs">{c.dischargingDone}<span className="text-[#64748b]">/{c.dischargingTotal}</span></td>
                <td className="px-3 py-2 text-right">
                  <span className="tabular-nums font-bold text-xs" style={{
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
  const duplicateIds = useMemo(() => {
    const counts = new Map<string, number>();
    vessel.cranes.forEach((c) => counts.set(c.craneId, (counts.get(c.craneId) ?? 0) + 1));
    return new Set([...counts].filter(([, n]) => n > 1).map(([id]) => id));
  }, [vessel.cranes]);

  const activeCranes = useMemo(
    () => vessel.cranes.filter((c) => c.movesDone < c.movesTotal).sort(compareCranes),
    [vessel.cranes],
  );

  const totalDone = vessel.totalDone;
  const totalMoves = vessel.totalMoves;
  const overallPct = totalMoves > 0 ? Math.min(100, Math.round((totalDone / totalMoves) * 100)) : 0;

  return (
    <div className="flex flex-col h-full bg-[#0e1321] border border-[#1c273e] rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-[#141c2e] border-b border-[#1c273e] px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-lg font-extrabold text-[#dee2f6] uppercase tracking-wide truncate">
                {vessel.vesselName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[#94a3b8]">
              <span>VOY {vessel.voyageNumber}</span>
              <span className="text-[#1c273e]">│</span>
              <span>ARR {formatArrival(vessel.arrivalTime)}</span>
              <span className="text-[#1c273e]">│</span>
              <span>QC {vessel.cranes.length}</span>
            </div>
          </div>
          <div className="w-16 aspect-square bg-[#060a14] rounded-lg flex flex-col items-center justify-center shrink-0 ml-3 border border-[#1c273e]">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#64748b]">GMPH</span>
            <span className="text-xl font-mono font-black text-[#00f0ff] leading-none tabular-nums">{vessel.gmph}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#94a3b8] mb-1">
            <span className="uppercase tracking-wider">Overall Progress</span>
            <span className="font-bold tabular-nums">{totalDone}/{totalMoves} — {overallPct}%</span>
          </div>
          <div className="relative h-2.5 w-full rounded-full overflow-hidden bg-[#1c273e]">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-[#00f0ff] to-[#0284c7] rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
            {overallPct > 15 && (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow-sm">
                {overallPct}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Crane HUD Overlays */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-3 pt-3">
        {activeCranes.slice(0, 4).map((crane) => (
          <CraneHUDOverlay key={crane.craneId} crane={crane} />
        ))}
      </div>

      {/* Vessel Visualization */}
      <div className="flex-1 min-h-0 relative" style={{ minHeight: "200px" }}>
        <VesselVisualization cranes={vessel.cranes} vesselName={vessel.vesselName} duplicateCraneIds={duplicateIds} />
      </div>

      {/* Dock apron status */}
      <div className="bg-[#0e1321] border-t border-[#1c273e] px-3 py-2 flex flex-wrap items-center justify-between font-mono text-[10px] text-[#94a3b8]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            Mooring Tension: <strong className="text-white">16/16 Taut</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
            UKC: <strong className="text-[#00f0ff]">+3.2m</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            Shore Power: <strong className="text-[#10b981]">Active</strong>
          </span>
        </div>
      </div>

      {/* Crane Table */}
      <CraneTable cranes={vessel.cranes} duplicateIds={duplicateIds} />
    </div>
  );
}

export function VesselMonitor({ terminalCode }: { terminalCode: string }) {
  const { data: vessels, loading, error, lastUpdated } = usePolling<Vessel[]>(`/api/vessels?terminal=${terminalCode}`, 60000);
  const { data: yardData } = usePolling<YardData>(`/api/yard?terminal=${terminalCode}`, 60000);
  const { data: equData } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 60000);

  const vesselCount = vessels?.length ?? 0;
  const ytCards = equData?.yardSections?.find((s) => s.equType === "YT")?.cards ?? [];

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

      {vessels && vessels.length > 0 && <MetricCards vessels={vessels} />}

      <main className="flex-1 min-h-0 p-2">
        {!vessels || vessels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
            <div className="border border-[#1c273e] px-12 py-8 text-center rounded-xl">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Vessel Data</div>
              <p className="text-[11px] font-mono text-[#64748b]">Waiting for GC order data.</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-2 h-full">
            {vessels.slice(0, 3).map((v) => (
              <div
                key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`}
                className="h-full flex-shrink-0"
                style={{ width: "calc((100% - 16px) / 3)" }}
              >
                <VesselCard vessel={v} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Panels */}
      <div className="max-w-[1920px] mx-auto px-6 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-[#0e1321] border border-[#1c273e]/80 rounded-xl p-4 shadow-xl">
            <YTFleetPanel yts={ytCards} />
          </div>
          <div className="bg-[#0e1321] border border-[#1c273e]/80 rounded-xl p-4 shadow-xl">
            <YardBlockPanel blocks={yardData?.blocks ?? []} violations={yardData?.violations ?? []} />
          </div>
          <div className="bg-[#0e1321] border border-[#1c273e]/80 rounded-xl p-4 shadow-xl">
            <GangDispatchPanel yts={ytCards} />
          </div>
        </div>
      </div>

      <BottomTicker vessels={vessels ?? []} />
    </>
  );
}
