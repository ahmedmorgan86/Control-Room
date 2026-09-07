"use client";

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="3" stroke="currentColor" />
      <path d="M12 8v13m-7-5c0 3.866 3.134 7 7 7s7-3.134 7-7M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
