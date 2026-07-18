"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { HistoryRange, HistoryPoint } from "@/lib/yahoo";

type TooltipContentProps = {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
};

const ranges: HistoryRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

const LIVE_POLL_MS = 15_000;

// Expected calendar-day span for each range, used to detect when a stock
// simply doesn't have that much trading history yet (e.g. a recent IPO) —
// Yahoo returns the same short real dataset for every longer range in that
// case, which otherwise looks like the range switcher is broken.
const EXPECTED_DAYS: Record<HistoryRange, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

function formatPoint(t: number, range: HistoryRange) {
  const d = new Date(t);
  if (range === "1D" || range === "1W") {
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function ChartTooltip({
  active,
  payload,
  range,
}: TooltipContentProps & { range: HistoryRange }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs shadow-xl">
      <div className="text-sm font-medium">${point.v.toFixed(2)}</div>
      <div className="text-muted">{formatPoint(point.t, range)}</div>
    </div>
  );
}

export function StockChart({ symbol, initialPrice }: { symbol: string; initialPrice: number }) {
  const [range, setRange] = useState<HistoryRange>("1D");
  const [history, setHistory] = useState<HistoryPoint[]>([{ t: Date.now(), v: initialPrice }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/history/${symbol}?range=${range}`)
      .then((res) => res.json())
      .then((data: HistoryPoint[] | { error: string }) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        } else {
          setError(true);
        }
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  // For the 1D view, keep the trailing edge of the chart moving with live
  // quote polling instead of waiting for the next 5-minute Yahoo candle.
  useEffect(() => {
    if (range !== "1D") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/quote/${symbol}`, { cache: "no-store" });
        if (!res.ok) return;
        const quote = await res.json();
        if (!quote?.c) return;
        setHistory((prev) => [...prev, { t: Date.now(), v: quote.c as number }]);
      } catch {
        // transient network error — keep showing the last known price
      }
    }, LIVE_POLL_MS);
    return () => clearInterval(id);
  }, [symbol, range]);

  const first = history[0]?.v ?? initialPrice;
  const last = history[history.length - 1]?.v ?? initialPrice;
  const positive = last >= first;
  const color = positive ? "#22c55e" : "#ef4444";

  const spanDays =
    history.length > 1 ? (history[history.length - 1].t - history[0].t) / (1000 * 60 * 60 * 24) : 0;
  const limitedHistory =
    !loading &&
    !error &&
    range !== "1D" &&
    range !== "1W" &&
    spanDays > 0 &&
    spanDays < EXPECTED_DAYS[range] * 0.5;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          {loading
            ? "Loading…"
            : error
              ? "Couldn't load history — showing latest price"
              : limitedHistory
                ? `${symbol} has only ~${Math.max(1, Math.round(spanDays))}d of trading history — showing all available data`
                : " "}
        </span>
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
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stock-detail-chart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={<ChartTooltip range={range} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.3 }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill="url(#stock-detail-chart)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
