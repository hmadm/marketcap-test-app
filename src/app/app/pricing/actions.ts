"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function createCheckoutSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/app/login");

  const priceId = process.env.STRIPE_PAID_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PAID_PRICE_ID is not set in .env.local");

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const stripe = getStripe();

  // Reuse an existing Stripe customer for this user if we have one on file.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: sub?.stripe_customer_id ?? undefined,
    customer_email: sub?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    success_url: `${origin}/app/pricing?checkout=success`,
    cancel_url: `${origin}/app/pricing?checkout=cancelled`,
    metadata: { supabase_user_id: user.id },
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}
