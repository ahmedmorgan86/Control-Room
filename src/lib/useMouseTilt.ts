"use client";

import { useCallback, useRef, useState } from "react";

export function useMouseTilt(intensity = 4) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setStyle({
        transform: `perspective(600px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(6px)`,
      });
    },
    [intensity],
  );

  const onLeave = useCallback(
    () =>
      setStyle({
        transform: "perspective(600px) rotateX(0) rotateY(0) translateZ(0)",
      }),
    [],
  );

  return { ref, style, onMove, onLeave };
}
