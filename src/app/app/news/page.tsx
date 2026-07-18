import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { NewsList } from "@/components/stock/NewsList";
import { getMarketNews } from "@/lib/finnhub";

export const revalidate = 60;

const categories = [
  { label: "General", value: "general" },
  { label: "Forex", value: "forex" },
  { label: "Crypto", value: "crypto" },
  { label: "Mergers", value: "merger" },
] as const;

type CategoryValue = (typeof categories)[number]["value"];

function isValidCategory(value: string): value is CategoryValue {
  return categories.some((c) => c.value === value);
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category: CategoryValue =
    rawCategory && isValidCategory(rawCategory) ? rawCategory : "general";

  const news = await getMarketNews(category).catch(() => []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <main className="flex-1 space-y-6 px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pt-6">
        <TopBar title="News" />

        <div className="flex gap-1 rounded-lg bg-surface-2 p-1 w-fit">
          {categories.map((c) => (
            <Link
              key={c.value}
              href={`/news?category=${c.value}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-surface p-4">
          <NewsList items={news} limit={30} />
        </div>
      </main>
    </div>
  );
}
