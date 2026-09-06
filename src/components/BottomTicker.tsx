"use client";

import type { Vessel } from "@/lib/types";

interface TickerItem {
  label: string;
  value: string;
  color?: string;
}

export function BottomTicker({ vessels }: { vessels: Vessel[] }) {
  const items: TickerItem[] = [];

  if (vessels.length === 0) {
    items.push({ label: "SYSTEM", value: "NO VESSELS AT BERTH" });
  } else {
    for (const v of vessels) {
      const pct = v.totalMoves > 0 ? Math.round((v.totalDone / v.totalMoves) * 100) : 0;
      const eta = Math.max(0, v.totalMoves - v.totalDone);
      const etaHrs = v.gmph > 0 ? (eta / v.gmph).toFixed(1) : "∞";
      items.push({
        label: v.vesselCode,
        value: `${pct}% | ETA ${etaHrs}h`,
        color: pct >= 90 ? "#10b981" : pct >= 50 ? "#00f0ff" : "#f59e0b",
      });
    }
    for (const v of vessels) {
      for (const c of v.cranes.slice(0, 2)) {
        const cPct = c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0;
        items.push({
          label: c.craneId,
          value: `${c.movesDone}/${c.movesTotal} (${cPct}%)`,
          color: "#00f0ff",
        });
      }
    }
  }

  items.push({ label: "YARD", value: "48 BLOCKS MONITORED", color: "#10b981" });
  items.push({ label: "YT FLEET", value: "18 ONLINE", color: "#10b981" });
  items.push({ label: "GANG", value: "DISPATCH ACTIVE", color: "#10b981" });
  items.push({ label: "TERMINAL", value: "ACT SMART-OPS", color: "#00f0ff" });

  return (
    <div className="w-full bg-[#060a14] border-t border-[#1c273e] text-[#64748b] overflow-hidden relative">
      <div className="h-7 flex items-center">
        <div className="flex animate-ticker whitespace-nowrap gap-8 px-4">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <span key={i} className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-2">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: item.color ?? "#64748b" }}
              />
              <span className="text-[#475569]">{item.label}:</span>
              <span style={{ color: item.color ?? "#64748b" }}>{item.value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
