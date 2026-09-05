"use client";

import { useMemo } from "react";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import type { EquCard, EquType, EquipmentData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { EQU_ACCENTS } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

function getBlockTypeColor(blockType: string | null | undefined): string {
  if (!blockType) return "var(--text-tertiary)";
  const b = blockType.toUpperCase();
  if (b === "DG") return "#be185d";
  if (b === "RF") return "#3b82f6";
  if (b === "EMPTY") return "#94a3b8";
  if (b === "IMP" || b === "EXP" || b === "IMP_EXP") return "#10b981";
  return "var(--accent-blue)";
}

function getStatusIndicator(card: EquCard) {
  if (card.isOnline) {
    return (
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[var(--safe)] opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--safe)]" />
      </span>
    );
  }
  if (card.driverName) {
    return (
      <span className="flex items-center gap-1">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
      </span>
    );
  }
  return (
    <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-[var(--text-tertiary)]/20 text-[var(--text-tertiary)]">
      Offline
    </span>
  );
}

function getTTTBadgeStyle(minutes: number | null | undefined): { bg: string; text: string; shadow: string; border: string } {
  if (minutes == null) return { bg: "rgba(0,0,0,0.3)", text: "var(--text-tertiary)", shadow: "", border: "" };
  if (minutes >= 30) return { bg: "#dc2626", text: "#fff", shadow: "0 0 8px rgba(220,38,38,0.4)", border: "1px solid rgba(220,38,38,0.5)" };
  if (minutes >= 20) return { bg: "#ea580c", text: "#fff", shadow: "0 0 8px rgba(234,88,12,0.4)", border: "1px solid rgba(234,88,12,0.5)" };
  if (minutes >= 10) return { bg: "#d97706", text: "#fff", shadow: "0 0 8px rgba(217,119,6,0.4)", border: "1px solid rgba(217,119,6,0.5)" };
  return { bg: "rgba(0,0,0,0.3)", text: "var(--text-secondary)", shadow: "", border: "" };
}

function getMPHColor(mph: number): string {
  if (mph >= 25) return "var(--accent-loading)";
  if (mph >= 15) return "var(--accent-blue)";
  if (mph > 0) return "#D97706";
  return "var(--text-tertiary)";
}

