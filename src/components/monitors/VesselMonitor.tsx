"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vessel, Crane, YardData, EquipmentData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatArrival, formatCount } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";
import { MetricCards } from "@/components/MetricCards";
import { BottomTicker } from "@/components/BottomTicker";
import { YTFleetPanel, YardBlockPanel, GangDispatchPanel } from "@/components/BottomPanels";

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

const CRANE_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e81", QC11: "#f59e0b", QC12: "#f59e0b",
  QC13: "#ef4444", QC14: "#ef4444", QC15: "#ef4444", QC16: "#ef4444",
  QC17: "#ef4444", QC18: "#ef4444", QC19: "#ef4444", QC20: "#ef4444",
  QC21: "#ef4444", QC22: "#ef4444", QC23: "#ef4444", QC24: "#ef4444",
  QC25: "#ef4444", QC26: "#ef4444", QC27: "#ef4444", QC28: "#ef4444",
  QC29: "#ef4444", QC30: "#ef4444", QC31: "#ef4444", QC32: "#ef4444",
  QC33: "#ef4444", QC34: "#ef4444", QC35: "#ef4444", QC36: "#ef4444",
  QC37: "#ef4444", QC38: "#ef4444", QC39: "#ef4444", QC40: "#ef4444",
  QC41: "#ef4444", QC42: "#ef4444", QC43: "#ef4444", QC44: "#ef4444",
  QC45: "#ef4444", QC46: "#ef4444", QC47: "#ef4444", QC48: "#ef4444",
  QC49: "#ef4444", QC50: "#ef4444", QC51: "#ef4444", QC52: "#ef4444",
  QC53: "#ef4444", QC54: "#ef4444", QC55: "#ef4444", QC56: "#ef4444",
  QC57: "#ef4444", QC58: "#ef4444", QC59: "#ef4444", QC60: "#ef4444",
  QC61: "#ef4444", QC62: "#ef4444", QC63: "#ef4444", QC64: "#ef4444",
  QC65: "#ef4444", QC66: "#ef4444", QC67: "#ef4444", QC68: "#ef4444",
  QC69: "#ef4444", QC70: "#ef4444", QC71: "#ef4444", QC72: "#ef4444",
  QC73: "#ef4444", QC74: "#ef4444", QC75: "#ef4444", QC76: "#ef4444",
  QC77: "#ef4444", QC78: "#ef4444", QC79: "#ef4444", QC80: "#ef4444",
  QC81: "#ef4444", QC82: "#f59e0b",
};

const CONTAINER_COLORS = {
  standard: { fill: "#6b7280", stroke: "#4b5563" },
  rf: { fill: "#00f0ff", stroke: "#0284c7" },
  hazard: { fill: "#f59e0b", stroke: "#d97706" },
  empty: { fill: "#334155", stroke: "#1e293b" },
};

function generateContainerRows(craneCount: number) {
  const rows: { fill: string; stroke: string }[][] = [];
  const containersPerBay = 5;
  const bays = Math.max(craneCount * 2, 12);
  for (let bay = 0; bay < bays; bay++) {
    const bayContainers: { fill: string; stroke: string }[] = [];
    for (let tier = 0; tier < containersPerBay; tier++) {
      const r = (bay * 7 + tier * 13) % 20;
      const type = r < 11 ? "standard" : r < 14 ? "rf" : r < 16 ? "hazard" : "empty";
      bayContainers.push(CONTAINER_COLORS[type]);
    }
    rows.push(bayContainers);
  }
  return rows;
}

