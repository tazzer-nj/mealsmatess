import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useFlowController } from "@/lib/flow-controller";

const ALLOWED_UNAUTH_PREFIXES = [
  "/auth",
  "/reset-password",
  "/legal",
  "/support",
  "/about",
  "/ai-founder",
  ...(import.meta.env.DEV ? ["/dev"] : []),
];

function isPublicPath(pathname: string) {
  return ALLOWED_UNAUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

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

  const { state, user, access, isAdmin } = useFlowController();
  const isPublic = isPublicPath(pathname);

  useEffect(() => {
    if (state === "loading" || !online) return;

    if (state === "unauthenticated") {
      if (!isPublic) {
        void navigate({ to: "/auth", replace: true });
      }
      return;
    }

    if (state === "onboarding_required") {
      void import("@/lib/billing-client").then((m) => m.preloadBillingSdk()).catch(() => undefined);
      if (pathname !== "/onboarding" && !isPublic) {
        void navigate({ to: "/onboarding", replace: true });
      }
    } else if (state === "paywall_required") {
      void import("@/lib/billing-client").then((m) => m.preloadBillingSdk()).catch(() => undefined);
      if (pathname !== "/premium" && pathname !== "/premium/complete" && !isPublic) {
        void navigate({ to: "/premium", replace: true });
      }
    } else if (state === "app_tour_required") {
      if (pathname !== "/welcome" && !isPublic) {
        void navigate({ to: "/welcome", replace: true });
      }
    } else if (state === "application_ready") {
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

  if (
    user &&
    !isAdmin &&
    (pathname === "/premium" || pathname === "/premium/complete") &&
    (state === "paywall_required" || state === "loading" || Boolean(access.error))
  ) {
    return <>{children}</>;
  }
  if (
    user &&
    !isAdmin &&
    pathname === "/onboarding" &&
    (state === "onboarding_required" || state === "loading" || Boolean(access.error))
  ) {
    return <>{children}</>;
  }
  if (state === "app_tour_required" && pathname === "/welcome") {
    return <>{children}</>;
  }

  // When loading, never block with "Checking access..." screen — load immediately!
  if (state === "loading") {
    return <>{children}</>;
  }

  // If not ready and not public, don't render children while redirecting
  if (state !== "application_ready" && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
