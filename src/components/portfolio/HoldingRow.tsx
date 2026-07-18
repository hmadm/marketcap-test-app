"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { updateHolding } from "@/app/app/watchlist/actions";
import { RemoveButton } from "@/components/portfolio/RemoveButton";
import { formatMoney } from "@/lib/portfolio";

export type HoldingRowData = {
  symbol: string;
  shares: number | null;
  cost_basis: number | null;
  price: number | null;
  change: number | null;
  changePct: number | null;
};

export function HoldingRow({ row }: { row: HoldingRowData }) {
  const [shares, setShares] = useState(row.shares?.toString() ?? "");
  const [costBasis, setCostBasis] = useState(row.cost_basis?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dirty =
    shares !== (row.shares?.toString() ?? "") || costBasis !== (row.cost_basis?.toString() ?? "");

  const sharesNum = Number(shares);
  const hasShares = shares !== "" && Number.isFinite(sharesNum);
  const value = hasShares && row.price != null ? sharesNum * row.price : null;
  const costNum = Number(costBasis);
  const hasCost = costBasis !== "" && Number.isFinite(costNum);
  const pl = hasShares && hasCost && row.price != null ? sharesNum * (row.price - costNum) : null;

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set("symbol", row.symbol);
    formData.set("shares", shares);
    formData.set("costBasis", costBasis);
    startTransition(async () => {
      const result = await updateHolding(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const positive = (row.change ?? 0) >= 0;

  return (
    <tr>
      <td className="py-3">
        <Link href={`/app/stock/${row.symbol}`} className="font-medium hover:underline">
          {row.symbol}
        </Link>
      </td>
      <td className="py-3">{row.price != null ? `$${row.price.toFixed(2)}` : "—"}</td>
      <td className={`py-3 font-medium ${positive ? "text-accent-up" : "text-accent-down"}`}>
        {row.change != null
          ? `${positive ? "+" : ""}${row.change.toFixed(2)} (${(row.changePct ?? 0).toFixed(2)}%)`
          : "—"}
      </td>
      <td className="py-3">
        <input
          type="number"
          min="0"
          step="any"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="—"
          className="w-20 rounded-md bg-surface-2 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </td>
      <td className="py-3">
        <input
          type="number"
          min="0"
          step="any"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="—"
          className="w-24 rounded-md bg-surface-2 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </td>
      <td className="py-3">{value != null ? formatMoney(value) : "—"}</td>
      <td className={`py-3 ${pl != null ? (pl >= 0 ? "text-accent-up" : "text-accent-down") : ""}`}>
        {pl != null ? formatMoney(pl, true) : "—"}
      </td>
      <td className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          )}
          {saved && <Check className="h-4 w-4 text-accent-up" />}
          <RemoveButton symbol={row.symbol} />
        </div>
        {error && <p className="mt-1 text-xs text-accent-down">{error}</p>}
      </td>
    </tr>
  );
}
