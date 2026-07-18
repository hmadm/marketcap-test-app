"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus, isPaidStatus } from "@/lib/subscription";

export type AddResult = { ok: true } | { ok: false; reason: "unauthenticated" | "not_paid" | "error"; message?: string };

export async function addToWatchlist(symbol: string): Promise<AddResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const status = await getSubscriptionStatus(user.id);
  if (!isPaidStatus(status)) {
    return { ok: false, reason: "not_paid" };
  }

  const { error } = await supabase
    .from("watchlist_items")
    .insert({ user_id: user.id, symbol: symbol.toUpperCase() });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already saved) — treat as success/no-op
    return { ok: false, reason: "error", message: error.message };
  }

  revalidatePath("/app/portfolio");
  return { ok: true };
}

export async function removeFromWatchlist(symbol: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("symbol", symbol.toUpperCase());

  revalidatePath("/app/portfolio");
  revalidatePath("/app");
}

export type UpdateHoldingResult = { ok: true } | { ok: false; message: string };

export async function updateHolding(formData: FormData): Promise<UpdateHoldingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const symbol = (formData.get("symbol") as string)?.toUpperCase();
  const sharesRaw = (formData.get("shares") as string)?.trim();
  const costBasisRaw = (formData.get("costBasis") as string)?.trim();

  const shares = sharesRaw ? Number(sharesRaw) : null;
  const costBasis = costBasisRaw ? Number(costBasisRaw) : null;

  if (sharesRaw && (!Number.isFinite(shares) || (shares as number) < 0)) {
    return { ok: false, message: "Enter a valid number of shares" };
  }
  if (costBasisRaw && (!Number.isFinite(costBasis) || (costBasis as number) < 0)) {
    return { ok: false, message: "Enter a valid cost per share" };
  }

  const { error } = await supabase
    .from("watchlist_items")
    .update({ shares, cost_basis: costBasis })
    .eq("user_id", user.id)
    .eq("symbol", symbol);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/app/portfolio");
  revalidatePath("/app");
  return { ok: true };
}
