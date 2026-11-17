import { useState } from "react";
import { Check, Expand, Lock, Loader2 } from "lucide-react";
import { useMascotTheme } from "@/hooks/use-mascot-theme";
import { usePremium } from "@/hooks/use-premium";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { MASCOT_THEMES } from "@/lib/mascot-theme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Native-style mascot theme setting matching https://mealsmates.lovable.app. Colourful themes are Premium, matching the artwork. */
export function ThemePicker() {
  const { theme, setTheme, saving } = useMascotTheme();
  const { isPremium } = usePremium();
  const { open } = useUpgradeModal();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <section className="mt-6" aria-labelledby="theme-heading">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2
          id="theme-heading"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          App theme
        </h2>
        {saving && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" aria-label="Saving" />
        )}
      </div>
      <div className="space-y-3 rounded-3xl border border-border bg-card p-3">
        {/* Selected theme image preview */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 p-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label={`Preview ${theme.name} theme image`}
            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src={theme.image}
              alt={`${theme.name} theme preview`}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-background/90 text-foreground opacity-90 shadow-sm">
              <Expand className="h-3 w-3" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: theme.accent }}
                aria-hidden="true"
              />
              <span className="truncate text-sm font-semibold text-foreground">{theme.name}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {theme.subtitle ?? "Tap a logo below to switch theme"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="shrink-0 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Preview
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Mascot theme"
          className="grid grid-cols-3 gap-3 sm:grid-cols-6"
        >
          {MASCOT_THEMES.map((t) => {
            const selected =
              t.id === theme.id ||
              (t.id === "classic" && theme.id === "classic-light") ||
              (t.id === "sunset" && theme.id === "sunset") ||
              (t.id === "midnight" &&
                (theme.id === "midnight-black" || theme.id === "midnight-pro")) ||
              (t.id === "ocean" && theme.id === "ocean-blue") ||
              (t.id === "cherry" && theme.id === "obsidian") ||
              (t.id === "matcha" && theme.id === "aurora");
            const locked = t.premium && !isPremium;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${t.name}${locked ? " (Premium)" : ""}`}
                onClick={() =>
                  locked
                    ? open(`Unlock the ${t.name} theme with MealMate Premium.`)
                    : void setTheme(t.id)
                }
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-1.5 text-center transition-transform active:scale-95"
              >
                <span
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-2xl border-2 transition-colors",
                    selected ? "border-foreground ring-2 ring-primary/20" : "border-transparent",
                  )}
                >
                  <img
                    src={t.image}
                    alt={`${t.name} logo`}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {locked && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 shadow-sm">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                  {selected && (
                    <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background motion-safe:animate-in motion-safe:zoom-in-50">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: t.accent }}
                    aria-hidden="true"
                  />
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>{theme.name}</DialogTitle>
            <DialogDescription>
              {theme.subtitle ?? "MealMate mascot artwork and palette preview"}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
            <img
              src={theme.image}
              alt={`${theme.name} full preview`}
              className="aspect-square w-full object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
