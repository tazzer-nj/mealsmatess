import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Refrigerator, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useOptionalUpgradeModal } from "@/components/upgrade-modal";
import { usePreferences } from "@/hooks/use-preferences";
import { loadRecipeSearchImages } from "@/lib/recipe-search-images";
import { myPantryQuery, recipesByCategoryQuery } from "@/lib/queries";
import { generateRecipe, surpriseMe } from "@/lib/ai.functions";
import { evaluateRecipeAllergens, isAvoided, personalize } from "@/lib/preferences";
import { matchRecipeToPantry } from "@/lib/pantry-matcher";
import { RecipeCard } from "@/components/recipe-card";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snacks",
  "Drinks",
  "Vegan",
  "High Protein",
  "Quick",
];

const FILTERS_STORAGE_KEY = "mealmate.recipes.filters.v1";
const PAGE_SIZE = 12;

type RecipeSearch = { c?: string; q?: string; pantry?: string };

type StoredRecipeFilters = {
  maxTime: "any" | "20" | "35" | "60";
  difficulty: "any" | "Easy" | "Medium" | "Hard";
  respectPrefs: boolean;
  usePantry: boolean;
};

function readStoredFilters(): StoredRecipeFilters {
  if (typeof window === "undefined") {
    return { maxTime: "any", difficulty: "any", respectPrefs: true, usePantry: false };
  }
  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY);
    if (!raw) return { maxTime: "any", difficulty: "any", respectPrefs: true, usePantry: false };
    const parsed = JSON.parse(raw) as Partial<StoredRecipeFilters>;
    return {
      maxTime:
        parsed.maxTime === "20" || parsed.maxTime === "35" || parsed.maxTime === "60"
          ? parsed.maxTime
          : "any",
      difficulty:
        parsed.difficulty === "Easy" ||
        parsed.difficulty === "Medium" ||
        parsed.difficulty === "Hard"
          ? parsed.difficulty
          : "any",
      respectPrefs: parsed.respectPrefs !== false,
      usePantry: parsed.usePantry === true,
    };
  } catch {
    return { maxTime: "any", difficulty: "any", respectPrefs: true, usePantry: false };
  }
}

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Discover recipes | MealMate" },
      {
        name: "description",
        content: "Browse South African favourites, global classics, and personalised recipe ideas.",
      },
      { property: "og:title", content: "Discover recipes | MealMate" },
      {
        property: "og:description",
        content: "Browse South African favourites, global classics, and personalised recipe ideas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    ...(typeof search["c"] === "string" ? { c: search["c"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
    ...(typeof search["pantry"] === "string" ? { pantry: search["pantry"] } : {}),
  }),
  ssr: false,
  component: RecipesPage,
});

