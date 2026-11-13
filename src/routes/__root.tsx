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
import { useShellMetrics } from "@/hooks/use-shell-metrics";

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

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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
      { name: "theme-color", content: "#080808" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "MealMate" },
      { name: "application-name", content: "MealMate" },
      { title: "MealMate — Make every meal better" },
      {
        name: "description",
        content:
          "MealMate is your personal food companion. Discover recipes, plan your week, and cook smarter with AI.",
      },
      { name: "author", content: "MealMate" },
      { property: "og:title", content: "MealMate — Make every meal better" },
      {
        property: "og:description",
        content: "AI-powered recipes, smart meal planning, and kitchen intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MealMate — Make every meal better" },
      {
        name: "twitter:description",
        content:
          "MealMate is your personal food companion. Discover recipes, plan your week, and cook smarter with AI.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png", id: "app-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
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
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground antialiased selection:bg-[#5B6CFA] selection:text-white"
      >
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, isHub } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMarketplace = pathname === "/restaurants" || pathname.startsWith("/restaurant/");
  const isFlow =
    pathname === "/welcome" ||
    pathname === "/premium" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/auth");
  const showAppHeader = !isHub && pathname !== "/" && !isMarketplace && !isFlow;
  useShellMetrics(showAppHeader ? "with-header" : "no-header");

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      router.invalidate();
      if (firebaseUser) void queryClient.invalidateQueries();
      else queryClient.clear();
    });
  }, [router, queryClient]);

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
                  <ConsumerAccessGate>
                    <MiaProvider>
                      <div
                        className={`theme-backdrop h-dvh w-full overflow-hidden bg-background ${isMarketplace ? "marketplace-dark" : ""}`}
                      >
                        {showAppHeader && <AppHeader />}
                        <div
                          id="app-scroll"
                          className={`h-full overflow-y-auto overscroll-y-none ${isFlow ? "" : "pb-[var(--app-nav-h)] pt-[var(--app-header-h)]"}`}
                        >
                          <div
                            className={`mx-auto flex min-h-full w-full flex-col ${isFlow ? "" : pathname === "/admin" ? "max-w-6xl" : "max-w-3xl"}`}
                          >
                            <AuthGate>
                              <div
                                key={pathname}
                                className="page-enter motion-reveal flex flex-1 flex-col"
                              >
                                <Outlet />
                              </div>
                            </AuthGate>
                          </div>
                        </div>
                        {isFlow ? null : <BottomNav />}
                      </div>
                    </MiaProvider>
                  </ConsumerAccessGate>
                )}
              </HubContext.Provider>
              <Toaster position="top-center" />
              {!isHub && <SplashScreen />}
            </UpgradeModalProvider>
          </LocaleProvider>
        </MascotThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
