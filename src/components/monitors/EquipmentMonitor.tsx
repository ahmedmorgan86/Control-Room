"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import type { EquipmentData, QCGroup, YardSection } from "@/lib/types";

/* ─── Dark mode hook (mirrors original's isDarkMode prop) ─── */
function useIsDarkMode() {
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.body.classList.contains("dark"),
  );
  useEffect(() => {
    const el = document.body;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/* ─── Pixel icons (ported verbatim from original chunk) ─── */
const CraneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <path d="M18,92 L18,30 L24,30 L24,92 Z" opacity="0.9" />
    <path d="M48,92 L48,30 L54,30 L54,92 Z" opacity="0.9" />
    <path d="M5,30 L95,30 L95,22 L5,22 Z" />
    <path d="M15,22 L35,4 L55,22" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <rect x="22" y="15" width="22" height="7" rx="0.5" />
    <rect x="64" y="30" width="14" height="6" rx="0.5" />
    <rect x="65" y="36" width="6" height="4" rx="0.2" opacity="0.7" />
    <path d="M66,36 L66,58 M76,36 L76,58" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="63" y="58" width="16" height="3.5" rx="0.5" />
    <path d="M24,40 L48,65 M48,40 L24,65" stroke="currentColor" strokeWidth="0.6" opacity="0.2" fill="none" />
    <path d="M24,65 L48,90 M48,65 L24,90" stroke="currentColor" strokeWidth="0.6" opacity="0.2" fill="none" />
    <rect x="15" y="88" width="12" height="4" rx="1" opacity="0.8" />
    <rect x="45" y="88" width="12" height="4" rx="1" opacity="0.8" />
    <circle cx="18" cy="94" r="2.5" />
    <circle cx="24" cy="94" r="2.5" />
    <circle cx="48" cy="94" r="2.5" />
    <circle cx="54" cy="94" r="2.5" />
  </svg>
);

const TruckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <rect x="5" y="70" width="92" height="5" rx="1" />
    <path d="M8,70 L8,45 L36,45 L36,70 Z" />
    <path d="M36,55 L41,55 L41,70 L36,70 Z" opacity="0.8" />
    <rect x="11" y="48" width="22" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
    <path d="M38,55 L38,35 L40,35 L40,55 Z" opacity="0.7" />
    <path d="M60,70 L65,62 L80,62 L85,70" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="60" y="42" width="35" height="20" rx="1" opacity="0.25" />
    <circle cx="22" cy="76" r="6" />
    <circle cx="80" cy="76" r="6" />
    <circle cx="92" cy="76" r="6" />
    <circle cx="22" cy="76" r="2" opacity="0.5" />
    <circle cx="80" cy="76" r="2" opacity="0.5" />
    <circle cx="92" cy="76" r="2" opacity="0.5" />
  </svg>
);

const GantryCraneIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <rect x="15" y="20" width="70" height="10" rx="1" />
    <path d="M20,30 L20,85 L28,85 L28,30 Z" opacity="0.8" />
    <path d="M72,30 L72,85 L80,85 L80,30 Z" opacity="0.8" />
    <rect x="42" y="30" width="16" height="8" rx="0.5" />
    <path d="M46,38 L46,55 M54,38 L54,55" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <rect x="35" y="55" width="30" height="6" rx="1" opacity="0.6" />
    <rect x="16" y="85" width="16" height="5" rx="1" />
    <rect x="68" y="85" width="16" height="5" rx="1" />
    <circle cx="20" cy="92" r="3" />
    <circle cx="28" cy="92" r="3" />
    <circle cx="72" cy="92" r="3" />
    <circle cx="80" cy="92" r="3" />
  </svg>
);

const ReachstackerIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <path d="M5,82 L65,82 L60,60 L5,60 Z" />
    <path d="M5,60 L15,45 L25,45 L25,60 Z" opacity="0.8" />
    <rect x="28" y="50" width="16" height="11" rx="1" opacity="0.9" />
    <rect x="31" y="53" width="10" height="5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <path d="M12,50 L85,20 L92,28 L15,58 Z" opacity="0.8" />
    <path d="M45,36 L88,18 L94,24 L48,42 Z" opacity="0.4" />
    <rect x="78" y="28" width="20" height="4" rx="0.5" />
    <path d="M82,32 L85,45 L95,45 L98,32" opacity="0.3" />
    <circle cx="52" cy="84" r="9" />
    <circle cx="68" cy="84" r="9" />
    <circle cx="15" cy="86" r="6" />
  </svg>
);

const TopliftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <path d="M10,82 L65,82 L62,55 L10,55 Z" />
    <rect x="12" y="42" width="18" height="13" rx="1" opacity="0.8" />
    <rect x="15" y="46" width="12" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    <path d="M58,82 L58,15 L66,15 L66,82 Z" />
    <path d="M60,25 L64,25 M60,45 L64,45 M60,65 L64,65" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    <rect x="66" y="20" width="8" height="25" rx="0.5" />
    <rect x="74" y="25" width="22" height="4" rx="0.5" />
    <path d="M74,29 L78,40 L92,40 L96,29" opacity="0.3" />
    <circle cx="52" cy="84" r="9" />
    <circle cx="68" cy="84" r="9" />
    <circle cx="18" cy="86" r="6" />
  </svg>
);

const PersonGlyph = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ClockGlyph = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

/* ─── Poste (palette + block colors) ─── */
const PALETTE: Record<
  string,
  { accent: string; header: (dark: boolean) => string; Icon: React.FC<{ className?: string }> }
> = {
  QC: { accent: "#0046af", header: (d) => (d ? "rgba(0,70,175,0.85)" : "#0046af"), Icon: CraneIcon },
  YT: { accent: "#10b981", header: (d) => (d ? "rgba(5,120,80,0.85)" : "#059669"), Icon: TruckIcon },
  RTG: { accent: "#f97316", header: (d) => (d ? "rgba(190,75,0,0.85)" : "#f97316"), Icon: GantryCraneIcon },
  RS: { accent: "#0ea5e9", header: (d) => (d ? "rgba(7,89,133,0.85)" : "#0ea5e9"), Icon: ReachstackerIcon },
  TL: { accent: "#8b5cf6", header: (d) => (d ? "rgba(100,60,200,0.85)" : "#7c3aed"), Icon: TopliftIcon },
  UNK: { accent: "#64748b", header: (d) => (d ? "rgba(40,50,65,0.85)" : "#64748b"), Icon: CraneIcon },
};

