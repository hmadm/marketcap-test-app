import Link from "next/link";
import type { PortfolioStats, AllocationSlice } from "@/lib/portfolio";
import { UpsellBanner } from "./UpsellBanner";

export function PortfolioPanel({
  stats,
  allocation,
  showUpsell = false,
}: {
  stats: PortfolioStats;
  allocation: AllocationSlice[];
  showUpsell?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">My Portfolio</span>
        <Link
          href="/app/portfolio"
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
        >
          Manage
        </Link>
      </div>

      <div className="mt-3 text-2xl font-semibold">${stats.totalValue.toFixed(2)}</div>
      {stats.positionsCount > 0 && (
        <div className={`mt-1 text-xs ${stats.todaysChange >= 0 ? "text-accent-up" : "text-accent-down"}`}>
          {stats.todaysChange >= 0 ? "▲" : "▼"} {stats.todaysChangePct.toFixed(2)}% today
        </div>
      )}

      {allocation.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Allocation</span>
            <span>{stats.positionsCount} positions</span>
          </div>
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full">
            {allocation.map((slice) => (
              <div
                key={slice.symbol}
                style={{ width: `${slice.pct}%`, backgroundColor: slice.color }}
              />
            ))}
          </div>
          <ul className="mt-3 space-y-2">
            {allocation.slice(0, 5).map((slice) => (
              <li key={slice.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-muted">
                    {slice.symbol} {slice.pct.toFixed(1)}%
                  </span>
                </div>
                <span className="font-medium">${slice.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-xs text-muted">
          Enter share counts on your{" "}
          <Link href="/app/portfolio" className="text-foreground hover:underline">
            watchlist
          </Link>{" "}
          to see real allocation.
        </p>
      )}

      <Link
        href="/app/portfolio"
        className="mt-5 block w-full rounded-lg bg-surface-2 py-2 text-center text-sm font-medium hover:bg-border"
      >
        Manage Portfolio
      </Link>

      {showUpsell && (
        <div className="mt-3">
          <UpsellBanner />
        </div>
      )}
    </div>
  );
}
