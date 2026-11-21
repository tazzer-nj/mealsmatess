export type ThemeColorScheme = "light" | "dark";

export type MealMateThemeId =
  | "classic-light"
  | "midnight-black"
  | "classic-green"
  | "sunset"
  | "midnight-pro"
  | "ocean-blue"
  | "aurora"
  | "obsidian";

export type MealMateThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  periwinkle: string;
  periwinkleSoft: string;
  border: string;
  input: string;
  ring: string;
  positive: string;
  negative: string;
  destructive: string;
  destructiveForeground: string;
  navBackground: string;
  headerBackground: string;
  themeColor: string;
  ink: string;
  ember: string;
  leaf: string;
};

export type MealMateTheme = {
  id: MealMateThemeId;
  name: string;
  subtitle: string;
  colorScheme: ThemeColorScheme;
  premium: boolean;
  mascotImage: string;
  tokens: MealMateThemeTokens;
  lightTokens?: MealMateThemeTokens;
  darkTokens?: MealMateThemeTokens;
};

export const THEME_V2_STORAGE_KEY = "mealmate-theme-v2";
export const THEME_SCHEME_STORAGE_KEY = "mealmate-theme-scheme";
export const LEGACY_APPEARANCE_STORAGE_KEY = "mealmate-theme";
export const LEGACY_MASCOT_STORAGE_KEY = "mealmate.theme.v1";

