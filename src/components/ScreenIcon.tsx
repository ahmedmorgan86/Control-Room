import type { CSSProperties } from "react";

export type ScreenIconKind = "VESSEL" | "YARD";

/**
 * Real photographs per screen (via Unsplash, free license), referenced
 * directly by URL — see EquipmentIcon.tsx for why these aren't bundled
 * as local files.
 */
const SCREEN_PHOTOS: Record<ScreenIconKind, { url: string; alt: string; credit: string }> = {
  VESSEL: {
    url: "https://images.unsplash.com/photo-1763750648984-40e592049724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Container vessel at sea",
    credit: "Bernd Dittrich / Unsplash",
  },
  YARD: {
    url: "https://images.unsplash.com/photo-1786647332490-705114ec5936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Shipping container in a storage yard",
    credit: "Mohd Fadzillah Sulaiman / Unsplash",
  },
};

export function ScreenIcon({
  kind,
  className,
  style,
}: {
  kind: ScreenIconKind;
  className?: string;
  style?: CSSProperties;
}) {
  const photo = SCREEN_PHOTOS[kind];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Unsplash CDN thumbnail, not worth next/image remote-pattern config for a handful of small decorative photos
    <img
      src={photo.url}
      alt={photo.alt}
      className={className}
      style={{
        ...style,
        objectFit: "cover",
        borderRadius: 2,
        border: "1px solid var(--border)",
        display: "block",
      }}
      loading="lazy"
    />
  );
}
