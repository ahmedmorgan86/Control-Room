"use client";

import type { ReactNode } from "react";

export function MonitorHeader({
  title,
  stats,
  lastUpdated,
  actions,
}: {
  title: string;
  stats?: ReactNode;
  lastUpdated?: Date | null;
  actions?: ReactNode;
}) {
  return (
    <div className="bg-[#090e1c] border-b border-[#1c273e]/80 px-6 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-mono font-bold text-[#dee2f6] uppercase tracking-wider">{title}</h2>
        {stats}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {lastUpdated && (
          <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider">
            Last sync: {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
