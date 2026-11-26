import { HubHome } from "@/components/hub/hub-home";
import { RecipeImage } from "@/components/recipe-image";
import { searchOrGenerateRecipe, toastRecipeGenerationError } from "@/lib/recipe-search";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  Camera,
  Loader2,
  User as UserIcon,
  MessageCircleQuestion,
  Calendar,
  ChevronRight,
  Play,
  HeartPulse,
  Coffee,
  Utensils,
  Flame,
  Cake,
  Cookie,
  Compass,
  Salad,
  Leaf,
  LayoutGrid,
  Sparkles,
  Check,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  trendingRecipesQuery,
  southAfricanFavoritesQuery,
  myFavoritesQuery,
  myPantryQuery,
  myPlannerQuery,
} from "@/lib/queries";
import { surpriseMe } from "@/lib/ai.functions";
import { useSession } from "@/hooks/use-session";
import { useOptionalMia } from "@/hooks/use-mia";
import { firebaseData } from "@/lib/firebase-data";
import { waitForFirebaseAuth } from "@/lib/firebase";
import { getContinueCooking } from "@/lib/continue-cooking";
import { TrendingCard, FeaturedRecipeCard } from "@/components/recipe-card";
import { MiaCompanionPanel } from "@/components/mia-companion";
import { MotionReveal, MotionStagger } from "@/components/motion";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { XpChip } from "@/components/xp-chip";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlanStatusCard } from "@/components/plan-status-card";
import { AdSlot } from "@/components/ad-slot";
import { usePreferences } from "@/hooks/use-preferences";
import { isAvoided, personalize } from "@/lib/preferences";
import { pickDailyRecommendation, pickPantryMatches } from "@/lib/mia-companion";
import { getSeasonalCollectionsForDate } from "@/lib/seasonal-collections";
import { computeEndowedProgress, getCurrentWeekKey } from "@/lib/psychology";
import { myWeeklyGoalQuery, togglePlannedMealCompleted } from "@/lib/psychology-storage";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";
import { awardXp, unlockStatusAchievement } from "@/lib/xp.functions";
import type { CatalogRecipe } from "@/lib/recipe-catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MealMate · Home" },
      {
        name: "description",
        content: "Discover tailored recipes, pantry recommendations, and AI cooking guidance.",
      },
    ],
  }),
  loader: async ({ context }) => {
    if (typeof window === "undefined") return;
    const user = await waitForFirebaseAuth();
    if (!user) return;
    const todayIso = new Date().toISOString().slice(0, 10);
    await Promise.all([
      context.queryClient.ensureQueryData(trendingRecipesQuery()),
      context.queryClient.ensureQueryData(southAfricanFavoritesQuery()),
      context.queryClient.ensureQueryData(myFavoritesQuery()),
      context.queryClient.ensureQueryData(myPantryQuery()),
      context.queryClient.ensureQueryData(myPlannerQuery(todayIso, todayIso)),
    ]).catch(() => undefined);
  },
  component: HomeSurface,
});

function HomeSurface() {
  const { isHub } = Route.useRouteContext();
  return isHub ? <HubHome /> : <Index />;
}

