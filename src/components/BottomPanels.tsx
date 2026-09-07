"use client";

import type { EquCard, YardBlock, Violation } from "@/lib/types";
import { formatCount } from "@/lib/ui";

export function YTFleetPanel({ yts }: { yts: EquCard[] }) {
  const online = yts.filter((y) => y.isOnline);
  const moving = yts.filter((y) => y.jobType !== null && y.isOnline);
  const idle = yts.filter((y) => y.jobType === null && y.isOnline);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#1c273e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">TERMINAL TRACTORS (YT) FLEET</h3>
            <p className="text-[11px] font-mono text-[#64748b]" dir="rtl">شاحنات نقل الرصيف والساحة المجهزة بنظام الملاحة</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-[#1c273e] border border-[#00f0ff]/30 text-[#00f0ff] font-mono">{formatCount(online.length)} Online</span>
      </div>
      <div className="mt-3 flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {yts.map((yt) => (
          <div key={yt.equNo} className="bg-[#060a14]/70 border border-[#1c273e] rounded-lg p-3 hover:border-[#00f0ff]/50 transition">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#00f0ff]">{yt.equNo}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                  yt.jobType ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30" : "bg-[#64748b]/10 text-[#64748b] border-[#64748b]/30"
                }`}>
                  {yt.jobType ?? "Idle"}
                </span>
              </div>
              {yt.assignedQc && <span className="text-[#f59e0b]">{yt.assignedQc}</span>}
            </div>
          </div>
        ))}
        {yts.length === 0 && (
          <p className="text-[11px] font-mono text-[#64748b] text-center py-4">Waiting for fleet data...</p>
        )}
      </div>
    </div>
  );
}

export function YardBlockPanel({ blocks, violations }: { blocks: YardBlock[]; violations: Violation[] }) {
  const totalCap = blocks.reduce((s, b) => s + b.capacityTeu, 0);
  const totalOcc = blocks.reduce((s, b) => s + b.occupiedTeu, 0);
  const fillPct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;
  const highFill = blocks.filter((b) => b.fillRatio >= 0.7).sort((a, b) => b.fillRatio - a.fillRatio);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#1c273e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">YARD BLOCK RTG &amp; STORAGE</h3>
            <p className="text-[11px] font-mono text-[#64748b]" dir="rtl">رافعات الساحات المطاطية وكثافة التخزين</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-mono">{formatCount(blocks.length)} Blocks</span>
      </div>
      <div className="mt-3 flex-1 overflow-y-auto scrollbar-thin space-y-3 font-mono text-xs">
        {highFill.map((b) => {
          const pct = Math.round(b.fillRatio * 100);
          const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
          return (
            <div key={b.blockId}>
              <div className="flex justify-between text-[#dee2f6] mb-1">
                <span>{b.blockId} ({b.blockType}): <strong>{pct}% Full</strong></span>
                <span style={{ color }}>{b.remark ?? "Active"}</span>
              </div>
              <div className="w-full bg-[#060a14] h-2.5 rounded-full overflow-hidden border border-[#1c273e]">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
        {blocks.length === 0 && (
          <p className="text-[11px] font-mono text-[#64748b] text-center py-4">Waiting for yard data...</p>
        )}
      </div>
    </div>
  );
}

export function GangDispatchPanel({ yts }: { yts: EquCard[] }) {
  const assigned = yts.filter((y) => y.jobType !== null);
  const byJob: Record<string, number> = {};
  for (const y of assigned) {
    const jt = y.jobType ?? "OTHER";
    byJob[jt] = (byJob[jt] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#1c273e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white">GANG DISPATCH &amp; SAFETY</h3>
            <p className="text-[11px] font-mono text-[#64748b]" dir="rtl">إدارة الفرق والسلامة وتنبؤات الطقس</p>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] font-mono">Shift Alpha</span>
      </div>
      <div className="mt-3 flex-1 overflow-y-auto scrollbar-thin space-y-2 font-mono">
        {Object.entries(byJob).map(([job, count]) => (
          <div key={job} className="p-2 rounded bg-[#060a14] border border-[#1c273e] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#00f0ff] font-bold">{count}</span>
              <span className="text-[#dee2f6] ml-2">{job}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-[10px]">Active</span>
          </div>
        ))}
        {/* Safety Status */}
        <div className="p-2.5 rounded bg-[#060a14] border border-[#1c273e] mt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748b]">Safety Status:</span>
            <span className="text-[#10b981] font-bold">ALL SYSTEMS NOMINAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono mt-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#64748b]">Last incident: 12 days ago</span>
          </div>
        </div>
        {yts.length === 0 && (
          <p className="text-[11px] font-mono text-[#64748b] text-center py-4">Waiting for dispatch data...</p>
        )}
      </div>
    </div>
  );
}
