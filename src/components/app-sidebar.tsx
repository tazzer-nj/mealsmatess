import { Link, useRouterState } from "@tanstack/react-router";
import { Home, UtensilsCrossed, Sparkles, Refrigerator, Settings, Crown, UserRound } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";

const NAV = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/restaurants", icon: UtensilsCrossed, label: "Dining" },
  { to: "/chat", icon: Sparkles, label: "Mia" },
  { to: "/pantry", icon: Refrigerator, label: "Pantry" },
  { to: "/profile", icon: Settings, label: "Settings" },
] as const;

/** Refined desktop sidebar. Hidden below 1024px where BottomNav takes over. */
export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();
  const { isPremium } = usePremium();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const name = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? null;

  return (
    <aside className="mm-sidebar" aria-label="Main navigation">
      <Link to="/" className="mb-6 flex items-center gap-3 px-3" aria-label="MealMate home">
        <MealMateLogo imageClassName="size-9 rounded-xl object-contain" />
        <span className="text-[17px] font-semibold tracking-[-0.02em]">MealMate</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              data-active={active}
              aria-current={active ? "page" : undefined}
              className="mm-sidebar-link"
            >
              <Icon strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        {!isPremium && (
          <Link
            to="/premium"
            className="flex items-center gap-2 rounded-xl border border-[#262626] bg-[#141414] px-3 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#1c1c1c]"
          >
            <Crown size={16} aria-hidden="true" />
            Unlock Premium
          </Link>
        )}
        <Link
          to={user ? "/profile" : "/auth"}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#171717]"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-[#262626] bg-[#171717] text-[#A1A1AA]">
            <UserRound size={17} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-white">
              {name ?? "Guest"}
            </span>
            <span className="block truncate text-[11px] text-[#71717A]">
              {user ? "Signed in" : "Sign in to MealMate"}
            </span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