export const MEALMATE_THEMES: MealMateTheme[] = [
  // ---- DEFAULT BLACK & WHITE (2) ----
  {
    id: "classic-light",
    name: "Default White",
    subtitle: "Clean white canvas & crisp black ink",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "oklch(0.992 0.003 95)",
      foreground: "oklch(0.12 0 0)",
      card: "oklch(0.975 0.005 95)",
      cardForeground: "oklch(0.12 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.12 0 0)",
      primary: "oklch(0.12 0 0)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.94 0 0)",
      secondaryForeground: "oklch(0.12 0 0)",
      muted: "oklch(0.94 0 0)",
      mutedForeground: "oklch(0.42 0 0)",
      accent: "oklch(0.92 0 0)",
      accentForeground: "oklch(0.12 0 0)",
      periwinkle: "oklch(0.61 0.16 139)",
      periwinkleSoft: "oklch(0.61 0.16 139 / 12%)",
      border: "oklch(0.91 0.003 95)",
      input: "oklch(0.89 0.003 95)",
      ring: "oklch(0.25 0 0)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 252, 251, 0.94)",
      headerBackground: "rgba(252, 252, 251, 0.94)",
      themeColor: "#fcfcfb",
      ink: "oklch(0.3 0.055 152)",
      ember: "oklch(0.72 0.16 55)",
      leaf: "oklch(0.61 0.16 139)",
    },
  },
  {
    id: "midnight-black",
    name: "Default Black",
    subtitle: "True black surface & crisp white ink",
    colorScheme: "dark",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "oklch(0.08 0 0)",
      foreground: "oklch(0.98 0 0)",
      card: "oklch(0.14 0 0)",
      cardForeground: "oklch(0.98 0 0)",
      popover: "oklch(0.14 0 0)",
      popoverForeground: "oklch(0.98 0 0)",
      primary: "oklch(0.98 0 0)",
      primaryForeground: "oklch(0.08 0 0)",
      secondary: "oklch(0.2 0 0)",
      secondaryForeground: "oklch(0.98 0 0)",
      muted: "oklch(0.2 0 0)",
      mutedForeground: "oklch(0.72 0 0)",
      accent: "oklch(0.24 0 0)",
      accentForeground: "oklch(0.98 0 0)",
      periwinkle: "oklch(0.72 0.16 140)",
      periwinkleSoft: "oklch(0.72 0.16 140 / 16%)",
      border: "oklch(1 0 0 / 12%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.72 0.16 140)",
      positive: "oklch(0.72 0.16 140)",
      negative: "#ef4444",
      destructive: "oklch(0.65 0.22 25)",
      destructiveForeground: "oklch(0.98 0 0)",
      navBackground: "rgba(10, 10, 10, 0.94)",
      headerBackground: "rgba(10, 10, 10, 0.94)",
      themeColor: "#0a0a0a",
      ink: "oklch(0.95 0.015 125)",
      ember: "oklch(0.75 0.15 55)",
      leaf: "oklch(0.72 0.16 140)",
    },
  },

  // ---- 6 LOGO / MASCOT THEMES (matching tablemates-meal-circle) ----
  {
    id: "classic-green",
    name: "Classic Green",
    subtitle: "Fresh white, deep green ink & garden leaf",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "oklch(0.992 0.003 95)",
      foreground: "oklch(0.12 0 0)",
      card: "oklch(0.975 0.005 95)",
      cardForeground: "oklch(0.12 0 0)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.12 0 0)",
      primary: "oklch(0.61 0.16 139)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.94 0.02 135)",
      secondaryForeground: "oklch(0.18 0.04 145)",
      muted: "oklch(0.94 0.015 135)",
      mutedForeground: "oklch(0.42 0.02 140)",
      accent: "oklch(0.92 0.03 135)",
      accentForeground: "oklch(0.15 0.04 145)",
      periwinkle: "oklch(0.61 0.16 139)",
      periwinkleSoft: "oklch(0.61 0.16 139 / 14%)",
      border: "oklch(0.9 0.015 135)",
      input: "oklch(0.88 0.02 135)",
      ring: "oklch(0.61 0.16 139)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(248, 250, 246, 0.92)",
      headerBackground: "rgba(248, 250, 246, 0.92)",
      themeColor: "#f8faf6",
      ink: "oklch(0.3 0.055 152)",
      ember: "oklch(0.72 0.16 55)",
      leaf: "oklch(0.61 0.16 139)",
    },
    darkTokens: {
      background: "oklch(0.14 0.025 145)",
      foreground: "oklch(0.97 0.01 135)",
      card: "oklch(0.19 0.03 145)",
      cardForeground: "oklch(0.97 0.01 135)",
      popover: "oklch(0.21 0.03 145)",
      popoverForeground: "oklch(0.97 0.01 135)",
      primary: "oklch(0.72 0.16 139)",
      primaryForeground: "oklch(0.12 0.03 145)",
      secondary: "oklch(0.24 0.035 142)",
      secondaryForeground: "oklch(0.96 0.01 135)",
      muted: "oklch(0.23 0.03 142)",
      mutedForeground: "oklch(0.74 0.03 140)",
      accent: "oklch(0.28 0.045 140)",
      accentForeground: "oklch(0.97 0.01 135)",
      periwinkle: "oklch(0.72 0.16 139)",
      periwinkleSoft: "oklch(0.72 0.16 139 / 18%)",
      border: "oklch(0.3 0.04 142)",
      input: "oklch(0.34 0.04 142)",
      ring: "oklch(0.72 0.16 139)",
      positive: "oklch(0.72 0.16 139)",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 22, 16, 0.92)",
      headerBackground: "rgba(12, 22, 16, 0.92)",
      themeColor: "#0c1610",
      ink: "oklch(0.93 0.02 135)",
      ember: "oklch(0.75 0.15 55)",
      leaf: "oklch(0.72 0.16 139)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    subtitle: "Warm sunset amber & golden kitchen",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-sunset.webp",
    tokens: {
      background: "oklch(0.97 0.025 65)",
      foreground: "oklch(0.18 0.03 45)",
      card: "oklch(0.985 0.018 70)",
      cardForeground: "oklch(0.18 0.03 45)",
      popover: "oklch(0.99 0.015 70)",
      popoverForeground: "oklch(0.18 0.03 45)",
      primary: "oklch(0.68 0.17 55)",
      primaryForeground: "oklch(0.15 0.03 50)",
      secondary: "oklch(0.93 0.05 60)",
      secondaryForeground: "oklch(0.2 0.03 45)",
      muted: "oklch(0.94 0.035 65)",
      mutedForeground: "oklch(0.44 0.04 50)",
      accent: "oklch(0.92 0.06 55)",
      accentForeground: "oklch(0.2 0.03 45)",
      periwinkle: "oklch(0.68 0.17 55)",
      periwinkleSoft: "oklch(0.68 0.17 55 / 14%)",
      border: "oklch(0.88 0.05 60)",
      input: "oklch(0.85 0.05 60)",
      ring: "oklch(0.68 0.17 55)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 245, 236, 0.92)",
      headerBackground: "rgba(252, 245, 236, 0.92)",
      themeColor: "#fcf5ec",
      ink: "oklch(0.28 0.06 45)",
      ember: "oklch(0.68 0.17 55)",
      leaf: "oklch(0.61 0.16 139)",
    },
    darkTokens: {
      background: "oklch(0.17 0.03 40)",
      foreground: "oklch(0.97 0.015 65)",
      card: "oklch(0.22 0.04 40)",
      cardForeground: "oklch(0.97 0.015 65)",
      popover: "oklch(0.24 0.04 40)",
      popoverForeground: "oklch(0.97 0.015 65)",
      primary: "oklch(0.75 0.17 55)",
      primaryForeground: "oklch(0.15 0.03 40)",
      secondary: "oklch(0.27 0.05 45)",
      secondaryForeground: "oklch(0.97 0.015 65)",
      muted: "oklch(0.26 0.04 45)",
      mutedForeground: "oklch(0.76 0.04 55)",
      accent: "oklch(0.31 0.06 50)",
      accentForeground: "oklch(0.97 0.015 65)",
      periwinkle: "oklch(0.75 0.17 55)",
      periwinkleSoft: "oklch(0.75 0.17 55 / 18%)",
      border: "oklch(0.33 0.05 45)",
      input: "oklch(0.37 0.05 45)",
      ring: "oklch(0.75 0.17 55)",
      positive: "#4ade80",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(26, 16, 10, 0.92)",
      headerBackground: "rgba(26, 16, 10, 0.92)",
      themeColor: "#1a100a",
      ink: "oklch(0.94 0.02 65)",
      ember: "oklch(0.75 0.17 55)",
      leaf: "#4ade80",
    },
  },
  {
    id: "midnight-pro",
    name: "Midnight",
    subtitle: "Deep starry navy & luminous indigo",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "oklch(0.13 0.04 275)",
      foreground: "oklch(0.97 0.01 275)",
      card: "oklch(0.18 0.05 275)",
      cardForeground: "oklch(0.97 0.01 275)",
      popover: "oklch(0.2 0.05 275)",
      popoverForeground: "oklch(0.97 0.01 275)",
      primary: "oklch(0.7 0.15 275)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.24 0.06 275)",
      secondaryForeground: "oklch(0.97 0.01 275)",
      muted: "oklch(0.23 0.05 275)",
      mutedForeground: "oklch(0.75 0.04 275)",
      accent: "oklch(0.28 0.07 275)",
      accentForeground: "oklch(0.97 0.01 275)",
      periwinkle: "oklch(0.7 0.15 275)",
      periwinkleSoft: "oklch(0.7 0.15 275 / 18%)",
      border: "oklch(0.3 0.06 275)",
      input: "oklch(0.34 0.06 275)",
      ring: "oklch(0.7 0.15 275)",
      positive: "#4ade80",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(13, 17, 38, 0.92)",
      headerBackground: "rgba(13, 17, 38, 0.92)",
      themeColor: "#0d1126",
      ink: "oklch(0.92 0.02 275)",
      ember: "oklch(0.7 0.15 275)",
      leaf: "#4ade80",
    },
    lightTokens: {
      background: "oklch(0.96 0.02 275)",
      foreground: "oklch(0.18 0.05 275)",
      card: "oklch(0.985 0.012 275)",
      cardForeground: "oklch(0.18 0.05 275)",
      popover: "oklch(0.995 0.01 275)",
      popoverForeground: "oklch(0.18 0.05 275)",
      primary: "oklch(0.54 0.18 275)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.92 0.04 275)",
      secondaryForeground: "oklch(0.2 0.05 275)",
      muted: "oklch(0.93 0.03 275)",
      mutedForeground: "oklch(0.45 0.05 275)",
      accent: "oklch(0.91 0.05 275)",
      accentForeground: "oklch(0.18 0.05 275)",
      periwinkle: "oklch(0.54 0.18 275)",
      periwinkleSoft: "oklch(0.54 0.18 275 / 14%)",
      border: "oklch(0.87 0.04 275)",
      input: "oklch(0.84 0.04 275)",
      ring: "oklch(0.54 0.18 275)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(241, 243, 252, 0.92)",
      headerBackground: "rgba(241, 243, 252, 0.92)",
      themeColor: "#f1f3fc",
      ink: "oklch(0.28 0.07 275)",
      ember: "oklch(0.54 0.18 275)",
      leaf: "oklch(0.61 0.16 139)",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean",
    subtitle: "Coastal waves & azure sky",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "oklch(0.97 0.02 225)",
      foreground: "oklch(0.18 0.04 235)",
      card: "oklch(0.985 0.015 220)",
      cardForeground: "oklch(0.18 0.04 235)",
      popover: "oklch(0.99 0.01 220)",
      popoverForeground: "oklch(0.18 0.04 235)",
      primary: "oklch(0.6 0.14 230)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.93 0.04 225)",
      secondaryForeground: "oklch(0.18 0.04 235)",
      muted: "oklch(0.94 0.03 225)",
      mutedForeground: "oklch(0.45 0.04 230)",
      accent: "oklch(0.92 0.05 220)",
      accentForeground: "oklch(0.18 0.04 235)",
      periwinkle: "oklch(0.6 0.14 230)",
      periwinkleSoft: "oklch(0.6 0.14 230 / 14%)",
      border: "oklch(0.88 0.04 225)",
      input: "oklch(0.84 0.04 225)",
      ring: "oklch(0.6 0.14 230)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(239, 246, 252, 0.92)",
      headerBackground: "rgba(239, 246, 252, 0.92)",
      themeColor: "#eff6fc",
      ink: "oklch(0.28 0.06 235)",
      ember: "oklch(0.6 0.14 230)",
      leaf: "oklch(0.61 0.16 139)",
    },
    darkTokens: {
      background: "oklch(0.16 0.04 240)",
      foreground: "oklch(0.96 0.015 220)",
      card: "oklch(0.21 0.05 238)",
      cardForeground: "oklch(0.96 0.015 220)",
      popover: "oklch(0.23 0.05 238)",
      popoverForeground: "oklch(0.96 0.015 220)",
      primary: "oklch(0.7 0.15 225)",
      primaryForeground: "oklch(0.14 0.04 235)",
      secondary: "oklch(0.26 0.05 235)",
      secondaryForeground: "oklch(0.96 0.015 220)",
      muted: "oklch(0.25 0.04 235)",
      mutedForeground: "oklch(0.75 0.04 225)",
      accent: "oklch(0.3 0.06 230)",
      accentForeground: "oklch(0.96 0.015 220)",
      periwinkle: "oklch(0.7 0.15 225)",
      periwinkleSoft: "oklch(0.7 0.15 225 / 18%)",
      border: "oklch(0.32 0.05 235)",
      input: "oklch(0.36 0.05 235)",
      ring: "oklch(0.7 0.15 225)",
      positive: "#4ade80",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 22, 34, 0.92)",
      headerBackground: "rgba(12, 22, 34, 0.92)",
      themeColor: "#0c1622",
      ink: "oklch(0.93 0.02 220)",
      ember: "oklch(0.7 0.15 225)",
      leaf: "#4ade80",
    },
  },
  {
    id: "aurora",
    name: "Matcha",
    subtitle: "Botanical tea garden & serene green",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-matcha.webp",
    tokens: {
      background: "oklch(0.15 0.035 145)",
      foreground: "oklch(0.96 0.02 135)",
      card: "oklch(0.2 0.045 145)",
      cardForeground: "oklch(0.96 0.02 135)",
      popover: "oklch(0.22 0.045 145)",
      popoverForeground: "oklch(0.96 0.02 135)",
      primary: "oklch(0.74 0.13 138)",
      primaryForeground: "oklch(0.14 0.03 145)",
      secondary: "oklch(0.26 0.05 142)",
      secondaryForeground: "oklch(0.96 0.02 135)",
      muted: "oklch(0.25 0.04 142)",
      mutedForeground: "oklch(0.74 0.04 140)",
      accent: "oklch(0.3 0.06 140)",
      accentForeground: "oklch(0.96 0.02 135)",
      periwinkle: "oklch(0.74 0.13 138)",
      periwinkleSoft: "oklch(0.74 0.13 138 / 16%)",
      border: "oklch(0.32 0.05 142)",
      input: "oklch(0.36 0.05 142)",
      ring: "oklch(0.74 0.13 138)",
      positive: "oklch(0.74 0.13 138)",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 24, 16, 0.92)",
      headerBackground: "rgba(12, 24, 16, 0.92)",
      themeColor: "#0c1810",
      ink: "oklch(0.93 0.03 135)",
      ember: "oklch(0.74 0.13 138)",
      leaf: "oklch(0.74 0.13 138)",
    },
    lightTokens: {
      background: "oklch(0.97 0.025 135)",
      foreground: "oklch(0.18 0.04 145)",
      card: "oklch(0.985 0.018 135)",
      cardForeground: "oklch(0.18 0.04 145)",
      popover: "oklch(0.99 0.012 135)",
      popoverForeground: "oklch(0.18 0.04 145)",
      primary: "oklch(0.55 0.15 139)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.93 0.045 135)",
      secondaryForeground: "oklch(0.18 0.04 145)",
      muted: "oklch(0.94 0.03 135)",
      mutedForeground: "oklch(0.43 0.04 140)",
      accent: "oklch(0.92 0.05 138)",
      accentForeground: "oklch(0.18 0.04 145)",
      periwinkle: "oklch(0.55 0.15 139)",
      periwinkleSoft: "oklch(0.55 0.15 139 / 14%)",
      border: "oklch(0.88 0.04 135)",
      input: "oklch(0.85 0.04 135)",
      ring: "oklch(0.55 0.15 139)",
      positive: "oklch(0.55 0.15 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(244, 249, 241, 0.92)",
      headerBackground: "rgba(244, 249, 241, 0.92)",
      themeColor: "#f4f9f1",
      ink: "oklch(0.28 0.06 145)",
      ember: "oklch(0.55 0.15 139)",
      leaf: "oklch(0.55 0.15 139)",
    },
  },
  {
    id: "obsidian",
    name: "Cherry",
    subtitle: "Ruby blossom & warm rose",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-cherry.webp",
    tokens: {
      background: "oklch(0.15 0.035 10)",
      foreground: "oklch(0.97 0.015 10)",
      card: "oklch(0.2 0.045 10)",
      cardForeground: "oklch(0.97 0.015 10)",
      popover: "oklch(0.22 0.045 10)",
      popoverForeground: "oklch(0.97 0.015 10)",
      primary: "oklch(0.7 0.17 12)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.26 0.05 12)",
      secondaryForeground: "oklch(0.97 0.015 10)",
      muted: "oklch(0.25 0.04 12)",
      mutedForeground: "oklch(0.76 0.04 12)",
      accent: "oklch(0.3 0.06 12)",
      accentForeground: "oklch(0.97 0.015 10)",
      periwinkle: "oklch(0.7 0.17 12)",
      periwinkleSoft: "oklch(0.7 0.17 12 / 16%)",
      border: "oklch(0.32 0.05 12)",
      input: "oklch(0.36 0.05 12)",
      ring: "oklch(0.7 0.17 12)",
      positive: "#4ade80",
      negative: "#fb7185",
      destructive: "#e11d48",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(24, 12, 16, 0.92)",
      headerBackground: "rgba(24, 12, 16, 0.92)",
      themeColor: "#180c10",
      ink: "oklch(0.94 0.02 10)",
      ember: "oklch(0.7 0.17 12)",
      leaf: "#4ade80",
    },
    lightTokens: {
      background: "oklch(0.97 0.02 10)",
      foreground: "oklch(0.18 0.04 10)",
      card: "oklch(0.985 0.015 10)",
      cardForeground: "oklch(0.18 0.04 10)",
      popover: "oklch(0.995 0.01 10)",
      popoverForeground: "oklch(0.18 0.04 10)",
      primary: "oklch(0.56 0.2 12)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.93 0.04 10)",
      secondaryForeground: "oklch(0.2 0.04 10)",
      muted: "oklch(0.94 0.03 10)",
      mutedForeground: "oklch(0.45 0.04 10)",
      accent: "oklch(0.92 0.05 12)",
      accentForeground: "oklch(0.2 0.04 10)",
      periwinkle: "oklch(0.56 0.2 12)",
      periwinkleSoft: "oklch(0.56 0.2 12 / 14%)",
      border: "oklch(0.88 0.04 10)",
      input: "oklch(0.85 0.04 10)",
      ring: "oklch(0.56 0.2 12)",
      positive: "oklch(0.61 0.16 139)",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 242, 244, 0.92)",
      headerBackground: "rgba(252, 242, 244, 0.92)",
      themeColor: "#fcf2f4",
      ink: "oklch(0.3 0.06 10)",
      ember: "oklch(0.56 0.2 12)",
      leaf: "oklch(0.61 0.16 139)",
    },
  },
];

