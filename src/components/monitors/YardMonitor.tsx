"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BlockType, Terminal, YardBlock, YardData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { Ring, LiveStatus } from "@/components/ui";
import { BLOCK_COLORS, SEVERITY_COLORS, formatCount } from "@/lib/ui";
import { playCriticalAlert } from "@/lib/alertSound";
import { ScreenIcon } from "@/components/ScreenIcon";

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

export function YardMonitor({ terminal }: { terminal: Terminal }) {
  const { data, loading, error, lastUpdated, now } = usePolling<YardData>(`/api/yard?terminal=${terminal}`, 60000);
  const [muted, setMuted] = useState(false);
  const knownCriticalRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!data) return;
    const currentCritical = new Set(
      data.violations.filter((v) => v.severity === "CRITICAL").map((v) => `${v.cntrNo}|${v.type}`),
    );
    const previous = knownCriticalRef.current;
    // Skip the very first load — only alert on violations that appear
    // *after* the screen has already established a baseline.
    if (previous) {
      const hasNew = [...currentCritical].some((key) => !previous.has(key));
      if (hasNew && !muted) playCriticalAlert();
    }
    knownCriticalRef.current = currentCritical;
  }, [data, muted]);

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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs font-mono text-[var(--accent-discharge)]">
        Failed to load yard: {error}
      </div>
    );
  }
  if (!data) return null;

  const summary = data.summary;
  const showTypes = BLOCK_ORDER.filter((t) => grouped.has(t));

  return (
    <div className="flex-1 min-h-0 flex gap-3 p-3">
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
            <ScreenIcon kind="YARD" className="w-6 h-6" style={{ color: "var(--signal)" }} />
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--safe)] animate-pulse-dot" />
            Yard Overview
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">Fill {Math.round(summary.overallFillRatio * 100)}%</span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">Active {formatCount(summary.totalOccupied)}/{formatCount(summary.totalCapacity)}</span>
            <LiveStatus lastUpdated={lastUpdated} now={now} error={error} intervalMs={60000} />
          </div>
        </div>

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

      <div className="w-[300px] shrink-0 flex flex-col gap-2">
        <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">Summary</div>
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border transition-colors"
              style={{
                color: muted ? "var(--text-tertiary)" : "var(--signal)",
                borderColor: muted ? "var(--border)" : "var(--signal)",
              }}
              title={muted ? "Critical alert sound is off" : "Critical alert sound is on"}
            >
              {muted ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2 2m0-4l-2 2M9 9v6h4l5 5V4l-5 5H9z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M9 9v6h4l5 5V4l-5 5H9z" />
                </svg>
              )}
              {muted ? "Muted" : "Alerts On"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label="Total Violations" value={summary.totalViolations} color="var(--accent-discharge)" />
            <Stat label="Critical" value={summary.criticalCount} color="var(--distress)" />
            <Stat label="High" value={summary.highCount} color={SEVERITY_COLORS.HIGH} />
            <Stat label="Medium" value={summary.mediumCount} color="var(--beacon)" />
            <Stat label="Reefer" value={summary.reeferCount} color={BLOCK_COLORS.RF} />
            <Stat label="DG" value={summary.dgCount} color={BLOCK_COLORS.DG} />
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-sm overflow-hidden flex flex-col">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-light)]">
            Violations ({data.violations.length})
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {data.violations.map((v, i) => (
              <div key={i} className="px-3 py-1.5 border-b border-[var(--border-light)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[var(--text-primary)]">{v.cntrNo}</span>
                  <span
                    className="text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase"
                    style={{ backgroundColor: `${SEVERITY_COLORS[v.severity]}22`, color: SEVERITY_COLORS[v.severity] }}
                  >
                    {v.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-secondary)] mt-0.5">
                  <span>{v.description}</span>
                  <span className="text-[var(--text-tertiary)]">Block {v.block} · {v.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--bg-header)] rounded p-2">
      <div className="font-mono font-black text-lg leading-none tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[8px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mt-0.5">{label}</div>
    </div>
  );
}
