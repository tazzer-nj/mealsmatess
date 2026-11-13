export type AppFontId = "jakarta" | "outfit" | "dm" | "fraunces";

export type AppFontOption = {
  id: AppFontId;
  label: string;
  description: string;
  previewFamily: string;
};

export const APP_FONT_STORAGE_KEY = "mealmate-font";
export const DEFAULT_APP_FONT: AppFontId = "jakarta";

export const APP_FONTS: AppFontOption[] = [
  {
    id: "jakarta",
    label: "Plus Jakarta",
    description: "Outfit display · Jakarta body",
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
  return value === "jakarta" || value === "outfit" || value === "dm" || value === "fraunces";
}
