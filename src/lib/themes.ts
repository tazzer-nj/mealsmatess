export type ThemeColorScheme = "light" | "dark";

export type MealMateThemeId =
  | "classic-light"
  | "midnight-black"
  | "cherry"
  | "midnight"
  | "lavender-dream"
  | "ocean"
  | "matcha"
  | "sunset";

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
  // ---- DEFAULT KITCHEN THEMES (2) ----
  {
    id: "classic-light",
    name: "Fresh Kitchen",
    subtitle: "Warm ivory canvas, soft cream & fresh sage",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#faf7f1",
      foreground: "#1c221d",
      card: "#ffffff",
      cardForeground: "#1c221d",
      popover: "#ffffff",
      popoverForeground: "#1c221d",
      primary: "#3b6644",
      primaryForeground: "#fbfcf9",
      secondary: "#f1ece2",
      secondaryForeground: "#222923",
      muted: "#ece6da",
      mutedForeground: "#555e55",
      accent: "#e5ede1",
      accentForeground: "#1c221d",
      periwinkle: "#4a7551",
      periwinkleSoft: "rgba(74, 117, 81, 0.13)",
      border: "#e3dcd0",
      input: "#dbd3c5",
      ring: "#4a7551",
      positive: "#3d7a47",
      negative: "#c8372d",
      destructive: "#c8372d",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 249, 243, 0.92)",
      headerBackground: "rgba(250, 247, 241, 0.9)",
      themeColor: "#faf7f1",
      ink: "#1f3224",
      ember: "#c77d32",
      leaf: "#548256",
    },
  },
  {
    id: "midnight-black",
    name: "Midnight Kitchen",
    subtitle: "Midnight black, forest green & refined emerald",
    colorScheme: "dark",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#070e0a",
      foreground: "#f4f8f5",
      card: "#0e1c14",
      cardForeground: "#f4f8f5",
      popover: "#12241a",
      popoverForeground: "#f4f8f5",
      primary: "#2ec47a",
      primaryForeground: "#04140b",
      secondary: "#15281d",
      secondaryForeground: "#e8f2ec",
      muted: "#13241a",
      mutedForeground: "#9cb5a6",
      accent: "#1a3325",
      accentForeground: "#f4f8f5",
      periwinkle: "#2ec47a",
      periwinkleSoft: "rgba(46, 196, 122, 0.16)",
      border: "rgba(116, 186, 146, 0.18)",
      input: "rgba(116, 186, 146, 0.22)",
      ring: "#34d399",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(7, 15, 11, 0.92)",
      headerBackground: "rgba(7, 14, 10, 0.9)",
      themeColor: "#070e0a",
      ink: "#e6f2ea",
      ember: "#dba04a",
      leaf: "#2ec47a",
    },
  },

  // ---- 6 EXCLUSIVE PREMIUM THEMES ----
  {
    id: "cherry",
    name: "Cherry",
    subtitle: "Elegant cherry red, soft blush & deep burgundy",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-cherry.webp",
    tokens: {
      background: "#180a0f",
      foreground: "#fdf2f4",
      card: "#241018",
      cardForeground: "#fdf2f4",
      popover: "#2c141d",
      popoverForeground: "#fdf2f4",
      primary: "#e11d48",
      primaryForeground: "#ffffff",
      secondary: "#331622",
      secondaryForeground: "#fdf2f4",
      muted: "#2b121c",
      mutedForeground: "#b88a99",
      accent: "#401b2a",
      accentForeground: "#fdf2f4",
      periwinkle: "#e11d48",
      periwinkleSoft: "rgba(225, 29, 72, 0.16)",
      border: "rgba(225, 29, 72, 0.22)",
      input: "rgba(225, 29, 72, 0.28)",
      ring: "#f43f5e",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(24, 10, 15, 0.92)",
      headerBackground: "rgba(24, 10, 15, 0.9)",
      themeColor: "#180a0f",
      ink: "#fdf2f4",
      ember: "#fb7185",
      leaf: "#34d399",
    },
    lightTokens: {
      background: "#fcf2f4",
      foreground: "#2a1017",
      card: "#ffffff",
      cardForeground: "#2a1017",
      popover: "#ffffff",
      popoverForeground: "#2a1017",
      primary: "#be123c",
      primaryForeground: "#ffffff",
      secondary: "#f7e1e6",
      secondaryForeground: "#3b1721",
      muted: "#f3d5dd",
      mutedForeground: "#885563",
      accent: "#ebd0d7",
      accentForeground: "#2a1017",
      periwinkle: "#be123c",
      periwinkleSoft: "rgba(190, 18, 60, 0.12)",
      border: "#e7c2cb",
      input: "#dfb4bf",
      ring: "#be123c",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 242, 244, 0.92)",
      headerBackground: "rgba(252, 242, 244, 0.9)",
      themeColor: "#fcf2f4",
      ink: "#2a1017",
      ember: "#e11d48",
      leaf: "#16a34a",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    subtitle: "Deep navy, midnight blue & electric periwinkle",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "#0d1126",
      foreground: "#f4f6fc",
      card: "#151b3b",
      cardForeground: "#f4f6fc",
      popover: "#1a224a",
      popoverForeground: "#f4f6fc",
      primary: "#6366f1",
      primaryForeground: "#ffffff",
      secondary: "#202854",
      secondaryForeground: "#f4f6fc",
      muted: "#1a2144",
      mutedForeground: "#9ba3db",
      accent: "#2c3570",
      accentForeground: "#f4f6fc",
      periwinkle: "#818cf8",
      periwinkleSoft: "rgba(129, 140, 248, 0.18)",
      border: "rgba(129, 140, 248, 0.22)",
      input: "rgba(129, 140, 248, 0.28)",
      ring: "#818cf8",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(13, 17, 38, 0.92)",
      headerBackground: "rgba(13, 17, 38, 0.9)",
      themeColor: "#0d1126",
      ink: "#f4f6fc",
      ember: "#a5b4fc",
      leaf: "#34d399",
    },
    lightTokens: {
      background: "#f1f3fc",
      foreground: "#111833",
      card: "#ffffff",
      cardForeground: "#111833",
      popover: "#ffffff",
      popoverForeground: "#111833",
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      secondary: "#e0e7ff",
      secondaryForeground: "#1e1b4b",
      muted: "#d5dffc",
      mutedForeground: "#6b7280",
      accent: "#c7d2fe",
      accentForeground: "#111833",
      periwinkle: "#4f46e5",
      periwinkleSoft: "rgba(79, 70, 229, 0.12)",
      border: "#c7d2fe",
      input: "#b8c5fc",
      ring: "#4f46e5",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(241, 243, 252, 0.92)",
      headerBackground: "rgba(241, 243, 252, 0.9)",
      themeColor: "#f1f3fc",
      ink: "#111833",
      ember: "#4f46e5",
      leaf: "#16a34a",
    },
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    subtitle: "Soft lavender, violet & creamy white",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#faf8fc",
      foreground: "#24192b",
      card: "#ffffff",
      cardForeground: "#24192b",
      popover: "#ffffff",
      popoverForeground: "#24192b",
      primary: "#8b5cf6",
      primaryForeground: "#ffffff",
      secondary: "#f3e8ff",
      secondaryForeground: "#3b1c5c",
      muted: "#ede2fb",
      mutedForeground: "#7c6b8c",
      accent: "#e4d3f9",
      accentForeground: "#24192b",
      periwinkle: "#8b5cf6",
      periwinkleSoft: "rgba(139, 92, 246, 0.14)",
      border: "#e2d1f4",
      input: "#d5bceb",
      ring: "#8b5cf6",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 249, 254, 0.92)",
      headerBackground: "rgba(250, 248, 252, 0.9)",
      themeColor: "#faf8fc",
      ink: "#24192b",
      ember: "#a78bfa",
      leaf: "#16a34a",
    },
    darkTokens: {
      background: "#16101d",
      foreground: "#f5f0fa",
      card: "#201729",
      cardForeground: "#f5f0fa",
      popover: "#281e33",
      popoverForeground: "#f5f0fa",
      primary: "#a78bfa",
      primaryForeground: "#16101d",
      secondary: "#2c203b",
      secondaryForeground: "#f5f0fa",
      muted: "#281e35",
      mutedForeground: "#b4a5c4",
      accent: "#3a2c4e",
      accentForeground: "#f5f0fa",
      periwinkle: "#a78bfa",
      periwinkleSoft: "rgba(167, 139, 250, 0.18)",
      border: "rgba(167, 139, 250, 0.22)",
      input: "rgba(167, 139, 250, 0.28)",
      ring: "#a78bfa",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(22, 16, 29, 0.92)",
      headerBackground: "rgba(22, 16, 29, 0.9)",
      themeColor: "#16101d",
      ink: "#f5f0fa",
      ember: "#c4b5fd",
      leaf: "#34d399",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    subtitle: "Rich ocean blue, aqua & deep midnight",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#eff6fc",
      foreground: "#0f1c2b",
      card: "#ffffff",
      cardForeground: "#0f1c2b",
      popover: "#ffffff",
      popoverForeground: "#0f1c2b",
      primary: "#0284c7",
      primaryForeground: "#ffffff",
      secondary: "#e0f2fe",
      secondaryForeground: "#034873",
      muted: "#d3eafd",
      mutedForeground: "#527591",
      accent: "#bae6fd",
      accentForeground: "#0f1c2b",
      periwinkle: "#0284c7",
      periwinkleSoft: "rgba(2, 132, 199, 0.14)",
      border: "#bae6fd",
      input: "#93c5fd",
      ring: "#0284c7",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(239, 246, 252, 0.92)",
      headerBackground: "rgba(239, 246, 252, 0.9)",
      themeColor: "#eff6fc",
      ink: "#0f1c2b",
      ember: "#0ea5e9",
      leaf: "#16a34a",
    },
    darkTokens: {
      background: "#0c1622",
      foreground: "#f0f6fc",
      card: "#142236",
      cardForeground: "#f0f6fc",
      popover: "#1a2c44",
      popoverForeground: "#f0f6fc",
      primary: "#38bdf8",
      primaryForeground: "#0c1622",
      secondary: "#1d334e",
      secondaryForeground: "#f0f6fc",
      muted: "#192e47",
      mutedForeground: "#93c5fd",
      accent: "#264368",
      accentForeground: "#f0f6fc",
      periwinkle: "#38bdf8",
      periwinkleSoft: "rgba(56, 189, 248, 0.18)",
      border: "rgba(56, 189, 248, 0.22)",
      input: "rgba(56, 189, 248, 0.28)",
      ring: "#38bdf8",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 22, 34, 0.92)",
      headerBackground: "rgba(12, 22, 34, 0.9)",
      themeColor: "#0c1622",
      ink: "#f0f6fc",
      ember: "#7dd3fc",
      leaf: "#34d399",
    },
  },
  {
    id: "matcha",
    name: "Matcha",
    subtitle: "Fresh matcha green, warm cream & muted olive",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-matcha.webp",
    tokens: {
      background: "#0c1810",
      foreground: "#f4f9f1",
      card: "#142419",
      cardForeground: "#f4f9f1",
      popover: "#1a2e21",
      popoverForeground: "#f4f9f1",
      primary: "#22c55e",
      primaryForeground: "#0c1810",
      secondary: "#1e3324",
      secondaryForeground: "#f4f9f1",
      muted: "#1a2f20",
      mutedForeground: "#9cbca5",
      accent: "#284631",
      accentForeground: "#f4f9f1",
      periwinkle: "#4ade80",
      periwinkleSoft: "rgba(74, 222, 128, 0.16)",
      border: "rgba(74, 222, 128, 0.2)",
      input: "rgba(74, 222, 128, 0.26)",
      ring: "#4ade80",
      positive: "#4ade80",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 24, 16, 0.92)",
      headerBackground: "rgba(12, 24, 16, 0.9)",
      themeColor: "#0c1810",
      ink: "#f4f9f1",
      ember: "#86efac",
      leaf: "#22c55e",
    },
    lightTokens: {
      background: "#f4f9f1",
      foreground: "#152419",
      card: "#ffffff",
      cardForeground: "#152419",
      popover: "#ffffff",
      popoverForeground: "#152419",
      primary: "#16a34a",
      primaryForeground: "#ffffff",
      secondary: "#e8f5e9",
      secondaryForeground: "#103318",
      muted: "#ddeee0",
      mutedForeground: "#5c7c63",
      accent: "#cfe6d4",
      accentForeground: "#152419",
      periwinkle: "#16a34a",
      periwinkleSoft: "rgba(22, 163, 74, 0.12)",
      border: "#c5dfcb",
      input: "#b2d4b9",
      ring: "#16a34a",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(244, 249, 241, 0.92)",
      headerBackground: "rgba(244, 249, 241, 0.9)",
      themeColor: "#f4f9f1",
      ink: "#152419",
      ember: "#16a34a",
      leaf: "#16a34a",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    subtitle: "Warm amber, peach, coral & deep plum",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-sunset.webp",
    tokens: {
      background: "#1c1018",
      foreground: "#fdf6f0",
      card: "#281824",
      cardForeground: "#fdf6f0",
      popover: "#321e2d",
      popoverForeground: "#fdf6f0",
      primary: "#f59e0b",
      primaryForeground: "#1c1018",
      secondary: "#3d2235",
      secondaryForeground: "#fdf6f0",
      muted: "#351e2f",
      mutedForeground: "#d4a3b8",
      accent: "#522d48",
      accentForeground: "#fdf6f0",
      periwinkle: "#fbbf24",
      periwinkleSoft: "rgba(251, 191, 36, 0.18)",
      border: "rgba(251, 191, 36, 0.22)",
      input: "rgba(251, 191, 36, 0.28)",
      ring: "#fbbf24",
      positive: "#34d399",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(28, 16, 24, 0.92)",
      headerBackground: "rgba(28, 16, 24, 0.9)",
      themeColor: "#1c1018",
      ink: "#fdf6f0",
      ember: "#f59e0b",
      leaf: "#34d399",
    },
    lightTokens: {
      background: "#fcf5ec",
      foreground: "#291823",
      card: "#ffffff",
      cardForeground: "#291823",
      popover: "#ffffff",
      popoverForeground: "#291823",
      primary: "#d97706",
      primaryForeground: "#ffffff",
      secondary: "#fef3c7",
      secondaryForeground: "#78350f",
      muted: "#fde68a",
      mutedForeground: "#8c6277",
      accent: "#fcd34d",
      accentForeground: "#291823",
      periwinkle: "#d97706",
      periwinkleSoft: "rgba(217, 119, 6, 0.14)",
      border: "#fde68a",
      input: "#fcd34d",
      ring: "#d97706",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 245, 236, 0.92)",
      headerBackground: "rgba(252, 245, 236, 0.9)",
      themeColor: "#fcf5ec",
      ink: "#291823",
      ember: "#d97706",
      leaf: "#16a34a",
    },
  },
];

