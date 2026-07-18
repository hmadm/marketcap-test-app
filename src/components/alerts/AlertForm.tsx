"use client";

import { useRef, useState, useTransition } from "react";
import { createAlert } from "@/app/app/alerts/actions";

export function AlertForm({ symbol }: { symbol?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAlert(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-2">
      {!symbol && (
        <div>
          <label className="mb-1 block text-xs text-muted" htmlFor="symbol">
            Symbol
          </label>
          <input
            id="symbol"
            name="symbol"
            required
            placeholder="AAPL"
            className="w-28 rounded-lg bg-surface-2 px-3 py-2 text-sm uppercase outline-none focus:ring-1 focus:ring-foreground/30"
          />
        </div>
      )}
      {symbol && <input type="hidden" name="symbol" value={symbol} />}

      <div>
        <label className="mb-1 block text-xs text-muted" htmlFor="direction">
          Condition
        </label>
        <select
          id="direction"
          name="direction"
          className="rounded-lg bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
        >
          <option value="above">Price goes above</option>
          <option value="below">Price goes below</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted" htmlFor="targetPrice">
          Target price
        </label>
        <input
          id="targetPrice"
          name="targetPrice"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
          className="w-28 rounded-lg bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add Alert"}
      </button>

      {error && <p className="w-full text-xs text-accent-down">{error}</p>}
    </form>
  );
}
