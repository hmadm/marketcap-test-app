import Link from "next/link";
import {
  TrendingUp,
  LineChart,
  Bell,
  Newspaper,
  BarChart3,
  Bookmark,
  Check,
  FlaskConical,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { DemoTag } from "@/components/DemoTag";

const features = [
  {
    icon: LineChart,
    title: "Live prices & charts",
    description:
      "Real-time quotes and historical charts (1D to 1Y) for any stock, powered by live market data.",
  },
  {
    icon: Bookmark,
    title: "Real portfolio tracking",
    description:
      "Save stocks to your watchlist, enter shares & cost basis, and see real profit/loss — not placeholder numbers.",
  },
  {
    icon: Bell,
    title: "Price alerts",
    description: "Set a target price and get notified in-app the moment a stock crosses it.",
  },
  {
    icon: Newspaper,
    title: "Market news",
    description: "Live headlines by category — general, forex, crypto, and mergers.",
  },
  {
    icon: BarChart3,
    title: "Portfolio analytics",
    description: "Best/worst performer, average change, and a visual breakdown of your holdings.",
  },
  {
    icon: TrendingUp,
    title: "Market movers",
    description: "See today's most actively traded stocks and upcoming earnings dates.",
  },
];

const freeFeatures = ["Live stock prices", "Market & company news", "Search any stock"];
const paidFeatures = [
  "Everything in Free",
  "Save unlimited stocks to your watchlist",
  "Track real gains/losses on saved stocks",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">MarketCap</span>
            <DemoTag />
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/app/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/app/signup"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Track stocks with real prices, real charts, and a real portfolio.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
            MarketCap is a live stock-tracking app: real-time quotes, historical charts, market
            news, price alerts, and a watchlist that computes your actual profit and loss.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app/signup"
              className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90 sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/app"
              className="w-full rounded-lg bg-surface px-6 py-3 text-sm font-medium hover:bg-surface-2 sm:w-auto"
            >
              Browse the demo
            </Link>
          </div>

          <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-sm text-amber-200">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <span className="font-medium text-amber-300">This is a demo/portfolio project.</span>{" "}
              Prices and news are real (live market data), but MarketCap is not a real brokerage —
              it can&apos;t buy or sell stocks, and payments run in Stripe&apos;s test/sandbox mode.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-surface/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you need to follow the market
              </h2>
              <p className="mt-3 text-muted">
                Built on live data from real market APIs — not mocked-up numbers.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl bg-surface p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Who it&apos;s for</h2>
            <p className="mt-3 text-muted">
              MarketCap is aimed at people who want a simple, fast way to follow stocks they care
              about — without opening a brokerage account.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface p-5">
              <h3 className="text-sm font-semibold">Casual investors</h3>
              <p className="mt-1 text-sm text-muted">
                Keep an eye on the stocks you already own or are considering, with a real watchlist
                and live prices.
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <h3 className="text-sm font-semibold">People learning the market</h3>
              <p className="mt-1 text-sm text-muted">
                Practice tracking a portfolio, reading charts, and following market news in a
                low-stakes way.
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <h3 className="text-sm font-semibold">Developers &amp; builders</h3>
              <p className="mt-1 text-sm text-muted">
                Curious what a live-data stock app looks like end to end — auth, payments, real
                market APIs, all wired up.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border bg-surface/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-muted">
                Track live prices for free. Upgrade to save stocks to your watchlist.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-6">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-1 text-sm text-muted">Browse the markets</p>
                <div className="mt-4 text-3xl font-semibold">
                  £0<span className="text-base font-normal text-muted">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-up" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app/signup"
                  className="mt-6 block w-full rounded-lg bg-surface-2 py-2 text-center text-sm font-medium hover:bg-border"
                >
                  Get Started
                </Link>
              </div>

              <div className="rounded-2xl border border-accent/30 bg-surface p-6">
                <h3 className="text-lg font-semibold">Paid</h3>
                <p className="mt-1 text-sm text-muted">Build your watchlist</p>
                <div className="mt-4 text-3xl font-semibold">
                  £10<span className="text-base font-normal text-muted">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {paidFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent-up" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app/signup"
                  className="mt-6 block w-full rounded-lg bg-accent py-2 text-center text-sm font-medium text-accent-foreground hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-md text-center text-xs text-muted">
              Payments run through Stripe in test/sandbox mode — no real charge occurs.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-xs text-muted sm:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-medium text-foreground">MarketCap</span>
            <DemoTag />
          </div>
          <p>
            A demo project. Live market data via Finnhub &amp; Yahoo Finance. Not investment
            advice, not a real brokerage.
          </p>
        </div>
      </footer>
    </div>
  );
}
