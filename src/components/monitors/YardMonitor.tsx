"use client";

import { useMemo } from "react";
import type { YardData, BlockType, Violation } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, BLOCK_COLORS } from "@/lib/ui";
import { useMouseTilt } from "@/lib/useMouseTilt";
import { MonitorHeader } from "@/components/MonitorHeader";

const CATS: { label: string; types: BlockType[]; color: string }[] = [
  { label: "Special Containers", types: ["DG", "RF"], color: "#ef4444" },
  { label: "High Traffic", types: ["IMP", "EXP", "IMP_EXP"], color: "#10b981" },
  { label: "Auxiliary", types: ["EMPTY", "CFS", "INSP", "NEGLECT", "OTHER"], color: "#64748b" },
];

function Gauge({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100);
  const C = 2 * Math.PI * 50;
  const off = C * (1 - ratio);
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  return (
    <div className="relative w-24 h-24 mx-auto animate-float">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="7" strokeDasharray={C} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-mono font-black" style={{ color }}>{pct}%</span>
        <span className="text-[6px] font-mono text-[var(--text-dim)] uppercase tracking-widest">Capacity</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
      <span className="text-[8px] font-mono text-[var(--text-dim)] uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function Alert({ v, i }: { v: Violation; i: number }) {
  const c = v.severity === "CRITICAL" ? "#ef4444" : v.severity === "HIGH" ? "#f97316" : v.severity === "MEDIUM" ? "#eab308" : "#475569";
  return (
    <div className={`flex items-start gap-1.5 py-1 border-b border-white/[0.03] last:border-0 animate-slide-up d${(i % 8) + 1}`}>
      <span className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ backgroundColor: c }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono font-bold text-[var(--text-bright)]">{v.cntrNo}</span>
          <span className="text-[7px] font-mono text-[var(--text-dim)]">{v.block}</span>
        </div>
        <p className="text-[7px] font-mono text-[var(--text-secondary)] truncate">{v.description}</p>
      </div>
      <span className="text-[6px] px-1 py-px rounded font-bold shrink-0" style={{ backgroundColor: `${c}18`, color: c }}>{v.severity}</span>
    </div>
  );
}

function Block({ b, i }: { b: YardData["blocks"][0]; i: number }) {
  const pct = Math.round(b.fillRatio * 100);
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  const t = useMouseTilt(3);

  return (
    <div
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className={`card-3d-sm bg-[var(--bg-surface)] border border-white/[0.05] rounded-xl p-2 shadow-depth-1 cursor-pointer animate-fade-up d${(i % 10) + 1}`}
      style={t.style}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-mono font-bold text-[var(--text-bright)]">{b.blockId}</span>
        <span className="text-[6px] font-mono px-1 py-px rounded" style={{ backgroundColor: `${BLOCK_COLORS[b.blockType]}18`, color: BLOCK_COLORS[b.blockType], border: `1px solid ${BLOCK_COLORS[b.blockType]}30` }}>{b.blockType}</span>
      </div>
      <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full progress-glow" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[7px] font-mono text-[var(--text-dim)] mt-0.5">
        <span>{formatCount(b.occupiedTeu)}/{formatCount(b.capacityTeu)}</span>
        <span style={{ color }} className="font-bold">{pct}%</span>
      </div>
      {b.violationCount > 0 && <div className="text-[6px] font-mono text-[var(--red)] mt-0.5">{b.violationCount} violations</div>}
    </div>
  );
}

