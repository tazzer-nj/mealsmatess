import { Link } from "@tanstack/react-router";
import { ChevronRight, Palette } from "lucide-react";
import { ThemeGallery } from "@/components/theme-gallery";

/** App theme section embedded on Profile & Settings. */
export function ThemePicker() {
  return (
    <section className="mt-6" aria-labelledby="theme-heading">
      <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Palette className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
          <h2
            id="theme-heading"
            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Themes
          </h2>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--periwinkle)] hover:underline"
        >
          All settings
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ThemeGallery compact />
    </section>
  );
}
