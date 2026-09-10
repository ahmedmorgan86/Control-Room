import type { BlockType } from "@/lib/types";

export const BLOCK_COLORS: Record<BlockType, string> = {
  DG: "#ef4444",
  RF: "#22d3ee",
  EMPTY: "#64748b",
  IMP_EXP: "#10b981",
  IMP: "#059669",
  EXP: "#10b981",
  CFS: "#a855f7",
  INSP: "#22d3ee",
  NEGLECT: "#a855f7",
  OTHER: "#475569",
};

export function formatCount(v: number | undefined | null): string {
  if (v == null) return "0";
  return v.toLocaleString("en-US");
}

export function formatArrival(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tttColor(min: number | null | undefined): string {
  if (min == null) return "var(--text-secondary)";
  if (min >= 30) return "var(--red)";
  if (min >= 20) return "var(--orange)";
  if (min >= 10) return "var(--amber)";
  return "var(--green)";
}

export function tttLabel(min: number | null | undefined): string {
  if (min == null) return "—";
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}
