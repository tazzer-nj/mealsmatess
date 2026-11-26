import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/server/firebase-admin";
import {
  ENTITLEMENT,
  invalidateAccountAccessCache,
  syncPromotionalEntitlementToRevenueCat,
} from "@/server/revenuecat";

export type PromoRewardKind =
  "percent_discount" | "free_days" | "free_month" | "free_year" | "lifetime";

export type PromoCodeRecord = {
  id: string;
  code: string;
  reward_kind: PromoRewardKind;
  reward_value: number;
  max_redemptions: number | null;
  redemption_count: number;
  expires_at: string | null;
  enabled: boolean;
  notes?: string | null;
};

export class PromoValidationError extends Error {
  readonly status = 400;
  constructor(message: string) {
    super(message);
    this.name = "PromoValidationError";
  }
}

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function normalizePercentOff(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(99, Math.max(1, Math.round(num)));
}

export function applyPercentDiscountToAmount(baseAmount: number, percentOff: number): number {
  const pct = normalizePercentOff(percentOff);
  if (pct <= 0) return baseAmount;
  return Math.max(0.5, Number((baseAmount * (1 - pct / 100)).toFixed(2)));
}

function parseTimestampMs(value: unknown): number | null {
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  if (value && typeof value === "object" && "toMillis" in value) {
    const fn = (value as { toMillis?: () => number }).toMillis;
    if (typeof fn === "function") return fn.call(value);
  }
  return null;
}

export async function validatePromoCodeForUser(params: {
  userId: string;
  code: string;
}): Promise<PromoCodeRecord> {
  const normalized = normalizePromoCode(params.code);
  if (normalized.length < 2 || normalized.length > 40) {
    throw new PromoValidationError("Enter a valid promo code.");
  }

  const db = getFirebaseAdminFirestore();
  const snap = await db.collection("promo_codes").where("code", "==", normalized).limit(1).get();

  if (snap.empty) {
    throw new PromoValidationError("Invalid or disabled promo code.");
  }

  const docSnap = snap.docs[0];
  const raw = (docSnap.data() ?? {}) as Record<string, unknown>;
  const enabled = raw["enabled"] === true;
  if (!enabled) {
    throw new PromoValidationError("Invalid or disabled promo code.");
  }

  const expiresMs = parseTimestampMs(raw["expires_at"]);
  if (expiresMs !== null && expiresMs < Date.now()) {
    throw new PromoValidationError("This promo code has expired.");
  }

  const redemptionCount = Number(raw["redemption_count"] ?? 0) || 0;
  const maxRedemptions =
    typeof raw["max_redemptions"] === "number" && raw["max_redemptions"] > 0
      ? raw["max_redemptions"]
      : null;
  if (maxRedemptions !== null && redemptionCount >= maxRedemptions) {
    throw new PromoValidationError("This promo code has been fully redeemed.");
  }

  // Prevent duplicate redemption by the same user
  const deterministicId = `${docSnap.id}_${params.userId}`;
  const deterministicSnap = await db.collection("promo_redemptions").doc(deterministicId).get();
  if (deterministicSnap.exists) {
    throw new PromoValidationError("You've already redeemed this code.");
  }

  const existingRedemptions = await db
    .collection("promo_redemptions")
    .where("code_id", "==", docSnap.id)
    .limit(200)
    .get()
    .catch(() => null);
  if (
    existingRedemptions &&
    existingRedemptions.docs.some((d) => d.data()?.["user_id"] === params.userId)
  ) {
    throw new PromoValidationError("You've already redeemed this code.");
  }

  const rewardKind = String(raw["reward_kind"] ?? "free_days") as PromoRewardKind;

  return {
    id: docSnap.id,
    code: normalized,
    reward_kind: rewardKind,
    reward_value: Number(raw["reward_value"] ?? 0) || 0,
    max_redemptions: maxRedemptions,
    redemption_count: redemptionCount,
    expires_at: typeof raw["expires_at"] === "string" ? raw["expires_at"] : null,
    enabled,
    notes: typeof raw["notes"] === "string" ? raw["notes"] : null,
  };
}

export async function recordPromoRedemptionIfNeeded(params: {
  promoId: string;
  userId: string;
  code: string;
  rewardKind: PromoRewardKind;
  grantedDays?: number;
  grantedLifetime?: boolean;
  percentOff?: number;
}): Promise<boolean> {
  const db = getFirebaseAdminFirestore();
  const redemptionId = `${params.promoId}_${params.userId}`;
  const redemptionRef = db.collection("promo_redemptions").doc(redemptionId);
  const existing = await redemptionRef.get().catch(() => null);
  if (existing?.exists) return false;

  const promoRef = db.collection("promo_codes").doc(params.promoId);
  const promoSnap = await promoRef.get().catch(() => null);
  const currentCount = Number(promoSnap?.data()?.["redemption_count"] ?? 0) || 0;
  const nowIso = new Date().toISOString();

  await redemptionRef.set(
    {
      id: redemptionId,
      code_id: params.promoId,
      code: params.code,
      user_id: params.userId,
      reward_kind: params.rewardKind,
      granted_days: params.grantedDays ?? 0,
      granted_lifetime: Boolean(params.grantedLifetime),
      percent_off: params.percentOff ?? 0,
      created_at: nowIso,
    },
    { merge: true },
  );

  if (promoSnap?.exists) {
    await promoRef
      .set({ redemption_count: currentCount + 1, updated_at: nowIso }, { merge: true })
      .catch(() => undefined);
  }

  try {
    const { firebaseAdmin } = await import("@/server/firebase-admin");
    await firebaseAdmin.from("subscription_events").insert({
      user_id: params.userId,
      event_type: `promo:${params.rewardKind}`,
      source: "promo",
      actor_id: params.userId,
      payload: {
        code: params.code,
        granted_days: params.grantedDays ?? 0,
        granted_lifetime: Boolean(params.grantedLifetime),
        percent_off: params.percentOff ?? 0,
      },
    });
  } catch {
    // Audit logging is best-effort
  }

  return true;
}

