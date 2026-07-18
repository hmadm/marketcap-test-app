import { getEarningsCalendar, type EarningsEvent } from "@/lib/finnhub";
import { EARNINGS_WATCH_SYMBOLS } from "@/lib/constants";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getUpcomingEarnings(
  days: number,
  limit: number,
): Promise<EarningsEvent[]> {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + days);
  const fromStr = isoDate(from);
  const toStr = isoDate(to);

  const results = await Promise.all(
    EARNINGS_WATCH_SYMBOLS.map((symbol) =>
      getEarningsCalendar(fromStr, toStr, symbol).catch(() => []),
    ),
  );

  return results
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
