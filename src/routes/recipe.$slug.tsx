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
  Image as ImageIcon,
  Play,
  Check,
  Share2,
  MessageCircle,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { recipeBySlugQuery, myFavoritesQuery } from "@/lib/queries";
import { waitForFirebaseAuth } from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { regenerateRecipeImage } from "@/lib/ai.functions";
import { postAuthenticatedAi } from "@/lib/ai-api";
import { trackRecipeView } from "@/lib/engagement.functions";
import { setContinueCooking } from "@/lib/continue-cooking";
// Full-screen step-by-step mode — split out of the initial recipe page bundle.
const CookingMode = lazy(() =>
  import("@/components/cooking-mode").then((m) => ({ default: m.CookingMode })),
);
import { RecipeImage } from "@/components/recipe-image";
import { ChangeImageButton, ImageCredit } from "@/components/recipe-image-tools";
import { awardXp } from "@/lib/xp.functions";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Button } from "@/components/ui/button";
import { SubstitutionsButton } from "@/components/substitutions-popover";
import { RecipeRatings } from "@/components/recipe-ratings";

export const Route = createFileRoute("/recipe/$slug")({
  ssr: false,
  loader: async ({ context, params }) => {
    const user = await waitForFirebaseAuth();
    if (!user) return null;
    const recipe = await context.queryClient.ensureQueryData(recipeBySlugQuery(params.slug));
    if (!recipe) throw notFound();
    return recipe;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} — MealMate` },
            {
              name: "description",
              content:
                loaderData.description ||
                `Cook ${loaderData.name} with ingredients and step-by-step instructions from MealMate.`,
            },
            { property: "og:title", content: `${loaderData.name} — MealMate` },
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
  const { user } = useSession();
  const { data } = useQuery({ ...recipeBySlugQuery(slug), enabled: !!user });
  const r = data ?? recipe;
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: favorites } = useQuery({ ...myFavoritesQuery(), enabled: !!user });
  const [savingFav, setSavingFav] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [regen, setRegen] = useState(false);
  const [cookingOpen, setCookingOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const cookingModeEnabled = useFeatureFlag("cooking_mode", true);
  const [makingImage, setMakingImage] = useState(false);

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
    if (!user || !r?.id || r.image_url) return;
    void requestRecipeImage();
  }, [user, r?.id, r?.image_url, requestRecipeImage]);

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
    }
  }, [r, user]);

  if (!r) return null;

  const ingredients = (Array.isArray(r.ingredients) ? r.ingredients : []) as Ingredient[];
  const steps = (Array.isArray(r.steps) ? r.steps : []) as string[];
  const isFav = favorites?.some((f) => f.recipe_id === r.id) ?? false;
  const prepMinutes = (r as { prep_time_minutes?: number | null }).prep_time_minutes ?? null;

  const stats = [
    r.cooking_time_minutes && {
      icon: Clock,
      label: "Cooking",
      value: `${r.cooking_time_minutes} min`,
    },
    prepMinutes && { icon: Timer, label: "Preparation", value: `${prepMinutes} min` },
    r.servings && { icon: Users, label: "Serves", value: `${r.servings}` },
    r.difficulty && { icon: ChefHat, label: "Difficulty", value: r.difficulty },
    r.calories && { icon: Flame, label: "Energy", value: `${r.calories} kcal` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  async function toggleFavorite() {
    if (!user || !r) {
      navigate({ to: "/auth" });
      return;
    }
    setSavingFav(true);
    try {
      if (isFav) {
        await firebaseData.from("favorites").delete().eq("recipe_id", r.id).eq("user_id", user.id);
      } else {
        await firebaseData.from("favorites").insert({ recipe_id: r.id, user_id: user.id });
      }
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
    } catch {
      toast.error("Couldn't update favourites");
    } finally {
      setSavingFav(false);
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
      const rows = ingredients.map((ing) => ({
        user_id: user.id,
        recipe_id: r.id,
        name: ing.name,
        quantity: ing.quantity ?? null,
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

  async function shareRecipe() {
    if (!r) return;
    const url = `${window.location.origin}/recipe/${r.slug}`;
    const data = {
      title: r.name,
      text: r.description ?? `Cook ${r.name} with MealMate.`,
      url,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Recipe link copied");
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <main className="mm-page mm-page--wide">
      <Link
        to="/recipes"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.8} />
        All recipes
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <div className="recipe-hero">
            <RecipeImage
              recipe={r}
              size="hero"
              priority
              generating={makingImage}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <ImageCredit source={r.image_source} attribution={r.image_attribution} />
            <ChangeImageButton recipe={r} userId={user?.id} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {r.cuisine ? <span>{r.cuisine}</span> : null}
            {r.category ? <span>· {r.category}</span> : null}
          </div>
          <h1 className="mm-h1 mt-3">{r.name}</h1>
          {r.description ? <p className="mm-lead mt-3">{r.description}</p> : null}

          {r.diet_tags && r.diet_tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {r.diet_tags.map((t: string) => (
                <span key={t} className="mm-tag">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="recipe-stat">
                <s.icon strokeWidth={1.7} aria-hidden="true" />
                <span className="mm-meta">{s.label}</span>
                <span className="text-[13px] font-medium leading-tight">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => void toggleFavorite()} disabled={savingFav}>
              {savingFav ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Heart className={isFav ? "fill-current" : ""} />
              )}
              {isFav ? "Saved" : "Save recipe"}
            </Button>
            <Button variant="secondary" onClick={() => void addToGrocery()} disabled={addingList}>
              {addingList ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              Add to list
            </Button>
            <Button asChild variant="secondary">
              <Link to="/chat" search={{ q: `How do I cook ${r.name}?` }}>
                <MessageCircle />
                Ask Mia
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => void shareRecipe()}>
              <Share2 />
              Share
            </Button>
          </div>

          {cookingModeEnabled && steps.length > 0 ? (
            <Button
              className="mt-3 w-full"
              variant="secondary"
              onClick={() => setCookingOpen(true)}
            >
              <Play />
              Start cooking mode
            </Button>
          ) : null}

          {!isPremium ? (
            <button
              type="button"
              onClick={() => void regenerateImage()}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ImageIcon className="size-3.5" />
              New AI photo with Premium
            </button>
          ) : null}
        </div>
      </div>

      {(r.protein_g || r.carbs_g || r.fat_g) && (
        <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-[#1e1e1e] bg-[#111111] p-4">
          {[
            { label: "Protein", value: r.protein_g },
            { label: "Carbs", value: r.carbs_g },
            { label: "Fat", value: r.fat_g },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-xl font-medium tracking-[-0.02em]">{m.value ?? "–"}g</div>
              <div className="mm-meta mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
        <section aria-labelledby="ingredients-heading">
          <h2 id="ingredients-heading" className="mm-h2">
            Ingredients
          </h2>
          <p className="mm-meta mt-1">Tap an ingredient to tick it off while you cook.</p>
          <ul className="mt-3">
            {ingredients.map((ing, i) => {
              const isChecked = checked.has(i);
              return (
                <li
                  key={`${ing.name}-${i}`}
                  className="ing-row"
                  data-checked={isChecked}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onClick={() =>
                    setChecked((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).click();
                    }
                  }}
                >
                  <span className="ing-check" aria-hidden="true">
                    <Check className="size-3.5" strokeWidth={2.4} />
                  </span>
                  <span className="ing-name flex-1">
                    {ing.name}
                    <SubstitutionsButton ingredient={ing.name} recipeName={r.name} />
                  </span>
                  {ing.quantity ? (
                    <span className="flex-none text-[13px] text-muted-foreground">
                      {ing.quantity}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="method-heading">
          <h2 id="method-heading" className="mm-h2">
            Instructions
          </h2>
          <p className="mm-meta mt-1">
            {steps.length} step{steps.length === 1 ? "" : "s"}
            {r.cooking_time_minutes ? ` · about ${r.cooking_time_minutes} minutes` : ""}
          </p>
          <ol className="mt-2">
            {steps.map((step, i) => (
              <li key={i} className="step-row">
                <span className="step-index">{i + 1}</span>
                <p className="step-text">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {r.fun_fact ? (
        <div className="mt-8 flex gap-3 rounded-2xl border border-[#1e1e1e] bg-[#111111] p-5">
          <Lightbulb className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.7} />
          <p className="mm-body">
            <strong className="font-medium text-foreground">Did you know?</strong> {r.fun_fact}
          </p>
        </div>
      ) : null}

      <RecipeRatings recipeId={r.id} />

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
                  toast.success(`+${res.points} XP — well cooked!`);
                  queryClient.invalidateQueries({ queryKey: ["gamification"] });
                }
              } catch {
                /* XP is best-effort */
              }
            }}
          />
        </Suspense>
      )}
    </main>
  );
}
