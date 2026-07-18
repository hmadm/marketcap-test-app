import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { PopularStockCard } from "@/components/dashboard/PopularStockCard";
import { getMostActivePopularStocks } from "@/lib/movers";

export const revalidate = 60;

export default async function MoversPage() {
  const stocks = await getMostActivePopularStocks(20).catch(() => []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Most Active Today" />
        <p className="text-sm text-muted">
          The 20 most-traded US stocks today, ranked by real trading volume.
        </p>

        {stocks.length === 0 ? (
          <div className="rounded-2xl bg-surface p-6 text-sm text-muted">
            Couldn&apos;t load today&apos;s most active stocks right now. Try again shortly.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stocks.map((stock) => (
              <PopularStockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
