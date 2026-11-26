import { Link } from "@tanstack/react-router";
import { Bookmark, Clock, Flame, Heart } from "lucide-react";
import { RecipeImage } from "@/components/recipe-image";
import { getRecipeUniqueTheme } from "@/lib/tag-styles";

export interface RecipeCardData {
  id?: string;
  slug: string;
  name: string;
  image_url: string | null;
  image_source?: string | null;
  cooking_time_minutes: number | null;
  difficulty?: string | null;
  calories?: number | null;
  cuisine: string | null;
  category: string | null;
  diet_tags?: string[] | null;
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
  diet_tags?: string[] | null;
}

export type FeaturedRecipeData = RecipeCardData & {
  id: string;
  description?: string | null;
};

/** Clean editorial recipe rail card with unboxed middot metadata and 44px touch target. */
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
  const uniqueTheme = getRecipeUniqueTheme(recipe.id ?? recipe.slug ?? recipe.name);
  const metaParts = [
    recipe.category || recipe.cuisine,
    recipe.difficulty,
    recipe.diet_tags?.[0],
  ].filter(Boolean);

  return (
    <div className="w-44 flex-shrink-0">
      <Link
        to="/recipe/$slug"
        params={{ slug: recipe.slug }}
        className={`md3-surface recipe-card-lift group relative block aspect-square w-44 overflow-hidden rounded-2xl border bg-gradient-to-br ${uniqueTheme.bg} ${uniqueTheme.border}`}
      >
        <RecipeImage
          recipe={recipe}
          size="card"
          sizes="176px"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id);
          }}
          aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
          aria-pressed={isFavorite}
          className="tap-spring absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-transform hover:scale-105 active:scale-95 shadow-sm"
        >
          <Heart
            className={isFavorite ? "heart-pop h-4 w-4 fill-primary text-primary" : "h-4 w-4"}
          />
        </button>

        {(recipe.cooking_time_minutes || recipe.calories) && (
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-2 text-xs font-medium text-white tabular-nums">
            {recipe.cooking_time_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {recipe.cooking_time_minutes}m
              </span>
            ) : null}
            {recipe.cooking_time_minutes && recipe.calories ? (
              <span aria-hidden="true">&middot;</span>
            ) : null}
            {recipe.calories ? (
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-300" aria-hidden="true" />
                {recipe.calories} kcal
              </span>
            ) : null}
          </div>
        )}
      </Link>
      <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="block">
        <h3 className="mt-2 line-clamp-2 font-display text-base leading-snug text-foreground hover:text-primary">
          {recipe.name}
        </h3>
      </Link>
      {metaParts.length > 0 && (
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {metaParts.slice(0, 2).join(" · ")}
        </p>
      )}
    </div>
  );
}

/** Featured hero card used on the Home screen daily recommendation slot. */
export function FeaturedRecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  reason,
}: {
  recipe: FeaturedRecipeData;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  reason?: string;
}) {
  const metaParts = [
    recipe.cooking_time_minutes ? `${recipe.cooking_time_minutes} min` : null,
    recipe.difficulty,
    recipe.cuisine || recipe.category,
    ...(recipe.diet_tags?.slice(0, 2) ?? []),
  ].filter(Boolean);

  return (
    <div className="md3-surface group relative overflow-hidden rounded-2xl border border-border bg-card">
      <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted sm:aspect-[16/9]">
          <RecipeImage
            recipe={recipe}
            size="hero"
            sizes="(max-width: 768px) 100vw, 720px"
            priority
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          />
          <div className="absolute bottom-3 left-4 right-14 text-white">
            {reason && <p className="text-xs font-medium text-white/85">{reason}</p>}
            <h3 className="mt-0.5 font-display text-2xl leading-tight text-balance">
              {recipe.name}
            </h3>
            {metaParts.length > 0 && (
              <p className="mt-1 text-xs text-white/80 tabular-nums">{metaParts.join(" · ")}</p>
            )}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite(recipe.id);
        }}
        aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
        aria-pressed={isFavorite}
        className="tap-spring absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
      >
        <Bookmark
          className={isFavorite ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/** Standard discovery grid card with unboxed middot metadata and optional save button. */
export function RecipeCard({
  recipe,
  priority = false,
  isFavorite,
  onToggleFavorite,
}: {
  recipe: RecipeCardData;
  priority?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const uniqueTheme = getRecipeUniqueTheme(recipe.id ?? recipe.slug ?? recipe.name);
  const topMeta = [
    recipe.cuisine || recipe.category,
    recipe.difficulty,
    recipe.cooking_time_minutes ? `${recipe.cooking_time_minutes}m` : null,
  ].filter(Boolean);
  const dietaryLine = (recipe.diet_tags ?? []).slice(0, 3).join(" · ");

  return (
    <div
      className={`md3-surface group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br ${uniqueTheme.bg} ${uniqueTheme.border} bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <RecipeImage
            recipe={recipe}
            size="card"
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 320px"
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {topMeta.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {topMeta.join(" · ")}
            </p>
          )}
          <h3 className="font-display text-xl leading-snug text-foreground">{recipe.name}</h3>
          {dietaryLine && (
            <p className="mt-auto pt-1 text-xs text-muted-foreground">{dietaryLine}</p>
          )}
        </div>
      </Link>
      {recipe.id && onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(recipe.id!);
          }}
          aria-label={isFavorite ? "Remove from saved recipes" : "Save recipe"}
          aria-pressed={Boolean(isFavorite)}
          className="tap-spring absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
        >
          <Heart
            className={isFavorite ? "heart-pop h-4 w-4 fill-primary text-primary" : "h-4 w-4"}
          />
        </button>
      )}
    </div>
  );
}
