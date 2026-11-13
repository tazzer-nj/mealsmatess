import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { property: "og:title", content: "About · MealMate" },
      { property: "og:description", content: "About MealMate Consumer by Taz Technologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "About · MealMate" },
      { name: "description", content: "About MealMate Consumer by Taz Technologies." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 bg-background px-4 py-10 text-foreground">
      <Link
        to="/settings"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <MealMateLogo imageClassName="size-10 rounded-xl border border-border" />
        <div>
          <span className="text-xs font-medium text-[var(--periwinkle)]">Taz Technologies</span>
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            MealMate Consumer
          </h1>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Discover. Plan. Eat. Enjoy. MealMate is your personal food companion—bringing together
        tailored recipes, pantry management, dining discovery, smart meal planning, and hands-free
        cooking guidance with Mia.
      </p>

      <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card text-sm">
        <div className="flex justify-between px-4 py-3.5">
          <dt className="text-muted-foreground">Version</dt>
          <dd className="font-mono text-xs font-medium text-foreground">v2.4.0</dd>
        </div>
        <div className="flex justify-between px-4 py-3.5">
          <dt className="text-muted-foreground">Publisher</dt>
          <dd className="font-medium text-foreground">Taz Technologies</dd>
        </div>
        <div className="flex justify-between px-4 py-3.5">
          <dt className="text-muted-foreground">Tagline</dt>
          <dd className="font-medium text-foreground">Discover. Plan. Eat. Enjoy.</dd>
        </div>
      </dl>
    </main>
  );
}
