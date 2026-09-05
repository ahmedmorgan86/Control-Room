import type { CSSProperties } from "react";
import type { EquType } from "@/lib/types";

/**
 * Real photographs per equipment type (via Unsplash, free license) instead
 * of drawn icons. Referenced directly by URL rather than bundled locally —
 * they load straight from Unsplash's CDN at runtime, which is how
 * Unsplash's free license expects hotlinked use. Each photo credits its
 * photographer via the `credit` field for attribution if ever needed.
 */
const EQUIPMENT_PHOTOS: Record<EquType, { url: string; alt: string; credit: string } | null> = {
  QC: {
    url: "https://images.unsplash.com/photo-1651312636578-9f1190393d93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Ship-to-shore quay crane, Alexandria Port",
    credit: "Mohamed Aslan / Unsplash",
  },
  RTG: {
    url: "https://images.unsplash.com/photo-1696924813942-6628052d4353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Rubber-tyred gantry crane at a container port",
    credit: "Michaja Sudar / Unsplash",
  },
  RS: {
    url: "https://images.unsplash.com/photo-1782014782408-fae11fe146e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Reach stacker in a container yard",
    credit: "Mohd Fadzillah Sulaiman / Unsplash",
  },
  TL: {
    url: "https://images.unsplash.com/photo-1716635174849-ce8a2df809fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Heavy-duty forklift / toplift",
    credit: "Zemos / Unsplash",
  },
  YT: {
    url: "https://images.unsplash.com/photo-1782014723714-7fcce0581d8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
    alt: "Terminal tractor moving a shipping container",
    credit: "Mohd Fadzillah Sulaiman / Unsplash",
  },
  SUPPORT: null,
  UNK: null,
};

export function EquipmentIcon({
  equType,
  className,
  style,
}: {
  equType: EquType;
  className?: string;
  style?: CSSProperties;
}) {
  const photo = EQUIPMENT_PHOTOS[equType];
  if (!photo) {
    // No good real-photo match for this type — fall back to a plain
    // neutral placeholder square rather than a drawn icon.
    return (
      <span
        className={className}
        style={{ ...style, display: "inline-block", background: "var(--bg-progress)", borderRadius: 2 }}
        aria-hidden
      />
    );
  }
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