export const FREE_THEMES = MEALMATE_THEMES.filter((t) => !t.premium);
export const PREMIUM_THEMES = MEALMATE_THEMES.filter((t) => t.premium);

const LEGACY_THEME_MAP: Record<string, MealMateThemeId> = {
  classic: "classic-light",
  light: "classic-light",
  "minimal-white": "classic-light",
  "soft-lavender": "classic-light",
  dark: "midnight-black",
  midnight: "midnight-pro",
  "dark-premium": "midnight-pro",
  "royal-navy": "midnight-pro",
  ocean: "ocean-blue",
  "arctic-blue": "ocean-blue",
  sunset: "sunset",
  cherry: "obsidian",
  matcha: "aurora",
  graphite: "aurora",
};

const MASCOT_ALIAS_MAP: Record<MealMateThemeId, string> = {
  "classic-light": "classic",
  "midnight-black": "classic",
  "classic-green": "classic-green",
  sunset: "sunset",
  "midnight-pro": "midnight",
  "ocean-blue": "ocean",
  aurora: "matcha",
  obsidian: "cherry",
};

export function isMealMateThemeId(value: string | null | undefined): value is MealMateThemeId {
  return Boolean(value && MEALMATE_THEMES.some((t) => t.id === value));
}

export function normalizeThemeId(value: string | null | undefined): MealMateThemeId {
  if (!value) return "classic-light";
  const cleaned = value.trim().toLowerCase();
  if (isMealMateThemeId(cleaned)) return cleaned;
  return LEGACY_THEME_MAP[cleaned] ?? "classic-light";
}

