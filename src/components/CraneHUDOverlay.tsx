"use client";

import type { Crane } from "@/lib/types";

const CRANE_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e0b", QC11: "#f59e0b", QC12: "#f59e0b",
  QC13: "#ef4444", QC14: "#ef4444", QC15: "#ef4444", QC16: "#ef4444",
  QC17: "#ef4444", QC18: "#ef4444", QC19: "#ef4444", QC20: "#ef4444",
  QC21: "#ef4444", QC22: "#ef4444", QC23: "#ef4444", QC24: "#ef4444",
  QC25: "#ef4444", QC26: "#ef4444", QC27: "#ef4444", QC28: "#ef4444",
  QC29: "#ef4444", QC30: "#ef4444", QC31: "#ef4444", QC32: "#ef4444",
  QC33: "#ef4444", QC34: "#ef4444", QC35: "#ef4444", QC36: "#ef4444",
  QC37: "#ef4444", QC38: "#ef4444", QC39: "#ef4444", QC40: "#ef4444",
  QC41: "#ef4444", QC42: "#ef4444", QC43: "#ef4444", QC44: "#ef4444",
  QC45: "#ef4444", QC46: "#ef4444", QC47: "#ef4444", QC48: "#ef4444",
  QC49: "#ef4444", QC50: "#ef4444", QC51: "#ef4444", QC52: "#ef4444",
  QC53: "#ef4444", QC54: "#ef4444", QC55: "#ef4444", QC56: "#ef4444",
  QC57: "#ef4444", QC58: "#ef4444", QC59: "#ef4444", QC60: "#ef4444",
  QC61: "#ef4444", QC62: "#ef4444", QC63: "#ef4444", QC64: "#ef4444",
  QC65: "#ef4444", QC66: "#ef4444", QC67: "#ef4444", QC68: "#ef4444",
  QC69: "#ef4444", QC70: "#ef4444", QC71: "#ef4444", QC72: "#ef4444",
  QC73: "#ef4444", QC74: "#ef4444", QC75: "#ef4444", QC76: "#ef4444",
  QC77: "#ef4444", QC78: "#ef4444", QC79: "#ef4444", QC80: "#ef4444",
  QC81: "#ef4444", QC82: "#f59e0b",
};

export function CraneHUDOverlay({ crane }: { crane: Crane }) {
  const color = CRANE_COLORS[crane.craneId] ?? "#00f0ff";
  const progress = crane.movesTotal > 0 ? Math.round((crane.movesDone / crane.movesTotal) * 100) : 0;

  return (
    <div
      className="bg-[#090e1c]/95 border-2 rounded-xl p-3 shadow-lg backdrop-blur-sm pointer-events-none"
      style={{
        borderColor: `${color}80`,
        boxShadow: `0 0 12px ${color}22`,
      }}
    >
      <div className="flex items-center justify-between text-xs font-mono font-bold">
        <span className="text-sm" style={{ color }}>STS CRANE {crane.craneId}</span>
        {crane.mph >= 25 ? (
          <span className="text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded text-[10px]">TWIN-LIFT ACTIVE</span>
        ) : crane.movesDone < crane.movesTotal ? (
          <span className="text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded text-[10px]">OPERATING</span>
        ) : (
          <span className="text-[#64748b] bg-[#64748b]/10 px-2 py-0.5 rounded text-[10px]">COMPLETE</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
        <div className="text-[#64748b]">Rate: <span className="text-white font-bold">{crane.mph.toFixed(1)} GMPH</span></div>
        <div className="text-[#64748b]">Moves: <span className="text-[#00f0ff] font-bold">{crane.movesDone}/{crane.movesTotal}</span></div>
        <div className="text-[#64748b]">Load: <span className="text-white font-bold">{crane.loadingDone}/{crane.loadingTotal}</span></div>
        <div className="text-[#64748b]">Disch: <span className="text-white font-bold">{crane.dischargingDone}/{crane.dischargingTotal}</span></div>
      </div>
      <div className="w-full bg-[#060a14] h-1.5 rounded-full mt-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
