import { WhopClient } from "@whop/sdk";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { Timestamp } from "firebase-admin/firestore";
import type { PremiumAccess } from "@/server/revenuecat";

export type WhopPlanKind = "monthly" | "yearly" | "family";

const LEASE_MS = 5 * 60_000;
const DAY_MS = 86_400_000;

type PlanSpec = {
  kind: WhopPlanKind;
  title: string;
  description: string;
  billingPeriodDays: number;
  trialDays: number;
  prices: { USD: number; ZAR: number };
  planEnvKeys: readonly string[];
};

const PLAN_CATALOG: Record<WhopPlanKind, PlanSpec> = {
  yearly: {
    kind: "yearly",
    title: "MealMate Premium Annual",
    description: "3-day free trial, then billed annually. Unlimited Mia AI, scanner & planner.",
    billingPeriodDays: 365,
    trialDays: 3,
    prices: { USD: 74.99, ZAR: 399.0 },
    planEnvKeys: ["WHOP_PLAN_ANNUAL_ID", "WHOP_PLAN_YEARLY_ID"],
  },
  monthly: {
    kind: "monthly",
    title: "MealMate Premium Monthly",
    description: "3-day free trial, then billed monthly. Unlimited Mia AI, scanner & planner.",
    billingPeriodDays: 30,
    trialDays: 3,
    prices: { USD: 7.99, ZAR: 189.0 },
    planEnvKeys: ["WHOP_PLAN_MONTHLY_ID"],
  },
  family: {
    kind: "family",
    title: "MealMate Premium Family",
    description: "3-day free trial for up to 5 accounts, then billed monthly.",
    billingPeriodDays: 30,
    trialDays: 3,
    prices: { USD: 12.99, ZAR: 249.0 },
    planEnvKeys: ["WHOP_PLAN_FAMILY_ID"],
  },
};

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

export function isWhopCheckoutConfigured(): boolean {
  return Boolean(
    (process.env["WHOP_API_KEY"] ?? "").trim() && (process.env["WHOP_ACCOUNT_ID"] ?? "").trim(),
  );
}

export function isWhopApiConfigured(): boolean {
  return Boolean((process.env["WHOP_API_KEY"] ?? "").trim());
}

export function getWhopClient(): WhopClient {
  const token = (process.env["WHOP_API_KEY"] ?? "").trim();
  if (!token) {
    throw new Error("WHOP_API_KEY is not configured.");
  }
  return new WhopClient({
    token,
    baseUrl: "https://api.whop.com/api/v1",
  });
}

function configuredPlanIdForKind(kind: WhopPlanKind): string | null {
  for (const key of PLAN_CATALOG[kind].planEnvKeys) {
    const val = (process.env[key] ?? "").trim();
    if (val) return val;
  }
  return null;
}

export async function createWhopCheckoutConfig(input: {
  userId: string;
  planKind: WhopPlanKind;
  currency?: string;
  returnUrl: string;
  whopUserId?: string | null;
}) {
  const accountId = (process.env["WHOP_ACCOUNT_ID"] ?? "").trim();
  if (!accountId) {
    throw new Error("WHOP_ACCOUNT_ID is not configured.");
  }
  const whop = getWhopClient();
  const spec = PLAN_CATALOG[input.planKind];
  const currency = input.currency?.toUpperCase() === "ZAR" ? "ZAR" : "USD";
  const amount = spec.prices[currency];
  const existingVariantId = configuredPlanIdForKind(input.planKind);

  const metadata: Record<string, unknown> = {
    user_id: input.userId,
    plan_kind: input.planKind,
    mealmate_plan: input.planKind,
  };
  if (input.whopUserId) {
    metadata["whop_user_id"] = input.whopUserId;
  }

  const productId = (process.env["WHOP_PRODUCT_ID"] ?? "").trim();

  const configuration = await whop.checkoutConfigurations.create({
    account_id: accountId,
    mode: "payment",
    redirect_url: input.returnUrl,
    metadata,
    ...(existingVariantId
      ? { variant_id: existingVariantId }
      : {
          variant: {
            account_id: accountId,
            ...(productId ? { product_id: productId } : {}),
            title: spec.title,
            description: spec.description,
            currency: currency.toLowerCase(),
            initial_price: 0,
            renewal_price: amount,
            billing_type: "renewal",
            billing_period: spec.billingPeriodDays,
            trial_period_days: spec.trialDays,
            visibility: "hidden",
            metadata,
          },
        }),
  });

  return {
    id: configuration.id,
    purchaseUrl: configuration.purchase_url ?? null,
    variantId: configuration.variant?.id ?? existingVariantId,
    planKind: input.planKind,
  };
}

