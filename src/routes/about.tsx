import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Camera,
  ChevronLeft,
  Mic,
  Refrigerator,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";

const ABOUT_FEATURES_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "MealMate Features & Platform Overview",
      url: "https://mealsmates.site/about",
      description:
        "Explore MealMate features: Mia AI voice cooking assistant, fridge photo scanner, AI recipe generator, smart pantry inventory, weekly meal planner, aisle-sorted grocery lists, and local dining.",
    },
    {
      "@type": "SoftwareApplication",
      name: "MealMate",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web, iOS, Android",
      url: "https://mealsmates.site",
      creator: {
        "@type": "Person",
        name: "Samuel (Taz)",
      },
      publisher: {
        "@type": "Organization",
        name: "Taz Technologies",
      },
      featureList: [
        "Mia AI Voice Sous Chef (Hands-Free Step-by-Step Cooking)",
        "Fridge & Ingredient Photo Scanner",
        "AI Recipe Generator for Custom Dietary & Budget Needs",
        "Smart Pantry Tracking & Zero-Waste Suggestions",
        "Weekly Meal Planner & Aisle-Sorted Grocery Lists",
        "Curated Recipe Catalog with Nutrition & Substitutions",
        "Local Restaurant & Dining Discovery",
        "MealMate Hub for Partner Kitchens",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "3-day free trial included on Monthly, Annual, and Family plans.",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What features does MealMate include?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MealMate includes Mia AI voice cooking guidance, camera-based fridge and ingredient scanning, custom AI recipe generation, smart pantry tracking, weekly meal planning with aisle-sorted grocery lists, saved cookbooks, ingredient substitutions, and local restaurant discovery.",
          },
        },
        {
          "@type": "Question",
          name: "Does MealMate offer a free trial?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Every MealMate Premium plan (Annual, Monthly, and Family) includes a 3-day free trial with a renewal reminder before billing.",
          },
        },
      ],
    },
  ],
};

const CORE_FEATURES = [
  {
    icon: Mic,
    title: "Mia AI Voice Sous Chef",
    summary:
      "Cook hands-free with voice-guided instructions, step-by-step timers, ingredient answers, and real-time kitchen help when your hands are busy.",
  },
  {
    icon: Camera,
    title: "Fridge & Ingredient Photo Scanner",
    summary:
      "Snap a photo of your fridge, pantry shelf, or raw ingredients and MealMate identifies what you have to match complete recipes in seconds.",
  },
  {
    icon: Sparkles,
    title: "Personalized AI Recipe Generator",
    summary:
      "Generate custom dishes around your dietary restrictions, allergies, household size, cooking skill, budget, and preferred cuisines.",
  },
  {
    icon: Refrigerator,
    title: "Smart Pantry & Zero-Waste Tracking",
    summary:
      "Keep an organized pantry inventory, prioritize expiring ingredients first, and cut monthly food waste with instant meal ideas.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Meal Planner & Aisle Grocery Lists",
    summary:
      "Schedule breakfasts, lunches, dinners, and snacks for the week, then auto-generate shopping lists grouped cleanly by grocery aisle.",
  },
  {
    icon: BookOpen,
    title: "Cookbook, Nutrition & Smart Substitutions",
    summary:
      "Save favorite recipes for offline reading, inspect calories and macros, scale servings, and swap missing ingredients in one tap.",
  },
  {
    icon: UtensilsCrossed,
    title: "Local Dining & Restaurant Discovery",
    summary:
      "Browse partner kitchens, menus, ratings, and local dining specials when you want to eat out or order directly.",
  },
  {
    icon: Store,
    title: "MealMate Hub for Culinary Partners",
    summary:
      "Dedicated merchant workspace for partner restaurants to manage menus, orders, and storefront visibility.",
  },
] as const;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "MealMate Features & Overview – AI Chef, Meal Planner & Pantry" },
      {
        name: "description",
        content:
          "Explore all MealMate features: Mia AI voice cooking, fridge photo scan, AI recipe generator, smart pantry, weekly meal planner, grocery lists, and dining.",
      },
      { name: "robots", content: "index, follow" },
      {
        property: "og:title",
        content: "MealMate Features & Overview – AI Chef, Meal Planner & Pantry",
      },
      {
        property: "og:description",
        content:
          "Explore MealMate features: Mia AI voice cooking, fridge photo scan, AI recipe generator, smart pantry, weekly meal planner, and local dining.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "MealMate Features & Overview – AI Chef, Meal Planner & Pantry",
      },
      {
        name: "twitter:description",
        content:
          "Explore MealMate features: Mia AI voice cooking, fridge photo scan, AI recipe generator, smart pantry, weekly meal planner, and local dining.",
      },
    ],
  }),
  component: AboutPage,
});

export function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 bg-background px-4 py-10 text-foreground sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_FEATURES_JSON_LD) }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to MealMate
        </Link>

        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          <span>Get Started</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <header className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3.5">
          <MealMateLogo imageClassName="size-11 rounded-xl border border-border" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--periwinkle)]">
              Taz Technologies · MealMate Consumer
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Discover. Plan. Eat. Enjoy.
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          MealMate is an all-in-one AI culinary companion that connects what is already in your
          kitchen with personalized recipes, hands-free voice cooking via Mia, smart pantry
          tracking, weekly meal plans, aisle-organized grocery lists, and local restaurant
          discovery.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <span className="rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground">
            3-day free trial on all plans
          </span>
          <span className="rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground">
            Web, iOS &amp; Android
          </span>
          <span className="rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground">
            Built by Samuel (Taz) · Taz Technologies
          </span>
        </div>
      </header>

      <section aria-labelledby="features-heading" className="mt-10">
        <div className="mb-5">
          <h2
            id="features-heading"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Everything Included in MealMate
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Built to take you from fridge scan to plated meal without juggling multiple apps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CORE_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
                  <feature.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {feature.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="specs-heading" className="mt-10">
        <h2 id="specs-heading" className="text-base font-semibold tracking-tight text-foreground">
          Platform Details
        </h2>
        <dl className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card text-sm">
          <div className="flex justify-between gap-4 px-4 py-3.5">
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-mono text-xs font-medium text-foreground">v2.4.0</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3.5">
            <dt className="text-muted-foreground">Publisher</dt>
            <dd className="font-medium text-foreground">Taz Technologies</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3.5">
            <dt className="text-muted-foreground">Founder</dt>
            <dd className="font-medium text-foreground">Samuel (Taz)</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3.5">
            <dt className="text-muted-foreground">Plans &amp; Trial</dt>
            <dd className="font-medium text-foreground">
              Annual, Monthly &amp; Family (3-day free trial)
            </dd>
          </div>
        </dl>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <nav aria-label="Public resources" className="flex flex-wrap items-center gap-4">
          <Link to="/support" className="hover:text-foreground hover:underline">
            Help Center
          </Link>
          <Link to="/auth/founder" className="hover:text-foreground hover:underline">
            Founder &amp; Company
          </Link>
          <Link to="/legal/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link to="/legal/terms" className="hover:text-foreground hover:underline">
            Terms
          </Link>
          <a href="/llms.txt" className="hover:text-foreground hover:underline">
            llms.txt
          </a>
        </nav>
        <span>MealMate · Discover. Plan. Eat. Enjoy.</span>
      </footer>
    </main>
  );
}
