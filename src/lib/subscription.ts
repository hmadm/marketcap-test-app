import { createClient } from "@/lib/supabase/server";

export type PlanStatus = "free" | "active" | "past_due" | "canceled";

export async function getSubscriptionStatus(userId: string): Promise<PlanStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  return (data?.status as PlanStatus) ?? "free";
}

export function isPaidStatus(status: PlanStatus): boolean {
  return status === "active" || status === "past_due";
}
