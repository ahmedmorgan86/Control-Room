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
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clock, setClock] = useState(() => new Date());

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
    ? (screenTerminal(activeScreen) ?? terminals[0] ?? "ACT")
    : terminals[0] ?? "ACT";

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  if (user) {
    return (
      <header className="w-full bg-[#090e1c] border-b border-[#1c273e]/80 px-6 py-2.5 flex items-center justify-between shrink-0 z-50">
        {/* Left: Port Control Identity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#0e1321] border border-[#00f0ff]/40 glow-cyan">
            <svg className="w-6 h-6 text-[#00f0ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="3" stroke="currentColor" />
              <path d="M12 8v13m-7-5c0 3.866 3.134 7 7 7s7-3.134 7-7M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">PORT SMART-OPS</span>
              {terminals.map((t) => (
                <span
                  key={t}
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold tracking-widest ${
                    t === activeTerm
                      ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40"
                      : "bg-[#1c273e]/60 text-[#94a3b8] border border-[#1c273e]/40"
                  }`}
                >
                  {t}
                </span>
              ))}
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold tracking-widest bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                TV MODE
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-[0.15em] mt-0.5">
              Real-time Port Monitoring &amp; Intelligence Dashboard
            </div>
          </div>
        </div>

        {/* Center: Screen Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#060a14]/80 p-1.5 rounded-xl border border-[#1c273e]/60 font-mono text-sm">
          {myScreens.filter((s) => s.startsWith(activeTerm)).map((key) => {
            const isActive = activeScreen === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 glow-cyan"
                    : "font-medium text-[#94a3b8] hover:text-white hover:bg-[#141c2e] transition"
                }`}
              >
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping inline-block mr-2" />
                )}
                {SCREEN_LABELS[key].replace(/^ACT |^DCT /g, "")}
              </button>
            );
          })}
        </nav>

        {/* Right: Sync, Clocks & User */}
        <div className="flex items-center gap-5">
          {/* Sync Status */}
          <div className="flex items-center gap-2 bg-[#060a14] px-3 py-1.5 rounded-lg border border-[#1c273e]/90 font-mono">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[10px] text-[#10b981] uppercase tracking-widest font-semibold">Live</span>
          </div>

          {/* TV Mode Badge */}
          <div className="bg-[#060a14] px-3 py-1.5 rounded-lg border border-[#1c273e]/90 font-mono">
            <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest">TV</span>
          </div>

          {/* Live Dual Clocks */}
          <div className="flex items-center gap-3 bg-[#060a14] px-3.5 py-1.5 rounded-lg border border-[#1c273e]/90 font-mono">
            <div>
              <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Universal Time</div>
              <div className="text-sm font-bold text-[#dee2f6]">
                UTC {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" })}
              </div>
            </div>
            <div className="w-px h-7 bg-[#1c273e]" />
            <div>
              <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-semibold">Local Port</div>
              <div className="text-sm font-black text-[#00f0ff]">
                LOC {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-mono font-bold text-[#dee2f6]">{user.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="h-7 px-3 text-xs font-mono font-bold uppercase tracking-wider text-[#ef4444] border border-[#ef4444]/50 hover:bg-[#ef4444] hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#090e1c] border-b border-[#1c273e]/80 px-6 py-2.5 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#0e1321] border border-[#00f0ff]/40 glow-cyan">
          <svg className="w-6 h-6 text-[#00f0ff]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="3" stroke="currentColor" />
            <path d="M12 8v13m-7-5c0 3.866 3.134 7 7 7s7-3.134 7-7M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-black tracking-wider text-white">PORT SMART-OPS</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Dual Clocks */}
        <div className="flex items-center gap-3 bg-[#060a14] px-3.5 py-1.5 rounded-lg border border-[#1c273e]/90 font-mono">
          <div>
            <div className="text-[10px] text-[#64748b] uppercase tracking-widest">Universal Time</div>
            <div className="text-sm font-bold text-[#dee2f6]">
              UTC {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" })}
            </div>
          </div>
          <div className="w-px h-7 bg-[#1c273e]" />
          <div>
            <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-semibold">Local Port</div>
            <div className="text-sm font-black text-[#00f0ff]">
              LOC {clock.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex items-center gap-3">
          {loginError && (
            <span className="text-xs font-mono text-[#ef4444] mr-2 animate-pulse">{loginError}</span>
          )}
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-7 px-3 text-xs font-mono bg-[#141c2e] border border-[#1c273e] text-[#dee2f6] placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors w-36"
            autoComplete="username" disabled={submitting}
          />
          <div className="relative group">
            <input
              type={showPass ? "text" : "password"} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-7 pl-3 pr-8 text-xs font-mono bg-[#141c2e] border border-[#1c273e] text-[#dee2f6] placeholder-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors w-40"
              autoComplete="current-password" disabled={submitting}
            />
            <button
              type="button" onClick={() => setShowPass(!showPass)} disabled={submitting}
              className="absolute right-2 top-1/2 text-[#64748b] hover:text-[#dee2f6] transition-colors"
              style={{ transform: "translateY(-50%)" }}
            >
              {showPass ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit" disabled={submitting || !username || !password}
            className="h-7 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#060a14] bg-[#00f0ff] hover:bg-[#00f0ff]/90 disabled:opacity-40 transition-opacity"
          >
            {submitting ? "..." : "Login"}
          </button>
        </form>
      </div>
    </header>
  );
}
