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
  GATE_MONITOR: false,
  YARD_MONITOR: false,
  BERTH_MONITOR: false,
};

export function UnderDevelopment({ name }: { name: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          {name}
        </p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mt-1 opacity-60">
          Module Under Development
        </p>
      </div>
    </div>
  );
}

export function isUnderDevelopment(key: ScreenKey): boolean {
  return UNDER_DEVELOPMENT[key] ?? true;
}
