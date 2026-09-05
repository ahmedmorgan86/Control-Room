import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terminal Monitoring System — Control Room",
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
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags -- tv-compat.css must be a raw public asset so old smart TV browsers get the @layer fallback; importing it as a CSS module would re-wrap it in a layer. */}
        <link rel="stylesheet" href="/tv-compat.css" />
      </head>
      <body className="w-screen h-screen overflow-hidden">{children}</body>
    </html>
  );
}