export function unwrapWhopWebhookEvent<TEvent = Record<string, unknown>>(
  rawBody: string,
  headers: Headers,
): TEvent {
  return unwrapWebhook<TEvent>(rawBody, {
    headers: Object.fromEntries(headers),
    key: process.env["WHOP_WEBHOOK_SECRET"],
  });
}

type StoredWhopEntitlement = {
  user_id?: string;
  whop_user_id?: string | null;
  membership_id?: string | null;
  payment_id?: string | null;
  variant_id?: string | null;
  tier?: string;
  status?: string;
  active?: boolean;
  trial_active?: boolean;
  auto_renew?: boolean;
  period_start?: string | null;
  period_end?: string | null;
  trial_end?: string | null;
  updated_at?: string;
};

function mapTierFromPlan(planKindOrVariant?: string | null): string {
  const value = (planKindOrVariant ?? "").toLowerCase();
  if (value.includes("family")) return "family";
  if (value.includes("annual") || value.includes("year")) return "annual";
  if (value.includes("lifetime")) return "lifetime";
  if (value.includes("monthly") || value.includes("month")) return "monthly";
  return "monthly";
}

function toPremiumAccessFromRecord(record: StoredWhopEntitlement, now = Date.now()): PremiumAccess {
  if (!record.active) return deniedAccess();
  const status = String(record.status ?? "active").toLowerCase();
  if (!["active", "trialing", "completed", "past_due"].includes(status)) {
    return deniedAccess();
  }
  const periodEndMs = record.period_end ? Date.parse(record.period_end) : Infinity;
  if (record.period_end && (!Number.isFinite(periodEndMs) || periodEndMs <= now)) {
    return deniedAccess();
  }
  const trialActive = Boolean(record.trial_active || status === "trialing");
  return {
    isPremium: true,
    tier: record.tier || "monthly",
    status: trialActive ? "trialing" : "active",
    trialActive,
    periodEnd: record.period_end ?? null,
    trialEnd: record.trial_end ?? (trialActive ? (record.period_end ?? null) : null),
    store: "whop",
    autoRenew: record.auto_renew ?? true,
    isManual: false,
    verifiedUntil: Number.isFinite(periodEndMs)
      ? Math.min(now + LEASE_MS, periodEndMs)
      : now + LEASE_MS,
  };
}

async function resolveWhopUserIdForMealMateUser(
  userId: string,
  claims?: { whopUserId?: unknown },
): Promise<string | null> {
  if (typeof claims?.whopUserId === "string" && claims.whopUserId.startsWith("user_")) {
    return claims.whopUserId;
  }
  if (userId.startsWith("whop_")) {
    const candidate = userId.slice(5);
    if (candidate) return candidate;
  }
  try {
    const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
    const db = getFirebaseAdminFirestore();
    const userDoc = await db.collection("users").doc(userId).get();
    const whopId = userDoc.data()?.["whop_user_id"];
    if (typeof whopId === "string" && whopId.trim()) return whopId.trim();
  } catch {
    // Firestore unavailable or unconfigured.
  }
  return null;
}

