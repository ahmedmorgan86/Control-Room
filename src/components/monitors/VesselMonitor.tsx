"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MonitorHeader from "@/components/MonitorHeader";
import { useMonitorData } from "@/lib/useMonitorData";
import type { VesselData, CraneData } from "@/lib/types";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
      <p className="text-xs font-mono uppercase tracking-widest">
        Connecting to Terminal Database
      </p>
    </div>
  );
}

function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="border border-[var(--accent-discharge)] bg-red-50 px-8 py-6 text-center max-w-md">
        <div className="text-xs font-bold font-mono text-[var(--accent-discharge)] uppercase tracking-widest mb-2">
          Connection Fault
        </div>
        <p className="text-[11px] font-mono text-[var(--text-secondary)] mb-4">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-[var(--accent-discharge)] hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
      <div className="border border-[var(--border)] px-12 py-8 text-center">
        <div className="text-xs font-bold font-mono uppercase tracking-widest mb-2">
          No Vessel Data
        </div>
        <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
          Waiting for GC order data.
          <br />
          Display will update automatically.
        </p>
      </div>
    </div>
  );
}

function sortCranes(a: CraneData, b: CraneData) {
  return (
    a.layoutRank - b.layoutRank || a.craneId.localeCompare(b.craneId)
  );
}

const WAVES = [
  { phase: 0.3, freq: 0.4, amp: 3, y: 26, op: 0.3, color: "var(--wave-1)", speed: 0.3 },
  { phase: -0.5, freq: 0.2, amp: 6, y: 32, op: 0.4, color: "var(--wave-2)", speed: -0.4 },
  { phase: 0.8, freq: 0.3, amp: 4, y: 38, op: 0.8, color: "var(--wave-3)", speed: 0.6 },
  { phase: -0.2, freq: 0.15, amp: 8, y: 44, op: 0.6, color: "var(--wave-4)", speed: -0.2 },
  { phase: 1.1, freq: 0.5, amp: 2, y: 50, op: 0.7, color: "var(--wave-5)", speed: 0.9 },
  { phase: -0.7, freq: 0.25, amp: 7, y: 56, op: 0.8, color: "var(--wave-6)", speed: -0.7 },
  { phase: 0.4, freq: 0.35, amp: 4, y: 56, op: 0.85, color: "var(--wave-7)", speed: 0.5 },
  { phase: -1.2, freq: 0.45, amp: 3, y: 64, op: 0.9, color: "var(--wave-8)", speed: -1.1 },
  { phase: 0.6, freq: 0.18, amp: 9, y: 72, op: 0.92, color: "var(--wave-6)", speed: 0.3 },
  { phase: -0.4, freq: 0.4, amp: 4, y: 80, op: 0.94, color: "var(--wave-7)", speed: -0.8 },
  { phase: 0.2, freq: 0.22, amp: 6, y: 88, op: 0.96, color: "var(--wave-8)", speed: 0.4 },
  { phase: -0.8, freq: 0.3, amp: 5, y: 96, op: 1.0, color: "var(--wave-8)", speed: -1.2 },
];

interface WaveDef {
  phase: number;
  freq: number;
  amp: number;
  y: number;
  op: number;
  color: string;
  speed: number;
}

function WaveLayer({
  waves,
  time,
}: {
  waves: WaveDef[];
  time: number;
}) {
  return (
    <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
      {waves.map((w, i) => {
        const s = time * w.speed;
        const points: string[] = [];
        for (let a = 0; a <= 60; a++) {
          const xPos = (a / 60) * 150;
          const yPos =
            w.y +
            Math.sin(a * w.freq + s) * w.amp +
            Math.sin(a * (1.8 * w.freq) + 1.3 * s) * (0.4 * w.amp);
          points.push(`${xPos},${yPos}`);
        }
        const d = `M 0,100 L 0,${w.y} ${points.map((p) => `L ${p}`).join(" ")} L 150,${w.y} L 150,100 Z`;
        return <path key={i} d={d} fill={w.color} opacity={w.op} />;
      })}
    </svg>
  );
}

