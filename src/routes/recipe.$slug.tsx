import { createFileRoute, notFound, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  PackagePlus,
  CalendarPlus,
  FolderPlus,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { recipeBySlugQuery, myFavoritesQuery, trendingRecipesQuery } from "@/lib/queries";
import { curatedRecipeImageUrl, hasUsableStoredImage } from "@/lib/recipe-image";
import { waitForFirebaseAuth } from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { usePreferences } from "@/hooks/use-preferences";
import { useOptionalMia } from "@/hooks/use-mia";
import { evaluateRecipeAllergens } from "@/lib/preferences";
import { regenerateRecipeImage } from "@/lib/ai.functions";
import { postAuthenticatedAi } from "@/lib/ai-api";
import { trackRecipeView } from "@/lib/engagement.functions";
import { setContinueCooking } from "@/lib/continue-cooking";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";
import { pickRelatedRecipes } from "@/lib/mia-companion";
import type { CatalogRecipe } from "@/lib/recipe-catalog";
import {
  createRecipeCollection,
  myCollectionsQuery,
  toggleRecipeInCollection,
} from "@/lib/psychology-storage";
// Full-screen step-by-step mode — split out of the initial recipe page bundle.
const CookingMode = lazy(() =>
  import("@/components/cooking-mode").then((m) => ({ default: m.CookingMode })),
);
import { RecipeImage } from "@/components/recipe-image";
import { ChangeImageButton, ImageCredit } from "@/components/recipe-image-tools";
import { awardXp, unlockStatusAchievement } from "@/lib/xp.functions";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SubstitutionsButton } from "@/components/substitutions-popover";
import { RecipeRatings } from "@/components/recipe-ratings";
import { RecipeCard } from "@/components/recipe-card";
import { MiaCompanionPanel } from "@/components/mia-companion";
import { ShareCardModal } from "@/components/share-card-modal";

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

const PLAN_SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

function parseNumericToken(token: string): number | null {
  const trimmed = token.trim();
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const den = Number(mixed[3]);
    return den ? Number(mixed[1]) + Number(mixed[2]) / den : null;
  }
  const frac = trimmed.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const den = Number(frac[2]);
    return den ? Number(frac[1]) / den : null;
  }
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

function formatScaledAmount(value: number): string {
  if (Math.abs(value - Math.round(value)) < 0.05) return String(Math.round(value));
  return Number(value.toFixed(1)).toString();
}

