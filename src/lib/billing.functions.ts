import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getCookie, setCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";

const billing = createServerOnlyFn(() => import("@/server/revenuecat"));
const loadWhop = createServerOnlyFn(() => import("@/server/whop"));
const loadWhopAuth = createServerOnlyFn(() => import("@/server/whop-auth"));
const COOKIE = "mealmate_purchase";

export const createPurchaseSession = createServerFn({ method: "POST" }).handler(async () => {
  let userId: string | undefined;
  let claims:
    | {
        email?: string | null;
        admin?: unknown;
        isAdmin?: unknown;
        role?: unknown;
        whopUserId?: string;
      }
    | undefined;
  const request = getRequest();
  const { resolveAuthenticatedRequest, resolveRequestOrigin } = await loadWhopAuth();

  const authorization = request.headers.get("authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) throw new Response("Unauthorized", { status: 401 });
    try {
      const verified = await (await loadFirebaseAdmin()).verifyFirebaseIdToken(match[1]!);
      userId = verified.uid;
      claims = verified;
    } catch {
      throw new Response("Unauthorized", { status: 401 });
    }
  } else {
    const resolved = await resolveAuthenticatedRequest(request);
    if (resolved) {
      userId = resolved.userId;
      claims = resolved.claims;
    }
  }

  const service = await billing();
  const whopService = await loadWhop();
  service.assertBillingOrigin(request);
  const cookieToken = getCookie(COOKIE);
  let identity: { customerId: string; token: string | null } = {
    customerId: userId ?? `guest_${Date.now()}`,
    token: null,
  };
  try {
    identity = await service.purchaseIdentity(cookieToken, userId);
  } catch {
    // Allow paywall offerings to load cleanly even when Firebase Admin is unconfigured.
  }
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttps = forwardedProto === "https" || request.url.startsWith("https:");
  if (identity.token)
    setCookie(COOKIE, identity.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 90 * 86400,
    });
  let isActive = false;
  const hasSecretKey = Boolean((process.env["REVENUECAT_SECRET_API_KEY"] ?? "").trim());
  const whopEnabled = whopService.isWhopCheckoutConfigured();
  if (hasSecretKey || whopEnabled) {
    try {
      const checkPromise = userId
        ? service.verifyAccountAccess(userId, cookieToken, claims)
        : !identity.token && hasSecretKey
          ? service.verifyRevenueCatCustomer(identity.customerId)
          : Promise.resolve({ isPremium: false });
      const result = await Promise.race([
        checkPromise,
        new Promise<{ isPremium: boolean }>((resolve) =>
          setTimeout(() => resolve({ isPremium: false }), 2500),
        ),
      ]);
      isActive = result.isPremium;
    } catch {
      isActive = false;
    }
  }
  return {
    appUserId: identity.customerId,
    offering: service.OFFERING,
    isActive,
    whopEnabled,
    returnUrl: `${resolveRequestOrigin(request)}/premium/complete`,
    webApiKey: process.env["REVENUECAT_WEB_PUBLIC_KEY"] ?? null,
    androidApiKey: process.env["REVENUECAT_ANDROID_PUBLIC_KEY"] ?? null,
    iosApiKey: process.env["REVENUECAT_IOS_PUBLIC_KEY"] ?? null,
  };
});

export const createWhopCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) =>
    z
      .object({
        planKind: z.enum(["monthly", "yearly", "family"]),
        currency: z.enum(["USD", "ZAR"]).optional().default("USD"),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const service = await billing();
    service.assertBillingOrigin(request);
    const { resolveRequestOrigin } = await loadWhopAuth();
    const { createWhopCheckoutConfig } = await loadWhop();
    const returnUrl = `${resolveRequestOrigin(request)}/premium/complete`;
    const whopUserId =
      typeof (context.claims as { whopUserId?: unknown } | undefined)?.whopUserId === "string"
        ? (context.claims as { whopUserId: string }).whopUserId
        : null;

    const config = await createWhopCheckoutConfig({
      userId: context.userId,
      planKind: data.planKind,
      currency: data.currency,
      returnUrl,
      whopUserId,
    });
    return {
      ...config,
      returnUrl,
    };
  });

export const verifyCheckout = createServerFn({ method: "POST" }).handler(async () => {
  const service = await billing();
  service.assertBillingOrigin(getRequest());
  return service.verifyPurchaseSession(getCookie(COOKIE));
});

export const verifyMyPremium = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const service = await billing();
    service.assertBillingOrigin(getRequest());
    return service.verifyAccountAccess(context.userId, getCookie(COOKIE), context.claims);
  });

// Intro progress is presentation state only and never participates in entitlement checks.
export const getIntroCompletion = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    return (
      await getFirebaseAdminFirestore().collection("intro_completion").doc(context.userId).get()
    ).exists;
  });

export const completeIntro = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    await getFirebaseAdminFirestore()
      .collection("intro_completion")
      .doc(context.userId)
      .set({ completed: true });
    return true;
  });
