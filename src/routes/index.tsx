import { HubHome } from "@/components/hub/hub-home";
import { loadRecipeSearchImages } from "@/lib/recipe-search-images";
import { RecipeImage } from "@/components/recipe-image";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  trendingRecipesQuery,
  recipesByCategoryQuery,
  southAfricanFavoritesQuery,
  myFavoritesQuery,
  type RecipeRecord,
} from "@/lib/queries";
import { surpriseMe } from "@/lib/ai.functions";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useOptionalUpgradeModal } from "@/components/upgrade-modal";
import { firebaseData } from "@/lib/firebase-data";
import { waitForFirebaseAuth } from "@/lib/firebase";
import { getContinueCooking } from "@/lib/continue-cooking";
import { TrendingCard } from "@/components/recipe-card";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { XpChip } from "@/components/xp-chip";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanStatusCard } from "@/components/plan-status-card";
import { AdSlot } from "@/components/ad-slot";
import { usePreferences } from "@/hooks/use-preferences";
import { personalize } from "@/lib/preferences";
import { buildPersonalisationProfile } from "@/lib/personalisation";

export const Route = createFileRoute("/")({
  head: ({ matches }) => ({
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
    await Promise.all([
      context.queryClient.ensureQueryData(trendingRecipesQuery()),
      context.queryClient.ensureQueryData(southAfricanFavoritesQuery()),
    ]).catch(() => undefined);
  },
  component: HomeSurface,
});

function HomeSurface() {
  const { isHub } = Route.useRouteContext();
  return isHub ? <HubHome /> : <Index />;
}

const CATEGORY_PILLS = [
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

function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: sessionLoading } = useSession();
  const { isPremium } = usePremium();
  const upgradeModal = useOptionalUpgradeModal();
  const { preferences, hasPreferences } = usePreferences();
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

  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user && isPremium });
  const favoriteIds = new Set(favorites?.map((f) => f.recipe_id) ?? []);

  const { data: continueCooking } = useQuery({
    queryKey: ["continue-cooking", user?.id],
    queryFn: () => getContinueCooking(),
    enabled: !!user,
    staleTime: 60_000,
  });

  const trending = personalize(hasPreferences ? preferences : null, trendingRaw, (r) => [
    r.name,
    r.cuisine,
    r.difficulty,
  ]);
  const southAfrican = personalize(hasPreferences ? preferences : null, southAfricanRaw, (r) => [
    r.name,
    r.cuisine,
  ]);

  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<"search" | "surprise" | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setBusy("search");
    try {
      const matches = await queryClient.fetchQuery(recipesByCategoryQuery(undefined, q));
      if (isPremium) void loadRecipeSearchImages(matches, queryClient);
      await navigate({ to: "/recipes", search: { q } });
    } catch {
      await navigate({ to: "/recipes", search: { q } });
    } finally {
      setBusy(null);
    }
  }

  async function handleSurpriseMe() {
    if (busy) return;
    if (!isPremium) {
      if (upgradeModal) {
        upgradeModal.open("Start your 3-day free trial to generate unlimited surprise AI recipes.");
      } else {
        await navigate({ to: "/premium" });
      }
      return;
    }
    setBusy("surprise");
    try {
      const res = await surpriseMe();
      if (res?.slug) {
        await queryClient.invalidateQueries({ queryKey: ["recipes"] });
        await navigate({ to: "/recipe/$slug", params: { slug: res.slug } });
        return;
      }
      throw new Error("No recipe returned");
    } catch {
      toast.error("Mia couldn't generate a surprise recipe right now. Try again in a moment.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleFavorite(recipeId: string) {
    if (!user) {
      toast.error("Sign in to save favorite recipes.");
      await navigate({ to: "/auth" });
      return;
    }
    if (!isPremium) {
      if (upgradeModal) {
        upgradeModal.open("Start your 3-day free trial to save favorite recipes.");
      } else {
        await navigate({ to: "/premium" });
      }
      return;
    }
    const isFav = favoriteIds.has(recipeId);
    try {
      if (isFav) {
        await firebaseData
          .from("favorites")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);
        toast.success("Removed from favorites");
      } else {
        await firebaseData.from("favorites").insert({ recipe_id: recipeId, user_id: user.id });
        toast.success("Added to favorites");
        void import("@/lib/analytics-events")
          .then(({ dispatchAnalyticsEvent }) =>
            dispatchAnalyticsEvent({
              userId: user.id,
              eventName: "recipe_saved",
              entityId: recipeId,
              dedupeKey: `save_${recipeId}_${new Date().toISOString().slice(0, 10)}`,
            }),
          )
          .catch(() => undefined);
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
    } catch {
      toast.error("Could not update favorites.");
    }
  }

  const firstName =
    preferences.preferred_name?.trim().split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Chef";
  const personalisation = hasPreferences ? buildPersonalisationProfile(preferences) : null;
  const recommendedPillOrder = CATEGORY_PILLS.slice().sort((a, b) => {
    if (!personalisation) return 0;
    const aRec = personalisation.recommended_categories.includes(a.search.c) ? 1 : 0;
    const bRec = personalisation.recommended_categories.includes(b.search.c) ? 1 : 0;
    return bRec - aRec;
  });

  return (
    <main className="flex min-h-full flex-col pb-10">
      {/* Greeting header */}
      <div className="flex items-center justify-between px-4 pt-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {greeting()}
          </p>
          <h1 className="font-display text-4xl leading-tight">Hi {firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <XpChip />
          <ThemeToggle />
          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-all duration-200 hover:scale-105 hover:bg-secondary/80 active:scale-95"
            aria-label="Profile"
          >
            <UserIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-4 pt-6">
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
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:scale-105 hover:bg-muted hover:text-foreground active:scale-95"
          >
            {busy === "search" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Category chips */}
      <section className="px-4 pt-5">
        <div className="flex flex-wrap gap-2">
          {recommendedPillOrder.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                to="/recipes"
                search={c.search}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm active:scale-95"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {c.label}
              </Link>
            );
          })}
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm active:scale-95"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            More
          </Link>
        </div>
        {personalisation && personalisation.home_sections[0] && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {personalisation.home_sections[0].title}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {personalisation.home_sections[0].subtitle}
              </p>
            </div>
            <Link
              to="/recipes"
              search={
                personalisation.home_sections[0].category
                  ? { c: personalisation.home_sections[0].category }
                  : personalisation.pantry_focus === "zero_waste"
                    ? { pantry: "1" }
                    : {}
              }
              className="shrink-0 text-xs font-medium text-[var(--periwinkle)] hover:underline"
            >
              Explore
            </Link>
          </div>
        )}
      </section>

      {/* Hero cards: AI Kitchen Scan + Surprise Me */}
      <section className="grid grid-cols-2 gap-3 px-4 pt-6">
        <Link
          to="/scan"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-ink p-5 text-background"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-background/60">
              AI Kitchen Scan
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight">
              What&apos;s in your kitchen?
            </h2>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:scale-105">
              <Camera className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-background/80 group-hover:underline">
              Scan items &rarr;
            </span>
          </div>
        </Link>

        <button
          type="button"
          disabled={busy !== null}
          onClick={handleSurpriseMe}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-5 text-left text-foreground transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Chef Mia
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight">Surprise me with a recipe</h2>
          </div>
          <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            {busy === "surprise" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Surprise me
          </span>
        </button>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-2 px-4 pt-6">
        {[
          {
            to: "/coach",
            icon: HeartPulse,
            label: "Nutrition Coach",
            sub: "Personalized food advice",
          },
          {
            to: "/chat",
            icon: MessageCircleQuestion,
            label: "AI Chat",
            sub: "Ask anything about food",
          },
          {
            to: "/scan",
            icon: Camera,
            label: "Scan Ingredients",
            sub: "Use your camera to scan items",
          },
          {
            to: "/planner",
            icon: Calendar,
            label: "Meal Planner",
            sub: "Plan your meals for the week",
          },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center transition-colors hover:bg-muted"
          >
            <a.icon className="h-5 w-5" />
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
            <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
              {a.sub}
            </span>
          </Link>
        ))}
      </section>

      {/* Plan status + premium features */}
      <section className="px-4 pt-6">
        <PlanStatusCard />
      </section>

      {/* Sponsored (free plan only) */}
      <section className="px-4 pt-6">
        <AdSlot slot="home_feed" />
      </section>

      {/* Trending recipes */}
      <section className="pt-8">
        <div className="mb-3 flex items-end justify-between px-4">
          <h2 className="font-display text-2xl">Trending Recipes</h2>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {sessionLoading || trendingLoading ? (
          <div className="space-y-4">
            <div className="px-4">
              <MiaLoadingCard
                delayMs={120_000}
                label="Mia is picking trending dishes for your kitchen..."
              />
            </div>
            <div className="flex gap-4 overflow-x-auto px-4 pb-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-40 flex-shrink-0 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : trendingError ? (
          <div className="mx-4 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">
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
                onToggleFavorite={toggleFavorite}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">
              No recipes yet. Hit <strong>Surprise me</strong> above to create the first one!
            </p>
          </div>
        )}
      </section>

      {/* South African favourites */}
      <section className="pt-8">
        <div className="mb-3 flex items-end justify-between px-4">
          <h2 className="font-display text-2xl">South African Favourites</h2>
          <Link
            to="/recipes"
            search={{ c: "South African Favorites" }}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {sessionLoading || southAfricanLoading ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : southAfricanError ? (
          <p className="px-4 text-sm text-muted-foreground">
            This section is temporarily unavailable.
          </p>
        ) : southAfrican.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {southAfrican.map((r) => (
              <Link
                key={r.id}
                to="/recipe/$slug"
                params={{ slug: r.slug }}
                className="w-24 flex-shrink-0 text-center"
              >
                <div className="aspect-square w-24 overflow-hidden rounded-2xl bg-muted">
                  <RecipeImage recipe={r} size="thumb" className="h-full w-full object-cover" />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{r.name}</p>
              </Link>
            ))}
          </div>
        ) : southAfrican ? (
          <div className="mx-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            South African recipes will show up here once you generate a few.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        )}
      </section>

      {/* Continue cooking */}
      {continueCooking && (
        <section className="px-4 pt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl">Continue Cooking</h2>
            <Link
              to="/recipes"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Link
            to="/recipe/$slug"
            params={{ slug: continueCooking.slug }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              <RecipeImage
                recipe={continueCooking}
                size="thumb"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-display text-lg leading-tight">{continueCooking.name}</p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${continueCooking.progress}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{continueCooking.progress}% complete</span>
                {continueCooking.cooking_time_minutes && (
                  <span>{continueCooking.cooking_time_minutes} min</span>
                )}
                {continueCooking.calories && <span>{continueCooking.calories} cal</span>}
              </div>
            </div>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink text-background">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </Link>
        </section>
      )}
    </main>
  );
}
