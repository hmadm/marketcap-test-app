"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { removeFromWatchlist } from "@/app/app/watchlist/actions";

export function RemoveButton({ symbol }: { symbol: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => removeFromWatchlist(symbol))}
      disabled={isPending}
      title="Remove from watchlist"
      className="text-muted hover:text-accent-down disabled:opacity-50"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
