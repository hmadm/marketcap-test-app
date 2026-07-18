import Link from "next/link";
import { Bookmark } from "lucide-react";

export type RecentActivityItem = {
  symbol: string;
  added_at: string;
  shares: number | null;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActions({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <span className="text-sm font-medium">Recent Activity</span>

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted">
          Save stocks to your watchlist to see activity here.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.slice(0, 6).map((item) => (
            <li key={item.symbol} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Bookmark className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <Link href={`/app/stock/${item.symbol}`} className="text-sm font-medium hover:underline">
                    Added {item.symbol}
                  </Link>
                  <span className="text-xs text-muted">{timeAgo(item.added_at)}</span>
                </div>
                <div className="text-xs text-muted">
                  {item.shares != null ? `${item.shares} shares tracked` : "Watching"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
