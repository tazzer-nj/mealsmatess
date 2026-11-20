const AMBER_PILL =
  "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300";
const EMERALD_PILL =
  "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300";
const ROSE_PILL =
  "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300";
const ORANGE_PILL =
  "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800/60 dark:bg-orange-950/60 dark:text-orange-300";
const VIOLET_PILL =
  "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-800/60 dark:bg-violet-950/60 dark:text-violet-300";
const SKY_PILL =
  "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300";

export function mealTagPillClass(tag: string): string {
  const key = tag.trim().toLowerCase();
  if (key.includes("breakfast") || key.includes("brunch")) return AMBER_PILL;
  if (
    key.includes("protein") ||
    key.includes("vegan") ||
    key.includes("vegetarian") ||
    key.includes("healthy")
  ) {
    return EMERALD_PILL;
  }
  if (
    key.includes("quick") ||
    key.includes("15") ||
    key.includes("snack") ||
    key.includes("fast")
  ) {
    return ROSE_PILL;
  }
  if (key.includes("dinner") || key.includes("south african") || key.includes("lunch")) {
    return ORANGE_PILL;
  }
  if (key.includes("dessert") || key.includes("drink") || key.includes("low carb")) {
    return VIOLET_PILL;
  }
  if (key.includes("gluten")) return SKY_PILL;
  return "border-border bg-secondary text-secondary-foreground";
}
