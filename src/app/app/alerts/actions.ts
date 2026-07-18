"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateAlertResult = { ok: true } | { ok: false; message: string };

export async function createAlert(formData: FormData): Promise<CreateAlertResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const symbol = (formData.get("symbol") as string)?.toUpperCase().trim();
  const direction = formData.get("direction") as string;
  const targetPriceRaw = formData.get("targetPrice") as string;
  const targetPrice = Number(targetPriceRaw);

  if (!symbol) return { ok: false, message: "Symbol is required" };
  if (direction !== "above" && direction !== "below") {
    return { ok: false, message: "Invalid direction" };
  }
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    return { ok: false, message: "Enter a valid target price" };
  }

  const { error } = await supabase.from("price_alerts").insert({
    user_id: user.id,
    symbol,
    direction,
    target_price: targetPrice,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/app/alerts");
  revalidatePath(`/app/stock/${symbol}`);
  return { ok: true };
}

export async function deleteAlert(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/app/alerts");
}

export async function markAlertTriggered(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("price_alerts")
    .update({ triggered: true, triggered_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
}