const BLOCK_COLORS: Record<string, string> = {
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

function blockColor(key: string | null | undefined, map: Record<string, string>) {
  if (!key) return BLOCK_COLORS.OTHER;
  const s = key.toUpperCase();
  const mapped = map[s];
  if (mapped && BLOCK_COLORS[mapped]) return BLOCK_COLORS[mapped];
  if (s.startsWith("INSP") || s.startsWith("SCAN")) return BLOCK_COLORS.INSP;
  if (s.startsWith("CFS")) return BLOCK_COLORS.CFS;
  if (s.startsWith("RF")) return BLOCK_COLORS.RF;
  if (s.startsWith("DG")) return BLOCK_COLORS.DG;
  if (s.startsWith("NEG")) return BLOCK_COLORS.NEGLECT;
  const r = s.charAt(0);
  if (r === "R") return BLOCK_COLORS.RF;
  if (r === "E") return BLOCK_COLORS.EMPTY;
  if (r === "S") return BLOCK_COLORS.INSP;
  if (r === "C") return BLOCK_COLORS.CFS;
  if (["A", "B", "C", "D", "E", "F", "G", "H", "I"].includes(r)) return BLOCK_COLORS.IMP;
  if (["J", "K", "L", "M", "N", "O", "P", "Q"].includes(r)) return BLOCK_COLORS.EXP;
  return BLOCK_COLORS.OTHER;
}

function tttColorClass(minutes: number) {
  if (minutes >= 30)
    return "bg-red-600 text-white border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]";
  if (minutes >= 20)
    return "bg-orange-500 text-white border-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.3)]";
  if (minutes >= 10) return "bg-amber-500 text-white border-amber-400";
  return "bg-black/30 text-white/90 border-white/10";
}

function hexToRgbString(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`
    : "100,116,139";
}

function truncateName(name: string | null | undefined) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  return parts.length <= 2 ? name : `${parts[0]} ${parts[parts.length - 1]}`;
}

function columnsForType(type: string) {
  if (type === "YT") return 3;
  if (type === "RTG") return 4;
  if (type === "SUPPORT") return 2;
  return 3;
}

/* ─── Card (original `z`) ─── */
interface EquipCardData {
  equNo: string;
  equType?: string | null;
  displayName?: string | null;
  isOnline?: boolean | null;
  driverName?: string | null;
  position?: string | null;
  jobType?: string | null;
  tttMinutes?: number | null;
  movesLastHour?: number;
}

function EquipmentCard({
  card,
  dark,
  blockTypeMap,
}: {
  card: EquipCardData;
  dark: boolean;
  blockTypeMap: Record<string, string>;
}) {
  const palette = PALETTE[card.equType || "UNK"] ?? PALETTE.UNK;
  const { Icon } = palette;
  const bg = palette.header(dark);
  const posColor = card.position ? blockColor(card.position, blockTypeMap) : null;

  return (
    <div
      className={`relative flex-1 h-full min-h-0 flex flex-col rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-2 shadow-sm ${
        !card.isOnline && !card.driverName ? "opacity-60 grayscale-[0.3]" : ""
      }`}
      style={{ background: bg, borderColor: "rgba(0,0,0,0.1)" }}
    >
      <Icon className="absolute -right-3 -bottom-5 w-32 h-32 text-black/10 -rotate-12 pointer-events-none" />
      <div className="flex flex-col p-2 flex-1 relative z-10 justify-between">
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0 text-white/90" />
              <span
                className="font-mono font-black tracking-wider truncate leading-none"
                style={{ fontSize: "clamp(15px, 1.1vw, 19px)", color: "#ffffff" }}
              >
                {card.displayName ?? card.equNo}
              </span>
            </div>
            <div className="flex shrink-0">
              {card.isOnline ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              ) : card.driverName ? (
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]" />
              ) : (
                <div className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter leading-none shadow-sm border border-white/30">
                  Offline
                </div>
              )}
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 font-mono truncate leading-none uppercase max-w-[90%]"
            style={{ fontSize: "clamp(10px, 0.7vw, 13px)", color: "#ffffff" }}
          >
            <PersonGlyph className="w-3.5 h-3.5 shrink-0 text-white/60" />
            <span className="truncate opacity-90">{truncateName(card.driverName) ?? "NO DRIVER"}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5">
            {card.position && posColor && (
              <div
                className="px-2 py-0.5 rounded text-[12px] font-mono font-black text-white uppercase shadow-inner border h-[26px] flex items-center"
                style={{ backgroundColor: posColor, borderColor: "rgba(0,0,0,0.25)" }}
              >
                {card.position}
              </div>
            )}
            {card.jobType && (
              <div className="bg-black/20 px-2 py-0.5 rounded text-[12px] font-black text-white border border-black/25 uppercase w-fit h-[26px] flex items-center shadow-inner">
                {card.jobType}
              </div>
            )}
            {card.tttMinutes !== null && card.tttMinutes !== undefined && (
              <div
                className={`px-1.5 py-0.5 rounded text-[12px] font-mono font-black border flex items-center justify-center gap-1 shadow-inner h-[26px] transition-colors duration-300 ${tttColorClass(card.tttMinutes)}`}
                style={{ borderColor: "rgba(0,0,0,0.25)" }}
              >
                <ClockGlyph className="w-3 h-3 flex-shrink-0" />
                <span className="leading-none">{card.tttMinutes}m</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1 bg-black/20 px-2 py-0.5 rounded shadow-inner border border-black/25">
            <span
              className="font-mono font-black tabular-nums text-white leading-none"
              style={{ fontSize: "clamp(14px, 1.1vw, 20px)" }}
            >
              {card.movesLastHour ?? 0}
            </span>
            <span className="font-mono uppercase tracking-wider text-white/40 leading-none text-[8px]">
              MPH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── YT truck chip (original `G`) ─── */
function YtChip({
  yt,
  dark,
  blockTypeMap,
}: {
  yt: EquipCardData;
  dark: boolean;
  blockTypeMap: Record<string, string>;
}) {
  const bg = PALETTE.YT.header(dark);
  const posColor = yt.position ? blockColor(yt.position, blockTypeMap) : null;

  return (
    <div
      className={`flex flex-col h-full rounded-t-lg rounded-b-none overflow-hidden border-2 transition-all hover:brightness-105 relative shadow-sm ${
        !yt.isOnline && !yt.driverName ? "opacity-60 grayscale-[0.3]" : ""
      }`}
      style={{ background: bg, borderColor: "rgba(0,0,0,0.1)" }}
    >
      <TruckIcon className="absolute -right-3 -bottom-5 w-32 h-32 text-black/10 -rotate-12 pointer-events-none" />
      <div className="flex-1 flex flex-col p-2 relative z-10 justify-between">
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-white/90" />
              <span className="text-lg font-mono font-black tracking-tight leading-none text-white">
                {yt.displayName ?? yt.equNo}
              </span>
            </div>
            <div className="flex shrink-0">
              {yt.isOnline ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              ) : yt.driverName ? (
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]" />
              ) : (
                <div className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter leading-none shadow-sm border border-white/30">
                  Offline
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 max-w-[90%] -mt-0.5">
            <PersonGlyph className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[12px] font-mono truncate uppercase tracking-tight text-white/90 leading-none">
              {truncateName(yt.driverName) ?? "NO DRIVER"}
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5">
            {yt.position && posColor && (
              <div
                className="px-2 py-0.5 rounded text-[12px] font-mono font-black text-white uppercase shadow-inner border h-[26px] flex items-center"
                style={{ backgroundColor: posColor, borderColor: "rgba(0,0,0,0.25)" }}
              >
                {yt.position}
              </div>
            )}
            {yt.jobType && (
              <div className="bg-black/15 px-2 py-0.5 rounded text-[12px] font-black text-white border border-black/20 uppercase w-fit h-[26px] flex items-center shadow-inner">
                {yt.jobType}
              </div>
            )}
            {yt.tttMinutes !== null && yt.tttMinutes !== undefined && (
              <div
                className={`px-1.5 py-0.5 rounded text-[12px] font-mono font-black border flex items-center justify-center gap-1 shadow-inner h-[26px] transition-colors duration-300 ${tttColorClass(yt.tttMinutes)}`}
                style={{ borderColor: "rgba(0,0,0,0.25)" }}
              >
                <ClockGlyph className="w-3 h-3 flex-shrink-0" />
                <span className="leading-none">{yt.tttMinutes}m</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1 bg-black/20 px-2 py-0.5 rounded shadow-inner border border-black/25">
            <span className="text-xl font-mono font-black tabular-nums text-white leading-none">
              {yt.movesLastHour ?? 0}
            </span>
            <span className="text-[7px] font-mono font-black text-white/40 tracking-wider uppercase leading-none">
              MPH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── QC group row (original `Y`) ─── */
function QCGroupRow({
  group,
  dark,
  maxColumns,
  blockTypeMap,
}: {
  group: QCGroup;
  dark: boolean;
  maxColumns: number;
  blockTypeMap: Record<string, string>;
}) {
  const isAmber = ["QC09", "QC82"].includes(group.qcNo);
  const accent = isAmber ? "#F59E0B" : PALETTE.QC.accent;
  const bg =
    dark
      ? isAmber
        ? "rgba(65, 50, 20, 0.9)"
        : "rgba(40, 60, 110, 0.9)"
      : isAmber
        ? "rgba(255, 248, 220, 1)"
        : "rgba(185, 210, 245, 1)";
  const gradient = `linear-gradient(90deg, ${accent} 0%, ${accent} 120px, ${bg} 260px, ${bg} 100%)`;

  return (
    <div
      className="w-full flex items-stretch h-[var(--qc-row-height)] min-h-0 rounded-xl overflow-hidden border-2 shadow-md"
      style={{ background: gradient, borderColor: accent }}
    >
      <div className="flex flex-1 max-w-[280px] items-center justify-between p-3 shrink-0 relative overflow-hidden">
        <CraneIcon className="absolute -right-10 -bottom-17 w-44 h-44 text-black/10 -rotate-12" />
        <div className="relative z-10 flex flex-col justify-center h-full">
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-mono font-black text-white tracking-tighter leading-none drop-shadow-sm">
              {group.qcNo}
            </span>
            <div className="flex items-baseline gap-1.5 bg-black/20 px-3 py-1 rounded-md shadow-inner">
              <span className="text-3xl font-mono font-black text-white leading-none">
                {group.qcCard.movesLastHour}
              </span>
              <span className="text-[10px] font-mono font-black text-white/40 tracking-widest uppercase">
                MPH
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="p-0.5 rounded-full bg-white/10">
              <PersonGlyph className="w-3.5 h-3.5 text-white/70" />
            </div>
            <span className="text-sm font-mono font-black text-white/90 tracking-wide uppercase truncate max-w-[160px]">
              {truncateName(group.qcCard.driverName) ?? "NO DRIVER"}
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex-1 grid gap-2 pt-2 px-2 pb-0 overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${maxColumns}, 1fr)` }}
      >
        {group.ytCards.length > 0 ? (
          group.ytCards.map((yt) => (
            <YtChip key={yt.equNo} yt={yt} dark={dark} blockTypeMap={blockTypeMap} />
          ))
        ) : (
          <div className="col-span-full flex items-center gap-8 pl-4">
            <div className="flex items-center gap-4 opacity-20">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-black/30 flex items-center justify-center">
                <TruckIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-mono font-black uppercase tracking-[0.2em]">
                No Trucks Assigned
              </span>
            </div>
            {group.pendingOrdersCount > 0 && (
              <div className="flex items-center gap-4 bg-black/10 px-5 py-2 rounded-lg border border-black/5 shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-mono font-black text-white leading-none drop-shadow-sm">
                    {group.pendingOrdersCount}
                  </span>
                  <span className="text-[8px] font-mono font-black text-white/50 uppercase tracking-widest mt-1">
                    Pending
                  </span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <span className="text-[10px] font-mono font-black text-white/70 uppercase tracking-wider leading-tight max-w-[120px]">
                  Orders waiting for transport
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── QC no-trucks chip (original `H`) ─── */
function QCNoTrucksRow({ group }: { group: QCGroup }) {
  const isAmber = ["QC09", "QC82"].includes(group.qcNo);
  const accent = isAmber ? "#F59E0B" : PALETTE.QC.accent;

  return (
    <div
      className="w-[300px] flex items-center justify-between pl-6 pr-3 rounded-xl border-2 shadow-md relative overflow-hidden h-[var(--qc-row-height)] min-h-0 shrink-0"
      style={{ background: accent, borderColor: accent }}
    >
      <CraneIcon className="absolute -right-4 -bottom-8 w-32 h-32 text-black/10 -rotate-12" />
      <div className="relative z-10 flex flex-col justify-center">
        <span className="text-4xl font-mono font-black text-white tracking-tighter leading-none mb-1 drop-shadow-sm">
          {group.qcNo}
        </span>
        <div className="flex items-center gap-2">
          <div className="p-0.5 rounded-full bg-white/10">
            <PersonGlyph className="w-3 h-3 text-white/60" />
          </div>
          <span className="text-[10px] font-mono font-black text-white/80 uppercase truncate max-w-[100px]">
            {truncateName(group.qcCard.driverName) ?? "No Driver"}
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="bg-black/20 w-[68px] h-[68px] rounded-xl flex flex-col items-center justify-center border border-white/10 shadow-inner">
          <span className="text-3xl font-mono font-black text-white leading-none drop-shadow-sm">
            {group.pendingOrdersCount}
          </span>
          <span className="text-[10px] font-mono font-black text-white/80 uppercase tracking-[0.05em] mt-1">
            Pending
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Yard section (original `U`) ─── */
function YardSectionCard({
  section,
  dark,
  blockTypeMap,
}: {
  section: YardSection;
  dark: boolean;
  blockTypeMap: Record<string, string>;
}) {
  const palette = PALETTE[section.equType] ?? PALETTE.UNK;
  const accent = section.accent ?? section.accentColor ?? palette.accent;
  const rgb = hexToRgbString(accent);
  const bg = dark ? `rgba(${rgb},0.08)` : `rgba(${rgb},0.05)`;
  const border = dark ? `rgba(${rgb},0.28)` : `rgba(${rgb},0.2)`;
  const cols = columnsForType(section.equType);

  return (
    <div
      className="flex-1 min-h-0 flex flex-col gap-1.5 rounded-lg p-2"
      style={{ background: bg, border: `1.5px solid ${border}` }}
    >
      <div className="flex items-center gap-2 px-0.5 shrink-0">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
        <span
          className="text-[11px] font-mono font-black uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {section.label}
        </span>
        <div className="h-px flex-1 opacity-20" style={{ background: accent }} />
        <span className="text-[8px] font-mono opacity-50" style={{ color: accent }}>
          {section.cards.length} Active
        </span>
      </div>
      <div
        className="flex-1 grid gap-1.5 min-h-0"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: "minmax(0, 1fr)" }}
      >
        {section.cards.map((card) => (
          <EquipmentCard key={card.equNo} card={card} dark={dark} blockTypeMap={blockTypeMap} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main component (original `Q`) ─── */
export default function EquipmentMonitor({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const dark = useIsDarkMode();
  const [data, setData] = useState<EquipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(
        `/api/equipment?terminal=${terminalCode}&t=${Date.now()}`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.details || `HTTP ${res.status}`);
      }
      setData(await res.json());
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.group("❌ Equipment Data Fetch Failed");
      console.error("Error Detail:", err);
      console.groupEnd();
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Request Timed Out (15s)"
          : err instanceof Error
            ? err.message
            : "Failed to fetch",
      );
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [terminalCode]);

  useEffect(() => {
    const immediate = setTimeout(fetchData, 0);
    const now = new Date();
    const untilMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval: ReturnType<typeof setInterval> | undefined;
    const synced = setTimeout(() => {
      fetchData();
      interval = setInterval(fetchData, 30000);
    }, untilMinute);
    return () => {
      clearTimeout(immediate);
      clearTimeout(synced);
      if (interval) clearInterval(interval);
    };
  }, [fetchData]);

  const hasQC = (data?.qcGroups.length ?? 0) > 0;
  const hasYard = (data?.yardSections.length ?? 0) > 0;
  const activeQC = data?.qcGroups.filter((g) => g.ytCards.length > 0) ?? [];
  const idleQC = data?.qcGroups.filter((g) => g.ytCards.length === 0) ?? [];
  const maxColumns = Math.max(5, ...activeQC.map((g) => g.ytCards.length));
  const maxRows = Math.max(1, activeQC.length + Math.ceil(idleQC.length / 4));
  const blockTypeMap = data?.blockTypeMap ?? {};

  const cssVars = {
    "--qc-row-height": `clamp(58px, calc((48vh - 24px) / ${maxRows}), 96px)`,
    "--yard-card-rows": Math.max(
      1,
      ...(data?.yardSections ?? []).map((s) => Math.ceil(s.cards.length / columnsForType(s.equType))),
    ),
  } as React.CSSProperties;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]" style={cssVars}>
      <MonitorHeader
        title={`${terminalCode} Equipment Monitor`}
        stats={
          data
            ? `${data.totalActive} Active · ${data.totalOnline} Online · ${data.qcGroups.length} QC Ops`
            : undefined
        }
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-2">
        {loading && !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest">
              Connecting to Equipment Database
            </p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-red-400 bg-red-50 dark:bg-red-900/20 px-8 py-6 text-center max-w-md rounded-lg">
              <div className="text-xs font-bold font-mono text-red-500 uppercase tracking-widest mb-2">
                Connection Fault
              </div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data && (hasQC || hasYard) ? (
          <div className="flex-1 flex flex-col gap-[clamp(4px,0.8vh,12px)] min-h-0">
            <div className="flex flex-col gap-[clamp(4px,0.7vh,10px)] shrink-0">
              <div className="flex items-center gap-2 px-1">
                <CraneIcon className="w-4 h-4 text-[var(--accent-blue)]" />
                <h2 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                  Vessel Operations
                </h2>
                <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
              </div>
              <div className="flex flex-col gap-[clamp(4px,0.6vh,8px)] min-h-0">
                {hasQC ? (
                  <Fragment>
                    {activeQC.map((group) => (
                      <QCGroupRow
                        key={group.qcNo}
                        group={group}
                        dark={dark}
                        maxColumns={maxColumns}
                        blockTypeMap={blockTypeMap}
                      />
                    ))}
                    {idleQC.length > 0 && (
                      <div className="flex flex-wrap gap-2 w-full">
                        {idleQC.map((group) => (
                          <QCNoTrucksRow key={group.qcNo} group={group} />
                        ))}
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-[var(--border)] rounded-xl opacity-40">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                      No Active Vessel Operations
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-1 mt-2">
              <GantryCraneIcon className="w-4 h-4 text-orange-500" />
              <h2 className="text-xs font-mono font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                Yard Operations
              </h2>
              <div className="h-px flex-1 bg-[var(--border)] opacity-30" />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {hasYard ? (
                <div className="flex-1 grid grid-cols-9 gap-2 items-stretch overflow-hidden">
                  {(() => {
                    const sections = data.yardSections;
                    const combined: YardSection[] = [];
                    let support: YardSection | null = null;
                    let ytSection: YardSection | null = null;
                    let rtgSection: YardSection | null = null;

                    sections.forEach((s) => {
                      if (s.equType === "RS" || s.equType === "TL") {
                        if (!support) {
                          support = {
                            equType: "SUPPORT",
                            label: "Reach Stackers and Toplifts",
                            accent: "#8b5cf6",
                            accentColor: "#8b5cf6",
                            cards: [],
                          };
                        }
                        support.cards.push(...s.cards);
                      } else if (s.equType === "YT") ytSection = s;
                      else if (s.equType === "RTG") rtgSection = s;
                    });

                    if (ytSection) combined.push(ytSection);
                    if (rtgSection) combined.push(rtgSection);
                    if (support) combined.push(support);

                    return combined.map((section) => {
                      let colSpan = "col-span-2";
                      if (section.equType === "YT") colSpan = "col-span-3";
                      else if (section.equType === "RTG") colSpan = "col-span-4";
                      return (
                        <div key={section.equType} className={`${colSpan} h-full`}>
                          <YardSectionCard
                            section={section}
                            dark={dark}
                            blockTypeMap={blockTypeMap}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-40">
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                    No Active Yard Equipment
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="border border-[var(--border)] px-12 py-8 text-center rounded-lg">
              <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2 text-[var(--text-tertiary)]">
                No Active Equipment
              </div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                No equipment with pending jobs. Updates automatically.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}