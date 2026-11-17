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
};

export type MealMateTheme = {
  id: MealMateThemeId;
  name: string;
  subtitle: string;
  colorScheme: ThemeColorScheme;
  premium: boolean;
  mascotImage: string;
  tokens: MealMateThemeTokens;
};

export const THEME_V2_STORAGE_KEY = "mealmate-theme-v2";
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
      background: "#ffffff",
      foreground: "#111111",
      card: "#ffffff",
      cardForeground: "#111111",
      popover: "#ffffff",
      popoverForeground: "#111111",
      primary: "#111111",
      primaryForeground: "#ffffff",
      secondary: "#f4f4f5",
      secondaryForeground: "#111111",
      muted: "#f4f4f5",
      mutedForeground: "#52525b",
      accent: "#e4e4e7",
      accentForeground: "#111111",
      periwinkle: "#111111",
      periwinkleSoft: "rgba(17, 17, 17, 0.08)",
      border: "#e4e4e7",
      input: "#d4d4d8",
      ring: "#111111",
      positive: "#16a34a",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(255, 255, 255, 0.94)",
      headerBackground: "rgba(255, 255, 255, 0.94)",
      themeColor: "#ffffff",
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
      background: "#080808",
      foreground: "#fafafa",
      card: "#111111",
      cardForeground: "#fafafa",
      popover: "#161616",
      popoverForeground: "#fafafa",
      primary: "#fafafa",
      primaryForeground: "#080808",
      secondary: "#18181b",
      secondaryForeground: "#fafafa",
      muted: "#1f1f23",
      mutedForeground: "#a1a1aa",
      accent: "#27272a",
      accentForeground: "#fafafa",
      periwinkle: "#fafafa",
      periwinkleSoft: "rgba(250, 250, 250, 0.12)",
      border: "#27272a",
      input: "#3f3f46",
      ring: "#fafafa",
      positive: "#4ade80",
      negative: "#ef4444",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(8, 8, 8, 0.94)",
      headerBackground: "rgba(8, 8, 8, 0.94)",
      themeColor: "#080808",
    },
  },

  // ---- 6 LOGO-MATCHED THEMES ----
  {
    id: "classic-green",
    name: "Classic Green",
    subtitle: "Fresh white, forest ink & bowl green",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#f8faf6",
      foreground: "#13341b",
      card: "#ffffff",
      cardForeground: "#13341b",
      popover: "#ffffff",
      popoverForeground: "#13341b",
      primary: "#13341b",
      primaryForeground: "#ffffff",
      secondary: "#edf3e9",
      secondaryForeground: "#13341b",
      muted: "#eaf1e5",
      mutedForeground: "#445948",
      accent: "#e2ecdb",
      accentForeground: "#13341b",
      periwinkle: "#3d7c1b",
      periwinkleSoft: "rgba(61, 124, 27, 0.12)",
      border: "#dae5d4",
      input: "#c1d2b8",
      ring: "#3d7c1b",
      positive: "#2f7d18",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(248, 250, 246, 0.92)",
      headerBackground: "rgba(248, 250, 246, 0.92)",
      themeColor: "#f8faf6",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    subtitle: "Logo golden amber & warm sunrise",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-sunset.webp",
    tokens: {
      background: "#fcf7f1",
      foreground: "#23170c",
      card: "#ffffff",
      cardForeground: "#23170c",
      popover: "#ffffff",
      popoverForeground: "#23170c",
      primary: "#2a1b0e",
      primaryForeground: "#fffaf5",
      secondary: "#f6ece1",
      secondaryForeground: "#23170c",
      muted: "#f3e8dc",
      mutedForeground: "#665544",
      accent: "#eee0d1",
      accentForeground: "#23170c",
      periwinkle: "#d95f14",
      periwinkleSoft: "rgba(217, 95, 20, 0.12)",
      border: "#eadac9",
      input: "#dcc5b0",
      ring: "#d95f14",
      positive: "#3d7c1b",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(252, 247, 241, 0.92)",
      headerBackground: "rgba(252, 247, 241, 0.92)",
      themeColor: "#fcf7f1",
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
      background: "#060b16",
      foreground: "#f5f7ff",
      card: "#0e1729",
      cardForeground: "#f5f7ff",
      popover: "#131f36",
      popoverForeground: "#f5f7ff",
      primary: "#f5f7ff",
      primaryForeground: "#060b16",
      secondary: "#0a1120",
      secondaryForeground: "#f5f7ff",
      muted: "#141f36",
      mutedForeground: "#98a8c7",
      accent: "#192642",
      accentForeground: "#f5f7ff",
      periwinkle: "#738cff",
      periwinkleSoft: "rgba(115, 140, 255, 0.16)",
      border: "#1f2e4d",
      input: "#2b3e66",
      ring: "#738cff",
      positive: "#59b533",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(6, 11, 22, 0.92)",
      headerBackground: "rgba(6, 11, 22, 0.92)",
      themeColor: "#060b16",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean",
    subtitle: "Coastal water splash & aqua blue",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#f2f7fb",
      foreground: "#0a2536",
      card: "#ffffff",
      cardForeground: "#0a2536",
      popover: "#ffffff",
      popoverForeground: "#0a2536",
      primary: "#0b4f82",
      primaryForeground: "#ffffff",
      secondary: "#e6f1f8",
      secondaryForeground: "#0a2536",
      muted: "#e8f2f9",
      mutedForeground: "#3e5c72",
      accent: "#dcebf6",
      accentForeground: "#0a2536",
      periwinkle: "#0284c7",
      periwinkleSoft: "rgba(2, 132, 199, 0.12)",
      border: "#cfe0ee",
      input: "#bbd3e6",
      ring: "#0284c7",
      positive: "#3d7c1b",
      negative: "#d93424",
      destructive: "#d93424",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(242, 247, 251, 0.92)",
      headerBackground: "rgba(242, 247, 251, 0.92)",
      themeColor: "#f2f7fb",
    },
  },
  {
    id: "aurora",
    name: "Matcha",
    subtitle: "Deep botanical leaf & fresh matcha",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-matcha.webp",
    tokens: {
      background: "#06130b",
      foreground: "#eefaf1",
      card: "#0d2115",
      cardForeground: "#eefaf1",
      popover: "#11291b",
      popoverForeground: "#eefaf1",
      primary: "#d8f7de",
      primaryForeground: "#06130b",
      secondary: "#0a1a10",
      secondaryForeground: "#eefaf1",
      muted: "#12291b",
      mutedForeground: "#8eb89b",
      accent: "#163322",
      accentForeground: "#eefaf1",
      periwinkle: "#55c746",
      periwinkleSoft: "rgba(85, 199, 70, 0.16)",
      border: "#1a3925",
      input: "#244c32",
      ring: "#55c746",
      positive: "#55c746",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(6, 19, 11, 0.92)",
      headerBackground: "rgba(6, 19, 11, 0.92)",
      themeColor: "#06130b",
    },
  },
  {
    id: "obsidian",
    name: "Cherry",
    subtitle: "Cherry crimson & blossom wine",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-cherry.webp",
    tokens: {
      background: "#0c0709",
      foreground: "#fdf5f7",
      card: "#170e12",
      cardForeground: "#fdf5f7",
      popover: "#1e1217",
      popoverForeground: "#fdf5f7",
      primary: "#fdf5f7",
      primaryForeground: "#0c0709",
      secondary: "#120a0d",
      secondaryForeground: "#fdf5f7",
      muted: "#211419",
      mutedForeground: "#b89ca4",
      accent: "#29181f",
      accentForeground: "#fdf5f7",
      periwinkle: "#f43f5e",
      periwinkleSoft: "rgba(244, 63, 94, 0.16)",
      border: "#301d24",
      input: "#422731",
      ring: "#f43f5e",
      positive: "#4ade80",
      negative: "#fb7185",
      destructive: "#e11d48",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(12, 7, 9, 0.92)",
      headerBackground: "rgba(12, 7, 9, 0.92)",
      themeColor: "#0c0709",
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
  midnight: "midnight-black",
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

export function getMealMateTheme(id: string | null | undefined): MealMateTheme {
  const normalized = normalizeThemeId(id);
  return MEALMATE_THEMES.find((t) => t.id === normalized) ?? MEALMATE_THEMES[0]!;
}

/**
 * Applies all theme CSS custom properties, classes, data attributes, and Android
 * status bar (`meta[name="theme-color"]`) onto documentElement synchronously.
 */
export function applyMealMateThemeToDom(
  themeId: MealMateThemeId,
  options?: { animate?: boolean; legacyDatasetTheme?: string },
) {
  if (typeof document === "undefined") return;
  const theme = getMealMateTheme(themeId);
  const root = document.documentElement;
  const t = theme.tokens;

  if (
    options?.animate &&
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 320);
  }

  const isDark = theme.colorScheme === "dark";
  root.classList.toggle("dark", isDark);
  root.classList.toggle("dark-premium", theme.id === "midnight-pro");
  root.style.colorScheme = theme.colorScheme;
  root.dataset["appTheme"] = theme.id;
  root.dataset["mascot"] = MASCOT_ALIAS_MAP[theme.id] ?? "classic";
  root.dataset["theme"] =
    options?.legacyDatasetTheme ??
    (theme.id === "midnight-pro" ? "dark-premium" : isDark ? "dark" : "light");

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
    "--ink": t.foreground,
    "--ember": t.periwinkle,
    "--leaf": t.positive,
    "--market-hero": t.foreground,
    "--brand": t.periwinkle,
    "--brand-dark": t.periwinkle,
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

const BOOT_MAP = Object.fromEntries(
  MEALMATE_THEMES.map((theme) => [
    theme.id,
    [
      theme.colorScheme,
      theme.tokens.background,
      theme.tokens.foreground,
      theme.tokens.card,
      theme.tokens.cardForeground,
      theme.tokens.popover,
      theme.tokens.popoverForeground,
      theme.tokens.primary,
      theme.tokens.primaryForeground,
      theme.tokens.secondary,
      theme.tokens.secondaryForeground,
      theme.tokens.muted,
      theme.tokens.mutedForeground,
      theme.tokens.accent,
      theme.tokens.accentForeground,
      theme.tokens.periwinkle,
      theme.tokens.periwinkleSoft,
      theme.tokens.border,
      theme.tokens.input,
      theme.tokens.ring,
      theme.tokens.positive,
      theme.tokens.negative,
      theme.tokens.destructive,
      theme.tokens.destructiveForeground,
      theme.tokens.navBackground,
      theme.tokens.headerBackground,
      theme.tokens.themeColor,
    ],
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
)};var lg=${JSON.stringify(LEGACY_THEME_MAP)};var ma=${JSON.stringify(
  MASCOT_ALIAS_MAP,
)};var ks=${JSON.stringify(BOOT_KEYS)};var k2=localStorage.getItem(${JSON.stringify(
  THEME_V2_STORAGE_KEY,
)});var ap=localStorage.getItem(${JSON.stringify(
  LEGACY_APPEARANCE_STORAGE_KEY,
)});var ms=localStorage.getItem(${JSON.stringify(
  LEGACY_MASCOT_STORAGE_KEY,
)});var pick=k2&&m[k2]?k2:(k2&&lg[k2]?lg[k2]:null);if(!pick){var sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(ap==="dark-premium")pick="midnight-pro";else if(ap==="dark")pick="midnight-black";else if(ap==="light")pick="classic-light";else if(ms&&lg[ms])pick=lg[ms];else if(ms&&m[ms])pick=ms;else pick=sysDark?"midnight-black":"classic-light";}var d=m[pick]||m["classic-light"];var r=document.documentElement;var dark=d[0]==="dark";r.classList.toggle("dark",dark);r.classList.toggle("dark-premium",pick==="midnight-pro");r.style.colorScheme=d[0];r.dataset.appTheme=pick;r.dataset.mascot=ma[pick]||"classic";r.dataset.theme=pick==="midnight-pro"?"dark-premium":(dark?"dark":"light");for(var i=0;i<ks.length;i++){r.style.setProperty(ks[i],d[i+1]);}r.style.setProperty("--cream",d[3]);r.style.setProperty("--ink",d[2]);r.style.setProperty("--ember",d[15]);r.style.setProperty("--leaf",d[20]);r.style.setProperty("--market-hero",d[2]);r.style.setProperty("--brand",d[15]);r.style.setProperty("--brand-dark",d[15]);r.style.setProperty("--brand-foreground",d[8]);var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",d[26]);var f=localStorage.getItem("mealmate-font");r.dataset.font=(f==="jakarta"||f==="outfit"||f==="dm"||f==="fraunces")?f:"jakarta";}catch(e){}})();`;
