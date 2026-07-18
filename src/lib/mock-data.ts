export type PopularStock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  prevClose?: number;
  open?: number;
  logoUrl?: string;
  logoBg: string;
  logoText: string;
};

const LOGO_COLORS = [
  "bg-emerald-500/15 text-emerald-400",
  "bg-blue-500/15 text-blue-400",
  "bg-lime-500/15 text-lime-400",
  "bg-red-500/15 text-red-400",
  "bg-purple-500/15 text-purple-400",
  "bg-amber-500/15 text-amber-400",
  "bg-cyan-500/15 text-cyan-400",
  "bg-pink-500/15 text-pink-400",
];

export function logoColorFor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}