export function getMealMateThemeTokens(
  theme: MealMateTheme,
  colorScheme?: ThemeColorScheme,
): MealMateThemeTokens {
  if (colorScheme === "dark" && theme.darkTokens) return theme.darkTokens;
  if (colorScheme === "light" && theme.lightTokens) return theme.lightTokens;
  return theme.tokens;
}

export function getMealMateTheme(id: string | null | undefined): MealMateTheme {
  const baseId = typeof id === "string" ? id.split(":")[0] : id;
  const normalized = normalizeThemeId(baseId);
  return MEALMATE_THEMES.find((t) => t.id === normalized) ?? MEALMATE_THEMES[0]!;
}

export function parseStoredThemeSelection(raw: string | null | undefined): {
  themeId: MealMateThemeId;
  scheme?: ThemeColorScheme;
} | null {
  if (!raw || typeof raw !== "string") return null;
  const [rawId, rawScheme] = raw.trim().toLowerCase().split(":");
  const themeId = normalizeThemeId(rawId);
  const scheme = rawScheme === "light" || rawScheme === "dark" ? rawScheme : undefined;
  return { themeId, scheme };
}

/**
 * Applies all theme CSS custom properties, classes, data attributes, and Android
 * status bar (`meta[name="theme-color"]`) onto documentElement synchronously.
 */
