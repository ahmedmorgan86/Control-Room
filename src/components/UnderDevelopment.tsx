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
    <div className="flex-1 flex flex-col items-center justify-center bg-[#060a14]">
      <div className="text-center">
        <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#64748b] mb-2">
          Module Under Development
        </p>
        <p className="text-[11px] font-mono text-[#64748b]">
          The{" "}
          <span className="font-bold text-[#94a3b8]">{name}</span>{" "}
          screen is not yet available.
        </p>
      </div>
    </div>
  );
}

export function isUnderDevelopment(key: ScreenKey): boolean {
  return UNDER_DEVELOPMENT[key] ?? true;
}
