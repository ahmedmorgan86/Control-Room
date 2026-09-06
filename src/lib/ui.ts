import type { BlockType, EquType, Severity } from "@/lib/types";

export const BLOCK_LABELS: Record<BlockType, string> = {
  DG: "DG",
  RF: "RF",
  EMPTY: "EMPTY",
  IMP_EXP: "IMP/EXP",
  IMP: "IMP",
  EXP: "EXP",
  CFS: "CFS",
  INSP: "INSP",
  NEGLECT: "NEGLECT",
  OTHER: "OTHER",
};

export const BLOCK_COLORS: Record<BlockType, string> = {
  DG: "#dc2626",
  RF: "#06b6d4",
  EMPTY: "#64748b",
  IMP_EXP: "#10b981",
  IMP: "#059669",
  EXP: "#10b981",
  CFS: "#8b5cf6",
  INSP: "#06b6d4",
  NEGLECT: "#a855f7",
  OTHER: "rgba(255,255,255,0.1)",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#64748b",
};

export const EQU_LABELS: Record<EquType, string> = {
  QC: "Quay Crane",
  YT: "Yard Truck",
  RTG: "Rubber-Tyred Gantry",
  RS: "Reach Stacker",
  TL: "Toplift",
  SUPPORT: "Support",
  UNK: "Equipment",
};

export const EQU_ACCENTS: Record<EquType, string> = {
  QC: "#f59e0b",
  YT: "#10b981",
  RTG: "#f97316",
  RS: "#0ea5e9",
  TL: "#8b5cf6",
  SUPPORT: "#64748b",
  UNK: "#64748b",
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

export function fillColor(ratio: number): string {
  if (ratio > 0.85) return "#ef4444";
  if (ratio > 0.7) return "#f59e0b";
  if (ratio > 0.5) return "#10b981";
  return "#00f0ff";
}

export function tttColor(min: number | null | undefined): string {
  if (min == null) return "#64748b";
  if (min >= 30) return "#ef4444";
  if (min >= 20) return "#f97316";
  if (min >= 10) return "#f59e0b";
  return "#10b981";
}

export function tttLabel(min: number | null | undefined): string {
  if (min == null) return "—";
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}

export function blockTypeFromPosition(pos: string | null | undefined): BlockType {
  if (!pos) return "OTHER";
  const p = pos.toUpperCase().trim();
  if (p === "INSP") return "INSP";
  if (/^(S002|S068)$/.test(p)) return "INSP";
  if (/^[A-D]$/.test(p)) return "EXP";
  if (p === "H") return "IMP";
  if (p.startsWith("R") && /^R[0-9]/.test(p)) return "RF";
  if (p.startsWith("E")) return "EMPTY";
  if (p.startsWith("C")) return "CFS";
  return "OTHER";
}
