import { Capacitor } from "@capacitor/core";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AcquisitionAttribution, FoodPreferences } from "@/lib/preferences";
import { buildPersonalisationProfile } from "@/lib/personalisation";

export const ANALYTICS_EVENT_NAMES = [
  "signup_completed",
  "onboarding_started",
  "onboarding_page_viewed",
  "onboarding_page_completed",
  "onboarding_abandoned",
  "onboarding_completed",
  "personalisation_completed",
  "paywall_viewed",
  "trial_started",
  "subscription_started",
  "subscription_converted",
  "subscription_cancelled",
  "first_recipe_viewed",
  "recipe_viewed",
  "recipe_saved",
  "meal_plan_created",
  "meal_completed",
  "pantry_item_added",
  "collection_created",
  "weekly_goal_completed",
  "share_card_created",
  "mia_interaction",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const MEANINGFUL_ACTIVITY_TYPES = [
  "first_recipe_viewed",
  "recipe_viewed",
  "recipe_saved",
  "meal_plan_created",
  "meal_completed",
  "pantry_item_added",
  "collection_created",
  "weekly_goal_completed",
  "share_card_created",
  "mia_interaction",
  "nutrition_coach_used",
  "scanner_used",
] as const;

export type MeaningfulActivityType = (typeof MEANINGFUL_ACTIVITY_TYPES)[number];

export const ANALYTICS_CONSENT_STORAGE_KEY = "mealmate_analytics_consent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setAnalyticsConsentLocal(allowed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, allowed ? "true" : "false");
  } catch {
    // Storage may be restricted in WebViews
  }
}

const UTM_STORAGE_KEY = "mealmate.attribution.utm.v1";

export type CapturedUtmContext = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  captured_at: string;
};

export function detectClientPlatform(): "android" | "ios" | "web" {
  try {
    const p = Capacitor.getPlatform();
    if (p === "android" || p === "ios") return p;
  } catch {
    // Fallback below
  }
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android")) return "android";
    if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  }
  return "web";
}

export function detectClientCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Africa/Johannesburg") return "ZA";
    const lang = typeof navigator !== "undefined" ? navigator.language : "";
    const parts = lang.split(/[-_]/);
    if (parts.length >= 2 && parts[1] && parts[1].length === 2) {
      return parts[1].toUpperCase();
    }
  } catch {
    // Ignore environment lookup errors
  }
  return "ZA";
}

export function captureInitialAttribution(): CapturedUtmContext | null {
  if (typeof window === "undefined") return null;
  try {
    const existingRaw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (existingRaw) {
      return JSON.parse(existingRaw) as CapturedUtmContext;
    }
  } catch {
    // Ignore storage read errors
  }

  let utm_source: string | null = null;
  let utm_medium: string | null = null;
  let utm_campaign: string | null = null;
  let referrer: string | null = null;
  try {
    const params = new URLSearchParams(window.location.search);
    utm_source = params.get("utm_source")?.trim().slice(0, 120) || null;
    utm_medium = params.get("utm_medium")?.trim().slice(0, 120) || null;
    utm_campaign = params.get("utm_campaign")?.trim().slice(0, 120) || null;
    if (typeof document !== "undefined" && document.referrer) {
      referrer = document.referrer.trim().slice(0, 512) || null;
    }
  } catch {
    // Ignore URL errors
  }

  const captured: CapturedUtmContext = {
    utm_source,
    utm_medium,
    utm_campaign,
    referrer,
    captured_at: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // Ignore storage write errors
  }
  return captured;
}

export function sanitizeEventId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
  return cleaned || `evt_${Date.now()}`;
}

export function makeIdempotentEventId(
  eventName: AnalyticsEventName,
  userId: string,
  dedupeKey?: string,
): string {
  if (dedupeKey) {
    return sanitizeEventId(`${eventName}_${userId}_${dedupeKey}`);
  }
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return sanitizeEventId(`${eventName}_${userId}_${suffix}`);
}

