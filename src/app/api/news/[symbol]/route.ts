import { NextRequest, NextResponse } from "next/server";
import { getCompanyNews } from "@/lib/finnhub";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 14);

  try {
    const news = await getCompanyNews(symbol.toUpperCase(), isoDate(from), isoDate(to));
    return NextResponse.json(news);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch company news" },
      { status: 502 },
    );
  }
}