function RecipesPage() {
  const { c, q, pantry: pantryParam } = Route.useSearch();
  const active = c ?? "All";
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const { isPremium } = usePremium();
  const upgradeModal = useOptionalUpgradeModal();
  const { preferences, hasPreferences } = usePreferences();

  const [storedFilters, setStoredFilters] = useState<StoredRecipeFilters>(() =>
    readStoredFilters(),
  );
  const usePantry =
    pantryParam === "1" ? true : pantryParam === "0" ? false : storedFilters.usePantry;

  const {
    data: recipes,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...recipesByCategoryQuery(active !== "All" ? active : undefined, q),
    enabled: !!user,
  });

  const { data: pantryItems = [] } = useQuery({
    ...myPantryQuery(),
    enabled: !!user && isPremium,
  });

  const loadingRecipes = sessionLoading || isLoading;
  const [query, setQuery] = useState(q ?? "");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setQuery(q ?? "");
    setVisibleCount(PAGE_SIZE);
  }, [q, active]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(storedFilters));
    } catch {
      /* ignore */
    }
  }, [storedFilters]);

  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  const pantryNames = useMemo(() => pantryItems.map((i) => i.name), [pantryItems]);

  const filteredRecipes = useMemo(() => {
    const base = recipes ?? [];
    const maxMins = storedFilters.maxTime !== "any" ? Number(storedFilters.maxTime) : null;

    const afterBasic = base.filter((r) => {
      if (maxMins !== null && r.cooking_time_minutes && r.cooking_time_minutes > maxMins) {
        return false;
      }
      if (
        storedFilters.difficulty !== "any" &&
        r.difficulty &&
        r.difficulty.toLowerCase() !== storedFilters.difficulty.toLowerCase()
      ) {
        return false;
      }
      if (storedFilters.respectPrefs) {
        const allergySafety = evaluateRecipeAllergens(preferences, {
          name: r.name,
          description: r.description,
          ingredients: r.ingredients as { name?: string }[] | null,
        });
        if (!allergySafety.safe) return false;
        if (
          isAvoided(
            preferences,
            r.name,
            r.description,
            r.cuisine,
            r.category,
            Array.isArray(r.ingredients)
              ? r.ingredients.map((i) =>
                  typeof i === "string" ? i : (i as { name?: string })?.name,
                )
              : [],
          )
        ) {
          return false;
        }
      }
      return true;
    });

    const ranked = hasPreferences
      ? personalize(preferences, afterBasic, (r) => [r.name, r.cuisine, r.category, r.difficulty])
      : afterBasic;

    if (!usePantry || pantryNames.length === 0) {
      return ranked.map((r) => ({
        recipe: r,
        match: null as ReturnType<typeof matchRecipeToPantry> | null,
      }));
    }

    return ranked
      .map((r) => ({ recipe: r, match: matchRecipeToPantry(r, pantryNames) }))
      .sort((a, b) => (b.match?.matchRatio ?? 0) - (a.match?.matchRatio ?? 0));
  }, [hasPreferences, pantryNames, preferences, recipes, storedFilters, usePantry]);

  const visibleRecipes = useMemo(
    () => filteredRecipes.slice(0, visibleCount),
    [filteredRecipes, visibleCount],
  );

  const hasMore = visibleCount < filteredRecipes.length;
  const activeRestrictionCount =
    preferences.allergies.length +
    (preferences.intolerances?.length ?? 0) +
    preferences.dietary_restrictions.length;

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    const term = query.trim();
    setBusy(true);
    try {
      await navigate({
        to: "/recipes",
        search: {
          ...(active !== "All" ? { c: active } : {}),
          q: term,
          ...(usePantry ? { pantry: "1" } : {}),
        },
      });
      const matches = await queryClient.fetchQuery(
        recipesByCategoryQuery(active !== "All" ? active : undefined, term),
      );
      if (isPremium) void loadRecipeSearchImages(matches, queryClient);
    } catch {
      toast.error("Couldn't complete the search. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAiGenerate() {
    if (!query.trim() || busy) return;
    if (!isPremium) {
      if (upgradeModal) {
        upgradeModal.open("Start your 3-day free trial to create custom AI recipes.");
      } else {
        await navigate({ to: "/premium" });
      }
      return;
    }
    setBusy(true);
    try {
      const { slug } = await generateRecipe({ data: { query: query.trim() } });
      navigate({ to: "/recipe/$slug", params: { slug } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const authError = /AUTH_REQUIRED|Unauthorized|Invalid user session|No authorization/i.test(
        message,
      );
      toast.error(authError ? "Your session expired" : "Couldn't generate that recipe", {
        description: authError
          ? "Please sign in again to cook a recipe."
          : message || "The kitchen assistant is unavailable right now. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleSurprise() {
    if (busy) return;
    if (!isPremium) {
      if (upgradeModal) {
        upgradeModal.open("Start your 3-day free trial to generate unlimited surprise AI recipes.");
      } else {
        await navigate({ to: "/premium" });
      }
      return;
    }
    setBusy(true);
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
      setBusy(false);
    }
  }

  function resetAllFilters() {
    setQuery("");
    setStoredFilters({
      maxTime: "any",
      difficulty: "any",
      respectPrefs: true,
      usePantry: false,
    });
    void navigate({ to: "/recipes", search: {} });
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 overflow-x-hidden bg-background px-3.5 py-6 text-foreground sm:px-4 sm:py-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Discover recipes</h1>
        <p className="text-sm text-muted-foreground">
          Search by recipe name, ingredients, or cuisine — or ask Mia to craft a safe custom dish.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search recipes"
            maxLength={200}
            placeholder="Search recipes, ingredients, cuisines…"
            className="h-12 rounded-xl border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy}
          className="h-12 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
          onClick={handleAiGenerate}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask AI chef"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-12 rounded-xl border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
          onClick={handleSurprise}
          disabled={busy}
        >
          Surprise
        </Button>
      </form>

      {/* Category tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            to="/recipes"
            search={{
              ...(cat === "All" ? {} : { c: cat }),
              ...(q ? { q } : {}),
              ...(usePantry ? { pantry: "1" } : {}),
            }}
            className={`min-h-10 inline-flex items-center rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Discovery controls: Pantry match, Dietary safeguard, Prep Time, Difficulty */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/70 p-3 text-xs">
        <button
          type="button"
          onClick={() => {
            const next = !usePantry;
            setStoredFilters((prev) => ({ ...prev, usePantry: next }));
            void navigate({
              to: "/recipes",
              search: {
                ...(active !== "All" ? { c: active } : {}),
                ...(q ? { q } : {}),
                ...(next ? { pantry: "1" } : {}),
              },
            });
          }}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 font-medium transition-colors ${
            usePantry
              ? "border-[var(--periwinkle)] bg-[var(--periwinkle-soft)] text-foreground"
              : "border-border bg-secondary/70 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Refrigerator className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
          Use my pantry ({pantryNames.length})
        </button>

        {activeRestrictionCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setStoredFilters((prev) => ({ ...prev, respectPrefs: !prev.respectPrefs }))
            }
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 font-medium transition-colors ${
              storedFilters.respectPrefs
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-secondary/70 text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {storedFilters.respectPrefs
              ? `Safe filter on (${activeRestrictionCount})`
              : "Safe filter paused"}
          </button>
        )}

        <select
          aria-label="Filter by max prep time"
          value={storedFilters.maxTime}
          onChange={(e) =>
            setStoredFilters((prev) => ({
              ...prev,
              maxTime: e.target.value as StoredRecipeFilters["maxTime"],
            }))
          }
          className="h-9 rounded-xl border border-border bg-secondary px-2.5 text-xs text-foreground"
        >
          <option value="any">Any time</option>
          <option value="20">Under 20 mins</option>
          <option value="35">Under 35 mins</option>
          <option value="60">Under 60 mins</option>
        </select>

        <select
          aria-label="Filter by difficulty"
          value={storedFilters.difficulty}
          onChange={(e) =>
            setStoredFilters((prev) => ({
              ...prev,
              difficulty: e.target.value as StoredRecipeFilters["difficulty"],
            }))
          }
          className="h-9 rounded-xl border border-border bg-secondary px-2.5 text-xs text-foreground"
        >
          <option value="any">Any skill</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {(q ||
          active !== "All" ||
          storedFilters.maxTime !== "any" ||
          storedFilters.difficulty !== "any" ||
          usePantry) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="ml-auto h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="mt-7">
        {loadingRecipes ? (
          <div className="space-y-5">
            <MiaLoadingCard delayMs={120_000} label="Mia is pulling your recipes together..." />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl bg-secondary" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Recipes couldn&apos;t load right now.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl border-border bg-secondary text-foreground"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : visibleRecipes.length > 0 ? (
          <>
            <div className="cv-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRecipes.map(({ recipe: r, match }, index) => (
                <div key={r.id} className="flex flex-col gap-1.5">
                  <RecipeCard recipe={r} priority={index < 2} />
                  {match && match.totalIngredients > 0 && (
                    <p className="px-1 text-xs text-muted-foreground tabular-nums">
                      Pantry match: {match.matchedCount}/{match.totalIngredients} ingredients (
                      {Math.round(match.matchRatio * 100)}%)
                    </p>
                  )}
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="h-11 rounded-xl border-border bg-card px-6 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  Load more ({filteredRecipes.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No recipes matched your current filters. Try adjusting time, clearing your search, or
              asking the AI Chef above.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl border-border bg-secondary text-foreground"
              onClick={resetAllFilters}
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
