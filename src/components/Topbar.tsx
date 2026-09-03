"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/auth";
import { SCREEN_LABELS, screenTerminal, sortScreens } from "@/lib/screens";
import type { ScreenKey } from "@/lib/types";
import { Logo } from "@/components/Logo";

export function Topbar({
  activeScreen,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
}: {
  activeScreen: ScreenKey | null;
  onNavigate: (s: ScreenKey) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const { user, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const termRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const screenRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const [termMark, setTermMark] = useState({ left: 0, width: 0 });
  const [screenMark, setScreenMark] = useState({ left: 0, width: 0 });

  const myScreens = useMemo<ScreenKey[]>(() => {
    if (!user) return [];
    return sortScreens(
      (Object.entries(user.screens) as [ScreenKey, boolean][])
        .filter(([, v]) => v)
        .map(([k]) => k),
    );
  }, [user]);

  const terminals = useMemo(() => {
    const set = new Set<string>();
    myScreens.forEach((k) => {
      const t = screenTerminal(k);
      if (t) set.add(t);
    });
    return ["ACT", "DCT"].filter((t) => set.has(t));
  }, [myScreens]);

  const activeTerm = activeScreen ? (screenTerminal(activeScreen) ?? terminals[0] ?? "ACT") : terminals[0] ?? "ACT";

  useEffect(() => {
    const el = termRef.current[activeTerm];
    if (el) setTermMark({ left: el.offsetLeft, width: el.offsetWidth });
    const active = activeScreen ? screenRef.current[activeScreen] : null;
    if (active) setScreenMark({ left: active.offsetLeft, width: active.offsetWidth });
  }, [activeScreen, activeTerm, terminals, myScreens]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSubmitting(true);
    const err = await login(username, password);
    if (err) {
      setLoginError(err);
    } else {
      setUsername("");
      setPassword("");
      setShowPass(false);
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const termScreens = myScreens.filter((k) => screenTerminal(k) === activeTerm);

  const darkToggle = (
    <button
      onClick={onToggleDarkMode}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none overflow-hidden ${
        isDarkMode ? "bg-[var(--accent-blue)]" : "bg-slate-300"
      }`}
      aria-label="Toggle dark mode"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <svg
          className={`w-3 h-3 transition-opacity ${isDarkMode ? "opacity-100 text-white" : "opacity-0"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg
          className={`w-3.5 h-3.5 transition-opacity ${!isDarkMode ? "opacity-100 text-amber-500" : "opacity-0"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path strokeLinecap="round" strokeWidth={3} d="M12 1v1.5M12 21.5V23M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M1 12h1.5M21.5 12H23M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06" />
        </svg>
      </span>
      <span
        className="inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm z-10"
        style={{ transform: isDarkMode ? "translateX(1.5rem)" : "translateX(0.25rem)" }}
      />
    </button>
  );

  if (user) {
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-topbar)] border-b border-[var(--border-topbar)] shrink-0 shadow-sm" style={{ minHeight: "68px" }}>
        <div className="flex items-center gap-4 flex-1">
          <Logo darkMode={isDarkMode} />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-black text-[var(--text-primary)] uppercase tracking-widest whitespace-nowrap">
              Control Room
            </span>
            <span className="text-[9px] font-mono font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Port Operations
            </span>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-3 flex-1">
          {terminals.length > 0 && (
            <div className={`relative flex rounded-xl p-1 border border-[var(--border)] shadow-sm transition-colors duration-300 ${isDarkMode ? "bg-[#1a2744]" : "bg-slate-200"}`}>
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-[var(--accent-blue)] transition-all duration-300 ease-in-out shadow-sm"
                style={{ width: `${termMark.width}px`, left: `${termMark.left}px` }}
              />
              {terminals.map((t) => {
                const active = t === activeTerm;
                return (
                  <button
                    key={t}
                    ref={(el) => { termRef.current[t] = el; }}
                    onClick={() => {
                      const suffix = activeScreen?.split("_").slice(1).join("_");
                      const target = `${t}_${suffix}` as ScreenKey;
                      if (myScreens.includes(target)) onNavigate(target);
                      else {
                        const fallback = myScreens.find((k) => k.startsWith(t));
                        if (fallback) onNavigate(fallback);
                      }
                    }}
                    className={`relative z-10 px-5 py-1.5 text-[11px] font-mono font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-300 rounded-lg ${
                      active ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
          {terminals.length > 0 && <div className="h-5 w-[1px] bg-[var(--border)]" />}
          <div className={`relative flex rounded-xl p-1 border border-[var(--border)] shadow-sm transition-colors duration-300 ${isDarkMode ? "bg-[#1a2744]" : "bg-slate-200"}`}>
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-[var(--accent-blue)] transition-all duration-300 ease-in-out shadow-sm"
              style={{ width: `${screenMark.width}px`, left: `${screenMark.left}px` }}
            />
            {termScreens.map((key) => {
              const active = activeScreen === key;
              return (
                <button
                  key={key}
                  ref={(el) => { screenRef.current[key] = el; }}
                  onClick={() => onNavigate(key)}
                  className={`relative z-10 px-4 py-1.5 rounded-lg text-[11px] font-mono font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                    active ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {SCREEN_LABELS[key].replace(/^ACT |^DCT /, "")}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center justify-end gap-5 flex-1">
          {darkToggle}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-header)] border border-[var(--border)]">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{user.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="h-8 px-3.5 text-xs font-mono font-bold uppercase tracking-wider text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-topbar)] border-b border-[var(--border-topbar)] shrink-0 shadow-sm" style={{ minHeight: "68px" }}>
      <div className="flex items-center gap-4">
        <Logo darkMode={isDarkMode} />
        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-black text-[var(--text-primary)] uppercase tracking-widest whitespace-nowrap">
            Control Room
          </span>
          <span className="text-[9px] font-mono font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            Port Operations
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {darkToggle}
        <form onSubmit={handleLogin} className="flex items-center gap-3">
          {loginError && (
            <span className="text-xs font-mono font-bold text-red-500 mr-2 animate-pulse">{loginError}</span>
          )}
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-8 px-3.5 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all w-36 shadow-sm"
            autoComplete="username" disabled={submitting}
          />
          <div className="relative group">
            <input
              type={showPass ? "text" : "password"} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-8 pl-3.5 pr-8 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all w-40 shadow-sm"
              autoComplete="current-password" disabled={submitting}
            />
            <button
              type="button" onClick={() => setShowPass(!showPass)} disabled={submitting}
              className="absolute right-2.5 top-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              style={{ transform: "translateY(-50%)" }}
            >
              {showPass ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit" disabled={submitting || !username || !password}
            className="h-8 px-5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-[var(--accent-blue)] hover:opacity-90 disabled:opacity-40 rounded-xl transition-all shadow-sm"
          >
            {submitting ? "..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
