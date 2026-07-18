export type HistoryRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

const RANGE_PARAMS: Record<HistoryRange, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1d" },
  "3M": { range: "3mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1wk" },
};

export type HistoryPoint = { t: number; v: number };

type YahooMeta = {
  regularMarketPrice: number;
  chartPreviousClose?: number;
  previousClose?: number;
  shortName?: string;
};

type YahooChartResult = {
  meta: YahooMeta;
  timestamp: number[];
  indicators: { quote: [{ close: (number | null)[] }] };
};

type YahooChartResponse = {
  chart: {
    result: [YahooChartResult] | null;
    error: { code: string; description: string } | null;
  };
};

async function fetchYahooChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<YahooChartResult> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?range=${range}&interval=${interval}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo chart request failed (${res.status})`);

  const data = (await res.json()) as YahooChartResponse;
  const result = data.chart.result?.[0];
  if (!result) throw new Error(data.chart.error?.description ?? "No chart data returned");
  return result;
}

export async function getHistoricalPrices(
  symbol: string,
  range: HistoryRange,
): Promise<HistoryPoint[]> {
  const { range: r, interval } = RANGE_PARAMS[range];
  const result = await fetchYahooChart(symbol, r, interval);

  const { timestamp, indicators } = result;
  const closes = indicators.quote[0].close;

  const points: HistoryPoint[] = [];
  for (let i = 0; i < timestamp.length; i++) {
    const close = closes[i];
    if (close == null) continue;
    points.push({ t: timestamp[i] * 1000, v: close });
  }
  return points;
}

export type IndexQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
};

export async function getIndexQuote(symbol: string, name: string): Promise<IndexQuote> {
  const result = await fetchYahooChart(symbol, "1d", "5m");
  const meta = result.meta;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
  const price = meta.regularMarketPrice;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  return { symbol, name, price, change, changePct };
}

export type MostActiveStock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
};

type YahooScreenerResponse = {
  finance: {
    result: [
      {
        quotes: {
          symbol: string;
          shortName?: string;
          longName?: string;
          regularMarketPrice?: number;
          regularMarketChange?: number;
          regularMarketChangePercent?: number;
          regularMarketVolume?: number;
        }[];
      },
    ] | null;
    error: { code: string; description: string } | null;
  };
};

// "Most Actives" is ranked by today's trading volume — the standard, real
// definition of "most popular" stocks used by Yahoo/Google Finance. There is
// no free API for genuine weekly popularity, so this reflects today only.
export async function getMostActiveStocks(count: number): Promise<MostActiveStock[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?lang=en-US&region=US&scrIds=most_actives&count=${count}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Yahoo screener request failed (${res.status})`);

  const data = (await res.json()) as YahooScreenerResponse;
  const quotes = data.finance.result?.[0]?.quotes;
  if (!quotes) throw new Error(data.finance.error?.description ?? "No screener data returned");

  return quotes
    .filter((q) => q.regularMarketPrice != null)
    .map((q) => ({
      symbol: q.symbol,
      name: q.shortName ?? q.longName ?? q.symbol,
      price: q.regularMarketPrice as number,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
    }));
}
