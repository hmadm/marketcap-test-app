import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Layers, Activity } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { createClient } from "@/lib/supabase/server";
import { getQuote } from "@/lib/finnhub";
import { ChangeBarChart } from "@/components/analytics/ChangeBarChart";

export const revalidate = 10;

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  const { data: items } = await supabase
    .from("watchlist_items")
    .select("symbol")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const rows = (
    await Promise.all(
      (items ?? []).map(async (item) => {
        const quote = await getQuote(item.symbol).catch(() => null);
        if (!quote?.c) return null;
        return {
          symbol: item.symbol,
          price: quote.c,
          change: quote.d ?? 0,
          changePct: quote.dp ?? 0,
        };
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  const hasData = rows.length > 0;
  const gainers = rows.filter((r) => r.changePct >= 0);
  const losers = rows.filter((r) => r.changePct < 0);
  const avgChange = hasData ? rows.reduce((sum, r) => sum + r.changePct, 0) / rows.length : 0;
  const best = hasData
    ? rows.reduce((a, b) => (b.changePct > a.changePct ? b : a))
    : null;
  const worst = hasData
    ? rows.reduce((a, b) => (b.changePct < a.changePct ? b : a))
    : null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Analytics" />

        {!hasData ? (
          <div className="rounded-2xl bg-surface p-6 text-sm text-muted">
            No stocks in your watchlist yet. Save a few from a{" "}
            <Link href="/app" className="text-foreground hover:underline">
              stock page
            </Link>{" "}
            to see performance analytics here.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Layers className="h-3.5 w-3.5" /> Tracked Stocks
                </div>
                <div className="mt-2 text-xl font-semibold">{rows.length}</div>
                <div className="mt-1 text-xs text-muted">
                  {gainers.length} up · {losers.length} down
                </div>
              </div>

              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Activity className="h-3.5 w-3.5" /> Average Change
                </div>
                <div
                  className={`mt-2 text-xl font-semibold ${
                    avgChange >= 0 ? "text-accent-up" : "text-accent-down"
                  }`}
                >
                  {avgChange >= 0 ? "+" : ""}
                  {avgChange.toFixed(2)}%
                </div>
                <div className="mt-1 text-xs text-muted">across watchlist</div>
              </div>

              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-accent-up" /> Best Performer
                </div>
                {best && (
                  <>
                    <div className="mt-2 text-xl font-semibold">{best.symbol}</div>
                    <div
                      className={`mt-1 text-xs ${
                        best.changePct >= 0 ? "text-accent-up" : "text-accent-down"
                      }`}
                    >
                      {best.changePct >= 0 ? "+" : ""}
                      {best.changePct.toFixed(2)}%
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <TrendingDown className="h-3.5 w-3.5 text-accent-down" /> Worst Performer
                </div>
                {worst && (
                  <>
                    <div className="mt-2 text-xl font-semibold">{worst.symbol}</div>
                    <div
                      className={`mt-1 text-xs ${
                        worst.changePct >= 0 ? "text-accent-up" : "text-accent-down"
                      }`}
                    >
                      {worst.changePct >= 0 ? "+" : ""}
                      {worst.changePct.toFixed(2)}%
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-4">
              <h2 className="mb-2 text-sm font-medium">Today&apos;s % Change by Stock</h2>
              <ChangeBarChart data={rows.map((r) => ({ symbol: r.symbol, changePct: r.changePct }))} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
