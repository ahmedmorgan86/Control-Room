"use client";

import { useMonitorData } from "@/lib/useMonitorData";
import MonitorHeader from "@/components/MonitorHeader";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { VesselData } from "@/lib/types";

interface TrendChartProps {
  terminalCode: string;
}

export default function VesselTrendChart({ terminalCode }: TrendChartProps) {
  const { data: vessels, loading, error, lastUpdated } = useMonitorData<VesselData[]>({
    url: `/api/vessels?terminal=${terminalCode}`,
    interval: 60000,
  });

  const chartData = vessels?.flatMap((v) =>
    v.cranes.map((c) => ({
      name: c.craneId,
      done: c.movesDone,
      total: c.movesTotal,
      progress: c.movesTotal > 0 ? Math.round((c.movesDone / c.movesTotal) * 100) : 0,
    }))
  ) || [];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[var(--bg-page)]">
      <MonitorHeader
        title={`${terminalCode} Crane Progress`}
        stats={chartData.length > 0 ? `${chartData.length} Cranes` : undefined}
        lastUpdated={lastUpdated}
        error={error}
      />
      <main className="flex-1 min-h-0 p-4">
        {loading && chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs font-mono text-[var(--text-tertiary)]">No vessel data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--text-tertiary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--text-tertiary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)" />
              <YAxis stroke="var(--text-tertiary)" fontSize={10} fontFamily="var(--font-mono)" />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Area type="monotone" dataKey="total" stroke="var(--text-tertiary)" fillOpacity={1} fill="url(#colorTotal)" name="Target" />
              <Area type="monotone" dataKey="done" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorDone)" name="Done" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </main>
    </div>
  );
}
