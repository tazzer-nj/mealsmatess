import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, CalendarDays, User } from "lucide-react";
import { ChefMascot } from "@/components/chef-mascot";
import { cn } from "@/lib/utils";

/**
 * Five primary MealMate tabs with the AI chef raised in the centre.
 */
const LEFT_TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/restaurants", icon: UtensilsCrossed, label: "Dining" },
] as const;

const RIGHT_TABS = [
  { to: "/planner", icon: CalendarDays, label: "Planner" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

function Tab({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      data-tour={label.toLowerCase()}
      className={cn(
        "group relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[11px] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-active:scale-90" />
      {active && (
        <span
          className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[var(--periwinkle)]"
          aria-hidden="true"
        />
      )}
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav
      id="app-nav"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--nav-background)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-[1fr_1fr_64px_1fr_1fr] items-end px-1.5 sm:px-2">
        {LEFT_TABS.map((t) => (
          <Tab key={t.to} {...t} active={isActive(t.to)} />
        ))}
        <Link
          to="/chat"
          aria-label="Ask the AI chef"
          data-tour="chef"
          className={cn(
            "group relative mx-auto -mt-5 flex min-h-20 w-[60px] flex-col items-center justify-end gap-1 pb-2 text-[11px] font-medium transition-colors",
            isActive("/chat") ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border bg-card ring-4 ring-background transition-all group-hover:border-[var(--periwinkle)] group-active:scale-95 sm:h-13 sm:w-13",
              isActive("/chat") ? "border-[var(--periwinkle)]" : "border-border",
            )}
          >
            <ChefMascot className="h-9 w-9 sm:h-10 sm:w-10" />
          </span>
          <span className="truncate">AI Chef</span>
        </Link>
        {RIGHT_TABS.map((t) => (
          <Tab key={t.to} {...t} active={isActive(t.to)} />
        ))}
      </div>
    </nav>
  );
}
