export type ThemeColorScheme = "light" | "dark";

export type MealMateThemeId =
  | "classic-light"
  | "midnight-black"
  | "ocean-blue"
  | "soft-lavender"
  | "midnight-pro"
  | "arctic-blue"
  | "graphite"
  | "aurora"
  | "royal-navy"
  | "obsidian"
  | "sunset"
  | "minimal-white";

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
  // ---- FREE THEMES (4) ----
  {
    id: "classic-light",
    name: "Classic Light",
    subtitle: "Crisp paper & warm ink",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#fafafa",
      foreground: "#09090b",
      card: "#ffffff",
      cardForeground: "#09090b",
      popover: "#ffffff",
      popoverForeground: "#09090b",
      primary: "#09090b",
      primaryForeground: "#ffffff",
      secondary: "#f4f4f5",
      secondaryForeground: "#09090b",
      muted: "#f1f1f4",
      mutedForeground: "#52525b",
      accent: "#f4f4f5",
      accentForeground: "#09090b",
      periwinkle: "#4f5fe8",
      periwinkleSoft: "rgba(79, 95, 232, 0.11)",
      border: "#e4e4e7",
      input: "#d4d4d8",
      ring: "#4f5fe8",
      positive: "#15803d",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(250, 250, 250, 0.92)",
      headerBackground: "rgba(250, 250, 250, 0.92)",
      themeColor: "#fafafa",
    },
  },
  {
    id: "midnight-black",
    name: "Midnight Black",
    subtitle: "True OLED dark charcoal",
    colorScheme: "dark",
    premium: false,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "#080808",
      foreground: "#ffffff",
      card: "#141414",
      cardForeground: "#ffffff",
      popover: "#181818",
      popoverForeground: "#ffffff",
      primary: "#ffffff",
      primaryForeground: "#080808",
      secondary: "#111111",
      secondaryForeground: "#ffffff",
      muted: "#1a1a1a",
      mutedForeground: "#a1a1aa",
      accent: "#1c1c1e",
      accentForeground: "#ffffff",
      periwinkle: "#7c8cff",
      periwinkleSoft: "rgba(124, 140, 255, 0.15)",
      border: "#262626",
      input: "#303030",
      ring: "#7c8cff",
      positive: "#22c55e",
      negative: "#ef4444",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(8, 8, 8, 0.92)",
      headerBackground: "rgba(8, 8, 8, 0.92)",
      themeColor: "#080808",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    subtitle: "Coastal mist & deep sea",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#f2f7fb",
      foreground: "#0a2239",
      card: "#ffffff",
      cardForeground: "#0a2239",
      popover: "#ffffff",
      popoverForeground: "#0a2239",
      primary: "#0b4f82",
      primaryForeground: "#ffffff",
      secondary: "#e6f0f8",
      secondaryForeground: "#0a2239",
      muted: "#e9f2f9",
      mutedForeground: "#415e78",
      accent: "#dcebf7",
      accentForeground: "#0a2239",
      periwinkle: "#0284c7",
      periwinkleSoft: "rgba(2, 132, 199, 0.12)",
      border: "#d0e2f0",
      input: "#bdd5e8",
      ring: "#0284c7",
      positive: "#0f766e",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(242, 247, 251, 0.92)",
      headerBackground: "rgba(242, 247, 251, 0.92)",
      themeColor: "#f2f7fb",
    },
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    subtitle: "Lilac silk & plum ink",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#f7f5fc",
      foreground: "#1d1633",
      card: "#ffffff",
      cardForeground: "#1d1633",
      popover: "#ffffff",
      popoverForeground: "#1d1633",
      primary: "#31235c",
      primaryForeground: "#ffffff",
      secondary: "#efeaf9",
      secondaryForeground: "#1d1633",
      muted: "#ede7f7",
      mutedForeground: "#5b507a",
      accent: "#e6def6",
      accentForeground: "#1d1633",
      periwinkle: "#6d5ce8",
      periwinkleSoft: "rgba(109, 92, 232, 0.12)",
      border: "#e0d7f3",
      input: "#cfc2eb",
      ring: "#6d5ce8",
      positive: "#15803d",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(247, 245, 252, 0.92)",
      headerBackground: "rgba(247, 245, 252, 0.92)",
      themeColor: "#f7f5fc",
    },
  },

  // ---- PREMIUM THEMES (8) ----
  {
    id: "midnight-pro",
    name: "Midnight Pro",
    subtitle: "Deep indigo & sapphire",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "#050814",
      foreground: "#f8faff",
      card: "#0d152b",
      cardForeground: "#f8faff",
      popover: "#121c38",
      popoverForeground: "#f8faff",
      primary: "#eef2ff",
      primaryForeground: "#050814",
      secondary: "#0a1022",
      secondaryForeground: "#f8faff",
      muted: "#131c38",
      mutedForeground: "#9aa8c7",
      accent: "#172242",
      accentForeground: "#f8faff",
      periwinkle: "#8594ff",
      periwinkleSoft: "rgba(133, 148, 255, 0.16)",
      border: "#1e2b4d",
      input: "#2a3b68",
      ring: "#8594ff",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(5, 8, 20, 0.90)",
      headerBackground: "rgba(5, 8, 20, 0.90)",
      themeColor: "#050814",
    },
  },
  {
    id: "arctic-blue",
    name: "Arctic Blue",
    subtitle: "Polar slate & ice cyan",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#06121d",
      foreground: "#eef7ff",
      card: "#0d2030",
      cardForeground: "#eef7ff",
      popover: "#12283b",
      popoverForeground: "#eef7ff",
      primary: "#e0f2fe",
      primaryForeground: "#06121d",
      secondary: "#0a1927",
      secondaryForeground: "#eef7ff",
      muted: "#122739",
      mutedForeground: "#8fb4cf",
      accent: "#163047",
      accentForeground: "#eef7ff",
      periwinkle: "#38bdf8",
      periwinkleSoft: "rgba(56, 189, 248, 0.15)",
      border: "#1a364e",
      input: "#244866",
      ring: "#38bdf8",
      positive: "#2dd4bf",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(6, 18, 29, 0.92)",
      headerBackground: "rgba(6, 18, 29, 0.92)",
      themeColor: "#06121d",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    subtitle: "Matte titanium & silver",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#121316",
      foreground: "#f4f4f6",
      card: "#1b1d22",
      cardForeground: "#f4f4f6",
      popover: "#21242a",
      popoverForeground: "#f4f4f6",
      primary: "#f4f4f6",
      primaryForeground: "#121316",
      secondary: "#16181c",
      secondaryForeground: "#f4f4f6",
      muted: "#22252b",
      mutedForeground: "#a1a7b3",
      accent: "#272b33",
      accentForeground: "#f4f4f6",
      periwinkle: "#c0c6d4",
      periwinkleSoft: "rgba(192, 198, 212, 0.14)",
      border: "#2c3038",
      input: "#393e48",
      ring: "#c0c6d4",
      positive: "#4ade80",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(18, 19, 22, 0.92)",
      headerBackground: "rgba(18, 19, 22, 0.92)",
      themeColor: "#121316",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    subtitle: "Nordic pine & emerald",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-matcha.webp",
    tokens: {
      background: "#061311",
      foreground: "#ecfdf7",
      card: "#0d201c",
      cardForeground: "#ecfdf7",
      popover: "#112823",
      popoverForeground: "#ecfdf7",
      primary: "#d1fae5",
      primaryForeground: "#061311",
      secondary: "#091916",
      secondaryForeground: "#ecfdf7",
      muted: "#122924",
      mutedForeground: "#8cbab0",
      accent: "#16332d",
      accentForeground: "#ecfdf7",
      periwinkle: "#34d399",
      periwinkleSoft: "rgba(52, 211, 153, 0.15)",
      border: "#193932",
      input: "#224c43",
      ring: "#34d399",
      positive: "#34d399",
      negative: "#fb7185",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(6, 19, 17, 0.92)",
      headerBackground: "rgba(6, 19, 17, 0.92)",
      themeColor: "#061311",
    },
  },
  {
    id: "royal-navy",
    name: "Royal Navy",
    subtitle: "Tailored navy & warm gold",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "#091124",
      foreground: "#f8fafc",
      card: "#111d3a",
      cardForeground: "#f8fafc",
      popover: "#162547",
      popoverForeground: "#f8fafc",
      primary: "#f8fafc",
      primaryForeground: "#091124",
      secondary: "#0d1730",
      secondaryForeground: "#f8fafc",
      muted: "#172546",
      mutedForeground: "#9aa9c9",
      accent: "#1c2d54",
      accentForeground: "#f8fafc",
      periwinkle: "#e2b74d",
      periwinkleSoft: "rgba(226, 183, 77, 0.16)",
      border: "#22335e",
      input: "#2e447a",
      ring: "#e2b74d",
      positive: "#34d399",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(9, 17, 36, 0.92)",
      headerBackground: "rgba(9, 17, 36, 0.92)",
      themeColor: "#091124",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    subtitle: "Volcanic dark & copper",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-cherry.webp",
    tokens: {
      background: "#0a090b",
      foreground: "#fafaf9",
      card: "#151317",
      cardForeground: "#fafaf9",
      popover: "#1b181e",
      popoverForeground: "#fafaf9",
      primary: "#fafaf9",
      primaryForeground: "#0a090b",
      secondary: "#111013",
      secondaryForeground: "#fafaf9",
      muted: "#1e1b21",
      mutedForeground: "#a8a2ae",
      accent: "#252128",
      accentForeground: "#fafaf9",
      periwinkle: "#fb923c",
      periwinkleSoft: "rgba(251, 146, 60, 0.15)",
      border: "#2a262f",
      input: "#38323e",
      ring: "#fb923c",
      positive: "#4ade80",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(10, 9, 11, 0.92)",
      headerBackground: "rgba(10, 9, 11, 0.92)",
      themeColor: "#0a090b",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    subtitle: "Warm sandstone & terracotta",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-sunset.webp",
    tokens: {
      background: "#fbf6f1",
      foreground: "#24140d",
      card: "#ffffff",
      cardForeground: "#24140d",
      popover: "#ffffff",
      popoverForeground: "#24140d",
      primary: "#2d170d",
      primaryForeground: "#fffaf5",
      secondary: "#f5ebe2",
      secondaryForeground: "#24140d",
      muted: "#f2e7dd",
      mutedForeground: "#735544",
      accent: "#edddd0",
      accentForeground: "#24140d",
      periwinkle: "#d95f28",
      periwinkleSoft: "rgba(217, 95, 40, 0.12)",
      border: "#ead9cb",
      input: "#ddc5b2",
      ring: "#d95f28",
      positive: "#15803d",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(251, 246, 241, 0.92)",
      headerBackground: "rgba(251, 246, 241, 0.92)",
      themeColor: "#fbf6f1",
    },
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    subtitle: "Gallery white & pure ink",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#ffffff",
      foreground: "#0a0a0a",
      card: "#fafafa",
      cardForeground: "#0a0a0a",
      popover: "#ffffff",
      popoverForeground: "#0a0a0a",
      primary: "#0a0a0a",
      primaryForeground: "#ffffff",
      secondary: "#f5f5f5",
      secondaryForeground: "#0a0a0a",
      muted: "#f4f4f5",
      mutedForeground: "#636366",
      accent: "#efefef",
      accentForeground: "#0a0a0a",
      periwinkle: "#171717",
      periwinkleSoft: "rgba(23, 23, 23, 0.08)",
      border: "#e5e5e5",
      input: "#d4d4d4",
      ring: "#171717",
      positive: "#15803d",
      negative: "#dc2626",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(255, 255, 255, 0.94)",
      headerBackground: "rgba(255, 255, 255, 0.94)",
      themeColor: "#ffffff",
    },
  },
];