export async function verifyWhopAccess(
  userId: string,
  claims?: { email?: string | null; whopUserId?: unknown },
): Promise<PremiumAccess> {
  const now = Date.now();
  let storedRecord: StoredWhopEntitlement | null = null;

  try {
    const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
    const snap = await getFirebaseAdminFirestore()
      .collection("whop_entitlements")
      .doc(userId)
      .get();
    if (snap.exists) {
      storedRecord = (snap.data() ?? null) as StoredWhopEntitlement | null;
      if (storedRecord) {
        const access = toPremiumAccessFromRecord(storedRecord, now);
        if (access.isPremium) return access;
      }
    }
  } catch {
    // Firestore may not be initialized in unit tests; fall through to Whop API if configured.
  }

  const accountId = (process.env["WHOP_ACCOUNT_ID"] ?? "").trim();
  if (!isWhopApiConfigured() || !accountId) {
    return deniedAccess();
  }

  const whopUserId = await resolveWhopUserIdForMealMateUser(userId, claims);
  const whop = getWhopClient();

  try {
    const page = await whop.memberships.list({
      account_id: accountId,
      ...(whopUserId ? { user_id: whopUserId } : {}),
      statuses: ["active", "trialing", "completed"],
      first: whopUserId ? 10 : 50,
    });

    const match = page.data.find((m) => {
      if (m.canceled_at && m.status === "canceled") return false;
      const metaUserId = typeof m.metadata?.["user_id"] === "string" ? m.metadata["user_id"] : null;
      if (metaUserId === userId) return true;
      if (whopUserId && m.user_id === whopUserId) return true;
      return false;
    });

    if (!match) {
      return deniedAccess();
    }

    const trialActive = match.status === "trialing";
    const endIso = match.current_period_end ?? match.expires_at ?? null;
    if (endIso && Date.parse(endIso) <= now) {
      return deniedAccess();
    }

    const tier = mapTierFromPlan(
      String(match.metadata?.["plan_kind"] ?? match.variant_id ?? "monthly"),
    );
    const entitlementPayload: StoredWhopEntitlement = {
      user_id: userId,
      whop_user_id: match.user_id ?? whopUserId ?? null,
      membership_id: match.id,
      variant_id: match.variant_id,
      tier,
      status: match.status,
      active: true,
      trial_active: trialActive,
      auto_renew: !match.cancel_at_period_end,
      period_start: match.current_period_start ?? match.created_at,
      period_end: endIso,
      trial_end: trialActive ? endIso : null,
      updated_at: new Date(now).toISOString(),
    };

    try {
      const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
      const db = getFirebaseAdminFirestore();
      await db.collection("whop_entitlements").doc(userId).set(entitlementPayload, { merge: true });
      await db
        .collection("premium_access")
        .doc(userId)
        .set({
          valid_until: Timestamp.fromMillis(
            endIso ? Math.min(now + LEASE_MS, Date.parse(endIso)) : now + LEASE_MS,
          ),
          source: "whop",
          entitlement: "premium",
        });
    } catch {
      // Cache persistence is best-effort.
    }

    return toPremiumAccessFromRecord(entitlementPayload, now);
  } catch {
    return deniedAccess();
  }
}

type WhopWebhookPayload = {
  id?: string;
  type?: string;
  action?: string;
  data?: Record<string, unknown>;
};

const ACTIVATE_EVENTS = new Set([
  "payment.succeeded",
  "payment.paid",
  "invoice.paid",
  "membership.created",
  "membership.activated",
  "membership.went_valid",
  "membership.renewed",
]);

const DEACTIVATE_EVENTS = new Set([
  "membership.canceled",
  "membership.cancelled",
  "membership.deactivated",
  "membership.went_invalid",
  "membership.expired",
  "payment.refunded",
  "refund.created",
]);

function readNestedString(obj: unknown, ...keys: string[]): string | null {
  let current: unknown = obj;
  for (const key of keys) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" && current.trim() ? current.trim() : null;
}

