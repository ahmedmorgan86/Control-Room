"use client";

import { useMemo, useState } from "react";
import type { YardData, BlockType } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, BLOCK_COLORS } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

const ZONE_CATEGORIES: { label: string; types: BlockType[] }[] = [
  { label: "Import", types: ["IMP", "IMP_EXP"] },
  { label: "Export", types: ["EXP"] },
  { label: "Reefer", types: ["RF"] },
  { label: "Hazardous", types: ["DG"] },
  { label: "Empty", types: ["EMPTY"] },
  { label: "Other", types: ["CFS", "INSP", "NEGLECT", "OTHER"] },
];

export function YardMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<YardData>(`/api/yard?terminal=${terminalCode}`, 60000);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const blocks = data?.blocks ?? [];
  const violations = data?.violations ?? [];
  const summary = data?.summary;

  const blocksByType = useMemo(() => {
    const map: Record<BlockType, typeof blocks> = {} as Record<BlockType, typeof blocks>;
    for (const b of blocks) {
      (map[b.blockType] ??= []).push(b);
    }
    return map;
  }, [blocks]);

  if (loading && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Yard Monitor`} />
        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b]">
          <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-[0.2em]">Loading Yard Data</p>
        </div>
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <MonitorHeader title={`${terminalCode} Yard Monitor`} />
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
        title={`${terminalCode} Yard Monitor`}
        stats={
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#94a3b8]">{formatCount(blocks.length)} Blocks</span>
            {summary && (
              <>
                <span className="text-[#00f0ff]">{summary.totalViolations} Violations</span>
                <span className="text-[#ef4444]">{summary.criticalCount} Critical</span>
              </>
            )}
          </div>
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 p-2 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1920px] mx-auto">
          {/* Summary ribbon */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Total Capacity</div>
                <div className="text-lg font-mono font-black text-[#00f0ff]">{formatCount(summary.totalCapacity)}</div>
              </div>
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Occupied</div>
                <div className="text-lg font-mono font-black text-white">{formatCount(summary.totalOccupied)}</div>
              </div>
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Fill Ratio</div>
                <div className="text-lg font-mono font-black text-[#10b981]">{Math.round(summary.overallFillRatio * 100)}%</div>
              </div>
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Reefers</div>
                <div className="text-lg font-mono font-black text-[#06b6d4]">{summary.reeferCount}</div>
              </div>
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">DG Containers</div>
                <div className="text-lg font-mono font-black text-[#ef4444]">{summary.dgCount}</div>
              </div>
              <div className="bg-[#090e1c] border border-[#1c273e] rounded-lg p-3">
                <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">Violations</div>
                <div className="text-lg font-mono font-black text-[#f59e0b]">{summary.totalViolations}</div>
              </div>
            </div>
          )}

          {/* Zone categories */}
          {ZONE_CATEGORIES.map((zone) => {
            const zoneBlocks = blocksByType[zone.types[0]] ?? [];
            if (zoneBlocks.length === 0) return null;
            return (
              <div key={zone.label} className="mb-4">
                <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-2 px-1">
                  {zone.label} ({zoneBlocks.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
                  {zoneBlocks.map((b) => {
                    const pct = Math.round(b.fillRatio * 100);
                    const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
                    return (
                      <div
                        key={b.blockId}
                        className="bg-[#0e1321] border border-[#1c273e] rounded-lg p-3 cursor-pointer hover:border-[#00f0ff]/50 transition-colors"
                        onClick={() => setSelectedBlock(selectedBlock === b.blockId ? null : b.blockId)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-[#dee2f6]">{b.blockId}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${BLOCK_COLORS[b.blockType]}20`, color: BLOCK_COLORS[b.blockType], border: `1px solid ${BLOCK_COLORS[b.blockType]}40` }}>
                            {b.blockType}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1c273e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-[#64748b] mt-1">
                          <span>{formatCount(b.occupiedTeu)}/{formatCount(b.capacityTeu)}</span>
                          <span style={{ color }}>{pct}%</span>
                        </div>
                        {b.violationCount > 0 && (
                          <div className="text-[9px] font-mono text-[#ef4444] mt-1">{b.violationCount} violations</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Violations */}
          {violations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-mono font-bold text-[#ef4444] uppercase tracking-wider mb-2 px-1">
                Active Violations ({violations.length})
              </h3>
              <div className="space-y-1">
                {violations.slice(0, 10).map((v, i) => (
                  <div key={i} className="bg-[#0e1321] border border-[#1c273e] rounded px-3 py-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        v.severity === "CRITICAL" ? "bg-[#ef4444]" : v.severity === "HIGH" ? "bg-[#f97316]" : v.severity === "MEDIUM" ? "bg-[#eab308]" : "bg-[#64748b]"
                      }`} />
                      <span className="text-[#dee2f6]">{v.cntrNo}</span>
                      <span className="text-[#64748b]">{v.block}</span>
                      <span className="text-[#94a3b8]">{v.description}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      backgroundColor: `${v.severity === "CRITICAL" ? "#ef4444" : v.severity === "HIGH" ? "#f97316" : "#eab308"}20`,
                      color: v.severity === "CRITICAL" ? "#ef4444" : v.severity === "HIGH" ? "#f97316" : "#eab308",
                    }}>
                      {v.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
