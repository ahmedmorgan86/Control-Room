"use client";

export function Logo({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex items-center gap-3.5 select-none">
      {/* Official 3-Color Blocks (Red, Green, Blue) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/10 dark:bg-white/5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="w-3.5 h-3.5 rounded bg-red-500 shadow-sm shadow-red-500/50" />
        <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        <div className="w-3.5 h-3.5 rounded bg-blue-600 shadow-sm shadow-blue-600/50" />
      </div>
      <div className="flex flex-col">
        <span
          className="font-mono font-black tracking-[0.06em] text-xs leading-tight"
          style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
        >
          Terminal Monitoring System
        </span>
        <span
          className="font-mono font-bold tracking-[0.2em] text-[8px] uppercase mt-0.5 text-cyan-400"
        >
          Aura Command OS v4.2
        </span>
      </div>
    </div>
  );
}