export function applyMealMateThemeToDom(
  themeId: MealMateThemeId,
  options?: {
    animate?: boolean;
    legacyDatasetTheme?: string;
    colorScheme?: ThemeColorScheme;
  },
) {
  if (typeof document === "undefined") return;
  const theme = getMealMateTheme(themeId);
  const effectiveScheme: ThemeColorScheme = theme.premium
    ? (options?.colorScheme ?? theme.colorScheme)
    : theme.colorScheme;
  const root = document.documentElement;
  const t = getMealMateThemeTokens(theme, effectiveScheme);

  if (
    options?.animate &&
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 320);
  }

  const isDark = effectiveScheme === "dark";
  root.classList.toggle("dark", isDark);
  root.classList.toggle("dark-premium", theme.id === "midnight-pro" && isDark);
  root.style.colorScheme = effectiveScheme;
  root.dataset["appTheme"] = theme.id;
  root.dataset["mascot"] = MASCOT_ALIAS_MAP[theme.id] ?? "classic";
  root.dataset["theme"] =
    options?.legacyDatasetTheme ??
    (theme.id === "midnight-pro" && isDark ? "dark-premium" : isDark ? "dark" : "light");

  const vars: Record<string, string> = {
    "--background": t.background,
    "--foreground": t.foreground,
    "--card": t.card,
    "--card-foreground": t.cardForeground,
    "--popover": t.popover,
    "--popover-foreground": t.popoverForeground,
    "--primary": t.primary,
    "--primary-foreground": t.primaryForeground,
    "--secondary": t.secondary,
    "--secondary-foreground": t.secondaryForeground,
    "--muted": t.muted,
    "--muted-foreground": t.mutedForeground,
    "--accent": t.accent,
    "--accent-foreground": t.accentForeground,
    "--periwinkle": t.periwinkle,
    "--periwinkle-soft": t.periwinkleSoft,
    "--border": t.border,
    "--input": t.input,
    "--ring": t.ring,
    "--positive": t.positive,
    "--negative": t.negative,
    "--destructive": t.destructive,
    "--destructive-foreground": t.destructiveForeground,
    "--nav-background": t.navBackground,
    "--header-background": t.headerBackground,
    "--sidebar": t.card,
    "--sidebar-foreground": t.cardForeground,
    "--sidebar-primary": t.primary,
    "--sidebar-primary-foreground": t.primaryForeground,
    "--sidebar-accent": t.secondary,
    "--sidebar-accent-foreground": t.secondaryForeground,
    "--sidebar-border": t.border,
    "--sidebar-ring": t.ring,
    "--cream": t.card,
    "--ink": t.ink,
    "--ember": t.ember,
    "--leaf": t.leaf,
    "--market-hero": isDark ? t.card : "oklch(0.98 0.01 120)",
    "--brand": t.primary,
    "--brand-dark": t.primary,
    "--brand-foreground": t.primaryForeground,
  };

  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }

  const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = t.themeColor;
  }

  const metaStatus = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (metaStatus) {
    metaStatus.content = isDark ? "black-translucent" : "default";
  }
}