export const FREE_THEMES = MEALMATE_THEMES.filter((t) => !t.premium);
export const PREMIUM_THEMES = MEALMATE_THEMES.filter((t) => t.premium);

const LEGACY_THEME_MAP: Record<string, MealMateThemeId> = {
  classic: "classic-light",
  light: "classic-light",
  "minimal-white": "classic-light",
  "soft-lavender": "lavender-dream",
  dark: "midnight-black",
  midnight: "midnight",
  "dark-premium": "midnight",
  "royal-navy": "midnight",
  ocean: "ocean",
  "arctic-blue": "ocean",
  sunset: "sunset",
  cherry: "cherry",
  matcha: "matcha",
  graphite: "matcha",
  "lavender-dream": "lavender-dream",
  "classic-green": "matcha",
  obsidian: "cherry",
  "midnight-pro": "midnight",
  "ocean-blue": "ocean",
  aurora: "matcha",
};

const MASCOT_ALIAS_MAP: Record<MealMateThemeId, string> = {
  "classic-light": "classic",
  "midnight-black": "classic",
  cherry: "cherry",
  midnight: "midnight",
  "lavender-dream": "classic",
  ocean: "ocean",
  matcha: "matcha",
  sunset: "sunset",
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
  root.classList.toggle("dark-premium", theme.id === "midnight" && theme.premium && isDark);
  root.style.colorScheme = effectiveScheme;
  root.dataset["appTheme"] = theme.id;
  root.dataset["mascot"] = MASCOT_ALIAS_MAP[theme.id] ?? "classic";
  root.dataset["theme"] =
    options?.legacyDatasetTheme ??
    (theme.id === "midnight" && theme.premium && isDark
      ? "dark-premium"
      : isDark
        ? "dark"
        : "light");

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
    "--market-hero": "oklch(0.98 0.01 120)",
    "--brand": t.primary,
    "--brand-dark": t.primary,
    "--brand-foreground": t.primaryForeground,
  };

  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }

  let metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metaTheme && document.head) {
    metaTheme = document.createElement("meta");
    metaTheme.name = "theme-color";
    document.head.appendChild(metaTheme);
  }
  if (metaTheme) {
    metaTheme.content = t.themeColor;
  }

  const metaStatus = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (metaStatus) {
    metaStatus.content = isDark ? "black-translucent" : "default";
  }

  const metaNavButton = document.querySelector<HTMLMetaElement>(
    'meta[name="msapplication-navbutton-color"]',
  );
  if (metaNavButton) {
    metaNavButton.content = t.themeColor;
  }

  if (document.body) {
    document.body.style.backgroundColor = t.background;
  }

  // Synchronize native Android status bar & navigation bar when hosted in Capacitor
  if (typeof window !== "undefined") {
    try {
      const cap = (
        window as unknown as {
          Capacitor?: {
            isNativePlatform?: () => boolean;
            Plugins?: {
              StatusBar?: {
                setBackgroundColor?: (opts: { color: string }) => Promise<void>;
                setStyle?: (opts: { style: "DARK" | "LIGHT" }) => Promise<void>;
              };
              NavigationBar?: {
                setNavigationBarColor?: (opts: {
                  color: string;
                  darkButtons?: boolean;
                }) => Promise<void>;
              };
            };
          };
        }
      ).Capacitor;
      if (cap?.isNativePlatform?.()) {
        const sb = cap.Plugins?.StatusBar;
        void sb?.setBackgroundColor?.({ color: t.themeColor })?.catch(() => undefined);
        void sb?.setStyle?.({ style: isDark ? "DARK" : "LIGHT" })?.catch(() => undefined);
        const nb = cap.Plugins?.NavigationBar;
        void nb
          ?.setNavigationBarColor?.({ color: t.themeColor, darkButtons: !isDark })
          ?.catch(() => undefined);
      }
    } catch {
      /* ignore native bridge errors */
    }
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
)});var pick=k2&&m[k2]?k2:(k2&&lg[k2]?lg[k2]:null);if(!pick){var sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(ap==="dark-premium")pick="midnight-pro";else if(ap==="dark")pick="midnight-black";else if(ap==="light")pick="classic-light";else if(ms&&lg[ms])pick=lg[ms];else if(ms&&m[ms])pick=ms;else pick=sysDark?"midnight-black":"classic-light";}var d=(ks2==="light"||ks2==="dark")&&sm[pick]&&sm[pick][ks2]?sm[pick][ks2]:(m[pick]||m["classic-light"]);var r=document.documentElement;var dark=d[0]==="dark";r.classList.toggle("dark",dark);r.classList.toggle("dark-premium",pick==="midnight-pro"&&dark);r.style.colorScheme=d[0];r.dataset.appTheme=pick;r.dataset.mascot=ma[pick]||"classic";r.dataset.theme=pick==="midnight-pro"&&dark?"dark-premium":(dark?"dark":"light");for(var i=0;i<ks.length;i++){r.style.setProperty(ks[i],d[i+1]);}r.style.setProperty("--cream",d[3]);r.style.setProperty("--ink",d[27]);r.style.setProperty("--ember",d[28]);r.style.setProperty("--leaf",d[29]);r.style.setProperty("--market-hero","oklch(0.98 0.01 120)");r.style.setProperty("--brand",d[7]);r.style.setProperty("--brand-dark",d[7]);r.style.setProperty("--brand-foreground",d[8]);var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",d[26]);var msb=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(msb)msb.setAttribute("content",dark?"black-translucent":"default");var f=localStorage.getItem("mealmate-font");r.dataset.font=(f==="editorial"||f==="jakarta"||f==="outfit"||f==="dm"||f==="fraunces")?f:"editorial";}catch(e){}})();`;
