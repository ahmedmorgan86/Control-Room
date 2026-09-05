"use client";

import type { ScreenKey } from "@/lib/types";

const UNDER_DEVELOPMENT: Record<ScreenKey, boolean> = {
  ACT_VSL_MONITOR: false,
  DCT_VSL_MONITOR: false,
  ACT_EQU_MONITOR: false,
  DCT_EQU_MONITOR: false,
  ACT_YARD_MONITOR: false,
  DCT_YARD_MONITOR: false,
  ACT_YT_TRACKER: false,
  DCT_YT_TRACKER: false,
  GATE_MONITOR: true,
  YARD_MONITOR: true,
  BERTH_MONITOR: true,
};

export function UnderDevelopment({ name }: { name: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-page)]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">
          Module Under Development
        </p>
        <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
          The{" "}
          <span className="font-bold text-[var(--text-secondary)]">{name}</span>{" "}
          screen is not yet available.
        </p>
      </div>
    </div>
  );
}

export function isUnderDevelopment(key: ScreenKey): boolean {
  return UNDER_DEVELOPMENT[key] ?? true;
}