function serializeBootTuple(scheme: ThemeColorScheme, tokens: MealMateThemeTokens) {
  return [
    scheme,
    tokens.background,
    tokens.foreground,
    tokens.card,
    tokens.cardForeground,
    tokens.popover,
    tokens.popoverForeground,
    tokens.primary,
    tokens.primaryForeground,
    tokens.secondary,
    tokens.secondaryForeground,
    tokens.muted,
    tokens.mutedForeground,
    tokens.accent,
    tokens.accentForeground,
    tokens.periwinkle,
    tokens.periwinkleSoft,
    tokens.border,
    tokens.input,
    tokens.ring,
    tokens.positive,
    tokens.negative,
    tokens.destructive,
    tokens.destructiveForeground,
    tokens.navBackground,
    tokens.headerBackground,
    tokens.themeColor,
    tokens.ink,
    tokens.ember,
    tokens.leaf,
  ];
}

const BOOT_MAP = Object.fromEntries(
  MEALMATE_THEMES.map((theme) => [theme.id, serializeBootTuple(theme.colorScheme, theme.tokens)]),
);

const BOOT_SCHEME_MAP = Object.fromEntries(
  MEALMATE_THEMES.filter((t) => t.premium).map((theme) => [
    theme.id,
    {
      light: serializeBootTuple("light", getMealMateThemeTokens(theme, "light")),
      dark: serializeBootTuple("dark", getMealMateThemeTokens(theme, "dark")),
    },
  ]),
);

