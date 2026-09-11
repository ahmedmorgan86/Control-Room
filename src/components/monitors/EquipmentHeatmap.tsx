"use client";

import { Fragment } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";
import type { YardBlock } from "@/lib/types";

interface HeatmapData {
  blocks: YardBlock[];
}

function getHeatColor(ratio: number): string {
  if (ratio > 0.9) return "var(--accent-discharge)";
  if (ratio > 0.75) return "var(--accent-crane)";
  if (ratio > 0.6) return "var(--accent-reefer)";
  if (ratio > 0.4) return "var(--accent-loading)";
  if (ratio > 0.2) return "var(--cyan)";
  return "var(--text-tertiary)";
}

export default function EquipmentHeatmap({ terminalCode }: { terminalCode: string }) {
  const { data, loading, error, lastUpdated } = useMonitorData<HeatmapData>({
    url: `/api/yard?terminal=${terminalCode}`,
    interval: 60000,
  });

  const blocks = data?.blocks || [];
  const cols = Math.ceil(Math.sqrt(blocks.length * 2));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Yard Heatmap`}
        stats={`${blocks.length} Blocks`}
        lastUpdated={lastUpdated}
        error={error}
      />
      <main className="flex-1 min-h-0 p-3 overflow-auto">
        {loading && !data ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-mono text-[var(--text-tertiary)]">No yard data</span>
          </div>
        ) : (
          <Fragment>
            <div
              className="grid gap-1.5 w-full h-full"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "1fr" }}
            >
              {blocks.map((block) => (
                <div
                  key={block.blockId}
                  className="relative flex flex-col items-center justify-center rounded-lg border transition-all hover:scale-105 hover:shadow-lg cursor-default"
                  style={{
                    background: `color-mix(in oklab, ${getHeatColor(block.fillRatio)} 12%, transparent)`,
                    borderColor: `color-mix(in oklab, ${getHeatColor(block.fillRatio)} 35%, transparent)`,
                  }}
                  role="gridcell"
                  aria-label={`${block.blockId}: ${Math.round(block.fillRatio * 100)}% full, ${block.violationCount} violations`}
                >
                  <span className="text-xs font-mono font-black" style={{ color: getHeatColor(block.fillRatio) }}>
                    {block.blockId}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                    {Math.round(block.fillRatio * 100)}%
                  </span>
                  {block.violationCount > 0 && (
                    <span
                      className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center px-0.5"
                      aria-label={`${block.violationCount} violations`}
                    >
                      {block.violationCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-3" role="legend" aria-label="Heat map legend">
              {[
                { label: "<20%", color: "var(--text-tertiary)" },
                { label: "20-40%", color: "var(--cyan)" },
                { label: "40-60%", color: "var(--accent-loading)" },
                { label: "60-75%", color: "var(--accent-reefer)" },
                { label: "75-90%", color: "var(--accent-crane)" },
                { label: ">90%", color: "var(--accent-discharge)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <span className="text-[9px] font-mono text-[var(--text-tertiary)]">{item.label}</span>
                </div>
              ))}
            </div>
          </Fragment>
        )}
      </main>
    </div>
  );
}
