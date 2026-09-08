"use client";

import { useMemo } from "react";
import type { EquipmentData, EquCard } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, tttColor, tttLabel } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";
import { EquipmentIcon } from "@/components/EquipmentIcon";

function YTCard({ yt }: { yt: EquCard }) {
  const statusColor = yt.isOnline
    ? yt.jobType
      ? "#10b981"
      : "#f59e0b"
    : "#64748b";
  const statusLabel = yt.isOnline
    ? yt.jobType ?? "Idle"
    : "Offline";

  return (
    <div className="bg-[#060a14] border border-[#1c273e] rounded-lg p-2.5 hover:border-[#10b981]/40 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-bold text-[#00f0ff]">{yt.equNo}</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
          style={{
            backgroundColor: `${statusColor}15`,
            color: statusColor,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {statusLabel}
        </span>
      </div>
      {yt.driverName && (
        <div className="text-[10px] font-mono text-[#94a3b8] mb-1" dir="rtl">
          {yt.driverName}
        </div>
      )}
      <div className="flex items-center justify-between text-[9px] font-mono text-[#64748b]">
        <span>{yt.assignedQc ?? "—"}</span>
        <span style={{ color: tttColor(yt.tttMinutes) }}>{tttLabel(yt.tttMinutes)}</span>
      </div>
    </div>
  );
}

function QCRow({ qc }: { qc: EquipmentData["qcGroups"][0] }) {
  return (
    <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl overflow-hidden">
      <div className="flex">
        {/* Left panel - QC info */}
        <div className="w-36 bg-[#f59e0b]/10 border-r border-[#1c273e] p-3 flex flex-col items-center justify-center shrink-0">
          <EquipmentIcon type="QC" className="w-6 h-6 text-[#f59e0b] mb-1.5" />
          <span className="text-sm font-mono font-bold text-[#f59e0b]">{qc.qcNo}</span>
          <span className="text-[9px] font-mono text-[#94a3b8] mt-0.5">
            {qc.qcCard.isOnline ? "Online" : "Offline"}
          </span>
          <span className="text-[9px] font-mono text-[#64748b]">
            {qc.pendingOrdersCount} pending
          </span>
        </div>

        {/* Right panel - YT cards grid */}
        <div className="flex-1 p-2">
          {qc.ytCards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {qc.ytCards.map((yt) => (
                <YTCard key={yt.equNo} yt={yt} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] font-mono text-[#64748b]">
              No YTs assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function YardSectionCard({ card }: { card: EquCard }) {
  const accentColor =
    card.equType === "RTG" ? "#f97316" :
    card.equType === "RS" ? "#0ea5e9" :
    card.equType === "TL" ? "#8b5cf6" :
    "#64748b";

  return (
    <div className="bg-[#0e1321] border border-[#1c273e] rounded-lg p-2.5 hover:border-[#00f0ff]/30 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono font-bold" style={{ color: accentColor }}>
          {card.equNo}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${card.isOnline ? "bg-[#10b981]" : "bg-[#64748b]"}`} />
      </div>
      <div className="text-[9px] font-mono text-[#94a3b8] truncate">
        {card.driverName ?? "No Driver"}
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
        <span className={card.jobType ? "text-[#10b981]" : "text-[#64748b]"}>
          {card.jobType ?? "Idle"}
        </span>
        {card.assignedQc && (
          <span className="text-[#f59e0b]">→ {card.assignedQc}</span>
        )}
      </div>
    </div>
  );
}

export function EquipmentMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 60000);

  const qcGroups = data?.qcGroups ?? [];
  const yardSections = data?.yardSections ?? [];

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
          <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-[0.2em]">Loading Equipment Data</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Equipment Monitor`} />
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="border border-[#ef4444]/50 bg-[#ef4444]/10 px-8 py-6 text-center max-w-md rounded-xl">
            <div className="text-xs font-bold font-mono text-[#ef4444] uppercase tracking-widest mb-2">Connection Fault</div>
            <p className="text-[11px] font-mono text-[#94a3b8] mb-4">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MonitorHeader
        title={`${terminalCode} Equipment Monitor`}
        stats={
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#10b981]">{formatCount(data?.totalOnline)} Online</span>
            <span className="text-[#94a3b8]">{formatCount(data?.totalActive)} Active</span>
          </div>
        }
        lastUpdated={lastUpdated}
      />

      <main className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col">
        <div className="max-w-[1920px] mx-auto w-full space-y-4 my-auto">
          {/* Vessel Operations Section */}
          {qcGroups.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#f59e0b] rounded-full" />
                <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
                  Vessel Operations
                </h3>
                <span className="text-[10px] font-mono text-[#64748b]">
                  ({qcGroups.length} QC Active)
                </span>
              </div>
              <div className="space-y-3">
                {qcGroups.map((g) => (
                  <QCRow key={g.qcNo} qc={g} />
                ))}
              </div>
            </section>
          )}

          {/* Yard Operations Section */}
          {yardSections.map((section) => (
            <section key={section.label}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-1 h-5 rounded-full"
                  style={{ backgroundColor: section.accentColor ?? "#f97316" }}
                />
                <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
                  {section.label}
                </h3>
                <span className="text-[10px] font-mono text-[#64748b]">
                  ({section.cards.length})
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
                {section.cards.map((card) => (
                  <YardSectionCard key={card.equNo} card={card} />
                ))}
              </div>
            </section>
          ))}

          {qcGroups.length === 0 && yardSections.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
              <div className="border border-[#1c273e] px-12 py-8 text-center rounded-xl">
                <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Equipment Data</div>
                <p className="text-[11px] font-mono text-[#64748b]">Waiting for fleet data.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