export type RedeemPromoResult = {
  ok: true;
  kind: PromoRewardKind;
  code: string;
  grantedDays: number;
  grantedLifetime: boolean;
  percentOff?: number;
  periodEnd: string | null;
  message: string;
};

export async function redeemPromoCodeForUser(params: {
  userId: string;
  code: string;
}): Promise<RedeemPromoResult> {
  const promo = await validatePromoCodeForUser(params);

  if (promo.reward_kind === "percent_discount") {
    const percentOff = normalizePercentOff(promo.reward_value);
    if (percentOff <= 0) {
      throw new PromoValidationError("This discount promo code is not configured yet.");
    }
    return {
      ok: true,
      kind: "percent_discount",
      code: promo.code,
      grantedDays: 0,
      grantedLifetime: false,
      percentOff,
      periodEnd: null,
      message: `${percentOff}% discount applied (${promo.code}). Choose a plan below to check out.`,
    };
  }

  let grantedDays = 0;
  let grantedLifetime = false;
  let tier: "monthly" | "annual" | "lifetime" | "promo" = "promo";

  switch (promo.reward_kind) {
    case "free_days":
      grantedDays = Math.max(1, Math.round(Number(promo.reward_value) || 0));
      break;
    case "free_month":
      grantedDays = 30;
      tier = "monthly";
      break;
    case "free_year":
      grantedDays = 365;
      tier = "annual";
      break;
    case "lifetime":
      grantedLifetime = true;
      tier = "lifetime";
      break;
  }

  const db = getFirebaseAdminFirestore();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // Stack onto any existing active promo end date
  const existingPromoSnap = await db.collection("promo_access").doc(params.userId).get();
  const existingPromoEnd = existingPromoSnap.data()?.["period_end"];
  const existingPromoEndMs =
    typeof existingPromoEnd === "string" ? Date.parse(existingPromoEnd) : NaN;
  const baseline =
    Number.isFinite(existingPromoEndMs) && existingPromoEndMs > now ? existingPromoEndMs : now;

  const newEnd = grantedLifetime
    ? null
    : new Date(baseline + grantedDays * 86_400_000).toISOString();
  const validUntilMs = grantedLifetime ? now + 365 * 86_400_000 : Date.parse(newEnd ?? nowIso);

  await db
    .collection("promo_access")
    .doc(params.userId)
    .set(
      {
        user_id: params.userId,
        active: true,
        code_id: promo.id,
        code: promo.code,
        tier: grantedLifetime ? "lifetime" : tier,
        lifetime: grantedLifetime,
        period_end: newEnd,
        granted_at: nowIso,
        updated_at: nowIso,
      },
      { merge: true },
    );

  await db
    .collection("premium_access")
    .doc(params.userId)
    .set(
      {
        valid_until: Timestamp.fromMillis(validUntilMs),
        source: "promo",
        entitlement: ENTITLEMENT,
        is_premium: true,
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
        is_premium: true,
        premium: true,
        subscription_status: "active",
        subscription_tier: grantedLifetime ? "lifetime" : tier,
        updatedAt: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await db
    .collection("subscriptions")
    .doc(`promo_${params.userId}`)
    .set(
      {
        id: `promo_${params.userId}`,
        user_id: params.userId,
        tier: grantedLifetime ? "lifetime" : tier,
        status: "active",
        store: "promo",
        period_start: nowIso,
        period_end: newEnd,
        auto_renew: false,
        is_manual: false,
        promo_code: promo.code,
        updated_at: nowIso,
      },
      { merge: true },
    )
    .catch(() => undefined);

  await recordPromoRedemptionIfNeeded({
    promoId: promo.id,
    userId: params.userId,
    code: promo.code,
    rewardKind: promo.reward_kind,
    grantedDays,
    grantedLifetime,
  });

  invalidateAccountAccessCache(params.userId);
  await syncPromotionalEntitlementToRevenueCat({
    userId: params.userId,
    periodEnd: newEnd,
    lifetime: grantedLifetime,
  }).catch(() => undefined);

  return {
    ok: true,
    kind: promo.reward_kind,
    code: promo.code,
    grantedDays,
    grantedLifetime,
    periodEnd: newEnd,
    message: grantedLifetime
      ? "Lifetime Premium unlocked!"
      : `${grantedDays} days of MealMate Premium added to your account!`,
  };
}
