import { Link } from "@tanstack/react-router";
import { Crown, Check, Zap } from "lucide-react";
import { usePremium } from "@/hooks/use-premium";
import { useSession } from "@/hooks/use-session";

const PREMIUM_PERKS = [
  "Up to 100 Mia conversations & recipes a day (fair use)",
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
        className="tap-spring flex min-h-11 items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Not signed in
          </p>
          <p className="mt-0.5 font-display text-lg">Sign in to track your usage</p>
        </div>
        <span className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          Sign in
        </span>
      </Link>
    );
  }

  if (isPremium) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-[var(--periwinkle)]/25 bg-ink p-5 text-cream shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--periwinkle)] backdrop-blur">
              <Crown className="h-3 w-3" /> Premium {tier} {trialActive ? "· trial" : ""}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white">
              Unlimited everything
            </h3>
            <p className="mt-1 text-xs text-white/80">
              {entitlement?.periodEnd
                ? `Renews ${new Date(entitlement.periodEnd).toLocaleDateString()}`
                : "Active access"}
            </p>
          </div>
          <Zap className="h-6 w-6 shrink-0 text-[var(--periwinkle)]" />
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {PREMIUM_PERKS.slice(0, 6).map((p) => (
            <li key={p} className="flex items-center gap-1.5 text-xs text-white/90">
              <Check className="h-3 w-3 shrink-0 text-emerald-400" /> {p}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Link
      to="/premium"
      className="tap-spring flex min-h-11 items-center justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Subscription needed
        </p>
        <p className="mt-0.5 font-display text-xl leading-tight text-foreground">
          Unlock MealMate Premium
        </p>
      </div>
      <span className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
        View plans
      </span>
    </Link>
  );
}
