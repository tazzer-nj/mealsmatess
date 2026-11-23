import { MiaProvider } from "@/components/mia-provider";
import { HubContext } from "@/components/hub/hub-context";
import { HubShell } from "@/components/hub/hub-shell";
import { isHubSurface } from "@/lib/hub-surface";
import { requestHostname } from "@/lib/hub-request";
import { SplashScreen } from "@/components/splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

import { AuthGate } from "@/components/auth-gate";
import { MascotThemeProvider } from "@/hooks/use-mascot-theme";
import { THEME_BOOT_SCRIPT } from "@/lib/mascot-theme";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { UpgradeModalProvider } from "@/components/upgrade-modal";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";
import { GlobalLoadingCompanion } from "@/components/global-loading-companion";
import { WebMcpProvider } from "@/components/web-mcp-provider";
import { useShellMetrics } from "@/hooks/use-shell-metrics";
import { useSession } from "@/hooks/use-session";
import {
  myFavoritesQuery,
  myPantryQuery,
  southAfricanFavoritesQuery,
  trendingRecipesQuery,
} from "@/lib/queries";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-6xl font-medium tracking-tight text-foreground">404</h1>
        <h2 className="mt-3 text-xl font-medium text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function isModuleFetchError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk/i.test(
    msg,
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if (isModuleFetchError(error) && typeof window !== "undefined") {
      try {
        const key = "mealmate-chunk-reload";
        if (!window.sessionStorage.getItem(key)) {
          window.sessionStorage.setItem(key, "1");
          window.location.reload();
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-secondary px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => ({ isHub: isHubSurface(requestHostname(), location.pathname) }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        name: "google-site-verification",
        content: "U6Y3az-2aYiYoygTitJ1URIuTNWCwkbfNVznjygMimg",
      },
      { name: "theme-color", content: "#f8faf6" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "MealMate" },
      { name: "application-name", content: "MealMate" },
      { title: "MealMate – AI Recipe Generator, Meal Planner & Smart Pantry" },
      {
        name: "description",
        content:
          "Cook smarter with Mia AI voice chef, fridge photo scanning, weekly meal planning, aisle-sorted grocery lists, and local dining.",
      },
      { name: "author", content: "MealMate · Taz Technologies" },
      { property: "og:site_name", content: "MealMate" },
      {
        property: "og:title",
        content: "MealMate – AI Recipe Generator, Meal Planner & Smart Pantry",
      },
      {
        property: "og:description",
        content:
          "Cook smarter with Mia AI voice chef, fridge photo scanning, weekly meal planning, aisle-sorted grocery lists, and local dining.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "MealMate – AI Recipe Generator, Meal Planner & Smart Pantry",
      },
      {
        name: "twitter:description",
        content:
          "Cook smarter with Mia AI voice chef, fridge photo scanning, weekly meal planning, aisle-sorted grocery lists, and local dining.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png", id: "app-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "alternate",
        type: "text/markdown",
        href: "/llms.txt",
        title: "MealMate Features & AI Context Directory",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
        sizes: "180x180",
        id: "apple-touch-icon",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=DM+Serif+Display&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const MEALMATE_SCHEMA_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MealMate",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, iOS, Android",
  url: "https://mealsmates.site",
  description:
    "Personal food companion featuring Mia AI voice cooking, fridge photo scanning, AI recipe generation, smart pantry tracking, weekly meal planning, aisle-sorted grocery lists, and local dining discovery.",
  featureList: [
    "Mia AI Voice Sous Chef for hands-free step-by-step cooking",
    "Fridge & Pantry Photo Scanner for instant ingredient-matched recipes",
    "AI Recipe Generator tailored to dietary goals, allergies, and cooking time",
    "Smart Pantry Inventory & Zero-Waste Alerts",
    "Weekly Meal Planner with Aisle-Sorted Grocery Lists",
    "Local Restaurant & Dining Discovery",
    "Offline Cookbook, Nutrition Insights & Ingredient Substitutions",
    "MealMate Hub Partner Platform for Culinary Merchants",
  ],
  publisher: {
    "@type": "Organization",
    name: "Taz Technologies",
    url: "https://mealsmates.site",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "3-day free trial included across Monthly, Annual, and Family plans",
  },
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: MEALMATE_SCHEMA_JSON_LD }}
        />
        <HeadContent />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground antialiased selection:bg-[var(--periwinkle)] selection:text-[var(--primary-foreground)]"
      >
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, isHub } = Route.useRouteContext();
  const { user } = useSession();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMarketplace = pathname === "/restaurants" || pathname.startsWith("/restaurant/");
  const isFlow =
    pathname === "/welcome" ||
    pathname === "/premium" ||
    pathname === "/onboarding" ||
    pathname === "/ai-founder" ||
    pathname.startsWith("/auth");
  const isStandalonePublic =
    pathname === "/about" ||
    pathname === "/support" ||
    pathname.startsWith("/legal/") ||
    pathname === "/reset-password";
  const hideConsumerChrome = isFlow || (!user && isStandalonePublic);
  const showAppHeader = !isHub && pathname !== "/" && !isMarketplace && !hideConsumerChrome;
  useShellMetrics(showAppHeader ? "with-header" : "no-header");

  useEffect(() => {
    if (import.meta.env.DEV && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          for (const reg of regs) {
            const scriptUrl =
              reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
            if (!scriptUrl.includes("firebase-messaging-sw.js")) {
              void reg.unregister();
            }
          }
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const warmRoutesAndData = (firebaseUser: unknown) => {
      const preloadTargets = [
        "/",
        "/restaurants",
        "/chat",
        "/planner",
        "/profile",
        "/recipes",
        "/pantry",
        "/settings",
      ] as const;
      const run = () => {
        for (const to of preloadTargets) {
          void router.preloadRoute({ to }).catch(() => undefined);
        }
        if (firebaseUser) {
          void queryClient.prefetchQuery(trendingRecipesQuery()).catch(() => undefined);
          void queryClient.prefetchQuery(southAfricanFavoritesQuery()).catch(() => undefined);
          void queryClient.prefetchQuery(myFavoritesQuery()).catch(() => undefined);
          void queryClient.prefetchQuery(myPantryQuery()).catch(() => undefined);
        }
      };
      const idle = (
        globalThis as {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (idle) {
        idle(run, { timeout: 300 });
      } else {
        globalThis.setTimeout(run, 60);
      }
    };

    let initialized = false;
    let prevUid: string | null = null;
    return onAuthStateChanged(auth, (firebaseUser) => {
      const nextUid = firebaseUser?.uid ?? null;
      if (initialized && prevUid === nextUid) return;
      const switchedAccount = initialized && prevUid !== nextUid;
      initialized = true;
      prevUid = nextUid;
      if (switchedAccount) {
        router.invalidate();
      }
      if (firebaseUser) {
        if (switchedAccount) {
          void queryClient.invalidateQueries();
        }
        warmRoutesAndData(firebaseUser);
      } else if (switchedAccount) {
        queryClient.clear();
      }
    });
  }, [router, queryClient]);

  // Native Android hardware back button handling
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    let removeListener: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (cancelled) return;
      const openDialog = document.querySelector('[role="dialog"][data-state="open"]');
      if (openDialog) {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        return;
      }
      const path = router.state.location.pathname;
      if (canGoBack && path !== "/") {
        window.history.back();
        return;
      }
      if (path !== "/" && path !== "/auth") {
        void router.navigate({ to: "/" });
        return;
      }
      void CapacitorApp.exitApp();
    }).then((handle) => {
      if (cancelled) {
        void handle.remove();
      } else {
        removeListener = () => handle.remove();
      }
    });
    return () => {
      cancelled = true;
      void removeListener?.();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MascotThemeProvider>
          <LocaleProvider>
            <UpgradeModalProvider>
              <HubContext.Provider value={isHub}>
                {isHub ? (
                  <HubShell>
                    <AuthGate publicHome={pathname === "/hub"}>
                      <Outlet />
                    </AuthGate>
                  </HubShell>
                ) : (
                  <AuthGate>
                    <ConsumerAccessGate>
                      <MiaProvider>
                        <div className="theme-backdrop h-dvh w-full overflow-hidden bg-background">
                          {showAppHeader && <AppHeader />}
                          <div
                            id="app-scroll"
                            className={`h-full overflow-x-hidden overflow-y-auto overscroll-y-none ${hideConsumerChrome ? "" : "pb-[calc(var(--app-nav-h)+14px)] pt-[var(--app-header-h)]"}`}
                          >
                            <div
                              className={`mx-auto flex min-h-full w-full min-w-0 flex-col ${hideConsumerChrome ? "" : pathname === "/admin" ? "max-w-6xl" : "max-w-3xl"}`}
                            >
                              <div className="page-enter flex flex-1 flex-col">
                                <Outlet />
                              </div>
                            </div>
                          </div>
                          {hideConsumerChrome ? null : <BottomNav />}
                          <GlobalLoadingCompanion />
                        </div>
                      </MiaProvider>
                    </ConsumerAccessGate>
                  </AuthGate>
                )}
              </HubContext.Provider>
              <WebMcpProvider />
              <Toaster position="top-center" />
              {!isHub && <SplashScreen />}
            </UpgradeModalProvider>
          </LocaleProvider>
        </MascotThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
