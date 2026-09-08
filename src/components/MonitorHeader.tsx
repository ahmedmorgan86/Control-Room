"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function MonitorHeader({
  title,
  stats,
  lastUpdated,
}: {
  title: string;
  stats?: ReactNode;
  lastUpdated?: Date | null;
}) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-extrabold text-white uppercase tracking-wide">{title}</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          LIVE
        </span>
        {stats}
        {lastUpdated && (
          <span className="text-[11px] text-[#64748b]">
            Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <div className="text-right">
        <div className="text-2xl font-mono font-black text-white tabular-nums tracking-wider">{timeStr}</div>
        <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">{dateStr}</div>
      </div>
    </div>
  );
}
