export async function authenticateApiRequest(
  request: Request,
  options?: { allowFreeTier?: boolean },
) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);

  let userId: string | null = null;
  let email: string | null = null;
  let whopUserId: string | null = null;
  let claims: Record<string, unknown> | undefined;
  let refreshedSetCookie: string | undefined;

  if (match?.[1]) {
    try {
      const { verifyFirebaseIdToken } = await import("@/server/firebase-admin");
      const decoded = await verifyFirebaseIdToken(match[1]);
      if (!decoded.uid) {
        return {
          response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
        } as const;
      }
      userId = decoded.uid;
      email = decoded.email ?? null;
      claims = decoded as unknown as Record<string, unknown>;
    } catch {
      return {
        response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
      } as const;
    }
  } else {
    try {
      const { getWhopSessionFromRequest } = await import("@/server/whop-session");
      const result = await getWhopSessionFromRequest(request);
      if (result.session?.userId) {
        if (request.method !== "GET" && request.method !== "HEAD") {
          const { assertBillingOrigin } = await import("@/server/revenuecat");
          assertBillingOrigin(request);
        }
        userId = result.session.userId;
        email = result.session.email;
        whopUserId = result.session.whopUserId;
        refreshedSetCookie = result.refreshedSetCookie;
        claims = {
          email: result.session.email,
          whopUserId: result.session.whopUserId,
        };
      }
    } catch (error) {
      if (error instanceof Response && error.status === 403) {
        return {
          response: Response.json({ error: "Forbidden request origin." }, { status: 403 }),
        } as const;
      }
    }
  }

  if (!userId) {
    return {
      response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
    } as const;
  }

  try {
    const { firebaseUserDb } = await import("@/server/firebase-admin");

    if (options?.allowFreeTier) {
      let access;
      try {
        const { verifyAccountAccess } = await import("@/server/revenuecat");
        access = await verifyAccountAccess(
          userId,
          undefined,
          claims as {
            email?: string | null;
            admin?: unknown;
            isAdmin?: unknown;
            role?: unknown;
            whopUserId?: string | null;
          },
        );
      } catch {
        return {
          response: Response.json(
            { error: "Subscription verification is temporarily unavailable." },
            { status: 503 },
          ),
        } as const;
      }
      return {
        refreshedSetCookie,
        user: {
          userId,
          email,
          whopUserId,
          isPremium: access.isPremium,
          trialActive: access.trialActive,
          firebase: firebaseUserDb(userId, { verifiedPremium: access.isPremium }),
        },
      } as const;
    }

    try {
      const { requireActivePremium } = await import("@/server/revenuecat");
      const hasRelevantClaims = Boolean(
        whopUserId ||
        claims?.["email"] ||
        claims?.["admin"] ||
        claims?.["isAdmin"] ||
        claims?.["role"],
      );
      if (hasRelevantClaims) {
        await requireActivePremium(
          userId,
          claims as {
            email?: string | null;
            admin?: unknown;
            isAdmin?: unknown;
            role?: unknown;
            whopUserId?: string | null;
          },
        );
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
          { status: error instanceof Response && error.status === 402 ? 402 : 503 },
        ),
      } as const;
    }

    return {
      refreshedSetCookie,
      user: {
        userId,
        email,
        whopUserId,
        firebase: firebaseUserDb(userId),
      },
    } as const;
  } catch {
    return {
      response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
    } as const;
  }
}
