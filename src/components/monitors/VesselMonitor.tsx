"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vessel, Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { ProgressBar } from "@/components/ui";
import { formatArrival, formatCount } from "@/lib/ui";

function compareCranes(a: { layoutRank: number; craneId: string }, b: { layoutRank: number; craneId: string }) {
  return a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId);
}

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
            @keyframes bodySway {
              0%,100% { transform: rotate(0deg); }
              25% { transform: rotate(0.4deg); }
              75% { transform: rotate(-0.4deg); }
            }
            .vessel-body { animation: bodySway 6s ease-in-out infinite; transform-origin: 50% 85%; }
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
                <text x="0" y="20" textAnchor="middle" fontSize="14" fontFamily="monospace" fill="var(--text-secondary)">
                  {crane.craneId}
                </text>
                <g className="qc-trolley">
                  <rect x="-30" y="28" width="60" height="12" fill="#64748b" rx="2" />
                  <rect x="-10" y="38" width="20" height="26" fill="#475569" rx="2" />
                  <rect x="-16" y="66" width="32" height="4" fill="#334155" />
                </g>
                <g className="qc-gantry">
                  <rect x="-40" y="16" width="80" height="8" rx="2" fill="#475569" />
                  <rect x="-36" y="16" width="6" height="60" fill="#475569" />
                  <rect x="30" y="16" width="6" height="60" fill="#475569" />
                </g>
              </g>
            );
          })}

          <g className="vessel-body" transform={`translate(${(tick * 0.2) % 4} ,0)`}>
            <path d="M120,320 L180,300 L1080,300 L1150,320 Z" fill="#334155" />
            <path d="M140,320 L160,372 L650,372 L650,320 Z" fill="#334155" />
            {[...Array(6)].map((_, i) => (
              <rect key={i} x={240 + i * 140} y="200" width="70" height="80" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
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

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-md overflow-hidden shadow-sm">
      <div className="bg-[var(--bg-vessel-header)] border-b border-[var(--border-crane-row)] px-4 py-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-[var(--text-primary)] uppercase">
                {vessel.vesselName}
              </span>
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">Voy {vessel.voyageNumber}</span>
            </div>
            <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">
              Arr: {formatArrival(vessel.arrivalTime)}
              <span className="text-[var(--text-tertiary)]"> · {vessel.cranes.length} QCs</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">GMPH</div>
            <div className="font-mono font-black text-lg leading-none text-[var(--text-primary)] tabular-nums">{vessel.gmph}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Bar label="LOAD" done={vessel.loadingDone} total={vessel.loadingTotal} color="var(--accent-loading)" />
          <Bar label="DISCH" done={vessel.dischargingDone} total={vessel.dischargingTotal} color="var(--accent-discharge)" />
          <Bar label="TOTAL" done={vessel.totalDone} total={vessel.totalMoves} color="#2563eb" />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative" style={{ minHeight: "240px" }}>
        <VesselVisualization cranes={vessel.cranes} vesselName={vessel.vesselName} duplicateCraneIds={duplicateIds} />
      </div>

      <div className="bg-[var(--bg-crane-table)] border-t border-[var(--border-crane-row)] px-4 py-2">
        <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Cranes</div>
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "160px" }}>
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="text-[9px] uppercase text-[var(--text-tertiary)]">
                <th className="py-1 pr-2">QC</th>
                <th className="py-1 pr-2 w-[30%]">Progress</th>
                <th className="py-1 px-2 text-right">Moves</th>
                <th className="py-1 px-2 text-right">Load</th>
                <th className="py-1 px-2 text-right">Disch</th>
                <th className="py-1 pl-2 text-right">MPH</th>
              </tr>
            </thead>
            <tbody>
              {sortedCranes.map((c) => (
                <tr
                  key={c.craneId}
                  className={`border-t border-[var(--border-crane-row)] ${duplicateIds.has(c.craneId) ? "text-[var(--accent-crane)]" : ""}`}
                >
                  <td className={`py-1.5 pr-2 font-bold ${duplicateIds.has(c.craneId) ? "text-[var(--accent-crane)]" : ""}`}>
                    {c.craneId}
                  </td>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <ProgressBar done={c.movesDone} total={c.movesTotal} color="var(--accent-blue)" />
                      <span className="tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                        {c.movesDone}/{c.movesTotal}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{c.movesDone}<span className="text-[var(--text-tertiary)]">/{c.movesTotal}</span></td>
                  <td className="py-1.5 px-2 text-right tabular-nums text-[var(--accent-loading)]">{c.loadingDone}<span className="text-[var(--text-tertiary)]">/{c.loadingTotal}</span></td>
                  <td className="py-1.5 px-2 text-right tabular-nums text-[var(--accent-discharge)]">{c.dischargingDone}<span className="text-[var(--text-tertiary)]">/{c.dischargingTotal}</span></td>
                  <td className="py-1.5 pl-2 text-right tabular-nums">{c.mph}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[9px] font-mono uppercase text-[var(--text-tertiary)] mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--text-secondary)]">{done}/{total}</span>
      </div>
      <ProgressBar done={done} total={total} color={color} />
    </div>
  );
}

export function VesselMonitor({ terminal }: { terminal: Terminal }) {
  const { data, loading, error, lastUpdated } = usePolling<Vessel[]>(`/api/vessels?terminal=${terminal}`, 60000);

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs font-mono text-[var(--accent-discharge)]">
        Failed to load vessels: {error}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs font-mono text-[var(--text-tertiary)]">
        No vessels
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          Live · {formatCount(data.length)} vessels
        </div>
        {lastUpdated && (
          <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-auto custom-scrollbar">
        {data.map((v) => (
          <div key={v.vesselCode} className="min-h-[400px] h-full">
            <VesselCard vessel={v} />
          </div>
        ))}
      </div>
    </div>
  );
}
