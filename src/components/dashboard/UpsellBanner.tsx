import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

export function UpsellBanner() {
  return (
    <Link
      href="/app/pricing"
      className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/10 px-3 py-3 text-sm transition-colors hover:bg-accent/15"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="flex-1 text-foreground">
        Upgrade to Paid to save unlimited stocks to your watchlist.
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-accent" />
    </Link>
  );
}
