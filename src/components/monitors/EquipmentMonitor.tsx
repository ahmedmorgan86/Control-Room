"use client";

import { useMemo } from "react";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import type { EquCard, EquipmentData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { EQU_ACCENTS, tttColor, tttLabel } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

function EquStatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${online ? "bg-[var(--safe)]" : "bg-[var(--text-tertiary)]"} animate-pulse-dot`}
      style={online ? {} : { animation: "none" }}
    />
  );
}

function YTOnlineIcon({ online }: { online: boolean }) {
  return online ? (
    <svg className="w-3.5 h-3.5 text-[var(--safe)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function YTCard({ card, pending }: { card: EquCard; pending?: number }) {
  const accent = EQU_ACCENTS[card.equType] ?? "var(--text-tertiary)";
  const ttt = tttColor(card.tttMinutes);
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded p-2 flex flex-col gap-1 min-w-[120px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 min-w-0">
          <EquipmentIcon equType={card.equType} className="w-7 h-7 shrink-0" style={{ color: accent }} />
          <span className="font-mono font-bold text-[10px] text-[var(--text-primary)] truncate">{card.displayName}</span>
        </span>
        <YTOnlineIcon online={card.isOnline} />
      </div>
      <div className="text-[9px] font-mono text-[var(--text-secondary)] truncate">{card.driverName ?? "—"}</div>
      <div className="flex items-center justify-between text-[9px] font-mono">
        <span className="px-1 rounded text-[8px] font-bold uppercase" style={{ backgroundColor: `${accent}22`, color: accent }}>
          {card.jobType ?? "—"}
        </span>
        <span className="text-[var(--text-secondary)]">{card.position ?? "—"}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-[var(--text-secondary)]">
          {card.movesLastHour} <span className="text-[var(--text-tertiary)]">MPH</span>
        </span>
        {card.tttMinutes != null && (
          <span className="text-[9px] font-mono font-bold tabular-nums" style={{ color: ttt }}>
            {tttLabel(card.tttMinutes)}
          </span>
        )}
        {pending != null && (
          <span className="text-[9px] font-mono font-bold text-[var(--signal)] tabular-nums">P{pending}</span>
        )}
      </div>
    </div>
  );
}

function QCGroupCard({ group, compact }: { group: EquipmentData["qcGroups"][number]; compact: boolean }) {
  const qc = group.qcCard;
  const accent = compact ? (group.qcNo === "QC09" || group.qcNo === "QC82" ? "var(--safe)" : "var(--signal)") : "var(--signal)";
  return (
    <div className="bg-[var(--bg-operational)] border border-[var(--border-light)] rounded-sm p-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <EquipmentIcon equType="QC" className="w-8 h-8 shrink-0" style={{ color: accent }} />
          <EquStatusDot online={qc.isOnline} />
          <span className="font-mono font-black text-sm text-[var(--text-primary)]">{group.qcNo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">{qc.driverName ?? "—"}</span>
          <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: accent }}>{qc.movesLastHour} MPH</span>
        </div>
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mt-1 max-h-[200px] overflow-y-auto custom-scrollbar">
          {group.ytCards.map((y) => (
            <YTCard key={y.equNo} card={y} pending={group.pendingOrdersCount} />
          ))}
        </div>
      )}
    </div>
  );
}

function EquCardGrid({ cards }: { cards: EquCard[] }) {
  const cols = useMemo(() => {
    if (cards.length === 0) return 3;
    const type = cards[0].equType;
    if (type === "YT") return 3;
    if (type === "RTG") return 4;
    return 3;
  }, [cards]);
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {cards.map((c) => (
        <YTCard key={c.equNo} card={c} />
      ))}
    </div>
  );
}

export function EquipmentMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 30000);

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
            <button className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 rounded">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }
  if (!data) return null;

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
        <div className="flex-1 flex flex-col gap-[clamp(4px,0.8vh,12px)] min-h-0">
          <div className="flex flex-col gap-[clamp(4px,0.7vh,10px)] shrink-0">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Vessel Operations</span>
              <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar grid gap-2 content-start" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {data.qcGroups.map((g) => (
                <QCGroupCard key={g.qcNo} group={g} compact={false} />
              ))}
              {data.qcGroups.map((g) => (g.ytCards.length === 0 ? (
                <QCGroupCard key={`cmp-${g.qcNo}`} group={g} compact />
              ) : null))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 mt-2">
            <span className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">Yard Operations</span>
            <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {data.yardSections.map((section) => (
              <div key={section.label} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <EquipmentIcon
                    equType={section.equType}
                    className="w-5 h-5 shrink-0"
                    style={{ color: section.accentColor ?? EQU_ACCENTS[section.equType] ?? "var(--text-tertiary)" }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                    {section.label}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{section.cards.length}</span>
                </div>
                <EquCardGrid cards={section.cards} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
