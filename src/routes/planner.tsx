import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Loader2,
  Plus,
  RotateCcw,
  Share2,
  ShoppingCart,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { myPlannerQuery, myFavoritesQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePreferences } from "@/hooks/use-preferences";
import { useOptionalMia } from "@/hooks/use-mia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareCardModal } from "@/components/share-card-modal";
import {
  generatePersonalizedPlan,
  buildGroceryFromPlan,
  aiPlanAndShop,
} from "@/lib/planner.functions";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { awardXp } from "@/lib/xp.functions";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";
import { getCurrentWeekKey } from "@/lib/psychology";
import {
  clearWeekMealPlans,
  myWeeklyGoalQuery,
  togglePlannedMealCompleted,
  upsertWeeklyGoal,
} from "@/lib/psychology-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Meal planner | MealMate" },
      {
        name: "description",
        content: "Plan a week of meals and turn your plan into a grocery list.",
      },
      { property: "og:title", content: "Meal planner | MealMate" },
      {
        property: "og:description",
        content: "Plan a week of meals and turn your plan into a grocery list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOAL_PRESETS = [2, 3, 4, 5, 7];

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function PlannerPage() {
  const { user, loading } = useSession();
  const { preferences } = usePreferences();
  const mia = useOptionalMia();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const week = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);
  const fromISO = iso(week[0] ?? new Date());
  const toISO = iso(week[6] ?? new Date());
  const weekKey = getCurrentWeekKey();

  const { data: plans } = useQuery({
    ...myPlannerQuery(fromISO, toISO),
    enabled: !!user,
  });
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const { data: weeklyGoal } = useQuery({ ...myWeeklyGoalQuery(weekKey), enabled: !!user });

  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [mealType, setMealType] = useState("Dinner");
  const [recipeId, setRecipeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [autoGroc, setAutoGroc] = useState(false);
  const [planShop, setPlanShop] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const aiPlannerEnabled = useFeatureFlag("personalized_planner", true);

  const plannedList = useMemo(() => plans ?? [], [plans]);
  const completedCount = useMemo(
    () => plannedList.filter((p) => p.completed === true).length,
    [plannedList],
  );
  const goalTarget = weeklyGoal?.target_meals ?? preferences?.weekly_cooking_goal ?? 4;
  const goalPct = Math.min(100, Math.round((completedCount / Math.max(1, goalTarget)) * 100));

  const todayISO = iso(new Date());
  const pastUncheckedCount = useMemo(
    () => plannedList.filter((p) => p.plan_date < todayISO && p.completed !== true).length,
    [plannedList, todayISO],
  );

  async function planAndShop() {
    if (!user) return;
    setPlanShop(true);
    try {
      const res = await aiPlanAndShop({
        data: { days: 7, startDate: fromISO, replaceExisting: false },
      });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
      mia?.reactToAction("meal_plan_created");
      toast.success(`Planned ${res.meals} meals, added ${res.groceries} to your list`, {
        description: res.skipped > 0 ? `Skipped ${res.skipped} you already have.` : undefined,
        action: { label: "View list", onClick: () => navigate({ to: "/list" }) },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't plan & shop");
    } finally {
      setPlanShop(false);
    }
  }

  async function generateAiPlan() {
    if (!user) return;
    setAiLoading(true);
    try {
      const { suggestions } = await generatePersonalizedPlan({
        data: { days: 7, startDate: fromISO },
      });
      toast.success(`Generated ${suggestions.length} meal ideas`, {
        description: suggestions
          .slice(0, 3)
          .map((s) => `${s.meal_type}: ${s.name}`)
          .join(" · "),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate plan");
    } finally {
      setAiLoading(false);
    }
  }

  async function autoGrocery() {
    setAutoGroc(true);
    try {
      const { inserted } = await buildGroceryFromPlan({ data: { from: fromISO, to: toISO } });
      toast.success(`Added ${inserted} items to your grocery list`, {
        action: { label: "View", onClick: () => navigate({ to: "/list" }) },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't build grocery list");
    } finally {
      setAutoGroc(false);
    }
  }

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["planner"] }),
      queryClient.invalidateQueries({ queryKey: ["weekly-goal", weekKey] }),
    ]);
  }

  async function addMeal(day: string) {
    if (!user || !recipeId) return;
    const fav = favorites?.find((f) => f.recipe_id === recipeId);
    setSaving(true);
    try {
      const { error } = await firebaseData.from("meal_plans").insert({
        user_id: user.id,
        plan_date: day,
        meal_type: mealType,
        recipe_id: recipeId,
        ...(fav?.recipes?.name ? { custom_name: fav.recipes.name } : {}),
      });
      if (error) throw error;
      setAddingDay(null);
      setRecipeId("");
      await refresh();
      mia?.reactToAction("meal_plan_created");
    } catch {
      toast.error("Couldn't add meal");
    } finally {
      setSaving(false);
    }
  }

  async function removeMeal(id: string) {
    const { error } = await firebaseData.from("meal_plans").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't remove meal");
      return;
    }
    await refresh();
  }

  async function handleToggleMealDone(meal: {
    id: string;
    completed?: boolean;
    custom_name?: string | null;
    recipes?: { name?: string } | null;
  }) {
    if (!user || togglingId === meal.id) return;
    const nextDone = meal.completed !== true;
    setTogglingId(meal.id);
    try {
      await togglePlannedMealCompleted(meal.id, nextDone);
      const nextCompletedTotal = Math.max(0, completedCount + (nextDone ? 1 : -1));
      await upsertWeeklyGoal({
        weekKey,
        targetMeals: goalTarget,
        completedMeals: nextCompletedTotal,
        identityHabit: preferences?.identity_habit ?? null,
      });
      await refresh();
      if (nextDone) {
        const mealTitle = meal.recipes?.name ?? meal.custom_name ?? null;
        void awardXp({ data: { action: "planned_meal_completed", entityId: meal.id } }).catch(
          () => undefined,
        );
        void dispatchAnalyticsEvent({
          userId: user.id,
          eventName: "meal_completed",
          entityId: meal.id,
          metadata: { source: "planner", goalTarget, completed: nextCompletedTotal },
        });
        if (nextCompletedTotal >= goalTarget && completedCount < goalTarget) {
          void dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "weekly_goal_completed",
            entityId: weekKey,
            metadata: { goalTarget, completed: nextCompletedTotal },
          });
          mia?.reactToAction("weekly_goal_completed", {
            completedCount: nextCompletedTotal,
            goalTarget,
          });
        } else {
          mia?.reactToAction("meal_completed", { recipeName: mealTitle });
        }
      }
    } catch {
      toast.error("Couldn't update meal status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleGoalChange(nextTarget: number) {
    if (!user) return;
    try {
      await upsertWeeklyGoal({
        weekKey,
        targetMeals: nextTarget,
        completedMeals: completedCount,
        identityHabit: preferences?.identity_habit ?? null,
      });
      await queryClient.invalidateQueries({ queryKey: ["weekly-goal", weekKey] });
      mia?.reactToAction("goal_updated", { goalTarget: nextTarget });
    } catch {
      toast.error("Couldn't update weekly goal");
    }
  }

  async function handleFreshStartReset() {
    if (!user || resetting) return;
    setResetting(true);
    try {
      await clearWeekMealPlans(plannedList.map((p) => p.id));
      await upsertWeeklyGoal({
        weekKey,
        targetMeals: goalTarget,
        completedMeals: 0,
        identityHabit: preferences?.identity_habit ?? null,
      });
      await refresh();
      setResetOpen(false);
      toast.success("Fresh week cleared! Your XP and cooking history remain untouched.");
    } catch {
      toast.error("Could not reset this week's slots");
    } finally {
      setResetting(false);
    }
  }

  const weekRangeLabel = `${week[0]?.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${week[6]?.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-foreground">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl sm:text-4xl">Meal planner</h1>
            <p className="text-sm text-muted-foreground">{weekRangeLabel}</p>
          </div>
        </div>
        <div className="col-span-2 flex flex-wrap gap-2 sm:col-auto">
          {aiPlannerEnabled && (
            <Button size="sm" onClick={planAndShop} disabled={planShop}>
              {planShop ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Plan &amp; shop
            </Button>
          )}
          {aiPlannerEnabled && (
            <Button size="sm" variant="outline" onClick={generateAiPlan} disabled={aiLoading}>
              {aiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              AI ideas
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={autoGrocery}
            disabled={autoGroc || plannedList.length === 0}
          >
            {autoGroc ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Auto grocery
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShareOpen(true)}
            disabled={plannedList.length === 0}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share week
          </Button>
          {plannedList.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setResetOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Fresh start
            </Button>
          )}
        </div>
      </div>

      {/* Weekly Cooking Goal & Gentle Continuity */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Weekly cooking goal
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
              {completedCount} of {goalTarget} planned meals cooked ({goalPct}%)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {GOAL_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => void handleGoalChange(n)}
                className={`min-h-9 rounded-xl border px-3 text-xs font-medium transition-colors tabular-nums ${
                  goalTarget === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}/wk
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        {pastUncheckedCount > 0 && (
          <p className="mt-2.5 text-xs text-muted-foreground">
            Missed a planned meal earlier this week? No stress — tick any dish whenever you cook it,
            or move it forward cleanly.
          </p>
        )}
      </section>

      {(planShop || aiLoading) && (
        <div
          role="status"
          aria-live="polite"
          className="motion-reveal mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <span>Mia is building your personalized weekly meal plan…</span>
        </div>
      )}

      {favorites && favorites.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Save some recipes first so your favorites show up here to plan with.{" "}
          <Link to="/recipes" className="font-medium text-foreground hover:underline">
            Browse recipes
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {week.map((d) => {
          const dayISO = iso(d);
          const dayPlans = plannedList.filter((p) => p.plan_date === dayISO);
          const isToday = dayISO === todayISO;
          return (
            <div
              key={dayISO}
              className={`rounded-2xl border bg-card p-4 ${
                isToday ? "border-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">
                  {d.toLocaleDateString(undefined, { weekday: "long" })}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Add meal for ${d.toLocaleDateString(undefined, { weekday: "long" })}`}
                  className="h-11 w-11 rounded-xl"
                  onClick={() => setAddingDay(addingDay === dayISO ? null : dayISO)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {dayPlans.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {dayPlans.map((p) => {
                    const done = p.completed === true;
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-muted/70 px-2.5 py-1.5 text-sm"
                      >
                        <button
                          type="button"
                          disabled={togglingId === p.id}
                          aria-label={done ? "Mark meal not cooked yet" : "Mark meal cooked"}
                          onClick={() => void handleToggleMealDone(p)}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-transparent hover:border-foreground/40"
                          }`}
                        >
                          {togglingId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <span className={`min-w-0 flex-1 ${done ? "line-through opacity-65" : ""}`}>
                          <span className="font-medium">{p.meal_type}:</span>{" "}
                          {p.recipes?.slug ? (
                            <Link
                              to="/recipe/$slug"
                              params={{ slug: p.recipes.slug ?? p.recipe_id ?? "" }}
                              className="hover:underline"
                            >
                              {p.recipes?.name ?? p.custom_name}
                            </Link>
                          ) : (
                            p.custom_name
                          )}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${p.recipes?.name ?? p.custom_name ?? "meal"}`}
                          onClick={() => void removeMeal(p.id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {addingDay === dayISO && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={recipeId} onValueChange={setRecipeId}>
                    <SelectTrigger className="min-w-48 flex-1">
                      <SelectValue placeholder="Choose a saved recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {favorites?.map((f) => (
                        <SelectItem key={f.recipe_id} value={f.recipe_id}>
                          {f.recipes?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => void addMeal(dayISO)}
                    disabled={!recipeId || saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fresh Start confirmation dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Fresh start for this week?</DialogTitle>
            <DialogDescription>
              This clears the scheduled meal slots for {weekRangeLabel} so you can replan cleanly.
              Your saved recipes, XP, achievements, and cooking history stay intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetting}>
              Keep plan
            </Button>
            <Button onClick={() => void handleFreshStartReset()} disabled={resetting}>
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clear week slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareCardModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={{
          kind: "weekly_plan",
          title: "My Weekly MealMate Plan",
          weekLabel: weekRangeLabel,
          plannedCount: plannedList.length,
          completedCount,
          goalTarget,
          meals: plannedList
            .map((p) => `${p.meal_type}: ${p.recipes?.name ?? p.custom_name ?? "Planned dish"}`)
            .slice(0, 6),
        }}
      />
    </main>
  );
}
