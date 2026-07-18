import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { createClient } from "@/lib/supabase/server";
import { attachQuotes, computePortfolioStats, formatMoney, type Holding } from "@/lib/portfolio";
import { HoldingRow } from "@/components/portfolio/HoldingRow";

export const revalidate = 10;

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  const { data: items } = await supabase
    .from("watchlist_items")
    .select("symbol, shares, cost_basis, added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const holdings: Holding[] = items ?? [];
  const rows = await attachQuotes(holdings);
  const stats = computePortfolioStats(rows);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Portfolio" />

        {stats.positionsCount > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-xs text-muted">Holdings Value</div>
              <div className="mt-2 text-xl font-semibold">{formatMoney(stats.totalValue)}</div>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-xs text-muted">Unrealized P&amp;L</div>
              <div
                className={`mt-2 text-xl font-semibold ${
                  stats.unrealizedPL >= 0 ? "text-accent-up" : "text-accent-down"
                }`}
              >
                {stats.totalCostBasis > 0
                  ? `${formatMoney(stats.unrealizedPL, true)} (${stats.unrealizedPLPct.toFixed(2)}%)`
                  : "Add cost basis"}
              </div>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <div className="text-xs text-muted">Today&apos;s Change</div>
              <div
                className={`mt-2 text-xl font-semibold ${
                  stats.todaysChange >= 0 ? "text-accent-up" : "text-accent-down"
                }`}
              >
                {formatMoney(stats.todaysChange, true)} ({stats.todaysChangePct.toFixed(2)}%)
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Your Watchlist</h2>
            <p className="text-xs text-muted">
              Enter shares &amp; avg. cost to track real portfolio value
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-muted">
              You haven&apos;t saved any stocks yet. Search for a stock and hit{" "}
              <span className="text-foreground">Add to Portfolio</span> to save it here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="pb-2 font-normal">Symbol</th>
                    <th className="pb-2 font-normal">Price</th>
                    <th className="pb-2 font-normal">Change</th>
                    <th className="pb-2 font-normal">Shares</th>
                    <th className="pb-2 font-normal">Avg Cost</th>
                    <th className="pb-2 font-normal">Value</th>
                    <th className="pb-2 font-normal">P&amp;L</th>
                    <th className="pb-2 font-normal"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <HoldingRow key={row.symbol} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
