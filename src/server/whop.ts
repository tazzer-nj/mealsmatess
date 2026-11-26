import { WhopClient } from "@whop/sdk";
import { Timestamp } from "firebase-admin/firestore";
import {
  invalidateAccountAccessCache,
  revokePromotionalEntitlementInRevenueCat,
  syncPromotionalEntitlementToRevenueCat,
  type PremiumAccess,
} from "@/server/revenuecat";

export type WhopPlanKind = "monthly" | "yearly" | "family" | "yearly_exit";

export type WhopPlanSpec = {
  kind: WhopPlanKind;
  title: string;
  description: string;
  priceAmount: number;
  priceDisplay: string;
  currency: "usd";
  billingPeriodDays: number;
  periodLabel: "month" | "year";
  trialPeriodDays: number;
  envPlanKey: string;
};

export const WHOP_PLANS: Record<WhopPlanKind, WhopPlanSpec> = {
  yearly: {
    kind: "yearly",
    title: "MealMate Premium — Yearly",
    description:
      "Unlimited Mia AI chef, weekly meal planning, kitchen scanner, and personalized recipes (3-day free trial).",
    priceAmount: 79.99,
    priceDisplay: "$79.99",
    currency: "usd",
    billingPeriodDays: 365,
    periodLabel: "year",
    trialPeriodDays: 3,
    envPlanKey: "WHOP_PLAN_YEARLY_ID",
  },
  family: {
    kind: "family",
    title: "MealMate Premium — Family",
    description:
      "Full MealMate Premium access with household meal planning & shared recipes (3-day free trial).",
    priceAmount: 119.99,
    priceDisplay: "$119.99",
    currency: "usd",
    billingPeriodDays: 365,
    periodLabel: "year",
    trialPeriodDays: 3,
    envPlanKey: "WHOP_PLAN_FAMILY_ID",
  },
  monthly: {
    kind: "monthly",
    title: "MealMate Premium — Monthly",
    description:
      "Full monthly access to Mia AI chef, pantry tracking, and kitchen scanner (3-day free trial).",
    priceAmount: 9.99,
    priceDisplay: "$9.99",
    currency: "usd",
    billingPeriodDays: 30,
    periodLabel: "month",
    trialPeriodDays: 3,
    envPlanKey: "WHOP_PLAN_MONTHLY_ID",
  },
  yearly_exit: {
    kind: "yearly_exit",
    title: "MealMate Premium — Yearly (20% Off Year 1)",
    description:
      "Introductory 20% off first year of MealMate Premium with unlimited Mia AI and kitchen scanner.",
    priceAmount: 63.99,
    priceDisplay: "$63.99",
    currency: "usd",
    billingPeriodDays: 365,
    periodLabel: "year",
    trialPeriodDays: 3,
    envPlanKey: "WHOP_PLAN_YEARLY_EXIT_ID",
  },
};

const LEASE_MS = 5 * 60_000;
let cachedWhopClient: WhopClient | null = null;
let cachedTokenSnapshot: string | undefined;

export function isWhopBillingConfigured(): boolean {
  return Boolean(
    (process.env["WHOP_API_KEY"] ?? "").trim() && (process.env["WHOP_ACCOUNT_ID"] ?? "").trim(),
  );
}

export function isWhopOAuthConfigured(): boolean {
  return Boolean((process.env["WHOP_CLIENT_ID"] ?? "").trim());
}

export function getWhopAccountId(): string {
  const accountId = (process.env["WHOP_ACCOUNT_ID"] ?? "").trim();
  if (!accountId) {
    throw new Error("WHOP_ACCOUNT_ID is not configured.");
  }
  return accountId;
}

export function getWhopClient(): WhopClient {
  const token = (process.env["WHOP_API_KEY"] ?? "").trim();
  if (!token) {
    throw new Error("WHOP_API_KEY is not configured.");
  }
  if (!cachedWhopClient || cachedTokenSnapshot !== token) {
    cachedTokenSnapshot = token;
    cachedWhopClient = new WhopClient({
      token,
      baseUrl: "https://api.whop.com/api/v1",
    });
  }
  return cachedWhopClient;
}

export type WhopAppliedPromo = {
  code: string;
  percentOff: number;
  discountedPriceAmount: number;
  discountedPriceDisplay: string;
};

