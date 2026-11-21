import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Trash2, Loader2, ShoppingCart, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { myPlannerQuery, myFavoritesQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import {
  generatePersonalizedPlan,
  buildGroceryFromPlan,
  aiPlanAndShop,
  swapMealWithMia,
} from "@/lib/planner.functions";
import { mealTagPillClass } from "@/lib/tag-styles";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
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

  const { data: plans } = useQuery({
    ...myPlannerQuery(fromISO, toISO),
    enabled: !!user,
  });
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });

  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [mealType, setMealType] = useState("Dinner");
  const [recipeId, setRecipeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [autoGroc, setAutoGroc] = useState(false);
  const [planShop, setPlanShop] = useState(false);
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const aiPlannerEnabled = useFeatureFlag("personalized_planner", true);

  async function handleSwapWithMia(planItem: {
    id: string;
    plan_date: string;
    meal_type: string;
    custom_name?: string | null;
    recipes?: { name?: string | null } | null;
  }) {
    if (!user || swappingId) return;
    const currentName = planItem.recipes?.name ?? planItem.custom_name ?? "";
    setSwappingId(planItem.id);
    try {
      const res = await swapMealWithMia({
        data: {
          planId: planItem.id,
          planDate: planItem.plan_date,
          mealType: planItem.meal_type,
          currentName,
        },
      });
      await refresh();
      toast.success(`Mia swapped in ${res.name}`, {
        description: res.reason || undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't swap meal right now";
      if (/PREMIUM_REQUIRED/i.test(msg)) {
        toast.error("Start your 3-day free trial to swap meals with Mia.");
        void navigate({ to: "/premium" });
      } else {
        toast.error(msg);
      }
    } finally {
      setSwappingId(null);
    }
  }

  async function planAndShop() {
    if (!user) return;
    setPlanShop(true);
    try {
      const res = await aiPlanAndShop({
        data: { days: 7, startDate: fromISO, replaceExisting: false },
      });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
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
    return queryClient.invalidateQueries({ queryKey: ["planner"] });
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
      refresh();
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
    refresh();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 text-foreground">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl sm:text-4xl">Meal planner</h1>
            <p className="text-sm text-muted-foreground">This week&apos;s plan</p>
          </div>
        </div>
        <div className="col-span-2 flex flex-wrap gap-2 sm:col-auto">
          {aiPlannerEnabled && (
            <Button
              size="sm"
              className="mia-ai-pill rounded-full px-3.5 font-semibold"
              onClick={planAndShop}
              disabled={planShop}
            >
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
            disabled={autoGroc || !plans || plans.length === 0}
          >
            {autoGroc ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Auto grocery
          </Button>
        </div>
      </div>

      {(planShop || aiLoading) && (
        <div className="mt-6">
          <MiaLoadingCard
            active={planShop || aiLoading}
            delayMs={120_000}
            label="Mia is building your personalized weekly meal plan..."
          />
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
          const dayPlans = plans?.filter((p) => p.plan_date === dayISO) ?? [];
          const isToday = dayISO === iso(new Date());
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
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddingDay(addingDay === dayISO ? null : dayISO)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {dayPlans.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {dayPlans.map((p) => {
                    const isSwapping = swappingId === p.id;
                    return (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/70 px-3 py-2 text-sm"
                      >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${mealTagPillClass(p.meal_type)}`}
                          >
                            {p.meal_type}
                          </span>
                          <span className="truncate font-medium">
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
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {aiPlannerEnabled && (
                            <button
                              type="button"
                              disabled={Boolean(swappingId)}
                              onClick={() => void handleSwapWithMia(p)}
                              className="mia-ai-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            >
                              {isSwapping ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              {isSwapping ? "Swapping…" : "Swap with Mia"}
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={`Remove ${p.recipes?.name ?? p.custom_name ?? p.meal_type}`}
                            onClick={() => removeMeal(p.id)}
                            className="rounded-lg p-1 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
                  <Button size="sm" onClick={() => addMeal(dayISO)} disabled={!recipeId || saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
