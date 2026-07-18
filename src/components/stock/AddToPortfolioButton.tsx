"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { addToWatchlist } from "@/app/app/watchlist/actions";

export function AddToPortfolioButton({
  symbol,
  initialSaved = false,
}: {
  symbol: string;
  initialSaved?: boolean;
}) {
  const [added, setAdded] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await addToWatchlist(symbol);
      if (result.ok) {
        setAdded(true);
        return;
      }
      if (result.reason === "unauthenticated") {
        router.push("/app/login");
        return;
      }
      if (result.reason === "not_paid") {
        router.push("/app/pricing");
        return;
      }
      setError(result.message ?? "Something went wrong. Try again.");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending || added}
        className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {added ? "Added to Portfolio" : isPending ? "Adding..." : "Add to Portfolio"}
      </button>
      {error && <span className="text-xs text-accent-down">{error}</span>}
    </div>
  );
}
