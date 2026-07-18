import { Zap } from "lucide-react";

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent ${className}`}
    >
      <Zap className="h-2.5 w-2.5 fill-accent" />
      Pro
    </span>
  );
}
