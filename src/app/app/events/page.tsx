import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getUpcomingEarnings } from "@/lib/events";

function formatEventDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const HOUR_LABEL: Record<string, string> = {
  bmo: "Before market open",
  amc: "After market close",
  dmh: "During market hours",
};

export default async function EventsPage() {
  const earnings = await getUpcomingEarnings(30, 50);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Market Events" />
        <p className="text-sm text-muted">
          Upcoming earnings releases for large-cap companies over the next 30 days.
        </p>

        <div className="rounded-2xl bg-surface p-4">
          {earnings.length === 0 ? (
            <p className="text-sm text-muted">No upcoming earnings found.</p>
          ) : (
            <ul className="divide-y divide-border">
              {earnings.map((event) => (
                <li key={`${event.symbol}-${event.date}`}>
                  <Link
                    href={`/app/stock/${event.symbol}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-surface-2 rounded-lg px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-semibold text-accent">
                        {event.symbol.slice(0, 2)}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{event.symbol} earnings</div>
                        <div className="text-xs text-muted">
                          {formatEventDate(event.date)}
                          {event.hour && HOUR_LABEL[event.hour]
                            ? ` · ${HOUR_LABEL[event.hour]}`
                            : ""}
                        </div>
                      </div>
                    </div>
                    {event.epsEstimate != null && (
                      <div className="text-right text-xs text-muted">
                        EPS est. ${event.epsEstimate.toFixed(2)}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
