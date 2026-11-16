import {
  MEALMATE_THEMES,
  THEME_BOOT_SCRIPT,
  THEME_V2_STORAGE_KEY,
  applyMealMateThemeToDom,
  getMealMateTheme,
  normalizeThemeId,
  type MealMateTheme,
  type MealMateThemeId,
} from "@/lib/themes";

export type MascotThemeId = MealMateThemeId;

export type MascotTheme = {
  id: MealMateThemeId;
  name: string;
  image: string;
  accent: string;
  accentDark: string;
  accentForeground: string;
  premium: boolean;
  subtitle: string;
  colorScheme: MealMateTheme["colorScheme"];
};

export const MASCOT_THEMES: MascotTheme[] = MEALMATE_THEMES.map((t) => ({
  id: t.id,
  name: t.name,
  subtitle: t.subtitle,
  colorScheme: t.colorScheme,
  image: t.mascotImage,
  accent: t.tokens.periwinkle,
  accentDark: t.tokens.periwinkle,
  accentForeground: t.tokens.primaryForeground,
  premium: t.premium,
}));

export const THEME_STORAGE_KEY = THEME_V2_STORAGE_KEY;

export function getTheme(id: string | null | undefined): MascotTheme {
  const normalized = normalizeThemeId(id);
  const full = getMealMateTheme(normalized);
  return {
    id: full.id,
    name: full.name,
    subtitle: full.subtitle,
    colorScheme: full.colorScheme,
    image: full.mascotImage,
    accent: full.tokens.periwinkle,
    accentDark: full.tokens.periwinkle,
    accentForeground: full.tokens.primaryForeground,
    premium: full.premium,
  };
}

export function applyTheme(id: string, animate = false) {
  const normalized = normalizeThemeId(id);
  applyMealMateThemeToDom(normalized, { animate });
}

export { THEME_BOOT_SCRIPT };
