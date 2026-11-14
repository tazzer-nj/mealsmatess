import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Building2, Globe, Layers, ShieldCheck, User } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { useHubSurface } from "@/components/hub/hub-context";

export const Route = createFileRoute("/auth/founder")({
  head: () => ({
    meta: [
      { title: "Founder & Company — MealMate by Taz Technologies" },
      {
        name: "description",
        content:
          "Meet Samuel (Taz), founder and developer of Taz Technologies and creator of MealMate.",
      },
      { property: "og:title", content: "Founder & Company — MealMate by Taz Technologies" },
      {
        property: "og:description",
        content:
          "MealMate is a product founded and developed under Taz Technologies by Samuel (Taz).",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: FounderCompanyPage,
});

export function FounderCompanyPage() {
  const isHub = useHubSurface();

  return (
    <main
      className={`${isHub ? "hub-auth " : ""}auth-redesign flex min-h-dvh items-center justify-center bg-background px-4 py-6 sm:px-6 lg:px-10 lg:py-10`}
    >
      <div className="auth-view-enter w-full max-w-[960px] overflow-hidden rounded-[22px] border border-border bg-card shadow-sm">
        {/* Top Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/50 px-5 py-4 sm:px-8">
          <Link
            to="/auth"
            className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Back to sign in</span>
          </Link>

          <div className="flex items-center gap-3">
            <MealMateLogo imageClassName="size-7 rounded-lg border border-border" showName />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column — Founder Profile */}
          <section className="flex flex-col justify-between border-b border-border bg-secondary/30 p-6 sm:p-8 lg:col-span-6 lg:border-b-0 lg:border-r lg:p-10">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--periwinkle)]">
                Founder &amp; Creator
              </p>

              {/* Founder Profile Header */}
              <div className="mt-5 flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-foreground text-lg font-medium tracking-tight text-background shadow-sm"
                >
                  ST
                </div>
                <div className="min-w-0">
                  <h1 className="text-balance text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-[28px]">
                    Samuel (Taz)
                  </h1>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Founder &amp; Developer of Taz Technologies.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                  &ldquo;Samuel, widely known as Taz, is the founder of Taz Technologies and the
                  creator of MealMate. He established MealMate with a vision to make cooking, meal
                  discovery and everyday dining easier through technology.&rdquo;
                </p>
              </div>
            </div>

            {/* Ownership Callout */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3.5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Ownership
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground sm:text-[13px]">
                  MealMate is a product founded and developed under Taz Technologies by Samuel
                  (Taz).
                </p>
              </div>
            </div>
          </section>

          {/* Right Column — Company & Product */}
          <section className="flex flex-col justify-between bg-card p-6 sm:p-8 lg:col-span-6 lg:p-10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
                  <Building2 className="h-4 w-4 text-[var(--periwinkle)]" />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Company
                  </p>
                  <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                    Taz Technologies
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                An independent technology brand focused on building modern digital products and
                experiences.
              </p>

              <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-secondary/40 text-sm">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0 text-[var(--periwinkle)]" />
                    <span>Founder</span>
                  </dt>
                  <dd className="text-right font-medium text-foreground">Samuel (Taz)</dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4 shrink-0 text-[var(--periwinkle)]" />
                    <span>Product</span>
                  </dt>
                  <dd className="text-right font-medium text-foreground">MealMate</dd>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0 text-[var(--periwinkle)]" />
                    <span>Website</span>
                  </dt>
                  <dd className="min-w-0 text-right">
                    <a
                      href="https://mealsmates.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all font-medium text-foreground underline underline-offset-4 transition-colors hover:text-[var(--periwinkle)]"
                    >
                      <span>https://mealsmates.site</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <footer className="mt-8 border-t border-border pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to="/auth"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to authentication</span>
                </Link>

                <nav
                  aria-label="Legal and support links"
                  className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
                >
                  <Link
                    to="/legal/privacy"
                    className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                  >
                    Privacy
                  </Link>
                  <span aria-hidden="true" className="text-border">
                    |
                  </span>
                  <Link
                    to="/support"
                    className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                  >
                    Help
                  </Link>
                  <span aria-hidden="true" className="text-border">
                    |
                  </span>
                  <Link
                    to="/legal/terms"
                    className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                  >
                    Terms
                  </Link>
                </nav>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