async function resolveWebhookUserId(data: Record<string, unknown>): Promise<string | null> {
  const fromMetadata =
    readNestedString(data, "metadata", "user_id") ??
    readNestedString(data, "membership", "metadata", "user_id") ??
    readNestedString(data, "checkout_configuration", "metadata", "user_id");
  if (fromMetadata) return fromMetadata;

  const whopUserId =
    readNestedString(data, "user_id") ??
    readNestedString(data, "user", "id") ??
    readNestedString(data, "membership", "user_id");

  const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();

  if (whopUserId) {
    const mapDoc = await db.collection("whop_users").doc(whopUserId).get();
    const mapped = mapDoc.data()?.["userId"];
    if (typeof mapped === "string" && mapped.trim()) return mapped.trim();
  }

  const membershipId =
    readNestedString(data, "membership_id") ??
    readNestedString(data, "membership", "id") ??
    (readNestedString(data, "id")?.startsWith("mem_") ? readNestedString(data, "id") : null);
  if (membershipId) {
    const existing = await db
      .collection("whop_entitlements")
      .where("membership_id", "==", membershipId)
      .limit(1)
      .get();
    if (!existing.empty) return existing.docs[0]!.id;
  }

  const email = readNestedString(data, "customer_email") ?? readNestedString(data, "user", "email");
  if (email) {
    const usersSnap = await db
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();
    if (!usersSnap.empty) return usersSnap.docs[0]!.id;
  }

  return whopUserId ? `whop_${whopUserId}` : null;
}

