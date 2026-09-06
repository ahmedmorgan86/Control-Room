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
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#060a14]">
      <div className="w-10 h-10 border-2 border-[#1c273e] border-t-[#00f0ff] rounded-full animate-spin mb-4" />
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#64748b]">
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
  if (screen.includes("VSL")) return <VesselMonitor key={screen} terminalCode={terminal} />;
  if (screen.includes("EQU")) return <EquipmentMonitor key={screen} terminalCode={terminal} />;
  if (screen.includes("YT_TRACKER")) return <YTTracker key={screen} terminal={terminal} />;
  if (screen.includes("YARD")) return <YardMonitor key={screen} terminalCode={terminal} />;
  return <UnderDevelopment key={screen} name={SCREEN_LABELS[screen]} />;
}

function Dashboard() {
  const { user } = useAuth();
  const myScreens = useMemo(() => getUserScreens(user), [user]);
  const [screen, setScreen] = useState<ScreenKey | null>(() => myScreens[0] ?? null);

  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#060a14] overflow-hidden">
      <Topbar
        activeScreen={screen}
        onNavigate={setScreen}
      />
      <div className="flex-1 min-h-0 flex">
        {user && screen ? (
          <ScreenContent screen={screen} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs font-mono text-[#64748b] uppercase tracking-[0.15em]">Please log in to continue</p>
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
