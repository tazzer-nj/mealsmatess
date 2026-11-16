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
    subtitle: "Fresh white, bowl green & forest ink",
    colorScheme: "light",
    premium: false,
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
    id: "midnight-black",
    name: "Midnight Black",
    subtitle: "True OLED dark & bowl green",
    colorScheme: "dark",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#070a07",
      foreground: "#f5faf3",
      card: "#111612",
      cardForeground: "#f5faf3",
      popover: "#161d17",
      popoverForeground: "#f5faf3",
      primary: "#f5faf3",
      primaryForeground: "#070a07",
      secondary: "#0e140f",
      secondaryForeground: "#f5faf3",
      muted: "#18211a",
      mutedForeground: "#9bb09e",
      accent: "#1d281f",
      accentForeground: "#f5faf3",
      periwinkle: "#59b533",
      periwinkleSoft: "rgba(89, 181, 51, 0.16)",
      border: "#222e24",
      input: "#2e3d30",
      ring: "#59b533",
      positive: "#59b533",
      negative: "#ef4444",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(7, 10, 7, 0.92)",
      headerBackground: "rgba(7, 10, 7, 0.92)",
      themeColor: "#070a07",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    subtitle: "Coastal mist, sea teal & fresh leaf",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#f2f7fb",
      foreground: "#0b2938",
      card: "#ffffff",
      cardForeground: "#0b2938",
      popover: "#ffffff",
      popoverForeground: "#0b2938",
      primary: "#0f4c6e",
      primaryForeground: "#ffffff",
      secondary: "#e6f0f7",
      secondaryForeground: "#0b2938",
      muted: "#e8f2f8",
      mutedForeground: "#3e5c70",
      accent: "#dcebf5",
      accentForeground: "#0b2938",
      periwinkle: "#0b7496",
      periwinkleSoft: "rgba(11, 116, 150, 0.12)",
      border: "#cfe0ec",
      input: "#bcd3e4",
      ring: "#0b7496",
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
    id: "soft-lavender",
    name: "Soft Lavender",
    subtitle: "Botanical iris, sage & plum forest",
    colorScheme: "light",
    premium: false,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#f7f5fc",
      foreground: "#1c1830",
      card: "#ffffff",
      cardForeground: "#1c1830",
      popover: "#ffffff",
      popoverForeground: "#1c1830",
      primary: "#2b234d",
      primaryForeground: "#ffffff",
      secondary: "#efeaf9",
      secondaryForeground: "#1c1830",
      muted: "#ede7f7",
      mutedForeground: "#584e78",
      accent: "#e5ddf5",
      accentForeground: "#1c1830",
      periwinkle: "#6253c7",
      periwinkleSoft: "rgba(98, 83, 199, 0.12)",
      border: "#dfd6f2",
      input: "#cec0ea",
      ring: "#6253c7",
      positive: "#3d7c1b",
      negative: "#d93424",
      destructive: "#d93424",
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
    subtitle: "Deep night, sapphire & fresh leaf",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-midnight.webp",
    tokens: {
      background: "#060b16",
      foreground: "#f6f9ff",
      card: "#0e1729",
      cardForeground: "#f6f9ff",
      popover: "#131f36",
      popoverForeground: "#f6f9ff",
      primary: "#f6f9ff",
      primaryForeground: "#060b16",
      secondary: "#0a1120",
      secondaryForeground: "#f6f9ff",
      muted: "#141f36",
      mutedForeground: "#98a8c7",
      accent: "#192642",
      accentForeground: "#f6f9ff",
      periwinkle: "#5b93ff",
      periwinkleSoft: "rgba(91, 147, 255, 0.16)",
      border: "#1f2e4d",
      input: "#2b3e66",
      ring: "#5b93ff",
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
    id: "arctic-blue",
    name: "Arctic Blue",
    subtitle: "Polar slate, ocean cyan & herb",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-ocean.webp",
    tokens: {
      background: "#06131c",
      foreground: "#eef8ff",
      card: "#0d202e",
      cardForeground: "#eef8ff",
      popover: "#122839",
      popoverForeground: "#eef8ff",
      primary: "#e0f2fe",
      primaryForeground: "#06131c",
      secondary: "#0a1925",
      secondaryForeground: "#eef8ff",
      muted: "#122737",
      mutedForeground: "#8fb4ce",
      accent: "#163044",
      accentForeground: "#eef8ff",
      periwinkle: "#29b6f6",
      periwinkleSoft: "rgba(41, 182, 246, 0.16)",
      border: "#1a364c",
      input: "#244864",
      ring: "#29b6f6",
      positive: "#59b533",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(6, 19, 28, 0.92)",
      headerBackground: "rgba(6, 19, 28, 0.92)",
      themeColor: "#06131c",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    subtitle: "Matte charcoal & logo herb green",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-matcha.webp",
    tokens: {
      background: "#111412",
      foreground: "#f3f6f4",
      card: "#1a1f1c",
      cardForeground: "#f3f6f4",
      popover: "#202622",
      popoverForeground: "#f3f6f4",
      primary: "#f3f6f4",
      primaryForeground: "#111412",
      secondary: "#161a17",
      secondaryForeground: "#f3f6f4",
      muted: "#212723",
      mutedForeground: "#9ea8a0",
      accent: "#262e29",
      accentForeground: "#f3f6f4",
      periwinkle: "#66c441",
      periwinkleSoft: "rgba(102, 196, 65, 0.15)",
      border: "#29302b",
      input: "#364039",
      ring: "#66c441",
      positive: "#66c441",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(17, 20, 18, 0.92)",
      headerBackground: "rgba(17, 20, 18, 0.92)",
      themeColor: "#111412",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    subtitle: "Deep logo forest & bright leaf",
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
    id: "royal-navy",
    name: "Royal Navy",
    subtitle: "Tailored navy, warm salmon & leaf",
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
      periwinkle: "#f0962b",
      periwinkleSoft: "rgba(240, 150, 43, 0.16)",
      border: "#22335e",
      input: "#2e447a",
      ring: "#f0962b",
      positive: "#59b533",
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
    subtitle: "Volcanic dark, salmon & tomato",
    colorScheme: "dark",
    premium: true,
    mascotImage: "/mascots/mascot-cherry.webp",
    tokens: {
      background: "#0b0909",
      foreground: "#faf8f7",
      card: "#161213",
      cardForeground: "#faf8f7",
      popover: "#1c1718",
      popoverForeground: "#faf8f7",
      primary: "#faf8f7",
      primaryForeground: "#0b0909",
      secondary: "#120f10",
      secondaryForeground: "#faf8f7",
      muted: "#1f1a1b",
      mutedForeground: "#aba2a4",
      accent: "#262022",
      accentForeground: "#faf8f7",
      periwinkle: "#f47b2a",
      periwinkleSoft: "rgba(244, 123, 42, 0.16)",
      border: "#2b2426",
      input: "#3a3134",
      ring: "#f47b2a",
      positive: "#59b533",
      negative: "#f87171",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff",
      navBackground: "rgba(11, 9, 9, 0.92)",
      headerBackground: "rgba(11, 9, 9, 0.92)",
      themeColor: "#0b0909",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    subtitle: "Logo salmon orange & forest ink",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-sunset.webp",
    tokens: {
      background: "#fcf7f1",
      foreground: "#1e2918",
      card: "#ffffff",
      cardForeground: "#1e2918",
      popover: "#ffffff",
      popoverForeground: "#1e2918",
      primary: "#21331a",
      primaryForeground: "#fffaf5",
      secondary: "#f6ece1",
      secondaryForeground: "#1e2918",
      muted: "#f3e8dc",
      mutedForeground: "#665544",
      accent: "#eee0d1",
      accentForeground: "#1e2918",
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
    id: "minimal-white",
    name: "Minimal White",
    subtitle: "Pure white, forest & bowl green",
    colorScheme: "light",
    premium: true,
    mascotImage: "/mascots/mascot-classic.png",
    tokens: {
      background: "#ffffff",
      foreground: "#13341b",
      card: "#fafafa",
      cardForeground: "#13341b",
      popover: "#ffffff",
      popoverForeground: "#13341b",
      primary: "#13341b",
      primaryForeground: "#ffffff",
      secondary: "#f4f7f2",
      secondaryForeground: "#13341b",
      muted: "#eff3ec",
      mutedForeground: "#4f6152",
      accent: "#e9efe5",
      accentForeground: "#13341b",
      periwinkle: "#3d7c1b",
      periwinkleSoft: "rgba(61, 124, 27, 0.10)",
      border: "#e2e9de",
      input: "#ccd8c6",
      ring: "#3d7c1b",
      positive: "#2f7d18",
      negative: "#d93424",
      destructive: "#d93424",
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
