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

  return (
    <div className="h-10 bg-[var(--bg-deep)] border-b border-white/[0.04] px-5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-[13px] font-bold text-[var(--text-bright)] uppercase tracking-[0.12em]">{title}</h2>
        <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--green)] bg-[var(--green)]/10 px-1.5 py-0.5 rounded border border-[var(--green)]/20">
          <span className="w-1 h-1 rounded-full bg-[var(--green)] animate-pulse" />
          LIVE
        </span>
        {stats}
        {lastUpdated && (
          <span className="text-[9px] font-mono text-[var(--text-dim)]">
            {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <div className="font-mono text-xs font-bold text-[var(--text-secondary)] tabular-nums">{timeStr}</div>
    </div>
  );
}