export async function dispatchAnalyticsEvent(input: {
  userId?: string | null;
  eventName: AnalyticsEventName;
  pageNumber?: number | null;
  channel?: string | null;
  dedupeKey?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (import.meta.env?.MODE === "test") return;
  if (!hasAnalyticsConsent()) return;

  const uid = input.userId ?? auth?.currentUser?.uid;
  if (!uid || auth?.currentUser?.uid !== uid) return;

  const eventId = makeIdempotentEventId(input.eventName, uid, input.dedupeKey);
  const platform = detectClientPlatform();
  const country = detectClientCountry();
  const initialUtm = captureInitialAttribution();
  const channel = input.channel ?? initialUtm?.utm_source ?? null;

  try {
    const { trackAnalyticsEvent } = await import("@/lib/analytics-events.functions");
    await trackAnalyticsEvent({
      data: {
        eventId,
        eventName: input.eventName,
        pageNumber: input.pageNumber ?? null,
        platform,
        country,
        channel,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? {},
      },
    });
    return;
  } catch {
    // Fallback to authenticated owner-scoped Firestore document writes
  }

  try {
    const nowIso = new Date().toISOString();
    await setDoc(
      doc(db, "analytics_events", eventId),
      {
        id: eventId,
        event_id: eventId,
        user_id: uid,
        event_name: input.eventName,
        ...(input.pageNumber ? { page_number: input.pageNumber } : {}),
        platform,
        country,
        ...(channel ? { channel: channel.slice(0, 80) } : {}),
        metadata: input.metadata ?? {},
        created_at: nowIso,
      },
      { merge: true },
    );

    if (MEANINGFUL_ACTIVITY_TYPES.includes(input.eventName as MeaningfulActivityType)) {
      await setDoc(
        doc(db, "user_activity", eventId),
        {
          id: eventId,
          activity_id: eventId,
          user_id: uid,
          activity_type: input.eventName,
          ...(input.entityId ? { entity_id: input.entityId.slice(0, 128) } : {}),
          platform,
          created_at: nowIso,
        },
        { merge: true },
      );
    }
  } catch {
    // Non-blocking analytics fallback
  }
}

export async function saveStructuredOnboardingClientFallback(input: {
  userId: string;
  preferences: FoodPreferences;
  currentPage: number;
  maxPageReached: number;
  completedPages: number[];
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt?: string | null;
  abandonedAt?: string | null;
  abandonedPage?: number | null;
  completionDurationSeconds?: number | null;
  acquisition?: AcquisitionAttribution | null;
}): Promise<boolean> {
  if (!input.userId || auth?.currentUser?.uid !== input.userId) return false;

  const platform = detectClientPlatform();
  const country = detectClientCountry();
  const nowIso = new Date().toISOString();
  const p = input.preferences;
  const personalisationProfile =
    input.status === "completed"
      ? buildPersonalisationProfile(p)
      : (p.personalisation_profile ?? null);

  try {
    await setDoc(
      doc(db, "onboarding_progress", input.userId),
      {
        id: input.userId,
        user_id: input.userId,
        current_page: Math.min(8, Math.max(1, input.currentPage)),
        max_page_reached: Math.min(8, Math.max(1, input.maxPageReached)),
        completed_pages: input.completedPages.slice(0, 8),
        status: input.status,
        started_at: input.startedAt,
        last_active_at: nowIso,
        completed_at: input.completedAt ?? null,
        abandoned_at: input.abandonedAt ?? null,
        abandoned_page: input.abandonedPage ?? null,
        completion_duration_seconds: input.completionDurationSeconds ?? null,
        platform,
        country,
        updated_at: nowIso,
      },
      { merge: true },
    );

    await setDoc(
      doc(db, "onboarding_answers", input.userId),
      {
        id: input.userId,
        user_id: input.userId,
        page_1_goals: {
          goals: p.goals ?? [],
          preferred_name: p.preferred_name ?? null,
          household_size: p.household_size ?? null,
        },
        page_2_challenges: { challenges: p.challenges ?? [] },
        page_3_health_goals: {
          health_goals: p.health_goals ?? [],
          age_bracket: p.age_bracket ?? null,
          balanced_nutrition_safeguard: Boolean(p.balanced_nutrition_safeguard),
        },
        page_4_habits: {
          eating_habits: p.eating_habits ?? null,
          cooking_frequency: p.cooking_frequency ?? null,
          primary_challenge: p.primary_challenge ?? null,
        },
        page_5_preferences: {
          meal_enjoyments: p.meal_enjoyments ?? [],
          allergies: p.allergies ?? [],
          dietary_restrictions: p.dietary_restrictions ?? [],
          disliked_foods: p.disliked_foods ?? [],
          preferred_cuisines: p.preferred_cuisines ?? [],
        },
        page_6_lifestyle: {
          cooking_time: p.cooking_time ?? null,
          cooking_level: p.cooking_level ?? null,
          budget_range_zar: p.budget_range_zar ?? null,
        },
        page_7_discovery: {
          self_reported_source: p.acquisition?.self_reported_source ?? null,
          other_detail: p.acquisition?.other_detail ?? null,
        },
        updated_at: nowIso,
      },
      { merge: true },
    );

    await setDoc(
      doc(db, "user_onboarding_profiles", input.userId),
      {
        id: input.userId,
        user_id: input.userId,
        preferred_name: p.preferred_name ?? null,
        household_size: p.household_size ?? null,
        goals: p.goals ?? [],
        primary_goal: p.goal ?? p.goals?.[0] ?? null,
        challenges: p.challenges ?? [],
        health_goals: p.health_goals ?? [],
        age_bracket: p.age_bracket ?? null,
        balanced_nutrition_safeguard: Boolean(p.balanced_nutrition_safeguard),
        eating_habits: p.eating_habits ?? null,
        cooking_frequency: p.cooking_frequency ?? null,
        primary_challenge: p.primary_challenge ?? null,
        meal_enjoyments: p.meal_enjoyments ?? [],
        allergies: p.allergies ?? [],
        intolerances: p.intolerances ?? [],
        dietary_restrictions: p.dietary_restrictions ?? [],
        disliked_foods: p.disliked_foods ?? [],
        preferred_cuisines: p.preferred_cuisines ?? [],
        cooking_time: p.cooking_time ?? null,
        cooking_level: p.cooking_level ?? null,
        budget_range_zar: p.budget_range_zar ?? null,
        identity_habit: p.identity_habit ?? null,
        weekly_cooking_goal: p.weekly_cooking_goal ?? 4,
        onboarding_completed: input.status === "completed",
        onboarding_completed_at: input.completedAt ?? null,
        personalisation_profile: personalisationProfile,
        platform,
        country,
        updated_at: nowIso,
      },
      { merge: true },
    );

    const acq = input.acquisition ?? p.acquisition;
    if (acq && (acq.self_reported_source || acq.utm_source || acq.referrer)) {
      const acqRef = doc(db, "user_acquisition_sources", input.userId);
      const existingAcqSnap = await getDoc(acqRef);
      const existingData = existingAcqSnap.exists()
        ? (existingAcqSnap.data() as Record<string, unknown>)
        : null;
      const lockedSource =
        typeof existingData?.["self_reported_source"] === "string" &&
        existingData["self_reported_source"]
          ? existingData["self_reported_source"]
          : (acq.self_reported_source ?? null);
      const lockedCapturedAt =
        typeof existingData?.["captured_at"] === "string" && existingData["captured_at"]
          ? existingData["captured_at"]
          : (acq.captured_at ?? nowIso);

      await setDoc(
        acqRef,
        {
          id: input.userId,
          user_id: input.userId,
          self_reported_source: lockedSource,
          other_detail:
            typeof existingData?.["other_detail"] === "string" && existingData["other_detail"]
              ? existingData["other_detail"]
              : (acq.other_detail ?? null),
          utm_source: (existingData?.["utm_source"] as string | null) ?? acq.utm_source ?? null,
          utm_medium: (existingData?.["utm_medium"] as string | null) ?? acq.utm_medium ?? null,
          utm_campaign:
            (existingData?.["utm_campaign"] as string | null) ?? acq.utm_campaign ?? null,
          referrer: (existingData?.["referrer"] as string | null) ?? acq.referrer ?? null,
          platform,
          country,
          captured_at: lockedCapturedAt,
          updated_at: nowIso,
        },
        { merge: true },
      );
    }

    return true;
  } catch {
    return false;
  }
}
