"use client";

import { useEffect, useState } from "react";
import { updatePassword } from "@/app/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        settled = true;
        setStatus("ready");
      }
    });

    async function establishSession() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          settled = true;
          setStatus("ready");
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        settled = true;
        setStatus("ready");
        return;
      }

      // Give the hash-based (#access_token=...) flow a moment to resolve via
      // onAuthStateChange before concluding the link is invalid/expired.
      setTimeout(() => {
        if (!settled) setStatus("invalid");
      }, 1500);
    }

    establishSession();
    return () => listener.subscription.unsubscribe();
  }, []);

  if (status === "checking") {
    return <p className="mt-5 text-sm text-muted">Verifying your reset link…</p>;
  }

  if (status === "invalid") {
    return (
      <p className="mt-5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-accent-down">
        This reset link is invalid or has expired. Request a new one from the login page.
      </p>
    );
  }

  return (
    <form action={updatePassword} className="mt-5 space-y-3">
      <div>
        <label className="mb-1 block text-xs text-muted" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Update password
      </button>
    </form>
  );
}
