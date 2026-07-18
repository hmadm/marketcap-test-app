import Link from "next/link";
import { signUp } from "@/app/app/auth/actions";
import { Logo } from "@/components/Logo";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">MarketCap</span>
        </div>

        <h1 className="text-xl font-semibold">Create an account</h1>
        <p className="mt-1 text-sm text-muted">Track live prices and save your watchlist.</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-accent-down">
            {error}
          </p>
        )}

        <form action={signUp} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted" htmlFor="password">
              Password
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
            Sign up
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/app/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
