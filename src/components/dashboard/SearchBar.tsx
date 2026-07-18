"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchResult = { symbol: string; description: string; displaySymbol: string; type: string };

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults((data.result ?? []).slice(0, 8));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goToSymbol(symbol: string) {
    setOpen(false);
    setQuery("");
    router.push(`/app/stock/${symbol}`);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted focus-within:border-accent/50">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) goToSymbol(results[0].symbol);
          }}
          placeholder="Search stocks..."
          className="w-40 bg-transparent outline-none placeholder:text-muted sm:w-56"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                onClick={() => goToSymbol(r.symbol)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{r.displaySymbol}</span>{" "}
                  <span className="text-muted">{r.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
