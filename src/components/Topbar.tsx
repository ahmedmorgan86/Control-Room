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
  const [logoError, setLogoError] = useState(false);
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const myScreens = useMemo<ScreenKey[]>(() => getUserScreens(user), [user]);
  const terminals = useMemo(() => { const set = new Set<string>(); myScreens.forEach((key) => { const terminal = screenTerminal(key); if (terminal) set.add(terminal); }); return ["ACT", "DCT"].filter((terminal) => set.has(terminal)); }, [myScreens]);
  const activeTerm = activeScreen ? (screenTerminal(activeScreen) ?? terminals[0] ?? "DCT") : terminals[0] ?? "DCT";
  const filteredScreens = useMemo(() => myScreens.filter((screen) => screen.startsWith(activeTerm)), [myScreens, activeTerm]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setLoginError(null); setSubmitting(true);
    const error = await login(username, password);
    if (error) setLoginError(error); else { setUsername(""); setPassword(""); }
    setSubmitting(false);
  };

  return (
    <header className="relative z-50 flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[var(--bg-deep)] px-4">
      {/* Left: Logo + Terminal */}
      <div className="flex items-center gap-3">
        {logoError ? (
          <span className="text-[11px] font-bold text-[var(--cyan)] tracking-wider">SMART-OPS</span>
        ) : (
          <img src="/logo/full-dark.png" alt="Logo" className="h-8 object-contain" onError={() => setLogoError(true)} />
        )}
        {user && (
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] status-dot" style={{ color: "var(--green)" }} />
            {activeTerm}
          </div>
        )}
      </div>

      {/* Center: Nav */}
      {user ? (
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
          {filteredScreens.map((key) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                activeScreen === key
                  ? "bg-white/[0.08] text-[var(--text-bright)] shadow-sm"
                  : "text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]"
              }`}
            >
              {SCREEN_LABELS[key] ?? key}
            </button>
          ))}
        </nav>
      ) : (
        <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--text-dim)]">Restricted Operations Interface</div>
      )}

      {/* Right: Clock + User */}
      <div className="flex items-center gap-4">
        <div className="text-right font-mono leading-none">
          <div className="text-[13px] font-bold text-[var(--text-bright)] tabular-nums">{timeStr}</div>
          <div className="text-[8px] text-[var(--text-dim)] tracking-widest mt-0.5">{dateStr}</div>
        </div>
        {user ? (
          <>
            <div className="w-px h-5 bg-white/[0.08]" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--blue)] flex items-center justify-center text-[9px] font-bold text-white">
                {user.full_name?.charAt(0) ?? "U"}
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">{user.full_name}</span>
            </div>
            <button
              onClick={logout}
              className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--red)] border border-[var(--red)]/20 px-2.5 py-1 rounded hover:bg-[var(--red)]/10 transition-all duration-200"
            >
              EXIT
            </button>
          </>
        ) : (
          <form onSubmit={handleLogin} className="flex items-center gap-2">
            {loginError && <span className="text-[10px] font-mono text-[var(--red)] max-w-[120px] truncate">{loginError}</span>}
            <input
              type="text" placeholder="user" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-7 px-2.5 text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-[var(--text-bright)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--cyan)]/40 rounded w-24 transition-colors"
              autoComplete="username" disabled={submitting}
            />
            <input
              type="password" placeholder="pass" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-7 px-2.5 text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-[var(--text-bright)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--cyan)]/40 rounded w-24 transition-colors"
              autoComplete="current-password" disabled={submitting}
            />
            <button
              type="submit" disabled={submitting || !username || !password}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--bg-void)] bg-[var(--cyan)] hover:opacity-90 disabled:opacity-30 transition-all rounded"
            >
              {submitting ? "..." : "GO"}
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
