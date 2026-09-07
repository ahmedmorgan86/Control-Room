"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Crane } from "@/lib/types";

const CRANE_COLORS: Record<string, string> = {
  QC01: "#10b981", QC02: "#10b981", QC03: "#10b981", QC04: "#10b981",
  QC05: "#10b981", QC06: "#10b981", QC07: "#10b981", QC08: "#10b981",
  QC09: "#f59e0b", QC10: "#f59e0b", QC11: "#f59e0b", QC12: "#f59e0b",
};

const CARRIER_COLORS = ["#0284c7", "#1d4ed8", "#ea580c", "#059669", "#db2777", "#06b6d4"];

function generateContainerStacks(numBays: number) {
  const stacks: { x: number; containers: { fill: string; w: number }[] }[] = [];
  for (let bay = 0; bay < numBays; bay++) {
    const x = 130 + bay * 85;
    const tiers = 3 + (bay % 4);
    const containers: { fill: string; w: number }[] = [];
    for (let t = 0; t < tiers; t++) {
      const colorIdx = (bay * 3 + t * 7) % CARRIER_COLORS.length;
      const isHazard = bay === 5 && t === 2;
      const isReefer = bay === 7 && t < 2;
      containers.push({
        fill: isHazard ? "#dc2626" : isReefer ? "#06b6d4" : CARRIER_COLORS[colorIdx],
        w: 70,
      });
    }
    stacks.push({ x, containers });
  }
  return stacks;
}

