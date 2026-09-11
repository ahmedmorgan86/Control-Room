export function getTTTColor(minutes: number): { bg: string; text: string; border: string; shadow: string } {
  if (minutes >= 30) return { bg: "bg-red-600", text: "text-white", border: "border-red-500", shadow: "shadow-[0_0_8px_rgba(220,38,38,0.4)]" };
  if (minutes >= 20) return { bg: "bg-orange-500", text: "text-white", border: "border-orange-400", shadow: "shadow-[0_0_6px_rgba(249,115,22,0.3)]" };
  if (minutes >= 10) return { bg: "bg-amber-500", text: "text-white", border: "border-amber-400", shadow: "" };
  return { bg: "bg-black/30", text: "text-white/90", border: "border-white/10", shadow: "" };
}

export function getEquipmentAccent(type: string): string {
  const accents: Record<string, string> = {
    QC: "#0046af",
    YT: "#10b981",
    RTG: "#f97316",
    RS: "#0ea5e9",
    TL: "#8b5cf6",
    UNK: "#64748b",
  };
  return accents[type] || accents.UNK;
}
