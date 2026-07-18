import { formatMoney, type PortfolioStats } from "@/lib/portfolio";

export function StatCards({ stats }: { stats: PortfolioStats }) {
  const cards = [
    {
      label: "Holdings Value",
      value: formatMoney(stats.totalValue),
      delta: null,
      positive: true,
    },
    {
      label: "Unrealized P&L",
      value: stats.totalCostBasis > 0 ? formatMoney(stats.unrealizedPL, true) : "—",
      delta: stats.totalCostBasis > 0 ? `${stats.unrealizedPLPct.toFixed(2)}%` : null,
      positive: stats.unrealizedPL >= 0,
    },
    {
      label: "Today's Change",
      value: formatMoney(stats.todaysChange, true),
      delta: `${stats.todaysChangePct >= 0 ? "+" : ""}${stats.todaysChangePct.toFixed(2)}%`,
      positive: stats.todaysChange >= 0,
    },
    {
      label: "Positions",
      value: `${stats.positionsCount}`,
      delta: null,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((stat) => (
        <div key={stat.label} className="rounded-2xl bg-surface p-4">
          <span className="text-xs text-muted">{stat.label}</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-xl font-semibold ${
                stat.label === "Holdings Value" || stat.label === "Positions"
                  ? ""
                  : stat.positive
                    ? "text-accent-up"
                    : "text-accent-down"
              }`}
            >
              {stat.value}
            </span>
            {stat.delta && (
              <span
                className={`text-xs font-medium ${
                  stat.positive ? "text-accent-up" : "text-accent-down"
                }`}
              >
                {stat.delta}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
