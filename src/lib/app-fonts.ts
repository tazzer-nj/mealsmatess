export type AppFontId = "editorial" | "jakarta" | "outfit" | "dm" | "fraunces";

export type AppFontOption = {
  id: AppFontId;
  label: string;
  description: string;
  previewFamily: string;
};

export const APP_FONT_STORAGE_KEY = "mealmate-font";
export const DEFAULT_APP_FONT: AppFontId = "editorial";

export const APP_FONTS: AppFontOption[] = [
  {
    id: "editorial",
    label: "MealMate Editorial",
    description: "DM Serif headings & Manrope",
    previewFamily: '"DM Serif Display", Georgia, serif',
  },
  {
    id: "jakarta",
    label: "Plus Jakarta",
    description: "Outfit display & Jakarta body",
    previewFamily: '"Plus Jakarta Sans", sans-serif',
  },
  {
    id: "outfit",
    label: "Outfit",
    description: "Clean geometric sans",
    previewFamily: '"Outfit", sans-serif',
  },
  {
    id: "dm",
    label: "DM Sans",
    description: "Minimalist neutral",
    previewFamily: '"DM Sans", sans-serif',
  },
  {
    id: "fraunces",
    label: "Fraunces",
    description: "Editorial serif headings",
    previewFamily: '"Fraunces", Georgia, serif',
  },
];

export function isAppFontId(value: unknown): value is AppFontId {
  return (
    value === "editorial" ||
    value === "jakarta" ||
    value === "outfit" ||
    value === "dm" ||
    value === "fraunces"
  );
}

const APP_FONT_STYLESHEET_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=DM+Serif+Display&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";

export function ensureAppFontLoaded(font: AppFontId): void {
  if (typeof document === "undefined" || !isAppFontId(font)) return;
  const linkId = "mealmate-app-fonts";
  if (document.getElementById(linkId)) return;
  const existing = document.querySelector<HTMLLinkElement>(
    'link[href*="fonts.googleapis.com/css2"]',
  );
  if (existing) {
    existing.id ||= linkId;
    return;
  }
  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = APP_FONT_STYLESHEET_URL;
  document.head.appendChild(link);
}
