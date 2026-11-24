import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Sparkles, Compass, Flame, Heart } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import {
  buildRecipeGenerationPrompt,
  searchOrGenerateRecipe,
  toastRecipeGenerationError,
} from "@/lib/recipe-search";
import { recipesByCategoryQuery, myFavoritesQuery } from "@/lib/queries";
import { generateRecipe, surpriseMe } from "@/lib/ai.functions";
import { RecipeCard, FeaturedRecipeCard } from "@/components/recipe-card";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { firebaseData } from "@/lib/firebase-data";

const DISCOVERY_CATEGORIES = [
  "All",
  "Today's Picks",
  "Trending",
  "South African Favorites",
  "Quick",
  "Budget",
  "Healthy Meals",
  "High Protein",
  "Comfort Food",
  "Breakfast",
  "Dessert",
];

type RecipeSearch = { c?: string; q?: string };

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Discover recipes & Food Inspiration | MealMate" },
      {
        name: "description",
        content:
          "Explore trending recipes, South African favourites, quick meals, and AI-crafted dishes.",
      },
      { property: "og:title", content: "Discover recipes | MealMate" },
      {
        property: "og:description",
        content:
          "Explore trending recipes, South African favourites, quick meals, and AI-crafted dishes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    ...(typeof search["c"] === "string" ? { c: search["c"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
  }),
  ssr: false,
  component: RecipesPage,
});

