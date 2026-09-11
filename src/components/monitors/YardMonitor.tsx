"use client";

import { Fragment } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";
import { getSeverityColor, getFillBarColor, getColumnCount } from "@/lib/ui";
import type { YardBlock, YardDataWithViolations } from "@/lib/types";

/* ─── SVG Icons ─── */
const ReeferIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" strokeLinecap="round" />
  </svg>
);
const DangerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
  </svg>
);
const ShieldIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EmptyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
  </svg>
);
const NeglectIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ImportIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ExportIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Container20Icon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="7" y="7" width="10" height="10" rx="1" />
  </svg>
);
const Container40Icon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="2" y="7" width="20" height="10" rx="1" />
    <line x1="12" y1="7" x2="12" y2="17" />
  </svg>
);
const AlertIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CranesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <path d="M3 21h18M9 8h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1M3 7l9-4 9 4v14H3V7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Block Card ─── */
const blockStyles: Record<string, { accent: string; header: string }> = {
  DG: { accent: "#be185d", header: "rgba(190,24,93,1)" },
  RF: { accent: "#3b82f6", header: "rgba(59,130,246,1)" },
  EMPTY: { accent: "#94a3b8", header: "rgba(148,163,184,1)" },
  IMP_EXP: { accent: "#4d7c0f", header: "rgba(77,124,15,1)" },
  IMP: { accent: "#0f766e", header: "rgba(15,118,110,1)" },
  EXP: { accent: "#10b981", header: "rgba(16,185,129,1)" },
  CFS: { accent: "#6366f1", header: "rgba(99,102,241,1)" },
  INSP: { accent: "#06b6d4", header: "rgba(6,182,212,1)" },
  NEGLECT: { accent: "#a855f7", header: "rgba(168,85,247,1)" },
  OTHER: { accent: "#64748b", header: "rgba(100,116,139,1)" },
};

