import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";

const loadWhopSession = createServerOnlyFn(() => import("@/server/whop-session"));
const loadRevenueCat = createServerOnlyFn(() => import("@/server/revenuecat"));

export type AuthClaims = {
  email?: string | null;
  admin?: unknown;
  isAdmin?: unknown;
  role?: unknown;
  whopUserId?: string | null;
};

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    const authorization = request?.headers.get("authorization") ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    const backend = await loadFirebaseAdmin();

    if (match?.[1]) {
      let verified;
      try {
        verified = await backend.verifyFirebaseIdToken(match[1]);
      } catch {
        throw new Response("Unauthorized", { status: 401 });
      }
      if (!verified.uid) throw new Response("Unauthorized", { status: 401 });
      const claims: AuthClaims = {
        email: verified.email ?? null,
        admin: verified.admin,
        isAdmin: verified.isAdmin,
        role: verified.role,
        whopUserId:
          typeof (verified as Record<string, unknown>)["whopUserId"] === "string"
            ? ((verified as Record<string, unknown>)["whopUserId"] as string)
            : null,
      };
      return next({
        context: {
          firebase: backend.firebaseUserDb(verified.uid),
          userId: verified.uid,
          claims,
        },
      });
    }

    // Fall back to sealed httpOnly Whop OAuth session cookie.
    const { getWhopSessionFromRequest } = await loadWhopSession();
    const { session } = await getWhopSessionFromRequest(request);
    if (!session?.userId) {
      throw new Response("Unauthorized", { status: 401 });
    }

    if (request && request.method !== "GET" && request.method !== "HEAD") {
      const { assertBillingOrigin } = await loadRevenueCat();
      assertBillingOrigin(request);
    }

    const claims: AuthClaims = {
      email: session.email ?? null,
      admin: undefined,
      isAdmin: undefined,
      role: undefined,
      whopUserId: session.whopUserId ?? null,
    };

    return next({
      context: {
        firebase: backend.firebaseUserDb(session.userId),
        userId: session.userId,
        claims,
      },
    });
  },
);
