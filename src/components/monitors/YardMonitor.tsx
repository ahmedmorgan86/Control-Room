"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BlockType, YardBlock, YardData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { Ring } from "@/components/ui";
import { BLOCK_COLORS, SEVERITY_COLORS } from "@/lib/ui";
import { playCriticalAlert } from "@/lib/alertSound";
import { MonitorHeader } from "@/components/MonitorHeader";

function BlockCard({ block }: { block: YardBlock }) {
  const color = BLOCK_COLORS[block.blockType];
  const sevColor = block.maxSeverity ? SEVERITY_COLORS[block.maxSeverity] : null;
  const isCritical = block.maxSeverity === "CRITICAL";

  return (
    <div
      className={`flex flex-col bg-[var(--bg-panel)] border rounded-sm p-2 gap-1 overflow-hidden ${isCritical ? "animate-critical-pulse" : ""}`}
      style={{ borderColor: block.violationCount > 0 && sevColor ? sevColor : "var(--border-light)", boxShadow: block.violationCount > 0 && sevColor ? `0 0 8px ${sevColor}33` : undefined }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
          <span className="font-mono font-black text-sm text-[var(--text-primary)]">{block.blockId}</span>
        </div>
        <div className="flex items-center gap-1">
          {block.maxSeverity && sevColor && (
            <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase" style={{ backgroundColor: `${sevColor}22`, color: sevColor }}>
              {block.maxSeverity}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center gap-1 py-1">
          <Ring ratio={block.fillRatio} size={56} stroke={6} />
          <div className="text-center">
            <div className="font-mono font-bold text-lg leading-none text-[var(--text-primary)] tabular-nums">
              {block.occupiedTeu}
              <span className="text-[var(--text-tertiary)] text-sm"> / {block.capacityTeu}</span>
            </div>
            <div className="text-[8px] font-mono uppercase text-[var(--text-tertiary)]">TEU</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {block.violationCount > 0 && (
            <span className="text-[9px] font-mono text-[var(--accent-discharge)]">⚠ {block.violationCount}</span>
          )}
          {block.neglectCount > 0 && (
            <span className="text-[9px] font-mono text-[var(--beacon)]">Neglect {block.neglectCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

const BLOCK_ORDER: BlockType[] = ["DG", "RF", "EMPTY", "IMP_EXP", "IMP", "EXP", "CFS", "INSP", "NEGLECT", "OTHER"];

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

  const grouped = useMemo(() => {
    const m = new Map<BlockType, YardBlock[]>();
    if (!data) return m;
    for (const b of data.blocks) {
      const list = m.get(b.blockType) ?? [];
      list.push(b);
      m.set(b.blockType, list);
    }
    return m;
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
  const showTypes = BLOCK_ORDER.filter((t) => grouped.has(t));

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
            {showTypes.map((type) => (
              <div key={type} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: BLOCK_COLORS[type] }} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">{type}</span>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{grouped.get(type)?.length}</span>
                </div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(3, Math.min(6, grouped.get(type)?.length ?? 3))}, minmax(120px,1fr))`,
                  }}
                >
                  {grouped.get(type)!.map((b) => (
                    <BlockCard key={b.blockId} block={b} />
                  ))}
                </div>
              </div>
            ))}
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
                  <span className="text-xs font-mono font-bold uppercase">Reefers</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.reeferCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: "#be185d" }}>
                  <span className="text-xs font-mono font-bold uppercase">Dangerous</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.dgCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-500">
                  <span className="text-xs font-mono font-bold uppercase">Neglect</span>
                </div>
                <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">{summary.neglectCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col gap-2 shrink-0">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)] flex justify-between items-center">
              <span>Alert Summary</span>
              <span className="text-[var(--accent-discharge)]">{summary.totalViolations}</span>
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
