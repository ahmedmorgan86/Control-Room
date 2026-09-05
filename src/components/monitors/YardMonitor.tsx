"use client";

import { useEffect, useRef } from "react";
import type { BlockType, YardBlock, YardData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { BLOCK_COLORS, SEVERITY_COLORS } from "@/lib/ui";
import { playCriticalAlert } from "@/lib/alertSound";
import { MonitorHeader } from "@/components/MonitorHeader";

function BlockCard({ block }: { block: YardBlock }) {
  const color = BLOCK_COLORS[block.blockType];
  const fillPct = Math.round(block.fillRatio * 100);

  return (
    <div
      className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-lg font-mono font-black tracking-wider" style={{ color }}>
          {block.blockId}
        </span>
        {block.violationCount > 0 && (
          <span className="flex items-center gap-1 px-1.5 h-5 rounded-sm text-white text-[9px] font-mono font-bold border border-white/20 shrink-0" style={{ backgroundColor: SEVERITY_COLORS.CRITICAL }}>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            {block.violationCount}
          </span>
        )}
      </div>

      <div className="px-2 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-secondary)]">
          <span>{block.occupiedTeu}<span className="text-[var(--text-tertiary)]">/{block.capacityTeu}</span></span>
          <span className="font-bold" style={{ color: fillPct > 85 ? "#ef4444" : fillPct > 70 ? "#eab308" : "#22c55e" }}>{fillPct}%</span>
        </div>
        {block.neglectCount > 0 && (
          <span className="flex items-center gap-0.5 px-1.5 h-5 rounded-sm bg-purple-600/90 text-white text-[9px] font-mono font-bold border border-purple-400/30 shrink-0">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {block.neglectCount}
          </span>
        )}
      </div>

      <div className="relative h-4 mx-1.5 mb-1.5 rounded-full overflow-hidden bg-[var(--border)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{ width: `${fillPct}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white drop-shadow-sm">
          {fillPct}%
        </span>
      </div>
    </div>
  );
}

const ZONE_CATEGORIES = [
  { label: "Special Containers", types: ["DG", "RF"] as BlockType[], color: "#be185d" },
  { label: "High Traffic", types: ["IMP", "EXP", "IMP_EXP"] as BlockType[], color: "#2563eb" },
  { label: "Auxiliary", types: ["EMPTY", "INSP", "CFS", "NEGLECT", "OTHER"] as BlockType[], color: "#64748b" },
];

export function YardMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<YardData>(`/api/yard?terminal=${terminalCode}`, 60000);
  const knownCriticalRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!data) return;
    const currentCritical = new Set(
      data.violations.filter((v) => v.severity === "CRITICAL").map((v) => `${v.cntrNo}|${v.type}`),
    );
    const previous = knownCriticalRef.current;
    if (previous) {
      const hasNew = [...currentCritical].some((key) => !previous.has(key));
      if (hasNew) playCriticalAlert();
    }
    knownCriticalRef.current = currentCritical;
  }, [data]);

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Yard Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest">Connecting to Yard Database</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Yard Monitoring`} />
        <div className="flex-1 flex flex-col items-center justify-center">
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
  if (!data) return null;

  const summary = data.summary;

  return (
    <>
      <MonitorHeader
        title={`${terminalCode} Yard Monitoring`}
        stats={
          <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
            {data.blocks.length} Blocks
          </span>
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 flex gap-2 p-2">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {ZONE_CATEGORIES.map((zone) => {
              const zoneBlocks = data.blocks.filter((b) => zone.types.includes(b.blockType));
              if (zoneBlocks.length === 0) return null;
              const zoneBg = `rgba(${parseInt(zone.color.slice(1,3),16)},${parseInt(zone.color.slice(3,5),16)},${parseInt(zone.color.slice(5,7),16)},0.06)`;
              return (
                <div
                  key={zone.label}
                  className="mb-3 p-2 rounded-lg border animate-zone-breathe"
                  style={{ backgroundColor: zoneBg, borderColor: `${zone.color}33` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{zone.label}</span>
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-tertiary)]">{zoneBlocks.length}</span>
                    <div className="h-px flex-1" style={{ backgroundColor: `${zone.color}33` }} />
                  </div>
                  <div className="grid grid-cols-4 gap-2" style={{ gridAutoRows: "1fr" }}>
                    {zoneBlocks.map((b) => (
                      <BlockCard key={b.blockId} block={b} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-[20%] min-w-[220px] max-w-[280px] flex flex-col gap-2 shrink-0">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col items-center gap-2">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)]">Terminal Utilization</div>
            <div className="relative w-24 h-24 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={summary.overallFillRatio > 0.85 ? "#ef4444" : summary.overallFillRatio > 0.7 ? "#eab308" : summary.overallFillRatio > 0.5 ? "#22c55e" : "#3b82f6"}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - summary.overallFillRatio)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-mono font-black tabular-nums" style={{ color: summary.overallFillRatio > 0.85 ? "#ef4444" : summary.overallFillRatio > 0.7 ? "#eab308" : summary.overallFillRatio > 0.5 ? "#22c55e" : "#3b82f6" }}>
                  {Math.round(summary.overallFillRatio * 100)}%
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.totalOccupied.toLocaleString()}</span>
                <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] opacity-60">/</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-mono font-bold text-[var(--text-secondary)] tabular-nums">{summary.totalCapacity.toLocaleString()}</span>
                  <span className="text-sm font-mono font-bold text-[var(--text-secondary)] uppercase tracking-tight ml-0.5">TEU</span>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-[var(--border)] my-1" />
            <div className="w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <span className="text-xs font-mono font-bold uppercase">Reefers</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.reeferCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: "#be185d" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <span className="text-xs font-mono font-bold uppercase">Dangerous</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.dgCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs font-mono font-bold uppercase">Neglect</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.neglectCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col gap-2 shrink-0">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>Alert Summary</span>
              <span className="text-[var(--accent-discharge)] ml-auto">{summary.totalViolations}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-1 rounded bg-red-500/10 border border-red-500/20">
                <span className="text-xs font-black text-red-500">{summary.criticalCount}</span>
                <span className="text-[8px] font-mono uppercase text-red-400">Crit</span>
              </div>
              <div className="flex flex-col items-center p-1 rounded bg-orange-500/10 border border-orange-500/20">
                <span className="text-xs font-black text-orange-500">{summary.highCount}</span>
                <span className="text-[8px] font-mono uppercase text-orange-400">High</span>
              </div>
              <div className="flex flex-col items-center p-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-xs font-black text-yellow-500">{summary.mediumCount}</span>
                <span className="text-[8px] font-mono uppercase text-yellow-400">Med</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)]">Priority Alerts</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
              {data.violations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-emerald-500 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 mx-auto">
                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <span className="text-xs font-mono uppercase text-[var(--text-tertiary)]">Safe State</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-0">
                  {data.violations.map((v, idx) => (
                    <div key={`${v.cntrNo}-${idx}`} className="px-3 py-1.5 border-b border-[var(--border-light)] hover:bg-[var(--bg-nav-hover)] transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-mono font-black text-[var(--text-primary)]">{v.cntrNo}</span>
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-sm text-white" style={{ backgroundColor: SEVERITY_COLORS[v.severity] }}>{v.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1 py-0 rounded" style={{ backgroundColor: `${SEVERITY_COLORS[v.severity]}20`, color: SEVERITY_COLORS[v.severity] }}>{v.block}</span>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{v.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