export async function processWhopWebhookEvent(
  event: WhopWebhookPayload,
  webhookDeliveryId?: string | null,
): Promise<{ status: number; body: string }> {
  const eventType = String(event.type ?? event.action ?? "").trim();
  const data = (event.data ?? {}) as Record<string, unknown>;
  const eventId =
    (typeof event.id === "string" && event.id.trim()) ||
    webhookDeliveryId?.trim() ||
    `${eventType}:${readNestedString(data, "id") ?? Date.now()}`;

  if (!eventType) {
    return { status: 400, body: "Missing webhook event type" };
  }

  const userId = await resolveWebhookUserId(data);
  if (!userId) {
    return { status: 202, body: "Ignored event without user reference" };
  }

  const { firebaseAdmin, getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
  const db = getFirebaseAdminFirestore();
  const dedupeKey = `whop_${eventId.replace(/[^A-Za-z0-9_-]/g, "_")}`;

  const { data: previousEvent } = await firebaseAdmin
    .from("subscription_events")
    .select("id,processed")
    .eq("rc_event_id", dedupeKey)
    .maybeSingle();

  if (previousEvent && previousEvent.processed !== false) {
    return { status: 200, body: "Duplicate" };
  }

  await firebaseAdmin.from("subscription_events").insert({
    user_id: userId,
    event_type: eventType,
    source: "whop",
    rc_event_id: dedupeKey,
    payload: JSON.parse(JSON.stringify(event)),
    processed: false,
    claimed_at: new Date().toISOString(),
  });

  const whopUserId =
    readNestedString(data, "user_id") ??
    readNestedString(data, "user", "id") ??
    readNestedString(data, "membership", "user_id");
  const membershipId =
    readNestedString(data, "membership_id") ??
    readNestedString(data, "membership", "id") ??
    (readNestedString(data, "id")?.startsWith("mem_") ? readNestedString(data, "id") : null);
  const paymentId = readNestedString(data, "id")?.startsWith("pay_")
    ? readNestedString(data, "id")
    : null;
  const variantId =
    readNestedString(data, "variant_id") ??
    readNestedString(data, "plan_id") ??
    readNestedString(data, "membership", "variant_id");
  const planKindMeta =
    readNestedString(data, "metadata", "plan_kind") ??
    readNestedString(data, "membership", "metadata", "plan_kind");
  const tier = mapTierFromPlan(planKindMeta ?? variantId);
  const rawStatus = (
    readNestedString(data, "status") ??
    readNestedString(data, "membership", "status") ??
    ""
  ).toLowerCase();

  const shouldActivate =
    ACTIVATE_EVENTS.has(eventType) ||
    (eventType === "membership.updated" && ["active", "trialing", "completed"].includes(rawStatus));

  const shouldDeactivate =
    DEACTIVATE_EVENTS.has(eventType) ||
    (eventType === "membership.updated" &&
      ["canceled", "cancelled", "expired", "past_due", "unresolved"].includes(rawStatus));

  const now = Date.now();
  const periodStart =
    readNestedString(data, "current_period_start") ??
    readNestedString(data, "paid_at") ??
    readNestedString(data, "created_at") ??
    new Date(now).toISOString();
  const explicitEnd =
    readNestedString(data, "current_period_end") ??
    readNestedString(data, "expires_at") ??
    readNestedString(data, "membership", "current_period_end");
  const defaultPeriodDays = tier === "annual" ? 365 : 30;
  const periodEnd =
    explicitEnd ??
    new Date(now + (rawStatus === "trialing" ? 3 : defaultPeriodDays) * DAY_MS).toISOString();

  const { data: existingSub } = await firebaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (shouldActivate && !shouldDeactivate) {
    const trialActive = rawStatus === "trialing";
    const status: "trialing" | "active" = trialActive ? "trialing" : "active";
    const cancelAtEnd = Boolean(data["cancel_at_period_end"]);

    const entitlement: StoredWhopEntitlement = {
      user_id: userId,
      whop_user_id: whopUserId,
      membership_id: membershipId,
      payment_id: paymentId,
      variant_id: variantId,
      tier,
      status,
      active: true,
      trial_active: trialActive,
      auto_renew: !cancelAtEnd,
      period_start: periodStart,
      period_end: periodEnd,
      trial_end: trialActive ? periodEnd : null,
      updated_at: new Date(now).toISOString(),
    };
    await db.collection("whop_entitlements").doc(userId).set(entitlement, { merge: true });
    await db
      .collection("premium_access")
      .doc(userId)
      .set({
        valid_until: Timestamp.fromMillis(
          Math.min(now + LEASE_MS, Date.parse(periodEnd) || now + LEASE_MS),
        ),
        source: "whop",
        entitlement: "premium",
      });

    const subPatch = {
      user_id: userId,
      whop_user_id: whopUserId,
      whop_membership_id: membershipId,
      product_id: variantId,
      tier,
      status,
      store: "whop",
      period_start: periodStart,
      period_end: periodEnd,
      trial_end: trialActive ? periodEnd : (existingSub?.trial_end ?? null),
      auto_renew: !cancelAtEnd,
      is_manual: false,
    };
    if (existingSub) {
      await firebaseAdmin.from("subscriptions").update(subPatch).eq("id", existingSub.id);
    } else {
      await firebaseAdmin.from("subscriptions").insert(subPatch);
    }

    if (eventType === "payment.succeeded" || eventType === "payment.paid") {
      const amount = Number(
        (data["usd_total"] as { amount?: number | string } | undefined)?.amount ??
          (data["total"] as { amount?: number | string } | undefined)?.amount ??
          0,
      );
      const currency = String(data["currency"] ?? "USD").toUpperCase();
      await firebaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          subscription_id: existingSub?.id ?? null,
          rc_event_id: dedupeKey,
          amount_usd: Number.isFinite(amount) ? amount : null,
          currency,
          kind: "initial",
          occurred_at: periodStart,
          raw: JSON.parse(JSON.stringify(event)),
        })
        .then(
          () => undefined,
          () => undefined,
        );
    }
  } else if (shouldDeactivate) {
    const deactivatedStatus =
      eventType.includes("expire") || rawStatus === "expired" ? "expired" : "cancelled";

    await db
      .collection("whop_entitlements")
      .doc(userId)
      .set(
        {
          user_id: userId,
          whop_user_id: whopUserId,
          membership_id: membershipId,
          status: deactivatedStatus,
          active: false,
          trial_active: false,
          auto_renew: false,
          updated_at: new Date(now).toISOString(),
        },
        { merge: true },
      );
    await db
      .collection("premium_access")
      .doc(userId)
      .set({
        valid_until: Timestamp.fromMillis(0),
        source: "whop",
        entitlement: "premium",
      });

    if (existingSub) {
      await firebaseAdmin
        .from("subscriptions")
        .update({
          status: deactivatedStatus,
          auto_renew: false,
          cancelled_at: new Date(now).toISOString(),
        })
        .eq("id", existingSub.id);
    }
  }

  await firebaseAdmin
    .from("subscription_events")
    .update({ processed: true, completed_at: new Date().toISOString() })
    .eq("rc_event_id", dedupeKey);

  try {
    const { invalidateVerifiedAccessCache } = await import("@/server/revenuecat");
    invalidateVerifiedAccessCache(userId);
  } catch {
    // Cache invalidation is best-effort.
  }

  return { status: 200, body: "ok" };
}
