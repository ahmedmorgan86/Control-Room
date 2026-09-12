import type { YTPosition } from "@/lib/types";

export const ROTATION_DEGREES: Record<string, number> = { ACT: 39, DCT: 123 };

export interface GeoPoint {
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export interface LayoutCorners {
  topRight: GeoPoint;
  bottomLeft: GeoPoint;
  rotationDegrees: number;
}

export interface ProjectedPosition {
  key: string;
  label: string;
  x: number;
  z: number;
  heading: number;
  status: string;
}

const DMS_PLAIN_RE =
  /(?:Top|Bottom)_(?:Right|Left)_(\d+)[-_](\d+)[-_]([\d.]+)[-_]N[-_](\d+)[-_](\d+)[-_]([\d.]+)[-_]E/i;
const DMS_RE = new RegExp(
  "(\\d+)(?:_xB0_|[-_])(\\d+)(?:_x27_|[-_])([\\d.]+)(?:_x22_|[-_])N_(\\d+)(?:_xB0_|[-_])(\\d+)(?:_x27_|[-_])([\\d.]+)(?:_x22_|[-_])E",
  "i",
);

function normalizeId(id: string) {
  return id.replace(/_00000.*$/, "").replace(/[-\s]+/g, "_").replace(/_+$/g, "");
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Geo-reference corners from the terminal layout SVG. The original maps carry
 * invisible marker shapes whose ids encode DMS coordinates, e.g.:
 *   <rect id="Top_Right_31_xB0_11_x27_14.82_x22_N_29_xB0_52_x27_39.73_x22_E" x="2267.1" y="225.2" .../>
 * These (x,y) anchors pair the screen-space position of each real-world corner
 * with its lat/lon, which lets us project live GPS tracking onto the map.
 */
export function parseCorners(svgText: string, terminalCode: string): LayoutCorners | null {
  let topRight: GeoPoint | null = null;
  let bottomLeft: GeoPoint | null = null;

  const attrRe = /<([a-zA-Z]+)\b[^>]*\bid="((?:Top_Right|Bottom_Left)_[^"]+)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(svgText)) !== null) {
    const id = m[2];
    const norm = normalizeId(id);
    if (!id.includes("_xB0_") && !DMS_PLAIN_RE.test(id)) continue;

    const dm = DMS_RE.exec(id);
    if (!dm) continue;

    const lat = Number(dm[1]) + Number(dm[2]) / 60 + Number(dm[3]) / 3600;
    const lon = Number(dm[4]) + Number(dm[5]) / 60 + Number(dm[6]) / 3600;

    const xAttr = new RegExp(`<${m[1]}\\b[^>]*\\bid="${escapeRegExp(id)}"[^>]*\\bx="([\\d.\\-]+)"`);
    const yAttr = new RegExp(`<${m[1]}\\b[^>]*\\bid="${escapeRegExp(id)}"[^>]*\\by="([\\d.\\-]+)"`);
    const xMatch = xAttr.exec(svgText);
    const yMatch = yAttr.exec(svgText);
    const x = xMatch ? parseFloat(xMatch[1]) : 0;
    const y = yMatch ? parseFloat(yMatch[1]) : 0;

    const point = { x, y, lat, lon };
    if (norm.startsWith("Top_Right_")) topRight = point;
    else if (norm.startsWith("Bottom_Left_")) bottomLeft = point;
  }

  if (!topRight || !bottomLeft) return null;
  return {
    topRight,
    bottomLeft,
    rotationDegrees: ROTATION_DEGREES[terminalCode] ?? ROTATION_DEGREES.ACT,
  };
}