function EquCardRich({ card }: { card: EquCard }) {
  const accent = EQU_ACCENTS[card.equType] ?? "var(--text-tertiary)";
  const posColor = getBlockTypeColor(card.position);
  const tttBadge = getTTTBadgeStyle(card.tttMinutes);

  return (
    <div className="relative flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden shadow-md shadow-black/5 hover:shadow-lg transition-shadow">
      {/* Gradient background */}
      <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${accent} 0%, transparent 60%)` }} />

      {/* Watermark icon */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.06] pointer-events-none">
        <EquipmentIcon equType={card.equType} className="w-16 h-16" style={{ color: accent }} />
      </div>

      {/* Content */}
      <div className="relative p-2.5 flex flex-col gap-1.5">
        {/* Top row: icon + name + status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <EquipmentIcon equType={card.equType} className="w-7 h-7 shrink-0" style={{ color: accent }} />
            <div className="min-w-0">
              <div className="font-mono font-black text-sm text-[var(--text-primary)] uppercase tracking-wide truncate">
                {card.displayName}
              </div>
              <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate uppercase">
                {card.driverName ?? "NO DRIVER"}
                {!card.driverName && (
                  <svg className="w-3 h-3 inline ml-1 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          {getStatusIndicator(card)}
        </div>

        {/* Position + Job Type + TTT */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.position && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm text-white" style={{ backgroundColor: posColor }}>
              {card.position}
            </span>
          )}
          {card.jobType && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase" style={{ backgroundColor: `${accent}22`, color: accent }}>
              {card.jobType}
            </span>
          )}
          {card.tttMinutes != null && (
            <span className="flex items-center gap-0.5 text-[9px] font-mono font-black px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: tttBadge.bg, color: tttBadge.text, boxShadow: tttBadge.shadow, border: tttBadge.border }}>
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {Math.round(card.tttMinutes)}m
            </span>
          )}
        </div>

        {/* MPH large display */}
        <div className="flex items-center justify-between">
          <div className="bg-black/20 px-2 py-0.5 rounded shadow-inner border border-black/25">
            <span className="font-mono font-black tabular-nums" style={{ fontSize: "clamp(14px, 1.1vw, 20px)", color: getMPHColor(card.movesLastHour) }}>
              {card.movesLastHour}
            </span>
            <span className="text-[8px] font-mono font-bold uppercase text-[var(--text-tertiary)] ml-1">MPH</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function YTCardCompact({ card }: { card: EquCard }) {
  const accent = EQU_ACCENTS[card.equType] ?? "var(--text-tertiary)";
  const tttBadge = getTTTBadgeStyle(card.tttMinutes);

  return (
    <div className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border-light)] rounded p-2 gap-1 min-w-[120px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 min-w-0">
          <EquipmentIcon equType={card.equType} className="w-7 h-7 shrink-0" style={{ color: accent }} />
          <span className="font-mono font-bold text-[10px] text-[var(--text-primary)] truncate">{card.displayName}</span>
        </span>
        {getStatusIndicator(card)}
      </div>
      <div className="text-[9px] font-mono text-[var(--text-secondary)] truncate">{card.driverName ?? "NO DRIVER"}</div>
      <div className="flex items-center justify-between text-[9px] font-mono">
        {card.position && (
          <span className="px-1 rounded text-[8px] font-bold uppercase text-white" style={{ backgroundColor: getBlockTypeColor(card.position) }}>
            {card.position}
          </span>
        )}
        {card.tttMinutes != null && (
          <span className="flex items-center gap-0.5 text-[9px] font-mono font-black px-1 py-0.5 rounded" style={{ backgroundColor: tttBadge.bg, color: tttBadge.text }}>
            {Math.round(card.tttMinutes)}m
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono tabular-nums" style={{ color: getMPHColor(card.movesLastHour) }}>
          {card.movesLastHour} <span className="text-[var(--text-tertiary)]">MPH</span>
        </span>
      </div>
    </div>
  );
}

function QCGroupCard({ group, compact }: { group: EquipmentData["qcGroups"][number]; compact: boolean }) {
  const qc = group.qcCard;
  const isTypeA = group.qcNo === "QC09" || group.qcNo === "QC82";
  const accentColor = isTypeA ? "#F59E0B" : "#2563EB";
  const headerBg = "var(--bg-header)";
  const gradient = `linear-gradient(90deg, ${accentColor} 0%, ${accentColor} 120px, ${headerBg} 260px, ${headerBg} 100%)`;

  return (
    <div className="w-full flex items-stretch rounded-xl border-2 shadow-md overflow-hidden" style={{ background: gradient, borderColor: `${accentColor}44`, minHeight: "var(--qc-row-height, 80px)" }}>
      {/* QC Info Left */}
      <div className="flex flex-col justify-center px-4 py-2 min-w-[180px] max-w-[280px]">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-mono font-black text-white tracking-tighter leading-none drop-shadow-sm">
            {group.qcNo}
          </span>
          {qc.isOnline ? (
            <span className="relative flex h-3 w-3">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-mono font-black text-white/90 tracking-wide uppercase truncate max-w-[160px]">
            {qc.driverName ?? "NO DRIVER"}
          </span>
        </div>
      </div>

      {/* MPH Badge */}
      <div className="flex items-center justify-center px-3">
        <div className="bg-black/20 px-3 py-1 rounded-md shadow-inner border border-black/25 text-center">
          <span className="text-3xl font-mono font-black text-white tabular-nums leading-none">{qc.movesLastHour}</span>
          <div className="text-[10px] font-mono font-bold uppercase text-white/70">MPH</div>
        </div>
      </div>

      {/* Pending Orders */}
      {group.pendingOrdersCount > 0 && (
        <div className="flex items-center justify-center px-3">
          <div className="bg-amber-500/20 px-3 py-1 rounded-md border border-amber-400/30 text-center">
            <span className="text-2xl font-mono font-black text-white tabular-nums leading-none">{group.pendingOrdersCount}</span>
            <div className="text-[10px] font-mono font-bold uppercase text-white/70">Pending</div>
            <div className="text-[8px] font-mono text-white/50">Orders waiting</div>
          </div>
        </div>
      )}

      {/* YT Cards Row */}
      {!compact && group.ytCards.length > 0 && (
        <div className="flex-1 flex items-stretch gap-1.5 px-2 py-1.5 overflow-x-auto">
          {group.ytCards.map((y) => (
            <YTCardCompact key={y.equNo} card={y} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!compact && group.ytCards.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-10 h-10 mx-auto mb-1 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-white/50 uppercase">No Trucks Assigned</span>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute -right-10 -bottom-17 w-44 h-44 text-black/10 -rotate-12 pointer-events-none opacity-20">
        <EquipmentIcon equType="QC" className="w-full h-full" style={{ color: "white" }} />
      </div>
    </div>
  );
}

function YardSectionCard({ cards, label, equType, accentColor }: { cards: EquCard[]; label: string; equType: EquType; accentColor?: string }) {
  const accent = accentColor ?? EQU_ACCENTS[equType] ?? "var(--text-tertiary)";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-0.5 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{label}</span>
        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-tertiary)]">{cards.length}</span>
        <div className="h-px flex-1" style={{ backgroundColor: `${accent}33` }} />
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, minmax(0,1fr))` }}>
        {cards.map((c) => (
          <EquCardRich key={c.equNo} card={c} />
        ))}
      </div>
    </div>
  );
}

