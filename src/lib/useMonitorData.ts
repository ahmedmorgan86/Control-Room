"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseMonitorDataOptions<T> {
  url: string;
  interval?: number;
  timeout?: number;
  enabled?: boolean;
}

interface UseMonitorDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useMonitorData<T>({
  url,
  interval = 30000,
  timeout = 15000,
  enabled = true,
}: UseMonitorDataOptions<T>): UseMonitorDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const failureCount = useRef(0);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.details || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setLastUpdated(new Date());
      failureCount.current = 0;
    } catch (err: unknown) {
      failureCount.current++;
      const backoff = Math.min(failureCount.current * 2000, 30000);
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      const name = err instanceof Error ? err.name : "";
      setError(
        name === "AbortError"
          ? `Request Timed Out (${timeout / 1000}s)`
          : message,
      );
      if (failureCount.current > 1) {
        console.warn(`[useMonitorData] Backoff: ${backoff}ms after ${failureCount.current} failures`);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [url, timeout]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;
    let intervalId: ReturnType<typeof setInterval>;
    let syncTimeoutId: ReturnType<typeof setTimeout>;

    const startSyncedInterval = () => {
      fetchData();
      const now = new Date();
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      syncTimeoutId = setTimeout(() => {
        fetchData();
        intervalId = setInterval(fetchData, interval);
      }, msToNextMinute);
    };

    startSyncedInterval();

    return () => {
      clearTimeout(syncTimeoutId);
      clearInterval(intervalId);
    };
  }, [fetchData, interval, enabled]);

  return { data, loading, error, lastUpdated, refresh };
}
