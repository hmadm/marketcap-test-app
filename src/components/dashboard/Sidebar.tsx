import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus, isPaidStatus } from "@/lib/subscription";
import { getUpcomingEarnings } from "@/lib/events";
import { Logo } from "@/components/Logo";
import { DemoTag } from "@/components/DemoTag";
import { SidebarUser } from "./SidebarUser";
import { SidebarNav } from "./SidebarNav";
import { MobileNavDrawer } from "./MobileNavDrawer";

function formatEventDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const HOUR_LABEL: Record<string, string> = {
  bmo: "Before open",
  amc: "After close",
  dmh: "During market",
};

export async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPro = user ? isPaidStatus(await getSubscriptionStatus(user.id)) : false;
  const earnings = await getUpcomingEarnings(14, 5);

  const content = (
    <>
      <Link href="/app" className="flex items-center gap-2 px-2">
        <Logo />
        <span className="text-lg font-semibold tracking-tight">MarketCap</span>
        <DemoTag />
      </Link>

      <SidebarNav />

      <SidebarUser email={user?.email ?? null} isPro={isPro} />

      <div className="mt-2 flex-1 overflow-hidden">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted">Upcoming Earnings</span>
          <Link
            href="/app/events"
            className="flex items-center gap-0.5 text-xs text-muted hover:text-foreground"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {earnings.length === 0 ? (
          <p className="px-2 text-xs text-muted">No upcoming earnings in the next 2 weeks.</p>
        ) : (
          <ul className="space-y-1">
            {earnings.map((event) => (
              <li key={`${event.symbol}-${event.date}`}>
                <Link
                  href={`/app/stock/${event.symbol}`}
                  className="flex items-start gap-2 rounded-lg px-2 py-2 text-xs hover:bg-surface"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/15 text-[10px] font-semibold text-accent">
                    {event.symbol.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-foreground">{event.symbol} earnings</div>
                    <div className="text-muted">
                      {formatEventDate(event.date)}
                      {event.hour && HOUR_LABEL[event.hour] ? ` · ${HOUR_LABEL[event.hour]}` : ""}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-6 border-r border-border bg-background px-4 py-6">
        {content}
      </aside>
      <MobileNavDrawer>{content}</MobileNavDrawer>
    </>
  );
}
