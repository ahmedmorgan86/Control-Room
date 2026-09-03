"use client";

export function Logo({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official Logo 3-Color Blocks & Terminal Mark */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/10 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
        <div className="w-3.5 h-3.5 rounded bg-[#ef4444] shadow-sm" title="Red Block" />
        <div className="w-3.5 h-3.5 rounded bg-[#10b981] shadow-sm" title="Green Block" />
        <div className="w-3.5 h-3.5 rounded bg-[#2563eb] shadow-sm" title="Blue Block" />
      </div>
      <div className="flex flex-col">
        <span
          className="font-mono font-black tracking-[0.05em] text-xs leading-tight"
          style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
        >
          Terminal Monitoring System
        </span>
        <span
          className="font-mono font-bold tracking-[0.15em] text-[9px] uppercase mt-0.5 text-[var(--text-secondary)]"
        >
          Control Room · Port Operations
        </span>
      </div>
    </div>
  );
}
