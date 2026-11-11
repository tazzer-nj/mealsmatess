import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useFlowController } from "@/lib/flow-controller";
import { Loader2 } from "lucide-react";

const ALLOWED_UNAUTH_PREFIXES = [
  "/auth",
  "/reset-password",
  "/legal",
  "/support",
  "/about",
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

  const { state, user, access } = useFlowController();
  const isPublic = isPublicPath(pathname);

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
      // If user visits auth/onboarding/welcome/premium when fully completed, redirect to home
      if (pathname === "/auth" || pathname === "/onboarding" || pathname === "/welcome") {
        void navigate({ to: "/", replace: true });
      }
    }
  }, [state, pathname, isPublic, online, navigate]);

  if (isPublic) return <>{children}</>;

  if (!online) {
    return (
      <main className="premium-gate" role="status">
        <h1>You’re offline</h1>
        <p>Connect to verify your subscription and continue.</p>
      </main>
    );
  }

  if (user && access.error) {
    return (
      <main className="premium-gate">
        <h1>Let’s check your subscription</h1>
        <p>We couldn’t verify access. Check your connection and try again.</p>
        <button className="premium-primary" onClick={() => void access.retry()}>
          Try again
        </button>
        <button className="premium-secondary" onClick={() => void navigate({ to: "/premium" })}>
          Restore or choose a plan
        </button>
      </main>
    );
  }

  // During flow stages, allow the corresponding flow route to render
  if (state === "onboarding_required" && pathname === "/onboarding") {
    return <>{children}</>;
  }
  if (state === "paywall_required" && pathname === "/premium") {
    return <>{children}</>;
  }
  if (state === "app_tour_required" && pathname === "/welcome") {
    return <>{children}</>;
  }

  if (state !== "application_ready") {
    return (
      <main className="premium-gate" role="status">
        <span className="premium-eyebrow">MEALMATE</span>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking your access…</span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
