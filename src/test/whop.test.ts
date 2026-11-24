import { createHash, createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdkMock = vi.hoisted(() => ({
  checkoutCreate: vi.fn(),
  membershipsList: vi.fn(),
}));

const dbMock = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const tableRows = new Map<string, Array<Record<string, unknown>>>();

  const firestore = {
    collection: (name: string) => ({
      doc: (id: string) => {
        const key = `${name}/${id}`;
        return {
          get: async () => ({
            exists: docs.has(key),
            id,
            data: () => docs.get(key),
          }),
          set: async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
            docs.set(key, opts?.merge ? { ...(docs.get(key) ?? {}), ...data } : { ...data });
          },
        };
      },
      where: (field: string, _op: string, value: unknown) => ({
        limit: () => ({
          get: async () => {
            const matched = [...docs.entries()]
              .filter(([k, v]) => k.startsWith(`${name}/`) && v[field] === value)
              .map(([k, v]) => ({ id: k.slice(name.length + 1), data: () => v }));
            return { empty: matched.length === 0, docs: matched };
          },
        }),
      }),
    }),
  };

  function queryFor(table: string) {
    const filters: Array<[string, unknown]> = [];
    const builder = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filters.push([col, val]);
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      maybeSingle: async () => {
        const rows = tableRows.get(table) ?? [];
        const match = rows.find((r) => filters.every(([c, v]) => r[c] === v)) ?? null;
        return { data: match, error: null };
      },
      insert: async (row: Record<string, unknown>) => {
        const rows = tableRows.get(table) ?? [];
        const next = { id: `row_${rows.length + 1}`, ...row };
        rows.push(next);
        tableRows.set(table, rows);
        return { data: next, error: null };
      },
      update: (patch: Record<string, unknown>) => ({
        eq: async (col: string, val: unknown) => {
          const rows = tableRows.get(table) ?? [];
          for (let i = 0; i < rows.length; i++) {
            if (rows[i]![col] === val) {
              rows[i] = { ...rows[i], ...patch };
            }
          }
          tableRows.set(table, rows);
          return { error: null };
        },
      }),
    };
    return builder;
  }

  return {
    docs,
    tableRows,
    firestore,
    firebaseAdmin: { from: (table: string) => queryFor(table) },
  };
});

vi.mock("@whop/sdk", () => ({
  WhopClient: class MockWhopClient {
    checkoutConfigurations = { create: sdkMock.checkoutCreate };
    memberships = { list: sdkMock.membershipsList };
  },
}));

vi.mock("@/server/firebase-admin", () => ({
  getFirebaseAdminFirestore: () => dbMock.firestore,
  firebaseAdmin: dbMock.firebaseAdmin,
  firebaseUserDb: (userId: string) => ({ userId }),
  verifyFirebaseIdToken: vi.fn().mockRejectedValue(new Error("invalid token")),
  isAdminAccount: vi.fn().mockResolvedValue(false),
}));

import {
  buildWhopAuthorizeRequest,
  getWhopSessionFromRequest,
  resolveAuthenticatedRequest,
  sealWhopSessionCookie,
  verifyPkceCookie,
  WHOP_PKCE_COOKIE,
  WHOP_SESSION_COOKIE,
} from "@/server/whop-auth";
import {
  createWhopCheckoutConfig,
  processWhopWebhookEvent,
  unwrapWhopWebhookEvent,
} from "@/server/whop";
import { requireActivePremium, verifyAccountAccess } from "@/server/revenuecat";
import { authenticateApiRequest } from "@/server/authenticated-api";

function extractCookieValue(setCookieHeader: string, cookieName: string): string {
  const prefix = `${cookieName}=`;
  const part = setCookieHeader.split(";")[0] ?? "";
  return decodeURIComponent(part.startsWith(prefix) ? part.slice(prefix.length) : "");
}

function signStandardWebhook(rawBody: string, secret: string, id = "msg_1", tsSec?: number) {
  const ts = String(tsSec ?? Math.floor(Date.now() / 1000));
  const key = Buffer.from(secret, "utf8");
  const sig = createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest("base64");
  return new Headers({
    "webhook-id": id,
    "webhook-timestamp": ts,
    "webhook-signature": `v1,${sig}`,
  });
}

