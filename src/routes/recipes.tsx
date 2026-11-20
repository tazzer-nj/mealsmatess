import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import {
  buildRecipeGenerationPrompt,
  searchOrGenerateRecipe,
  toastRecipeGenerationError,
} from "@/lib/recipe-search";
import { recipesByCategoryQuery } from "@/lib/queries";
import { generateRecipe, surpriseMe } from "@/lib/ai.functions";
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

type RecipeSearch = { c?: string; q?: string };

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
    ...recipesByCategoryQuery(active !== "All" ? active : undefined, q),
    enabled: !!user,
  });
  const loadingRecipes = sessionLoading || isLoading;
  const [query, setQuery] = useState(q ?? "");
  useEffect(() => {
    setQuery(q ?? "");
  }, [q]);
  const [busy, setBusy] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 overflow-x-hidden bg-background px-3.5 py-6 text-foreground sm:px-4 sm:py-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Discover recipes</h1>
        <p className="text-sm text-muted-foreground">
          Search our library—if a dish isn&apos;t here yet, Mia will create a recipe for you.
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

      {generatingFor && (
        <div className="mt-5">
          <MiaLoadingCard
            delayMs={0}
            label={`Mia is creating a recipe for "${generatingFor}"...`}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            to="/recipes"
            search={{ ...(cat === "All" ? {} : { c: cat }), ...(q ? { q } : {}) }}
            className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="mt-8">
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
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-5">
            {q && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} for{" "}
                  <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>. Want a
                  fresh custom version?
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((r, index) => (
                <RecipeCard key={r.id} recipe={r} priority={index < 2} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {q
                ? `No saved recipes matched "${q}" yet. Let Mia create it for you!`
                : active !== "All"
                  ? "No recipes matched this filter. Try another category or generate a recipe above."
                  : "Nothing here yet. Try searching or generating a recipe above!"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {q && (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAiGenerate(q)}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {busy && generatingFor ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate &ldquo;{q}&rdquo; recipe
                </Button>
              )}
              {(q || active !== "All") && (
                <Button
                  variant="outline"
                  className="rounded-xl border-border bg-secondary text-foreground"
                  onClick={() => {
                    setQuery("");
                    void navigate({ to: "/recipes", search: {} });
                  }}
                >
                  Show all recipes
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
