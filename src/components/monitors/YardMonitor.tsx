"use client";

import { useMemo } from "react";
import type { YardData, BlockType, Violation } from "@/lib/types";
import { usePolling } from "@/lib/usePolling";
import { formatCount, BLOCK_COLORS } from "@/lib/ui";
import { MonitorHeader } from "@/components/MonitorHeader";

const BLOCK_CATEGORIES: { label: string; types: BlockType[]; color: string }[] = [
  { label: "Special Containers", types: ["DG", "RF"], color: "#ef4444" },
  { label: "High Traffic", types: ["IMP", "EXP", "IMP_EXP"], color: "#10b981" },
  { label: "Auxiliary", types: ["EMPTY", "CFS", "INSP", "NEGLECT", "OTHER"], color: "#64748b" },
];

function UtilizationGauge({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - ratio);
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono font-black" style={{ color }}>{pct}%</span>
        <span className="text-[8px] font-mono text-[#64748b] uppercase tracking-wider">Utilization</span>
      </div>
    </div>
  );
}

function SidebarStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#1e293b] last:border-0">
      <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function AlertItem({ violation }: { violation: Violation }) {
  const severityColor =
    violation.severity === "CRITICAL" ? "#ef4444" :
    violation.severity === "HIGH" ? "#f97316" :
    violation.severity === "MEDIUM" ? "#eab308" :
    "#64748b";

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-[#1e293b] last:border-0">
      <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: severityColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-[#dee2f6]">{violation.cntrNo}</span>
          <span className="text-[9px] font-mono text-[#64748b]">{violation.block}</span>
        </div>
        <p className="text-[9px] font-mono text-[#94a3b8] truncate">{violation.description}</p>
      </div>
      <span
        className="text-[8px] px-1 py-0.5 rounded font-mono font-bold shrink-0"
        style={{
          backgroundColor: `${severityColor}20`,
          color: severityColor,
        }}
      >
        {violation.severity}
      </span>
    </div>
  );
}

function BlockCard({ block }: { block: YardData["blocks"][0] }) {
  const pct = Math.round(block.fillRatio * 100);
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";

  return (
    <div className="bg-[#0e1321] border border-[#1c273e] rounded-lg p-2.5 hover:border-[#00f0ff]/30 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-bold text-[#dee2f6]">{block.blockId}</span>
        <span
          className="text-[8px] font-mono px-1 py-0.5 rounded"
          style={{
            backgroundColor: `${BLOCK_COLORS[block.blockType]}20`,
            color: BLOCK_COLORS[block.blockType],
            border: `1px solid ${BLOCK_COLORS[block.blockType]}40`,
          }}
        >
          {block.blockType}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#1c273e] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-[#64748b] mt-1">
        <span>{formatCount(block.occupiedTeu)}/{formatCount(block.capacityTeu)}</span>
        <span style={{ color }} className="font-bold">{pct}%</span>
      </div>
      {block.violationCount > 0 && (
        <div className="text-[8px] font-mono text-[#ef4444] mt-0.5">
          {block.violationCount} violations
        </div>
      )}
    </div>
  );
}

export function YardMonitor({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = usePolling<YardData>(`/api/yard?terminal=${terminalCode}`, 60000);

  const blocks = data?.blocks ?? [];
  const violations = data?.violations ?? [];
  const summary = data?.summary;

  const blocksByCategory = useMemo(() => {
    const map: Record<string, typeof blocks> = {};
    for (const cat of BLOCK_CATEGORIES) {
      map[cat.label] = blocks.filter((b) => cat.types.includes(b.blockType));
    }
    return map;
  }, [blocks]);

  const criticalViolations = useMemo(
    () => violations.filter((v) => v.severity === "CRITICAL" || v.severity === "HIGH").slice(0, 8),
    [violations],
  );

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

      <main className="flex-1 min-h-0 p-3 overflow-hidden flex items-center justify-center">
        <div className="max-w-[1920px] mx-auto w-full flex gap-3 h-full items-center">
          {/* Left side - Block Cards */}
          <div className="flex-1 min-w-0 space-y-4">
            {BLOCK_CATEGORIES.map((cat) => {
              const catBlocks = blocksByCategory[cat.label] ?? [];
              if (catBlocks.length === 0) return null;
              return (
                <section key={cat.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                    <h3 className="text-xs font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
                      {cat.label}
                    </h3>
                    <span className="text-[10px] font-mono text-[#64748b]">({catBlocks.length})</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                    {catBlocks.map((b) => (
                      <BlockCard key={b.blockId} block={b} />
                    ))}
                  </div>
                </section>
              );
            })}

            {blocks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
                <div className="border border-[#1c273e] px-12 py-8 text-center rounded-xl">
                  <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">No Yard Data</div>
                  <p className="text-[11px] font-mono text-[#64748b]">Waiting for yard blocks.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-72 shrink-0 space-y-3">
            {/* Terminal Utilization */}
            <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-4">
              <h4 className="text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-3 text-center">
                Terminal Utilization
              </h4>
              {summary && <UtilizationGauge ratio={summary.overallFillRatio} />}
              {summary && (
                <div className="mt-3 space-y-0">
                  <SidebarStat label="TEU" value={formatCount(summary.totalOccupied)} color="#00f0ff" />
                  <SidebarStat label="Reefers" value={summary.reeferCount} color="#06b6d4" />
                  <SidebarStat label="Dangerous" value={summary.dgCount} color="#ef4444" />
                  <SidebarStat label="Neglect" value={summary.neglectCount} color="#a855f7" />
                </div>
              )}
            </div>

            {/* Alert Summary */}
            <div className="bg-[#0e1321] border border-[#1c273e] rounded-xl p-4">
              <h4 className="text-[10px] font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
                Alert Summary
              </h4>
              {summary && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg p-2 text-center">
                    <span className="text-lg font-mono font-black text-[#ef4444]">{summary.criticalCount}</span>
                    <div className="text-[8px] font-mono text-[#ef4444] uppercase">Critical</div>
                  </div>
                  <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg p-2 text-center">
                    <span className="text-lg font-mono font-black text-[#f97316]">{summary.highCount}</span>
                    <div className="text-[8px] font-mono text-[#f97316] uppercase">High</div>
                  </div>
                  <div className="bg-[#eab308]/10 border border-[#eab308]/30 rounded-lg p-2 text-center">
                    <span className="text-lg font-mono font-black text-[#eab308]">{summary.mediumCount}</span>
                    <div className="text-[8px] font-mono text-[#eab308] uppercase">Medium</div>
                  </div>
                  <div className="bg-[#64748b]/10 border border-[#64748b]/30 rounded-lg p-2 text-center">
                    <span className="text-lg font-mono font-black text-[#64748b]">{summary.totalViolations}</span>
                    <div className="text-[8px] font-mono text-[#64748b] uppercase">Total</div>
                  </div>
                </div>
              )}
            </div>

            {/* Priority Alerts */}
            {criticalViolations.length > 0 && (
              <div className="bg-[#0e1321] border border-[#ef4444]/30 rounded-xl p-4">
                <h4 className="text-[10px] font-mono font-bold text-[#ef4444] uppercase tracking-wider mb-2">
                  Priority Alerts
                </h4>
                <div className="space-y-0 max-h-64 overflow-y-auto scrollbar-thin">
                  {criticalViolations.map((v, i) => (
                    <AlertItem key={i} violation={v} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