function scaleQuantity(quantity: string | undefined, factor: number): string | undefined {
  if (!quantity || Math.abs(factor - 1) < 0.01) return quantity;
  return quantity.replace(/\b(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\b/, (match) => {
    const parsed = parseNumericToken(match);
    if (parsed === null) return match;
    return formatScaledAmount(parsed * factor);
  });
}

function getTimeBreakdown(recipe: {
  cooking_time_minutes?: number | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
}) {
  const explicitPrep =
    typeof recipe.prep_time_minutes === "number" && recipe.prep_time_minutes > 0
      ? recipe.prep_time_minutes
      : null;
  const explicitCook =
    typeof recipe.cook_time_minutes === "number" && recipe.cook_time_minutes > 0
      ? recipe.cook_time_minutes
      : null;
  const total =
    typeof recipe.cooking_time_minutes === "number" && recipe.cooking_time_minutes > 0
      ? recipe.cooking_time_minutes
      : explicitPrep !== null || explicitCook !== null
        ? (explicitPrep ?? 0) + (explicitCook ?? 0)
        : null;
  if (!total) return null;
  if (explicitPrep !== null && explicitCook !== null) {
    return { prep: explicitPrep, cook: explicitCook, total };
  }
  if (total <= 10) {
    return { prep: total, cook: 0, total };
  }
  const prep = Math.max(5, Math.min(total - 5, Math.round((total * 0.3) / 5) * 5));
  return { prep, cook: Math.max(0, total - prep), total };
}

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
  const { preferences, hasPreferences } = usePreferences();
  const mia = useOptionalMia();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const { data: collections = [] } = useQuery({ ...myCollectionsQuery(), enabled: !!user });
  const { data: catalogRecipes = [] } = useQuery({
    ...trendingRecipesQuery(),
    enabled: !!user,
  });
  const [savingFav, setSavingFav] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [addingPantry, setAddingPantry] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [planDate, setPlanDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [planMealType, setPlanMealType] = useState<(typeof PLAN_SLOTS)[number]>("Dinner");
  const [savingPlanner, setSavingPlanner] = useState(false);
  const [regen, setRegen] = useState(false);
  const [cookingOpen, setCookingOpen] = useState(false);
  const cookingModeEnabled = useFeatureFlag("cooking_mode", true);
  const [makingImage, setMakingImage] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(() => new Set());
  const attemptedImageIdsRef = useRef<Set<string>>(new Set());
  const baseServings = r?.servings && r.servings > 0 ? r.servings : 2;
  const [targetServings, setTargetServings] = useState<number>(baseServings);

  useEffect(() => {
    setTargetServings(r?.servings && r.servings > 0 ? r.servings : 2);
    setCheckedIngredients(new Set());
  }, [r?.id, r?.servings]);

  const requestRecipeImage = useCallback(
    async (silent = false) => {
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
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] }),
            queryClient.invalidateQueries({ queryKey: ["recipes"] }),
          ]);
        } else if (result.reason === "limit" && !silent) {
          toast.message("Daily photo allowance reached", {
            description:
              "Try creating this photo again when your allowance resets. Premium includes more.",
          });
        }
      } catch (error) {
        if (!silent) {
          toast.error("Couldn't create a recipe photo", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
      } finally {
        setMakingImage(false);
      }
    },
    [queryClient, r?.id, r?.slug, user],
  );

  useEffect(() => {
    if (!user || !r?.id) return;
    if (hasUsableStoredImage(r) || curatedRecipeImageUrl(r)) return;
    if (attemptedImageIdsRef.current.has(r.id)) return;
    attemptedImageIdsRef.current.add(r.id);
    void requestRecipeImage(true);
  }, [user, r, requestRecipeImage]);

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] }),
        queryClient.invalidateQueries({ queryKey: ["recipes"] }),
      ]);
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
      void dispatchAnalyticsEvent({
        userId: user.id,
        eventName: "recipe_viewed",
        dedupeKey: `view_${r.id}_${new Date().toISOString().slice(0, 10)}`,
        entityId: r.id,
      });
      try {
        const firstKey = `mealmate.first_recipe_viewed.${user.id}`;
        if (!window.localStorage.getItem(firstKey)) {
          window.localStorage.setItem(firstKey, new Date().toISOString());
          void dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "first_recipe_viewed",
            dedupeKey: `first_recipe_${user.id}`,
            entityId: r.id,
          });
        }
      } catch {
        // Ignore storage error
      }
    }
  }, [r, user]);

  if (!r) {
    if (sessionLoading || isLoading) {
      return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
          <div className="skeleton-shimmer h-8 w-40 rounded-xl" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="skeleton-shimmer aspect-square w-full rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton-shimmer h-9 w-3/4 rounded-xl" />
              <div className="skeleton-shimmer h-20 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="skeleton-shimmer h-16 rounded-xl" />
                ))}
              </div>
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
  const servingFactor = baseServings > 0 ? targetServings / baseServings : 1;
  const scaledIngredients = ingredients.map((ing) => ({
    ...ing,
    quantity: scaleQuantity(ing.quantity, servingFactor),
  }));
  const timeInfo = getTimeBreakdown(r);
  const allergenEval = evaluateRecipeAllergens(hasPreferences ? preferences : null, r);

  const stats = [
    timeInfo && {
      icon: Clock,
      label: `${timeInfo.total} min total`,
      sub:
        timeInfo.cook > 0
          ? `Prep ${timeInfo.prep}m · Cook ${timeInfo.cook}m`
          : `Prep ${timeInfo.prep}m`,
    },
    {
      icon: Users,
      label: `${targetServings} servings`,
      sub: targetServings !== baseServings ? `Base ${baseServings}` : undefined,
    },
    r.calories && { icon: Flame, label: `${r.calories} kcal`, sub: "per serving" },
    r.difficulty && { icon: ChefHat, label: r.difficulty, sub: "difficulty" },
  ].filter(Boolean) as { icon: typeof Clock; label: string; sub?: string }[];

  const relatedRecipes = pickRelatedRecipes(
    r as unknown as CatalogRecipe,
    catalogRecipes as CatalogRecipe[],
    hasPreferences ? preferences : null,
    4,
  );

  function toggleIngredient(index: number) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleShare() {
    if (!r) return;
    setShareModalOpen(true);
  }

  async function toggleFavorite() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    setSavingFav(true);
    try {
      if (isFav) {
        const { error } = await firebaseData
          .from("favorites")
          .delete()
          .eq("recipe_id", r.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await firebaseData
          .from("favorites")
          .insert({ recipe_id: r.id, user_id: user.id });
        if (error) throw error;
        mia?.reactToAction("recipe_saved", { recipeName: r.name });
        void dispatchAnalyticsEvent({
          userId: user.id,
          eventName: "recipe_saved",
          entityId: r.id,
        });
        void unlockStatusAchievement({ data: { code: "recipe_collector" } }).catch(() => {});
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Couldn't update favorites");
    } finally {
      setSavingFav(false);
    }
  }

  async function handleToggleCollection(colId: string) {
    if (!user || !r) return;
    const target = collections.find((c) => c.id === colId);
    if (!target) return;
    setSavingCollection(true);
    try {
      const updated = await toggleRecipeInCollection(target, r.id);
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      const added = updated.recipe_ids.includes(r.id);
      toast.success(added ? `Added to "${updated.name}"` : `Removed from "${updated.name}"`);
      if (added) {
        mia?.reactToAction("recipe_saved", { recipeName: r.name });
        void unlockStatusAchievement({ data: { code: "recipe_collector" } }).catch(() => {});
      }
    } catch {
      toast.error("Could not update collection");
    } finally {
      setSavingCollection(false);
    }
  }

  async function handleCreateCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !r || !newCollectionName.trim()) return;
    setSavingCollection(true);
    try {
      const created = await createRecipeCollection({
        name: newCollectionName.trim(),
        initialRecipeId: r.id,
      });
      setNewCollectionName("");
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success(`Created "${created.name}" and added ${r.name}`);
      mia?.reactToAction("collection_created", { collectionName: created.name });
      void dispatchAnalyticsEvent({
        userId: user.id,
        eventName: "collection_created",
        entityId: created.id,
      });
      void awardXp({ data: { action: "collection_created", entityId: created.id } }).catch(
        () => {},
      );
      void unlockStatusAchievement({ data: { code: "recipe_collector" } }).catch(() => {});
    } catch {
      toast.error("Could not create collection");
    } finally {
      setSavingCollection(false);
    }
  }

  async function addToGrocery() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    if (ingredients.length === 0) return;
    setAddingList(true);
    try {
      const rows = scaledIngredients.map((ing) => ({
        user_id: user.id,
        name: ing.name,
        ...(ing.quantity?.trim() ? { quantity: ing.quantity.trim() } : {}),
      }));
      const { error } = await firebaseData.from("grocery_items").insert(rows);
      if (error) throw error;
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

  async function addToPantry() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    if (scaledIngredients.length === 0) return;
    setAddingPantry(true);
    try {
      const rows = scaledIngredients.map((ing) => ({
        user_id: user.id,
        name: ing.name,
        ...(ing.quantity?.trim() ? { quantity: ing.quantity.trim() } : {}),
        source: "recipe",
      }));
      const { error } = await firebaseData.from("pantry_items").insert(rows);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["pantry"] });
      toast.success(`Added ${rows.length} ingredients to your pantry`, {
        action: { label: "View pantry", onClick: () => navigate({ to: "/pantry" }) },
      });
    } catch {
      toast.error("Couldn't add ingredients to pantry");
    } finally {
      setAddingPantry(false);
    }
  }

  async function addToPlanner() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    setSavingPlanner(true);
    try {
      const { error } = await firebaseData.from("meal_plans").insert({
        user_id: user.id,
        plan_date: planDate,
        meal_type: planMealType,
        recipe_id: r.id,
        custom_name: r.name,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["planner"] });
      setPlannerOpen(false);
      toast.success(`Scheduled ${r.name} for ${planMealType}`, {
        action: { label: "Open planner", onClick: () => navigate({ to: "/planner" }) },
      });
    } catch {
      toast.error("Couldn't add recipe to meal planner");
    } finally {
      setSavingPlanner(false);
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
                  className="absolute bottom-3 right-3 flex min-h-11 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-4 text-xs font-medium text-white shadow-md backdrop-blur-md transition-colors hover:bg-black"
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
              <div className="mt-4 flex flex-wrap gap-2">
                {r.diet_tags.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {!allergenEval.safe && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">
                    Allergen alert: {allergenEval.matchedAllergens.join(", ")}
                  </p>
                  <p className="mt-0.5 opacity-90">
                    Ingredients detected that match your saved allergies. Review or substitute
                    before cooking.
                  </p>
                </div>
              </div>
            )}

            {allergenEval.safe && allergenEval.uncertainIngredients.length > 0 && (
              <div
                role="note"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Check ingredient labels</p>
                  <p className="mt-0.5 opacity-90">
                    Compound items ({allergenEval.uncertainIngredients.join(", ")}) can vary by
                    brand.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-3 text-center"
                >
                  <s.icon className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-medium tabular-nums text-foreground">
                    {s.label}
                  </span>
                  {s.sub && (
                    <span className="text-[10px] leading-tight text-muted-foreground">{s.sub}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {cookingModeEnabled && steps.length > 0 && (
                <Button
                  onClick={() => setCookingOpen(true)}
                  className="min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start cooking
                </Button>
              )}
              <Button
                onClick={toggleFavorite}
                variant="outline"
                disabled={savingFav}
                className={`min-h-11 rounded-xl border-border ${
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
                type="button"
                variant="outline"
                onClick={() => {
                  if (!user) {
                    navigate({ to: "/auth" });
                    return;
                  }
                  setCollectionOpen(true);
                }}
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Collect
              </Button>
              <Button
                onClick={addToGrocery}
                variant="outline"
                disabled={addingList}
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                {addingList ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                Add to list
              </Button>
              <Button
                onClick={addToPantry}
                variant="outline"
                disabled={addingPantry}
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                {addingPantry ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PackagePlus className="mr-2 h-4 w-4" />
                )}
                Add to pantry
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPlannerOpen(true)}
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add to planner
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
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
                className="min-h-11 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
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
                <div className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                  {m.value ?? 0}g
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.5fr]">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium tracking-tight text-foreground">Ingredients</h2>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {checkedIngredients.size}/{scaledIngredients.length} ready
                </span>
              </div>
              <div
                aria-label="Adjust servings"
                className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary p-1"
              >
                <button
                  type="button"
                  aria-label="Decrease servings"
                  disabled={targetServings <= 1}
                  onClick={() => setTargetServings((s) => Math.max(1, s - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-card disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[68px] text-center text-xs font-medium tabular-nums text-foreground">
                  {targetServings} {targetServings === 1 ? "serving" : "servings"}
                </span>
                <button
                  type="button"
                  aria-label="Increase servings"
                  disabled={targetServings >= 24}
                  onClick={() => setTargetServings((s) => Math.min(24, s + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-card disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-1">
              {scaledIngredients.map((ing, i) => {
                const checked = checkedIngredients.has(i);
                return (
                  <li
                    key={i}
                    className="flex min-h-[44px] items-center justify-between gap-2 border-b border-border py-1 text-sm last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={`Mark ${ing.name} ready`}
                        onClick={() => toggleIngredient(i)}
                        className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-secondary/60"
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                            checked
                              ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-white"
                              : "border-border bg-secondary text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      </button>
                      <span
                        className={`truncate ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {ing.name}
                      </span>
                      <SubstitutionsButton ingredient={ing.name} recipeName={r.name} />
                    </div>
                    {ing.quantity && (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {ing.quantity}
                      </span>
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
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-semibold tabular-nums text-primary-foreground">
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

        <div className="mt-8">
          <MiaCompanionPanel
            mood="happy"
            headline={`Cooking ${r.name} together`}
            message={
              steps.length > 0
                ? "Tap Start cooking for step-by-step timers, or ask me for ingredient swaps and pan tips anytime."
                : "Ask me for substitutions, side dishes, or prep shortcuts for this recipe."
            }
            primaryAction={
              cookingModeEnabled && steps.length > 0
                ? { label: "Start guided cooking", onClick: () => setCookingOpen(true) }
                : undefined
            }
            secondaryAction={{ label: "Ask Mia", to: `/chat` }}
          />
        </div>

        <RecipeRatings recipeId={r.id} />

        {relatedRecipes.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl">Related recipes</h2>
                <p className="text-xs text-muted-foreground">
                  Safe matches from the MealMate kitchen tuned to your taste
                </p>
              </div>
              <Link to="/recipes" className="text-sm font-medium text-primary hover:underline">
                Browse all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedRecipes.map((rel) => (
                <RecipeCard
                  key={rel.id}
                  recipe={rel}
                  isFavorite={favorites?.some((f) => f.recipe_id === rel.id)}
                />
              ))}
            </div>
          </section>
        )}
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
      <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Add to Meal Planner</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Schedule {r.name} onto your weekly meal plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor="planDateInput">
                Day
              </label>
              <input
                id="planDateInput"
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm text-foreground"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Meal slot</span>
              <Select
                value={planMealType}
                onValueChange={(v) => setPlanMealType(v as (typeof PLAN_SLOTS)[number])}
              >
                <SelectTrigger className="mt-1.5 h-11 w-full rounded-xl border-border bg-secondary text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  {PLAN_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPlannerOpen(false)}
              className="rounded-xl text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savingPlanner || !planDate}
              onClick={() => void addToPlanner()}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingPlanner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save to planner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Save to collection</DialogTitle>
            <DialogDescription>
              Organise {r.name} into your personal MealMate collections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {collections.length > 0 ? (
              <ul className="space-y-2">
                {collections.map((col) => {
                  const included = col.recipe_ids.includes(r.id);
                  return (
                    <li key={col.id}>
                      <button
                        type="button"
                        disabled={savingCollection}
                        onClick={() => void handleToggleCollection(col.id)}
                        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-left text-sm transition-colors hover:bg-secondary"
                      >
                        <span className="font-medium text-foreground">{col.name}</span>
                        <span className="text-xs font-medium text-primary">
                          {included ? "Saved ✓" : "Add"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Create your first collection below to organise recipes your way.
              </p>
            )}
            <form onSubmit={handleCreateCollection} className="flex gap-2 pt-2">
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g. Weeknight 20-Min, Sunday Braai"
                maxLength={80}
                className="min-h-11 flex-1 rounded-xl"
              />
              <Button
                type="submit"
                disabled={savingCollection || !newCollectionName.trim()}
                className="min-h-11 rounded-xl"
              >
                Create
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ShareCardModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        payload={{
          kind: "recipe",
          title: r.name,
          subtitle: r.description,
          meta: [
            r.cuisine || r.category || "MealMate",
            r.cooking_time_minutes ? `${r.cooking_time_minutes} min` : "",
            r.difficulty || "",
            r.calories ? `${r.calories} kcal` : "",
          ].filter(Boolean),
          shareUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }}
      />
    </main>
  );
}
