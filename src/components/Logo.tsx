"use client";

export function Logo({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-cyan-500/40 relative overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #020617 100%)"
            : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0f172a 100%)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M7 12h10M12 7v10" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className="font-mono font-black tracking-[0.2em] text-xs leading-tight"
          style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
        >
          NEO-TERMINAL
        </span>
        <span
          className="font-mono font-bold tracking-[0.25em] text-[8px] uppercase mt-0.5 text-cyan-400"
        >
          Command OS v4.2
        </span>
      </div>
    </div>
  );
}
