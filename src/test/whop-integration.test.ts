import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const subscriptionEvents: Record<string, unknown>[] = [];
  const checkoutCreate = vi.fn();
  const paymentsRetrieve = vi.fn();
  const membershipsList = vi.fn();
  const membershipsRetrieve = vi.fn();

  const makeDocRef = (key: string) => ({
    key,
    get: async () => ({
      exists: docs.has(key),
      id: key.split("/").pop(),
      data: () => docs.get(key),
    }),
    set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      docs.set(key, opts?.merge ? { ...(docs.get(key) ?? {}), ...data } : data);
    },
  });

  const db = {
    collection: (name: string) => ({
      doc: (id: string) => makeDocRef(`${name}/${id}`),
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => {
            const matched: { id: string; data: () => Record<string, unknown> }[] = [];
            for (const [k, v] of docs.entries()) {
              if (k.startsWith(`${name}/`) && v[field] === value) {
                matched.push({ id: k.slice(name.length + 1), data: () => v });
              }
            }
            return { empty: matched.length === 0, docs: matched };
          },
        }),
      }),
    }),
    runTransaction: async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        get: (r: ReturnType<typeof makeDocRef>) => r.get(),
        set: (
          r: ReturnType<typeof makeDocRef>,
          d: Record<string, unknown>,
          o?: { merge?: boolean },
        ) => r.set(d, o),
      }),
  };

  return {
    docs,
    subscriptionEvents,
    checkoutCreate,
    paymentsRetrieve,
    membershipsList,
    membershipsRetrieve,
    db,
  };
});

vi.mock("@whop/sdk", () => ({
  WhopClient: class MockWhopClient {
    checkoutConfigurations = { create: hoisted.checkoutCreate };
    payments = { retrieve: hoisted.paymentsRetrieve };
    memberships = {
      list: hoisted.membershipsList,
      retrieve: hoisted.membershipsRetrieve,
    };
  },
}));

vi.mock("@/server/firebase-admin", () => ({
  getFirebaseAdminFirestore: () => hoisted.db,
  firebaseUserDb: (userId: string, opts?: { verifiedPremium?: boolean }) => ({
    userId,
    verifiedPremium: opts?.verifiedPremium ?? false,
  }),
  verifyFirebaseIdToken: vi.fn(),
  getOrCreateFirebaseUser: vi.fn(async (email: string) => ({
    user: { uid: `fb_${email.replace(/[^a-z0-9]/gi, "_")}` },
  })),
  isAdminAccount: vi.fn(async () => false),
  firebaseAdmin: {
    from: (table: string) => {
      if (table === "subscription_events") {
        return {
          select: () => ({
            eq: (_col: string, val: string) => ({
              maybeSingle: async () => {
                const found = hoisted.subscriptionEvents.find((e) => e["rc_event_id"] === val);
                return { data: found ?? null, error: null };
              },
            }),
          }),
          insert: async (row: Record<string, unknown>) => {
            hoisted.subscriptionEvents.push({
              id: `evt_${hoisted.subscriptionEvents.length}`,
              ...row,
            });
            return { data: row, error: null };
          },
          update: (patch: Record<string, unknown>) => ({
            eq: async (_col: string, val: string) => {
              for (const row of hoisted.subscriptionEvents) {
                if (row["rc_event_id"] === val) Object.assign(row, patch);
              }
              return { data: null, error: null };
            },
          }),
        };
      }
      return {
        insert: async () => ({ data: null, error: null }),
      };
    },
  },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false, getPlatform: () => "web" },
}));

function signWhopWebhookPayload(secret: string, id: string, timestampSec: number, rawBody: string) {
  const signature = createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(`${id}.${timestampSec}.${rawBody}`)
    .digest("base64");
  return {
    "webhook-id": id,
    "webhook-timestamp": String(timestampSec),
    "webhook-signature": `v1,${signature}`,
    "content-type": "application/json",
  };
}

