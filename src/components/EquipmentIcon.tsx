"use client";

import type { EquType } from "@/lib/types";

const ICONS: Record<string, string> = {
  QC: "M4 6h16M4 10h16M4 14h16M4 18h16M8 6v12M16 6v12",
  YT: "M8 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 9h11v8H3V9zm11 3h4l3 3v2h-7v-5z",
  RTG: "M4 6h16M4 10h16M12 10v11M8 21h8M6 6l6-4 6 4",
  RS: "M4 6h16M12 6v6M8 12h8M6 18h12M9 12l-3 6M15 12l3 6",
  TL: "M4 6h16M12 6v8M8 14h8M6 18h12",
  SUPPORT: "M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z",
  UNK: "M12 8v4l3 3M12 2a10 10 0 100 20 10 10 0 000-20z",
};

export function EquipmentIcon({ type, className = "w-5 h-5" }: { type: EquType; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d={ICONS[type] ?? ICONS.UNK} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