export const FREE_THEMES = MEALMATE_THEMES.filter((t) => !t.premium);
export const PREMIUM_THEMES = MEALMATE_THEMES.filter((t) => t.premium);

const LEGACY_THEME_MAP: Record<string, MealMateThemeId> = {
  classic: "classic-light",
  light: "classic-light",
  dark: "midnight-black",
  midnight: "midnight-black",
  "dark-premium": "midnight-pro",
  ocean: "ocean-blue",
  sunset: "sunset",
  cherry: "obsidian",
  matcha: "aurora",
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
  root.dataset["mascot"] = theme.id;
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
)};var lg=${JSON.stringify(LEGACY_THEME_MAP)};var ks=${JSON.stringify(
  BOOT_KEYS,
)};var k2=localStorage.getItem(${JSON.stringify(
  THEME_V2_STORAGE_KEY,
)});var ap=localStorage.getItem(${JSON.stringify(
  LEGACY_APPEARANCE_STORAGE_KEY,
)});var ms=localStorage.getItem(${JSON.stringify(
  LEGACY_MASCOT_STORAGE_KEY,
)});var pick=k2&&m[k2]?k2:null;if(!pick){var sysDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(ap==="dark-premium")pick="midnight-pro";else if(ap==="dark")pick="midnight-black";else if(ap==="light")pick="classic-light";else if(ms&&lg[ms])pick=lg[ms];else if(ms&&m[ms])pick=ms;else pick=sysDark?"midnight-black":"classic-light";}var d=m[pick]||m["classic-light"];var r=document.documentElement;var dark=d[0]==="dark";r.classList.toggle("dark",dark);r.classList.toggle("dark-premium",pick==="midnight-pro");r.style.colorScheme=d[0];r.dataset.appTheme=pick;r.dataset.mascot=pick;r.dataset.theme=pick==="midnight-pro"?"dark-premium":(dark?"dark":"light");for(var i=0;i<ks.length;i++){r.style.setProperty(ks[i],d[i+1]);}r.style.setProperty("--cream",d[3]);r.style.setProperty("--ink",d[2]);r.style.setProperty("--ember",d[15]);r.style.setProperty("--leaf",d[20]);r.style.setProperty("--market-hero",d[2]);r.style.setProperty("--brand",d[15]);r.style.setProperty("--brand-dark",d[15]);r.style.setProperty("--brand-foreground",d[8]);var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",d[26]);var f=localStorage.getItem("mealmate-font");r.dataset.font=(f==="jakarta"||f==="outfit"||f==="dm"||f==="fraunces")?f:"jakarta";}catch(e){}})();`;
