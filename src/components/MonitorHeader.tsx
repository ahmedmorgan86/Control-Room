"use client";

import { useState, useEffect, Fragment } from "react";

export default function MonitorHeader({
  title,
  stats,
  lastUpdated,
  error,
  isConnected = true,
}: {
  title: string;
  stats?: React.ReactNode;
  lastUpdated?: Date | null;
  error?: string | null;
  isConnected?: boolean;
}) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 h-11 shrink-0 bg-[var(--bg-panel)] border-b border-[var(--border)]">
      <div className="flex items-center flex-1 pl-2">
        <h1 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-[0.05em]">
          {title}
        </h1>
      </div>
      <div className="flex items-center justify-center gap-5 flex-1">
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
          </span>
          <span className={`text-sm font-bold uppercase tracking-widest ${isConnected ? "text-emerald-600" : "text-red-500"}`}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
        {stats && (
          <span className="text-sm font-mono font-semibold text-[var(--text-secondary)]">
            {stats}
          </span>
        )}
        {lastUpdated && (
          <Fragment>
            <span className="text-[var(--border)]">&middot;</span>
            <span className="text-sm font-mono text-[var(--text-tertiary)]">
              Updated{" "}
              {lastUpdated.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </Fragment>
        )}
        {error && (
          <Fragment>
            <span className="text-[var(--border)]">&middot;</span>
            <span className="text-sm font-mono font-bold text-[var(--accent-discharge)]">
              {error}
            </span>
          </Fragment>
        )}
      </div>
      <div className="flex items-center justify-end flex-1 pr-2">
        <div className="text-right">
          <div className="text-xl font-bold font-mono text-[var(--text-primary)] tabular-nums leading-none">
            {clock.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-xs font-mono font-semibold text-[var(--text-tertiary)] uppercase leading-none">
            {clock.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
