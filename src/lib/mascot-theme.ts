import {
  THEME_BOOT_SCRIPT,
  THEME_V2_STORAGE_KEY,
  applyMealMateThemeToDom,
  getMealMateTheme,
  normalizeThemeId,
  type MealMateTheme,
  type MealMateThemeId,
} from "@/lib/themes";

export type MascotThemeId =
  "classic" | "sunset" | "midnight" | "ocean" | "cherry" | "matcha" | MealMateThemeId;

export type MascotTheme = {
  id: MascotThemeId;
  name: string;
  image: string;
  accent: string;
  accentDark: string;
  accentForeground: string;
  premium: boolean;
  subtitle?: string;
  colorScheme?: MealMateTheme["colorScheme"];
};

export const MASCOT_THEMES: MascotTheme[] = [
  {
    id: "cherry",
    name: "Cherry",
    image: "/mascots/mascot-cherry.webp",
    accent: "#e11d48",
    accentDark: "#fb7185",
    accentForeground: "#ffffff",
    premium: true,
    subtitle: "Elegant cherry red, soft blush & deep burgundy",
    colorScheme: "dark",
  },
  {
    id: "midnight",
    name: "Midnight",
    image: "/mascots/mascot-midnight.webp",
    accent: "#6366f1",
    accentDark: "#818cf8",
    accentForeground: "#ffffff",
    premium: true,
    subtitle: "Deep navy, midnight blue & electric periwinkle",
    colorScheme: "dark",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    image: "/mascots/mascot-classic.png",
    accent: "#8b5cf6",
    accentDark: "#a78bfa",
    accentForeground: "#ffffff",
    premium: true,
    subtitle: "Soft lavender, violet & creamy white",
    colorScheme: "light",
  },
  {
    id: "ocean",
    name: "Ocean",
    image: "/mascots/mascot-ocean.webp",
    accent: "#0284c7",
    accentDark: "#38bdf8",
    accentForeground: "#ffffff",
    premium: true,
    subtitle: "Rich ocean blue, aqua & deep midnight",
    colorScheme: "light",
  },
  {
    id: "matcha",
    name: "Matcha",
    image: "/mascots/mascot-matcha.webp",
    accent: "#22c55e",
    accentDark: "#4ade80",
    accentForeground: "#ffffff",
    premium: true,
    subtitle: "Fresh matcha green, warm cream & muted olive",
    colorScheme: "dark",
  },
  {
    id: "sunset",
    name: "Sunset",
    image: "/mascots/mascot-sunset.webp",
    accent: "#f59e0b",
    accentDark: "#fbbf24",
    accentForeground: "#1c1018",
    premium: true,
    subtitle: "Warm amber, peach, coral & deep plum",
    colorScheme: "dark",
  },
];

export const THEME_STORAGE_KEY = THEME_V2_STORAGE_KEY;

export function getTheme(id: string | null | undefined): MascotTheme {
  const normalized = normalizeThemeId(id);
  const full = getMealMateTheme(normalized);
  const mascotMatch = MASCOT_THEMES.find((m) => m.image === full.mascotImage);
  if (mascotMatch) {
    return {
      ...mascotMatch,
      id: full.id,
      colorScheme: full.colorScheme,
      subtitle: full.subtitle,
    };
  }
  return {
    id: full.id,
    name: full.name,
    subtitle: full.subtitle,
    colorScheme: full.colorScheme,
    image: full.mascotImage,
    accent: full.tokens.primary,
    accentDark: full.tokens.primary,
    accentForeground: full.tokens.primaryForeground,
    premium: full.premium,
  };
}

export function applyTheme(id: string, animate = false) {
  const normalized = normalizeThemeId(id);
  applyMealMateThemeToDom(normalized, { animate });
}

export { THEME_BOOT_SCRIPT };
