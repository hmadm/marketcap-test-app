import { Bell } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function TopBar({ title = "Dashboard" }: { title?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <SearchBar />
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
