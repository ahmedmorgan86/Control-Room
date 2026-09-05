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
  DG: "#b23a2e",
  RF: "#3d6e8c",
  EMPTY: "#8a8578",
  IMP_EXP: "#6d5b8a",
  IMP: "#3f7d52",
  EXP: "#a8471d",
  CFS: "#4f6474",
  INSP: "#9c6b12",
  NEGLECT: "#8a3226",
  OTHER: "#a39e92",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: "#b23a2e",
  HIGH: "#a8471d",
  MEDIUM: "#9c6b12",
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
  QC: "#a8471d",
  YT: "#3f7d52",
  RTG: "#9c6b12",
  RS: "#4f6474",
  TL: "#6d5b8a",
  SUPPORT: "#8a8578",
  UNK: "#a39e92",
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
  if (ratio >= 0.9) return "#b23a2e";
  if (ratio >= 0.75) return "#a8471d";
  if (ratio >= 0.6) return "#9c6b12";
  return "#3f7d52";
}

export function tttColor(min: number | null | undefined): string {
  if (min == null) return "#a39e92";
  if (min >= 30) return "#b23a2e";
  if (min >= 20) return "#a8471d";
  if (min >= 10) return "#9c6b12";
  return "#3f7d52";
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
