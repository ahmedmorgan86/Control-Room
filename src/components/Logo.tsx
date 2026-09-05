"use client";

export function Logo({ darkMode }: { darkMode: boolean }) {
  return (
    <img
      src={darkMode ? "/images/logo1_darkmode.png" : "/images/logo1.png"}
      alt="Logo"
      className="h-11 w-auto object-contain"
    />
  );
}
