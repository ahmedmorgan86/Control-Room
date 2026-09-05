"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vessel } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatArrival } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

const isQcTypeA = (craneId: string) => ["QC09", "QC82"].includes(craneId);

function VesselVisualization({
  cranes,
  vesselName,
  duplicateCraneIds,
}: {
  cranes: Vessel["cranes"];
  vesselName: string;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = cranes.filter((c) => c.movesDone < c.movesTotal).sort(compareCranes);
  const [tick, setTick] = useState(0);
  useAnimationFrame((dt) => setTick((t) => (t + dt) % 1e6));

  const water = useMemo(() => {
    const layers = [
      { y: 26, amp: 3, freq: 0.4, speed: 0.3, color: "var(--wave-1)", op: 0.3 },
      { y: 32, amp: 6, freq: 0.2, speed: -0.4, color: "var(--wave-2)", op: 0.4 },
      { y: 38, amp: 4, freq: 0.3, speed: 0.6, color: "var(--wave-3)", op: 0.8 },
      { y: 44, amp: 8, freq: 0.15, speed: -0.2, color: "var(--wave-4)", op: 0.6 },
      { y: 50, amp: 2, freq: 0.5, speed: 0.9, color: "var(--wave-5)", op: 0.7 },
      { y: 56, amp: 7, freq: 0.25, speed: -0.7, color: "var(--wave-6)", op: 0.8 },
      { y: 64, amp: 4, freq: 0.35, speed: 0.5, color: "var(--wave-7)", op: 0.85 },
      { y: 72, amp: 9, freq: 0.18, speed: -1.1, color: "var(--wave-6)", op: 0.92 },
      { y: 80, amp: 4, freq: 0.4, speed: -0.8, color: "var(--wave-7)", op: 0.94 },
      { y: 88, amp: 6, freq: 0.22, speed: 0.4, color: "var(--wave-8)", op: 0.96 },
      { y: 96, amp: 5, freq: 0.3, speed: -1.2, color: "var(--wave-8)", op: 1 },
    ];
    return layers;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-vessel-viz)]">
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ width: "100%", height: "52%" }}>
        {WaterPath({ layers: water.slice(0, 2), tick })}
      </div>
      <div className="absolute bottom-0 left-0 z-25 pointer-events-none opacity-95" style={{ width: "100%", height: "52%" }}>
        {WaterPath({ layers: water.slice(2), tick })}
      </div>
      <div className="relative w-full max-w-5xl aspect-video">
        <svg viewBox="0 0 1200 400" className="absolute inset-0 z-10 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <style>{`
            @keyframes conflictPulseCore {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes conflictPulseRing {
              0% { transform: scale(1); opacity: 1; stroke-width: 2; }
              100% { transform: scale(1.6); opacity: 0; stroke-width: 1; }
            }
            .qc-conflict-box { animation: conflictPulseCore 1.5s infinite; transform-origin: center; }
            .qc-conflict-ring { animation: conflictPulseRing 1.5s infinite; transform-origin: center; }
          `}</style>

          {activeCranes.map((crane, idx) => {
            const x = 150 + (idx / Math.max(activeCranes.length - 1, 1)) * 900;
            const conflict = duplicateCraneIds.has(crane.craneId);
            return (
              <g key={crane.craneId} transform={`translate(${x},0)`}>
                {conflict && (
                  <g>
                    <rect className="qc-conflict-ring" x="-16" y="60" width="32" height="70" fill="none" stroke="#ef4444" rx="4" />
                    <rect className="qc-conflict-box" x="-12" y="64" width="24" height="62" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.5" rx="3" />
                  </g>
                )}
                <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                  <rect x="-44" y="12" width="88" height="10" rx="3" fill={isQcTypeA(crane.craneId) ? "#F59E0B" : "#2563EB"} />
                  <rect x="-40" y="12" width="8" height="80" fill="#475569" />
                  <rect x="32" y="12" width="8" height="80" fill="#475569" />
                  <rect x="-12" y="22" width="24" height="14" fill="#64748b" rx="2" />
                  <rect x="-6" y="36" width="12" height="28" fill="#94a3b8" />
                  <rect x="-18" y="64" width="36" height="6" rx="2" fill="#334155" />
                  <line x1="0" y1="30" x2="0" y2="64" stroke="#94a3b8" strokeWidth="2" />
                </g>
              </g>
            );
          })}

          <g className="vessel-body" transform={`translate(${(tick * 0.2) % 4} ,0)`}>
            <path d="M120,320 L180,300 L1080,300 L1150,320 Z" fill="#334155" />
            <path d="M140,320 L160,372 L650,372 L650,320 Z" fill="#334155" />
            {[...Array(6)].map((_, i) => (
              <rect key={i} x={240 + i * 140} y="200" width="70" height="80" rx="4" fill="var(--bg-header)" stroke="var(--border)" strokeWidth="2" />
            ))}
            <text x="600" y="180" textAnchor="middle" fontSize="18" fontFamily="monospace" fill="var(--text-primary)" fontWeight={700}>
              {vesselName}
            </text>
            <text x="600" y="350" textAnchor="middle" fontSize="14" fontFamily="monospace" fill="#cbd5e1">
              {cranes.length} QCs
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function WaterPath({ layers, tick }: { layers: { y: number; amp: number; freq: number; speed: number; color: string; op: number }[]; tick: number }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
      {layers.map((e, s) => (
        <path
          key={s}
          d={(() => {
            const pts = [];
            for (let a = 0; a <= 60; a++) {
              const xx = (a / 60) * 150;
              const yy = e.y + Math.sin(a * e.freq + tick * e.speed) * e.amp + Math.sin(a * (1.8 * e.freq) + 1.3 * tick * e.speed) * (0.4 * e.amp);
              pts.push(`${xx},${yy}`);
            }
            return `M 0,100 L 0,${e.y} ${pts.map((p) => `L ${p}`).join(" ")} L 150,${e.y} L 150,100 Z`;
          })()}
          fill={e.color}
          opacity={e.op}
        />
      ))}
    </svg>
  );
}

function useAnimationFrame(cb: (dt: number) => void) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      cbRef.current(now - last);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function VesselCard({ vessel }: { vessel: Vessel }) {
  const duplicateIds = useMemo(() => {
    const counts = new Map<string, number>();
    vessel.cranes.forEach((c) => counts.set(c.craneId, (counts.get(c.craneId) ?? 0) + 1));
    return new Set([...counts].filter(([, n]) => n > 1).map(([id]) => id));
  }, [vessel.cranes]);

  const sortedCranes = useMemo(() => [...vessel.cranes].sort(compareCranes), [vessel.cranes]);

  const totalDone = vessel.totalDone;
  const totalMoves = vessel.totalMoves;
  const overallPct = totalMoves > 0 ? Math.min(100, Math.round((totalDone / totalMoves) * 100)) : 0;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden shadow-md shadow-black/5 dark:shadow-[0_0_30px_rgba(37,99,235,0.25)]">
      {/* Header */}
      <div className="bg-[var(--bg-vessel-header)] border-b border-[var(--border-crane-row)] px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-extrabold text-[var(--text-primary)] uppercase tracking-wide truncate">
                {vessel.vesselName}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[17.5px] font-mono text-[var(--text-secondary)]">
              <span>VOY {vessel.voyageNumber}</span>
              <span className="text-[var(--text-tertiary)]">│</span>
              <span>ARR {formatArrival(vessel.arrivalTime)}</span>
              <span className="text-[var(--text-tertiary)]">│</span>
              <span>QC {vessel.cranes.length}</span>
            </div>
          </div>
          <div className="w-20 aspect-square bg-[var(--bg-gmph)] rounded-lg flex flex-col items-center justify-center shrink-0 ml-3 border border-[var(--border)]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)]">GMPH</span>
            <span className="text-2xl font-mono font-black text-[var(--accent-blue)] leading-none tabular-nums">{vessel.gmph}</span>
          </div>
        </div>
        {/* Single overall progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] mb-1">
            <span className="uppercase tracking-wider">Overall Progress</span>
            <span className="font-bold tabular-nums">{totalDone}/{totalMoves} — {overallPct}%</span>
          </div>
          <div className="relative h-3 w-full rounded-full overflow-hidden bg-[var(--border)]">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-[#2563EB] to-[#1D4ED8] rounded-full transition-all duration-700"
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

      {/* Vessel Visualization */}
      <div className="flex-1 min-h-0 relative" style={{ minHeight: "240px" }}>
        <VesselVisualization cranes={vessel.cranes} vesselName={vessel.vesselName} duplicateCraneIds={duplicateIds} />
      </div>

      {/* Crane Table */}
      <div className="bg-[var(--bg-crane-table)] border-t border-[var(--border-crane-row)]">
        <table id="crane-details-table" className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider text-left border-b border-[var(--border)]">
              <th className="px-4 py-2 font-semibold">Crane</th>
              <th className="px-4 py-2 font-semibold">Progress</th>
              <th className="px-4 py-2 font-semibold text-right">Load</th>
              <th className="px-4 py-2 font-semibold text-right">Disch</th>
              <th className="px-4 py-2 font-semibold text-right">MPH</th>
            </tr>
          </thead>
          <tbody>
            {sortedCranes.map((c) => {
              const conflict = duplicateIds.has(c.craneId);
              const done = c.movesDone >= c.movesTotal;
              const typeA = isQcTypeA(c.craneId);
              const progressPct = c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0;

              return (
                <tr
                  key={c.craneId}
                  className={`border-b border-[var(--border-crane-row)] hover:bg-[var(--bg-header)] transition-colors ${done ? "opacity-50" : ""} ${conflict ? "bg-red-500/10" : ""}`}
                >
                  <td className="px-4 py-2">
                    <span className="font-mono font-bold" style={{ color: conflict ? "var(--accent-crane)" : typeA ? "#F59E0B" : "#2563EB" }}>
                      {c.craneId}
                    </span>
                    {conflict && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] bg-red-600 text-white rounded font-black animate-pulse shrink-0 leading-none ml-2 -mt-[1px]">
                        CONFLICT
                      </span>
                    )}
                    {done && !conflict && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-black shrink-0 leading-none ml-2 -mt-[1px]">
                        DONE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent-blue)] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
                        {c.movesDone}/{c.movesTotal}
                      </span>
                      <span className="font-mono font-bold tabular-nums" style={{ color: "var(--accent-blue)" }}>
                        {progressPct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{c.loadingDone}<span className="text-[var(--text-tertiary)]">/{c.loadingTotal}</span></td>
                  <td className="px-4 py-2 text-right tabular-nums">{c.dischargingDone}<span className="text-[var(--text-tertiary)]">/{c.dischargingTotal}</span></td>
                  <td className="px-4 py-2 text-right">
                    <span className="tabular-nums font-bold" style={{
                      color: c.mph >= 25 ? "var(--accent-loading)" : c.mph >= 15 ? "var(--accent-blue)" : c.mph > 0 ? "#D97706" : "var(--text-tertiary)"
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
    </div>
  );
}

export function VesselMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<Vessel[]>(`/api/vessels?terminal=${terminalCode}`, 60000);

  const vesselCount = data?.length ?? 0;

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest">Connecting to Terminal Database</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Vessel Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="border border-[var(--accent-discharge)] bg-red-50 px-8 py-6 text-center max-w-md">
            <div className="text-xs font-bold font-mono text-[var(--accent-discharge)] uppercase tracking-widest mb-2">Connection Fault</div>
            <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">{error}</p>
            <button className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-[var(--accent-discharge)] hover:opacity-90 transition-opacity">
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
          <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
            {vesselCount} {vesselCount === 1 ? "Vessel" : "Vessels"}
          </span>
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 p-1.5">
        {!data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
            <div className="border border-[var(--border)] px-12 py-8 text-center">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Vessel Data</div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                Waiting for GC order data.<br />Display will update automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-1.5 h-full">
            {data.slice(0, 3).map((v) => (
              <div
                key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`}
                className="h-full flex-shrink-0"
                style={{ width: "calc((100% - 12px) / 3)" }}
              >
                <VesselCard vessel={v} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
