"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { HistoryRange, HistoryPoint } from "@/lib/yahoo";

const ranges: HistoryRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export function PortfolioChart() {
  const [range, setRange] = useState<HistoryRange>("1M");
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/portfolio-history?range=${range}`)
      .then((res) => res.json())
      .then((points: HistoryPoint[]) => {
        if (!cancelled && Array.isArray(points)) setData(points);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const first = data[0]?.v ?? 0;
  const last = data[data.length - 1]?.v ?? 0;
  const diff = last - first;
  const positive = diff >= 0;
  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Portfolio Value Over Time</div>
          {data.length > 0 && (
            <div className={`mt-1 text-xl font-semibold ${positive ? "text-accent-up" : "text-accent-down"}`}>
              {positive ? "+" : "-"}${Math.abs(diff).toFixed(2)}
            </div>
          )}
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {loading ? "Loading…" : "Add shares to a watchlist stock to see portfolio value"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolio-value" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#17171b",
                  border: "1px solid #232328",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={() => ""}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                fill="url(#portfolio-value)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
