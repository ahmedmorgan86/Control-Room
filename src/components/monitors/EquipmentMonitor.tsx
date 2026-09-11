"use client";

import { Fragment } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";
import { getTTTColor } from "@/lib/equipmentUtils";
import type { QCGroup, YardSection, EquipmentData } from "@/lib/types";

/* ─── SVG Icons ─── */
const CraneIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <path d="M3 21h18M9 8h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1M3 7l9-4 9 4v14H3V7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const YardIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
  </svg>
);
const PersonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function EquipmentTypeIcon({ type, className = "w-5 h-5", style }: { type: string; className?: string; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    QC: "M3 21h18M9 8h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1M3 7l9-4 9 4v14H3V7z",
    YT: "M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z",
    RTG: "M4 6h16M4 10h16M12 10v11M8 21h8M6 6l6-4 6 4",
    RS: "M4 6h16M12 6v6M8 12h8M6 18h12M9 12l-3 6M15 12l3 6",
    TL: "M4 6h16M12 6v8M8 14h8M6 18h12",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} style={style}>
      <path d={paths[type] || paths.QC} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Equipment Card ─── */
function EquipmentCard({
  card,
  accent,
  index,
}: {
  card: YardSection["cards"][0];
  accent: string;
  index: number;
}) {
  const isOnline = card.isOnline !== false;
  const ttt = card.tttMinutes;
  const tttColor = ttt !== undefined ? getTTTColor(ttt) : null;

  return (
    <div
      className="flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300 hover:scale-[1.02] bg-[var(--bg-panel)] border-[var(--border-light)]"
      style={{
        animationDelay: `${index * 50}ms`,
        opacity: 0,
        animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`,
      }}
    >
      <div className="flex items-center gap-1 mb-1">
        <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
        <span className="text-[10px] font-mono font-black text-[var(--text-primary)] leading-none">
          {card.displayName || card.equNo}
        </span>
      </div>
      {card.driverName && (
        <div className="flex items-center gap-1 mt-0.5">
          <PersonIcon className="w-3 h-3 text-[var(--text-tertiary)]" />
          <span className="text-[8px] font-mono text-[var(--text-secondary)] truncate max-w-[80px]">
            {card.driverName}
          </span>
        </div>
      )}
      {card.position && (
        <span
          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full mt-1"
          style={{ background: `${accent}20`, color: accent }}
        >
          {card.position}
        </span>
      )}
      {ttt !== undefined && tttColor && (
        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 ${tttColor.bg} ${tttColor.text} border ${tttColor.border} ${tttColor.shadow}`}>
          {ttt}m TTT
        </span>
      )}
      {card.movesLastHour !== undefined && card.movesLastHour > 0 && (
        <span className="text-[8px] font-mono font-bold text-[var(--text-secondary)] mt-1">
          {card.movesLastHour} MPH
        </span>
      )}
    </div>
  );
}

