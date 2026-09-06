import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PORT SMART-OPS | Terminal Monitoring System",
  description:
    "Real-time vessel operations monitoring for port control room displays.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags -- tv-compat.css must be a raw public asset so old smart TV browsers get the @layer fallback; importing it as a CSS module would re-wrap it in a layer. */}
        <link rel="stylesheet" href="/tv-compat.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="w-screen h-screen overflow-hidden bg-[#060a14] text-[#dee2f6]">{children}</body>
    </html>
  );
}
