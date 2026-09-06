"use client";
import { fillColor } from "@/lib/ui";

export function ProgressBar({
  done,
  total,
  color,
}: {
  done: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 rounded-full bg-[#1c273e] overflow-hidden border border-[#1c273e]/50">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function LiveStatus({
  lastUpdated,
  now,
  error,
  intervalMs,
}: {
  lastUpdated: Date | null;
  now: number;
  error: string | null;
  intervalMs: number;
}) {
  if (!lastUpdated) {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#64748b]" />
        Connecting…
      </span>
    );
  }

  const ageMs = now - lastUpdated.getTime();
  const staleAfter = Math.max(intervalMs * 2.5, intervalMs + 15000);
  const isStale = ageMs > staleAfter;
  const isDown = Boolean(error) && isStale;
  const ageSec = Math.max(0, Math.round(ageMs / 1000));

  const label = isDown
    ? "Connection lost"
    : isStale
      ? "Data may be stale"
      : "Live";
  const color = isDown ? "#ef4444" : isStale ? "#f59e0b" : "#10b981";
  const ageText = ageSec < 60 ? `${ageSec}s ago` : `${Math.round(ageSec / 60)}m ago`;

  return (
    <span
      className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
      style={{ color }}
      title={lastUpdated.toLocaleTimeString()}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isDown || isStale ? "" : "animate-pulse-dot"}`}
        style={{ background: color }}
      />
      {label} · {ageText}
    </span>
  );
}

export function Ring({
  ratio,
  size = 44,
  stroke = 5,
  color,
  bg = "#1c273e",
}: {
  ratio: number;
  size?: number;
  stroke?: number;
  color?: string;
  bg?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, ratio));
  const col = color ?? fillColor(pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className="transition-all duration-700"
      />
    </svg>
  );
}
