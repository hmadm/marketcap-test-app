import { NextRequest, NextResponse } from "next/server";
import { getCompanyProfile } from "@/lib/finnhub";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  try {
    const profile = await getCompanyProfile(symbol.toUpperCase());
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch profile" },
      { status: 502 },
    );
  }
}