export async function createWhopCheckoutConfig(params: {
  userId: string;
  planKind: WhopPlanKind;
  origin: string;
  whopUserId?: string | null;
  customerEmail?: string | null;
  promoCode?: string | null;
}): Promise<{
  id: string;
  plan: WhopPlanSpec;
  returnUrl: string;
  appliedPromo: WhopAppliedPromo | null;
}> {
  const baseSpec = WHOP_PLANS[params.planKind];
  const accountId = getWhopAccountId();
  const whop = getWhopClient();
  const returnUrl = `${params.origin.replace(/\/$/, "")}/premium/complete`;
  const existingVariantId = (process.env[baseSpec.envPlanKey] ?? "").trim();
  const productId = (process.env["WHOP_PRODUCT_ID"] ?? "").trim();

  let spec = baseSpec;
  let appliedPromo: WhopAppliedPromo | null = null;
  let promoMetadata: Record<string, string> = {};

  if (params.promoCode && params.promoCode.trim()) {
    const {
      PromoValidationError,
      applyPercentDiscountToAmount,
      normalizePercentOff,
      validatePromoCodeForUser,
    } = await import("@/server/promo");
    const promo = await validatePromoCodeForUser({
      userId: params.userId,
      code: params.promoCode,
    });
    if (promo.reward_kind !== "percent_discount") {
      throw new PromoValidationError(
        "This promo code grants free Premium time — apply it directly on the Plans or Settings page.",
      );
    }
    const percentOff = normalizePercentOff(promo.reward_value);
    if (percentOff <= 0) {
      throw new PromoValidationError("This discount promo code is not configured yet.");
    }
    const discountedAmount = applyPercentDiscountToAmount(baseSpec.priceAmount, percentOff);
    const discountedDisplay = `$${discountedAmount.toFixed(2)}`;
    spec = {
      ...baseSpec,
      title: `${baseSpec.title} (${percentOff}% off)`,
      priceAmount: discountedAmount,
      priceDisplay: discountedDisplay,
    };
    appliedPromo = {
      code: promo.code,
      percentOff,
      discountedPriceAmount: discountedAmount,
      discountedPriceDisplay: discountedDisplay,
    };
    promoMetadata = {
      promo_id: promo.id,
      promo_code: promo.code,
      promo_percent_off: String(percentOff),
    };
  }

  const metadata: Record<string, unknown> = {
    user_id: params.userId,
    plan_kind: params.planKind,
    ...(params.whopUserId ? { whop_user_id: params.whopUserId } : {}),
    ...(params.customerEmail ? { email: params.customerEmail } : {}),
    ...promoMetadata,
  };

  // Use inline discounted variant whenever a validated percentage promo discount is applied
  const useExistingVariant = Boolean(existingVariantId) && !appliedPromo;

  const config = await whop.checkoutConfigurations.create(
    useExistingVariant
      ? {
          account_id: accountId,
          variant_id: existingVariantId,
          metadata,
          redirect_url: returnUrl,
        }
      : {
          account_id: accountId,
          mode: "payment",
          variant: {
            account_id: accountId,
            ...(productId ? { product_id: productId } : {}),
            title: spec.title,
            description: spec.description,
            billing_type: "renewal",
            billing_period: spec.billingPeriodDays,
            currency: spec.currency,
            initial_price: spec.trialPeriodDays > 0 ? 0 : spec.priceAmount,
            renewal_price: spec.priceAmount,
            trial_period_days: spec.trialPeriodDays,
            visibility: "hidden",
            release_method: "buy_now",
          },
          metadata,
          redirect_url: returnUrl,
        },
  );

  return {
    id: config.id,
    plan: spec,
    returnUrl,
    appliedPromo,
  };
}

function tierFromPlanKind(planKind: unknown, priceAmount?: number | null): string {
  const key = typeof planKind === "string" ? planKind.toLowerCase() : "";
  if (key.includes("family")) return "family";
  if (key.includes("yearly") || key.includes("annual") || (priceAmount ?? 0) >= 50) return "annual";
  if (key.includes("monthly")) return "monthly";
  return "yearly";
}

