import Link from "next/link";
import { signIn } from "@/app/app/auth/actions";
import { Logo } from "@/components/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">MarketCap</span>
        </div>

        <h1 className="text-xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back.</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-accent-down">
            {error}
          </p>
        )}
        {reset && (
          <p className="mt-4 rounded-lg bg-accent-up/10 px-3 py-2 text-sm text-accent-up">
            Password updated. Log in with your new password.
          </p>
        )}

        <form action={signIn} className="mt-5 space-y-3">
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
            Log in
          </button>
        </form>

        <p className="mt-3 text-center text-sm">
          <Link href="/app/forgot-password" className="text-muted hover:text-foreground">
            Forgot password?
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/app/signup" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
