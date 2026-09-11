import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth";

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "Terminal Monitoring System — Control Room",
  description:
    "Real-time vessel operations monitoring for port control room displays.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/tv-compat.css" />
      </head>
      <body className="w-screen h-screen overflow-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
