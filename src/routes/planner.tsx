import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookmarkCheck,
  CalendarDays,
  Loader2,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { myPlannerQuery, myFavoritesQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { PremiumFeatureLock } from "@/components/premium-feature-lock";
import { usePreferences } from "@/hooks/use-preferences";
import { evaluateRecipeAllergens } from "@/lib/preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import {
  generatePersonalizedPlan,
  buildGroceryFromPlan,
  aiPlanAndShop,
} from "@/lib/planner.functions";
import {
  deletePlannerTemplate,
  listPlannerTemplates,
  savePlannerTemplate,
  type PlannerTemplate,
} from "@/lib/planner-templates";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

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
  const { isPremium, loading: premiumLoading } = usePremium();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { preferences } = usePreferences();

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
    enabled: !!user && isPremium,
  });
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user && isPremium });
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ["planner-templates", user?.id],
    queryFn: () => (user ? listPlannerTemplates(user.id) : []),
    enabled: !!user && isPremium,
  });

  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [mealType, setMealType] = useState("Dinner");
  const [recipeId, setRecipeId] = useState("");
  const [servings, setServings] = useState(2);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [autoGroc, setAutoGroc] = useState(false);
  const [planShop, setPlanShop] = useState(false);

  // Template modal
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const aiPlannerEnabled = useFeatureFlag("personalized_planner", true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["planner"] });
  }

  async function planAndShop() {
    if (!user) return;
    setPlanShop(true);
    try {
      const res = await aiPlanAndShop({
        data: { days: 7, startDate: fromISO, replaceExisting: false },
      });
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["grocery"] });
      void import("@/lib/analytics-events")
        .then(({ dispatchAnalyticsEvent }) =>
          dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "meal_plan_created",
            entityId: fromISO,
            metadata: { mode: "ai_plan_and_shop", meals: res.meals },
          }),
        )
        .catch(() => undefined);
      toast.success(`Planned ${res.meals} meals, added ${res.groceries} to your list`, {
        description:
          res.skipped > 0 ? `Updated ${res.skipped} items already on your list.` : undefined,
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
      void import("@/lib/analytics-events")
        .then(({ dispatchAnalyticsEvent }) =>
          dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "meal_plan_created",
            entityId: fromISO,
            metadata: { mode: "ai_suggestions", count: suggestions.length },
          }),
        )
        .catch(() => undefined);
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
      await queryClient.invalidateQueries({ queryKey: ["grocery"] });
      toast.success(`Consolidated ${inserted} ingredients onto your grocery list`, {
        action: { label: "View", onClick: () => navigate({ to: "/list" }) },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't build grocery list");
    } finally {
      setAutoGroc(false);
    }
  }

  async function addMeal(day: string) {
    if (!user || !recipeId) return;
    const fav = favorites?.find((f) => f.recipe_id === recipeId);
    const safety = evaluateRecipeAllergens(preferences, {
      name: fav?.recipes?.name,
      description: fav?.recipes?.description,
      ingredients: (fav?.recipes?.ingredients as { name?: string }[]) ?? [],
    });
    if (!safety.safe) {
      toast.warning(`Allergy alert: ${safety.warningSummary}`);
    }

    setSaving(true);
    try {
      const { error } = await firebaseData.from("meal_plans").insert({
        user_id: user.id,
        plan_date: day,
        meal_type: mealType,
        recipe_id: recipeId,
        custom_name: fav?.recipes?.name ?? null,
        servings,
      });
      if (error) throw error;
      setAddingDay(null);
      setRecipeId("");
      await refresh();
      void import("@/lib/analytics-events")
        .then(({ dispatchAnalyticsEvent }) =>
          dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "meal_plan_created",
            entityId: `${day}_${mealType}`,
            metadata: { mode: "manual", recipeId },
          }),
        )
        .catch(() => undefined);
    } catch {
      toast.error("Couldn't add meal");
    } finally {
      setSaving(false);
    }
  }

  async function moveMealSlot(id: string, nextMealType: string) {
    await firebaseData.from("meal_plans").update({ meal_type: nextMealType }).eq("id", id);
    await refresh();
  }

  async function removeMeal(id: string) {
    await firebaseData.from("meal_plans").delete().eq("id", id);
    await refresh();
  }

  async function handleSaveTemplate() {
    if (!user || !templateName.trim() || !plans || plans.length === 0) return;
    setSavingTemplate(true);
    try {
      const dayIndexByIso = new Map(week.map((d, idx) => [iso(d), idx]));
      const slots = plans.map((p) => ({
        dayIndex: dayIndexByIso.get(p.plan_date) ?? 0,
        meal_type: p.meal_type,
        recipe_id: p.recipe_id ?? null,
        custom_name: p.recipes?.name ?? p.custom_name ?? null,
        servings: typeof p.servings === "number" ? p.servings : 2,
      }));
      await savePlannerTemplate({ userId: user.id, name: templateName, slots });
      await refetchTemplates();
      setTemplateName("");
      toast.success("Weekly template saved");
    } catch {
      toast.error("Could not save template");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleApplyTemplate(template: PlannerTemplate) {
    if (!user || template.slots.length === 0) return;
    const rows = template.slots.map((slot) => ({
      user_id: user.id,
      plan_date: iso(week[Math.max(0, Math.min(slot.dayIndex, 6))] ?? week[0]),
      meal_type: slot.meal_type,
      recipe_id: slot.recipe_id,
      custom_name: slot.custom_name,
      servings: slot.servings ?? 2,
    }));
    const { error } = await firebaseData.from("meal_plans").insert(rows);
    if (error) {
      toast.error("Could not apply template");
      return;
    }
    await refresh();
    setTemplateDialogOpen(false);
    toast.success(`Applied "${template.name}" (${rows.length} meals)`);
  }

  if (!loading && !premiumLoading && user && !isPremium) {
    return (
      <PremiumFeatureLock
        featureLabel="Weekly Meal Planner"
        title="Plan your whole week in seconds"
        description="Build custom weekly meal schedules, save reusable templates, and auto-generate aisle-sorted grocery lists with a 3-day free trial."
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 pb-24 text-foreground">
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
            <Button size="sm" onClick={planAndShop} disabled={planShop} className="min-h-10">
              {planShop ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Plan &amp; shop
            </Button>
          )}
          {aiPlannerEnabled && (
            <Button
              size="sm"
              variant="outline"
              onClick={generateAiPlan}
              disabled={aiLoading}
              className="min-h-10"
            >
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
            className="min-h-10"
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
            onClick={() => setTemplateDialogOpen(true)}
            className="min-h-10"
          >
            <BookmarkCheck className="mr-2 h-4 w-4" />
            Templates
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
          const groupedSlots = MEAL_TYPES.map((slot) => ({
            slot,
            meals: dayPlans.filter((p) => p.meal_type.toLowerCase() === slot.toLowerCase()),
          })).filter((g) => g.meals.length > 0);

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
                  className="h-10 w-10 p-0"
                  aria-label={`Add meal for ${dayISO}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {groupedSlots.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  {groupedSlots.map(({ slot, meals }) => (
                    <div key={slot} className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {slot}
                      </p>
                      <ul className="space-y-1.5">
                        {meals.map((p) => {
                          const safety = evaluateRecipeAllergens(preferences, {
                            name: p.recipes?.name ?? p.custom_name ?? "",
                            ingredients:
                              (p.recipes?.ingredients as { name?: string }[] | undefined) ?? [],
                          });
                          return (
                            <li
                              key={p.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/70 px-3 py-2 text-sm"
                            >
                              <div className="min-w-0 flex-1">
                                {p.recipes?.slug ? (
                                  <Link
                                    to="/recipe/$slug"
                                    params={{ slug: p.recipes.slug ?? p.recipe_id ?? "" }}
                                    className="font-medium hover:underline"
                                  >
                                    {p.recipes?.name ?? p.custom_name}
                                  </Link>
                                ) : (
                                  <span className="font-medium">{p.custom_name}</span>
                                )}
                                {typeof p.servings === "number" && (
                                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                                    · {p.servings} servings
                                  </span>
                                )}
                                {!safety.safe && (
                                  <p className="mt-0.5 text-xs font-medium text-destructive">
                                    Allergen conflict: {safety.matchedAllergens.join(", ")}
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <select
                                  aria-label={`Change meal slot for ${p.recipes?.name ?? p.custom_name}`}
                                  value={p.meal_type}
                                  onChange={(e) => void moveMealSlot(p.id, e.target.value)}
                                  className="h-9 rounded-lg border border-border bg-card px-2 text-xs text-foreground"
                                >
                                  {MEAL_TYPES.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removeMeal(p.id)}
                                  aria-label="Remove meal"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {addingDay === dayISO && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger className="h-10 w-32">
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
                    <SelectTrigger className="h-10 min-w-44 flex-1">
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
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
                    aria-label="Servings"
                    className="h-10 w-20 text-center text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => addMeal(dayISO)}
                    disabled={!recipeId || saving}
                    className="h-10"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reusable Weekly Templates Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-h-[84dvh] overflow-y-auto rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Weekly Planner Templates</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Save this week&apos;s plan as a reusable template, or load a saved week.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name (e.g. Busy Work Week)"
                className="h-10 flex-1 rounded-xl border-border bg-secondary text-sm"
              />
              <Button
                type="button"
                disabled={savingTemplate || !templateName.trim() || !plans || plans.length === 0}
                onClick={() => void handleSaveTemplate()}
                className="h-10 rounded-xl"
              >
                {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save week"}
              </Button>
            </div>

            {templates.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No saved weekly templates yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {templates.map((tpl) => (
                  <li
                    key={tpl.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {tpl.slots.length} planned meals
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => void handleApplyTemplate(tpl)}
                      className="h-9 rounded-lg text-xs"
                    >
                      Apply
                    </Button>
                    <button
                      type="button"
                      aria-label={`Delete template ${tpl.name}`}
                      onClick={async () => {
                        if (!user) return;
                        await deletePlannerTemplate(user.id, tpl.id);
                        await refetchTemplates();
                        toast.success("Template deleted");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setTemplateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
