import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Sparkles, Refrigerator, Settings } from "lucide-react";

/**
 * Five primary destinations. Mobile bottom bar only (desktop uses AppSidebar).
 * Mia gets a slightly stronger presence without becoming oversized.
 */
const TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/restaurants", icon: UtensilsCrossed, label: "Dining" },
  { to: "/chat", icon: Sparkles, label: "Mia", mia: true },
  { to: "/pantry", icon: Refrigerator, label: "Pantry" },
  { to: "/profile", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav id="app-nav" aria-label="Primary" className="mm-nav lg:hidden">
      <div className="mm-nav-grid">
        {TABS.map((tab) => {
          const active = isActive(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              data-tour={tab.label.toLowerCase()}
              data-active={active}
              className="mm-nav-item"
            >
              {"mia" in tab && tab.mia ? (
                <span className="mm-nav-mia">
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                </span>
              ) : (
                <Icon size={21} strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
