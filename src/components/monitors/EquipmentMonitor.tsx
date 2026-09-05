"use client";

import { useMemo } from "react";
import { EquipmentIcon } from "@/components/EquipmentIcon";
import type { EquCard, EquipmentData, Terminal } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { LiveStatus } from "@/components/ui";
import { EQU_ACCENTS, formatCount, tttColor, tttLabel } from "@/lib/ui";

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

export function EquipmentMonitor({ terminal }: { terminal: Terminal }) {
  const { data, loading, error, lastUpdated, now } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminal}`, 30000);

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
        Failed to load equipment: {error}
      </div>
    );
  }
  if (!data) return null;

  const violations = data.blockTypeMap ?? {};

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--safe)] animate-pulse-dot" />
          Equipment Overview
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">Active {data.totalActive}</span>
          <span className="text-[10px] font-mono text-[var(--text-secondary)]">Online {data.totalOnline}</span>
          <LiveStatus lastUpdated={lastUpdated} now={now} error={error} intervalMs={30000} />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-3">
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="min-h-0 flex-1 flex flex-col">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-1 shrink-0">
              Vessel Operations · QCs
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

          <div className="min-h-[200px] flex-1 flex flex-col">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-1 shrink-0">
              Yard Operations
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
        </div>

        <div className="w-[280px] shrink-0 flex flex-col gap-2">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-sm p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Status</div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Total Active" value={formatCount(data.totalActive)} color="var(--accent-blue)" />
              <Stat label="Online" value={formatCount(data.totalOnline)} color="var(--safe)" />
              <Stat label="QC Groups" value={formatCount(data.qcGroups.length)} color="var(--signal)" />
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-sm overflow-hidden flex flex-col">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-light)]">
              Priority Alerts
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2">
              <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                {Object.keys(violations).length} blocks mapped · {formatCount(data.totalOnline)} equipment online
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[var(--bg-header)] rounded p-2 text-center">
      <div className="font-mono font-black text-lg leading-none tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[8px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mt-0.5">{label}</div>
    </div>
  );
}
