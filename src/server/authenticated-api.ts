export async function authenticateApiRequest(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);

  let userId: string | null = null;
  let claims:
    | {
        email?: string | null;
        admin?: unknown;
        isAdmin?: unknown;
        role?: unknown;
        whopUserId?: string;
        provider?: "firebase" | "whop";
      }
    | undefined;
  let setCookieHeader: string | null = null;

  if (match?.[1]) {
    try {
      const { verifyFirebaseIdToken } = await import("@/server/firebase-admin");
      const decoded = await verifyFirebaseIdToken(match[1]);
      if (decoded.uid) {
        userId = decoded.uid;
        if (decoded.email || decoded.admin || decoded.isAdmin || decoded.role) {
          claims = { ...decoded, provider: "firebase" };
        }
      }
    } catch {
      return {
        response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
      } as const;
    }
  } else {
    try {
      const { getWhopSessionFromRequest } = await import("@/server/whop-auth");
      const whopSession = await getWhopSessionFromRequest(request);
      setCookieHeader = whopSession.setCookieHeader;
      if (whopSession.session) {
        const site = (request.headers.get("sec-fetch-site") ?? "").toLowerCase();
        const origin = request.headers.get("origin");
        if (site === "cross-site" || origin) {
          const { assertBillingOrigin } = await import("@/server/revenuecat");
          assertBillingOrigin(request);
        }
        userId = whopSession.session.userId;
        claims = {
          email: whopSession.session.email,
          whopUserId: whopSession.session.whopUserId,
          provider: "whop",
        };
      }
    } catch (error) {
      if (error instanceof Response && error.status === 403) {
        return {
          response: Response.json({ error: "Forbidden." }, { status: 403 }),
        } as const;
      }
    }
  }

  if (!userId) {
    return {
      response: Response.json(
        { error: "Sign in to continue." },
        {
          status: 401,
          headers: setCookieHeader ? { "Set-Cookie": setCookieHeader } : undefined,
        },
      ),
    } as const;
  }

  try {
    const { requireActivePremium } = await import("@/server/revenuecat");
    if (claims) {
      await requireActivePremium(userId, claims);
    } else {
      await requireActivePremium(userId);
    }
  } catch (error) {
    return {
      response: Response.json(
        {
          error:
            error instanceof Response && error.status === 402
              ? "An active Premium subscription is required."
              : "Subscription verification is temporarily unavailable.",
        },
        {
          status: error instanceof Response && error.status === 402 ? 402 : 503,
          headers: setCookieHeader ? { "Set-Cookie": setCookieHeader } : undefined,
        },
      ),
    } as const;
  }

  const { firebaseUserDb } = await import("@/server/firebase-admin");
  return {
    user: {
      userId,
      firebase: firebaseUserDb(userId),
      setCookieHeader,
    },
  } as const;
}
