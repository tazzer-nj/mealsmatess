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

const OPTIONAL_FONT_STYLESHEETS: Record<Exclude<AppFontId, "editorial">, string> = {
  jakarta:
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
  outfit: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
  dm: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&display=swap",
  fraunces:
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap",
};

export function ensureAppFontLoaded(fontId: AppFontId) {
  if (typeof document === "undefined" || fontId === "editorial") return;
  const href = OPTIONAL_FONT_STYLESHEETS[fontId];
  const id = `mealmate-font-${fontId}`;
  if (!href || document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
