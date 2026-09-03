"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PollState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  now: number;
}

export function usePolling<T>(
  url: string,
  intervalMs: number,
  enabled: boolean = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json as T);
      setError(null);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      if (controller.signal.aborted) return;
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    // Kick off the first poll and schedule the rest.
    // setState only happens after an awaited fetch, so this is inherently async.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
    const id = setInterval(() => void fetchData(), intervalMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [fetchData, intervalMs]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return { data, loading, error, lastUpdated, now, refresh: fetchData };
}