/** Port of the original pW() helper: project a lat/lng onto the SVG layout. */
export function latLngToSvg(
  lat: number,
  lon: number,
  corners: LayoutCorners,
): { x: number; y: number; isInside: boolean } {
  const lat0 = (corners.bottomLeft.lat * Math.PI) / 180;
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * lat0) + 1.175 * Math.cos(4 * lat0);
  const mPerDegLon = 111412.84 * Math.cos(lat0) - 93.5 * Math.cos(3 * lat0);

  const local = (latitude: number, longitude: number) => ({
    east: (longitude - corners.bottomLeft.lon) * mPerDegLon,
    north: (latitude - corners.bottomLeft.lat) * mPerDegLat,
  });

  const dir = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { east: Math.sin(a), north: Math.cos(a) };
  };

  const toRotated = (meters: { east: number; north: number }) => {
    const s = dir(corners.rotationDegrees + 90);
    const o = dir(corners.rotationDegrees + 180);
    const det = s.east * o.north - o.east * s.north;
    return {
      rightMeters: (meters.east * o.north - o.east * meters.north) / det,
      downMeters: (s.east * meters.north - meters.east * s.north) / det,
    };
  };

  const distTopRightAxis = toRotated(local(corners.topRight.lat, corners.topRight.lon));
  const distTarget = toRotated(local(lat, lon));

  const pxPerMeterRight = (corners.topRight.x - corners.bottomLeft.x) / distTopRightAxis.rightMeters;
  const pxPerMeterDown = (corners.topRight.y - corners.bottomLeft.y) / distTopRightAxis.downMeters;

  const x = corners.bottomLeft.x + distTarget.rightMeters * pxPerMeterRight;
  const y = corners.bottomLeft.y + distTarget.downMeters * pxPerMeterDown;

  const minX = Math.min(corners.topRight.x, corners.bottomLeft.x);
  const maxX = Math.max(corners.topRight.x, corners.bottomLeft.x);
  const minY = Math.min(corners.topRight.y, corners.bottomLeft.y);
  const maxY = Math.max(corners.topRight.y, corners.bottomLeft.y);

  return { x, y, isInside: x >= minX && x <= maxX && y >= minY && y <= maxY };
}

export function deriveStatus(pos: YTPosition): string {
  if (pos.status) return pos.status;
  const hasPrev =
    typeof pos.previousLatitude === "number" && typeof pos.previousLongitude === "number";
  if (hasPrev) {
    const dLat = (pos.latitude! - pos.previousLatitude!) * 111320;
    const dLon =
      (pos.longitude! - pos.previousLongitude!) *
      111320 *
      Math.cos((pos.latitude! * Math.PI) / 180);
    if (Math.hypot(dLon, dLat) >= 1) return "MOVING";
    return "IDLE";
  }
  if (pos.updateTime) {
    const age = Date.now() - new Date(pos.updateTime).getTime();
    if (age < 5 * 60 * 1000) return "IDLE";
  }
  return "STOPPED";
}

export function deriveHeading(pos: YTPosition, corners: LayoutCorners): number {
  if (typeof pos.heading === "number") return pos.heading;
  if (typeof pos.previousLatitude === "number") {
    const cur = latLngToSvg(pos.latitude!, pos.longitude!, corners);
    const prev = latLngToSvg(pos.previousLatitude!, pos.previousLongitude!, corners);
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    if (Math.hypot(dx, dy) > 0.5) {
      const heading = (Math.atan2(dx, -dy) * 180) / Math.PI;
      return (heading + 360) % 360;
    }
  }
  return 0;
}

/**
 * Normalize raw /api/yt-tracking payloads into screen-space coordinates.
 * - Live payloads carry latitude/longitude: projected onto the SVG layout,
 *   where x = SVG x and z = SVG y (top-left origin, matching the viewBox).
 * - Simulated payloads already carry x/z: used as-is, min/max-normalized.
 */
export function projectPositions(
  positions: YTPosition[],
  corners: LayoutCorners | null,
): ProjectedPosition[] {
  if (!positions.length) return [];

  const isGeo = positions.some(
    (p) => typeof p.latitude === "number" && typeof p.longitude === "number",
  );

  if (isGeo && corners) {
    return positions.map((pos) =>
      (() => {
        const pt = latLngToSvg(pos.latitude!, pos.longitude!, corners);
        return {
          key: pos.truckId ?? pos.equNo ?? `${pos.latitude}_${pos.longitude}`,
          label: pos.truckId ?? pos.equNo ?? "—",
          x: pt.x,
          z: pt.y,
          heading: deriveHeading(pos, corners),
          status: deriveStatus(pos),
        };
      })(),
    );
  }

  if (!isGeo) {
    const xs = positions.map((p) => p.x ?? 0);
    const zs = positions.map((p) => p.z ?? 0);
    const pMinX = Math.min(...xs);
    const pMaxX = Math.max(...xs);
    const pMinZ = Math.min(...zs);
    const pMaxZ = Math.max(...zs);
    const f = (v: number, lo: number, hi: number) => (hi - lo ? (v - lo) / (hi - lo) : 0.5);
    return positions.map((pos) => ({
      key: pos.equNo ?? pos.truckId ?? `${pos.x}_${pos.z}`,
      label: pos.equNo ?? pos.truckId ?? "—",
      x: f(pos.x ?? 0, pMinX, pMaxX),
      z: f(pos.z ?? 0, pMinZ, pMaxZ),
      heading: pos.heading ?? 0,
      status: pos.status ?? "STOPPED",
    }));
  }

  return [];
}