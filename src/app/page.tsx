"use client";

import { useAuth } from "@/context/auth";
import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/Topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import VesselMonitor from "@/components/monitors/VesselMonitor";
import YardMonitor from "@/components/monitors/YardMonitor";
import EquipmentMonitor from "@/components/monitors/EquipmentMonitor";
import DashboardSummary from "@/components/monitors/DashboardSummary";
import GateMonitor from "@/components/monitors/GateMonitor";
import BerthMonitor from "@/components/monitors/BerthMonitor";
import EquipmentHeatmap from "@/components/monitors/EquipmentHeatmap";
import VesselTrendChart from "@/components/monitors/VesselTrendChart";
import dynamic from "next/dynamic";

const YTTracker = dynamic(() => import("@/components/monitors/YTTracker"), { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-[var(--bg-page)]"><div className="w-8 h-8 border-2 border-[var(--border)] border-t-emerald-500 rounded-full animate-spin" /></div> });
const YTTrail = dynamic(() => import("@/components/monitors/YTTrail"), { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-[var(--bg-page)]"><div className="w-8 h-8 border-2 border-[var(--border)] border-t-emerald-500 rounded-full animate-spin" /></div> });

function ScreenRouter({ screenKey }: { screenKey: string }) {
  const tc = screenKey.split("_")[0];
  return (
    <div key={screenKey} className="flex-1 min-h-0 page-transition">
      <ErrorBoundary>
        {(() => {
          switch (screenKey) {
            case "ACT_VSL_MONITOR": case "DCT_VSL_MONITOR": return <VesselMonitor terminalCode={tc} />;
            case "ACT_YARD_MONITOR": case "DCT_YARD_MONITOR": return <YardMonitor terminalCode={tc} />;
            case "ACT_EQU_MONITOR": case "DCT_EQU_MONITOR": return <EquipmentMonitor terminalCode={tc} />;
            case "ACT_YT_TRACKER": case "DCT_YT_TRACKER": return <YTTracker terminalCode={tc} />;
            case "ACT_DASHBOARD": case "DCT_DASHBOARD": return <DashboardSummary terminalCode={tc} />;
            case "ACT_GATE_MONITOR": case "DCT_GATE_MONITOR": return <GateMonitor terminalCode={tc} />;
            case "ACT_BERTH_MONITOR": case "DCT_BERTH_MONITOR": return <BerthMonitor terminalCode={tc} />;
            case "ACT_HEATMAP": case "DCT_HEATMAP": return <EquipmentHeatmap terminalCode={tc} />;
            case "ACT_YT_TRAIL": case "DCT_YT_TRAIL": return <YTTrail terminalCode={tc} />;
            case "ACT_CRANE_TREND": case "DCT_CRANE_TREND": return <VesselTrendChart terminalCode={tc} />;
            default:
              return (
                <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-page)]">
                  <div className="text-center">
                    <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">Module Under Development</div>
                    <p className="text-[11px] font-mono text-[var(--text-tertiary)]">
                      The <span className="font-bold text-[var(--text-secondary)]">{screenKey.replace(/_/g, " ")}</span> screen is not yet available.
                    </p>
                  </div>
                </div>
              );
          }
        })()}
      </ErrorBoundary>
    </div>
  );
}

export default function Page() {
  const { user, isLoading } = useAuth();
  const [activeScreenRaw, setActiveScreenRaw] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("activeScreen");
    const dark = localStorage.getItem("darkMode") === "true";
    queueMicrotask(() => {
      setActiveScreenRaw(saved);
      setIsDarkMode(dark);
      if (dark) document.body.classList.add("dark");
      setMounted(true);
    });
  }, []);

  const activeScreen = user
    ? (activeScreenRaw && user.screens[activeScreenRaw]
        ? activeScreenRaw
        : Object.entries(user.screens).find(([, v]) => v)?.[0] ?? null)
    : null;

  const setActiveScreen = useCallback((screen: string | null) => {
    setActiveScreenRaw(screen);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("darkMode", String(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    return () => { document.body.classList.remove("dark"); };
  }, [isDarkMode, mounted]);

  useEffect(() => {
    if (mounted && activeScreen) localStorage.setItem("activeScreen", activeScreen);
  }, [activeScreen, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!user) return;
      const scr = Object.entries(user.screens).filter(([, v]) => v).map(([k]) => k);
      if (scr.length === 0) return;
      const idx = scr.indexOf(activeScreen || "");
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveScreen(scr[(idx + 1) % scr.length]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveScreen(scr[(idx - 1 + scr.length) % scr.length]);
      } else if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        try {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        } catch { /* fullscreen not supported */ }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, activeScreen, setActiveScreen]);

  const handleNavigate = useCallback((screen: string) => {
    if (user && user.screens[screen]) setActiveScreen(screen);
  }, [user, setActiveScreen]);

  if (isLoading || !mounted) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-page)]">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">Initializing System</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <Topbar activeScreen={activeScreen} onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((prev) => !prev)} />
      {user ? (
        activeScreen && user.screens[activeScreen] ? (
          <ScreenRouter screenKey={activeScreen} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-page)]">
            <div className="text-center">
              <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">Select a Module</div>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)]">Use the navigation bar above to open a monitoring screen.</p>
            </div>
          </div>
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-page)]">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-2">Authentication Required</div>
            <p className="text-[11px] font-mono text-[var(--text-tertiary)]">Please log in to access the Terminal Monitoring System.</p>
          </div>
        </div>
      )}
    </div>
  );
}
