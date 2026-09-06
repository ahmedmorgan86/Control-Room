"use client";

import type { EquCard, YardBlock, Violation } from "@/lib/types";
import { formatCount } from "@/lib/ui";

interface YTPanelProps {
  yts: EquCard[];
}

interface YardPanelProps {
  blocks: YardBlock[];
  violations: Violation[];
}

interface GangPanelProps {
  yts: EquCard[];
}

export function YTFleetPanel({ yts }: YTPanelProps) {
  const online = yts.filter((y) => y.isOnline);
  const moving = yts.filter((y) => y.jobType !== null && y.isOnline);
  const idle = yts.filter((y) => y.jobType === null && y.isOnline);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Terminal Tractors Fleet</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25">
          {formatCount(online.length)} Active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="bg-[#060a14] border border-[#1c273e] rounded p-2">
          <div className="text-[#64748b] uppercase tracking-wider">Moving</div>
          <div className="text-lg font-bold text-[#10b981]">{formatCount(moving.length)}</div>
        </div>
        <div className="bg-[#060a14] border border-[#1c273e] rounded p-2">
          <div className="text-[#64748b] uppercase tracking-wider">Idle</div>
          <div className="text-lg font-bold text-[#f59e0b]">{formatCount(idle.length)}</div>
        </div>
      </div>
      <div className="mt-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#0a0f1e] scrollbar-thumb-[#1c273e] space-y-1">
        {online.slice(0, 8).map((yt) => (
          <div key={yt.equNo} className="flex items-center justify-between bg-[#060a14] border border-[#1c273e] rounded px-2 py-1 text-[10px] font-mono">
            <span className="text-[#dee2f6]">{yt.equNo}</span>
            <span className={yt.jobType ? "text-[#10b981]" : "text-[#64748b]"}>
              {yt.jobType ?? "IDLE"}
            </span>
            {yt.assignedQc && <span className="text-[#00f0ff]">{yt.assignedQc}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function YardBlockPanel({ blocks, violations }: YardPanelProps) {
  const totalCap = blocks.reduce((s, b) => s + b.capacityTeu, 0);
  const totalOcc = blocks.reduce((s, b) => s + b.occupiedTeu, 0);
  const fillPct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;

  const highFill = blocks
    .filter((b) => b.fillRatio >= 0.85)
    .sort((a, b) => b.fillRatio - a.fillRatio);

  const critVios = violations.filter((v) => v.severity === "CRITICAL" || v.severity === "HIGH");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Yard Block RTG &amp; Storage</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/25">
          {formatCount(blocks.length)} Blocks
        </span>
      </div>
      <div className="bg-[#060a14] border border-[#1c273e] rounded p-2 mb-2">
        <div className="flex justify-between text-[11px] font-mono mb-1">
          <span className="text-[#64748b]">Total Fill Ratio</span>
          <span className="text-[#00f0ff] font-bold">{fillPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#1c273e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${fillPct}%`,
              backgroundColor: fillPct >= 90 ? "#ef4444" : fillPct >= 70 ? "#f59e0b" : "#00f0ff",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#64748b] mt-1">
          <span>{formatCount(totalOcc)} / {formatCount(totalCap)} TEU</span>
          <span>{critVios.length} Critical</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#0a0f1e] scrollbar-thumb-[#1c273e] space-y-1">
        {highFill.slice(0, 6).map((b) => {
          const pct = Math.round(b.fillRatio * 100);
          return (
            <div key={b.blockId} className="flex items-center justify-between bg-[#060a14] border border-[#1c273e] rounded px-2 py-1 text-[10px] font-mono">
              <span className="text-[#dee2f6]">{b.blockId}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#64748b]">{b.blockType}</span>
                <span className={pct >= 90 ? "text-[#ef4444]" : pct >= 70 ? "text-[#f59e0b]" : "text-[#00f0ff]"}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GangDispatchPanel({ yts }: GangPanelProps) {
  const assigned = yts.filter((y) => y.jobType !== null);
  const byJob: Record<string, number> = {};
  for (const y of assigned) {
    const jt = y.jobType ?? "OTHER";
    byJob[jt] = (byJob[jt] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Gang Dispatch &amp; Safety</span>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/25">
          {assigned.length} Active
        </span>
      </div>
      <div className="space-y-2 mb-3">
        {Object.entries(byJob).map(([job, count]) => (
          <div key={job} className="flex items-center justify-between bg-[#060a14] border border-[#1c273e] rounded px-2 py-1.5 text-[11px] font-mono">
            <span className="text-[#dee2f6] uppercase">{job}</span>
            <span className="text-[#f59e0b] font-bold">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto border-t border-[#1c273e] pt-2">
        <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider mb-1">Safety Status</div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[#10b981]">ALL SYSTEMS NOMINAL</span>
        </div>
        <div className="text-[10px] font-mono text-[#64748b] mt-1">Last incident: 12 days ago</div>
      </div>
    </div>
  );
}
