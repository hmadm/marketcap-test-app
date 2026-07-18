"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/app/auth/actions";
import { ProBadge } from "@/components/ProBadge";

export function SidebarUser({
  email,
  isPro = false,
}: {
  email: string | null;
  isPro?: boolean;
}) {
  if (!email) {
    return (
      <div className="rounded-xl bg-surface px-3 py-2.5">
        <p className="text-sm text-muted">Not signed in</p>
        <div className="mt-2 flex gap-2">
          <Link
            href="/app/login"
            className="flex-1 rounded-lg bg-accent py-1.5 text-center text-xs font-medium text-accent-foreground hover:opacity-90"
          >
            Log in
          </Link>
          <Link
            href="/app/signup"
            className="flex-1 rounded-lg bg-surface-2 py-1.5 text-center text-xs font-medium hover:bg-border"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-cyan-400" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{email}</span>
          {isPro && <ProBadge className="shrink-0" />}
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          title="Log out"
          className="text-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
