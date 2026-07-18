// Curated large-cap symbols for the earnings calendar. Finnhub's free-tier
// bulk /calendar/earnings endpoint caps at 1500 entries and isn't reliably
// date-sorted, so large caps can get silently truncated out — we query these
// symbols individually instead (see lib/events.ts). Kept short to stay well
// within the free-tier rate limit (60 req/min).
export const EARNINGS_WATCH_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "JPM", "V", "WMT",
  "DIS", "NFLX", "KO", "XOM", "ADBE", "CRM", "AMD", "INTC", "COST", "MCD",
];
