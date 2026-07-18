import { getCompanyProfile } from "@/lib/finnhub";
import { getMostActiveStocks } from "@/lib/yahoo";
import { logoColorFor, type PopularStock } from "@/lib/mock-data";

export async function getMostActivePopularStocks(count: number): Promise<PopularStock[]> {
  const active = await getMostActiveStocks(count);

  return Promise.all(
    active.map(async (stock) => {
      const profile = await getCompanyProfile(stock.symbol).catch(() => null);
      return {
        symbol: stock.symbol,
        name: profile?.name ?? stock.name,
        price: stock.price,
        change: stock.change,
        changePct: stock.changePct,
        logoUrl: profile?.logo || undefined,
        logoBg: logoColorFor(stock.symbol),
        logoText: stock.symbol.slice(0, 2),
      };
    }),
  );
}
