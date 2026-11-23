import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";

const loadWhopAuth = createServerOnlyFn(() => import("@/server/whop-auth"));
const loadBillingOrigin = createServerOnlyFn(() => import("@/server/revenuecat"));

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    if (!request) throw new Response("Unauthorized", { status: 401 });

    const { resolveAuthenticatedRequest } = await loadWhopAuth();
    const resolved = await resolveAuthenticatedRequest(request);
    if (!resolved) throw new Response("Unauthorized", { status: 401 });

    if (resolved.setCookieHeader) {
      try {
        setResponseHeader("Set-Cookie", resolved.setCookieHeader);
      } catch {
        // Ignore if response headers are unavailable in unit test harnesses.
      }
    }

    if (resolved.provider === "whop" && request.method !== "GET" && request.method !== "HEAD") {
      const site = (request.headers.get("sec-fetch-site") ?? "").toLowerCase();
      const origin = request.headers.get("origin");
      if (site === "cross-site" || origin) {
        const { assertBillingOrigin } = await loadBillingOrigin();
        assertBillingOrigin(request);
      }
    }

    const backend = await loadFirebaseAdmin();
    return next({
      context: {
        firebase: backend.firebaseUserDb(resolved.userId),
        userId: resolved.userId,
        claims: resolved.claims,
      },
    });
  },
);
