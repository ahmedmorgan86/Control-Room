export function getFillBarColor(ratio: number): string {
  if (ratio > 0.85) return "#ef4444";
  if (ratio > 0.7) return "#eab308";
  if (ratio > 0.5) return "#22c55e";
  return "#3b82f6";
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
    default:
      return "#ef4444";
    case "HIGH":
      return "#f97316";
    case "MEDIUM":
      return "#eab308";
  }
}

export function getColumnCount(count: number): number {
  if (count <= 0) return 1;
  if (count <= 7) return count;
  let best = 7;
  let minGap = (7 - (count % 7)) % 7;
  for (let cols = 4; cols <= 7; cols++) {
    const gap = (cols - (count % cols)) % cols;
    if (gap < minGap) {
      minGap = gap;
      best = cols;
    }
  }
  return best;
}
