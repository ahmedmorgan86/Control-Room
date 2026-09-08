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
    else { setUsername(""); setPassword(""); setShowPass(false); }
    setSubmitting(false);
  };

  if (user) {
    return (
      <header className="w-full bg-[#0f172a] border-b border-[#1e293b] px-5 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo/full-dark.png" alt="Terminal Logo" className="h-12 object-contain" />
          </div>
          {terminals.length > 0 && (
            <span className="text-[11px] px-2.5 py-0.5 rounded font-bold tracking-wider bg-[#1e293b] text-white border border-[#334155]">
              {activeTerm}
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1">
          {filteredScreens.map((key) => {
            const isActive = activeScreen === key;
            const label = SCREEN_LABELS[key] ?? key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1e293b] text-white border border-[#334155]"
                    : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]/50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <div className="text-sm font-black text-white tabular-nums leading-tight">{timeStr}</div>
            <div className="text-[9px] text-[#64748b] uppercase tracking-wider">{dateStr}</div>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8] border-l border-[#1e293b] pl-4">
            <span className="text-xs font-semibold">{user.full_name}</span>
          </div>
          <button
            onClick={logout}
            className="text-[10px] font-bold uppercase tracking-wider text-[#ef4444] border border-[#ef4444]/50 px-3 py-1 rounded hover:bg-[#ef4444]/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-[#0f172a] border-b border-[#1e293b] px-5 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <img src="/logo/full-dark.png" alt="Terminal Logo" className="h-12 object-contain" />
      </div>

      <div className="flex items-center gap-4 font-mono">
        <div className="text-right">
          <div className="text-sm font-black text-white tabular-nums leading-tight">{timeStr}</div>
          <div className="text-[9px] text-[#64748b] uppercase tracking-wider">{dateStr}</div>
        </div>
        <form onSubmit={handleLogin} className="flex items-center gap-2 border-l border-[#1e293b] pl-4">
          {loginError && <span className="text-[10px] text-[#ef4444]">{loginError}</span>}
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-7 px-2.5 text-xs bg-[#1e293b] border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] rounded w-28"
            autoComplete="username" disabled={submitting}
          />
          <input
            type={showPass ? "text" : "password"} placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-7 px-2.5 text-xs bg-[#1e293b] border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] rounded w-28"
            autoComplete="current-password" disabled={submitting}
          />
          <button
            type="submit" disabled={submitting || !username || !password}
            className="h-7 px-3 text-xs font-bold uppercase tracking-wider text-white bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 transition-colors rounded"
          >
            {submitting ? "..." : "Login"}
          </button>
        </form>
      </div>
    </header>
  );
}
