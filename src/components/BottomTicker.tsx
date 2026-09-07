"use client";

import type { Vessel } from "@/lib/types";

export function BottomTicker({ vessels }: { vessels: Vessel[] }) {
  const items: { label: string; value: string; color?: string }[] = [];

  if (vessels.length === 0) {
    items.push({ label: "SYSTEM", value: "NO VESSELS AT BERTH" });
  } else {
    for (const v of vessels) {
      const pct = v.totalMoves > 0 ? Math.round((v.totalDone / v.totalMoves) * 100) : 0;
      items.push({
        label: v.vesselCode,
        value: `${pct}% | ETA ${v.gmph > 0 ? ((v.totalMoves - v.totalDone) / v.gmph).toFixed(1) : "∞"}h`,
        color: pct >= 90 ? "#10b981" : pct >= 50 ? "#00f0ff" : "#f59e0b",
      });
    }
  }

  items.push(
    { label: "YARD", value: "BLOCKS MONITORED", color: "#10b981" },
    { label: "YT FLEET", value: "ONLINE", color: "#10b981" },
    { label: "TERMINAL", value: "SMART-OPS ACTIVE", color: "#00f0ff" },
    { label: "KNOTS", value: "0.00 (Along Quay)", color: "#00f0ff" },
  );

  return (
    <div className="w-full bg-[#060a14] border-t border-[#1c273e] py-1 px-6 flex items-center justify-between text-xs font-mono text-[#64748b]">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-[#10b981] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          OPERATIONS LIVE
        </span>
        {items.slice(0, 5).map((item, i) => (
          <span key={i}>
            <span className="text-[#475569]">{item.label}:</span>{" "}
            <span style={{ color: item.color ?? "#64748b" }}>{item.value}</span>
          </span>
        ))}
      </div>
      <div className="text-[#475569]">PORT SMART-OPS v4.8</div>
    </div>
  );
}
