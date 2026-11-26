import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, Flame, Gem, Lock, Share2, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { getGamification, claimElite } from "@/lib/xp.functions";
import { formatXp } from "@/lib/xp";
import { myFavoritesQuery, myPantryQuery, myPlannerQuery } from "@/lib/queries";
import { myWeeklyGoalQuery } from "@/lib/psychology-storage";
import {
  computeEndowedProgress,
  getCurrentWeekKey,
  STATUS_ACHIEVEMENT_DEFS,
} from "@/lib/psychology";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareCardModal } from "@/components/share-card-modal";
import { useSession } from "@/hooks/use-session";
import { usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";

/**
 * Full gamification panel for the profile screen: identity habit, endowed progress,
 * level progress, streaks, challenges, status achievements, and shareable progress card.
 */
export function GamificationCard() {
  const { user } = useSession();
  const { preferences } = usePreferences();
  const queryClient = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);

  const weekKey = getCurrentWeekKey();
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekAgoIso = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["gamification"],
    queryFn: () => getGamification(),
    enabled: !!user,
    staleTime: 60_000,
  });
  const { data: favorites = [] } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const { data: pantryItems = [] } = useQuery({ ...myPantryQuery(), enabled: !!user });
  const { data: recentPlans = [] } = useQuery({
    ...myPlannerQuery(weekAgoIso, todayIso),
    enabled: !!user,
  });
  const { data: weeklyGoal } = useQuery({ ...myWeeklyGoalQuery(weekKey), enabled: !!user });

  const claim = useMutation({
    mutationFn: () => claimElite(),
    onSuccess: (res) => {
      toast.success("Elite reward claimed!", {
        description: `Premium active until ${new Date(res.premiumUntil).toLocaleDateString()}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["entitlement"] });
    },
    onError: (err) =>
      toast.error("Couldn't claim the reward", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      }),
  });

  if (!user) return null;

  if (isLoading || !data) {
    return (
      <div className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="skeleton-shimmer h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="skeleton-shimmer h-4 w-32" />
            <Skeleton className="skeleton-shimmer h-2 w-full rounded-full" />
          </div>
        </div>
        <Skeleton className="skeleton-shimmer h-20 w-full rounded-2xl" />
      </div>
    );
  }

  const { level } = data;
  const completedMeals = Math.max(
    weeklyGoal?.completed_meals ?? 0,
    recentPlans.filter((m) => m.completed === true).length,
  );
  const endowed = computeEndowedProgress({
    onboardingCompleted: Boolean(preferences?.onboarding_completed),
    savedRecipesCount: favorites.length,
    plannedMealsCount: recentPlans.length,
    completedMealsCount: completedMeals,
    pantryItemsCount: pantryItems.length,
  });

  const unlockedTitles = data.achievements
    .filter((a: { unlockedAt?: string | null }) => Boolean(a.unlockedAt))
    .map((a: { title: string }) => a.title);

  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-5 text-foreground shadow-sm">
      {/* Level header + Share Progress */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="truncate font-display text-2xl leading-tight">{level.name}</h2>
              <span className="tabular-nums shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {formatXp(data.totalXp)} XP
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.round(level.progress * 100)}%` }}
              />
            </div>
            <p className="tabular-nums mt-1.5 text-xs text-muted-foreground">
              {level.nextMin
                ? `${formatXp(level.xpToNext)} XP to ${level.nextName}`
                : "Top level reached"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Share cooking progress card"
          onClick={() => setShareOpen(true)}
          className="h-11 w-11 shrink-0 rounded-xl"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Identity Habit Banner */}
      {preferences?.identity_habit && (
        <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Your kitchen habit
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            &ldquo;{preferences.identity_habit}&rdquo;
          </p>
        </div>
      )}

      {/* Streak + totals */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Flame, label: "Day streak", value: String(data.currentStreak) },
          { icon: Trophy, label: "Best streak", value: String(data.longestStreak) },
          { icon: Gem, label: "Total XP", value: formatXp(data.totalXp) },
        ].map((s) => (
          <div
            key={s.label}
            className="recipe-card-lift flex flex-col items-center gap-1 rounded-2xl border border-transparent bg-muted/50 px-2 py-3 text-center hover:border-primary/20 hover:bg-muted/80"
          >
            <s.icon className="h-4 w-4 text-primary" />
            <span className="motion-number tabular-nums font-display text-xl leading-none">
              {s.value}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Endowed Progress Journey */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Kitchen progress ({endowed.completed}/{endowed.total})
          </h3>
          <span className="text-xs font-semibold text-primary tabular-nums">
            {endowed.percentage}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${endowed.percentage}%` }}
          />
        </div>
        <ul className="mt-3 space-y-1.5">
          {endowed.steps.map((step) => (
            <li key={step.id}>
              <Link
                to={step.actionTo}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 text-xs transition-colors hover:bg-secondary/70"
              >
                <span className="inline-flex items-center gap-2 text-foreground">
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      step.completed ? "text-primary" : "text-muted-foreground/40",
                    )}
                    aria-hidden="true"
                  />
                  <span className={step.completed ? "line-through opacity-70" : ""}>
                    {step.label}
                  </span>
                </span>
                {!step.completed && <span className="text-primary">Go →</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Elite reward */}
      {data.eliteRewardAvailable && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-ember/15 via-primary/10 to-ember/15 p-4">
          <div>
            <p className="text-sm font-bold">Elite reward unlocked</p>
            <p className="tabular-nums text-xs text-muted-foreground">
              50,000 XP earns you 30 days of Premium, once, ever.
            </p>
          </div>
          <Button
            size="sm"
            className="tap-spring min-h-11 rounded-full px-5"
            disabled={claim.isPending}
            onClick={() => claim.mutate()}
          >
            {claim.isPending ? "Claiming…" : "Claim"}
          </Button>
        </div>
      )}

      {/* Challenges */}
      {data.challenges.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Challenges
          </h3>
          <ul className="mt-2 space-y-2">
            {data.challenges.map(
              (c: {
                code: string;
                completedAt?: string | null;
                progress: number;
                goal: number;
                title: string;
                description: string;
                xpReward: number;
              }) => {
                const done = !!c.completedAt;
                const pct = Math.min((c.progress / c.goal) * 100, 100);
                return (
                  <li
                    key={c.code}
                    className={cn(
                      "rounded-2xl border border-border p-3",
                      done && "border-primary/30 bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-sm font-semibold">
                          {done ? <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
                          <span className="truncate">{c.title}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <span className="tabular-nums shrink-0 rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-bold text-ember">
                        +{c.xpReward} XP
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            done ? "bg-primary" : "bg-ember",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-[10px] font-semibold text-muted-foreground">
                        {c.progress}/{c.goal}
                      </span>
                    </div>
                  </li>
                );
              },
            )}
          </ul>
        </div>
      )}

      {/* Achievements & Status Milestones */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Status &amp; Achievements
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {data.achievements.map(
            (a: {
              code: string;
              title: string;
              description: string;
              unlockedAt?: string | null;
            }) => {
              const statusMatch = STATUS_ACHIEVEMENT_DEFS.find((def) => def.code === a.code);
              const label = statusMatch?.title ?? a.title;
              return (
                <div
                  key={a.code}
                  title={label + (a.unlockedAt ? " (unlocked)" : ": " + a.description)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 text-center",
                    a.unlockedAt
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border opacity-40 grayscale",
                  )}
                >
                  {a.unlockedAt ? (
                    <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="line-clamp-2 text-[9px] font-semibold leading-tight">
                    {label}
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Recent XP */}
      {data.recentEvents.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Recent XP
          </h3>
          <ul className="mt-2 space-y-1">
            {data.recentEvents
              .slice(0, 5)
              .map((e: { label: string; points: number }, i: number) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className="tabular-nums font-semibold text-primary">+{e.points}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <ShareCardModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={{
          kind: "achievement",
          title: `${user.displayName ?? "Chef"}'s MealMate Progress`,
          levelName: level.name,
          xp: data.totalXp,
          streak: data.currentStreak,
          identityHabit: preferences?.identity_habit ?? null,
          unlockedBadges: unlockedTitles,
        }}
      />
    </section>
  );
}
