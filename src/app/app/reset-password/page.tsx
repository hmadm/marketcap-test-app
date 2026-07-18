import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
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

        <h1 className="text-xl font-semibold">Set a new password</h1>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-accent-down">
            {error}
          </p>
        )}

        <ResetPasswordForm />
      </div>
    </div>
  );
}
