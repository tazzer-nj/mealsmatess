import { HubHome } from "@/components/hub/hub-home";
import { loadRecipeSearchImages } from "@/lib/recipe-search-images";
import { RecipeImage } from "@/components/recipe-image";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ArrowRight,
  Camera,
  Loader2,
  UserRound,
  MessageCircleQuestion,
  Calendar,
  ChevronRight,
  Play,
  Sparkles,
  Clock,
  Refrigerator,
  Plus,
  Heart,
  Flame,
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
import { ThemeToggle } from "@/components/theme-toggle";
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

type RecipeExtra = RecipeRecord & {
  difficulty?: string | null;
  diet_tags?: string[] | null;
};

function FeaturedRecipe({
  recipe,
  isFavorite,
  onToggleFavorite,
  priority,
}: {
  recipe: RecipeRecord;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  priority?: boolean;
}) {
  const r = recipe as RecipeExtra;
  const tags = Array.isArray(r.diet_tags) ? r.diet_tags.slice(0, 2) : [];
  return (
    <div className="group relative w-[264px] flex-shrink-0">
      <Link to="/recipe/$slug" params={{ slug: r.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-[#1E1E1E] bg-[#141414]">
          <RecipeImage
            recipe={r}
            size="card"
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
          {r.cooking_time_minutes ? (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Clock size={12} aria-hidden="true" />
              {r.cooking_time_minutes} min
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white">
          {r.name}
        </h3>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(r.id)}
        aria-label={isFavorite ? `Remove ${r.name} from favourites` : `Save ${r.name}`}
        aria-pressed={isFavorite}
        className="absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
      >
        <Heart size={16} className={isFavorite ? "fill-white" : ""} aria-hidden="true" />
      </button>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#71717A]">
        {r.difficulty ? <span className="capitalize">{r.difficulty}</span> : null}
        {r.difficulty && tags.length ? <span aria-hidden>·</span> : null}
        {tags.map((t) => (
          <span key={t} className="text-[#A1A1AA]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function RailSkeleton({ count, className }: { count: number; className?: string }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`mm-skeleton flex-shrink-0 ${className ?? ""}`} />
      ))}
    </div>
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    const term = query.trim();
    await navigate({ to: "/recipes", search: { q: term } });
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
    <main className="flex-1 pb-6">
      <div className="mx-auto w-full max-w-[1120px] px-5 pt-8 lg:px-8 lg:pt-12">
        {/* Header */}
        <header className="mm-fade-up flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mm-eyebrow">{greeting()}</p>
            <h1 className="mm-h1 mt-2 flex items-center gap-2">
              Hi {firstName}
              <span aria-hidden className="text-[0.9em]">
                👋
              </span>
            </h1>
            <p className="mm-body mt-1.5">What are you craving today?</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="hidden sm:flex">
              <XpChip />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              to="/profile"
              aria-label="Profile and settings"
              className="flex size-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1c1c1c]"
            >
              <UserRound size={18} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Search */}
        <form onSubmit={handleSearch} className="mm-search mm-fade-up mt-7">
          <Search className="mm-search-icon" size={18} strokeWidth={1.9} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, ingredients..."
            aria-label="Search recipes and ingredients"
            maxLength={200}
            className="mm-input"
          />
          <button type="submit" disabled={busy !== null} className="mm-search-action" aria-label="Search">
            {busy === "search" ? (
              <Loader2 className="animate-spin" size={17} aria-hidden="true" />
            ) : (
              <ArrowRight size={17} aria-hidden="true" />
            )}
          </button>
        </form>

        {/* Categories */}
        <div className="mm-chip-row mt-5" role="navigation" aria-label="Recipe categories">
          {CATEGORY_PILLS.map((c) => (
            <Link key={c.label} to="/recipes" search={c.search} className="mm-chip">
              {c.label}
            </Link>
          ))}
          <Link to="/recipes" className="mm-chip">
            More
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0">
            {/* Featured recipes */}
            <section aria-labelledby="featured-heading">
              <div className="mm-section-head">
                <h2 id="featured-heading" className="mm-h2">
                  Featured recipes
                </h2>
                <Link
                  to="/recipes"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white"
                >
                  View all <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {trendingLoading ? (
                <RailSkeleton count={3} className="h-[198px] w-[264px] rounded-[16px]" />
              ) : trendingError ? (
                <div className="mm-empty">
                  <span className="mm-empty-icon">
                    <Flame size={20} aria-hidden="true" />
                  </span>
                  <p className="text-[14px] font-medium text-white">Recipes are unavailable</p>
                  <p className="mm-sub max-w-xs">
                    We couldn't load recipes right now. The rest of MealMate still works.
                  </p>
                </div>
              ) : trending.length > 0 ? (
                <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
                  {trending.map((r, i) => (
                    <FeaturedRecipe
                      key={r.id}
                      recipe={r}
                      isFavorite={favoriteIds.has(r.id)}
                      onToggleFavorite={toggleFavorite}
                      priority={i < 2}
                    />
                  ))}
                </div>
              ) : (
                <div className="mm-empty">
                  <span className="mm-empty-icon">
                    <Sparkles size={20} aria-hidden="true" />
                  </span>
                  <p className="text-[14px] font-medium text-white">No recipes yet</p>
                  <p className="mm-sub max-w-xs">
                    Let Mia create something for you — start with Surprise Me.
                  </p>
                </div>
              )}
            </section>

            {/* South African favourites */}
            <section aria-labelledby="sa-heading" className="mt-10">
              <div className="mm-section-head">
                <h2 id="sa-heading" className="mm-h2">
                  South African favourites
                </h2>
                <Link
                  to="/recipes"
                  search={{ c: "South African Favorites" }}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white"
                >
                  View all <ChevronRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {southAfricanLoading ? (
                <RailSkeleton count={5} className="size-[104px] rounded-[14px]" />
              ) : southAfricanError ? (
                <p className="mm-sub">This section is temporarily unavailable.</p>
              ) : southAfrican && southAfrican.length > 0 ? (
                <div className="no-scrollbar -mx-5 flex gap-3.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
                  {southAfrican.map((r) => (
                    <Link
                      key={r.id}
                      to="/recipe/$slug"
                      params={{ slug: r.slug }}
                      className="group w-[104px] flex-shrink-0"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-[14px] border border-[#1E1E1E] bg-[#141414]">
                        <RecipeImage
                          recipe={r}
                          size="thumb"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-snug text-white">
                        {r.name}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mm-sub">
                  South African recipes will appear here once you generate a few.
                </p>
              )}
            </section>

            {/* Continue cooking */}
            {continueCooking && (
              <section aria-labelledby="continue-heading" className="mt-10">
                <div className="mm-section-head">
                  <h2 id="continue-heading" className="mm-h2">
                    Continue cooking
                  </h2>
                </div>
                <Link
                  to="/recipe/$slug"
                  params={{ slug: continueCooking.slug }}
                  className="mm-card mm-card-hover flex items-center gap-4 p-3"
                >
                  <div className="size-16 flex-shrink-0 overflow-hidden rounded-[12px] bg-[#171717]">
                    <RecipeImage
                      recipe={continueCooking}
                      size="thumb"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-white">
                      {continueCooking.name}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#222222]">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${continueCooking.progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[#71717A]">
                      <span>{continueCooking.progress}% complete</span>
                      {continueCooking.cooking_time_minutes && (
                        <span>{continueCooking.cooking_time_minutes} min</span>
                      )}
                      {continueCooking.calories && <span>{continueCooking.calories} cal</span>}
                    </div>
                  </div>
                  <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#080808]">
                    <Play size={14} className="fill-current" aria-hidden="true" />
                  </span>
                </Link>
              </section>
            )}
          </div>

          {/* Side column: kitchen + surprise */}
          <div className="flex flex-col gap-4">
            {/* Kitchen */}
            <section aria-labelledby="kitchen-heading" className="mm-card mm-pad">
              <h2 id="kitchen-heading" className="mm-h3 text-white">
                What's in your kitchen?
              </h2>
              <p className="mm-sub mt-1.5">Turn your ingredients into something delicious.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/scan"
                  className="mm-btn mm-btn-secondary mm-btn-block justify-start px-4"
                >
                  <Camera size={17} aria-hidden="true" />
                  Scan ingredients
                </Link>
                <Link
                  to="/pantry"
                  className="mm-btn mm-btn-secondary mm-btn-block justify-start px-4"
                >
                  <Plus size={17} aria-hidden="true" />
                  Add ingredients
                </Link>
                <Link
                  to="/pantry"
                  className="mm-btn mm-btn-ghost mm-btn-block justify-start px-4 text-[14px]"
                >
                  <Refrigerator size={17} aria-hidden="true" />
                  View pantry
                </Link>
              </div>
            </section>

            {/* Surprise me */}
            <section className="relative overflow-hidden rounded-[20px] border border-[#262626] bg-[#141414] p-5">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/[0.06] blur-2xl"
              />
              <p className="mm-eyebrow relative">Mia's pick</p>
              <h2 className="mm-h2 relative mt-2 text-white">Surprise Me</h2>
              <p className="mm-sub relative mt-1.5">
                One tap and Mia finds a recipe that fits your taste right now.
              </p>
              <button
                type="button"
                onClick={handleSurprise}
                disabled={busy !== null}
                className="mm-btn mm-btn-primary mm-btn-block relative mt-5"
              >
                {busy === "surprise" ? (
                  <Loader2 className="animate-spin" size={17} aria-hidden="true" />
                ) : (
                  <Sparkles size={17} aria-hidden="true" />
                )}
                {busy === "surprise" ? "Finding a recipe" : "Surprise Me"}
              </button>
            </section>

            {/* Quick actions */}
            <section aria-label="Shortcuts" className="grid grid-cols-2 gap-2">
              {[
                { to: "/chat", icon: MessageCircleQuestion, label: "Ask Mia" },
                { to: "/planner", icon: Calendar, label: "Meal planner" },
                { to: "/coach", icon: Flame, label: "Nutrition" },
                { to: "/restaurants", icon: ChevronRight, label: "Dining" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="mm-card mm-card-hover flex items-center gap-2.5 px-3.5 py-3 text-[13px] font-medium text-white"
                >
                  <a.icon size={16} className="text-[#A1A1AA]" aria-hidden="true" />
                  <span className="truncate">{a.label}</span>
                </Link>
              ))}
            </section>

            <PlanStatusCard />
            <AdSlot slot="home_feed" />
          </div>
        </div>
      </div>

      {/* Floating Mia shortcut (mobile only, sits above the bottom bar) */}
      <Link
        to="/chat"
        aria-label="Ask Mia"
        className="fixed bottom-[calc(var(--app-nav-h)+16px)] right-4 z-30 flex size-13 items-center justify-center rounded-full bg-white text-[#080808] shadow-[0_10px_30px_rgba(0,0,0,0.45)] lg:hidden"
      >
        <MessageCircleQuestion size={21} aria-hidden="true" />
      </Link>
    </main>
  );
}
