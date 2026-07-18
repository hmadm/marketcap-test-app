import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPortfolioValueHistory, type Holding } from "@/lib/portfolio";
import type { HistoryRange } from "@/lib/yahoo";

const VALID_RANGES: HistoryRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const rangeParam = req.nextUrl.searchParams.get("range") ?? "1M";
  if (!VALID_RANGES.includes(rangeParam as HistoryRange)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const { data: items } = await supabase
    .from("watchlist_items")
    .select("symbol, shares, cost_basis")
    .eq("user_id", user.id);

  const holdings: Holding[] = items ?? [];

  try {
    const points = await getPortfolioValueHistory(holdings, rangeParam as HistoryRange);
    return NextResponse.json(points);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to compute history" },
      { status: 502 },
    );
  }
}