function VesselVisualization({
  cranes,
  vesselName,
  duplicateCraneIds,
}: {
  cranes: Crane[];
  vesselName: string;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = cranes.filter((c) => c.movesDone < c.movesTotal).sort(compareCranes);
  const [tick, setTick] = useState(0);
  useAnimationFrame((dt) => setTick((t) => (t + dt) % 1e6));

  const water = useMemo(() => [
    { y: 26, amp: 3, freq: 0.4, speed: 0.3, color: "#00f0ff", op: 0.1 },
    { y: 32, amp: 6, freq: 0.2, speed: -0.4, color: "#00f0ff", op: 0.15 },
    { y: 38, amp: 4, freq: 0.3, speed: 0.6, color: "#0284c7", op: 0.2 },
    { y: 44, amp: 8, freq: 0.15, speed: -0.2, color: "#0284c7", op: 0.25 },
    { y: 50, amp: 2, freq: 0.5, speed: 0.9, color: "#0284c7", op: 0.3 },
    { y: 56, amp: 7, freq: 0.25, speed: -0.7, color: "#0284c7", op: 0.35 },
    { y: 64, amp: 4, freq: 0.35, speed: 0.5, color: "#0284c7", op: 0.4 },
    { y: 72, amp: 9, freq: 0.18, speed: -1.1, color: "#0284c7", op: 0.45 },
    { y: 80, amp: 4, freq: 0.4, speed: -0.8, color: "#0284c7", op: 0.5 },
    { y: 88, amp: 6, freq: 0.22, speed: 0.4, color: "#0284c7", op: 0.55 },
    { y: 96, amp: 5, freq: 0.3, speed: -1.2, color: "#0284c7", op: 0.6 },
  ], []);

  const containerRows = useMemo(() => generateContainerRows(activeCranes.length), [activeCranes.length]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#060a14]">
      <div className="absolute inset-0 grid-lines-pattern opacity-50" />

      <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ width: "100%", height: "52%" }}>
        <WaterPath layers={water.slice(0, 2)} tick={tick} />
      </div>
      <div className="absolute bottom-0 left-0 z-25 pointer-events-none opacity-95" style={{ width: "100%", height: "52%" }}>
        <WaterPath layers={water.slice(2)} tick={tick} />
      </div>

      <div className="relative w-full max-w-6xl" style={{ aspectRatio: "2.2 / 1" }}>
        <svg viewBox="0 0 1200 400" className="absolute inset-0 z-10 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c273e" />
              <stop offset="100%" stopColor="#0e1321" />
            </linearGradient>
            <linearGradient id="deckGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e1321" />
              <stop offset="100%" stopColor="#0a0f1e" />
            </linearGradient>
            <linearGradient id="waterlineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
              <stop offset="10%" stopColor="#00f0ff" stopOpacity="0.5" />
              <stop offset="90%" stopColor="#00f0ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* === Vessel Hull === */}
          <g transform="translate(120, 0)">
            {/* Main hull body */}
            <path d="M0,320 L60,295 L1020,295 L1100,320 Z" fill="url(#hullGrad)" stroke="#2a3550" strokeWidth="1.5" />

            {/* Hull bottom / keel */}
            <path d="M20,320 L40,368 L560,368 L560,320 Z" fill="url(#hullGrad)" stroke="#2a3550" strokeWidth="1" />

            {/* Bow (pointed front) */}
            <path d="M1020,295 L1100,320 L1080,368 L560,368 L560,320 L1020,295 Z" fill="url(#hullGrad)" stroke="#2a3550" strokeWidth="1" />

            {/* Waterline highlight */}
            <line x1="60" y1="320" x2="1100" y2="320" stroke="url(#waterlineGrad)" strokeWidth="2" opacity="0.6" />

            {/* Deck surface */}
            <rect x="60" y="290" width="960" height="8" rx="2" fill="url(#deckGrad)" stroke="#1c273e" strokeWidth="1" />

            {/* Container stacks on deck */}
            {containerRows.map((bay, bayIdx) => {
              const bx = 90 + bayIdx * 72;
              return bay.map((cell, tierIdx) => {
                const by = 210 + tierIdx * 16;
                return (
                  <rect
                    key={`c-${bayIdx}-${tierIdx}`}
                    x={bx}
                    y={by}
                    width={64}
                    height={13}
                    rx={2}
                    fill={cell.fill}
                    stroke={cell.stroke}
                    strokeWidth="1"
                    opacity={0.85}
                  />
                );
              });
            })}

            {/* Superstructure / Bridge */}
            <rect x="920" y="230" width="80" height="60" rx="4" fill="#1c273e" stroke="#2a3550" strokeWidth="1.5" />
            <rect x="930" y="235" width="60" height="15" rx="2" fill="#0e1321" />
            {/* Bridge windows */}
            {[0, 1, 2, 3].map((i) => (
              <rect key={`win-${i}`} x={935 + i * 14} y={237} width={10} height={8} rx={1} fill="#0f172a" stroke="#1c273e" strokeWidth="0.5" />
            ))}

            {/* Navigation light on top */}
            <circle cx="960" cy="225" r="3" fill="#ef4444" opacity={Math.sin(tick * 0.003) > 0 ? 1 : 0.2} filter="url(#glow)" />

            {/* Vessel name */}
            <text x="540" y="195" textAnchor="middle" fontSize="20" fontFamily="Inter, sans-serif" fill="#dee2f6" fontWeight={700} letterSpacing="2">
              {vesselName}
            </text>

            {/* Draft marks */}
            <text x="-10" y="315" textAnchor="end" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#64748b">BLT</text>
            <text x="-10" y="335" textAnchor="end" fontSize="8" fontFamily="JetBrains Mono, monospace" fill="#64748b">DK</text>

            {/* Mooring lines */}
            {[140, 380, 620, 860].map((mx, i) => (
              <g key={`moor-${i}`}>
                <line x1={mx} y1="295" x2={mx - 40} y2="335" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.5" />
                <circle cx={mx - 40} cy="335" r="3" fill="#475569" opacity="0.6" />
                <text x={mx - 40} y="348" textAnchor="middle" fontSize="5" fontFamily="JetBrains Mono, monospace" fill="#475569">
                  {["B1", "B2", "B3", "B4"][i]}
                </text>
              </g>
            ))}
          </g>

          {/* === Cranes === */}
          {activeCranes.map((crane, idx) => {
            const x = 180 + (idx / Math.max(activeCranes.length - 1, 1)) * 780;
            const conflict = duplicateCraneIds.has(crane.craneId);
            const color = CRANE_COLORS[crane.craneId] ?? "#00f0ff";
            const progress = crane.movesTotal > 0 ? Math.round((crane.movesDone / crane.movesTotal) * 100) : 0;

            return (
              <g key={crane.craneId} transform={`translate(${x},0)`}>
                {/* Crane base / A-frame */}
                <rect x="-5" y="80" width="10" height="40" fill="#1c273e" stroke="#2a3550" strokeWidth="1" rx="2" />

                {/* Boom (horizontal arm) */}
                <rect x="-60" y="68" width="120" height="10" rx="3" fill="#1c273e" stroke={color} strokeWidth="1.5" />

                {/* Boom tip marker */}
                <circle cx="-60" cy="73" r="3" fill={color} opacity="0.8" />

                {/* Trolley */}
                <rect x="-10" y="68" width="20" height="8" rx="2" fill={color} opacity="0.9" />

                {/* Spreader (cable + spreader bar) */}
                <line x1="0" y1="76" x2="0" y2="100" stroke="#64748b" strokeWidth="1.5" />
                <rect x="-12" y="98" width="24" height="4" rx="1" fill="#94a3b8" />

                {/* Operator cabin */}
                <rect x="8" y="75" width="14" height="12" rx="2" fill="#0e1321" stroke={color} strokeWidth="1" />
                <rect x="10" y="77" width="10" height="6" rx="1" fill="#0f172a" />

                {/* Confusion indicator */}
                {conflict && (
                  <g>
                    <circle cx="0" cy="68" r="12" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity={Math.sin(tick * 0.008) > 0 ? 0.9 : 0.3} />
                    <text x="0" y="62" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono, monospace" fill="#ef4444" fontWeight="bold">!</text>
                  </g>
                )}

                {/* Crane ID label */}
                <text x="0" y="58" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono, monospace" fill={color} fontWeight="bold">
                  {crane.craneId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Crane HUD Telemetry Overlays (top) */}
        {activeCranes.map((crane, idx) => {
          const leftPct = 15 + (idx / Math.max(activeCranes.length - 1, 1)) * 70;
          const progress = crane.movesTotal > 0 ? Math.round((crane.movesDone / crane.movesTotal) * 100) : 0;
          const color = CRANE_COLORS[crane.craneId] ?? "#00f0ff";
          return (
            <div
              key={crane.craneId}
              className="absolute top-2 bg-[#090e1c]/95 border rounded-lg p-2 backdrop-blur-sm pointer-events-none"
              style={{
                left: `${leftPct}%`,
                transform: "translateX(-50%)",
                borderColor: color,
                boxShadow: `0 0 8px ${color}33`,
              }}
            >
              <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color }}>
                {crane.craneId}
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono">
                <span className="text-[#64748b]">Moves</span>
                <span className="text-white font-bold">{crane.movesDone}/{crane.movesTotal}</span>
              </div>
              <div className="w-16 h-1 bg-[#1c273e] rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
              </div>
              <div className="flex items-center justify-between text-[8px] font-mono mt-0.5">
                <span className="text-[#64748b]">MPH</span>
                <span style={{ color: crane.mph >= 25 ? "#10b981" : crane.mph >= 15 ? color : "#f59e0b" }}>
                  {crane.mph}
                </span>
              </div>
            </div>
          );
        })}
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
  useEffect(() => { cbRef.current = cb; });
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

function CraneTable({ cranes, duplicateIds }: { cranes: Crane[]; duplicateIds: Set<string> }) {
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

  const sortedCranes = useMemo(() => [...vessel.cranes].sort(compareCranes), [vessel.cranes]);
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
        {/* Overall progress bar */}
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

      {/* Vessel Visualization */}
      <div className="flex-1 min-h-0 relative" style={{ minHeight: "220px" }}>
        <VesselVisualization cranes={vessel.cranes} vesselName={vessel.vesselName} duplicateCraneIds={duplicateIds} />
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
      {/* Metric Cards */}
      {vessels && vessels.length > 0 && <MetricCards vessels={vessels} />}

      <main className="flex-1 min-h-0 p-2">
        {!vessels || vessels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
            <div className="border border-[#1c273e] px-12 py-8 text-center rounded-xl">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Vessel Data</div>
              <p className="text-[11px] font-mono text-[#64748b]">
                Waiting for GC order data.<br />Display will update automatically.
              </p>
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
      {vessels && vessels.length > 0 && (
        <div className="max-w-[1920px] mx-auto px-6 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-48">
            <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-3 overflow-hidden">
              <YTFleetPanel yts={equData?.yardSections?.find((s) => s.equType === "YT")?.cards ?? []} />
            </div>
            <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-3 overflow-hidden">
              <YardBlockPanel blocks={yardData?.blocks ?? []} violations={yardData?.violations ?? []} />
            </div>
            <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-3 overflow-hidden">
              <GangDispatchPanel yts={equData?.yardSections?.find((s) => s.equType === "YT")?.cards ?? []} />
            </div>
          </div>
        </div>
      )}

      {/* Status Ticker */}
      <BottomTicker vessels={vessels ?? []} />
    </>
  );
}