beforeEach(() => {
  hoisted.docs.clear();
  hoisted.subscriptionEvents.length = 0;
  vi.clearAllMocks();
  vi.stubEnv("WHOP_API_KEY", "whop_test_api_key");
  vi.stubEnv("WHOP_ACCOUNT_ID", "biz_test123");
  vi.stubEnv("WHOP_CLIENT_ID", "app_client_test");
  vi.stubEnv("WHOP_CLIENT_SECRET", "app_secret_test");
  vi.stubEnv("WHOP_SESSION_SECRET", "test-session-secret-32-chars-minimum");
  vi.stubEnv("WHOP_WEBHOOK_SECRET", "ws_test_secret_123456");
  vi.stubEnv("REVENUECAT_SECRET_API_KEY", "");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Whop OAuth 2.1 + PKCE & sealed httpOnly session", () => {
  it("builds PKCE S256 authorize URL and sets HttpOnly Secure SameSite=None Partitioned cookie on HTTPS", async () => {
    const { buildWhopOAuthStart } = await import("@/server/whop-session");
    const req = new Request("https://mealsmates.site/api/auth/whop?returnTo=/onboarding", {
      headers: { host: "mealsmates.site", "x-forwarded-proto": "https" },
    });

    const { url, pkceCookie, redirectUri, state } = buildWhopOAuthStart({
      request: req,
      returnTo: "/onboarding",
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://api.whop.com");
    expect(parsed.pathname).toBe("/oauth/authorize");
    expect(parsed.searchParams.get("client_id")).toBe("app_client_test");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "https://mealsmates.site/api/auth/callback",
    );
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("code_challenge")?.length).toBeGreaterThan(20);
    expect(parsed.searchParams.get("state")).toBe(state);
    expect(redirectUri).toBe("https://mealsmates.site/api/auth/callback");
    expect(pkceCookie).toContain("HttpOnly");
    expect(pkceCookie).toContain("Secure");
    expect(pkceCookie).toContain("SameSite=None");
    expect(pkceCookie).toContain("Partitioned");
  });

  it("validates PKCE state on /api/auth/callback, exchanges code, and sets sealed session cookie", async () => {
    const { buildWhopOAuthStart, WHOP_PKCE_COOKIE, WHOP_SESSION_COOKIE, parseCookies } =
      await import("@/server/whop-session");
    const { Route: CallbackRoute } = await import("@/routes/api/auth.callback");
    const getHandler = (
      CallbackRoute.options.server as {
        handlers: { GET: (c: { request: Request }) => Promise<Response> };
      }
    ).handlers.GET;

    const startReq = new Request("https://mealsmates.site/api/auth/whop");
    const { pkceCookie, state } = buildWhopOAuthStart({
      request: startReq,
      returnTo: "/onboarding",
    });
    const pkcePair = pkceCookie.split(";")[0]!;

    // Mismatched CSRF state must be rejected with no session cookie set
    const badRes = await getHandler({
      request: new Request("https://mealsmates.site/api/auth/callback?code=abc&state=wrong", {
        headers: { cookie: pkcePair },
      }),
    });
    expect(badRes.status).toBe(302);
    expect(badRes.headers.get("location")).toContain("whop_error=");
    expect(badRes.headers.get("set-cookie") ?? "").not.toContain(`${WHOP_SESSION_COOKIE}=`);

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const target = String(input);
      if (target === "https://api.whop.com/oauth/token") {
        return new Response(
          JSON.stringify({
            access_token: "whop_access_1",
            refresh_token: "whop_refresh_1",
            expires_in: 3600,
          }),
          { status: 200 },
        );
      }
      if (target === "https://api.whop.com/oauth/userinfo") {
        return new Response(
          JSON.stringify({
            sub: "user_whop_42",
            email: "chef@mealsmates.site",
            email_verified: true,
            name: "Chef Ada",
          }),
          { status: 200 },
        );
      }
      throw new Error(`Unexpected fetch: ${target}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const goodRes = await getHandler({
      request: new Request(
        `https://mealsmates.site/api/auth/callback?code=auth_code_1&state=${encodeURIComponent(state)}`,
        { headers: { cookie: pkcePair } },
      ),
    });

    expect(goodRes.status).toBe(302);
    expect(goodRes.headers.get("location")).toBe("https://mealsmates.site/onboarding");
    const setCookies = goodRes.headers.getSetCookie?.() ?? [
      goodRes.headers.get("set-cookie") ?? "",
    ];
    const joined = setCookies.join("\n");
    expect(joined).toContain(`${WHOP_SESSION_COOKIE}=`);
    expect(joined).toContain(`${WHOP_PKCE_COOKIE}=;`);
    expect(joined).toContain("HttpOnly");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const sessionCookieVal = parseCookies(
      setCookies.find((c) => c.startsWith(`${WHOP_SESSION_COOKIE}=`))?.split(";")[0],
    )[WHOP_SESSION_COOKIE];
    expect(sessionCookieVal).toBeTruthy();
  });

  it("proactively refreshes expiring Whop OAuth access tokens via grant_type=refresh_token", async () => {
    const { buildSessionCookieHeader, getWhopSessionFromRequest } =
      await import("@/server/whop-session");

    const reqForCookie = new Request("https://mealsmates.site/");
    const expiringCookie = buildSessionCookieHeader(
      {
        userId: "fb_chef",
        whopUserId: "user_whop_42",
        email: "chef@mealsmates.site",
        name: "Chef Ada",
        picture: null,
        emailVerified: true,
        accessToken: "old_access",
        refreshToken: "old_refresh",
        expiresAt: Date.now() + 60_000, // Within 5-minute refresh leeway
        issuedAt: Date.now() - 3500_000,
      },
      reqForCookie,
    ).split(";")[0]!;

    const fetchMock = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toContain("grant_type=refresh_token");
      expect(String(init?.body)).toContain("refresh_token=old_refresh");
      return new Response(
        JSON.stringify({
          access_token: "fresh_access_2",
          refresh_token: "fresh_refresh_2",
          expires_in: 3600,
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getWhopSessionFromRequest(
      new Request("https://mealsmates.site/api/auth/session", {
        headers: { cookie: expiringCookie },
      }),
    );

    expect(result.session?.accessToken).toBe("fresh_access_2");
    expect(result.session?.refreshToken).toBe("fresh_refresh_2");
    expect(result.refreshedSetCookie).toContain("HttpOnly");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("Whop Checkout Configuration & Embedded Billing Store", () => {
  it("creates checkout configuration with 3-day free trial inline variant or existing plan ID", async () => {
    const { createWhopCheckoutConfig } = await import("@/server/whop");
    hoisted.checkoutCreate.mockResolvedValue({ id: "ch_test_yearly" });

    const inline = await createWhopCheckoutConfig({
      userId: "user_1",
      planKind: "yearly",
      origin: "https://mealsmates.site",
      whopUserId: "user_whop_1",
      customerEmail: "chef@mealsmates.site",
    });

    expect(inline.id).toBe("ch_test_yearly");
    expect(inline.returnUrl).toBe("https://mealsmates.site/premium/complete");
    expect(hoisted.checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: "biz_test123",
        redirect_url: "https://mealsmates.site/premium/complete",
        metadata: expect.objectContaining({ user_id: "user_1", plan_kind: "yearly" }),
        variant: expect.objectContaining({
          billing_type: "renewal",
          billing_period: 365,
          currency: "usd",
          initial_price: 0,
          renewal_price: 79.99,
          trial_period_days: 3,
        }),
      }),
    );

    vi.stubEnv("WHOP_PLAN_YEARLY_ID", "plan_existing_yearly");
    hoisted.checkoutCreate.mockResolvedValueOnce({ id: "ch_existing_yearly" });
    const withExistingPlan = await createWhopCheckoutConfig({
      userId: "user_1",
      planKind: "yearly",
      origin: "https://mealsmates.site",
    });
    expect(withExistingPlan.id).toBe("ch_existing_yearly");
    expect(hoisted.checkoutCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        account_id: "biz_test123",
        variant_id: "plan_existing_yearly",
        metadata: expect.objectContaining({ user_id: "user_1", plan_kind: "yearly" }),
      }),
    );
  });

  it("exposes Whop web plans with 3-day trial when provider is whop", async () => {
    const { loadBillingStore } = await import("@/lib/billing-client");
    const store = await loadBillingStore({
      appUserId: "user_1",
      offering: "default",
      isActive: false,
      provider: "whop",
      whopEnabled: true,
      webApiKey: null,
      androidApiKey: null,
      iosApiKey: null,
    });
    expect(store.provider).toBe("whop");
    expect(store.plans.map((p) => [p.kind, p.price, p.period, p.trialDays])).toEqual([
      ["monthly", "$9.99", "month", 3],
      ["yearly", "$79.99", "year", 3],
      ["family", "$119.99", "year", 3],
    ]);
    expect(store.exitOfferPlan).toMatchObject({
      whopPlanKind: "yearly_exit",
      price: "$63.99",
      trialDays: 3,
    });
  });
});

describe("Whop Webhook verification, provisioning & revocation", () => {
  it("rejects invalid webhook signatures with 401 and grants/revokes Premium idempotently on verified events", async () => {
    const { Route: WebhookRoute } = await import("@/routes/api/webhooks.whop");
    const post = (
      WebhookRoute.options.server as {
        handlers: { POST: (c: { request: Request }) => Promise<Response> };
      }
    ).handlers.POST;

    const badRes = await post({
      request: new Request("https://mealsmates.site/api/webhooks/whop", {
        method: "POST",
        headers: { "content-type": "application/json", "webhook-signature": "v1,invalid" },
        body: JSON.stringify({ id: "evt_bad", type: "payment.succeeded", data: {} }),
      }),
    });
    expect(badRes.status).toBe(401);

    const secret = "ws_test_secret_123456";
    const nowSec = Math.floor(Date.now() / 1000);
    const futurePeriodEnd = new Date(Date.now() + 30 * 86400_000).toISOString();

    const activateBody = JSON.stringify({
      id: "msg_activate_1",
      type: "payment.succeeded",
      data: {
        id: "pay_123",
        user_id: "user_whop_99",
        membership_id: "mem_99",
        variant_id: "plan_yearly",
        status: "paid",
        currency: "usd",
        total: { amount: "79.99", currency: "usd", decimals: 2, display_decimals: 2 },
        current_period_end: futurePeriodEnd,
        metadata: { user_id: "mealmate_u99", plan_kind: "yearly" },
      },
    });

    const okRes = await post({
      request: new Request("https://mealsmates.site/api/webhooks/whop", {
        method: "POST",
        headers: signWhopWebhookPayload(secret, "msg_activate_1", nowSec, activateBody),
        body: activateBody,
      }),
    });
    expect(okRes.status).toBe(200);
    expect(hoisted.docs.get("whop_access/mealmate_u99")).toMatchObject({
      active: true,
      tier: "annual",
      status: "active",
      whop_membership_id: "mem_99",
    });
    expect(hoisted.docs.get("users/mealmate_u99")).toMatchObject({
      is_premium: true,
      premium: true,
    });

    // Duplicate delivery is ignored cleanly
    const dupRes = await post({
      request: new Request("https://mealsmates.site/api/webhooks/whop", {
        method: "POST",
        headers: signWhopWebhookPayload(secret, "msg_activate_1", nowSec, activateBody),
        body: activateBody,
      }),
    });
    expect(dupRes.status).toBe(200);
    expect(await dupRes.json()).toMatchObject({ received: true, duplicate: true });

    // Membership expiration turns off Premium
    const revokeBody = JSON.stringify({
      id: "msg_expire_1",
      type: "membership.expired",
      data: {
        id: "mem_99",
        user_id: "user_whop_99",
        metadata: { user_id: "mealmate_u99" },
      },
    });
    const revokeRes = await post({
      request: new Request("https://mealsmates.site/api/webhooks/whop", {
        method: "POST",
        headers: signWhopWebhookPayload(secret, "msg_expire_1", nowSec, revokeBody),
        body: revokeBody,
      }),
    });
    expect(revokeRes.status).toBe(200);
    expect(hoisted.docs.get("whop_access/mealmate_u99")).toMatchObject({
      active: false,
      status: "expired",
    });
    expect(hoisted.docs.get("users/mealmate_u99")).toMatchObject({
      is_premium: false,
      premium: false,
    });
  });
});

describe("Server-side Premium gating with Whop session cookie", () => {
  it("rejects unauthenticated requests, blocks free Whop users with 402, and allows paid Whop users", async () => {
    const { buildSessionCookieHeader } = await import("@/server/whop-session");
    const { authenticateApiRequest } = await import("@/server/authenticated-api");

    const anon = await authenticateApiRequest(
      new Request("https://mealsmates.site/api/recipe-image", { method: "POST" }),
    );
    expect(anon.response?.status).toBe(401);

    const cookiePair = buildSessionCookieHeader(
      {
        userId: "mealmate_u500",
        whopUserId: "user_whop_500",
        email: "u500@mealsmates.site",
        name: "Chef 500",
        picture: null,
        emailVerified: true,
        accessToken: "tok_500",
        refreshToken: "ref_500",
        expiresAt: Date.now() + 3600_000,
        issuedAt: Date.now(),
      },
      new Request("https://mealsmates.site/"),
    ).split(";")[0]!;

    // Cross-site POST with cookie must be blocked by CSRF origin guard
    const crossSite = await authenticateApiRequest(
      new Request("https://mealsmates.site/api/recipe-image", {
        method: "POST",
        headers: {
          cookie: cookiePair,
          origin: "https://evil.example",
          "sec-fetch-site": "cross-site",
        },
      }),
    );
    expect(crossSite.response?.status).toBe(403);

    // Unpaid Whop user without active membership is rejected with 402
    hoisted.membershipsList.mockResolvedValueOnce({ data: [] });
    const unpaid = await authenticateApiRequest(
      new Request("https://mealsmates.site/api/recipe-image", {
        method: "POST",
        headers: {
          cookie: cookiePair,
          origin: "https://mealsmates.site",
          "sec-fetch-site": "same-origin",
        },
      }),
    );
    expect(unpaid.response?.status).toBe(402);

    // Live active/trialing Whop membership activates and authorizes the gated request
    hoisted.membershipsList.mockResolvedValueOnce({
      data: [
        {
          id: "mem_live_500",
          status: "trialing",
          variant_id: "plan_yearly",
          current_period_end: new Date(Date.now() + 3 * 86400_000).toISOString(),
          expires_at: null,
          cancel_at_period_end: false,
          metadata: { plan_kind: "yearly" },
        },
      ],
    });
    const paid = await authenticateApiRequest(
      new Request("https://mealsmates.site/api/recipe-image", {
        method: "POST",
        headers: {
          cookie: cookiePair,
          origin: "https://mealsmates.site",
          "sec-fetch-site": "same-origin",
        },
      }),
    );
    expect("response" in paid).toBe(false);
    expect(paid.user?.userId).toBe("mealmate_u500");
    expect(hoisted.docs.get("whop_access/mealmate_u500")).toMatchObject({
      active: true,
      status: "trialing",
      trial_active: true,
    });
  });
});

describe("Whop <-> RevenueCat promotional sync & promo code checkout", () => {
  it("syncs Whop activation and revocation to RevenueCat promotional entitlements", async () => {
    vi.stubEnv("REVENUECAT_SECRET_API_KEY", "rc_secret_sync_test");
    const fetchMock = vi.fn(async () => Response.json({ subscriber: {} }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const { grantWhopPremiumAccess, revokeWhopPremiumAccess } = await import("@/server/whop");
    const futureEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();

    await grantWhopPremiumAccess({
      userId: "sync_user_1",
      whopUserId: "whop_sync_1",
      membershipId: "mem_sync_1",
      planKind: "yearly",
      status: "active",
      periodEnd: futureEnd,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.revenuecat.com/v1/subscribers/sync_user_1/entitlements/premium/promotional",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer rc_secret_sync_test" }),
      }),
    );

    await revokeWhopPremiumAccess({
      userId: "sync_user_1",
      whopUserId: "whop_sync_1",
      membershipId: "mem_sync_1",
      reasonStatus: "expired",
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://api.revenuecat.com/v1/subscribers/sync_user_1/entitlements/premium/revoke_promotionals",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer rc_secret_sync_test" }),
      }),
    );
  });

  it("redeems free-days promos via verified promo_access and applies percent_discount promos to Whop checkout", async () => {
    vi.stubEnv("REVENUECAT_SECRET_API_KEY", "rc_secret_promo_test");
    const fetchMock = vi.fn(async () => Response.json({ subscriber: {} }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    hoisted.docs.set("promo_codes/promo_free7", {
      id: "promo_free7",
      code: "CHEF7",
      reward_kind: "free_days",
      reward_value: 7,
      enabled: true,
      redemption_count: 0,
      max_redemptions: 10,
      expires_at: null,
    });

    hoisted.docs.set("promo_codes/promo_25off", {
      id: "promo_25off",
      code: "SAVE25",
      reward_kind: "percent_discount",
      reward_value: 25,
      enabled: true,
      redemption_count: 0,
      max_redemptions: 10,
      expires_at: null,
    });

    const { redeemPromoCodeForUser } = await import("@/server/promo");
    const { verifyAccountAccess } = await import("@/server/revenuecat");
    const { createWhopCheckoutConfig } = await import("@/server/whop");

    // 1. Free days promo unlocks verified access and syncs to RevenueCat
    const freeRes = await redeemPromoCodeForUser({ userId: "promo_u1", code: "chef7" });
    expect(freeRes).toMatchObject({
      ok: true,
      kind: "free_days",
      code: "CHEF7",
      grantedDays: 7,
    });
    expect(hoisted.docs.get("promo_access/promo_u1")).toMatchObject({
      active: true,
      code_id: "promo_free7",
      code: "CHEF7",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.revenuecat.com/v1/subscribers/promo_u1/entitlements/premium/promotional",
      expect.objectContaining({ method: "POST" }),
    );

    const access = await verifyAccountAccess("promo_u1");
    expect(access).toMatchObject({
      isPremium: true,
      store: "promotional",
    });

    // Duplicate redemption is blocked
    await expect(redeemPromoCodeForUser({ userId: "promo_u1", code: "CHEF7" })).rejects.toThrow(
      /already redeemed/i,
    );

    // 2. Percent discount promo returns discount details without prematurely consuming redemption
    const discRes = await redeemPromoCodeForUser({ userId: "promo_u2", code: "save25" });
    expect(discRes).toMatchObject({
      ok: true,
      kind: "percent_discount",
      code: "SAVE25",
      percentOff: 25,
    });

    hoisted.checkoutCreate.mockResolvedValueOnce({ id: "ch_discounted_1" });
    const checkout = await createWhopCheckoutConfig({
      userId: "promo_u2",
      planKind: "yearly",
      origin: "https://mealsmates.site",
      promoCode: "SAVE25",
    });

    expect(checkout.id).toBe("ch_discounted_1");
    expect(checkout.appliedPromo).toMatchObject({
      code: "SAVE25",
      percentOff: 25,
      discountedPriceAmount: 59.99,
      discountedPriceDisplay: "$59.99",
    });
    expect(hoisted.checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          user_id: "promo_u2",
          promo_id: "promo_25off",
          promo_code: "SAVE25",
          promo_percent_off: "25",
        }),
        variant: expect.objectContaining({
          renewal_price: 59.99,
        }),
      }),
    );
  });
});
