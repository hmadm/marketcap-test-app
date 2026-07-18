"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Briefcase,
  Bookmark,
  BarChart3,
  Newspaper,
  CreditCard,
  Bell,
  type LucideIcon,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { label: "Overview", href: "/app", icon: LayoutGrid },
  { label: "Portfolio", href: "/app/portfolio", icon: Briefcase },
  { label: "Watchlist", href: "/app/portfolio", icon: Bookmark },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/app/alerts", icon: Bell },
  { label: "News", href: "/app/news", icon: Newspaper },
  { label: "Pricing", href: "/app/pricing", icon: CreditCard },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-accent/15 text-foreground"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <item.icon className={`h-4 w-4 ${active ? "text-accent" : ""}`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
