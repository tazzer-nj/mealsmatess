import { HubHome } from "@/components/hub/hub-home";
import { loadRecipeSearchImages } from "@/lib/recipe-search-images";
import { RecipeImage } from "@/components/recipe-image";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Camera,
  Heart,
  Loader2,
  User as UserIcon,
  CalendarDays,
  ChevronRight,
  Play,
  HeartPulse,
  ShoppingBasket,
  Refrigerator,
  Sparkles,
  Clock,
  ArrowUpRight,
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
import { Skeleton } from "@/components/ui/skeleton";
import { PlanStatusCard } from "@/components/plan-status-card";
import { XpChip } from "@/components/xp-chip";
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

const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

function FeaturedRecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  priority,
}: {
  recipe: {
    id: string;
    slug: string;
    name: string;
    image_url: string | null;
    image_source?: string | null;
    cooking_time_minutes: number | null;
    difficulty?: string | null;
    diet_tags?: string[] | null;
    cuisine?: string | null;
  };
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  priority?: boolean;
}) {
  const level = recipe.difficulty ? (DIFFICULTY_LEVEL[recipe.difficulty] ?? 1) : 0;
  return (
    <article className="mm-recipe-card">
      <div className="mm-recipe-media">
        <Link to="/recipe/$slug" params={{ slug: recipe.slug }} aria-label={recipe.name}>
          <RecipeImage
            recipe={recipe}
            size="card"
            sizes="200px"
            priority={priority}
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="mm-media-fade" aria-hidden="true" />
        <button
          type="button"
          onClick={() => onToggleFavorite(recipe.id)}
          aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={isFavorite}
          className="mm-fav-btn"
        >
          <Heart className="size-4" strokeWidth={1.7} />
        </button>
        {recipe.cooking_time_minutes ? (
          <span className="mm-pill absolute bottom-2.5 left-2.5">
            <Clock className="size-3" strokeWidth={1.8} />
            {recipe.cooking_time_minutes} min
          </span>
        ) : null}
      </div>
      <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="mt-3 block">
        <h3 className="mm-h3 line-clamp-2">{recipe.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {recipe.cuisine ? <span>{recipe.cuisine}</span> : null}
          {recipe.difficulty ? (
            <span className="inline-flex items-center gap-1.5">
              {recipe.cuisine ? "·" : null}
              {recipe.difficulty}
              <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1 rounded-full"
                    style={{ background: i < level ? "#ffffff" : "#3f3f46" }}
                  />
                ))}
              </span>
            </span>
          ) : null}
        </div>
      </Link>
      {recipe.diet_tags && recipe.diet_tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipe.diet_tags.slice(0, 2).map((tag) => (
            <span key={tag} className="mm-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
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
  const initial = firstName.slice(0, 1).toUpperCase();

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
      toast.info("Sign in to save favourites");
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
    <main className="mm-page">
      <header className="mm-hero-greeting">
        <div className="min-w-0">
          <p className="mm-eyebrow">{greeting()}</p>
          <h1 className="mm-h1 mt-2">Hi {firstName} 👋</h1>
          <p className="mm-lead mt-2">What are you craving today?</p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <XpChip />
          <Link to="/profile" aria-label="Settings and profile" className="mm-avatar">
            {user ? initial : <UserIcon className="size-4" strokeWidth={1.7} />}
          </Link>
        </div>
      </header>

      <form onSubmit={handleSearch} className="mt-7" role="search">
        <div className="mm-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            aria-label="Search recipes and ingredients"
            maxLength={200}
            className="mm-input"
          />
        </div>
      </form>

      <div className="mm-chip-row mt-4" role="navigation" aria-label="Recipe categories">
        {CATEGORY_PILLS.map((c) => (
          <Link key={c.label} to="/recipes" search={c.search} className="mm-chip">
            {c.label}
          </Link>
        ))}
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3" aria-label="Kitchen shortcuts">
        <button
          type="button"
          onClick={handleSurprise}
          disabled={busy !== null}
          className="mm-feature-card mm-feature-card--inverse text-left"
        >
          <span className="grid size-10 place-items-center rounded-full border border-black/15 bg-black/5">
            <Sparkles className="size-[18px]" strokeWidth={1.7} />
          </span>
          <span className="mt-auto">
            <span className="mm-h2 block whitespace-nowrap">Surprise Me</span>
            <span className="mm-meta mt-1 block">A recipe chosen for you.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
            {busy === "surprise" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowUpRight className="size-3.5" />
            )}
            {busy === "surprise" ? "Cooking something up" : "Pick for me"}
          </span>
        </button>

        <Link to="/scan" className="mm-feature-card">
          <span className="grid size-10 place-items-center rounded-full border border-border bg-[#1d1d1d]">
            <Camera className="size-[18px]" strokeWidth={1.7} />
          </span>
          <span className="mt-auto">
            <span className="mm-h2 block">Scan your kitchen</span>
            <span className="mm-meta mt-1 block">Log what you already have.</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
            <Camera className="size-3.5" />
            Open scanner
          </span>
        </Link>
      </section>

      <section className="mm-section" aria-labelledby="featured-heading">
        <div className="mm-section-head">
          <h2 id="featured-heading" className="mm-h2">
            Featured recipes
          </h2>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {trendingLoading ? (
          <div className="mm-recipe-rail">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-[200px] flex-none">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-[#141414]" />
                <Skeleton className="mt-3 h-4 w-4/5 rounded bg-[#141414]" />
                <Skeleton className="mt-2 h-3 w-2/5 rounded bg-[#141414]" />
              </div>
            ))}
          </div>
        ) : trendingError ? (
          <div className="mm-error">
            <p className="mm-body">Recipes are temporarily unavailable.</p>
            <p className="mm-meta">You can still use the planner, pantry and Mia.</p>
          </div>
        ) : trending.length > 0 ? (
          <div className="mm-recipe-rail">
            {trending.map((r, i) => (
              <FeaturedRecipeCard
                key={r.id}
                recipe={r as never}
                isFavorite={favoriteIds.has(r.id)}
                onToggleFavorite={toggleFavorite}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <div className="mm-empty">
            <span className="mm-empty-icon">
              <Sparkles className="size-5" strokeWidth={1.6} />
            </span>
            <h3 className="mm-h3">Nothing cooked yet</h3>
            <p className="mm-meta max-w-[280px]">
              Use Surprise Me to create your first recipe — it will appear here.
            </p>
          </div>
        )}
      </section>

      <section className="mm-section" aria-labelledby="kitchen-heading">
        <div className="mm-section-head">
          <div>
            <h2 id="kitchen-heading" className="mm-h2">
              What's in your kitchen?
            </h2>
            <p className="mm-lead mt-1">Turn your ingredients into something delicious.</p>
          </div>
        </div>
        <div className="mm-stack">
          <Link to="/scan" search={{ mode: "ingredients" }} className="mm-tile">
            <span className="mm-tile-icon">
              <Camera className="size-[17px]" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Scan ingredients</span>
              <span className="mm-meta block">Use your camera to log what you have</span>
            </span>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
          <Link to="/pantry" className="mm-tile">
            <span className="mm-tile-icon">
              <Refrigerator className="size-[17px]" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">View pantry</span>
              <span className="mm-meta block">Everything ready for something delicious</span>
            </span>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
          <Link to="/pantry" className="mm-tile">
            <span className="mm-tile-icon">
              <ShoppingBasket className="size-[17px]" strokeWidth={1.7} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Add ingredients</span>
              <span className="mm-meta block">Keep your pantry current in a few taps</span>
            </span>
            <ChevronRight className="size-4 flex-none text-muted-foreground" />
          </Link>
        </div>
      </section>

      {continueCooking && (
        <section className="mm-section" aria-labelledby="continue-heading">
          <div className="mm-section-head">
            <h2 id="continue-heading" className="mm-h2">
              Continue cooking
            </h2>
          </div>
          <Link
            to="/recipe/$slug"
            params={{ slug: continueCooking.slug }}
            className="mm-tile items-center"
          >
            <span className="size-14 flex-none overflow-hidden rounded-xl bg-[#1a1a1a]">
              <RecipeImage
                recipe={continueCooking}
                size="thumb"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{continueCooking.name}</span>
              <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-[#262626]">
                <span
                  className="block h-full rounded-full bg-white"
                  style={{ width: `${continueCooking.progress}%` }}
                />
              </span>
              <span className="mm-meta mt-1.5 block">
                {continueCooking.progress}% complete
                {continueCooking.cooking_time_minutes
                  ? ` · ${continueCooking.cooking_time_minutes} min`
                  : ""}
              </span>
            </span>
            <span className="grid size-9 flex-none place-items-center rounded-full bg-white text-black">
              <Play className="size-3.5 fill-current" />
            </span>
          </Link>
        </section>
      )}

      <section className="mm-section" aria-labelledby="south-african-heading">
        <div className="mm-section-head">
          <h2 id="south-african-heading" className="mm-h2">
            South African favourites
          </h2>
          <Link
            to="/recipes"
            search={{ c: "South African Favorites" }}
            className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {southAfricanLoading ? (
          <div className="mm-recipe-rail">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="size-[104px] flex-none rounded-2xl bg-[#141414]" />
            ))}
          </div>
        ) : southAfricanError ? (
          <p className="mm-meta">This section is temporarily unavailable.</p>
        ) : southAfrican.length > 0 ? (
          <div className="mm-recipe-rail">
            {southAfrican.map((r) => (
              <Link
                key={r.id}
                to="/recipe/$slug"
                params={{ slug: r.slug }}
                className="w-[104px] flex-none"
              >
                <span className="block aspect-square w-full overflow-hidden rounded-2xl bg-[#1a1a1a]">
                  <RecipeImage recipe={r} size="thumb" className="h-full w-full object-cover" />
                </span>
                <span className="mt-2 line-clamp-2 block text-[12px] leading-snug text-muted-foreground">
                  {r.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mm-empty">
            <span className="mm-empty-icon">
              <ChevronRight className="size-5" strokeWidth={1.6} />
            </span>
            <h3 className="mm-h3">Local classics, waiting</h3>
            <p className="mm-meta max-w-[280px]">
              South African recipes appear here once you generate a few.
            </p>
          </div>
        )}
      </section>

      <section className="mm-section" aria-label="More from MealMate">
        <div className="mm-section-head">
          <h2 className="mm-h2">More from MealMate</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/coach", icon: HeartPulse, label: "Nutrition coach" },
            { to: "/chat", icon: Sparkles, label: "Ask Mia" },
            { to: "/planner", icon: CalendarDays, label: "Meal planner" },
            { to: "/list", icon: ShoppingBasket, label: "Grocery list" },
          ].map((action) => (
            <Link key={action.to} to={action.to} className="mm-tile">
              <span className="mm-tile-icon">
                <action.icon className="size-[17px]" strokeWidth={1.7} />
              </span>
              <span className="text-[13px] font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mm-section">
        <PlanStatusCard />
      </section>

      <section className="mm-section">
        <AdSlot slot="home_feed" />
      </section>
    </main>
  );
}
