import { FlaskConical } from "lucide-react";

export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      title="MarketCap is a demo/portfolio project — not a real brokerage or financial service"
      className={`inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 ${className}`}
    >
      <FlaskConical className="h-2.5 w-2.5" />
      Demo
    </span>
  );
}
