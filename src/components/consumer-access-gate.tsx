import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useFlowController } from "@/lib/flow-controller";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { Loader2 } from "lucide-react";

const ALLOWED_UNAUTH_PREFIXES = [
  "/auth",
  "/reset-password",
  "/legal",
  "/support",
  "/about",
  "/ai-founder",
];

function isPublicPath(pathname: string) {
  return ALLOWED_UNAUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * ConsumerAccessGate enforces the strict flow order:
 * AUTH (1) -> ONBOARDING (2) -> PREMIUM PAYWALL (3) -> APP TOUR (4) -> HOME (5)
 *
 * Rules:
 * IF unauthenticated: -> /auth
 * IF authenticated but onboarding incomplete: -> /onboarding
 * IF onboarding complete but no premium: -> /premium
 * IF onboarding complete & premium active, but tour incomplete: -> /welcome
 * IF all complete: allow access to protected application routes
 */
export function ConsumerAccessGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const [slowLoad, setSlowLoad] = useState(false);

  const { state, user, access, isAdmin } = useFlowController();
  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    if (state !== "loading") {
      setSlowLoad(false);
      return;
    }
    const timer = window.setTimeout(() => setSlowLoad(true), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state === "loading" || !online) return;

    if (state === "unauthenticated") {
      if (!isPublic) {
        void navigate({ to: "/auth", replace: true });
      }
      return;
    }

    // Authenticated states
    if (state === "onboarding_required") {
      if (pathname !== "/onboarding" && !isPublic) {
        void navigate({ to: "/onboarding", replace: true });
      }
    } else if (state === "paywall_required") {
      if (pathname !== "/premium" && !isPublic) {
        void navigate({ to: "/premium", replace: true });
      }
    } else if (state === "app_tour_required") {
      if (pathname !== "/welcome" && !isPublic) {
        void navigate({ to: "/welcome", replace: true });
      }
    } else if (state === "application_ready") {
      // If user visits auth/onboarding/welcome (or paywall as an admin) when ready, redirect straight home
      if (
        pathname === "/auth" ||
        pathname === "/onboarding" ||
        pathname === "/welcome" ||
        (isAdmin && pathname === "/premium")
      ) {
        void navigate({ to: "/", replace: true });
      }
    }
  }, [state, pathname, isPublic, isAdmin, online, navigate]);

  async function handleSignOut() {
    try {
      const { signOutUser } = await import("@/lib/firebase");
      await signOutUser();
    } catch {
      // Proceed to /auth even if Firebase sign-out fails offline.
    }
    void navigate({ to: "/auth", replace: true });
  }

  if (isPublic) return <>{children}</>;

  if (!online) {
    return (
      <main className="premium-gate" role="status">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">You’re offline</h1>
        <p className="text-sm text-muted-foreground">
          Connect to verify your subscription and continue.
        </p>
      </main>
    );
  }

  // Never trap /premium or /onboarding behind access-check error/loading screens.
  if (
    user &&
    !isAdmin &&
    pathname === "/premium" &&
    (state === "paywall_required" || state === "loading" || Boolean(access.error))
  ) {
    return <>{children}</>;
  }
  if (
    user &&
    !isAdmin &&
    pathname === "/onboarding" &&
    (state === "onboarding_required" || state === "loading")
  ) {
    return <>{children}</>;
  }
  if (state === "app_tour_required" && pathname === "/welcome") {
    return <>{children}</>;
  }

  if (user && access.error) {
    return (
      <main className="premium-gate">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          MEALMATE
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Let’s check your subscription
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We couldn’t verify access. Check your connection and try again.
        </p>
        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            onClick={() => void access.retry()}
          >
            Try again
          </button>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            onClick={() => void navigate({ to: "/premium" })}
          >
            Restore or choose a plan
          </button>
          <button
            type="button"
            className="mt-1 text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            onClick={() => void handleSignOut()}
          >
            Use a different account
          </button>
        </div>
      </main>
    );
  }

  if (state !== "application_ready") {
    return (
      <main className="premium-gate" role="status">
        <span className="premium-eyebrow">MEALMATE</span>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking your access…</span>
        </div>
        <div className="mx-auto mt-6 w-full max-w-md">
          <MiaLoadingCard
            delayMs={600}
            label="Mia is warming up your kitchen while access verifies..."
          />
        </div>
        {slowLoad && user && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              type="button"
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"
              onClick={() => void navigate({ to: "/premium" })}
            >
              View plans
            </button>
            <button
              type="button"
              className="font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </div>
        )}
      </main>
    );
  }

  return <>{children}</>;
}
