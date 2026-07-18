"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PopularStock } from "@/lib/mock-data";
import { PopularStockCard } from "./PopularStockCard";

type Sort = "default" | "top" | "worst";

export function PopularStocks({ stocks }: { stocks: PopularStock[] }) {
  const [sort, setSort] = useState<Sort>("default");

  const sorted = useMemo(() => {
    if (sort === "top") return [...stocks].sort((a, b) => b.changePct - a.changePct);
    if (sort === "worst") return [...stocks].sort((a, b) => a.changePct - b.changePct);
    return stocks;
  }, [stocks, sort]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted">
          Most active today{" "}
          <span className="font-normal text-muted/70">(by trading volume)</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-full bg-surface-2 p-1">
            <button
              onClick={() => setSort(sort === "worst" ? "default" : "worst")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sort === "worst"
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Worst
            </button>
            <button
              onClick={() => setSort(sort === "top" ? "default" : "top")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sort === "top"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Top
            </button>
          </div>
          <Link
            href="/app/movers"
            className="flex items-center gap-0.5 text-xs text-muted hover:text-foreground"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sorted.map((stock) => (
          <PopularStockCard key={stock.symbol} stock={stock} />
        ))}
      </div>
    </div>
  );
}
