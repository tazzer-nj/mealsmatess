import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PremiumFeatureLock({
  title,
  description,
  featureLabel = "MealMate Premium",
}: {
  title: string;
  description: string;
  featureLabel?: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center text-foreground">
      <div className="w-full rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary text-primary">
          <Crown className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {featureLabel}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="min-h-12 rounded-xl px-6">
            <Link to="/premium">
              Start 3-day free trial
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-h-12 rounded-xl border-border px-5"
          >
            <Link to="/restaurants">
              <Utensils className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Explore Dining (unlocked)
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
