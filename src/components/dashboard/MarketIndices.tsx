import type { IndexQuote } from "@/lib/yahoo";

export function MarketIndices({ indices }: { indices: IndexQuote[] }) {
  if (indices.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {indices.map((index) => {
        const positive = index.changePct >= 0;
        const color = positive ? "text-accent-up" : "text-accent-down";
        return (
          <div key={index.symbol} className="rounded-2xl bg-surface p-4">
            <div className="text-xs text-muted">{index.name}</div>
            <div className="mt-1 text-lg font-semibold">
              {index.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={`mt-0.5 text-xs font-medium ${color}`}>
              {positive ? "+" : ""}
              {index.change.toFixed(2)} ({positive ? "+" : ""}
              {index.changePct.toFixed(2)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
}