describe("Whop OAuth 2.1 + PKCE, Checkout, Webhooks & Gating", () => {
  const webhookSecret = `ws_${Buffer.from("whop-webhook-test-secret-32-bytes").toString("base64")}`;

  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.docs.clear();
    dbMock.tableRows.clear();
    vi.stubEnv("WHOP_API_KEY", "whop_api_test");
    vi.stubEnv("WHOP_ACCOUNT_ID", "biz_test123");
    vi.stubEnv("WHOP_CLIENT_ID", "client_test123");
    vi.stubEnv("WHOP_CLIENT_SECRET", "secret_test123");
    vi.stubEnv("WHOP_SESSION_SECRET", "session-secret-test");
    vi.stubEnv("WHOP_WEBHOOK_SECRET", webhookSecret);
    vi.stubEnv("REVENUECAT_SECRET_API_KEY", "");
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("builds PKCE S256 authorize URLs and validates state + verifier from cookie", () => {
    const req = new Request("https://mealmate.app/api/auth/whop", {
      headers: { host: "mealmate.app", "x-forwarded-proto": "https" },
    });
    const { url, pkceCookieHeader } = buildWhopAuthorizeRequest(req, "redirect");
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe("https://api.whop.com/oauth/authorize");
    expect(parsed.searchParams.get("client_id")).toBe("client_test123");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://mealmate.app/api/auth/callback");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(pkceCookieHeader).toContain("HttpOnly");
    expect(pkceCookieHeader).toContain("Secure");

    const cookieVal = extractCookieValue(pkceCookieHeader, WHOP_PKCE_COOKIE);
    const state = parsed.searchParams.get("state")!;
    const callbackReq = new Request(
      `https://mealmate.app/api/auth/callback?code=abc&state=${state}`,
      { headers: { cookie: `${WHOP_PKCE_COOKIE}=${encodeURIComponent(cookieVal)}` } },
    );

    const verified = verifyPkceCookie(callbackReq, state);
    expect(verified).not.toBeNull();
    const expectedChallenge = createHash("sha256")
      .update(verified!.codeVerifier)
      .digest("base64url");
    expect(parsed.searchParams.get("code_challenge")).toBe(expectedChallenge);

    expect(verifyPkceCookie(callbackReq, "wrong-state")).toBeNull();
  });

  it("auto-refreshes expired 1h Whop access tokens in sealed httpOnly cookies", async () => {
    const req = new Request("https://mealmate.app/api/auth/session", {
      headers: { "x-forwarded-proto": "https" },
    });
    const expiredCookie = sealWhopSessionCookie(
      {
        userId: "whop_user_42",
        whopUserId: "user_42",
        email: "chef@mealmate.app",
        displayName: "Chef",
        photoURL: null,
        emailVerified: true,
        accessToken: "old_access",
        refreshToken: "valid_refresh",
        expiresAt: Date.now() - 60_000,
      },
      req,
    );
    const cookieVal = extractCookieValue(expiredCookie, WHOP_SESSION_COOKIE);

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const target = String(input);
      if (target === "https://api.whop.com/oauth/token") {
        return new Response(
          JSON.stringify({
            access_token: "fresh_access",
            refresh_token: "fresh_refresh",
            expires_in: 3600,
          }),
          { status: 200 },
        );
      }
      if (target === "https://api.whop.com/oauth/userinfo") {
        return new Response(
          JSON.stringify({ sub: "user_42", email: "chef@mealmate.app", name: "Chef Pro" }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const authedReq = new Request("https://mealmate.app/api/auth/session", {
      headers: {
        "x-forwarded-proto": "https",
        cookie: `${WHOP_SESSION_COOKIE}=${encodeURIComponent(cookieVal)}`,
      },
    });
    const result = await getWhopSessionFromRequest(authedReq);
    expect(result.session?.accessToken).toBe("fresh_access");
    expect(result.publicUser?.displayName).toBe("Chef Pro");
    expect(result.setCookieHeader).toContain(`${WHOP_SESSION_COOKIE}=`);

    const resolved = await resolveAuthenticatedRequest(authedReq);
    expect(resolved?.userId).toBe("whop_user_42");
    expect(resolved?.provider).toBe("whop");
  });

  it("creates server-side Whop checkout configurations with 3-day trial or configured plan ID", async () => {
    sdkMock.checkoutCreate.mockResolvedValue({
      id: "ch_test_123",
      purchase_url: "https://whop.com/checkout/ch_test_123",
      variant: { id: "plan_inline_annual" },
    });

    const inlineConfig = await createWhopCheckoutConfig({
      userId: "whop_user_42",
      planKind: "yearly",
      currency: "USD",
      returnUrl: "https://mealmate.app/premium/complete",
      whopUserId: "user_42",
    });

    expect(inlineConfig.id).toBe("ch_test_123");
    expect(sdkMock.checkoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: "biz_test123",
        redirect_url: "https://mealmate.app/premium/complete",
        metadata: expect.objectContaining({ user_id: "whop_user_42", plan_kind: "yearly" }),
        variant: expect.objectContaining({
          billing_type: "renewal",
          initial_price: 0,
          renewal_price: 74.99,
          billing_period: 365,
          trial_period_days: 3,
        }),
      }),
    );

    vi.stubEnv("WHOP_PLAN_FAMILY_ID", "plan_family_existing");
    await createWhopCheckoutConfig({
      userId: "whop_user_42",
      planKind: "family",
      currency: "USD",
      returnUrl: "https://mealmate.app/premium/complete",
    });
    expect(sdkMock.checkoutCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        account_id: "biz_test123",
        variant_id: "plan_family_existing",
      }),
    );
  });

  it("verifies Whop webhooks with unwrapWebhook and toggles Premium in Firestore", async () => {
    const createdBody = JSON.stringify({
      id: "evt_created_1",
      type: "membership.created",
      data: {
        id: "mem_1",
        user_id: "user_99",
        status: "trialing",
        metadata: { user_id: "uid_99", plan_kind: "yearly" },
        current_period_end: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      },
    });
    const validHeaders = signStandardWebhook(createdBody, webhookSecret, "msg_created_1");
    expect(() =>
      unwrapWhopWebhookEvent(createdBody, new Headers({ "webhook-signature": "v1,bad" })),
    ).toThrow();

    const parsedCreated = unwrapWhopWebhookEvent(createdBody, validHeaders);
    const createdOutcome = await processWhopWebhookEvent(parsedCreated, "msg_created_1");
    expect(createdOutcome.status).toBe(200);

    sdkMock.membershipsList.mockResolvedValue({ data: [] });
    const accessAfterCreate = await verifyAccountAccess("uid_99");
    expect(accessAfterCreate.isPremium).toBe(true);
    expect(accessAfterCreate.trialActive).toBe(true);
    expect(accessAfterCreate.store).toBe("whop");

    // Duplicate delivery is ignored idempotently
    const dupOutcome = await processWhopWebhookEvent(parsedCreated, "msg_created_1");
    expect(dupOutcome.body).toBe("Duplicate");

    // Cancellation turns Premium off and blocks server-side premium-gated endpoints
    const canceledBody = JSON.stringify({
      id: "evt_canceled_1",
      type: "membership.canceled",
      data: {
        id: "mem_1",
        user_id: "user_99",
        status: "canceled",
        metadata: { user_id: "uid_99" },
      },
    });
    const canceledEvent = unwrapWhopWebhookEvent(
      canceledBody,
      signStandardWebhook(canceledBody, webhookSecret, "msg_canceled_1"),
    );
    await processWhopWebhookEvent(canceledEvent, "msg_canceled_1");

    const accessAfterCancel = await verifyAccountAccess("uid_99");
    expect(accessAfterCancel.isPremium).toBe(false);
    await expect(requireActivePremium("uid_99")).rejects.toMatchObject({ status: 402 });
  });

  it("enforces server-side auth (401) and Premium gating (402 / 200) on AI API routes", async () => {
    const unauth = await authenticateApiRequest(
      new Request("https://mealmate.app/api/mia", { method: "POST" }),
    );
    expect("response" in unauth ? unauth.response?.status : undefined).toBe(401);

    const cookieHeader = sealWhopSessionCookie(
      {
        userId: "whop_user_77",
        whopUserId: "user_77",
        email: "member@mealmate.app",
        displayName: "Member",
        photoURL: null,
        emailVerified: true,
        accessToken: "valid_access",
        refreshToken: "valid_refresh",
        expiresAt: Date.now() + 3_600_000,
      },
      new Request("https://mealmate.app", { headers: { "x-forwarded-proto": "https" } }),
    );
    const cookieVal = extractCookieValue(cookieHeader, WHOP_SESSION_COOKIE);

    sdkMock.membershipsList.mockResolvedValue({ data: [] });
    const unpaidRes = await authenticateApiRequest(
      new Request("https://mealmate.app/api/mia", {
        method: "POST",
        headers: {
          origin: "https://mealmate.app",
          host: "mealmate.app",
          "x-forwarded-proto": "https",
          cookie: `${WHOP_SESSION_COOKIE}=${encodeURIComponent(cookieVal)}`,
        },
      }),
    );
    expect("response" in unpaidRes ? unpaidRes.response?.status : undefined).toBe(402);

    // Webhook payment.succeeded unlocks Premium for that Whop user
    await processWhopWebhookEvent({
      id: "evt_pay_77",
      type: "payment.succeeded",
      data: {
        id: "pay_77",
        user_id: "user_77",
        status: "paid",
        metadata: { user_id: "whop_user_77", plan_kind: "monthly" },
      },
    });

    const paidRes = await authenticateApiRequest(
      new Request("https://mealmate.app/api/mia", {
        method: "POST",
        headers: {
          origin: "https://mealmate.app",
          host: "mealmate.app",
          "x-forwarded-proto": "https",
          cookie: `${WHOP_SESSION_COOKIE}=${encodeURIComponent(cookieVal)}`,
        },
      }),
    );
    expect("user" in paidRes ? paidRes.user?.userId : undefined).toBe("whop_user_77");
  });
});
