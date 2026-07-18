import { Check } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus, isPaidStatus } from "@/lib/subscription";
import { ProBadge } from "@/components/ProBadge";
import { createCheckoutSession } from "./actions";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const status = user ? await getSubscriptionStatus(user.id) : "free";
  const onPaidPlan = isPaidStatus(status);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Pricing" />

        {checkout === "success" && (
          <div className="rounded-xl bg-accent-up/10 px-4 py-3 text-sm text-accent-up">
            Payment successful! Your plan will update shortly.
          </div>
        )}
        {checkout === "cancelled" && (
          <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
            Checkout cancelled — no charge was made.
          </div>
        )}

        <div className="mx-auto max-w-3xl pt-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-2 text-muted">
            Track live prices for free. Upgrade to save stocks to your watchlist.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 pt-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface p-6">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted">Browse the markets</p>
            <div className="mt-4 text-3xl font-semibold">
              £0<span className="text-base font-normal text-muted">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Live stock prices
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Market &amp; company news
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Search any stock
              </li>
            </ul>
            <div className="mt-6 rounded-lg bg-surface-2 py-2 text-center text-sm font-medium text-muted">
              {onPaidPlan ? "Included" : "Current plan"}
            </div>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-surface p-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Paid</h2>
              {onPaidPlan && <ProBadge />}
            </div>
            <p className="mt-1 text-sm text-muted">Build your watchlist</p>
            <div className="mt-4 text-3xl font-semibold">
              £10<span className="text-base font-normal text-muted">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Everything in Free
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Save unlimited stocks to your
                watchlist
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-up" /> Track live gains/losses on saved
                stocks
              </li>
            </ul>

            {onPaidPlan ? (
              <div className="mt-6 rounded-lg bg-accent-up/10 py-2 text-center text-sm font-medium text-accent-up">
                Current plan
              </div>
            ) : (
              <form action={createCheckoutSession} className="mt-6">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                >
                  {user ? "Upgrade to Paid" : "Log in to upgrade"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
