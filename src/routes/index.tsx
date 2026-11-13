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
  ShoppingCart,
  Calendar,
  ChevronRight,
  Play,
  HeartPulse,
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
import { firebaseData } from "@/lib/firebase-data";
import { getContinueCooking } from "@/lib/continue-cooking";
import { TrendingCard } from "@/components/recipe-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanStatusCard } from "@/components/plan-status-card";
import { AdSlot } from "@/components/ad-slot";
import { usePreferences } from "@/hooks/use-preferences";
import { personalize } from "@/lib/preferences";

export const Route = createFileRoute("/")({
  head: ({ matches }) => ({
    meta: [
      {
        title: matches[0]?.context.isHub
          ? "MealMate Hub | Your restaurant workspace"
          : "MealMate — Cook the world, one recipe at a time",
      },
      {
        name: "description",
        content: matches[0]?.context.isHub
          ? "Manage your restaurant menu, photos and orders in MealMate Hub."
          : "Discover South African favourites and global recipes, then plan, shop, and cook with MealMate.",
      },
      {
        property: "og:title",
        content: matches[0]?.context.isHub
          ? "MealMate Hub | Your restaurant workspace"
          : "MealMate — Cook the world, one recipe at a time",
      },
      {
        property: "og:description",
        content: matches[0]?.context.isHub
          ? "Manage your restaurant menu, photos and orders in MealMate Hub."
          : "Discover South African favourites and global recipes, then plan, shop, and cook with MealMate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeSurface,
});

function HomeSurface() {
  const { isHub } = Route.useRouteContext();
  return isHub ? <HubHome /> : <Index />;
}

const CATEGORY_PILLS = [
  { label: "Breakfast", search: { c: "Breakfast" } },
  { label: "Lunch", search: { c: "Lunch" } },
  { label: "Dinner", search: { c: "Dinner" } },
  { label: "Dessert", search: { c: "Dessert" } },
  { label: "Snacks", search: { c: "Snacks" } },
  { label: "South African", search: { c: "South African Favorites" } },
  { label: "Healthy", search: { c: "Healthy Meals" } },
  { label: "Vegan", search: { c: "Vegan" } },
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
  const { user } = useSession();
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
  const recipeText = (r: RecipeRecord) => [
    String(r.name),
    r.description == null ? null : String(r.description),
    r.cuisine == null ? null : String(r.cuisine),
    r.category == null ? null : String(r.category),
    Array.isArray(r.diet_tags) ? r.diet_tags.map(String) : [],
  ];
  const trending = personalize(hasPreferences ? preferences : null, trendingRaw ?? [], recipeText);
  const southAfrican = southAfricanRaw
    ? personalize(hasPreferences ? preferences : null, southAfricanRaw, recipeText)
    : southAfricanRaw;
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<null | "search" | "surprise">(null);
  const continueCooking = getContinueCooking();

  const favoriteIds = new Set((favorites ?? []).map((f) => f.recipe_id));

  const firstName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    const term = query.trim();
    await navigate({ to: "/recipes", search: { q: term } });
    // Use the same explicit photo lookup as a search submitted from the library.
    void queryClient
      .fetchQuery(recipesByCategoryQuery(undefined, term))
      .then((matches) => loadRecipeSearchImages(matches, queryClient))
      .catch(() => {});
  }

  async function handleSurprise() {
    if (busy) return;
    setBusy("surprise");
    try {
      const { slug } = await surpriseMe();
      navigate({ to: "/recipe/$slug", params: { slug } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const authError = /AUTH_REQUIRED|Unauthorized|Invalid user session|No authorization/i.test(
        message,
      );
      toast.error(authError ? "Your session expired" : "The chef is busy", {
        description: authError
          ? "Please sign in again to cook a recipe."
          : "The kitchen assistant is unavailable right now. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function toggleFavorite(recipeId: string) {
    if (!user) {
      toast.info("Sign in to save favorites");
      return;
    }
    if (favoriteIds.has(recipeId)) {
      await firebaseData
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
    } else {
      await firebaseData.from("favorites").insert({ user_id: user.id, recipe_id: recipeId });
    }
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
  }

  return (
    <main className="flex-1 bg-background pb-8 text-foreground">
      {/* Greeting header */}
      <div className="flex items-start justify-between px-4 pt-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {greeting()}
          </p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight text-foreground">
            Hi {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">What are you craving today?</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-[var(--periwinkle)] hover:text-foreground"
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
            className="h-12 rounded-xl border border-border bg-card pl-11 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-[var(--periwinkle)] focus-visible:ring-0"
          />
          <button
            type="submit"
            disabled={busy !== null}
            aria-label="Search"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_PILLS.map((c) => (
            <Link
              key={c.label}
              to="/recipes"
              search={c.search}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--periwinkle)] hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
          <Link
            to="/recipes"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--periwinkle)] hover:text-foreground"
          >
            More
          </Link>
        </div>
      </section>

      {/* Hero cards: AI Kitchen Scan + Surprise Me */}
      <section className="grid grid-cols-1 gap-3 px-4 pt-6 sm:grid-cols-2">
        <Link
          to="/scan"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 text-foreground transition-colors hover:border-[var(--periwinkle)]"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              AI Kitchen Scan
            </p>
            <h2 className="mt-2 text-lg font-medium tracking-tight text-foreground">
              What&apos;s in your kitchen?
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Point your camera at the fridge or pantry — Mia detects ingredients automatically.
            </p>
          </div>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity group-hover:opacity-90">
            <Camera className="h-3.5 w-3.5" />
            Scan now
          </span>
        </Link>

        <button
          type="button"
          onClick={handleSurprise}
          disabled={busy !== null}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 text-left text-foreground transition-colors hover:border-[var(--periwinkle)]"
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Personalized Chef
            </p>
            <h2 className="mt-2 text-lg font-medium tracking-tight text-foreground">Surprise Me</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Let Mia create an instant dish matched to your tastes and pantry items.
            </p>
          </div>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground transition-colors group-hover:border-[var(--periwinkle)]">
            {busy === "surprise" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
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
            label: "Nutrition",
            sub: "Personalized food advice",
          },
          {
            to: "/chat",
            icon: MessageCircleQuestion,
            label: "Ask Mia",
            sub: "Ask anything about food",
          },
          {
            to: "/list",
            icon: ShoppingCart,
            label: "Groceries",
            sub: "Your shopping checklist",
          },
          {
            to: "/planner",
            icon: Calendar,
            label: "Planner",
            sub: "Plan meals for the week",
          },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center transition-colors hover:border-[var(--periwinkle)] hover:bg-secondary"
          >
            <a.icon className="h-5 w-5 text-foreground" />
            <span className="text-xs font-medium leading-tight text-foreground">{a.label}</span>
            <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
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
          <h2 className="text-xl font-medium tracking-tight text-foreground">Trending Recipes</h2>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {trendingLoading ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-40 flex-shrink-0 rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : trendingError ? (
          <div className="mx-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
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
                onToggleFavorite={toggleFavorite}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recipes yet — tap <strong className="text-foreground">Surprise me</strong> above to
              create the first one.
            </p>
          </div>
        )}
      </section>

      {/* South African favourites */}
      <section className="pt-8">
        <div className="mb-3 flex items-end justify-between px-4">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            South African Favourites
          </h2>
          <Link
            to="/recipes"
            search={{ c: "South African Favorites" }}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {southAfricanLoading ? (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 flex-shrink-0 rounded-2xl bg-secondary" />
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
                <div className="aspect-square w-24 overflow-hidden rounded-2xl border border-border bg-card">
                  <RecipeImage recipe={r} size="thumb" className="h-full w-full object-cover" />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight text-muted-foreground">
                  {r.name}
                </p>
              </Link>
            ))}
          </div>
        ) : southAfrican ? (
          <div className="mx-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            South African recipes will show up here once you generate a few.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 flex-shrink-0 rounded-2xl bg-secondary" />
            ))}
          </div>
        )}
      </section>

      {/* Continue cooking */}
      {continueCooking && (
        <section className="px-4 pt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-medium tracking-tight text-foreground">Continue Cooking</h2>
            <Link
              to="/recipes"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Link
            to="/recipe/$slug"
            params={{ slug: continueCooking.slug }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition-colors hover:border-[var(--periwinkle)]"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
              <RecipeImage
                recipe={continueCooking}
                size="thumb"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium leading-tight text-foreground">
                {continueCooking.name}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-[var(--periwinkle)]"
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
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
          </Link>
        </section>
      )}

      {/* Floating AI assistant */}
      <Link
        to="/chat"
        aria-label="AI Assistant"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircleQuestion className="h-5 w-5" />
      </Link>
    </main>
  );
}
