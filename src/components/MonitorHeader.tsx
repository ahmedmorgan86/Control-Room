"use client";

import { useEffect, useState } from "react";

export function MonitorHeader({
  title,
  stats,
  lastUpdated,
}: {
  title: string;
  stats?: React.ReactNode;
  lastUpdated?: Date | null;
}) {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 h-11 bg-[#0e1321] border-b border-[#1c273e] shrink-0">
      <div className="flex items-center flex-1 pl-2">
        <h1 className="text-xl font-black text-[#dee2f6] uppercase tracking-[0.05em]">
          {title}
        </h1>
      </div>

      <div className="flex items-center justify-center gap-6 flex-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]" />
          </span>
          <span className="text-sm font-bold text-[#10b981] uppercase tracking-widest">Live</span>
        </div>
        {stats}
        {lastUpdated && (
          <>
            <span className="text-[#1c273e]">·</span>
            <span className="text-sm font-mono text-[#64748b]">
              Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-end flex-1 pr-2">
        <div className="text-right">
          <div className="text-xl font-bold font-mono text-[#dee2f6] tabular-nums leading-none">
            {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-xs font-mono font-semibold text-[#64748b] uppercase leading-none mt-0">
            {clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}
