import type { MonitorKind, ScreenKey, User } from "@/lib/types";

export const SCREEN_LABELS: Record<ScreenKey, string> = {
  ACT_VSL_MONITOR: "Vessel Monitor",
  DCT_VSL_MONITOR: "Vessel Monitor",
  ACT_EQU_MONITOR: "Equipment Fleet",
  DCT_EQU_MONITOR: "Equipment Fleet",
  ACT_YARD_MONITOR: "Yard Monitor",
  DCT_YARD_MONITOR: "Yard Monitor",
  ACT_YT_TRACKER: "YT Tracker",
  DCT_YT_TRACKER: "YT Tracker",
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

export function getUserScreens(user: User | null): ScreenKey[] {
  if (!user) return [];
  return sortScreens(
    (Object.entries(user.screens) as [ScreenKey, boolean][])
      .filter(([, v]) => v)
      .map(([k]) => k),
  );
}
