import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "@/components/alerts/AlertForm";
import { AlertsTable } from "@/components/alerts/AlertsTable";

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  const { data: alerts } = await supabase
    .from("price_alerts")
    .select("id, symbol, direction, target_price, triggered")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="Alerts" />

        <div className="rounded-2xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium">New Alert</h2>
          <AlertForm />
        </div>

        <div className="rounded-2xl bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium">
            Your Alerts{" "}
            <span className="text-xs font-normal text-muted">
              — checked live while this page is open
            </span>
          </h2>
          <AlertsTable alerts={alerts ?? []} />
        </div>
      </main>
    </div>
  );
}
