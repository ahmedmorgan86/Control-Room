"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/context/auth";
import { Topbar } from "@/components/Topbar";
import { VesselMonitor } from "@/components/monitors/VesselMonitor";
import { YardMonitor } from "@/components/monitors/YardMonitor";
import { EquipmentMonitor } from "@/components/monitors/EquipmentMonitor";
import { YTTracker } from "@/components/monitors/YTTracker";
import { SCREEN_LABELS, screenTerminal, getUserScreens } from "@/lib/screens";
import type { ScreenKey, Terminal } from "@/lib/types";

function LoadingScreen() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--bg-void)] bg-mesh">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-white/[0.06] border-t-[var(--cyan)] rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-b-[var(--blue)] rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--text-dim)] mt-5">Initializing System</p>
      <div className="mt-4 w-32 h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--blue)] rounded-full animate-pulse" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

function ScreenContent({ screen }: { screen: ScreenKey }) {
  const terminal = (screenTerminal(screen) ?? "ACT") as Terminal;
  if (screen.includes("VSL")) return <VesselMonitor key={screen} terminalCode={terminal} />;
  if (screen.includes("EQU")) return <EquipmentMonitor key={screen} terminalCode={terminal} />;
  if (screen.includes("YT_TRACKER")) return <YTTracker key={screen} terminal={terminal} />;
  if (screen.includes("YARD")) return <YardMonitor key={screen} terminalCode={terminal} />;
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="glass rounded-2xl px-12 py-8 text-center card-3d gradient-border">
        <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] mb-1">Coming Soon</div>
        <p className="text-[11px] font-mono text-[var(--text-secondary)]">{SCREEN_LABELS[screen]}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const myScreens = useMemo(() => getUserScreens(user), [user]);
  const [screen, setScreen] = useState<ScreenKey | null>(() => myScreens[0] ?? null);

  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-mesh overflow-hidden noise-overlay">
      <Topbar activeScreen={screen} onNavigate={setScreen} />
      <div className="flex-1 min-h-0 flex">
        {user && screen ? (
          <ScreenContent screen={screen} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-mesh bg-grid border-t border-white/[0.04]">
            <div className="glass rounded-2xl px-12 py-8 text-center card-3d-lg gradient-border animate-fade-up">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--cyan)]/20 to-[var(--blue)]/20 border border-[var(--cyan)]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-[0.2em]">Login Required</p>
              <p className="text-[9px] font-mono text-[var(--text-dim)] mt-1">Enter credentials in the top bar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Shell() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return <Dashboard key={user ? user.username : "anon"} />;
}

export default function Page() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