function YardBlockCard({
  block,
}: {
  block: YardBlock;
}) {
  const bs = blockStyles[block.blockType] || blockStyles.OTHER;

  const remark = (block.remark || "").toUpperCase();
  const tags: React.ReactElement[] = [];
  if (remark.includes("DG")) tags.push(<DangerIcon key="dg" />);
  if (remark.includes("RF")) tags.push(<ReeferIcon key="rf" />);
  if (remark.includes("EMPTY")) tags.push(<EmptyIcon key="empty" />);
  if (remark.includes("CFS")) tags.push(<CranesIcon key="cfs" />);
  if (remark.includes("INSP")) tags.push(<ShieldIcon key="insp" />);
  if (remark.includes("NEGLECT")) tags.push(<NeglectIcon key="neglect" />);
  if (remark.includes("IMP")) tags.push(<ImportIcon key="imp" />);
  if (remark.includes("EXP")) tags.push(<ExportIcon key="exp" />);

  const sevColor = getSeverityColor(block.maxSeverity);
  const pct = Math.round(block.fillRatio * 100);
  const barWidth = Math.min(Math.max(block.fillRatio * 100, 1), 100);

  return (
    <div
      className="relative flex flex-col rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg nano-card-content bg-[var(--bg-panel)] border border-[var(--border)]"
    >
      {/* Header */}
          <div
            className="flex items-center justify-between px-2 h-8 shrink-0"
            style={{
              background: bs.header,
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
        <div className="flex gap-3 items-center">
          <span className="text-lg font-mono font-black tracking-wider text-white">
            {block.blockId}
          </span>
          {block.violationCount > 0 && (
            <div
              className={`flex items-center gap-1 px-1.5 h-5 rounded-sm text-white border border-white/20 shrink-0 ${
                block.maxSeverity === "CRITICAL" ? "animate-critical-pulse" : ""
              }`}
              style={{ background: sevColor }}
            >
              <ShieldIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-black">
                {block.violationCount}
              </span>
            </div>
          )}
          {block.neglectCount > 0 && (
            <div className="flex items-center gap-1 px-1.5 h-5 rounded-sm bg-purple-600/90 text-white border border-purple-400/30 shrink-0">
              <NeglectIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-black">
                {block.neglectCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-white shrink-0">{tags}</div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-1 nano-card-pivot overflow-hidden">
        <div className="teu-stack-pivot shrink-0 min-h-0">
          <span
            className="font-mono font-black tabular-nums leading-none nano-card-teu-main text-[var(--text-primary)]"
          >
            {block.occupiedTeu.toLocaleString()}
          </span>
          <div className="flex items-baseline gap-1 min-h-0">
            <span
              className="font-mono opacity-40 leading-none nano-card-teu-sub text-[var(--text-primary)]"
            >
              /
            </span>
            <span
              className="font-mono font-bold opacity-60 leading-none nano-card-teu-sub text-[var(--text-primary)]"
            >
              {block.capacityTeu.toLocaleString()}
            </span>
            <span
              className="text-[10px] font-mono font-black uppercase ml-0.5 leading-none shrink-0"
              style={{ color: bs.accent }}
            >
              TEU
            </span>
          </div>
        </div>

        <div className="flex text-[12px] font-mono font-bold items-center shrink-0 min-h-0 horizontal-stack mt-0.5">
          <div className="flex items-center gap-2 min-h-0">
            <Container20Icon className="nano-card-icon opacity-80" />
            <span
              className="tabular-nums nano-card-label text-[var(--text-primary)]"
            >
              {block.cnt20}
            </span>
          </div>
          <div className="flex items-center gap-2 min-h-0">
            <Container40Icon className="nano-card-icon opacity-80" />
            <span
              className="tabular-nums nano-card-label text-[var(--text-primary)]"
            >
              {block.cnt40}
            </span>
          </div>
        </div>

        {block.cntImport > 0 && block.cntExport > 0 && (
          <div className="flex text-[12px] font-mono font-bold items-center mt-0.5 border-t border-[var(--border)]/10 pt-0.5 shrink-0 min-h-0 horizontal-stack">
            <div className="flex items-center gap-2 text-emerald-500 min-h-0">
              <ExportIcon className="nano-card-icon" />
              <span
                className="tabular-nums nano-card-label text-[var(--text-primary)]"
              >
                {block.cntExport}
              </span>
            </div>
            <div className="flex items-center gap-2 text-teal-500 min-h-0">
              <ImportIcon className="nano-card-icon" />
              <span
                className="tabular-nums nano-card-label text-[var(--text-primary)]"
              >
                {block.cntImport}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fill bar */}
      <div
        className="relative h-4 mx-1.5 mb-1.5 rounded-full overflow-hidden shrink-0 bg-[var(--bg-progress)]"
      >
        <div
          className="relative h-full rounded-full transition-all duration-500 overflow-hidden"
          style={{ width: `${barWidth}%`, background: getFillBarColor(block.fillRatio) }}
        >
          <span
            className="absolute right-1.5 top-1/2 text-[10px] font-mono font-black tabular-nums leading-none text-white whitespace-nowrap"
            style={{
              transform: "translateY(-50%)",
              textShadow: "0 1px 2px rgba(0,0,0,0.45)",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Utilization Ring ─── */
function UtilizationRing({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100);
  const color = getFillBarColor(ratio);
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - ratio)}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-mono font-black tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function YardMonitor({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const { data, loading, error, lastUpdated, refresh } = useMonitorData<YardDataWithViolations>({
    url: `/api/yard?terminal=${terminalCode}`,
    interval: 60000,
  });

  const blockCount = data?.blocks.length || 0;

  // Classify blocks
  const specialBlocks = data?.blocks.filter(
    (b) => b.blockType === "DG" || b.blockType === "RF",
  ) || [];
  const highTrafficBlocks = data?.blocks.filter(
    (b) =>
      b.blockType === "IMP" ||
      b.blockType === "EXP" ||
      b.blockType === "IMP_EXP",
  ) || [];
  const auxiliaryBlocks = data?.blocks.filter(
    (b) =>
      b.blockType === "EMPTY" ||
      b.blockType === "INSP" ||
      b.blockType === "CFS" ||
      b.blockType === "NEGLECT" ||
      b.blockType === "OTHER",
  ) || [];

  const categories = [
    {
      label: "Special Containers",
      blocks: specialBlocks,
      dot: "#be185d",
      bg: "rgba(190,24,93,0.08)",
      border: "rgba(190,24,93,0.25)",
    },
    {
      label: "High Traffic",
      blocks: highTrafficBlocks,
      dot: "#059669",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.25)",
    },
    {
      label: "Auxiliary",
      blocks: auxiliaryBlocks,
      dot: "#64748b",
      bg: "rgba(100,116,139,0.08)",
      border: "rgba(100,116,139,0.25)",
    },
  ].filter((c) => c.blocks.length > 0);

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)] select-none"
    >
      <MonitorHeader
        title={`${terminalCode} Yard Monitoring`}
        stats={`${blockCount} Blocks`}
        lastUpdated={lastUpdated}
        error={error}
      />

      <main className="flex-1 min-h-0 flex gap-2 p-2">
        {loading && !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Connecting to Yard Database
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="border border-[var(--accent-discharge)] bg-red-50 px-8 py-6 text-center max-w-md">
              <div className="text-xs font-bold font-mono text-[var(--accent-discharge)] uppercase tracking-widest mb-2">
                Connection Fault
              </div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">
                {error}
              </p>
              <button
                onClick={refresh}
                className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-[var(--accent-discharge)] hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data ? (
          <Fragment>
            {/* Block Grid */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 overflow-hidden">
              {categories.map((cat) => {
                const cols = getColumnCount(cat.blocks.length);
                const rows = Math.ceil(cat.blocks.length / cols);
                return (
                  <div
                    key={cat.label}
                    className="flex flex-col min-h-0 rounded-lg overflow-hidden animate-zone-breathe"
                    style={{
                      flex: rows,
                      background: cat.bg,
                      border: `2px solid ${cat.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: cat.dot }}
                      />
                      <span className="text-xs font-mono font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
                        {cat.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] bg-black/10 dark:bg-white/10 px-1.5 rounded-full">
                        {cat.blocks.length}
                      </span>
                    </div>
                    <div className="flex-1 min-h-0 px-1.5 pb-1.5">
                      <div
                        className="grid gap-1.5 h-full w-full"
                        style={{
                          gridTemplateColumns: `repeat(${cols}, 1fr)`,
                          gridAutoRows: "1fr",
                        }}
                      >
                        {cat.blocks.map((block) => (
                          <YardBlockCard
                            key={block.blockId}
                            block={block}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <aside className="w-[20%] min-w-[220px] max-w-[280px] flex flex-col gap-2 shrink-0">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col items-center gap-2">
                <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)]">
                  Terminal Utilization
                </div>
                <UtilizationRing
                  ratio={data.summary.overallFillRatio}
                />
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-mono font-black text-[var(--text-primary)] tabular-nums">
                      {data.summary.totalOccupied.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] opacity-60">
                      /
                    </span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-mono font-bold text-[var(--text-secondary)] tabular-nums">
                        {data.summary.totalCapacity.toLocaleString()}
                      </span>
                      <span className="text-sm font-mono font-bold text-[var(--text-secondary)] uppercase tracking-tight ml-0.5">
                        TEU
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-[var(--border)] my-1" />

              <div className="w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <ReeferIcon className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold uppercase">
                      Reefers
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">
                    {data.summary.reeferCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" style={{ color: "#be185d" }}>
                    <DangerIcon className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold uppercase">
                      Dangerous
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">
                    {data.summary.dgCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-500">
                    <NeglectIcon className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold uppercase">
                      Neglect
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-[var(--text-primary)] tabular-nums">
                    {data.summary.neglectCount}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col gap-2 shrink-0">
                <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)] flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <AlertIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>Alert Summary</span>
                  </div>
                  <span className="text-[var(--accent-discharge)]">
                    {data.summary.totalViolations}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-1 rounded bg-red-500/10 border border-red-500/20">
                    <span className="text-xs font-black text-red-500">
                      {data.summary.criticalCount}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-red-400">
                      Crit
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-1 rounded bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs font-black text-orange-500">
                      {data.summary.highCount}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-orange-400">
                      High
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-1 rounded bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-xs font-black text-yellow-500">
                      {data.summary.mediumCount}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-yellow-400">
                      Med
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority Alerts */}
              {data.violations && data.violations.length > 0 && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3 flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
                  <div className="text-xs font-mono font-black uppercase tracking-widest text-[var(--text-primary)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-1">
                      <AlertIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>Priority Alerts</span>
                    </div>
                    <span className="text-[var(--accent-discharge)]">{data.violations.length}</span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
                    {data.violations.map((v, i) => {
                      const sevColor = v.severity === "CRITICAL" ? "#ef4444" : v.severity === "HIGH" ? "#f97316" : "#eab308";
                      return (
                        <div
                          key={`${v.cntrNo}-${i}`}
                          className="flex items-start gap-2 p-2 rounded border border-[var(--border-light)] bg-[var(--bg-panel)] hover:bg-[var(--bg-nav-hover)] transition-colors"
                        >
                          <span
                            className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 text-white"
                            style={{ background: sevColor }}
                          >
                            {v.severity.charAt(0)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">
                                {v.cntrNo}
                              </span>
                              <span className="text-[8px] font-mono text-[var(--text-tertiary)]">
                                {v.type}
                              </span>
                            </div>
                            <div className="text-[8px] font-mono text-[var(--text-secondary)] truncate">
                              {v.description}
                            </div>
                            <span className="text-[8px] font-mono font-bold text-[var(--text-tertiary)]">
                              Block: {v.block}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {data.violations && data.violations.length === 0 && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2 shrink-0">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                    All Clear — Safe State
                  </span>
                </div>
              )}
            </aside>
          </Fragment>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-[var(--border)] px-12 py-8 text-center rounded-lg">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2 text-[var(--text-tertiary)]">
                No Active Yard Data
              </div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                No yard data available. Updates automatically.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
