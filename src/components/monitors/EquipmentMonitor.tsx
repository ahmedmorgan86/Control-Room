"use client";

import { useMemo } from "react";
import type { EquipmentData, EquCard } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, tttColor, tttLabel } from "@/lib/ui";
import { useMouseTilt } from "@/lib/useMouseTilt";
import { MonitorHeader } from "@/components/MonitorHeader";
import { EquipmentIcon } from "@/components/EquipmentIcon";

function YTCard({ yt, index }: { yt: EquCard; index: number }) {
  const online = yt.isOnline;
  const active = online && yt.jobType;
  const statusColor = active ? "#10b981" : online ? "#f59e0b" : "#475569";
  const statusLabel = active ? yt.jobType! : online ? "Idle" : "Off";
  const t = useMouseTilt(3);

  return (
    <div
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className={`card-3d-sm bg-[var(--bg-deep)] border border-white/[0.05] rounded-xl p-2 shadow-depth-1 animate-slide-up d${(index % 10) + 1}`}
      style={t.style}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-mono font-bold text-[var(--cyan)]">{yt.equNo}</span>
        <span className="text-[7px] px-1 py-px rounded font-bold" style={{ backgroundColor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25` }}>{statusLabel}</span>
      </div>
      {yt.driverName && <div className="text-[8px] font-mono text-[var(--text-secondary)] truncate mb-0.5" dir="rtl">{yt.driverName}</div>}
      <div className="flex items-center justify-between text-[7px] font-mono text-[var(--text-dim)]">
        <span>{yt.assignedQc ?? "—"}</span>
        <span style={{ color: tttColor(yt.tttMinutes) }}>{tttLabel(yt.tttMinutes)}</span>
      </div>
    </div>
  );
}

function QCRow({ qc, index }: { qc: EquipmentData["qcGroups"][0]; index: number }) {
  const t = useMouseTilt(2);

  return (
    <div
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className={`card-3d bg-[var(--bg-surface)] border border-white/[0.06] rounded-2xl overflow-hidden shadow-depth-2 animate-fade-left d${index + 1}`}
      style={t.style}
    >
      <div className="flex">
        <div className="w-28 bg-[var(--amber)]/[0.06] border-r border-white/[0.04] p-3 flex flex-col items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--amber)]/10 border border-[var(--amber)]/20 flex items-center justify-center mb-1.5">
            <EquipmentIcon type="QC" className="w-4 h-4 text-[var(--amber)]" />
          </div>
          <span className="text-xs font-mono font-bold text-[var(--amber)]">{qc.qcNo}</span>
          <span className="text-[7px] font-mono text-[var(--text-dim)] mt-0.5">{qc.qcCard.isOnline ? "Online" : "Offline"}</span>
          <span className="text-[7px] font-mono text-[var(--text-dim)]">{qc.pendingOrdersCount} pending</span>
        </div>
        <div className="flex-1 p-2">
          {qc.ytCards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
              {qc.ytCards.map((yt, i) => <YTCard key={yt.equNo} yt={yt} index={i} />)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-16 text-[9px] font-mono text-[var(--text-dim)]">No YTs assigned</div>
          )}
        </div>
      </div>
    </div>
  );
}

function YardCard({ card, index }: { card: EquCard; index: number }) {
  const accent = card.equType === "RTG" ? "var(--orange)" : card.equType === "RS" ? "var(--blue)" : card.equType === "TL" ? "var(--purple)" : "var(--text-dim)";
  const t = useMouseTilt(3);

  return (
    <div
      ref={t.ref} onMouseMove={t.onMove} onMouseLeave={t.onLeave}
      className={`card-3d-sm bg-[var(--bg-deep)] border border-white/[0.05] rounded-xl p-2.5 shadow-depth-1 animate-fade-up d${(index % 10) + 1}`}
      style={t.style}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] font-mono font-bold" style={{ color: accent }}>{card.equNo}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${card.isOnline ? "bg-[var(--green)]" : "bg-[var(--text-dim)]"}`} />
      </div>
      <div className="text-[8px] font-mono text-[var(--text-secondary)] truncate">{card.driverName ?? "No Driver"}</div>
      <div className="flex items-center justify-between text-[7px] font-mono mt-0.5">
        <span className={card.jobType ? "text-[var(--green)]" : "text-[var(--text-dim)]"}>{card.jobType ?? "Idle"}</span>
        {card.assignedQc && <span className="text-[var(--amber)]">→ {card.assignedQc}</span>}
      </div>
    </div>
  );
}

export function EquipmentMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 60000);
  const qcGroups = data?.qcGroups ?? [];
  const yardSections = data?.yardSections ?? [];

  if (loading && !data) return (
    <>
      <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[var(--cyan)] rounded-full animate-spin mb-3" />
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--text-dim)]">Loading</p>
      </div>
    </>
  );

  if (error && !data) return (
    <>
      <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
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
      <MonitorHeader title={`${terminalCode} Equipment Monitor`} stats={<div className="flex items-center gap-3 text-[10px] font-mono"><span className="text-[var(--green)]">{formatCount(data?.totalOnline)} Online</span><span className="text-[var(--text-secondary)]">{formatCount(data?.totalActive)} Active</span></div>} lastUpdated={lastUpdated} />
      <main className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col perspective-root bg-mesh bg-grid">
        <div className="max-w-[1920px] mx-auto w-full space-y-3 my-auto overflow-y-auto">
          {qcGroups.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-0.5 h-4 bg-[var(--amber)] rounded-full" />
                <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Vessel Operations</h3>
                <span className="text-[9px] font-mono text-[var(--text-dim)]">({qcGroups.length} QC)</span>
              </div>
              <div className="space-y-2">
                {qcGroups.map((g, i) => <QCRow key={g.qcNo} qc={g} index={i} />)}
              </div>
            </section>
          )}
          {yardSections.map((section) => (
            <section key={section.label}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: section.accentColor ?? "var(--orange)" }} />
                <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">{section.label}</h3>
                <span className="text-[9px] font-mono text-[var(--text-dim)]">({section.cards.length})</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-8 gap-1.5">
                {section.cards.map((card, i) => <YardCard key={card.equNo} card={card} index={i} />)}
              </div>
            </section>
          ))}
          {qcGroups.length === 0 && yardSections.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="glass rounded-2xl px-12 py-8 text-center card-3d gradient-border">
                <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] mb-1">No Equipment Data</div>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Waiting for fleet data.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
