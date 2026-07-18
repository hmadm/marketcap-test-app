import type { CompanyNewsItem, MarketNewsItem } from "@/lib/finnhub";

type NewsItem = CompanyNewsItem | MarketNewsItem;

function timeAgo(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NewsList({ items, limit = 10 }: { items: NewsItem[]; limit?: number }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No recent news found.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {items.slice(0, limit).map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 py-3 hover:bg-surface-2 rounded-lg px-2 -mx-2"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-16 w-24 shrink-0 rounded-lg object-cover bg-surface-2"
              />
            ) : (
              <div className="h-16 w-24 shrink-0 rounded-lg bg-surface-2" />
            )}
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium">{item.headline}</p>
              <p className="mt-1 text-xs text-muted">
                {item.source} · {timeAgo(item.datetime)}
              </p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