const BOOT_KEYS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--periwinkle",
  "--periwinkle-soft",
  "--border",
  "--input",
  "--ring",
  "--positive",
  "--negative",
  "--destructive",
  "--destructive-foreground",
  "--nav-background",
  "--header-background",
];

/**
 * Synchronous <head> inline script so saved theme + tokens paint on frame 0
 * with zero flash between light/dark/custom themes.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var m=${JSON.stringify(
  BOOT_MAP,
)};var sm=${JSON.stringify(BOOT_SCHEME_MAP)};var lg=${JSON.stringify(
  LEGACY_THEME_MAP,
)};var ma=${JSON.stringify(MASCOT_ALIAS_MAP)};var ks=${JSON.stringify(
  BOOT_KEYS,
)};var k2=localStorage.getItem(${JSON.stringify(
  THEME_V2_STORAGE_KEY,
)});var ks2=localStorage.getItem(${JSON.stringify(
  THEME_SCHEME_STORAGE_KEY,
)});var ap=localStorage.getItem(${JSON.stringify(
  LEGACY_APPEARANCE_STORAGE_KEY,
)});var ms=localStorage.getItem(${JSON.stringify(
  LEGACY_MASCOT_STORAGE_KEY,
)});var pick=k2&&m[k2]?k2:(k2&&lg[k2]?lg[k2]:null);if(!pick){var sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(ap==="dark-premium")pick="midnight-pro";else if(ap==="dark")pick="midnight-black";else if(ap==="light")pick="classic-light";else if(ms&&lg[ms])pick=lg[ms];else if(ms&&m[ms])pick=ms;else pick=sysDark?"midnight-black":"classic-light";}var d=(ks2==="light"||ks2==="dark")&&sm[pick]&&sm[pick][ks2]?sm[pick][ks2]:(m[pick]||m["classic-light"]);var r=document.documentElement;var dark=d[0]==="dark";r.classList.toggle("dark",dark);r.classList.toggle("dark-premium",pick==="midnight-pro"&&dark);r.style.colorScheme=d[0];r.dataset.appTheme=pick;r.dataset.mascot=ma[pick]||"classic";r.dataset.theme=pick==="midnight-pro"&&dark?"dark-premium":(dark?"dark":"light");for(var i=0;i<ks.length;i++){r.style.setProperty(ks[i],d[i+1]);}r.style.setProperty("--cream",d[3]);r.style.setProperty("--ink",d[27]);r.style.setProperty("--ember",d[28]);r.style.setProperty("--leaf",d[29]);r.style.setProperty("--market-hero",dark?d[3]:"oklch(0.98 0.01 120)");r.style.setProperty("--brand",d[7]);r.style.setProperty("--brand-dark",d[7]);r.style.setProperty("--brand-foreground",d[8]);var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",d[26]);var f=localStorage.getItem("mealmate-font");r.dataset.font=(f==="editorial"||f==="jakarta"||f==="outfit"||f==="dm"||f==="fraunces")?f:"editorial";}catch(e){}})();`;
