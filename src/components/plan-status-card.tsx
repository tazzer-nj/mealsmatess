import { Link } from "@tanstack/react-router";
import { Crown, Check, Zap } from "lucide-react";
import { usePremium } from "@/hooks/use-premium";
import { useSession } from "@/hooks/use-session";

const PREMIUM_PERKS = [
  "Up to 100 Mia AI requests a day (fair use)",
  "Unlimited saved favourites",
  "Unlimited weekly meal plans",
  "Advanced personalised meal suggestions",
  "Auto grocery lists from your plan",
  "Ingredient substitutions & cooking mode",
  "Advanced nutrition tracking",
  "Premium themes · No ads",
];

export function PlanStatusCard() {
  const { user } = useSession();
  const { isPremium, tier, trialActive, entitlement } = usePremium();

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--periwinkle)]"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Not signed in
          </p>
          <p className="mt-1 text-base font-medium text-foreground">Sign in to track your usage</p>
        </div>
        <span className="rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background">
          Sign in
        </span>
      </Link>
    );
  }

  if (isPremium) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-foreground">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-foreground">
              <Crown className="h-3 w-3 text-[var(--periwinkle)]" /> Premium {tier}{" "}
              {trialActive ? "· trial" : ""}
            </span>
            <h3 className="mt-3 text-xl font-medium tracking-tight text-foreground">
              Unlimited everything
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {entitlement?.periodEnd
                ? `Renews ${new Date(entitlement.periodEnd).toLocaleDateString()}`
                : "Active access"}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-[var(--periwinkle)]">
            <Zap className="h-4 w-4" />
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PREMIUM_PERKS.slice(0, 6).map((p) => (
            <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--periwinkle)]" /> {p}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Link
      to="/premium"
      className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--periwinkle)]"
    >
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Subscription needed
        </p>
        <p className="mt-1 text-base font-medium text-foreground">Unlock MealMate Premium</p>
      </div>
      <span className="rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background">
        View plans
      </span>
    </Link>
  );
}
