const BASE_URL = "https://finnhub.io/api/v1";

function apiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not set in .env.local");
  return key;
}

async function finnhubFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", apiKey());

  const res = await fetch(url.toString(), { next: { revalidate: 10 } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Finnhub request failed (${res.status}): ${path} — ${body}`);
  }
  return res.json() as Promise<T>;
}

export type Quote = {
  c: number; // current price
  d: number | null; // change
  dp: number | null; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
};

export function getQuote(symbol: string): Promise<Quote> {
  return finnhubFetch<Quote>("/quote", { symbol });
}

export type SymbolSearchResult = {
  count: number;
  result: { description: string; displaySymbol: string; symbol: string; type: string }[];
};

export function searchSymbols(query: string): Promise<SymbolSearchResult> {
  return finnhubFetch<SymbolSearchResult>("/search", { q: query });
}

export type CompanyProfile = {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  logo: string;
  ticker: string;
  weburl: string;
  finnhubIndustry: string;
};

export function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  return finnhubFetch<CompanyProfile>("/stock/profile2", { symbol });
}

export type CompanyNewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image: string;
};

export function getCompanyNews(
  symbol: string,
  from: string,
  to: string,
): Promise<CompanyNewsItem[]> {
  return finnhubFetch<CompanyNewsItem[]>("/company-news", { symbol, from, to });
}

export type MarketNewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  image: string;
  category: string;
};

export function getMarketNews(category = "general"): Promise<MarketNewsItem[]> {
  return finnhubFetch<MarketNewsItem[]>("/news", { category });
}

export type EarningsEvent = {
  symbol: string;
  date: string;
  hour: string;
  epsEstimate: number | null;
  revenueEstimate: number | null;
};

export async function getEarningsCalendar(
  from: string,
  to: string,
  symbol?: string,
): Promise<EarningsEvent[]> {
  const params: Record<string, string> = { from, to };
  if (symbol) params.symbol = symbol;
  const data = await finnhubFetch<{ earningsCalendar: EarningsEvent[] }>(
    "/calendar/earnings",
    params,
  );
  return data.earningsCalendar ?? [];
}
