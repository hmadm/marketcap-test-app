"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { PopularStock } from "@/lib/mock-data";
import type { HistoryPoint } from "@/lib/yahoo";

type TooltipContentProps = {
  active?: boolean;
  payload?: { payload: HistoryPoint }[];
};

const POLL_MS = 15_000;
// Mini cards show the past month so the line reflects a real trend instead
// of a thin sliver that only fills in as the page stays open.
const SPARK_RANGE = "1M";

function formatTime(t: number) {
  return new Date(t).toLocaleDateString([], { month: "short", day: "numeric" });
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-2 px-2 py-1 text-xs shadow-xl">
      <div className="font-medium">${point.v.toFixed(2)}</div>
      <div className="text-muted">{formatTime(point.t)}</div>
    </div>
  );
}

export function PopularStockCard({ stock }: { stock: PopularStock }) {
  const [history, setHistory] = useState<HistoryPoint[]>([{ t: Date.now(), v: stock.price }]);
  const [live, setLive] = useState({
    price: stock.price,
    change: stock.change,
    changePct: stock.changePct,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/history/${stock.symbol}?range=${SPARK_RANGE}`)
      .then((res) => res.json())
      .then((data: HistoryPoint[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setHistory(data);
      })
      .catch(() => {});

    async function poll() {
      try {
        const res = await fetch(`/api/quote/${stock.symbol}`, { cache: "no-store" });
        if (!res.ok) return;
        const quote = await res.json();
        if (!quote?.c) return;

        setLive({ price: quote.c, change: quote.d ?? 0, changePct: quote.dp ?? 0 });
        setHistory((prev) => {
          if (prev.length === 0) return [{ t: Date.now(), v: quote.c as number }];
          return [...prev.slice(0, -1), { t: Date.now(), v: quote.c as number }];
        });
      } catch {
        // transient network error — keep showing the last known price
      }
    }

    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock.symbol]);

  const positive = live.changePct >= 0;
  const color = positive ? "#22c55e" : "#ef4444";

  return (
    <Link
      href={`/app/stock/${stock.symbol}`}
      className="block rounded-2xl bg-surface p-4 transition-colors hover:bg-surface-2"
    >
      <div className="flex items-center gap-2">
        {stock.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stock.logoUrl}
            alt=""
            className="h-7 w-7 shrink-0 rounded-md bg-surface-2 object-contain p-0.5"
          />
        ) : (
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold ${stock.logoBg}`}
          >
            {stock.logoText}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{stock.symbol}</div>
          <div className="truncate text-xs text-muted">{stock.name}</div>
        </div>
      </div>

      <div className="mt-3 h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id={`spark-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.3 }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.75}
              fill={`url(#spark-${stock.symbol})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold">${live.price.toFixed(2)}</span>
        <span className="text-xs font-medium" style={{ color }}>
          {positive ? "+" : ""}
          {live.change.toFixed(2)} ({live.changePct.toFixed(2)}%)
        </span>
      </div>
    </Link>
  );
}
