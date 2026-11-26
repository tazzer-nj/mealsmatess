import { Sparkles, Utensils } from "lucide-react";

export function RecipeImagePlaceholder({
  recipeName,
  className = "",
}: {
  recipeName?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-secondary/50 to-muted p-6 text-center shadow-inner transition-all ${className}`}
      style={{ aspectRatio: "16 / 10" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-3 animate-pulse">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm backdrop-blur-md">
          <Utensils className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-primary uppercase">
            <Sparkles className="h-3 w-3" />
            <span>AI Food Photography</span>
          </div>
          <p className="font-display text-sm font-medium text-foreground max-w-[240px] line-clamp-1">
            {recipeName ? `Plating "${recipeName}"...` : "Plating your recipe..."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          <span>Generating fresh high-res photo</span>
        </div>
      </div>
    </div>
  );
}
