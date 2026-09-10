"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function MonitorHeader({ title, stats, lastUpdated }: { title: string; stats?: ReactNode; lastUpdated?: Date | null }) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);
  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.1] bg-[var(--bg-deep)] px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="size-1.5 shrink-0 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" />
        <h2 className="truncate text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--text-bright)]">{title}</h2>
        <span className="flex items-center gap-1 rounded border border-[var(--green)]/25 bg-[var(--green)]/10 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.14em] text-[var(--green)]">
          <span className="status-dot size-1 rounded-full bg-[var(--green)]" />
          LIVE
        </span>
        {stats}
        {lastUpdated && (
          <span className="text-[9px] font-mono text-[var(--text-dim)]">
            SYNC {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
      <div className="font-mono text-[13px] font-bold tabular-nums text-[var(--text-secondary)]">{timeStr}</div>
    </div>
  );
}
