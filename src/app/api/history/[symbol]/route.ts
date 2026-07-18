import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices, type HistoryRange } from "@/lib/yahoo";

const VALID_RANGES: HistoryRange[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const rangeParam = req.nextUrl.searchParams.get("range") ?? "1M";

  if (!VALID_RANGES.includes(rangeParam as HistoryRange)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  try {
    const points = await getHistoricalPrices(symbol.toUpperCase(), rangeParam as HistoryRange);
    return NextResponse.json(points);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch history" },
      { status: 502 },
    );
  }
}