function useAnimationFrame(cb: (dt: number) => void) {
  const cbRef = useRef(cb);
  useEffect(() => { cbRef.current = cb; });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      cbRef.current(now - last);
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function WaterPath({ layers, tick }: { layers: { y: number; amp: number; freq: number; speed: number; color: string; op: number }[]; tick: number }) {
  return (
    <svg className="w-full h-full" viewBox="0 0 150 100" preserveAspectRatio="none">
      {layers.map((e, s) => (
        <path
          key={s}
          d={(() => {
            const pts = [];
            for (let a = 0; a <= 60; a++) {
              const xx = (a / 60) * 150;
              const yy = e.y + Math.sin(a * e.freq + tick * e.speed) * e.amp + Math.sin(a * (1.8 * e.freq) + 1.3 * tick * e.speed) * (0.4 * e.amp);
              pts.push(`${xx},${yy}`);
            }
            return `M 0,100 L 0,${e.y} ${pts.map((p) => `L ${p}`).join(" ")} L 150,${e.y} L 150,100 Z`;
          })()}
          fill={e.color}
          opacity={e.op}
        />
      ))}
    </svg>
  );
}

export function VesselVisualization({
  cranes,
  vesselName,
  duplicateCraneIds,
}: {
  cranes: Crane[];
  vesselName: string;
  duplicateCraneIds: Set<string>;
}) {
  const activeCranes = cranes.filter((c) => c.movesDone < c.movesTotal);
  const [tick, setTick] = useState(0);
  useAnimationFrame((dt) => setTick((t) => (t + dt) % 1e6));

  const water = useMemo(() => [
    { y: 30, amp: 3, freq: 0.4, speed: 0.3, color: "#00f0ff", op: 0.08 },
    { y: 38, amp: 5, freq: 0.2, speed: -0.4, color: "#00f0ff", op: 0.12 },
    { y: 46, amp: 4, freq: 0.3, speed: 0.6, color: "#0284c7", op: 0.18 },
    { y: 54, amp: 7, freq: 0.15, speed: -0.2, color: "#0284c7", op: 0.22 },
    { y: 62, amp: 3, freq: 0.5, speed: 0.9, color: "#0284c7", op: 0.28 },
    { y: 70, amp: 6, freq: 0.25, speed: -0.7, color: "#0284c7", op: 0.35 },
  ], []);

  const containerStacks = useMemo(() => generateContainerStacks(Math.max(activeCranes.length * 2, 12)), [activeCranes.length]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#060a14]">
      <div className="absolute inset-0 grid-lines-pattern opacity-50" />
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none" style={{ width: "100%", height: "50%" }}>
        <WaterPath layers={water.slice(0, 3)} tick={tick} />
      </div>
      <div className="absolute bottom-0 left-0 z-20 pointer-events-none opacity-95" style={{ width: "100%", height: "50%" }}>
        <WaterPath layers={water.slice(3)} tick={tick} />
      </div>

      <div className="relative w-full" style={{ aspectRatio: "2.7 / 1" }}>
        <svg viewBox="0 0 1400 520" className="absolute inset-0 z-10 w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="shipHullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <linearGradient id="craneYellow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="waterSurface" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
            </linearGradient>
            <pattern id="hazardStripe" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
              <rect fill="#facc15" width="10" height="20" />
              <rect fill="#18181b" width="10" height="20" x="10" />
            </pattern>
          </defs>

          {/* Berth apron & rail tracks */}
          <rect fill="#1e293b" width="1400" height="50" x="0" y="470" />
          <line stroke="#facc15" strokeDasharray="16 8" strokeWidth="3" x1="0" x2="1400" y1="470" y2="470" />
          <rect fill="url(#hazardStripe)" height="8" opacity="0.8" width="1400" x="0" y="475" />
          <line stroke="#475569" strokeWidth="4" x1="0" x2="1400" y1="492" y2="492" />
          <line stroke="#475569" strokeWidth="4" x1="0" x2="1400" y1="504" y2="504" />

          {/* Water canal */}
          <rect fill="url(#waterSurface)" height="55" width="1400" x="0" y="415" />
          <path d="M0 445 C 150 442, 300 448, 450 445 C 600 442, 750 448, 900 445 C 1050 442, 1200 448, 1400 445" fill="none" opacity="0.4" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M0 455 C 120 458, 280 452, 440 456 C 600 460, 780 453, 960 457 C 1140 460, 1280 453, 1400 456" fill="none" opacity="0.3" stroke="#00f0ff" strokeWidth="2" />

          {/* Ship hull */}
          <path d="M 45,395 C 30,375 25,350 40,325 L 120,325 L 1220,325 C 1260,325 1310,340 1330,370 L 1320,395 C 1300,410 1250,415 1200,415 L 80,415 C 50,415 45,405 45,395 Z" fill="url(#shipHullGrad)" stroke="#334155" strokeWidth="2" />
          {/* Red antifouling */}
          <path d="M 45,395 L 1320,395 L 1300,415 L 75,415 Z" fill="#991b1b" opacity="0.95" />
          <line stroke="#ef4444" strokeWidth="2" x1="50" x2="1320" y1="395" y2="395" />

          {/* Draft marks */}
          <g opacity="0.7">
            <text fill="#ffffff" fontFamily="monospace" fontSize="8" x="65" y="340">16M</text>
            <text fill="#ffffff" fontFamily="monospace" fontSize="8" x="65" y="355">15M</text>
            <text fill="#ffffff" fontFamily="monospace" fontSize="8" x="65" y="370">14M</text>
            <text fill="#ffffff" fontFamily="monospace" fontSize="8" x="65" y="385">13M</text>
            <circle cx="85" cy="370" fill="none" r="5" stroke="#ffffff" strokeWidth="1" />
            <line stroke="#ffffff" strokeWidth="1.5" x1="77" x2="93" y1="370" y2="370" />
          </g>

          {/* Superstructure */}
          <rect fill="#f8fafc" height="130" rx="4" stroke="#94a3b8" strokeWidth="1.5" width="130" x="1050" y="195" />
          <rect fill="#0284c7" height="15" opacity="0.85" rx="2" width="120" x="1055" y="205" />
          <line stroke="#cbd5e1" strokeWidth="2" x1="1055" x2="1175" y1="230" y2="230" />
          <line stroke="#cbd5e1" strokeWidth="2" x1="1055" x2="1175" y1="250" y2="250" />
          <line stroke="#cbd5e1" strokeWidth="2" x1="1055" x2="1175" y1="270" y2="270" />
          <line stroke="#cbd5e1" strokeWidth="2" x1="1055" x2="1175" y1="290" y2="290" />
          <rect fill="#ea580c" height="14" rx="6" stroke="#c2410c" strokeWidth="1.5" width="42" x="1075" y="295" />
          <rect fill="#0f172a" height="60" rx="3" stroke="#334155" strokeWidth="1.5" width="38" x="1150" y="145" />
          <rect fill="#1e3a8a" height="16" width="30" x="1154" y="150" />
          <line stroke="#94a3b8" strokeWidth="2" x1="1100" x2="1100" y1="195" y2="150" />
          <circle cx="1100" cy="148" fill="#e2e8f0" r="4" />
          <line stroke="#94a3b8" strokeWidth="1.5" x1="1115" x2="1115" y1="195" y2="160" />
          <circle cx="1135" cy="180" fill="#ffffff" r="7" stroke="#94a3b8" />

          {/* Container stacks */}
          <g id="containerCellGrid" stroke="#090e1c" strokeWidth="1">
            {containerStacks.map((stack, bayIdx) =>
              stack.containers.map((cell, tierIdx) => (
                <rect
                  key={`${bayIdx}-${tierIdx}`}
                  fill={cell.fill}
                  height="15"
                  width={cell.w}
                  x={stack.x}
                  y={295 - tierIdx * 15}
                  stroke={cell.fill === "#dc2626" ? "#fca5a5" : undefined}
                  strokeWidth={cell.fill === "#dc2626" ? 1.5 : undefined}
                />
              ))
            )}
          </g>

          {/* Vessel name */}
          <text x="600" y="180" textAnchor="middle" fontSize="20" fontFamily="Inter, sans-serif" fill="#dee2f6" fontWeight="700" letterSpacing="2">
            {vesselName}
          </text>

          {/* === CRANES === */}
          {activeCranes.map((crane, idx) => {
            const x = 240 + (idx / Math.max(activeCranes.length - 1, 1)) * 600;
            const color = CRANE_COLORS[crane.craneId] ?? "#00f0ff";
            const conflict = duplicateCraneIds.has(crane.craneId);
            const baseColor = conflict ? "#ef4444" : color;

            return (
              <g key={crane.craneId} id={`STS-${crane.craneId}`}>
                {/* Portal legs */}
                <path d={`M ${x - 30},488 L ${x - 15},120 L ${x - 5},120 L ${x + 15},488`} fill="url(#craneYellow)" stroke="#854d0e" strokeWidth="1.5" />
                <path d={`M ${x + 55},488 L ${x + 40},120 L ${x + 30},120 L ${x + 70},488`} fill="url(#craneYellow)" stroke="#854d0e" strokeWidth="1.5" />
                {/* Rail bogies */}
                <rect fill="#18181b" height="8" rx="2" width="22" x={x - 35} y="482" />
                <rect fill="#18181b" height="8" rx="2" width="22" x={x + 48} y="482" />
                {/* Cross bracing */}
                <line stroke="#ca8a04" strokeWidth="2" x1={x - 22} x2={x + 40} y1="360" y2="280" />
                <line stroke="#ca8a04" strokeWidth="2" x1={x + 40} x2={x - 22} y1="360" y2="280" />
                <line stroke="#ca8a04" strokeWidth="2" x1={x - 18} x2={x + 35} y1="280" y2="190" />
                <line stroke="#ca8a04" strokeWidth="2" x1={x + 35} x2={x - 18} y1="280" y2="190" />
                {/* A-frame */}
                <polygon fill="url(#craneYellow)" points={`${x - 25},120 ${x + 8},30 ${x + 30},30 ${x + 60},120`} stroke="#854d0e" strokeWidth="2" />
                <rect fill="#0f172a" height="40" rx="2" stroke={baseColor} strokeWidth={conflict ? 2 : 1} width="55" x={x + 5} y="50" />
                {/* Boom */}
                <line stroke="#facc15" strokeLinecap="round" strokeWidth="8" x1={x - 80} x2={x + 120} y1="120" y2="120" />
                <line stroke="#eab308" strokeWidth="2" x1={x - 80} x2={x + 120} y1="112" y2="112" />
                {/* Suspension cables */}
                <line stroke="#94a3b8" strokeWidth="1.5" x1={x + 18} x2={x + 105} y1="30" y2="120" />
                <line stroke="#94a3b8" strokeWidth="1.5" x1={x + 18} x2={x - 65} y1="30" y2="120" />
                {/* Trolley & spreader */}
                <rect fill={baseColor} height="7" width="22" x={x + 10} y="122" />
                <line stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="1" x1={x + 14} x2={x + 14} y1="129" y2="200" />
                <line stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="1" x1={x + 28} x2={x + 28} y1="129" y2="200" />
                <rect fill="#1e293b" height="6" stroke="#00f0ff" strokeWidth="1" width="38" x={x + 2} y="200" />
                <rect fill="#1d4ed8" height="13" stroke="#60a5fa" strokeWidth="1" width="18" x={x + 2} y="206" />
                <rect fill="#1d4ed8" height="13" stroke="#60a5fa" strokeWidth="1" width="18" x={x + 22} y="206" />
                {/* Crane ID label */}
                <text x={x + 20} y="25" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono, monospace" fill={baseColor} fontWeight="bold">
                  {crane.craneId}
                </text>
                {/* Conflict indicator */}
                {conflict && (
                  <circle className="animate-pulse" cx={x + 20} cy="120" r="28" stroke="#ef4444" strokeDasharray="4 2" strokeWidth="1.5" fill="none" />
                )}
              </g>
            );
          })}

          {/* Mooring lines */}
          <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2.5" x1="50" x2="10" y1="375" y2="475" />
          <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2.5" x1="65" x2="20" y1="380" y2="475" />
          <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2.5" x1="1280" x2="1350" y1="375" y2="475" />
          <line stroke="#f59e0b" strokeDasharray="6 3" strokeWidth="2.5" x1="1260" x2="1340" y1="380" y2="475" />
        </svg>
      </div>
    </div>
  );
}
