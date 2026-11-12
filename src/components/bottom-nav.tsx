import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Refrigerator, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Five primary MealMate destinations: Home, Dining, Mia, Pantry, Settings.
 * Mia keeps a gentle visual emphasis in the centre without being oversized.
 */
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

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      id="app-nav"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-[640px] grid-cols-5 items-center px-3">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.to);
          if (tab.to === "/chat") {
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-label="Mia, your food companion"
                aria-current={active ? "page" : undefined}
                data-tour="chef"
                data-active={active}
                className="mm-nav-item mm-nav-mia"
              >
                <span className="mm-nav-mia-icon">
                  <tab.icon aria-hidden="true" />
                </span>
                {tab.label}
              </Link>
            );
          }
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              data-tour={tab.label.toLowerCase()}
              data-active={active}
              className={cn("mm-nav-item", active && "text-foreground")}
            >
              <tab.icon aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
