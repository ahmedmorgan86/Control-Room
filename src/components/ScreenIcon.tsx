"use client";

import type { ScreenKey } from "@/lib/types";

const ICONS: Record<string, string> = {
  VSL: "M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16M3 21h18M9 7h6M9 11h6M9 15h2",
  EQU: "M4 6h16M4 10h16M4 14h16M4 18h16",
  YARD: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  YT: "M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z",
  TRACKER: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
};

export function ScreenIcon({ screen, className = "w-4 h-4" }: { screen: ScreenKey; className?: string }) {
  const kind = screen.includes("VSL") ? "VSL" : screen.includes("EQU") ? "EQU" : screen.includes("YT") ? "YT" : screen.includes("YARD") ? "YARD" : "TRACKER";
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d={ICONS[kind] ?? ICONS.VSL} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
