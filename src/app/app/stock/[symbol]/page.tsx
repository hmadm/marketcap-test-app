import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { StockChart } from "@/components/stock/StockChart";
import { AddToPortfolioButton } from "@/components/stock/AddToPortfolioButton";
import { NewsList } from "@/components/stock/NewsList";
import { getQuote, getCompanyProfile, getCompanyNews } from "@/lib/finnhub";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "@/components/alerts/AlertForm";
import { AlertsTable } from "@/components/alerts/AlertsTable";

export const revalidate = 10;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 14);

  const [quote, profile, news] = await Promise.all([
    getQuote(symbol).catch(() => null),
    getCompanyProfile(symbol).catch(() => null),
    getCompanyNews(symbol, isoDate(from), isoDate(to)).catch(() => []),
  ]);

  if (!quote || !quote.c) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadySaved = false;
  let symbolAlerts: { id: string; symbol: string; direction: "above" | "below"; target_price: number; triggered: boolean }[] = [];
  if (user) {
    const [watchlistResult, alertsResult] = await Promise.all([
      supabase
        .from("watchlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .maybeSingle(),
      supabase
        .from("price_alerts")
        .select("id, symbol, direction, target_price, triggered")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .order("created_at", { ascending: false }),
    ]);
    alreadySaved = !!watchlistResult.data;
    symbolAlerts = alertsResult.data ?? [];
  }

  const positive = (quote.d ?? 0) >= 0;

  const stats = [
    { label: "Open", value: quote.o },
    { label: "High", value: quote.h },
    { label: "Low", value: quote.l },
    { label: "Prev Close", value: quote.pc },
    {
      label: "Market Cap",
      value:
        profile?.marketCapitalization != null
          ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B`
          : "—",
      isText: true,
    },
    { label: "Exchange", value: profile?.exchange ?? "—", isText: true },
  ];

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <SearchBar />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logo}
                alt=""
                className="h-12 w-12 rounded-xl bg-surface object-contain p-1"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-sm font-semibold">
                {symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{symbol}</h1>
                <span className="text-sm text-muted">
                  {profile?.name ?? ""}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">${quote.c.toFixed(2)}</span>
                <span
                  className={`text-sm font-medium ${
                    positive ? "text-accent-up" : "text-accent-down"
                  }`}
                >
                  {positive ? "+" : ""}
                  {(quote.d ?? 0).toFixed(2)} ({(quote.dp ?? 0).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <AddToPortfolioButton symbol={symbol} initialSaved={alreadySaved} />
        </div>

        <div className="rounded-2xl bg-surface p-4">
          <StockChart symbol={symbol} initialPrice={quote.c} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-surface p-4">
              <div className="text-xs text-muted">{stat.label}</div>
              <div className="mt-1 text-sm font-semibold">
                {stat.isText ? stat.value : `$${Number(stat.value).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="rounded-2xl bg-surface p-4">
            <h2 className="mb-3 text-sm font-medium">Price Alerts</h2>
            <AlertForm symbol={symbol} />
            <div className="mt-4">
              <AlertsTable alerts={symbolAlerts} showSymbol={false} />
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-surface p-4">
          <h2 className="mb-2 text-sm font-medium">News</h2>
          <NewsList items={news} />
        </div>
      </main>
    </div>
  );
}
