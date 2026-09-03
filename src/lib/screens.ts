import type { MonitorKind, ScreenKey } from "@/lib/types";

export const SCREEN_LABELS: Record<ScreenKey, string> = {
  ACT_VSL_MONITOR: "ACT Vessel Monitor",
  DCT_VSL_MONITOR: "DCT Vessel Monitor",
  ACT_EQU_MONITOR: "ACT EQU MONITOR",
  DCT_EQU_MONITOR: "DCT EQU MONITOR",
  ACT_YARD_MONITOR: "ACT Yard Monitor",
  DCT_YARD_MONITOR: "DCT Yard Monitor",
  ACT_YT_TRACKER: "ACT YT Tracker",
  DCT_YT_TRACKER: "DCT YT Tracker",
  GATE_MONITOR: "Gate Monitor",
  YARD_MONITOR: "Yard Monitor",
  BERTH_MONITOR: "Berth Monitor",
};

export function screenKind(key: ScreenKey): MonitorKind {
  if (key.includes("VSL")) return "VSL";
  if (key.includes("EQU")) return "EQU";
  if (key.includes("YARD") || key.includes("YT")) return "YARD";
  return "OTHER";
}

export function screenTerminal(key: ScreenKey): string | null {
  const parts = key.split("_");
  return parts[0] === "ACT" || parts[0] === "DCT" ? parts[0] : null;
}

export function sortScreens(keys: ScreenKey[]): ScreenKey[] {
  const rank = (k: ScreenKey) =>
    k.includes("VSL") ? 0 : k.includes("EQU") ? 1 : k.includes("YARD") ? 2 : 99;
  return [...keys].sort((a, b) => rank(a) - rank(b));
}
