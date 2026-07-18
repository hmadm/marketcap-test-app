import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/finnhub";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  try {
    const quote = await getQuote(symbol.toUpperCase());
    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch quote" },
      { status: 502 },
    );
  }
}
