"use client";

import Image from "next/image";

export function Logo({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="relative w-9 h-9 flex items-center justify-center border shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-header)" }}
      >
        <Image
          src={darkMode ? "/logo/mark-dark.png" : "/logo/mark-light.png"}
          alt="ACCHCO"
          fill
          sizes="36px"
          className="object-contain p-1.5"
          priority
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className="font-sans font-semibold tracking-tight text-[13px] leading-tight"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
        >
          Terminal Monitoring System
        </span>
        <span
          className="font-mono font-medium tracking-[0.14em] text-[8px] uppercase mt-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          ACCHCO · Port Operations
        </span>
      </div>
    </div>
  );
}