export function EquipmentMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 30000);

  // Merge RS+TL into SUPPORT for yard sections
  const yardSections = useMemo(() => {
    if (!data) return [];
    const rsSection = data.yardSections.find((s) => s.equType === "RS");
    const tlSection = data.yardSections.find((s) => s.equType === "TL");
    const otherSections = data.yardSections.filter((s) => s.equType !== "RS" && s.equType !== "TL");

    const mergedSupportCards = [
      ...(rsSection?.cards ?? []),
      ...(tlSection?.cards ?? []),
    ];

    const result = otherSections.map((s) => ({
      label: s.label,
      equType: s.equType,
      accentColor: s.accentColor,
      cards: s.cards,
    }));

    if (mergedSupportCards.length > 0) {
      result.push({
        label: "SUPPORT",
        equType: "SUPPORT",
        accentColor: EQU_ACCENTS.SUPPORT,
        cards: mergedSupportCards,
      });
    }

    return result;
  }, [data]);

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest">Connecting to Equipment Database</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
        <div className="flex-1 flex items-center justify-center">
          <div className="border border-red-400 bg-red-50 px-8 py-6 text-center max-w-md rounded-lg">
            <div className="text-xs font-bold font-mono text-red-500 uppercase tracking-widest mb-2">Connection Fault</div>
            <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">{error}</p>
            <button className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 rounded">Retry</button>
          </div>
        </div>
      </>
    );
  }
  if (!data) return (
    <>
      <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
      <div className="flex-1 flex items-center justify-center">
        <div className="border border-[var(--border)] px-12 py-8 text-center rounded-lg">
          <div className="text-xs font-bold font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-2">No Active Equipment</div>
          <p className="text-[11px] font-mono text-[var(--text-tertiary)]">No equipment data available at this time.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <MonitorHeader
        title={`${terminalCode} Equipment Monitor`}
        stats={
          <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
            {data.totalActive} Active · {data.totalOnline} Online · {data.qcGroups.length} QC Ops
          </span>
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-2">
        {/* Vessel Operations */}
        <div className="flex flex-col gap-[clamp(4px,0.7vh,10px)] min-h-0 flex-1">
          <div className="flex items-center gap-2 px-1 shrink-0">
            <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Vessel Operations</span>
            <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {data.qcGroups.map((g) => (
              <QCGroupCard key={g.qcNo} group={g} compact={false} />
            ))}
            {data.qcGroups.map((g) => (g.ytCards.length === 0 ? (
              <QCGroupCard key={`cmp-${g.qcNo}`} group={g} compact />
            ) : null))}
          </div>
        </div>

        {/* Yard Operations */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 px-1 mt-2 shrink-0">
            <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Yard Operations</span>
            <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar mt-1">
            <div className="grid grid-cols-9 gap-2 items-stretch">
              {yardSections.map((section) => {
                const span = section.equType === "YT" ? "col-span-3" : section.equType === "RTG" ? "col-span-4" : "col-span-2";
                return (
                  <div key={section.label} className={span}>
                    <YardSectionCard
                      cards={section.cards}
                      label={section.label}
                      equType={section.equType}
                      accentColor={section.accentColor}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
