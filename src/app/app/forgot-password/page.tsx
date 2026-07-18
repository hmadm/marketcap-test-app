import Link from "next/link";
import { requestPasswordReset } from "@/app/app/auth/actions";
import { Logo } from "@/components/Logo";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">MarketCap</span>
        </div>

        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-accent-down">
            {error}
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-lg bg-accent-up/10 px-3 py-2 text-sm text-accent-up">
            If an account exists for that email, a reset link is on its way.
          </p>
        )}

        <form action={requestPasswordReset} className="mt-5 space-y-3">
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
          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/app/login" className="text-foreground hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
