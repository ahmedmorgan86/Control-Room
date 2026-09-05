"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/context/auth";
import { Topbar } from "@/components/Topbar";
import { VesselMonitor } from "@/components/monitors/VesselMonitor";
import { YardMonitor } from "@/components/monitors/YardMonitor";
import { EquipmentMonitor } from "@/components/monitors/EquipmentMonitor";
import { YTTracker } from "@/components/monitors/YTTracker";
import { UnderDevelopment, isUnderDevelopment } from "@/components/UnderDevelopment";
import { SCREEN_LABELS, screenTerminal, getUserScreens } from "@/lib/screens";
import type { ScreenKey, Terminal } from "@/lib/types";

function LoadingScreen() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-page)]">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin mb-3" />
      <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
        Initializing System
      </p>
    </div>
  );
}

function ScreenContent({ screen }: { screen: ScreenKey }) {
  const terminal = (screenTerminal(screen) ?? "ACT") as Terminal;
  if (isUnderDevelopment(screen)) {
    return <UnderDevelopment name={SCREEN_LABELS[screen]} />;
  }
  if (screen.includes("VSL")) return <VesselMonitor key={screen} terminal={terminal} />;
  if (screen.includes("EQU")) return <EquipmentMonitor key={screen} terminal={terminal} />;
  if (screen.includes("YT_TRACKER")) return <YTTracker key={screen} terminal={terminal} />;
  if (screen.includes("YARD")) return <YardMonitor key={screen} terminal={terminal} />;
  return <UnderDevelopment key={screen} name={SCREEN_LABELS[screen]} />;
}

function Dashboard() {
  const { user } = useAuth();
  const myScreens = useMemo(() => getUserScreens(user), [user]);
  const [screen, setScreen] = useState<ScreenKey | null>(() => myScreens[0] ?? null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    typeof window !== "undefined" && window.localStorage.getItem("dark") === "1",
  );

  // apply dark class on mount / whenever state changes
  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDark = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      window.localStorage.setItem("dark", next ? "1" : "0");
      return next;
    });
  };

  useEffect(() => {
    const handler = () => {
      setIsDarkMode((prev) => {
        const next = !prev;
        document.body.classList.toggle("dark", next);
        return next;
      });
    };
    window.addEventListener("toggle-dark-mode", handler);
    return () => window.removeEventListener("toggle-dark-mode", handler);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-[var(--bg-page)] overflow-hidden">
      <Topbar
        activeScreen={screen}
        onNavigate={setScreen}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDark}
      />
      <div className="flex-1 min-h-0 flex">
        {user && screen ? (
          <ScreenContent screen={screen} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-mono text-[var(--text-tertiary)]">Please log in to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Shell() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Dashboard key={user ? user.username : "anon"} />
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
