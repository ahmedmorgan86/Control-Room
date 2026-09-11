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
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      tickRef.current += 0.002;
      const paths = containerRef.current?.querySelectorAll("[data-wave]");
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

  const craneSpacing = 680 / (activeCranes.length + 1);

  const [tilt, setTilt] = useState({ x: 5, y: -5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 12, y: px * 14 });
  };

  const handleMouseLeave = () => setTilt({ x: 3, y: -3 });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-vessel-viz)] perspective-1000"
    >
      {/* Waves - back layer (distant, lighter) */}
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ width: "100%", height: "65%" }}>
        <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
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
      <div className="absolute bottom-0 left-0 z-20 pointer-events-none opacity-95" style={{ width: "100%", height: "65%" }}>
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

      {/* 3D Vessel SVG Container with Mouse Parallax */}
      <div
        className="relative w-full max-w-5xl aspect-video preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(10px)`,
        }}
      >
        <svg viewBox="0 0 1200 400" className="absolute inset-0 z-10 w-full h-full filter drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hull3d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2d46" />
              <stop offset="60%" stopColor="#151728" />
              <stop offset="100%" stopColor="#0c0d16" />
            </linearGradient>
            <linearGradient id="deck3d" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b3f5c" />
              <stop offset="100%" stopColor="#25283d" />
            </linearGradient>
            <linearGradient id="craneGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* 3D Ship Hull Side Facet */}
          <polygon points="50,320 200,180 1050,180 1160,320" fill="url(#deck3d)" />
          <path d="M 50 320 L 200 180 L 250 180 L 250 140 L 300 140 L 300 180 L 1050 180 L 1100 220 L 1160 220 L 1180 250 L 1180 300 L 1160 320 Z" fill="url(#hull3d)" />
          <rect x="50" y="320" width="1130" height="15" rx="3" fill="#090a10" opacity="0.9" />

          {/* 3D Bridge Superstructure */}
          <polygon points="80,200 100,185 180,185 160,200" fill="#474c6d" />
          <rect x="80" y="200" width="80" height="120" fill="url(#hull3d)" />
          <rect x="90" y="210" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />
          <rect x="108" y="210" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />
          <rect x="126" y="210" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />
          <rect x="90" y="228" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />
          <rect x="108" y="228" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />
          <rect x="126" y="228" width="12" height="12" fill="#38bdf8" opacity="0.8" rx="2" />

          {/* 3D Cranes on vessel */}
          {activeCranes.map((crane, i) => {
            const cx = 350 + i * craneSpacing;
            const isConflict = duplicateCraneIds.has(crane.craneId);
            const progress = crane.movesTotal > 0 ? crane.movesDone / crane.movesTotal : 0;
            return (
              <g key={crane.craneId} className={isConflict ? "qc-conflict-box" : ""}>
                {isConflict && <circle cx={cx} cy={160} r={22} fill="none" stroke="#F59E0B" strokeWidth={2} className="qc-conflict-ring" />}
                {/* 3D Crane Mast & Lattice Shadow */}
                <line x1={cx - 8} y1={175} x2={cx - 3} y2={80} stroke="#b45309" strokeWidth="2" />
                <line x1={cx + 8} y1={175} x2={cx + 3} y2={80} stroke="#b45309" strokeWidth="2" />
                <rect x={cx - 4} y={80} width={8} height={100} fill="url(#craneGlow)" rx="1" />
                {/* 3D Boom Arm */}
                <polygon points={`${cx - 50},80 ${cx + 50},80 ${cx + 45},86 ${cx - 45},86`} fill="#f59e0b" />
                <rect x={cx - 50} y={80} width={100} height={5} fill="#fbbf24" rx="1" />
                {/* Crane Base */}
                <rect x={cx - 12} y={175} width={24} height={8} fill="#78350f" rx="2" />
                {/* Crane Label Badge */}
                <g transform={`translate(${cx}, 68)`}>
                  <rect x="-24" y="-12" width="48" height="16" rx="4" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1" />
                  <text x="0" y="0" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontFamily="var(--font-mono)" fontWeight="900">{crane.craneId}</text>
                </g>
                {/* Progress indicator */}
                <rect x={cx - 16} y={188} width={32} height={4} rx="2" fill="var(--bg-progress)" />
                <rect x={cx - 16} y={188} width={32 * progress} height={4} rx="2" fill="var(--accent-blue)" />
              </g>
            );
          })}

          {/* 3D Container Stacks */}
          <g transform="translate(0, 0)">
            {/* Red Stack */}
            <polygon points="350,250 360,240 410,240 400,250" fill="#f87171" />
            <rect x="350" y="250" width="50" height="30" rx="2" fill="#ef4444" opacity="0.9" />
            <rect x="400" y="240" width="10" height="30" fill="#dc2626" opacity="0.9" />

            {/* Green Stack */}
            <polygon points="415,250 425,240 475,240 465,250" fill="#4ade80" />
            <rect x="415" y="250" width="50" height="30" rx="2" fill="#16a34a" opacity="0.9" />
            <rect x="465" y="240" width="10" height="30" fill="#15803d" opacity="0.9" />

            {/* Blue Stack */}
            <polygon points="480,250 490,240 540,240 530,250" fill="#60a5fa" />
            <rect x="480" y="250" width="50" height="30" rx="2" fill="#2563eb" opacity="0.9" />
            <rect x="530" y="240" width="10" height="30" fill="#1d4ed8" opacity="0.9" />

            {/* Orange Stack */}
            <polygon points="545,250 555,240 605,240 595,250" fill="#fb923c" />
            <rect x="545" y="250" width="50" height="30" rx="2" fill="#ea580c" opacity="0.9" />
            <rect x="595" y="240" width="10" height="30" fill="#c2410c" opacity="0.9" />
          </g>

          {/* 3D Vessel Title */}
          <text x="600" y="165" textAnchor="middle" fill="var(--text-bright)" fontSize="18" fontFamily="var(--font-mono)" fontWeight="900" letterSpacing="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
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
    <div className="flex-1 min-w-0 border border-[var(--border)] rounded-xl overflow-hidden glass-3d card-3d-lift flex flex-col">
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
