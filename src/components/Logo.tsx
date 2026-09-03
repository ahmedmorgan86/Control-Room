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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M12 3v9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="#38bdf8" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className="font-mono font-black tracking-[0.15em] text-xs leading-tight"
            style={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
          >
            CONTROL ROOM
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% SYNCED
          </span>
        </div>
        <span
          className="font-mono font-bold tracking-[0.2em] text-[8px] uppercase mt-0.5 text-cyan-500"
        >
          Live backend: 172.16.20.249:3000
        </span>
      </div>
    </div>
  );
}
