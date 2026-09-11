"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/context/auth";
import { screenLabels } from "@/lib/screens";

export default function Topbar({
  activeScreen,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
}: {
  activeScreen: string | null;
  onNavigate: (screen: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const { user, login, logout } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const terminalTabRefs = useRef<Record<string, HTMLButtonElement>>({});
  const screenTabRefs = useRef<Record<string, HTMLButtonElement>>({});
  const [terminalIndicator, setTerminalIndicator] = useState({
    left: 0,
    width: 0,
  });
  const [screenIndicator, setScreenIndicator] = useState({
    left: 0,
    width: 0,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    const error = await login(username, password);
    if (error) setLoginError(error);
    else {
      setUsername("");
      setPassword("");
      setShowPassword(false);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const screens = useMemo(() => user
    ? (Object.entries(user.screens)
        .filter(([, v]) => v)
        .map(([k]) => ({
          key: k,
          label: screenLabels[k] || k.replace(/_/g, " "),
        }))
        .sort((a, b) => {
          const rank = (k: string) =>
            k.includes("VSL") ? 0 : k.includes("EQU") ? 1 : k.includes("YARD") ? 2 : 99;
          return rank(a.key) - rank(b.key);
        }))
    : [], [user]);

  useEffect(() => {
    const terminal =
      activeScreen?.split("_")[0] || screens[0]?.key.split("_")[0];
    const tabEl = terminalTabRefs.current[terminal || "ACT"];
    if (tabEl) {
      setTerminalIndicator({
        left: tabEl.offsetLeft,
        width: tabEl.offsetWidth,
      });
    }
    const screenEl = screenTabRefs.current[activeScreen || ""];
    if (screenEl) {
      setScreenIndicator({
        left: screenEl.offsetLeft,
        width: screenEl.offsetWidth,
      });
    }
  }, [activeScreen, screens]);

  const DarkModeToggle = (
    <button
      onClick={onToggleDarkMode}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 overflow-hidden ${
        isDarkMode ? "bg-[var(--accent-blue)]" : "bg-slate-300"
      }`}
    >
      <span className="sr-only">Toggle dark mode</span>
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <svg
          className={`w-3 h-3 transition-opacity ${
            isDarkMode ? "opacity-100 text-white" : "opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <svg
          className={`w-3.5 h-3.5 transition-opacity ${
            !isDarkMode ? "opacity-100 text-amber-500" : "opacity-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path
            strokeLinecap="round"
            strokeWidth={3}
            d="M12 1v1.5M12 21.5V23M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M1 12h1.5M21.5 12H23M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06"
          />
        </svg>
      </span>
      <span
        className="inline-block h-5 w-5 rounded-full bg-white transition-transform shadow-sm z-10"
        style={{
          transform: isDarkMode
            ? "translateX(1.5rem)"
            : "translateX(0.25rem)",
        }}
      />
    </button>
  );

  if (user) {
    return (
      <div
        className="flex items-center justify-between px-6 py-3 bg-[var(--bg-topbar)] border-b border-[var(--border-topbar)] shrink-0"
        style={{ minHeight: "64px" }}
      >
        <div className="flex items-center gap-4 flex-1">
          <Image
            src={isDarkMode ? "/images/logo1_darkmode.svg" : "/images/logo1.svg"}
            alt="Logo"
            width={140}
            height={44}
            priority
            className="h-11 w-auto object-contain"
          />
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest whitespace-nowrap">
            Terminal Monitoring System
          </span>
        </div>

        <nav className="flex items-center justify-center gap-4 flex-1" role="navigation" aria-label="Monitor navigation">
          {(() => {
            const terminals = ["ACT", "DCT"].filter((t) =>
              screens.some((s) => s.key.startsWith(t)),
            );
            if (terminals.length === 0) return null;
            const current = activeScreen?.split("_")[0] || terminals[0];
            return (
              <div
                className={`relative flex rounded-full p-1 border border-[var(--border)] shadow-inner transition-colors duration-300 ${
                  isDarkMode ? "bg-slate-700" : "bg-slate-300"
                }`}
                role="tablist"
                aria-label="Terminal selection"
              >
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm"
                  style={{
                    width: `${terminalIndicator.width}px`,
                    left: `${terminalIndicator.left}px`,
                  }}
                />
                {terminals.map((t) => {
                  const active = current === t;
                  return (
                    <button
                      key={t}
                      ref={(el) => {
                        terminalTabRefs.current[t] = el!;
                      }}
                      onClick={() => {
                        const suffix = activeScreen?.split("_").slice(1).join("_");
                        const candidate = `${t}_${suffix}`;
                        if (screens.some((s) => s.key === candidate))
                          onNavigate(candidate);
                        else {
                          const first = screens.find((s) =>
                            s.key.startsWith(t),
                          );
                          if (first) onNavigate(first.key);
                        }
                      }}
                      className={`relative z-10 px-6 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wide whitespace-nowrap transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? "text-slate-900"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      role="tab"
                      aria-selected={active}
                      aria-label={`${t} terminal`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <div className="h-4 w-[1px] bg-[var(--border)] opacity-30" />

          <div
            className={`relative flex rounded-full p-1 border border-[var(--border)] shadow-inner transition-colors duration-300 ${
              isDarkMode ? "bg-slate-700" : "bg-slate-300"
            }`}
            role="tablist"
            aria-label="Screen selection"
          >
            <div
              className="absolute top-1 bottom-1 rounded-full bg-white transition-all duration-300 ease-in-out shadow-sm"
              style={{
                width: `${screenIndicator.width}px`,
                left: `${screenIndicator.left}px`,
              }}
            />
            {screens
              .filter((s) => {
                const terminal = activeScreen?.split("_")[0];
                return s.key.startsWith(terminal || "ACT");
              })
              .map(({ key, label }) => (
                <button
                  key={key}
                  ref={(el) => {
                    screenTabRefs.current[key] = el!;
                  }}
                  onClick={() => onNavigate(key)}
                  className={`relative z-10 px-5 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wide whitespace-nowrap transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    activeScreen === key
                      ? "text-slate-900"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  role="tab"
                  aria-selected={activeScreen === key}
                  aria-label={label}
                >
                  {label.replace(/^ACT |^DCT /g, "")}
                </button>
              ))}
          </div>
        </nav>

        <div className="flex items-center justify-end gap-6 flex-1">
          {DarkModeToggle}
          <div className="flex items-center gap-2">
            <svg
              className="w-4.5 h-4.5 text-[var(--text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
              {user.full_name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="h-7 px-3 text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-discharge)] border border-[var(--accent-discharge)] hover:bg-[var(--accent-discharge)] hover:text-white transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between px-6 py-3 bg-[var(--bg-topbar)] border-b border-[var(--border-topbar)] shrink-0"
      style={{ minHeight: "64px" }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={isDarkMode ? "/images/logo1_darkmode.svg" : "/images/logo1.svg"}
          alt="Logo"
          width={140}
          height={44}
          priority
          className="h-11 w-auto object-contain"
        />
        <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest whitespace-nowrap">
          Terminal Monitoring System
        </span>
      </div>
      <div className="flex items-center gap-6">
        {DarkModeToggle}
        <form onSubmit={handleLogin} className="flex items-center gap-3">
          {loginError && (
            <span className="text-xs font-mono text-[var(--accent-discharge)] mr-2 animate-pulse">
              {loginError}
            </span>
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-7 px-3 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors w-36"
            autoComplete="username"
            disabled={isLoggingIn}
          />
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-7 pl-3 pr-8 text-xs font-mono bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors w-40"
              autoComplete="current-password"
              disabled={isLoggingIn}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              style={{ transform: "translateY(-50%)" }}
            >
              {showPassword ? (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className="h-7 px-4 text-xs font-mono font-bold uppercase tracking-wider text-white bg-[var(--accent-blue)] hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isLoggingIn ? "..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
