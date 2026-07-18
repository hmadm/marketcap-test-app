import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function mapStripeStatus(status: Stripe.Subscription.Status): "active" | "past_due" | "canceled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "canceled";
}

async function upsertSubscriptionFromStripeSub(
  sub: Stripe.Subscription,
  userId: string | null,
) {
  const admin = createAdminClient();

  const resolvedUserId = userId ?? sub.metadata?.supabase_user_id ?? null;
  if (!resolvedUserId) return;

  const price = sub.items.data[0]?.price;
  const periodEndUnix = sub.items.data[0]?.current_period_end;

  await admin.from("subscriptions").upsert(
    {
      user_id: resolvedUserId,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      status: mapStripeStatus(sub.status),
      price_id: price?.id ?? null,
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : err}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripeSub(sub, session.client_reference_id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripeSub(sub, null);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
