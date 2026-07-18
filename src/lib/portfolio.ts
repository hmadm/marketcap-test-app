import { getQuote } from "@/lib/finnhub";
import { getHistoricalPrices, type HistoryRange, type HistoryPoint } from "@/lib/yahoo";

export function formatMoney(n: number, withSign = false): string {
  const abs = Math.abs(n).toFixed(2);
  const sign = n < 0 ? "-" : withSign ? "+" : "";
  return `${sign}$${abs}`;
}

export type Holding = {
  symbol: string;
  shares: number | null;
  cost_basis: number | null;
  added_at?: string;
};

export type HoldingWithQuote = Holding & {
  price: number | null;
  change: number | null;
  changePct: number | null;
};

export async function attachQuotes(holdings: Holding[]): Promise<HoldingWithQuote[]> {
  return Promise.all(
    holdings.map(async (h) => {
      const quote = await getQuote(h.symbol).catch(() => null);
      return {
        ...h,
        price: quote?.c ?? null,
        change: quote?.d ?? null,
        changePct: quote?.dp ?? null,
      };
    }),
  );
}

export type PortfolioStats = {
  totalValue: number;
  totalCostBasis: number;
  unrealizedPL: number;
  unrealizedPLPct: number;
  todaysChange: number;
  todaysChangePct: number;
  positionsCount: number;
};

export function computePortfolioStats(holdings: HoldingWithQuote[]): PortfolioStats {
  const positions = holdings.filter((h) => h.shares != null && h.price != null);

  let totalValue = 0;
  let totalCostBasis = 0;
  let hasCostBasis = false;
  let todaysChange = 0;
  let prevTotalValue = 0;

  for (const h of positions) {
    const shares = h.shares as number;
    const price = h.price as number;
    const value = shares * price;
    totalValue += value;

    if (h.cost_basis != null) {
      totalCostBasis += shares * h.cost_basis;
      hasCostBasis = true;
    }

    const change = h.change ?? 0;
    todaysChange += shares * change;
    prevTotalValue += shares * (price - change);
  }

  const unrealizedPL = hasCostBasis ? totalValue - totalCostBasis : 0;
  const unrealizedPLPct = hasCostBasis && totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0;
  const todaysChangePct = prevTotalValue > 0 ? (todaysChange / prevTotalValue) * 100 : 0;

  return {
    totalValue,
    totalCostBasis,
    unrealizedPL,
    unrealizedPLPct,
    todaysChange,
    todaysChangePct,
    positionsCount: positions.length,
  };
}

export type AllocationSlice = { symbol: string; value: number; pct: number; color: string };

const PALETTE = ["#2f6fed", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7", "#ef4444", "#84cc16"];

export function computeAllocation(holdings: HoldingWithQuote[]): AllocationSlice[] {
  const positions = holdings.filter((h) => h.shares != null && h.price != null);
  const total = positions.reduce((sum, h) => sum + (h.shares as number) * (h.price as number), 0);
  if (total === 0) return [];

  return positions
    .map((h, i) => {
      const value = (h.shares as number) * (h.price as number);
      return { symbol: h.symbol, value, pct: (value / total) * 100, color: PALETTE[i % PALETTE.length] };
    })
    .sort((a, b) => b.value - a.value);
}

export async function getPortfolioValueHistory(
  holdings: Holding[],
  range: HistoryRange,
): Promise<HistoryPoint[]> {
  const positions = holdings.filter((h) => h.shares != null);
  if (positions.length === 0) return [];

  const series = await Promise.all(
    positions.map(async (h) => {
      const points = await getHistoricalPrices(h.symbol, range).catch(() => []);
      return { shares: h.shares as number, points };
    }),
  );

  const withData = series.filter((s) => s.points.length > 0);
  if (withData.length === 0) return [];

  // All requests use identical range/interval params, so timestamp grids line
  // up closely enough to combine by index. Use the longest series as the axis.
  const reference = withData.reduce((a, b) => (b.points.length > a.points.length ? b : a));

  return reference.points.map((point, i) => {
    let total = 0;
    for (const s of withData) {
      const p = s.points[i] ?? s.points[s.points.length - 1];
      total += s.shares * p.v;
    }
    return { t: point.t, v: total };
  });
}
