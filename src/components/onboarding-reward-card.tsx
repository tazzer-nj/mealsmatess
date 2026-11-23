import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Gift, Sparkles, TrendingUp, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { readLocalPreferences } from "@/lib/preferences";
import { getMyPreferences } from "@/lib/preferences.functions";
import { computeOnboardingBadges } from "@/lib/onboarding-reward";
import { useSession } from "@/hooks/use-session";

export function OnboardingRewardCard({ className = "" }: { className?: string }) {
  const { user } = useSession();
  const [claimed, setClaimed] = useState(false);

  const { data: remotePrefs } = useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: () => getMyPreferences(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const prefs = remotePrefs ?? readLocalPreferences();
  const badges = computeOnboardingBadges(prefs);
  const preferredName = prefs?.preferred_name || user?.displayName || "Chef";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mealmate.reward-bounty-claimed");
      if (stored === "true") setClaimed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function handleClaim() {
    setClaimed(true);
    try {
      localStorage.setItem("mealmate.reward-bounty-claimed", "true");
    } catch {
      /* ignore */
    }
    toast.success("Welcome Bounty Claimed!", {
      description: "+250 XP has been credited to your MealMate chef profile.",
    });
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 sm:p-5 text-foreground shadow-sm ${className}`}
      data-testid="onboarding-reward-card"
    >
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Gift size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Onboarding Reward Card
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} />
                Profile 100% Completed
              </span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Congratulations, {preferredName}!
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={claimed}
          className={`tap-spring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            claimed
              ? "bg-secondary text-muted-foreground border border-border cursor-default"
              : "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          }`}
        >
          <Sparkles size={14} />
          <span>{claimed ? "Bounty Claimed (+250 XP)" : "Claim +250 XP Reward"}</span>
        </button>
      </div>

      {/* Earned Badges Grid */}
      <div className="pt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Badges Earned From Setup
          </h3>
          <span className="tabular-nums text-xs text-muted-foreground font-medium">
            {badges.length} of 4 unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3 transition-colors hover:bg-secondary/70"
              >
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-2xs">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {badge.name}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Unlocked
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{badge.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Value & Benefits Forecast Strip */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-secondary/30 p-3">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
            <DollarSign size={14} />
          </div>
          <span className="tabular-nums font-semibold text-xs text-foreground sm:text-sm">
            ~R1,850/mo
          </span>
          <span className="text-[10px] text-muted-foreground">Projected Savings</span>
        </div>

        <div className="flex flex-col items-center text-center border-x border-border">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1">
            <Clock size={14} />
          </div>
          <span className="tabular-nums font-semibold text-xs text-foreground sm:text-sm">
            5.2 hrs/wk
          </span>
          <span className="text-[10px] text-muted-foreground">Prep Time Saved</span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1">
            <TrendingUp size={14} />
          </div>
          <span className="tabular-nums font-semibold text-xs text-foreground sm:text-sm">
            48,200+
          </span>
          <span className="text-[10px] text-muted-foreground">Active Cooks</span>
        </div>
      </div>
    </div>
  );
}