function deniedAccess(): PremiumAccess {
  return {
    isPremium: false,
    tier: "free",
    status: "expired",
    trialActive: false,
    periodEnd: null,
    trialEnd: null,
    store: null,
    autoRenew: false,
    isManual: false,
    verifiedUntil: 0,
  };
}

function toIsoDate(value: unknown): string | null {
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    // Whop sometimes provides unix seconds vs milliseconds
    const ms = value > 1e12 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  return null;
}

export async function resolveMealMateUserIdFromWhopPayload(
  payload: Record<string, unknown>,
): Promise<string | null> {
  const metadata =
    payload["metadata"] && typeof payload["metadata"] === "object"
      ? (payload["metadata"] as Record<string, unknown>)
      : null;

  const metadataUserId =
    typeof metadata?.["user_id"] === "string" && metadata["user_id"].trim()
      ? metadata["user_id"].trim()
      : null;
  if (metadataUserId) return metadataUserId;

  const userObj =
    payload["user"] && typeof payload["user"] === "object"
      ? (payload["user"] as Record<string, unknown>)
      : null;
  const whopUserId =
    typeof payload["user_id"] === "string"
      ? payload["user_id"].trim()
      : typeof userObj?.["id"] === "string"
        ? userObj["id"].trim()
        : null;

  const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();

  if (whopUserId) {
    try {
      const mapping = await db.collection("whop_users").doc(whopUserId).get();
      const mappedUid = mapping.data()?.["user_id"];
      if (typeof mappedUid === "string" && mappedUid.trim()) {
        return mappedUid.trim();
      }
    } catch {
      // Fall through to email lookup
    }
    try {
      const userSnap = await db
        .collection("users")
        .where("whop_user_id", "==", whopUserId)
        .limit(1)
        .get();
      if (!userSnap.empty) return userSnap.docs[0].id;
    } catch {
      // Ignore query errors
    }
  }

  const emailCandidate =
    typeof userObj?.["email"] === "string"
      ? userObj["email"]
      : typeof payload["email"] === "string"
        ? payload["email"]
        : typeof metadata?.["email"] === "string"
          ? metadata["email"]
          : null;
  if (emailCandidate && emailCandidate.includes("@")) {
    const normalized = emailCandidate.trim().toLowerCase();
    try {
      const byEmail = await db.collection("users").where("email", "==", normalized).limit(1).get();
      if (!byEmail.empty) return byEmail.docs[0].id;
    } catch {
      // Ignore query errors
    }
  }

  return whopUserId ? `whop_${whopUserId.replace(/[^a-zA-Z0-9_-]/g, "_")}` : null;
}

