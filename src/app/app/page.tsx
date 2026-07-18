import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MarketIndices } from "@/components/dashboard/MarketIndices";
import { PopularStocks } from "@/components/dashboard/PopularStocks";
import { StatCards } from "@/components/dashboard/StatCards";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { PortfolioPanel } from "@/components/dashboard/PortfolioPanel";
import { RecentActions } from "@/components/dashboard/RecentActions";
import { getMarketNews } from "@/lib/finnhub";
import { getIndexQuote, type IndexQuote } from "@/lib/yahoo";
import { getMostActivePopularStocks } from "@/lib/movers";
import { NewsList } from "@/components/stock/NewsList";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus, isPaidStatus } from "@/lib/subscription";
import {
  attachQuotes,
  computePortfolioStats,
  computeAllocation,
  type Holding,
  type PortfolioStats,
  type AllocationSlice,
} from "@/lib/portfolio";
import type { RecentActivityItem } from "@/components/dashboard/RecentActions";

const INDEX_SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "Nasdaq" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^RUT", name: "Russell 2000" },
];

async function getLiveIndices(): Promise<IndexQuote[]> {
  const results = await Promise.allSettled(
    INDEX_SYMBOLS.map((idx) => getIndexQuote(idx.symbol, idx.name)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<IndexQuote> => r.status === "fulfilled")
    .map((r) => r.value);
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let watchlistItems: (Holding & { added_at: string })[] = [];
  if (user) {
    const { data } = await supabase
      .from("watchlist_items")
      .select("symbol, shares, cost_basis, added_at")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });
    watchlistItems = data ?? [];
  }

  const [liveStocks, marketNews, planStatus, indices, holdingsWithQuotes] = await Promise.all([
    getMostActivePopularStocks(4).catch(() => []),
    getMarketNews("general").catch(() => []),
    user ? getSubscriptionStatus(user.id) : Promise.resolve("free" as const),
    getLiveIndices(),
    attachQuotes(watchlistItems),
  ]);

  const showUpsell = !isPaidStatus(planStatus);
  const portfolioStats: PortfolioStats = computePortfolioStats(holdingsWithQuotes);
  const allocation: AllocationSlice[] = computeAllocation(holdingsWithQuotes);
  const recentActivity: RecentActivityItem[] = watchlistItems.map((w) => ({
    symbol: w.symbol,
    added_at: w.added_at,
    shares: w.shares,
  }));

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar />
        <MarketIndices indices={indices} />
        <PopularStocks stocks={liveStocks} />
        <StatCards stats={portfolioStats} />
        <PortfolioChart />

        <div className="rounded-2xl bg-surface p-4">
          <h2 className="mb-2 text-sm font-medium">Market News</h2>
          <NewsList items={marketNews} />
        </div>
      </main>

      <aside className="hidden w-80 shrink-0 space-y-4 border-l border-border px-4 py-6 xl:block">
        <PortfolioPanel stats={portfolioStats} allocation={allocation} showUpsell={showUpsell} />
        <RecentActions items={recentActivity} />
      </aside>
    </div>
  );
}
