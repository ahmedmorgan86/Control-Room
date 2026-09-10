"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { SCREEN_LABELS, screenTerminal, getUserScreens } from "@/lib/screens";
import type { ScreenKey } from "@/lib/types";

export function Topbar({
  activeScreen,
  onNavigate,
}: {
  activeScreen: ScreenKey | null;
  onNavigate: (s: ScreenKey) => void;
}) {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  const myScreens = useMemo<ScreenKey[]>(() => getUserScreens(user), [user]);

  const terminals = useMemo(() => {
    const set = new Set<string>();
    myScreens.forEach((k) => {
      const t = screenTerminal(k);
      if (t) set.add(t);
    });
    return ["ACT", "DCT"].filter((t) => set.has(t));
  }, [myScreens]);

  const activeTerm = activeScreen
    ? (screenTerminal(activeScreen) ?? terminals[0] ?? "DCT")
    : terminals[0] ?? "DCT";

  const filteredScreens = useMemo(() => {
    return myScreens.filter((s) => s.startsWith(activeTerm) && !s.includes("YT"));
  }, [myScreens, activeTerm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSubmitting(true);
    const err = await login(username, password);
    if (err) setLoginError(err);
    else { setUsername(""); setPassword(""); }
    setSubmitting(false);
  };

  if (user) {
    return (
      <header className="w-full h-12 bg-[rgba(10,15,28,0.9)] backdrop-blur-xl border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0 z-50 relative">
        {/* Left: Logo + Terminal badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo/full-dark.png" alt="Logo" className="h-8 object-contain" />
          </div>
          {terminals.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--text-secondary)] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                {activeTerm}
              </span>
            </div>
          )}
        </div>

        {/* Center: Nav tabs */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
          {filteredScreens.map((key) => {
            const isActive = activeScreen === key;
            const label = SCREEN_LABELS[key] ?? key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-white/[0.08] text-[var(--text-bright)] shadow-sm"
                    : "text-[var(--text-dim)] hover:text-[var(--text-secondary)] hover:bg-white/[0.04]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: Clock + User + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono leading-none">
            <div className="text-sm font-bold text-[var(--text-bright)] tabular-nums">{timeStr}</div>
            <div className="text-[8px] text-[var(--text-dim)] tracking-widest mt-0.5">{dateStr}</div>
          </div>
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
        </div>
      </header>
    );
  }

  return (
    <header className="w-full h-12 bg-[rgba(10,15,28,0.9)] backdrop-blur-xl border-b border-white/[0.06] px-4 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-2">
        <img src="/logo/full-dark.png" alt="Logo" className="h-8 object-contain" />
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right font-mono leading-none">
          <div className="text-sm font-bold text-[var(--text-bright)] tabular-nums">{timeStr}</div>
          <div className="text-[8px] text-[var(--text-dim)] tracking-widest mt-0.5">{dateStr}</div>
        </div>
        <div className="w-px h-5 bg-white/[0.08]" />
        <form onSubmit={handleLogin} className="flex items-center gap-2">
          {loginError && (
            <span className="text-[10px] font-mono text-[var(--red)] max-w-[120px] truncate">{loginError}</span>
          )}
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
            className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[var(--cyan)] to-[var(--blue)] hover:opacity-90 disabled:opacity-30 transition-all rounded"
          >
            {submitting ? "\u2026" : "GO"}
          </button>
        </form>
      </div>
    </header>
  );
}