function RecipesPage() {
  const { c, q } = Route.useSearch();
  const active = c ?? "All";
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const {
    data: recipes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...recipesByCategoryQuery(
      active !== "All" && active !== "Today's Picks" && active !== "Trending" ? active : undefined,
      q,
    ),
    enabled: !!user,
  });
  const loadingRecipes = (!user && sessionLoading) || isLoading;
  const [query, setQuery] = useState(q ?? "");
  useEffect(() => {
    setQuery(q ?? "");
  }, [q]);
  const [busy, setBusy] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const favoriteIds = new Set(favorites?.map((f) => f.recipe_id) ?? []);

  async function toggleFavorite(recipeId: string) {
    if (!user) {
      toast.error("Sign in to save favorite recipes.");
      await navigate({ to: "/auth" });
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
      } else {
        await firebaseData.from("favorites").insert({ recipe_id: recipeId, user_id: user.id });
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Couldn't update favorites");
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term || busy) return;
    setBusy(true);
    setGeneratingFor(null);
    let startedGeneration = false;
    try {
      const result = await searchOrGenerateRecipe({
        query: term,
        category: active,
        queryClient,
        onGenerating: (target) => {
          startedGeneration = true;
          setGeneratingFor(target);
        },
      });
      if (result.kind === "generated") {
        await navigate({ to: "/recipe/$slug", params: { slug: result.slug } });
        return;
      }
      await navigate({
        to: "/recipes",
        search: { ...(active !== "All" ? { c: active } : {}), q: term },
      });
    } catch (err) {
      if (startedGeneration) {
        toastRecipeGenerationError(err);
        await navigate({
          to: "/recipes",
          search: { ...(active !== "All" ? { c: active } : {}), q: term },
        });
      } else {
        toast.error("Couldn't complete the search. Please try again.");
      }
    } finally {
      setGeneratingFor(null);
      setBusy(false);
    }
  }

  async function handleAiGenerate(overrideTerm?: string) {
    const raw = (overrideTerm ?? query).trim();
    if (!raw || busy) return;
    setBusy(true);
    setGeneratingFor(raw);
    try {
      const promptQuery = buildRecipeGenerationPrompt(raw, active);
      const { slug } = await generateRecipe({ data: { query: promptQuery, force: true } });
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      await navigate({ to: "/recipe/$slug", params: { slug } });
    } catch (err) {
      toastRecipeGenerationError(err);
    } finally {
      setGeneratingFor(null);
      setBusy(false);
    }
  }

  async function handleSurprise() {
    if (busy) return;
    setBusy(true);
    try {
      const { slug } = await surpriseMe();
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      await navigate({ to: "/recipe/$slug", params: { slug } });
    } catch (err) {
      toastRecipeGenerationError(err);
    } finally {
      setBusy(false);
    }
  }

  const featuredRecipe = recipes && recipes.length > 0 ? recipes[0] : null;
  const gridRecipes = recipes && recipes.length > 1 ? recipes.slice(1) : [];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Compass className="h-4 w-4" /> Editorial Food Discovery
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight text-foreground">
            Discover culinary inspiration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Browse hand-crafted recipes, South African classics, and AI-tailored creations designed
            for every table.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border bg-card text-foreground hover:bg-secondary"
            onClick={handleSurprise}
            disabled={busy}
          >
            <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
            Surprise Me
          </Button>
        </div>
      </div>

      {/* Search & AI Bar */}
      <form onSubmit={handleGenerate} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search recipes"
            maxLength={200}
            placeholder="Search recipes, ingredients, cuisines (e.g. bobotie, creamy pasta)…"
            className="h-12 rounded-xl border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {busy && !generatingFor ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy || !query.trim()}
          className="h-12 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
          onClick={() => void handleAiGenerate()}
        >
          {busy && generatingFor ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
              Ask AI chef
            </>
          )}
        </Button>
      </form>

      {generatingFor && (
        <div className="mt-6">
          <MiaLoadingCard
            delayMs={0}
            label={`Mia is creating a custom recipe for "${generatingFor}" with professional food photography...`}
          />
        </div>
      )}

      {/* Discovery Category Pills */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DISCOVERY_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            to="/recipes"
            search={{ ...(cat === "All" ? {} : { c: cat }), ...(q ? { q } : {}) }}
            className={`inline-flex shrink-0 min-h-11 items-center rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
              active === cat
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {loadingRecipes ? (
          <div className="space-y-8">
            <Skeleton className="skeleton-shimmer aspect-[16/9] w-full rounded-3xl bg-secondary" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="skeleton-shimmer aspect-[4/3] w-full rounded-2xl bg-secondary"
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Recipes couldn&apos;t load right now.</p>
            <Button
              variant="outline"
              className="mt-4 min-h-11 rounded-xl border-border bg-secondary text-foreground"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-10">
            {q && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  Showing {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} for{" "}
                  <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void handleAiGenerate(q)}
                  className="rounded-xl border-border bg-secondary text-foreground hover:bg-muted"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Generate new &ldquo;{q}&rdquo; recipe
                </Button>
              </div>
            )}

            {/* Featured Hero Recipe (only shown when not deep in search/filter if desired, or always as spotlight) */}
            {!q && active === "All" && featuredRecipe && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl tracking-tight text-foreground flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" /> Today&apos;s Featured Masterpiece
                  </h2>
                </div>
                <FeaturedRecipeCard
                  recipe={featuredRecipe}
                  isFavorite={featuredRecipe.id ? favoriteIds.has(featuredRecipe.id) : false}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            )}

            {/* Grid of Recipes */}
            <div>
              {!q && active === "All" && (
                <div className="mb-4">
                  <h2 className="font-display text-xl tracking-tight text-foreground">
                    Explore All Recipes
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(!q && active === "All" ? gridRecipes : recipes).map((r, index) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    isFavorite={r.id ? favoriteIds.has(r.id) : false}
                    onToggleFavorite={toggleFavorite}
                    priority={index < 3}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-base font-medium text-foreground">No recipes found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {q
                ? `No saved recipes matched "${q}" yet. Let Mia create a custom recipe for you!`
                : "Nothing here yet. Try searching or generating a recipe above!"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {q && (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAiGenerate(q)}
                  className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {busy && generatingFor ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate &ldquo;{q}&rdquo; recipe
                </Button>
              )}
              <Button
                variant="outline"
                className="min-h-11 rounded-xl border-border bg-secondary text-foreground"
                onClick={() => {
                  setQuery("");
                  void navigate({ to: "/recipes", search: {} });
                }}
              >
                Show all recipes
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
