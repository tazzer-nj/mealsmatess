import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Trophy, Check, Lock, Gem } from "lucide-react";
import { toast } from "sonner";
import { getGamification, claimElite } from "@/lib/xp.functions";
import { formatXp } from "@/lib/xp";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

/**
 * Full gamification panel for the profile screen: level progress, streaks,
 * active challenges, achievements and the once-ever Elite reward claim.
 */
export function GamificationCard() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["gamification"],
    queryFn: () => getGamification(),
    enabled: !!user,
    staleTime: 60_000,
  });

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
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-xl bg-secondary" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-secondary" />
            <Skeleton className="h-2 w-full rounded-full bg-secondary" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl bg-secondary" />
      </div>
    );
  }

  const { level } = data;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 text-foreground">
      {/* Level header */}
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
          <Trophy className="h-7 w-7 text-[var(--periwinkle)]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="truncate text-lg font-medium tracking-tight text-foreground">
              {level.name}
            </h2>
            <span className="shrink-0 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
              {formatXp(data.totalXp)} XP
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[var(--periwinkle)] transition-all duration-700"
              style={{ width: `${Math.round(level.progress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {level.nextMin
              ? `${formatXp(level.xpToNext)} XP to ${level.nextName}`
              : "Top level reached"}
          </p>
        </div>
      </div>

      {/* Streak + totals */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Flame, label: "Day streak", value: String(data.currentStreak) },
          { icon: Trophy, label: "Best streak", value: String(data.longestStreak) },
          { icon: Gem, label: "Total XP", value: formatXp(data.totalXp) },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary px-2 py-3 text-center"
          >
            <s.icon className="h-4 w-4 text-[var(--periwinkle)]" />
            <span className="text-lg font-semibold leading-none text-foreground">{s.value}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Elite reward */}
      {data.eliteRewardAvailable && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Elite reward unlocked</p>
            <p className="text-xs text-muted-foreground">
              50,000 XP earns you 30 days of Premium — once, ever.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl bg-foreground text-background hover:opacity-90"
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
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
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
                      "rounded-xl border border-border bg-secondary p-3",
                      done && "border-[var(--periwinkle)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          {done ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          ) : null}
                          <span className="truncate">{c.title}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                      </div>
                      <span className="shrink-0 rounded-lg border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-foreground">
                        +{c.xpReward} XP
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-[var(--periwinkle)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
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

      {/* Achievements */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Achievements
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {data.achievements.map((a) => (
            <div
              key={a.code}
              title={a.title + (a.unlockedAt ? " — unlocked" : " — " + a.description)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border p-2 text-center",
                a.unlockedAt
                  ? "border-[var(--periwinkle)] bg-secondary text-foreground"
                  : "border-border bg-card opacity-50 grayscale",
              )}
            >
              {a.unlockedAt ? (
                <Trophy className="h-4 w-4 text-[var(--periwinkle)]" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="line-clamp-2 text-[9px] font-medium leading-tight">{a.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent XP */}
      {data.recentEvents.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Recent XP
          </h3>
          <ul className="mt-2 space-y-1">
            {data.recentEvents
              .slice(0, 5)
              .map((e: { label: string; points: number }, i: number) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{e.label}</span>
                  <span className="font-medium text-foreground">+{e.points}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
