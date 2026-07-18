"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, X } from "lucide-react";
import { deleteAlert, markAlertTriggered } from "@/app/app/alerts/actions";

export type AlertRow = {
  id: string;
  symbol: string;
  direction: "above" | "below";
  target_price: number;
  triggered: boolean;
};

const POLL_MS = 15_000;

function checkCondition(direction: "above" | "below", price: number, target: number): boolean {
  return direction === "above" ? price >= target : price <= target;
}

export function AlertsTable({ alerts, showSymbol = true }: { alerts: AlertRow[]; showSymbol?: boolean }) {
  const [rows, setRows] = useState(alerts);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setRows(alerts);
  }, [alerts]);

  useEffect(() => {
    const symbols = Array.from(new Set(rows.filter((r) => !r.triggered).map((r) => r.symbol)));
    if (symbols.length === 0) return;

    async function poll() {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const res = await fetch(`/api/quote/${symbol}`, { cache: "no-store" });
            if (!res.ok) return null;
            const quote = await res.json();
            return quote?.c ? { symbol, price: quote.c as number } : null;
          } catch {
            return null;
          }
        }),
      );

      const nextPrices: Record<string, number> = {};
      for (const r of results) if (r) nextPrices[r.symbol] = r.price;
      setPrices((prev) => ({ ...prev, ...nextPrices }));

      for (const row of rows) {
        if (row.triggered || firedRef.current.has(row.id)) continue;
        const price = nextPrices[row.symbol];
        if (price == null) continue;
        if (checkCondition(row.direction, price, row.target_price)) {
          firedRef.current.add(row.id);
          setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, triggered: true } : r)));
          setToasts((prev) => [
            ...prev,
            {
              id: row.id,
              message: `${row.symbol} is now ${row.direction} $${row.target_price.toFixed(2)} (currently $${price.toFixed(2)})`,
            },
          ]);
          markAlertTriggered(row.id);
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== row.id));
          }, 8000);
        }
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map((r) => `${r.id}:${r.triggered}`).join(",")]);

  async function handleDelete(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    await deleteAlert(id);
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted">No alerts set yet.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const price = prices[row.symbol];
          return (
            <li key={row.id} className="flex items-center gap-3 py-3">
              {row.triggered ? (
                <BellRing className="h-4 w-4 shrink-0 text-accent" />
              ) : (
                <Bell className="h-4 w-4 shrink-0 text-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  {showSymbol && (
                    <Link href={`/app/stock/${row.symbol}`} className="font-medium hover:underline">
                      {row.symbol}
                    </Link>
                  )}
                  <span className="text-muted">
                    {row.direction === "above" ? "above" : "below"} ${row.target_price.toFixed(2)}
                  </span>
                  {row.triggered && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent">
                      Triggered
                    </span>
                  )}
                </div>
                {price != null && (
                  <div className="text-xs text-muted">Current: ${price.toFixed(2)}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(row.id)}
                title="Delete alert"
                className="text-muted hover:text-accent-down"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-accent/30 bg-surface-2 px-4 py-3 text-sm shadow-xl"
          >
            <BellRing className="h-4 w-4 text-accent" />
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
