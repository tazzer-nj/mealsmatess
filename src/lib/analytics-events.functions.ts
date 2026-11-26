import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
import {
  ANALYTICS_EVENT_NAMES,
  MEANINGFUL_ACTIVITY_TYPES,
  type AnalyticsEventName,
  type MeaningfulActivityType,
} from "@/lib/analytics-events";
import { normalizePreferences } from "@/lib/preferences";
import { buildPersonalisationProfile } from "@/lib/personalisation";

const TrackEventSchema = z.object({
  eventId: z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/),
  eventName: z.enum(ANALYTICS_EVENT_NAMES),
  pageNumber: z.number().int().min(1).max(8).nullable().optional(),
  platform: z.string().max(24).nullable().optional(),
  country: z.string().max(12).nullable().optional(),
  channel: z.string().max(80).nullable().optional(),
  entityId: z.string().max(128).nullable().optional(),
  metadata: z.record(z.string().max(60), z.unknown()).optional(),
});

export async function recordServerAnalyticsEvent(input: {
  eventId: string;
  userId: string;
  eventName: AnalyticsEventName;
  pageNumber?: number | null;
  platform?: string | null;
  country?: string | null;
  channel?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { firebaseAdmin } = await loadFirebaseAdmin();
    const nowIso = new Date().toISOString();
    const safeMetadata = JSON.parse(JSON.stringify(input.metadata ?? {}));

    await firebaseAdmin.from("analytics_events").upsert(
      {
        id: input.eventId,
        event_id: input.eventId,
        user_id: input.userId,
        event_name: input.eventName,
        ...(input.pageNumber ? { page_number: input.pageNumber } : {}),
        platform: input.platform ?? null,
        country: input.country ?? null,
        channel: input.channel ?? null,
        metadata: safeMetadata,
        created_at: nowIso,
      },
      { onConflict: "id" },
    );

    if (MEANINGFUL_ACTIVITY_TYPES.includes(input.eventName as MeaningfulActivityType)) {
      await firebaseAdmin.from("user_activity").upsert(
        {
          id: input.eventId,
          activity_id: input.eventId,
          user_id: input.userId,
          activity_type: input.eventName,
          entity_id: input.entityId ?? null,
          platform: input.platform ?? null,
          created_at: nowIso,
        },
        { onConflict: "id" },
      );
    }
  } catch (err) {
    console.warn("[analytics] Failed to record server event", input.eventName, err);
  }
}

export const trackAnalyticsEvent = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => TrackEventSchema.parse(v))
  .handler(async ({ data, context }) => {
    await recordServerAnalyticsEvent({
      eventId: data.eventId,
      userId: context.userId,
      eventName: data.eventName,
      pageNumber: data.pageNumber ?? null,
      platform: data.platform ?? null,
      country: data.country ?? null,
      channel: data.channel ?? null,
      entityId: data.entityId ?? null,
      metadata: data.metadata,
    });
    return { ok: true as const };
  });

const SaveStructuredOnboardingSchema = z.object({
  preferences: z.record(z.string(), z.unknown()),
  currentPage: z.number().int().min(1).max(8),
  maxPageReached: z.number().int().min(1).max(8),
  completedPages: z.array(z.number().int().min(1).max(8)).max(8),
  status: z.enum(["in_progress", "completed", "abandoned"]),
  startedAt: z.string().max(40),
  completedAt: z.string().max(40).nullable().optional(),
  abandonedAt: z.string().max(40).nullable().optional(),
  abandonedPage: z.number().int().min(1).max(8).nullable().optional(),
  completionDurationSeconds: z.number().min(0).max(864000).nullable().optional(),
  platform: z.string().max(24).nullable().optional(),
  country: z.string().max(12).nullable().optional(),
});

export const saveStructuredOnboardingState = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => SaveStructuredOnboardingSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { firebaseAdmin } = await loadFirebaseAdmin();
    const nowIso = new Date().toISOString();
    const p = normalizePreferences(data.preferences);
    const personalisationProfile =
      data.status === "completed"
        ? buildPersonalisationProfile(p)
        : (p.personalisation_profile ?? null);

    await Promise.all([
      firebaseAdmin.from("onboarding_progress").upsert(
        {
          id: context.userId,
          user_id: context.userId,
          current_page: data.currentPage,
          max_page_reached: data.maxPageReached,
          completed_pages: data.completedPages,
          status: data.status,
          started_at: data.startedAt,
          last_active_at: nowIso,
          completed_at: data.completedAt ?? null,
          abandoned_at: data.abandonedAt ?? null,
          abandoned_page: data.abandonedPage ?? null,
          completion_duration_seconds: data.completionDurationSeconds ?? null,
          platform: data.platform ?? null,
          country: data.country ?? null,
          updated_at: nowIso,
        },
        { onConflict: "id" },
      ),
      firebaseAdmin.from("onboarding_answers").upsert(
        {
          id: context.userId,
          user_id: context.userId,
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
        { onConflict: "id" },
      ),
      firebaseAdmin.from("user_onboarding_profiles").upsert(
        {
          id: context.userId,
          user_id: context.userId,
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
          onboarding_completed: data.status === "completed",
          onboarding_completed_at: data.completedAt ?? null,
          personalisation_profile: personalisationProfile,
          platform: data.platform ?? null,
          country: data.country ?? null,
          updated_at: nowIso,
        },
        { onConflict: "id" },
      ),
    ]);

    // Preserve immutable first-touch attribution in user_acquisition_sources.
    if (
      p.acquisition &&
      (p.acquisition.self_reported_source || p.acquisition.utm_source || p.acquisition.referrer)
    ) {
      const { data: existingAcq } = await firebaseAdmin
        .from("user_acquisition_sources")
        .select(
          "self_reported_source, other_detail, utm_source, utm_medium, utm_campaign, referrer, captured_at",
        )
        .eq("id", context.userId)
        .maybeSingle();

      const lockedSource =
        (existingAcq?.["self_reported_source"] as string | null) ||
        p.acquisition.self_reported_source ||
        null;
      const lockedOther =
        (existingAcq?.["other_detail"] as string | null) || p.acquisition.other_detail || null;

      await firebaseAdmin.from("user_acquisition_sources").upsert(
        {
          id: context.userId,
          user_id: context.userId,
          self_reported_source: lockedSource,
          other_detail: lockedOther,
          utm_source:
            (existingAcq?.["utm_source"] as string | null) ?? p.acquisition.utm_source ?? null,
          utm_medium:
            (existingAcq?.["utm_medium"] as string | null) ?? p.acquisition.utm_medium ?? null,
          utm_campaign:
            (existingAcq?.["utm_campaign"] as string | null) ?? p.acquisition.utm_campaign ?? null,
          referrer: (existingAcq?.["referrer"] as string | null) ?? p.acquisition.referrer ?? null,
          platform: data.platform ?? null,
          country: data.country ?? null,
          captured_at:
            (existingAcq?.["captured_at"] as string | null) ?? p.acquisition.captured_at ?? nowIso,
          updated_at: nowIso,
        },
        { onConflict: "id" },
      );
    }

    return { ok: true as const, personalisationProfile };
  });
