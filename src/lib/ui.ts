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
  DG: "#be185d",
  RF: "#3b82f6",
  EMPTY: "#94a3b8",
  IMP_EXP: "#4d7c0f",
  IMP: "#0f766e",
  EXP: "#10b981",
  CFS: "#6366f1",
  INSP: "#06b6d4",
  NEGLECT: "#a855f7",
  OTHER: "rgba(255,255,255,0.1)",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#8a7a3a",
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
  QC: "#0046af",
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
  if (ratio > 0.7) return "#eab308";
  if (ratio > 0.5) return "#22c55e";
  return "#3b82f6";
}

export function tttColor(min: number | null | undefined): string {
  if (min == null) return "#94a3b8";
  if (min >= 30) return "#ef4444";
  if (min >= 20) return "#f97316";
  if (min >= 10) return "#eab308";
  return "#22c55e";
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