/* ─── QC Group Row ─── */
function QCGroupRow({
  group,
  maxColumns,
}: {
  group: QCGroup;
  maxColumns: number;
}) {
  const isConflicting = ["QC09", "QC82"].includes(group.qcNo);
  const accent = isConflicting ? "#F59E0B" : "#0046af";
  const bg = isConflicting ? "rgba(255,248,220,1)" : "rgba(185,210,245,1)";
  const gradient = `linear-gradient(90deg, ${accent} 0%, ${accent} 120px, ${bg} 260px, ${bg} 100%)`;

  return (
    <div
      className="w-full flex items-stretch min-h-[72px] rounded-xl overflow-hidden border-2 shadow-md"
      style={{ background: gradient, borderColor: accent }}
    >
      <div className="flex flex-1 max-w-[280px] items-center justify-between p-3 shrink-0 relative overflow-hidden">
        <CraneIcon className="absolute -right-10 -bottom-17 w-44 h-44 text-black/10 -rotate-12" />
        <div className="relative z-10 flex flex-col justify-center h-full">
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-mono font-black text-white tracking-tighter leading-none drop-shadow-sm">
              {group.qcNo}
            </span>
            <div className="flex items-baseline gap-1.5 bg-black/20 px-3 py-1 rounded-md shadow-inner">
              <span className="text-3xl font-mono font-black text-white leading-none">
                {group.qcCard.movesLastHour}
              </span>
              <span className="text-[10px] font-mono font-black text-white/40 tracking-widest uppercase">
                MPH
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="p-0.5 rounded-full bg-white/10">
              <PersonIcon className="w-3.5 h-3.5 text-white/70" />
            </div>
            <span className="text-sm font-mono font-black text-white/90 tracking-wide uppercase truncate max-w-[160px]">
              {group.qcCard.driverName || "NO DRIVER"}
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex-1 grid gap-2 pt-2 px-2 pb-0 overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${maxColumns}, 1fr)` }}
      >
        {group.ytCards.length > 0 ? (
          group.ytCards.map((yt) => (
            <EquipmentCard
              key={yt.equNo}
              card={{ ...yt, equNo: yt.equNo, status: yt.jobStatus, equType: "YT" }}
              accent="#10b981"
              index={0}
            />
          ))
        ) : (
          <div className="col-span-full flex items-center gap-8 pl-4">
            <div className="flex items-center gap-4 opacity-20">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-mono font-black uppercase tracking-[0.2em]">
                No Trucks Assigned
              </span>
            </div>
            {group.pendingOrdersCount > 0 && (
              <div className="flex items-center gap-4 bg-black/10 px-5 py-2 rounded-lg border border-black/5 shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-mono font-black text-white leading-none drop-shadow-sm">
                    {group.pendingOrdersCount}
                  </span>
                  <span className="text-[8px] font-mono font-black text-white/50 uppercase tracking-widest mt-1">
                    Pending
                  </span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <span className="text-[10px] font-mono font-black text-white/70 uppercase tracking-wider leading-tight max-w-[120px]">
                  Orders waiting for transport
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── QC No-Trucks Row ─── */
function QCNoTrucksRow({ group }: { group: QCGroup }) {
  const isConflicting = ["QC09", "QC82"].includes(group.qcNo);
  const accent = isConflicting ? "#F59E0B" : "#0046af";

  return (
    <div
      className="w-[300px] flex items-center justify-between pl-6 pr-3 rounded-xl border-2 shadow-md relative overflow-hidden min-h-[72px] shrink-0"
      style={{ background: accent, borderColor: accent }}
    >
      <CraneIcon className="absolute -right-4 -bottom-8 w-32 h-32 text-black/10 -rotate-12" />
      <div className="relative z-10 flex flex-col justify-center">
        <span className="text-4xl font-mono font-black text-white tracking-tighter leading-none mb-1 drop-shadow-sm">
          {group.qcNo}
        </span>
        <div className="flex items-center gap-2">
          <div className="p-0.5 rounded-full bg-white/10">
            <PersonIcon className="w-3 h-3 text-white/60" />
          </div>
          <span className="text-[10px] font-mono font-black text-white/80 uppercase truncate max-w-[100px]">
            {group.qcCard.driverName || "No Driver"}
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="bg-black/20 w-[68px] h-[68px] rounded-xl flex flex-col items-center justify-center border border-white/10 shadow-inner">
          <span className="text-3xl font-mono font-black text-white leading-none drop-shadow-sm">
            {group.pendingOrdersCount}
          </span>
          <span className="text-[10px] font-mono font-black text-white/80 uppercase tracking-[0.05em] mt-1">
            Pending
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Yard Section Card ─── */
function YardSectionCard({
  section,
}: {
  section: YardSection;
}) {
  const accent = section.accent || section.accentColor || "#64748b";

  return (
    <div
      className="flex-1 min-h-0 flex flex-col gap-1.5 rounded-lg p-2"
      style={{
        background: `color-mix(in oklab, ${accent} 5%, transparent)`,
        border: `1.5px solid color-mix(in oklab, ${accent} 20%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2 px-0.5 shrink-0">
        <EquipmentTypeIcon type={section.equType} className="w-4 h-4" style={{ color: accent }} />
        <span className="text-xs font-mono font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
          {section.label || section.equType}
        </span>
        <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] bg-black/10 dark:bg-white/10 px-1.5 rounded-full">
          {section.cards.length}
        </span>
      </div>
      <div className="flex-1 min-h-0 grid gap-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
        {section.cards.map((card, i) => (
          <EquipmentCard key={card.equNo} card={card} accent={accent} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function EquipmentMonitor({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const { data, loading, error, lastUpdated, refresh } = useMonitorData<EquipmentData>({
    url: `/api/equipment?terminal=${terminalCode}`,
    interval: 30000,
  });

  const hasQC = (data?.qcGroups.length ?? 0) > 0;
  const hasYard = (data?.yardSections.length ?? 0) > 0;
  const activeQC = data?.qcGroups.filter((g) => g.ytCards.length > 0) ?? [];
  const idleQC = data?.qcGroups.filter((g) => g.ytCards.length === 0) ?? [];
  const maxColumns = Math.max(5, ...activeQC.map((g) => g.ytCards.length));
  const maxRows = Math.max(1, activeQC.length + Math.ceil(idleQC.length / 4));

  const cssVars = {
    "--qc-row-height": `clamp(58px, calc((48vh - 24px) / ${maxRows}), 96px)`,
  } as React.CSSProperties;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]" style={cssVars}>
      <MonitorHeader
        title={`${terminalCode} Equipment Monitor`}
        stats={data ? `${data.totalActive} Active · ${data.totalOnline} Online · ${data.qcGroups.length} QC Ops` : undefined}
        lastUpdated={lastUpdated}
        error={error}
      />

      <main className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-2">
        {loading && !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Connecting to Equipment Database
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-red-400 bg-red-50 dark:bg-red-900/20 px-8 py-6 text-center max-w-md rounded-lg">
              <div className="text-xs font-bold font-mono text-red-500 uppercase tracking-widest mb-2">
                Connection Fault
              </div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data && (hasQC || hasYard) ? (
          <div className="flex-1 flex flex-col gap-[clamp(4px,0.8vh,12px)] min-h-0">
            <div className="flex flex-col gap-[clamp(4px,0.7vh,10px)] shrink-0">
              <div className="flex items-center gap-2 px-1">
                <CraneIcon className="w-4 h-4 text-[var(--accent-blue)]" />
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Vessel Operations
                </h2>
                <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
              </div>
              <div className="flex flex-col gap-[clamp(4px,0.6vh,8px)] min-h-0">
                {hasQC ? (
                  <Fragment>
                    {activeQC.map((group) => (
                      <QCGroupRow key={group.qcNo} group={group} maxColumns={maxColumns} />
                    ))}
                    {idleQC.length > 0 && (
                      <div className="flex flex-wrap gap-2 w-full">
                        {idleQC.map((group) => (
                          <QCNoTrucksRow key={group.qcNo} group={group} />
                        ))}
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-[var(--border)] rounded-xl opacity-40">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                      No Active Vessel Operations
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 mt-2">
              <YardIcon className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                Yard Operations
              </h2>
              <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {hasYard ? (
                <div className="flex-1 grid grid-cols-9 gap-2 items-stretch overflow-hidden">
                  {(() => {
                    const sections = data!.yardSections;
                    const combined: YardSection[] = [];
                    let support: YardSection | null = null;
                    let ytSection: YardSection | null = null;
                    let rtgSection: YardSection | null = null;

                    sections.forEach((s) => {
                      if (s.equType === "RS" || s.equType === "TL") {
                        if (!support) {
                          support = { equType: "SUPPORT", label: "Reach Stackers and Toplifts", accent: "#8b5cf6", accentColor: "#8b5cf6", cards: [] };
                        }
                        support!.cards.push(...s.cards);
                      } else if (s.equType === "YT") ytSection = s;
                      else if (s.equType === "RTG") rtgSection = s;
                    });

                    if (ytSection) combined.push(ytSection);
                    if (rtgSection) combined.push(rtgSection);
                    if (support) combined.push(support);

                    return combined.map((section) => {
                      let colSpan = "col-span-2";
                      if (section.equType === "YT") colSpan = "col-span-3";
                      else if (section.equType === "RTG") colSpan = "col-span-4";
                      return (
                        <div key={section.equType} className={`${colSpan} h-full`}>
                          <YardSectionCard section={section} />
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-40">
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                    No Active Yard Equipment
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-[var(--border)] px-12 py-8 text-center rounded-lg">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2 text-[var(--text-tertiary)]">
                No Active Equipment
              </div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                No equipment with pending jobs. Updates automatically.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