export function YardMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<YardData>(`/api/yard?terminal=${terminalCode}`, 60000);
  const blocks = data?.blocks ?? [];
  const violations = data?.violations ?? [];
  const summary = data?.summary;

  const byCat = useMemo(() => {
    const m: Record<string, typeof blocks> = {};
    for (const c of CATS) m[c.label] = blocks.filter((b) => c.types.includes(b.blockType));
    return m;
  }, [blocks]);

  const crits = useMemo(() => violations.filter((v) => v.severity === "CRITICAL" || v.severity === "HIGH").slice(0, 8), [violations]);

  if (loading && !data) return (
    <>
      <MonitorHeader title={`${terminalCode} Yard Monitor`} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[var(--cyan)] rounded-full animate-spin mb-3" />
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-dim)]">Loading</p>
      </div>
    </>
  );

  if (error && !data) return (
    <>
      <MonitorHeader title={`${terminalCode} Yard Monitor`} />
      <div className="flex-1 flex items-center justify-center">
        <div className="glass rounded-2xl px-10 py-6 text-center card-3d gradient-border">
          <div className="text-[10px] font-bold font-mono text-[var(--red)] uppercase tracking-[0.2em] mb-1">Connection Fault</div>
          <p className="text-[11px] font-mono text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <MonitorHeader title={`${terminalCode} Yard Monitor`} stats={<div className="flex items-center gap-3 text-[10px] font-mono"><span className="text-[var(--text-secondary)]">{formatCount(blocks.length)} Blocks</span>{summary && <><span className="text-[var(--cyan)]">{summary.totalViolations} Violations</span><span className="text-[var(--red)]">{summary.criticalCount} Critical</span></>}</div>} lastUpdated={lastUpdated} />
      <main className="flex-1 min-h-0 p-3 overflow-hidden flex items-center justify-center perspective-root bg-mesh bg-grid">
        <div className="max-w-[1920px] mx-auto w-full flex gap-3 h-full items-center">
          {/* Left: Blocks */}
          <div className="flex-1 min-w-0 space-y-2.5 overflow-y-auto">
            {CATS.map((cat) => {
              const cb = byCat[cat.label] ?? [];
              if (cb.length === 0) return null;
              return (
                <section key={cat.label}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-0.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">{cat.label}</h3>
                    <span className="text-[8px] font-mono text-[var(--text-dim)]">({cb.length})</span>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-1.5">
                    {cb.map((b, i) => <Block key={b.blockId} b={b} i={i} />)}
                  </div>
                </section>
              );
            })}
            {blocks.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="glass rounded-2xl px-12 py-8 text-center card-3d gradient-border">
                  <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] mb-1">No Yard Data</div>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)]">Waiting for yard blocks.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="w-56 shrink-0 space-y-2 overflow-y-auto">
            <div className="bg-[var(--bg-surface)] border border-white/[0.06] rounded-2xl p-3 card-3d shadow-depth-2 animate-fade-right gradient-border">
              <h4 className="text-[8px] font-mono font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2 text-center">Utilization</h4>
              {summary && <Gauge ratio={summary.overallFillRatio} />}
              {summary && (
                <div className="mt-2">
                  <Stat label="TEU" value={formatCount(summary.totalOccupied)} color="var(--cyan)" />
                  <Stat label="Reefers" value={summary.reeferCount} color="#06b6d4" />
                  <Stat label="Dangerous" value={summary.dgCount} color="var(--red)" />
                  <Stat label="Neglect" value={summary.neglectCount} color="var(--purple)" />
                </div>
              )}
            </div>

            <div className="bg-[var(--bg-surface)] border border-white/[0.06] rounded-2xl p-3 card-3d shadow-depth-2 animate-fade-right d2 gradient-border">
              <h4 className="text-[8px] font-mono font-bold text-[var(--text-dim)] uppercase tracking-[0.2em] mb-2">Alert Summary</h4>
              {summary && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[["Critical", summary.criticalCount, "#ef4444"], ["High", summary.highCount, "#f97316"], ["Medium", summary.mediumCount, "#eab308"], ["Total", summary.totalViolations, "#64748b"]].map(([l, v, c]) => (
                    <div key={l as string} className="rounded-lg p-1.5 text-center" style={{ backgroundColor: `${c}08`, border: `1px solid ${c}20` }}>
                      <span className="text-xs font-mono font-black block" style={{ color: c as string }}>{v as number}</span>
                      <span className="text-[6px] font-mono uppercase" style={{ color: c as string }}>{l as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {crits.length > 0 && (
              <div className="bg-[var(--bg-surface)] border border-[var(--red)]/15 rounded-2xl p-3 card-3d shadow-depth-2 animate-fade-right d3">
                <h4 className="text-[8px] font-mono font-bold text-[var(--red)] uppercase tracking-[0.2em] mb-1.5">Priority Alerts</h4>
                <div className="space-y-0 max-h-40 overflow-y-auto">
                  {crits.map((v, i) => <Alert key={i} v={v} i={i} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
