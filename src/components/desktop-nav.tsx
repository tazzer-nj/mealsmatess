import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Refrigerator, Settings2, Sparkles } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/restaurants", icon: UtensilsCrossed, label: "Dining" },
  { to: "/chat", icon: Sparkles, label: "Mia" },
  { to: "/pantry", icon: Refrigerator, label: "Pantry" },
  { to: "/profile", icon: Settings2, label: "Settings" },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

/** Desktop navigation rail — the mobile layout is never simply stretched. */
export function DesktopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const initial = (user?.displayName ?? user?.email ?? "M").slice(0, 1).toUpperCase();

  return (
    <aside className="mm-desktop-nav" aria-label="Primary">
      <Link to="/" className="mb-7 flex items-center gap-2.5 px-2" aria-label="MealMate home">
        <MealMateLogo imageClassName="size-8 rounded-lg object-contain" />
        <span className="text-[15px] font-semibold tracking-[-0.02em]">MealMate</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[#171717] text-foreground"
                  : "text-muted-foreground hover:bg-[#111111] hover:text-foreground",
              )}
            >
              <tab.icon aria-hidden="true" className="size-[19px]" strokeWidth={1.6} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl border border-[#1e1e1e] bg-[#111111] p-3">
        <span className="mm-avatar size-9 text-[13px]">{initial}</span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium">
            {user?.displayName ?? "Your account"}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {user?.email ?? "Not signed in"}
          </span>
        </span>
      </div>
    </aside>
  );
}