export async function grantWhopPremiumAccess(params: {
  userId: string;
  whopUserId?: string | null;
  membershipId?: string | null;
  paymentId?: string | null;
  planId?: string | null;
  planKind?: string | null;
  status?: "active" | "trialing";
  periodEnd?: string | null;
  trialEnd?: string | null;
  autoRenew?: boolean;
  amount?: number | null;
  currency?: string | null;
  eventId?: string | null;
}): Promise<void> {
  const { firebaseAdmin, getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();
  const nowIso = new Date().toISOString();
  const status = params.status === "trialing" ? "trialing" : "active";
  const tier = tierFromPlanKind(params.planKind ?? params.planId, params.amount);
  const periodEndMs = params.periodEnd ? Date.parse(params.periodEnd) : NaN;
  const validUntilMs = Number.isFinite(periodEndMs) ? periodEndMs : Date.now() + 31 * 86_400_000;

  await db
    .collection("whop_access")
    .doc(params.userId)
    .set(
      {
        user_id: params.userId,
        active: true,
        tier,
        status,
        trial_active: status === "trialing",
        period_end: params.periodEnd ?? null,
        trial_end: params.trialEnd ?? (status === "trialing" ? (params.periodEnd ?? null) : null),
        auto_renew: params.autoRenew ?? true,
        whop_user_id: params.whopUserId ?? null,
        whop_membership_id: params.membershipId ?? null,
        whop_payment_id: params.paymentId ?? null,
        whop_plan_id: params.planId ?? null,
        updated_at: nowIso,
      },
      { merge: true },
    );

  if (params.whopUserId) {
    await db
      .collection("whop_users")
      .doc(params.whopUserId)
      .set(
        {
          whop_user_id: params.whopUserId,
          user_id: params.userId,
          updated_at: nowIso,
        },
        { merge: true },
      )
      .catch(() => undefined);
  }

  await db
    .collection("users")
    .doc(params.userId)
    .set(
      {
        id: params.userId,
        is_premium: true,
        premium: true,
        subscription_status: status,
        subscription_tier: tier,
        ...(params.whopUserId ? { whop_user_id: params.whopUserId } : {}),
        ...(params.membershipId ? { whop_membership_id: params.membershipId } : {}),
        updatedAt: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await db
    .collection("premium_access")
    .doc(params.userId)
    .set(
      {
        valid_until: Timestamp.fromMillis(validUntilMs),
        source: "whop",
        entitlement: "premium",
        is_premium: true,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  const subDocId = `whop_${params.userId}`;
  await db
    .collection("subscriptions")
    .doc(subDocId)
    .set(
      {
        id: subDocId,
        user_id: params.userId,
        store: "whop",
        product_id: params.planId ?? params.planKind ?? tier,
        tier,
        status,
        period_start: nowIso,
        period_end: params.periodEnd ?? null,
        trial_end: params.trialEnd ?? (status === "trialing" ? (params.periodEnd ?? null) : null),
        auto_renew: params.autoRenew ?? true,
        is_manual: false,
        whop_user_id: params.whopUserId ?? null,
        whop_membership_id: params.membershipId ?? null,
        whop_payment_id: params.paymentId ?? null,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  if (params.eventId && typeof params.amount === "number" && params.amount > 0) {
    await firebaseAdmin
      .from("payments")
      .insert({
        user_id: params.userId,
        subscription_id: subDocId,
        rc_event_id: `whop_${params.eventId}`,
        amount_usd: params.amount,
        currency: (params.currency ?? "USD").toUpperCase(),
        kind: "whop_payment",
        occurred_at: nowIso,
      })
      .then(
        () => undefined,
        () => undefined,
      );
  }

  invalidateAccountAccessCache(params.userId);
  await syncPromotionalEntitlementToRevenueCat({
    userId: params.userId,
    periodEnd: params.periodEnd ?? new Date(validUntilMs).toISOString(),
    lifetime: false,
  }).catch(() => undefined);
}

export async function revokeWhopPremiumAccess(params: {
  userId: string;
  whopUserId?: string | null;
  membershipId?: string | null;
  reasonStatus?: "cancelled" | "expired";
  cancelAtPeriodEndOnly?: boolean;
  periodEnd?: string | null;
}): Promise<void> {
  const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();
  const nowIso = new Date().toISOString();
  const reason = params.reasonStatus ?? "cancelled";

  if (
    params.cancelAtPeriodEndOnly &&
    params.periodEnd &&
    Date.parse(params.periodEnd) > Date.now()
  ) {
    await db
      .collection("whop_access")
      .doc(params.userId)
      .set(
        {
          auto_renew: false,
          period_end: params.periodEnd,
          updated_at: nowIso,
        },
        { merge: true },
      )
      .catch(() => undefined);
    await db
      .collection("subscriptions")
      .doc(`whop_${params.userId}`)
      .set(
        {
          auto_renew: false,
          cancelled_at: nowIso,
          period_end: params.periodEnd,
          updated_at: nowIso,
        },
        { merge: true },
      )
      .catch(() => undefined);
    invalidateAccountAccessCache(params.userId);
    await syncPromotionalEntitlementToRevenueCat({
      userId: params.userId,
      periodEnd: params.periodEnd,
      lifetime: false,
    }).catch(() => undefined);
    return;
  }

  await db
    .collection("whop_access")
    .doc(params.userId)
    .set(
      {
        user_id: params.userId,
        active: false,
        status: reason,
        trial_active: false,
        auto_renew: false,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await db
    .collection("users")
    .doc(params.userId)
    .set(
      {
        id: params.userId,
        is_premium: false,
        premium: false,
        subscription_status: reason,
        updatedAt: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await db
    .collection("premium_access")
    .doc(params.userId)
    .set(
      {
        valid_until: Timestamp.fromMillis(0),
        source: "whop",
        entitlement: "premium",
        is_premium: false,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await db
    .collection("subscriptions")
    .doc(`whop_${params.userId}`)
    .set(
      {
        status: reason,
        auto_renew: false,
        cancelled_at: nowIso,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  invalidateAccountAccessCache(params.userId);
  await revokePromotionalEntitlementInRevenueCat(params.userId).catch(() => undefined);
}

export async function verifyWhopAccountAccess(
  userId: string,
  options?: { whopUserId?: string | null },
): Promise<PremiumAccess | null> {
  const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();
  const now = Date.now();

  const whopAccessSnap = await db.collection("whop_access").doc(userId).get();
  const accessData = whopAccessSnap.data() as Record<string, unknown> | undefined;
  if (accessData && accessData["active"] === true) {
    const periodEnd = toIsoDate(accessData["period_end"]);
    const periodEndMs = periodEnd ? Date.parse(periodEnd) : Infinity;
    if (periodEndMs > now) {
      const trialActive = Boolean(accessData["trial_active"]);
      return {
        isPremium: true,
        tier: String(accessData["tier"] ?? "yearly"),
        status: String(accessData["status"] ?? (trialActive ? "trialing" : "active")),
        trialActive,
        periodEnd,
        trialEnd: toIsoDate(accessData["trial_end"]),
        store: "whop",
        autoRenew: accessData["auto_renew"] !== false,
        isManual: false,
        verifiedUntil: Number.isFinite(periodEndMs)
          ? Math.min(now + LEASE_MS, periodEndMs)
          : now + LEASE_MS,
      };
    }
  }

  // If Whop API credentials and a Whop user ID are available, verify live memberships from Whop directly.
  if (isWhopBillingConfigured()) {
    let whopUserId =
      options?.whopUserId ??
      (typeof accessData?.["whop_user_id"] === "string" ? accessData["whop_user_id"] : null);
    if (!whopUserId) {
      try {
        const userSnap = await db.collection("users").doc(userId).get();
        const raw = userSnap.data()?.["whop_user_id"];
        if (typeof raw === "string" && raw.trim()) whopUserId = raw.trim();
      } catch {
        // Ignore lookup error if user doc does not exist
      }
    }

    if (whopUserId) {
      try {
        const whop = getWhopClient();
        const page = await whop.memberships.list({
          account_id: getWhopAccountId(),
          user_id: whopUserId,
          statuses: ["active", "trialing"],
          first: 10,
        });
        const liveMembership = page.data?.[0];
        if (liveMembership) {
          const isTrial = liveMembership.status === "trialing";
          const periodEnd = toIsoDate(
            liveMembership.current_period_end ?? liveMembership.expires_at,
          );
          await grantWhopPremiumAccess({
            userId,
            whopUserId,
            membershipId: liveMembership.id,
            planId: liveMembership.variant_id ?? null,
            planKind: (liveMembership.metadata?.["plan_kind"] as string | undefined) ?? null,
            status: isTrial ? "trialing" : "active",
            periodEnd,
            autoRenew: !liveMembership.cancel_at_period_end,
          });
          const endMs = periodEnd ? Date.parse(periodEnd) : Infinity;
          return {
            isPremium: true,
            tier: tierFromPlanKind(
              liveMembership.metadata?.["plan_kind"] ?? liveMembership.variant_id,
            ),
            status: liveMembership.status,
            trialActive: isTrial,
            periodEnd,
            trialEnd: isTrial ? periodEnd : null,
            store: "whop",
            autoRenew: !liveMembership.cancel_at_period_end,
            isManual: false,
            verifiedUntil: Number.isFinite(endMs)
              ? Math.min(now + LEASE_MS, endMs)
              : now + LEASE_MS,
          };
        }
      } catch {
        // Fail closed below if Whop live check could not confirm active membership
      }
    }
  }

  return accessData ? deniedAccess() : null;
}

function parseMoneyAmount(money: { amount?: string } | number | null | undefined): number | null {
  if (typeof money === "number" && Number.isFinite(money)) return money;
  if (money && typeof money === "object" && typeof money.amount === "string") {
    const parsed = Number.parseFloat(money.amount);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function verifyAndActivateWhopCheckout(params: {
  userId: string;
  paymentId?: string | null;
  whopUserId?: string | null;
}): Promise<PremiumAccess> {
  if (isWhopBillingConfigured() && params.paymentId) {
    try {
      const whop = getWhopClient();
      const payment = await whop.payments.retrieve({ id: params.paymentId });
      const paymentMetadataUserId =
        typeof payment.metadata?.["user_id"] === "string" ? payment.metadata["user_id"] : null;
      const paymentMatchesUser =
        !paymentMetadataUserId ||
        paymentMetadataUserId === params.userId ||
        (params.whopUserId && payment.user?.id === params.whopUserId);

      if (paymentMatchesUser && (payment.status === "paid" || payment.substatus === "succeeded")) {
        const membershipId = payment.membership_id ?? null;
        let membershipStatus: "active" | "trialing" = "active";
        let periodEnd: string | null = null;
        if (membershipId) {
          try {
            const membership = await whop.memberships.retrieve({ id: membershipId });
            if (membership.status === "trialing") {
              membershipStatus = "trialing";
            }
            periodEnd = toIsoDate(membership.current_period_end ?? membership.expires_at);
          } catch {
            // Proceed with payment confirmation even if membership follow-up fails
          }
        }
        const totalAmount = parseMoneyAmount(payment.total);
        await grantWhopPremiumAccess({
          userId: params.userId,
          whopUserId: payment.user?.id ?? params.whopUserId ?? null,
          membershipId,
          paymentId: payment.id,
          planId: payment.variant_id ?? null,
          planKind: (payment.metadata?.["plan_kind"] as string | undefined) ?? null,
          status: membershipStatus,
          periodEnd,
          amount: totalAmount,
          currency: payment.currency ?? "USD",
          eventId: payment.id,
        });

        const promoId =
          typeof payment.metadata?.["promo_id"] === "string" ? payment.metadata["promo_id"] : null;
        const promoCode =
          typeof payment.metadata?.["promo_code"] === "string"
            ? payment.metadata["promo_code"]
            : null;
        const promoPct = Number(payment.metadata?.["promo_percent_off"] ?? 0) || 0;
        if (promoId && promoCode) {
          const { recordPromoRedemptionIfNeeded } = await import("@/server/promo");
          await recordPromoRedemptionIfNeeded({
            promoId,
            userId: params.userId,
            code: promoCode,
            rewardKind: "percent_discount",
            percentOff: promoPct,
          }).catch(() => undefined);
        }
      }
    } catch {
      // Fall through to normal live membership + Firestore verification
    }
  }

  const verified = await verifyWhopAccountAccess(params.userId, {
    whopUserId: params.whopUserId,
  });
  return verified ?? deniedAccess();
}

export function extractWhopEventTimestampIso(value: unknown): string | null {
  return toIsoDate(value);
}

export async function cancelWhopMembershipForUser(userId: string): Promise<{
  cancelled: boolean;
  periodEnd: string | null;
  access: PremiumAccess;
}> {
  const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();
  const [accessSnap, subSnap] = await Promise.all([
    db.collection("whop_access").doc(userId).get(),
    db.collection("subscriptions").doc(`whop_${userId}`).get(),
  ]);
  const accessData = accessSnap.data() as Record<string, unknown> | undefined;
  const subData = subSnap.data() as Record<string, unknown> | undefined;
  const membershipId =
    (typeof accessData?.["whop_membership_id"] === "string" && accessData["whop_membership_id"]) ||
    (typeof subData?.["whop_membership_id"] === "string" && subData["whop_membership_id"]) ||
    null;

  if (!membershipId) {
    throw new Error("No active Whop membership ID was found on this account.");
  }

  let periodEnd = toIsoDate(accessData?.["period_end"] ?? subData?.["period_end"]);
  if (isWhopBillingConfigured()) {
    const whop = getWhopClient();
    const updated = await whop.memberships.cancel({
      id: membershipId,
      cancel_at_period_end: true,
    });
    periodEnd = toIsoDate(updated.current_period_end ?? updated.expires_at) ?? periodEnd;
  }

  await revokeWhopPremiumAccess({
    userId,
    membershipId,
    reasonStatus: "cancelled",
    cancelAtPeriodEndOnly: Boolean(periodEnd && Date.parse(periodEnd) > Date.now()),
    periodEnd,
  });

  const access = (await verifyWhopAccountAccess(userId)) ?? deniedAccess();
  return { cancelled: true, periodEnd, access };
}
