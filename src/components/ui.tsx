"use client";

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
    <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-progress)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Ring({
  ratio,
  size = 44,
  stroke = 5,
  color,
  bg = "var(--bg-progress)",
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
  const col = color ?? (pct >= 0.9 ? "#dc2626" : pct >= 0.75 ? "#f97316" : pct >= 0.6 ? "#f59e0b" : "#059669");
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
