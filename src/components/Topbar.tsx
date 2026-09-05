"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/auth";
import { SCREEN_LABELS, screenTerminal, getUserScreens } from "@/lib/screens";
import type { ScreenKey } from "@/lib/types";
import { Logo } from "@/components/Logo";

export function Topbar({
  activeScreen,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  kioskMode,
  onToggleKioskMode,
  kioskSecondsLeft,
}: {
  activeScreen: ScreenKey | null;
  onNavigate: (s: ScreenKey) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  kioskMode?: boolean;
  onToggleKioskMode?: () => void;
  kioskSecondsLeft?: number;
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

  const myScreens = useMemo<ScreenKey[]>(() => getUserScreens(user), [user]);

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
  const otherScreens = myScreens.filter((k) => screenTerminal(k) === null);

  const darkToggle = (
    <button
      onClick={onToggleDarkMode}
      className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none overflow-hidden border"
      style={{
        background: isDarkMode ? "var(--signal)" : "var(--bg-progress)",
        borderColor: "var(--border)",
      }}
      aria-label="Toggle dark mode"
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <svg
          className="w-3 h-3 transition-opacity"
          style={{ opacity: isDarkMode ? 1 : 0, color: "var(--bg-page)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg
          className="w-3.5 h-3.5 transition-opacity"
          style={{ opacity: !isDarkMode ? 1 : 0, color: "var(--beacon)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path strokeLinecap="round" strokeWidth={3} d="M12 1v1.5M12 21.5V23M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M1 12h1.5M21.5 12H23M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06" />
        </svg>
      </span>
      <span
        className="inline-block h-5 w-5 rounded-full transition-transform shadow-sm z-10"
        style={{ transform: isDarkMode ? "translateX(1.5rem)" : "translateX(0.25rem)", background: "var(--bg-panel)" }}
      />
    </button>
  );

  const pillGroupClass = "relative flex rounded p-1 border shadow-sm transition-colors duration-300";
  const pillGroupStyle = { background: "var(--bg-header)", borderColor: "var(--border)" };

  if (user) {
    return (
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-topbar)] border-b border-[var(--border-topbar)] shrink-0 shadow-sm" style={{ minHeight: "68px" }}>
        <div className="flex items-center gap-4 flex-1">
          <Logo darkMode={isDarkMode} />
          <div className="flex flex-col">
            <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-widest whitespace-nowrap">
              Control Room
            </span>
            <span className="text-[9px] font-mono font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Port Operations
            </span>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-3 flex-1">
          {terminals.length > 0 && (
            <div className={pillGroupClass} style={pillGroupStyle}>
              <div
                className="absolute top-1 bottom-1 rounded-sm transition-all duration-300 ease-in-out"
                style={{ width: `${termMark.width}px`, left: `${termMark.left}px`, background: "var(--signal)" }}
              />
              {terminals.map((t) => {
                const active = t === activeTerm;
                return (
                  <button
                    key={t}
                    ref={(el) => { termRef.current[t] = el; }}
                    onClick={() => {
                      if (activeScreen && screenTerminal(activeScreen)) {
                        const suffix = activeScreen.split("_").slice(1).join("_");
                        const target = `${t}_${suffix}` as ScreenKey;
                        if (myScreens.includes(target)) {
                          onNavigate(target);
                          return;
                        }
                      }
                      const fallback = myScreens.find((k) => k.startsWith(t));
                      if (fallback) onNavigate(fallback);
                    }}
                    className="relative z-10 px-5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 rounded-sm"
                    style={{ color: active ? "var(--bg-page)" : "var(--text-secondary)" }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
          {terminals.length > 0 && termScreens.length > 0 && <div className="h-5 w-[1px]" style={{ background: "var(--border)" }} />}
          {termScreens.length > 0 && (
            <div className={pillGroupClass} style={pillGroupStyle}>
              <div
                className="absolute top-1 bottom-1 rounded-sm transition-all duration-300 ease-in-out"
                style={{
                  width: `${screenMark.width}px`,
                  left: `${screenMark.left}px`,
                  background: "var(--signal)",
                  opacity: activeScreen && termScreens.includes(activeScreen) ? 1 : 0,
                }}
              />
              {termScreens.map((key) => {
                const active = activeScreen === key;
                return (
                  <button
                    key={key}
                    ref={(el) => { screenRef.current[key] = el; }}
                    onClick={() => onNavigate(key)}
                    className="relative z-10 px-4 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300"
                    style={{ color: active ? "var(--bg-page)" : "var(--text-secondary)" }}
                  >
                    {SCREEN_LABELS[key].replace(/^ACT |^DCT /, "")}
                  </button>
                );
              })}
            </div>
          )}
          {(terminals.length > 0 || termScreens.length > 0) && otherScreens.length > 0 && (
            <div className="h-5 w-[1px]" style={{ background: "var(--border)" }} />
          )}
          {otherScreens.length > 0 && (
            <div className="flex items-center gap-1 rounded p-1 border shadow-sm transition-colors duration-300" style={pillGroupStyle}>
              {otherScreens.map((key) => {
                const active = activeScreen === key;
                return (
                  <button
                    key={key}
                    onClick={() => onNavigate(key)}
                    className="px-4 py-1.5 rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300"
                    style={{
                      background: active ? "var(--signal)" : "transparent",
                      color: active ? "var(--bg-page)" : "var(--text-secondary)",
                    }}
                  >
                    {SCREEN_LABELS[key]}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        <div className="flex items-center justify-end gap-5 flex-1">
          {onToggleKioskMode && (
            <button
              onClick={onToggleKioskMode}
              className="flex items-center gap-1.5 h-8 px-3 text-[10px] font-mono font-bold uppercase tracking-wider rounded border transition-all"
              style={{
                color: kioskMode ? "var(--bg-page)" : "var(--text-secondary)",
                background: kioskMode ? "var(--signal)" : "var(--bg-header)",
                borderColor: kioskMode ? "var(--signal)" : "var(--border)",
              }}
              title={kioskMode ? "Auto-rotating screens — click to stop" : "Auto-rotate through your screens"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4.5 9a8 8 0 0113.3-3.5L20 8M19.5 15a8 8 0 01-13.3 3.5L4 16" />
              </svg>
              {kioskMode ? `Rotating · ${kioskSecondsLeft}s` : "Auto-Rotate"}
            </button>
          )}
          {darkToggle}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border" style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}>
            <svg className="w-4 h-4" style={{ color: "var(--signal)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{user.full_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="h-8 px-3.5 text-xs font-mono font-bold uppercase tracking-wider rounded border transition-all"
            style={{ color: "var(--distress)", borderColor: "color-mix(in srgb, var(--distress) 30%, transparent)", background: "color-mix(in srgb, var(--distress) 10%, transparent)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--distress)"; e.currentTarget.style.color = "var(--bg-page)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "color-mix(in srgb, var(--distress) 10%, transparent)"; e.currentTarget.style.color = "var(--distress)"; }}
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
          <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] uppercase tracking-widest whitespace-nowrap">
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
            <span className="text-xs font-mono font-bold mr-2 animate-pulse" style={{ color: "var(--distress)" }}>{loginError}</span>
          )}
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-8 px-3.5 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)] transition-all w-36 shadow-sm"
            autoComplete="username" disabled={submitting}
          />
          <div className="relative group">
            <input
              type={showPass ? "text" : "password"} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-8 pl-3.5 pr-8 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--signal)] transition-all w-40 shadow-sm"
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
            className="h-8 px-5 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all shadow-sm disabled:opacity-40"
            style={{ color: "var(--bg-page)", background: "var(--signal)" }}
          >
            {submitting ? "..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
