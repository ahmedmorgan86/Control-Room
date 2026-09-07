"use client";

import { useMemo } from "react";
import type { EquipmentData } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, EQU_ACCENTS } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";
import { EquipmentIcon } from "@/components/EquipmentIcon";

export function EquipmentMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<EquipmentData>(`/api/equipment?terminal=${terminalCode}`, 60000);

  const qcGroups = data?.qcGroups ?? [];
  const yardSections = data?.yardSections ?? [];

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Equipment Fleet`} />
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
        <MonitorHeader title={`${terminalCode} Equipment Fleet`} />
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
        title={`${terminalCode} Equipment Fleet`}
        stats={
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#10b981]">{formatCount(data?.totalOnline)} Online</span>
            <span className="text-[#94a3b8]">{formatCount(data?.totalActive)} Active</span>
          </div>
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 p-2 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1920px] mx-auto">
          {/* QC Groups */}
          {qcGroups.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
                Quay Cranes ({qcGroups.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {qcGroups.map((g) => (
                  <div key={g.qcNo} className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b]">
                          <EquipmentIcon type="QC" className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold text-[#dee2f6]">{g.qcNo}</div>
                          <div className="text-[10px] font-mono text-[#64748b]">
                            {g.qcCard.isOnline ? "Online" : "Offline"} · {g.pendingOrdersCount} pending
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        g.qcCard.isOnline ? "bg-[#10b981]/20 text-[#10b981]" : "bg-[#64748b]/20 text-[#64748b]"
                      }`}>
                        {g.qcCard.isOnline ? "ACTIVE" : "IDLE"}
                      </span>
                    </div>
                    {g.ytCards.length > 0 && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                        {g.ytCards.map((yt) => (
                          <div key={yt.equNo} className="flex items-center justify-between bg-[#060a14] border border-[#1c273e] rounded px-2 py-1.5 text-[10px] font-mono">
                            <span className="text-[#00f0ff] font-bold">{yt.equNo}</span>
                            <span className="text-[#94a3b8]">{yt.driverName ?? "Assigned"}</span>
                            <span className={yt.jobType ? "text-[#10b981]" : "text-[#64748b]"}>{yt.jobType ?? "Idle"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yard Sections */}
          {yardSections.map((section) => (
            <div key={section.label} className="mb-4">
              <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
                {section.label} ({section.cards.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
                {section.cards.map((card) => (
                  <div key={card.equNo} className="bg-[#0e1321] border border-[#1c273e] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: EQU_ACCENTS[card.equType] }}>
                        {card.equNo}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${card.isOnline ? "bg-[#10b981]" : "bg-[#64748b]"}`} />
                    </div>
                    <div className="text-[10px] font-mono text-[#64748b]">{card.driverName ?? "No Driver"}</div>
                    {card.assignedQc && (
                      <div className="text-[10px] font-mono text-[#f59e0b] mt-0.5">→ {card.assignedQc}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
