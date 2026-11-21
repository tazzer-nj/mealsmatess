import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Clock,
  Users,
  Flame,
  Heart,
  ShoppingCart,
  ChefHat,
  Lightbulb,
  Loader2,
  Image,
  Play,
  Check,
  Share2,
  MessageCircleQuestion,
  Expand,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { recipeBySlugQuery, myFavoritesQuery, myGroceryQuery } from "@/lib/queries";
import { curatedRecipeImageUrl } from "@/lib/recipe-image";
import { waitForFirebaseAuth } from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { usePreferences } from "@/hooks/use-preferences";
import { evaluateRecipeAllergens } from "@/lib/preferences";
import {
  categorizeGroceryItem,
  combineQuantities,
  consolidateIngredients,
  normalizeItemKey,
} from "@/lib/grocery-categorizer";
import { regenerateRecipeImage } from "@/lib/ai.functions";
import { postAuthenticatedAi } from "@/lib/ai-api";
import { trackRecipeView } from "@/lib/engagement.functions";
import { setContinueCooking } from "@/lib/continue-cooking";
// Full-screen step-by-step mode — split out of the initial recipe page bundle.
const CookingMode = lazy(() =>
  import("@/components/cooking-mode").then((m) => ({ default: m.CookingMode })),
);
import { RecipeImage } from "@/components/recipe-image";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { ChangeImageButton, ImageCredit } from "@/components/recipe-image-tools";
import { awardXp } from "@/lib/xp.functions";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubstitutionsButton } from "@/components/substitutions-popover";
import { RecipeRatings } from "@/components/recipe-ratings";

