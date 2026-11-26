const AMBER_PILL =
  "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300";
const EMERALD_PILL =
  "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300";
const ROSE_PILL =
  "border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-700/60 dark:bg-stone-900/60 dark:text-stone-200";
const ORANGE_PILL =
  "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800/60 dark:bg-orange-950/60 dark:text-orange-300";
const VIOLET_PILL =
  "border-teal-200 bg-teal-100 text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/60 dark:text-teal-300";
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

const RECIPE_PALETTES = [
  {
    bg: "from-amber-500/10 via-amber-500/5 to-orange-500/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
    accent: "bg-amber-500",
  },
  {
    bg: "from-emerald-500/10 via-emerald-500/5 to-teal-500/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  {
    bg: "from-rose-500/10 via-rose-500/5 to-pink-500/10",
    border: "border-rose-500/30",
    badge: "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/30",
    accent: "bg-rose-500",
  },
  {
    bg: "from-blue-500/10 via-blue-500/5 to-indigo-500/10",
    border: "border-blue-500/30",
    badge: "bg-blue-500/15 text-blue-800 dark:text-blue-200 border-blue-500/30",
    accent: "bg-blue-500",
  },
  {
    bg: "from-purple-500/10 via-purple-500/5 to-violet-500/10",
    border: "border-purple-500/30",
    badge: "bg-purple-500/15 text-purple-800 dark:text-purple-200 border-purple-500/30",
    accent: "bg-purple-500",
  },
  {
    bg: "from-teal-500/10 via-teal-500/5 to-cyan-500/10",
    border: "border-teal-500/30",
    badge: "bg-teal-500/15 text-teal-800 dark:text-teal-200 border-teal-500/30",
    accent: "bg-teal-500",
  },
];

export function getRecipeUniqueTheme(seed: string = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % RECIPE_PALETTES.length;
  return RECIPE_PALETTES[index]!;
}