const CATEGORY_SHORTCUTS = [
  { label: "Breakfast", icon: Coffee, search: { c: "Breakfast" } },
  { label: "Lunch", icon: Utensils, search: { c: "Lunch" } },
  { label: "Dinner", icon: Flame, search: { c: "Dinner" } },
  { label: "Dessert", icon: Cake, search: { c: "Dessert" } },
  { label: "Snacks", icon: Cookie, search: { c: "Snacks" } },
  { label: "South African", icon: Compass, search: { c: "South African Favorites" } },
  { label: "Healthy", icon: Salad, search: { c: "Healthy Meals" } },
  { label: "Vegan", icon: Leaf, search: { c: "Vegan" } },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isExpiringSoon(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const ms = Date.parse(expiresAt);
  if (!Number.isFinite(ms)) return false;
  const diffDays = (ms - Date.now()) / 86_400_000;
  return diffDays >= -1 && diffDays <= 4;
}

function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: sessionLoading } = useSession();
  const { preferences, hasPreferences } = usePreferences();
  const mia = useOptionalMia();
  const todayIso = new Date().toISOString().slice(0, 10);
  const weekKey = getCurrentWeekKey();

  const {
    data: trendingRaw = [],
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({ ...trendingRecipesQuery(), enabled: !!user });

  const {
    data: southAfricanRaw = [],
    isLoading: southAfricanLoading,
    error: southAfricanError,
  } = useQuery({ ...southAfricanFavoritesQuery(), enabled: !!user });

  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const { data: pantryItems = [] } = useQuery({ ...myPantryQuery(), enabled: !!user });
  const { data: todaysPlan = [] } = useQuery({
    ...myPlannerQuery(todayIso, todayIso),
    enabled: !!user,
  });
  const { data: weeklyGoal } = useQuery({ ...myWeeklyGoalQuery(weekKey), enabled: !!user });

  const favoriteIds = new Set(favorites?.map((f) => f.recipe_id) ?? []);
  const pantryNames = pantryItems.map((p) => p.name).filter(Boolean);
  const expiringCount = pantryItems.filter((p) => isExpiringSoon(p.expires_at)).length;

  const { data: continueCooking } = useQuery({
    queryKey: ["continue-cooking", user?.id],
    queryFn: () => getContinueCooking(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const safeTrending = hasPreferences
    ? trendingRaw.filter((r) => !isAvoided(preferences, r.name, r.cuisine, r.description))
    : trendingRaw;
  const safeSouthAfrican = hasPreferences
    ? southAfricanRaw.filter((r) => !isAvoided(preferences, r.name, r.cuisine, r.description))
    : southAfricanRaw;

  const trending = personalize(hasPreferences ? preferences : null, safeTrending, (r) => [
    r.name,
    r.cuisine,
    r.difficulty,
  ]);
  const southAfrican = personalize(hasPreferences ? preferences : null, safeSouthAfrican, (r) => [
    r.name,
    r.cuisine,
  ]);

  const dailyPick = pickDailyRecommendation(
    trendingRaw as CatalogRecipe[],
    hasPreferences ? preferences : null,
    pantryNames,
    todayIso,
  );
  const pantryMatches = pickPantryMatches(
    trendingRaw as CatalogRecipe[],
    pantryNames,
    hasPreferences ? preferences : null,
    6,
  );
  const seasonalCollections = getSeasonalCollectionsForDate(
    new Date(),
    trendingRaw as CatalogRecipe[],
    hasPreferences ? preferences : null,
  );
  const quickMeals = trending.filter(
    (r) => typeof r.cooking_time_minutes === "number" && r.cooking_time_minutes <= 35,
  );

  const completedTodayCount = todaysPlan.filter((m) => m.completed === true).length;
  const completedMealsTotal = Math.max(weeklyGoal?.completed_meals ?? 0, completedTodayCount);
  const weeklyTarget = preferences?.weekly_cooking_goal ?? weeklyGoal?.target_meals ?? 4;
  const endowed = computeEndowedProgress({
    onboardingCompleted: Boolean(preferences?.onboarding_completed),
    savedRecipesCount: favoriteIds.size,
    plannedMealsCount: todaysPlan.length,
    completedMealsCount: completedMealsTotal,
    pantryItemsCount: pantryItems.length,
  });

  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<"search" | "surprise" | null>(null);
  const [generatingQuery, setGeneratingQuery] = useState<string | null>(null);
  const [togglingMealId, setTogglingMealId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || busy !== null) return;
    setBusy("search");
    setGeneratingQuery(null);
    let startedGeneration = false;
    try {
      const result = await searchOrGenerateRecipe({
        query: q,
        queryClient,
        onGenerating: (term) => {
          startedGeneration = true;
          setGeneratingQuery(term);
        },
      });
      if (result.kind === "generated") {
        await navigate({ to: "/recipe/$slug", params: { slug: result.slug } });
      } else {
        await navigate({ to: "/recipes", search: { q } });
      }
    } catch (err) {
      if (startedGeneration) {
        toastRecipeGenerationError(err);
      }
      await navigate({ to: "/recipes", search: { q } });
    } finally {
      setGeneratingQuery(null);
      setBusy(null);
    }
  }

  async function handleSurpriseMe() {
    if (busy) return;
    setBusy("surprise");
    mia?.setMood("thinking");
    try {
      const res = await surpriseMe();
      if (res?.slug) {
        mia?.setMood("excited");
        await queryClient.invalidateQueries({ queryKey: ["recipes"] });
        await navigate({ to: "/recipe/$slug", params: { slug: res.slug } });
        return;
      }
      throw new Error("No recipe returned");
    } catch (err) {
      mia?.setMood("concerned");
      toastRecipeGenerationError(err);
    } finally {
      setBusy(null);
    }
  }

  async function toggleFavorite(recipeId: string, recipeName?: string) {
    if (!user) {
      toast.error("Sign in to save favorite recipes.");
      await navigate({ to: "/auth" });
      return;
    }
    const isFav = favoriteIds.has(recipeId);
    try {
      if (isFav) {
        const { error } = await firebaseData
          .from("favorites")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("Removed from saved recipes");
      } else {
        const { error } = await firebaseData
          .from("favorites")
          .insert({ recipe_id: recipeId, user_id: user.id });
        if (error) throw error;
        mia?.reactToAction("recipe_saved", { recipeName });
        void dispatchAnalyticsEvent({
          userId: user.id,
          eventName: "recipe_saved",
          entityId: recipeId,
        });
        void unlockStatusAchievement({ data: { code: "recipe_collector" } }).catch(() => {});
        toast.success("Saved to your cookbook");
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Could not update saved recipes.");
    }
  }

  async function handleToggleTodayMeal(mealId: string, nextCompleted: boolean, mealName: string) {
    if (!user || togglingMealId) return;
    setTogglingMealId(mealId);
    try {
      await togglePlannedMealCompleted(mealId, nextCompleted);
      await queryClient.invalidateQueries({ queryKey: ["planner"] });
      if (nextCompleted) {
        mia?.reactToAction("meal_completed", { recipeName: mealName });
        void dispatchAnalyticsEvent({
          userId: user.id,
          eventName: "meal_completed",
          entityId: mealId,
        });
        void awardXp({ data: { action: "planned_meal_completed", entityId: mealId } })
          .then((res) => {
            if (res.awarded) {
              toast.success(`+${res.points} XP for cooking ${mealName}!`);
              void queryClient.invalidateQueries({ queryKey: ["gamification"] });
            }
          })
          .catch(() => {});
      }
    } catch {
      toast.error("Could not update meal progress");
    } finally {
      setTogglingMealId(null);
    }
  }

  const firstName =
    preferences?.preferred_name?.trim() ||
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Chef";

  const miaHomeMessage =
    expiringCount > 0
      ? `You have ${expiringCount} pantry ${expiringCount === 1 ? "item" : "items"} ready to use soon — let's turn them into dinner.`
      : pantryNames.length > 0
        ? `You have ingredients for something special (${pantryNames.length} stocked). Want a quick match or a surprise dish?`
        : "Tell me what you're craving or scan your fridge, and I will match meals around your taste.";

  return (
    <main className="flex min-h-full flex-col pb-12">
      {/* 1. Personalised Greeting */}
      <MotionReveal className="flex items-start justify-between gap-3 px-4 pt-6">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{greeting()}</p>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">Hi {firstName}</h1>
          {preferences?.identity_habit && (
            <p className="mt-1 line-clamp-1 text-xs font-medium text-primary">
              {preferences.identity_habit}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <XpChip />
          <ThemeToggle />
          <Link
            to="/profile"
            className="tap-spring flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-secondary-foreground ring-2 ring-primary/15 transition-all duration-200 hover:scale-105 hover:ring-primary/40"
            aria-label="Profile"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </Link>
        </div>
      </MotionReveal>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="px-4 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, ingredients, cuisines…"
            maxLength={200}
            className="h-14 rounded-full border-none bg-card pl-11 pr-14 text-base shadow-sm transition-all duration-200 focus:shadow-md"
          />
          <button
            type="submit"
            disabled={busy !== null}
            aria-label="Search"
            className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95"
          >
            {busy === "search" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
          </button>
        </div>
        {generatingQuery && (
          <div className="mt-3">
            <MiaLoadingCard
              delayMs={0}
              label={`Mia is creating a recipe for "${generatingQuery}"...`}
            />
          </div>
        )}
      </form>

      {/* Interactive Category Navigation Shortcuts */}
      <section className="px-4 pt-4" aria-label="Browse categories">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SHORTCUTS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                to="/recipes"
                search={c.search}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted sm:text-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {c.label}
              </Link>
            );
          })}
          <Link
            to="/recipes"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted sm:text-sm"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            All recipes
          </Link>
        </div>
      </section>

      {/* 2. Mia Companion Section */}
      <div className="px-4 pt-5">
        <MiaCompanionPanel
          mood={expiringCount > 0 ? "concerned" : undefined}
          headline="Mia found fresh ideas for your kitchen"
          message={miaHomeMessage}
          primaryAction={{
            label: busy === "surprise" ? "Picking a dish..." : "Surprise me",
            onClick: handleSurpriseMe,
          }}
          secondaryAction={{ label: "Ask Mia", to: "/chat" }}
        />
      </div>

      {/* Quick actions */}
      <MotionStagger className="grid grid-cols-4 gap-2 px-4 pt-4">
        {[
          { to: "/coach", icon: HeartPulse, label: "Nutrition", sub: "Food balance" },
          { to: "/chat", icon: MessageCircleQuestion, label: "AI Chef", sub: "Chat with Mia" },
          { to: "/scan", icon: Camera, label: "Scan Fridge", sub: "Camera match" },
          { to: "/planner", icon: Calendar, label: "Planner", sub: "Weekly plan" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="recipe-card-lift tap-spring group flex min-h-11 flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3.5 text-center transition-colors hover:border-primary/30 hover:bg-muted/70"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground transition-transform duration-200 group-hover:scale-105 group-hover:text-primary">
              <a.icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
          </Link>
        ))}
      </MotionStagger>

      {/* 3. Daily Recommendation */}
      {dailyPick && !trendingLoading && !trendingError && (
        <section className="px-4 pt-7">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-primary">
                Mia found something delicious for you
              </p>
              <h2 className="font-display text-2xl">Daily Recommendation</h2>
            </div>
            <Link
              to="/recipes"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Explore <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FeaturedRecipeCard
            recipe={dailyPick.recipe as any}
            reason={dailyPick.reason}
            isFavorite={favoriteIds.has(dailyPick.recipe.id)}
            onToggleFavorite={(id) => toggleFavorite(id, dailyPick.recipe.name)}
          />
        </section>
      )}

      {/* 4. Today's Meal Plan */}
      <section className="px-4 pt-7">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Today&apos;s Meal Plan</h2>
            <p className="text-xs text-muted-foreground">
              {todaysPlan.length > 0
                ? `${completedTodayCount} of ${todaysPlan.length} meals cooked today`
                : "Keep evenings calm with one planned meal"}
            </p>
          </div>
          <Link
            to="/planner"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Open planner <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {todaysPlan.length > 0 ? (
          <ul className="space-y-2">
            {todaysPlan.map((slot) => {
              const title = slot.recipes?.name || slot.custom_name || "Planned meal";
              const isDone = slot.completed === true;
              return (
                <li
                  key={slot.id}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      disabled={togglingMealId === slot.id}
                      aria-label={isDone ? `Mark ${title} incomplete` : `Mark ${title} cooked`}
                      onClick={() => void handleToggleTodayMeal(slot.id, !isDone, title)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-transparent hover:border-primary/60"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{slot.meal_type}</p>
                      <p
                        className={`truncate text-sm font-medium ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {title}
                      </p>
                    </div>
                  </div>
                  {slot.recipes?.slug && (
                    <Link
                      to="/recipe/$slug"
                      params={{ slug: slot.recipes.slug }}
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      Cook
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Nothing scheduled for today yet. Add a quick dinner in two taps.
            </p>
            <Button asChild size="sm" variant="outline" className="min-h-10 rounded-xl">
              <Link to="/planner">Plan today</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 5. Continue Cooking */}
      {continueCooking && (
        <section className="px-4 pt-7">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl">Continue Cooking</h2>
            <Link
              to="/recipes"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Recipes <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link
            to="/recipe/$slug"
            params={{ slug: continueCooking.slug }}
            className="recipe-card-lift tap-spring group flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              <RecipeImage
                recipe={continueCooking}
                size="thumb"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg leading-tight">{continueCooking.name}</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${continueCooking.progress}%` }}
                />
              </div>
              <div className="tabular-nums mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{continueCooking.progress}% complete</span>
                {continueCooking.cooking_time_minutes && (
                  <span>&middot; {continueCooking.cooking_time_minutes} min</span>
                )}
              </div>
            </div>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink text-background">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </Link>
        </section>
      )}

      {/* 6. Pantry-Based Recommendations */}
      <section className="pt-7">
        <div className="mb-3 flex items-end justify-between px-4">
          <div>
            <p className="text-xs font-medium text-primary">
              {pantryNames.length > 0
                ? "You have ingredients for something special"
                : "Stock once, cook effortlessly"}
            </p>
            <h2 className="font-display text-2xl">From Your Pantry</h2>
          </div>
          <Link
            to="/pantry"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Pantry ({pantryItems.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pantryMatches.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pantryMatches.map(({ recipe, match }) => (
              <div key={`pantry-${recipe.id}`} className="w-44 flex-shrink-0">
                <TrendingCard
                  recipe={recipe as any}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onToggleFavorite={(id) => toggleFavorite(id, recipe.name)}
                />
                <p className="mt-1 text-xs font-medium text-primary tabular-nums">
                  {match.matchedCount} of {match.totalIngredients} ingredients ready
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Package className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-muted-foreground">
                Add items in your pantry or fridge and Mia will match recipes you can cook right
                now.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="min-h-10 rounded-xl">
              <Link to="/pantry">Open pantry</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 7. Trending & Quick Weeknight Meals & SA Favourites */}
      <section className="pt-7">
        <div className="mb-3 flex items-end justify-between px-4">
          <h2 className="font-display text-2xl">Trending Recipes</h2>
          <Link
            to="/recipes"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {(!user && sessionLoading) || trendingLoading ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-44 flex-shrink-0 space-y-2">
                <Skeleton className="skeleton-shimmer h-44 w-44 rounded-2xl" />
                <Skeleton className="skeleton-shimmer h-4 w-32 rounded-md" />
                <Skeleton className="skeleton-shimmer h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : trendingError ? (
          <div className="mx-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Recipes are temporarily unavailable. You can still use the rest of MealMate.
            </p>
          </div>
        ) : trending.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trending.map((r, i) => (
              <TrendingCard
                key={r.id}
                recipe={r as any}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={(id) => toggleFavorite(id, r.name)}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recipes yet. Tap <strong>Surprise me</strong> above to discover your first dish.
            </p>
          </div>
        )}
      </section>

      {quickMeals.length > 0 && !trendingLoading && (
        <section className="pt-7">
          <div className="mb-3 flex items-end justify-between px-4">
            <h2 className="font-display text-2xl">Quick Weeknight Meals</h2>
            <Link
              to="/recipes"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickMeals.map((r) => (
              <TrendingCard
                key={`quick-${r.id}`}
                recipe={r as any}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={(id) => toggleFavorite(id, r.name)}
              />
            ))}
          </div>
        </section>
      )}

      {southAfrican.length > 0 && !southAfricanLoading && !southAfricanError && (
        <section className="pt-7">
          <div className="mb-3 flex items-end justify-between px-4">
            <h2 className="font-display text-2xl">South African Favourites</h2>
            <Link
              to="/recipes"
              search={{ c: "South African Favorites" }}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {southAfrican.map((r) => (
              <Link
                key={r.id}
                to="/recipe/$slug"
                params={{ slug: r.slug }}
                className="recipe-card-lift tap-spring group w-28 flex-shrink-0 text-center"
              >
                <div className="aspect-square w-28 overflow-hidden rounded-2xl bg-muted shadow-xs">
                  <RecipeImage
                    recipe={r}
                    size="thumb"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{r.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 8. Personal Progress */}
      <section className="px-4 pt-7">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Your Kitchen Momentum</p>
              <h2 className="font-display text-xl">
                {endowed.completed} of {endowed.total} milestones completed ({endowed.percentage}%)
              </h2>
            </div>
            <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
              View profile
            </Link>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${Math.max(4, endowed.percentage)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            Weekly goal: {completedMealsTotal} / {weeklyTarget} home-cooked meals
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {endowed.steps.slice(0, 4).map((step) => (
              <li key={step.id}>
                <Link
                  to={step.actionTo}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 px-3 py-2 text-xs transition-colors hover:bg-secondary"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      step.completed
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span
                    className={
                      step.completed
                        ? "text-muted-foreground line-through"
                        : "font-medium text-foreground"
                    }
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Seasonal Discoveries */}
      {seasonalCollections.length > 0 && seasonalCollections[0]!.recipes.length > 0 && (
        <section className="pt-7">
          <div className="mb-3 flex items-end justify-between px-4">
            <div>
              <p className="text-xs font-medium text-primary">
                {seasonalCollections[0]!.seasonLabel} &middot; {seasonalCollections[0]!.monthsLabel}
              </p>
              <h2 className="font-display text-2xl">{seasonalCollections[0]!.title}</h2>
            </div>
            <Link
              to="/recipes"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Discover <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {seasonalCollections[0]!.recipes.map((r) => (
              <TrendingCard
                key={`seasonal-${r.id}`}
                recipe={r as any}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={(id) => toggleFavorite(id, r.name)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Plan status & free-tier sponsor placement */}
      <section className="px-4 pt-7">
        <PlanStatusCard />
      </section>
      <section className="px-4 pt-5">
        <AdSlot slot="home_feed" />
      </section>
    </main>
  );
}
