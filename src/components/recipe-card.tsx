import { Link } from "@tanstack/react-router";
import { Clock, Flame, Heart, Star, Sparkles, ChefHat } from "lucide-react";
import { RecipeImage } from "@/components/recipe-image";

export interface RecipeCardData {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url: string | null;
  image_source?: string | null;
  cooking_time_minutes: number | null;
  calories?: number | null;
  difficulty?: string | null;
  cuisine: string | null;
  category: string | null;
  diet_tags?: string[] | null;
  rating?: number | null;
  is_premium?: boolean;
}

export interface TrendingCardData {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  image_source?: string | null;
  cooking_time_minutes: number | null;
  calories: number | null;
  difficulty: string | null;
  cuisine?: string | null;
  category?: string | null;
  rating?: number | null;
  is_premium?: boolean;
}

const DIFFICULTY_DOTS: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

/** Editorial featured banner card for highlighting top recipes */
export function FeaturedRecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  priority = true,
}: {
  recipe: RecipeCardData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  priority?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="grid md:grid-cols-12 items-center">
        <div className="relative md:col-span-7 aspect-[16/10] md:aspect-[4/3] overflow-hidden bg-muted">
          <RecipeImage
            recipe={recipe}
            size="hero"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

          {recipe.id && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(recipe.id!);
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-foreground z-10"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow transition-transform hover:scale-110 active:scale-95">
                <Heart
                  className={
                    isFavorite
                      ? "heart-pop h-5 w-5 fill-primary text-primary"
                      : "h-5 w-5 text-foreground"
                  }
                />
              </span>
            </button>
          )}

          {recipe.is_premium && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> Premium
            </span>
          )}
        </div>

        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {recipe.cuisine && <span>{recipe.cuisine}</span>}
              {recipe.category && <span>· {recipe.category}</span>}
            </div>

            <Link to="/recipe/$slug" params={{ slug: recipe.slug }}>
              <h2 className="mt-2 font-display text-2xl md:text-3xl leading-tight transition-colors group-hover:text-primary">
                {recipe.name}
              </h2>
            </Link>

            {recipe.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {recipe.description}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              {recipe.cooking_time_minutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {recipe.cooking_time_minutes} min
                </span>
              ) : null}
              {recipe.calories ? (
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  {recipe.calories} kcal
                </span>
              ) : null}
              {recipe.difficulty ? (
                <span className="inline-flex items-center gap-1">
                  <ChefHat className="h-3.5 w-3.5" />
                  {recipe.difficulty}
                </span>
              ) : null}
              {typeof recipe.rating === "number" && recipe.rating > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {recipe.rating.toFixed(1)}
                </span>
              ) : null}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-wrap gap-1">
                {recipe.diet_tags?.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Link
                to="/recipe/$slug"
                params={{ slug: recipe.slug }}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-xs font-medium text-primary-foreground shadow transition-all hover:bg-primary/90"
              >
                Cook Recipe
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Horizontal-rail card used on discovery sections */
export function TrendingCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  priority = false,
}: {
  recipe: TrendingCardData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  priority?: boolean;
}) {
  const dots = recipe.difficulty ? (DIFFICULTY_DOTS[recipe.difficulty] ?? 1) : 1;
  return (
    <div className="w-44 flex-shrink-0">
      <Link
        to="/recipe/$slug"
        params={{ slug: recipe.slug }}
        className="group relative block aspect-square w-44 overflow-hidden rounded-2xl bg-muted shadow-sm transition-all hover:shadow-md"
      >
        <RecipeImage
          recipe={recipe}
          size="card"
          sizes="176px"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground z-10"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow transition-transform hover:scale-110 active:scale-90">
            <Heart
              className={isFavorite ? "heart-pop h-4 w-4 fill-primary text-primary" : "h-4 w-4"}
            />
          </span>
        </button>

        {recipe.is_premium && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow backdrop-blur-md">
            <Sparkles className="h-2.5 w-2.5" /> Premium
          </span>
        )}

        {(recipe.cooking_time_minutes || recipe.calories) && (
          <div className="tabular-nums absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur">
            {recipe.cooking_time_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.cooking_time_minutes}m
              </span>
            ) : null}
            {recipe.calories ? (
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-primary" />
                {recipe.calories}
              </span>
            ) : null}
          </div>
        )}
      </Link>
      <h3 className="mt-2 line-clamp-2 font-display text-base leading-tight transition-colors group-hover:text-primary">
        {recipe.name}
      </h3>
      {(recipe.difficulty || (typeof recipe.rating === "number" && recipe.rating > 0)) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {recipe.difficulty && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {recipe.difficulty}
              <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < dots ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </span>
            </div>
          )}
          {typeof recipe.rating === "number" && recipe.rating > 0 && (
            <span className="tabular-nums inline-flex items-center gap-0.5 text-[11px] font-semibold text-foreground">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {recipe.rating.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Standard editorial recipe card for grids */
export function RecipeCard({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  priority = false,
}: {
  recipe: RecipeCardData;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  priority?: boolean;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        to="/recipe/$slug"
        params={{ slug: recipe.slug }}
        className="aspect-[4/3] w-full overflow-hidden bg-muted relative block"
      >
        <RecipeImage
          recipe={recipe}
          size="card"
          sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 320px"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {recipe.id && onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(recipe.id!);
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground z-10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow transition-transform hover:scale-110 active:scale-95">
              <Heart
                className={
                  isFavorite
                    ? "heart-pop h-4 w-4 fill-primary text-primary"
                    : "h-4 w-4 text-foreground"
                }
              />
            </span>
          </button>
        )}
        {recipe.is_premium && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Premium
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="tabular-nums flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate font-medium">
              {recipe.cuisine ?? recipe.category ?? "Recipe"}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {recipe.cooking_time_minutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.cooking_time_minutes}m
                </span>
              ) : null}
              {recipe.calories ? (
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500" />
                  {recipe.calories}
                </span>
              ) : null}
              {typeof recipe.rating === "number" && recipe.rating > 0 ? (
                <span className="inline-flex items-center gap-0.5 font-semibold text-foreground">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {recipe.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
          </div>

          <Link to="/recipe/$slug" params={{ slug: recipe.slug }}>
            <h3 className="mt-2 font-display text-lg leading-snug transition-colors group-hover:text-primary">
              {recipe.name}
            </h3>
          </Link>
        </div>

        {(recipe.difficulty || (recipe.diet_tags && recipe.diet_tags.length > 0)) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {recipe.difficulty && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <ChefHat className="h-3 w-3" />
                {recipe.difficulty}
              </span>
            )}
            {recipe.diet_tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