function VesselScope({
  cranes,
  vesselName,
  duplicateCraneIds,
}: {
  cranes: CraneData[];
  vesselName: string;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = cranes.filter((c) => c.movesDone < c.movesTotal).sort(sortCranes);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let raf = 0;
    let tick = (t: number) => {
      setTime(0.002 * t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sway = 3.5 * Math.sin(0.7 * time);
  const roll = 0.8 * Math.sin(0.6 * time);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-vessel-viz)]">
      {/* Distant wave layer */}
      <div
        className="absolute bottom-0 left-0 z-0 pointer-events-none"
        style={{ width: "100%", height: "52%" }}
      >
        <WaveLayer waves={WAVES.slice(0, 2)} time={time} />
      </div>
      {/* Near wave layer */}
      <div
        className="absolute bottom-0 left-0 z-[25] pointer-events-none opacity-95"
        style={{ width: "100%", height: "52%" }}
      >
        <WaveLayer waves={WAVES.slice(2)} time={time} />
      </div>

      {/* Vessel area */}
      <div className="relative w-full max-w-5xl aspect-video">
        {/* Cranes */}
        <svg
          viewBox="0 0 1200 400"
          className="absolute inset-0 z-10 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <style>
            {`
              @keyframes conflictPulseCore {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
              }
              @keyframes conflictPulseRing {
                0% { transform: scale(1); opacity: 1; stroke-width: 2; }
                100% { transform: scale(1.6); opacity: 0; stroke-width: 1; }
              }
              .qc-conflict-box {
                animation: conflictPulseCore 1.5s infinite;
                transform-origin: center;
              }
              .qc-conflict-ring {
                animation: conflictPulseRing 1.5s infinite;
                transform-origin: center;
              }
            `}
          </style>
          {activeCranes.map((crane, idx) => {
            const cx = 350 + (600 / (activeCranes.length + 1)) * (idx + 1);
            const isYellow = ["QC09", "QC82"].includes(crane.craneId);
            const isConflict = duplicateCraneIds.has(crane.craneId);
            const palette = isYellow
              ? { main: "#ffe000", stroke: "#ccb400" }
              : { main: "#0046af", stroke: "#003280" };
            const boxX = cx - 50;
            const boxY = -60;
            return (
              <g key={crane.craneId} className="drop-shadow-lg">
                <line x1={cx - 22} y1={220} x2={cx - 12} y2={20} stroke={palette.main} strokeWidth="9" />
                <line x1={cx + 22} y1={220} x2={cx + 12} y2={20} stroke={palette.main} strokeWidth="9" />
                <polygon
                  points={`${cx - 12},${20} ${cx + 12},${20} ${cx},${-5}`}
                  fill={palette.main}
                  stroke={palette.stroke}
                  strokeWidth="2.5"
                />
                <rect x={cx - 50} y={25} width={100} height={14} fill={palette.main} stroke={palette.stroke} strokeWidth="2.5" />
                <line x1={cx} y1={-2} x2={cx - 40} y2={25} stroke="#475569" strokeWidth="3.5" />
                <line x1={cx} y1={-2} x2={cx + 40} y2={25} stroke="#475569" strokeWidth="3.5" />
                <rect x={cx - 10} y={39} width={20} height={10} fill="#fb923c" />
                <line x1={cx} y1={49} x2={cx} y2={160} stroke="#1e293b" strokeWidth="2.5" strokeDasharray="4 4" />
                <rect x={cx - 12} y={155} width={24} height={6} fill="#0f172a" />
                {isConflict && (
                  <rect
                    x={boxX}
                    y={boxY}
                    width={100}
                    height={36}
                    fill="none"
                    stroke="#ef4444"
                    rx="4"
                    className="qc-conflict-ring"
                    style={{ transformBox: "fill-box" }}
                  />
                )}
                <rect
                  x={boxX}
                  y={boxY}
                  width={100}
                  height={36}
                  fill="var(--bg-panel)"
                  stroke={isConflict ? "#ef4444" : palette.main}
                  strokeWidth="3"
                  rx="4"
                  className={isConflict ? "qc-conflict-box" : ""}
                  style={{ transformBox: "fill-box" }}
                />
                <text
                  x={cx}
                  y={-32}
                  textAnchor="middle"
                  fill={isConflict ? "#ef4444" : "var(--text-primary)"}
                  fontSize="30"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {crane.craneId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Vessel image with gentle rocking */}
        <div
          className="absolute inset-0 z-20 w-full h-full transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateY(${sway}px) rotate(${roll}deg)`,
            transformOrigin: "center bottom",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/vessel.png"
            alt={`Vessel ${vesselName}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.insertAdjacentHTML(
                "afterbegin",
                '<div class="absolute inset-0 flex items-center justify-center text-gray-300 font-mono text-sm border-2 border-dashed border-gray-200">IMAGE ASSET MISSING: public/images/vessel.png</div>',
              );
            }}
          />
          <svg
            viewBox="0 0 1200 400"
            className="absolute inset-0 z-30 w-full h-full pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="600"
              y="285"
              fill="white"
              fontSize="56"
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="2"
              className="uppercase"
            >
              {vesselName}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function CraneTable({
  cranes,
  duplicateCraneIds,
}: {
  cranes: CraneData[];
  duplicateCraneIds: Set<string>;
}) {
  if (cranes.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-sm text-[var(--text-tertiary)] font-mono tracking-wide">
        NO CRANES ASSIGNED
      </div>
    );
  }

  const sorted = [...cranes].sort((a, b) => {
    const aDone = a.movesDone === a.movesTotal && a.movesTotal > 0;
    const bDone = b.movesDone === b.movesTotal && b.movesTotal > 0;
    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;
    return sortCranes(a, b);
  });

  return (
    <table className="w-full text-sm" id="crane-details-table">
      <thead>
        <tr className="text-[var(--text-tertiary)] text-xs uppercase tracking-wider text-left border-b border-[var(--border)]">
          <th className="px-4 py-2 font-semibold">Crane</th>
          <th className="px-4 py-2 font-semibold text-center">Progress</th>
          <th className="px-4 py-2 font-semibold text-center">
            <span className="text-[var(--accent-loading)]">Load</span>
          </th>
          <th className="px-4 py-2 font-semibold text-center">
            <span className="text-[var(--accent-discharge)]">Disch</span>
          </th>
          <th className="px-4 py-2 font-semibold text-right">MPH</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((crane) => {
          const pct = crane.movesTotal > 0 ? Math.round((crane.movesDone / crane.movesTotal) * 100) : 0;
          const isDone = crane.movesDone === crane.movesTotal && crane.movesTotal > 0;
          const isConflict = duplicateCraneIds.has(crane.craneId);
          const isYellow = ["QC09", "QC82"].includes(crane.craneId);
          return (
            <tr
              key={crane.craneId}
              className={`border-b border-[var(--border-crane-row)] hover:bg-[var(--bg-header)] transition-colors ${isDone ? "opacity-50" : ""} ${isConflict ? "bg-red-500/10" : ""}`}
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center font-mono font-bold text-base ${isConflict ? "text-red-500" : ""}`}
                    style={isConflict ? {} : { color: isYellow ? "#F59E0B" : "#2563EB" }}
                  >
                    {crane.craneId}
                  </span>
                  {isConflict && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] bg-red-600 text-white rounded font-black animate-pulse shrink-0 leading-none -mt-[1px]">
                      CONFLICT
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-black shrink-0 leading-none -mt-[1px]">
                      DONE
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-center flex flex-col items-center justify-center">
                <div className="font-mono font-semibold text-base text-[var(--text-primary)]">
                  {crane.movesDone}
                  <span className="text-[var(--text-tertiary)] mx-1">/</span>
                  {crane.movesTotal}
                </div>
                <div className="flex items-center gap-2 mt-1 w-full justify-center">
                  <div className="w-16 h-1.5 bg-[var(--border-light)] overflow-hidden rounded-full">
                    <div className="h-full bg-[var(--accent-blue)] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[var(--text-tertiary)] text-xs w-8 text-right">{pct}%</span>
                </div>
              </td>
              <td className="px-4 py-2 text-center font-mono text-base">
                <span className="text-[var(--accent-loading)] font-semibold">{crane.loadingDone}</span>
                <span className="text-[var(--text-tertiary)] mx-1">/</span>
                <span className="text-[var(--text-secondary)]">{crane.loadingTotal}</span>
              </td>
              <td className="px-4 py-2 text-center font-mono text-base">
                <span className="text-[var(--accent-discharge)] font-semibold">{crane.dischargingDone}</span>
                <span className="text-[var(--text-tertiary)] mx-1">/</span>
                <span className="text-[var(--text-secondary)]">{crane.dischargingTotal}</span>
              </td>
              <td className="px-4 py-2 text-right">
                <span
                  className={`font-mono font-bold text-lg ${
                    crane.mph >= 25
                      ? "text-[var(--accent-loading)]"
                      : crane.mph >= 15
                        ? "text-[var(--accent-blue)]"
                        : crane.mph > 0
                          ? "text-amber-600"
                          : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {crane.mph}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function VesselCard({
  vessel,
  duplicateCraneIds,
}: {
  vessel: VesselData;
  duplicateCraneIds: Set<string>;
}) {
  const pct = vessel.totalMoves > 0 ? Math.min(100, Math.round((vessel.totalDone / vessel.totalMoves) * 100)) : 0;
  const arrival = vessel.arrivalTime
    ? new Date(vessel.arrivalTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";

  return (
    <section
      id={`vessel-${vessel.vesselCode}`}
      className="flex flex-col h-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg overflow-hidden shadow-md shadow-black/5 dark:shadow-[0_0_30px_rgba(37,99,235,0.25)]"
    >
      {/* Header */}
      <div className="flex flex-col bg-[var(--bg-vessel-header)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-stretch w-full relative min-h-[5rem]">
          <div className="flex flex-col justify-center flex-1 py-4 px-6">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-wide uppercase leading-tight">
              {vessel.vesselName}
            </h2>
            <div className="flex items-center gap-6 text-[17.5px] text-[var(--text-secondary)] mt-1.5">
              <span className="font-mono">
                VOY <span className="font-bold text-[var(--text-primary)]">{vessel.voyageNumber}</span>
              </span>
              <span className="text-[var(--border)]">│</span>
              <span className="font-mono">
                ARR <span className="font-semibold text-[var(--text-primary)]">{arrival}</span>
              </span>
              <span className="text-[var(--border)]">│</span>
              <span className="font-mono">
                QC <span className="font-bold text-[var(--accent-crane)]">{vessel.cranes.length}</span>
              </span>
            </div>
          </div>
          <div className="aspect-square h-full bg-[var(--bg-gmph)] flex flex-col items-center justify-center border-l border-[var(--border)] shadow-sm">
            <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-0.5">
              GMPH
            </span>
            <span className="text-3xl font-black font-mono text-[var(--accent-blue)] leading-none">{vessel.gmph}</span>
          </div>
        </div>
        <div className="w-full h-[1px] bg-[var(--border-light)]" />
        {/* Operations bar */}
        <div className="flex items-center py-3 px-6 bg-[var(--bg-operational)]">
          <div className="flex items-center justify-between w-full text-base font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-loading)] font-bold text-[17px] whitespace-nowrap">▲ LOAD</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{vessel.loadingDone}</span>
              <span className="text-[var(--text-tertiary)]">/ {vessel.loadingTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-discharge)] font-bold text-[17px] whitespace-nowrap">▼ DISCH</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{vessel.dischargingDone}</span>
              <span className="text-[var(--text-tertiary)]">/ {vessel.dischargingTotal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-blue)] font-bold text-[17px] whitespace-nowrap">● TOTAL</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{vessel.totalDone}</span>
              <span className="text-[var(--text-tertiary)]">/ {vessel.totalMoves}</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="px-3 py-2 bg-[var(--bg-operational)] border-b border-[var(--border)]">
          <div className="bg-[var(--bg-progress)] h-6 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-[#2563EB] to-[#1D4ED8] transition-all duration-1000 ease-out flex items-center justify-end px-3 rounded-full"
              style={{ width: `${pct}%` }}
            >
              <span className="font-mono text-xs font-black text-white tabular-nums whitespace-nowrap">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vessel visualization */}
      <div className="flex-1 min-h-0 bg-[var(--bg-vessel-viz)] relative">
        <VesselScope cranes={vessel.cranes} vesselName={vessel.vesselName} duplicateCraneIds={duplicateCraneIds} />
      </div>

      {/* Crane details table */}
      <div className="flex-1 overflow-auto bg-[var(--bg-crane-table)]">
        <CraneTable cranes={vessel.cranes} duplicateCraneIds={duplicateCraneIds} />
      </div>
    </section>
  );
}

export default function VesselMonitor({
  terminalCode,
}: {
  terminalCode: string;
}) {
  const { data: vessels, loading, error, lastUpdated, refresh } = useMonitorData<VesselData[]>({
    url: `/api/vessels?terminal=${terminalCode}`,
    interval: 60000,
  });

  const vesselCount = vessels?.length || 0;

  // Detect crane conflicts across vessels
  const duplicateCraneIds = useMemo(() => {
    const craneOccurrences = new Map<string, number>();
    vessels?.forEach((v) =>
      v.cranes.forEach((c) => {
        if (c.movesDone === c.movesTotal && c.movesTotal > 0) return;
        craneOccurrences.set(c.craneId, (craneOccurrences.get(c.craneId) || 0) + 1);
      }),
    );
    const dupes = new Set<string>();
    craneOccurrences.forEach((count, id) => {
      if (count > 1) dupes.add(id);
    });
    return dupes;
  }, [vessels]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Vessel Monitoring`}
        stats={`${vesselCount} ${vesselCount === 1 ? "Vessel" : "Vessels"}`}
        lastUpdated={lastUpdated}
      />
      <main className="flex-1 min-h-0 p-1.5">
        {loading && (!vessels || vessels.length === 0) ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={refresh} />
        ) : !vessels || vessels.length === 0 ? (
          <EmptyView />
        ) : (
          <div className="flex justify-center gap-1.5 h-full">
            {vessels.slice(0, 3).map((v) => (
              <div
                key={`${v.vesselCode}_${v.callYear}_${v.callSeq}`}
                className="h-full flex-shrink-0"
                style={{ width: "calc((100% - 12px) / 3)" }}
              >
                <VesselCard vessel={v} duplicateCraneIds={duplicateCraneIds} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}