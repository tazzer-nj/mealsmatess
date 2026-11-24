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
  "classic" | "lavender" | "sunset" | "midnight" | "ocean" | "cherry" | "matcha" | MealMateThemeId;

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
    id: "classic",
    name: "Classic",
    image: "/mascots/mascot-classic.png",
    accent: "oklch(0.12 0 0)",
    accentDark: "oklch(0.98 0 0)",
    accentForeground: "oklch(0.99 0 0)",
    premium: false,
    subtitle: "Classic bowl & spoon mark",
    colorScheme: "light",
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    image: "/mascots/mascot-lavender.jpg",
    accent: "oklch(0.54 0.17 295)",
    accentDark: "oklch(0.68 0.15 295)",
    accentForeground: "oklch(0.99 0 0)",
    premium: true,
    subtitle: "Dreamy soft lavender & calm violet mist",
    colorScheme: "light",
  },
  {
    id: "sunset",
    name: "Sunset",
    image: "/mascots/mascot-sunset.webp",
    accent: "oklch(0.68 0.17 55)",
    accentDark: "oklch(0.76 0.16 60)",
    accentForeground: "oklch(0.15 0.03 50)",
    premium: true,
    subtitle: "Warm sunset amber & golden kitchen",
    colorScheme: "light",
  },
  {
    id: "midnight",
    name: "Midnight",
    image: "/mascots/mascot-midnight.webp",
    accent: "oklch(0.5 0.2 275)",
    accentDark: "oklch(0.7 0.15 275)",
    accentForeground: "oklch(0.99 0 0)",
    premium: true,
    subtitle: "Deep starry navy & luminous indigo",
    colorScheme: "dark",
  },
  {
    id: "ocean",
    name: "Ocean",
    image: "/mascots/mascot-ocean.webp",
    accent: "oklch(0.6 0.14 230)",
    accentDark: "oklch(0.75 0.12 225)",
    accentForeground: "oklch(0.15 0.03 230)",
    premium: true,
    subtitle: "Coastal waves & azure sky",
    colorScheme: "light",
  },
  {
    id: "cherry",
    name: "Cherry",
    image: "/mascots/mascot-cherry.webp",
    accent: "oklch(0.55 0.2 15)",
    accentDark: "oklch(0.7 0.17 12)",
    accentForeground: "oklch(0.99 0 0)",
    premium: true,
    subtitle: "Ruby blossom & warm rose",
    colorScheme: "dark",
  },
  {
    id: "matcha",
    name: "Matcha",
    image: "/mascots/mascot-matcha.webp",
    accent: "oklch(0.52 0.12 140)",
    accentDark: "oklch(0.74 0.13 138)",
    accentForeground: "oklch(0.99 0 0)",
    premium: true,
    subtitle: "Botanical tea garden & serene green",
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
