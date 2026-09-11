"use client";

import { useEffect, useMemo, useRef } from "react";
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

function VesselVisualization({
  vessel,
  duplicateCraneIds,
}: {
  vessel: VesselData;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = vessel.cranes
    .filter((c) => c.movesDone < c.movesTotal)
    .sort(sortCranes);
  const tickRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      tickRef.current += 0.002;
      const paths = svgRef.current?.querySelectorAll("[data-wave]");
      paths?.forEach((path) => {
        const el = path as SVGPathElement;
        const y = parseFloat(el.getAttribute("data-y") || "50");
        const freq = parseFloat(el.getAttribute("data-freq") || "0.3");
        const amp = parseFloat(el.getAttribute("data-amp") || "5");
        const speed = parseFloat(el.getAttribute("data-speed") || "0.5");
        const points: string[] = [];
        for (let x = 0; x <= 60; x++) {
          const xPos = (x / 60) * 150;
          const yVal = y + Math.sin(x * freq + tickRef.current * speed) * amp + Math.sin(x * 1.8 * freq + 1.3 * tickRef.current * speed) * 0.4 * amp;
          points.push(`${xPos},${yVal}`);
        }
        el.setAttribute("d", `M 0,100 L 0,${y} ${points.map((p) => `L ${p}`).join(" ")} L 150,${y} L 150,100 Z`);
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const waves = [
    { phase: 0.3, freq: 0.4, amp: 3, y: 20, op: 0.25, color: "var(--wave-1)", speed: 0.3 },
    { phase: -0.5, freq: 0.2, amp: 6, y: 26, op: 0.3, color: "var(--wave-2)", speed: -0.4 },
    { phase: 0.8, freq: 0.3, amp: 4, y: 32, op: 0.35, color: "var(--wave-3)", speed: 0.6 },
    { phase: -0.2, freq: 0.15, amp: 8, y: 38, op: 0.4, color: "var(--wave-4)", speed: -0.2 },
    { phase: 1.1, freq: 0.5, amp: 2, y: 44, op: 0.5, color: "var(--wave-5)", speed: 0.9 },
    { phase: -0.7, freq: 0.25, amp: 7, y: 50, op: 0.55, color: "var(--wave-6)", speed: -0.7 },
    { phase: 0.4, freq: 0.35, amp: 4, y: 56, op: 0.6, color: "var(--wave-7)", speed: 0.5 },
    { phase: -1.2, freq: 0.45, amp: 3, y: 62, op: 0.65, color: "var(--wave-8)", speed: -1.1 },
    { phase: 0.6, freq: 0.18, amp: 9, y: 68, op: 0.7, color: "var(--wave-6)", speed: 0.3 },
    { phase: -0.4, freq: 0.4, amp: 4, y: 74, op: 0.75, color: "var(--wave-7)", speed: -0.8 },
    { phase: 0.2, freq: 0.22, amp: 6, y: 80, op: 0.85, color: "var(--wave-8)", speed: 0.4 },
    { phase: -0.8, freq: 0.3, amp: 5, y: 88, op: 1.0, color: "var(--wave-8)", speed: -1.2 },
  ];

  const craneSpacing = 150 / (activeCranes.length + 1);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-vessel-viz)]">
      {/* Waves - back layer (distant, lighter) */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ width: "100%", height: "65%" }}>
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
          {waves.slice(0, 4).map((w, i) => (
            <path
              key={i}
              data-wave
              data-y={w.y}
              data-freq={w.freq}
              data-amp={w.amp}
              data-speed={w.speed}
              d={`M 0,100 L 0,${w.y} L 150,${w.y} L 150,100 Z`}
              fill={w.color}
              opacity={w.op}
            />
          ))}
        </svg>
      </div>
      {/* Waves - front layer (closer, more opaque) */}
      <div className="absolute bottom-0 left-0 z-25 pointer-events-none opacity-95" style={{ width: "100%", height: "65%" }}>
        <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
          {waves.slice(4).map((w, i) => (
            <path
              key={i}
              data-wave
              data-y={w.y}
              data-freq={w.freq}
              data-amp={w.amp}
              data-speed={w.speed}
              d={`M 0,100 L 0,${w.y} L 150,${w.y} L 150,100 Z`}
              fill={w.color}
              opacity={w.op}
            />
          ))}
        </svg>
      </div>

      {/* Vessel SVG */}
      <div className="relative w-full max-w-5xl aspect-video">
        <svg viewBox="0 0 1200 400" className="absolute inset-0 z-10 w-full h-full" preserveAspectRatio="xMidYMid meet">

          {/* Ship hull */}
          <path d="M 50 320 L 200 180 L 250 180 L 250 140 L 300 140 L 300 180 L 1050 180 L 1100 220 L 1160 220 L 1180 250 L 1180 300 L 1160 320 Z" fill="#1a1a2e" opacity="0.9" />
          <rect x="50" y="320" width="1130" height="15" rx="3" fill="#1a1a2e" />

          {/* Bridge */}
          <rect x="80" y="200" width="80" height="120" fill="#1a1a2e" opacity="0.85" />
          <rect x="90" y="210" width="12" height="12" fill="#e8e8e8" opacity="0.6" />
          <rect x="108" y="210" width="12" height="12" fill="#e8e8e8" opacity="0.6" />
          <rect x="126" y="210" width="12" height="12" fill="#e8e8e8" opacity="0.6" />
          <rect x="90" y="228" width="12" height="12" fill="#e8e8e8" opacity="0.6" />
          <rect x="108" y="228" width="12" height="12" fill="#e8e8e8" opacity="0.6" />
          <rect x="126" y="228" width="12" height="12" fill="#e8e8e8" opacity="0.6" />

          {/* Cranes on vessel */}
          {activeCranes.map((crane, i) => {
            const cx = 350 + i * craneSpacing;
            const isConflict = duplicateCraneIds.has(crane.craneId);
            const progress = crane.movesTotal > 0 ? crane.movesDone / crane.movesTotal : 0;
            return (
              <g key={crane.craneId} className={isConflict ? "qc-conflict-box" : ""}>
                {isConflict && <circle cx={cx} cy={160} r={22} fill="none" stroke="#F59E0B" strokeWidth={2} className="qc-conflict-ring" />}
                {/* Crane mast */}
                <rect x={cx - 3} y={80} width={6} height={100} fill="#eab308" opacity="0.9" />
                {/* Crane arm */}
                <rect x={cx - 40} y={82} width={80} height={4} fill="#eab308" opacity="0.9" />
                {/* Crane base */}
                <rect x={cx - 8} y={175} width={16} height={8} fill="#eab308" opacity="0.9" />
                {/* Crane label */}
                <text x={cx} y={72} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="bold">{crane.craneId}</text>
                {/* Progress indicator */}
                <rect x={cx - 12} y={188} width={24} height={3} rx={1.5} fill="var(--bg-progress)" />
                <rect x={cx - 12} y={188} width={24 * progress} height={3} rx={1.5} fill="var(--accent-blue)" />
              </g>
            );
          })}

          {/* Container placeholders */}
          <rect x="350" y="250" width="50" height="30" rx="2" fill="#ef4444" opacity="0.8" />
          <rect x="410" y="250" width="50" height="30" rx="2" fill="#16a34a" opacity="0.8" />
          <rect x="470" y="250" width="50" height="30" rx="2" fill="#2563eb" opacity="0.8" />
          <rect x="530" y="250" width="50" height="30" rx="2" fill="#ea580c" opacity="0.8" />

          {/* Vessel name */}
          <text x="600" y="165" textAnchor="middle" fill="var(--text-bright)" fontSize="16" fontFamily="var(--font-mono)" fontWeight="bold" letterSpacing="2">
            {vessel.vesselCode}
          </text>
        </svg>
      </div>
    </div>
  );
}