export const Route = createFileRoute("/recipe/$slug")({
  ssr: false,
  loader: async ({ context, params }) => {
    const user = await waitForFirebaseAuth();
    if (!user) return null;
    try {
      const recipe = await context.queryClient.ensureQueryData(recipeBySlugQuery(params.slug));
      if (!recipe) throw notFound();
      return recipe;
    } catch (err) {
      if (err && typeof err === "object" && "isNotFound" in err) throw err;
      return null;
    }
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} | MealMate` },
            {
              name: "description",
              content:
                loaderData.description ||
                `Cook ${loaderData.name} with ingredients and step-by-step instructions from MealMate.`,
            },
            { property: "og:title", content: `${loaderData.name} | MealMate` },
            {
              property: "og:description",
              content:
                loaderData.description ||
                `Cook ${loaderData.name} with ingredients and step-by-step instructions from MealMate.`,
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            ...(loaderData.image_url?.startsWith("https://")
              ? [
                  { property: "og:image", content: loaderData.image_url },
                  { name: "twitter:image", content: loaderData.image_url },
                ]
              : []),
          ],
        }
      : {},
  component: RecipePage,
});

type Ingredient = { name: string; quantity?: string };

function RecipePage() {
  const { slug } = Route.useParams();
  const recipe = Route.useLoaderData();
  const { user, loading: sessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useQuery({
    ...recipeBySlugQuery(slug),
    enabled: !!user,
  });
  const r = data ?? recipe;
  const { isPremium } = usePremium();
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user && isPremium });
  const { data: groceryItems } = useQuery({ ...myGroceryQuery(), enabled: !!user && isPremium });
  const [savingFav, setSavingFav] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [regen, setRegen] = useState(false);
  const [cookingOpen, setCookingOpen] = useState(false);
  const cookingModeEnabled = useFeatureFlag("cooking_mode", true);
  const [makingImage, setMakingImage] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(() => new Set());

  const requestRecipeImage = useCallback(async () => {
    if (!r?.id || !user) return;
    setMakingImage(true);
    try {
      const result = await postAuthenticatedAi<{
        imageUrl: string | null;
        reason?: string;
        limit?: number | null;
        resetsAt?: string | null;
      }>("/api/recipe-image", { recipeId: r.id }, { timeoutMs: 120_000 });
      if (result.imageUrl) {
        await queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] });
      } else if (result.reason === "limit") {
        toast.message("Daily photo allowance reached", {
          description:
            "Try creating this photo again when your allowance resets. Premium includes more.",
        });
      }
    } catch (error) {
      toast.error("Couldn't create a recipe photo", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setMakingImage(false);
    }
  }, [queryClient, r?.id, r?.slug, user]);

  useEffect(() => {
    if (!user || !isPremium || !r?.id || r.image_url || curatedRecipeImageUrl(r)) return;
    void requestRecipeImage();
  }, [user, isPremium, r, requestRecipeImage]);

  async function regenerateImage() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isPremium) {
      toast.error("Upgrade to Premium to regenerate recipe images.");
      navigate({ to: "/premium" });
      return;
    }
    setRegen(true);
    try {
      await regenerateRecipeImage({ data: { slug: r.slug } });
      await queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] });
      toast.success("New image generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setRegen(false);
    }
  }

  useEffect(() => {
    if (!r) return;
    setContinueCooking({
      slug: r.slug,
      name: r.name,
      image_url: r.image_url,
      cooking_time_minutes: r.cooking_time_minutes,
      calories: r.calories,
    });
    if (user && r.id) {
      void trackRecipeView({ data: { recipeId: r.id } }).catch(() => {});
      void import("@/lib/analytics-events")
        .then(({ dispatchAnalyticsEvent }) =>
          dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "recipe_viewed",
            entityId: r.id,
            dedupeKey: `view_${r.id}_${new Date().toISOString().slice(0, 10)}`,
            metadata: { slug: r.slug, name: r.name },
          }),
        )
        .catch(() => undefined);
    }
  }, [r, user]);

  if (!r) {
    if (sessionLoading || isLoading) {
      return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
          <MiaLoadingCard
            delayMs={120_000}
            label="Mia is setting the prep table for this recipe..."
          />
          <div className="h-8 w-40 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-9 w-3/4 animate-pulse rounded-xl bg-muted" />
              <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </main>
      );
    }
    if (isError) {
      return (
        <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this recipe right now. Please try again.
          </p>
          <Button onClick={() => void refetch()} className="mt-4 rounded-xl">
            Try again
          </Button>
        </main>
      );
    }
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-base font-medium text-foreground">Recipe not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This recipe may have been removed or the link may be out of date.
        </p>
        <Button asChild className="mt-4 rounded-xl">
          <Link to="/recipes">Browse recipes</Link>
        </Button>
      </main>
    );
  }

  const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : []) as Ingredient[];
  const steps = (Array.isArray(r.steps) ? r.steps : []) as string[];
  const isFav = favorites?.some((f) => f.recipe_id === r.id) ?? false;
  const allergenCheck = evaluateRecipeAllergens(preferences, {
    name: r.name,
    description: r.description,
    ingredients,
  });

  const stats = [
    r.cooking_time_minutes && { icon: Clock, label: `${r.cooking_time_minutes} min` },
    r.servings && { icon: Users, label: `${r.servings} servings` },
    r.calories && { icon: Flame, label: `${r.calories} kcal` },
    r.difficulty && { icon: ChefHat, label: r.difficulty },
  ].filter(Boolean) as { icon: typeof Clock; label: string }[];

  function toggleIngredient(index: number) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleShare() {
    if (!r) return;
    const url = window.location.href;
    const payload = {
      title: r.name,
      text: r.description || `Check out ${r.name} on MealMate`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Recipe link copied");
      }
    } catch {
      /* cancelled */
    }
  }

  async function toggleFavorite() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isPremium) {
      toast.message("Start your 3-day free trial to save favorite recipes.");
      navigate({ to: "/premium" });
      return;
    }
    setSavingFav(true);
    try {
      if (isFav) {
        await firebaseData.from("favorites").delete().eq("recipe_id", r.id).eq("user_id", user.id);
      } else {
        await firebaseData.from("favorites").insert({ recipe_id: r.id, user_id: user.id });
        void import("@/lib/analytics-events")
          .then(({ dispatchAnalyticsEvent }) =>
            dispatchAnalyticsEvent({
              userId: user.id,
              eventName: "recipe_saved",
              entityId: r.id,
              dedupeKey: `save_${r.id}_${new Date().toISOString().slice(0, 10)}`,
              metadata: { slug: r.slug, name: r.name },
            }),
          )
          .catch(() => undefined);
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Couldn't update favorites");
    } finally {
      setSavingFav(false);
    }
  }

  async function addToGrocery() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isPremium) {
      toast.message("Start your 3-day free trial to build consolidated grocery lists.");
      navigate({ to: "/premium" });
      return;
    }
    if (ingredients.length === 0) return;
    setAddingList(true);
    try {
      const overrides = preferences.shopping?.category_overrides ?? {};
      const consolidated = consolidateIngredients(ingredients, { overrides });
      const existingUnchecked = (groceryItems ?? []).filter((g) => !g.checked);
      const toInsert: {
        user_id: string;
        recipe_id: string;
        name: string;
        quantity: string | null;
        category: string;
      }[] = [];

      for (const ing of consolidated) {
        const key = normalizeItemKey(ing.name).replace(/s$/, "");
        const match = existingUnchecked.find(
          (g) => normalizeItemKey(g.name).replace(/s$/, "") === key,
        );
        const category = categorizeGroceryItem(ing.name, { overrides });
        if (match) {
          const mergedQty = combineQuantities(match.quantity, ing.quantity);
          await firebaseData
            .from("grocery_items")
            .update({ quantity: mergedQty, category })
            .eq("id", match.id);
        } else {
          toInsert.push({
            user_id: user.id,
            recipe_id: r.id,
            name: ing.name,
            quantity: ing.quantity,
            category,
          });
        }
      }

      if (toInsert.length > 0) {
        const { error } = await firebaseData.from("grocery_items").insert(toInsert);
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["grocery"] });
      toast.success("Added to your grocery list", {
        action: { label: "View", onClick: () => navigate({ to: "/list" }) },
      });
    } catch {
      toast.error("Couldn't add to grocery list");
    } finally {
      setAddingList(false);
    }
  }

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/recipes"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to recipes
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleShare()}
            className="h-9 rounded-xl border-border bg-card text-xs text-foreground hover:bg-secondary"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>

        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div>
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card">
              <RecipeImage
                recipe={r}
                size="hero"
                priority
                generating={makingImage}
                className="aspect-square w-full object-cover"
              />
              {r.image_url && (
                <button
                  type="button"
                  onClick={() => setImagePreviewOpen(true)}
                  aria-label={`Preview photo of ${r.name}`}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md transition-colors hover:bg-black"
                >
                  <Expand className="h-3.5 w-3.5" />
                  Preview
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <ImageCredit source={r.image_source} attribution={r.image_attribution} />
              <ChangeImageButton recipe={r} userId={user?.id} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {r.cuisine && <span>{r.cuisine}</span>}
              {r.country && <span>· {r.country}</span>}
              {r.category && <span>· {r.category}</span>}
            </div>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              {r.name}
            </h1>
            {r.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
            )}

            {r.diet_tags && r.diet_tags.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">{r.diet_tags.join(" · ")}</p>
            )}

            {allergenCheck.warningSummary && (
              <div
                role="alert"
                className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
                  !allergenCheck.safe
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                }`}
              >
                {!allergenCheck.safe ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">
                    {!allergenCheck.safe ? "Allergy warning" : "Ingredient verification notice"}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{allergenCheck.warningSummary}</p>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center"
                >
                  <s.icon className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {cookingModeEnabled && steps.length > 0 && (
                <Button
                  onClick={() => setCookingOpen(true)}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start cooking
                </Button>
              )}
              <Button
                onClick={toggleFavorite}
                variant="outline"
                disabled={savingFav}
                className={`rounded-xl border-border ${
                  isFav
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-card text-foreground hover:bg-secondary"
                }`}
              >
                {savingFav ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`mr-2 h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                )}
                {isFav ? "Saved" : "Save"}
              </Button>
              <Button
                onClick={addToGrocery}
                variant="outline"
                disabled={addingList}
                className="rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                {addingList ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                Add to list
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                <Link to="/chat" search={{ q: `Help me cook ${r.name}` }}>
                  <MessageCircleQuestion className="mr-2 h-4 w-4" />
                  Ask Mia
                </Link>
              </Button>
              <Button
                onClick={regenerateImage}
                variant="outline"
                disabled={regen}
                className="rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                {regen ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Image className="mr-2 h-4 w-4" />
                )}
                {isPremium ? "Regenerate image" : "AI image"}
              </Button>
            </div>
          </div>
        </div>

        {(r.protein_g || r.carbs_g || r.fat_g) && (
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-5">
            {[
              { label: "Protein (est.)", value: r.protein_g },
              { label: "Carbs (est.)", value: r.carbs_g },
              { label: "Fat (est.)", value: r.fat_g },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-2xl font-semibold tracking-tight text-foreground">
                  {m.value ?? 0}g
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.5fr]">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-tight text-foreground">Ingredients</h2>
              <span className="text-xs text-muted-foreground">
                {checkedIngredients.size}/{ingredients.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {ingredients.map((ing, i) => {
                const checked = checkedIngredients.has(i);
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 border-b border-border pb-2.5 text-sm last:border-b-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={`Mark ${ing.name} ready`}
                        onClick={() => toggleIngredient(i)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          checked
                            ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-white"
                            : "border-border bg-secondary text-transparent hover:border-foreground/40"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </button>
                      <span
                        className={`truncate ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {ing.name}
                      </span>
                      <SubstitutionsButton ingredient={ing.name} recipeName={r.name} />
                    </div>
                    {ing.quantity && (
                      <span className="shrink-0 text-xs text-muted-foreground">{ing.quantity}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-medium tracking-tight text-foreground">Method</h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {r.fun_fact && (
          <div className="mt-8 flex gap-3 rounded-2xl border border-border bg-card p-5">
            <Lightbulb className="h-5 w-5 shrink-0 text-[var(--periwinkle)]" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Did you know?</strong> {r.fun_fact}
            </p>
          </div>
        )}

        <RecipeRatings recipeId={r.id} />
      </div>
      {cookingOpen && (
        <Suspense fallback={null}>
          <CookingMode
            name={r.name}
            steps={steps}
            onClose={() => setCookingOpen(false)}
            onComplete={async () => {
              if (!user) return;
              try {
                const res = await awardXp({
                  data: { action: "recipe_cooked", entityId: r.id },
                });
                if (res.awarded) {
                  toast.success(`+${res.points} XP: well cooked!`);
                  queryClient.invalidateQueries({ queryKey: ["gamification"] });
                }
              } catch {
                /* XP is best-effort */
              }
            }}
          />
        </Suspense>
      )}
      <Dialog open={imagePreviewOpen && !!r.image_url} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>{r.name}</DialogTitle>
            <DialogDescription>Full-size recipe photo preview</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            <RecipeImage
              recipe={r}
              size="hero"
              priority
              className="max-h-[70vh] w-full object-cover"
            />
          </div>
          <ImageCredit source={r.image_source} attribution={r.image_attribution} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
