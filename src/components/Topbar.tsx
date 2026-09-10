"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { SCREEN_LABELS, screenTerminal, getUserScreens } from "@/lib/screens";
import type { ScreenKey } from "@/lib/types";

export function Topbar({ activeScreen, onNavigate }: { activeScreen: ScreenKey | null; onNavigate: (s: ScreenKey) => void }) {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const myScreens = useMemo<ScreenKey[]>(() => getUserScreens(user), [user]);
  const terminals = useMemo(() => { const set = new Set<string>(); myScreens.forEach((key) => { const terminal = screenTerminal(key); if (terminal) set.add(terminal); }); return ["ACT", "DCT"].filter((terminal) => set.has(terminal)); }, [myScreens]);
  const activeTerm = activeScreen ? (screenTerminal(activeScreen) ?? terminals[0] ?? "DCT") : terminals[0] ?? "DCT";
  const filteredScreens = useMemo(() => myScreens.filter((screen) => screen.startsWith(activeTerm) && !screen.includes("YT")), [myScreens, activeTerm]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setLoginError(null); setSubmitting(true);
    const error = await login(username, password);
    if (error) setLoginError(error); else { setUsername(""); setPassword(""); }
    setSubmitting(false);
  };

  return (
    <header className="relative z-50 flex min-h-16 shrink-0 items-center justify-between border-b border-white/[0.09] bg-[rgba(5,8,13,0.98)] px-6 shadow-depth-2">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex items-center gap-3 border-r border-white/[0.1] pr-6">
          <div aria-hidden="true" className="relative flex size-9 items-center justify-center rounded-lg border border-[var(--cyan)]/35 bg-[var(--cyan)]/[0.08] shadow-[0_0_18px_rgba(45,212,191,0.08)]">
            <span className="absolute h-5 w-px bg-[var(--cyan)]/80" />
            <span className="absolute h-px w-5 bg-[var(--cyan)]/80" />
            <span className="absolute bottom-2 size-1.5 rounded-full bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" />
          </div>
          <div className="leading-none"><div className="text-[12px] font-bold tracking-[0.18em] text-[var(--text-bright)]">CONTROL ROOM</div><div className="mt-1.5 text-[8px] font-mono tracking-[0.16em] text-[var(--text-dim)]">PORT SMART-OPS <span className="text-[var(--cyan)]">/</span> LIVE</div></div>
        </div>
        {user && <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--text-secondary)]"><span className="status-dot size-1.5 rounded-full bg-[var(--green)]" />{activeTerm} TERMINAL</div>}
      </div>

      {user ? <nav aria-label="Monitor navigation" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 border-l border-white/[0.08] pl-3">
        {filteredScreens.map((key) => <button key={key} onClick={() => onNavigate(key)} className={`border-b-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors ${activeScreen === key ? "border-[var(--cyan)] text-[var(--cyan)]" : "border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)]"}`}>{SCREEN_LABELS[key] ?? key}</button>)}
      </nav> : <div className="hidden text-[9px] font-mono uppercase tracking-[0.18em] text-[var(--text-dim)] md:block">Restricted operations interface</div>}

      <div className="flex items-center gap-4">
        <div className="text-right font-mono leading-none"><div className="text-[13px] font-bold tabular-nums text-[var(--text-bright)]">{timeStr}</div><div className="mt-1 text-[8px] tracking-[0.12em] text-[var(--text-dim)]">{dateStr}</div></div>
        {user ? <><div className="h-7 w-px bg-white/[0.1]" /><div className="flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-full border border-[var(--orange)]/35 bg-[var(--orange)]/10 text-[10px] font-bold text-[var(--orange)]">{user.full_name?.charAt(0) ?? "U"}</div><span className="hidden text-[10px] font-medium text-[var(--text-secondary)] lg:block">{user.full_name}</span></div><button onClick={logout} className="rounded-md border border-[var(--red)]/35 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--red)] transition-colors hover:bg-[var(--red)]/10">EXIT</button></> : <form onSubmit={handleLogin} className="flex items-center gap-2">{loginError && <span className="max-w-[120px] truncate text-[9px] font-mono text-[var(--red)]">{loginError}</span>}<input aria-label="Username" type="text" placeholder="USER ID" value={username} onChange={(event) => setUsername(event.target.value)} className="h-8 w-24 rounded-md border border-white/[0.12] bg-white/[0.04] px-2 text-[10px] font-mono text-[var(--text-bright)] placeholder:text-[var(--text-dim)] focus:border-[var(--cyan)] focus:outline-none" autoComplete="username" disabled={submitting} /><input aria-label="Password" type="password" placeholder="PASSCODE" value={password} onChange={(event) => setPassword(event.target.value)} className="h-8 w-24 rounded-md border border-white/[0.12] bg-white/[0.04] px-2 text-[10px] font-mono text-[var(--text-bright)] placeholder:text-[var(--text-dim)] focus:border-[var(--cyan)] focus:outline-none" autoComplete="current-password" disabled={submitting} /><button type="submit" disabled={submitting || !username || !password} className="h-8 rounded-md bg-[var(--cyan)] px-3 text-[10px] font-bold tracking-[0.1em] text-[var(--bg-void)] transition-opacity hover:opacity-85 disabled:opacity-30">{submitting ? "..." : "ENTER"}</button></form>}
      </div>
    </header>
  );
}