function VesselCard({
  vessel,
  duplicateCraneIds,
}: {
  vessel: VesselData;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = vessel.cranes
    .filter((c) => c.movesDone < c.movesTotal)
    .sort(sortCranes);

  return (
    <div className="flex-1 min-w-0 border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-panel)] flex flex-col">
      <div className="flex items-center justify-between px-[clamp(8px,1.2vh,16px)] py-[clamp(4px,0.5vh,8px)] bg-[var(--bg-vessel-header)] border-b border-[var(--border)]">
        <h2 className="text-sm font-mono font-black text-[var(--text-primary)] uppercase tracking-wider">
          {vessel.vesselCode}
        </h2>
        <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
          {activeCranes.length} Crane{activeCranes.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <VesselVisualization vessel={vessel} duplicateCraneIds={duplicateCraneIds} />
      </div>
      <div className="p-[clamp(4px,0.5vh,8px)]">
        {activeCranes.map((crane) => (
          <div
            key={crane.craneId}
            className={`flex items-center justify-between px-[clamp(8px,1vh,12px)] py-[clamp(4px,0.5vh,8px)] mb-[clamp(2px,0.3vh,4px)] rounded border bg-[var(--bg-panel)] ${
              duplicateCraneIds.has(crane.craneId) ? "border-[#F59E0B]" : "border-[var(--border)]"
            }`}
          >
            <span className="text-xs font-mono font-black text-[var(--text-primary)]">
              {crane.craneId}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                {crane.movesDone}/{crane.movesTotal}
              </span>
              <div className="w-20 h-1.5 bg-[var(--bg-progress)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full progress-shimmer transition-all"
                  style={{
                    width: `${Math.round(
                      (crane.movesDone / Math.max(crane.movesTotal, 1)) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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

  // Detect crane conflicts
  const duplicateCraneIds = useMemo(() => {
    const craneOccurrences = new Map<string, number>();
    vessels?.forEach((v) =>
      v.cranes.forEach((c) => {
        if (c.movesDone === c.movesTotal && c.movesTotal > 0) return;
        craneOccurrences.set(c.craneId, (craneOccurrences.get(c.craneId) || 0) + 1);
      }),
    );
    const dupes = new Set<string>();
    craneOccurrences.forEach((count, id) => { if (count > 1) dupes.add(id); });
    return dupes;
  }, [vessels]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Vessel Monitoring`}
        stats={`${vesselCount} ${vesselCount === 1 ? "Vessel" : "Vessels"}`}
        lastUpdated={lastUpdated}
        error={error}
      />
      <main className="flex-1 min-h-0 p-[clamp(4px,0.6vh,8px)]">
        {loading && (!vessels || vessels.length === 0) ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorView message={error} onRetry={refresh} />
        ) : !vessels || vessels.length === 0 ? (
          <EmptyView />
        ) : (
          <div className="flex justify-center gap-[clamp(4px,0.6vh,8px)] h-full">
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
