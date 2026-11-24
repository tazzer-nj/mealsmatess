import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
import { auditLog } from "@/lib/security.server";
import {
  aggregateUserInsights,
  type RawAcquisitionDoc,
  type RawAnalyticsEventDoc,
  type RawOnboardingProfileDoc,
  type RawOnboardingProgressDoc,
  type RawPaymentDoc,
  type RawProfileDoc,
  type RawSubscriptionDoc,
  type RawUserActivityDoc,
  type UserInsightsReport,
} from "@/lib/user-insights-aggregator";

async function assertAdmin(
  userId: string,
  claims?: { email?: string | null; admin?: unknown; isAdmin?: unknown; role?: unknown },
) {
  const { isAdminAccount } = await import("@/server/firebase-admin");
  const ok = await isAdminAccount(userId, claims);
  if (!ok) {
    throw new Response("Forbidden", { status: 403 });
  }
}

const InsightsFilterSchema = z.object({
  from: z.string().max(40),
  to: z.string().max(40),
  platform: z.string().max(24).nullable().optional(),
  country: z.string().max(12).nullable().optional(),
  channel: z.string().max(80).nullable().optional(),
  subscriptionStatus: z.string().max(24).nullable().optional(),
  onboardingCompleted: z.enum(["all", "completed", "incomplete"]).optional().default("all"),
});

export const getUserInsights = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => InsightsFilterSchema.parse(v))
  .handler(async ({ data, context }): Promise<UserInsightsReport> => {
    await assertAdmin(context.userId, context.claims);
    const { firebaseAdmin } = await loadFirebaseAdmin();

    const [
      { data: profiles },
      { data: onboardingProfiles },
      { data: onboardingProgress },
      { data: acquisitionSources },
      { data: analyticsEvents },
      { data: userActivity },
      { data: subscriptions },
      { data: payments },
    ] = await Promise.all([
      firebaseAdmin
        .from("profiles")
        .select(
          "id, displayName, onboarding_completed, onboarding_step, goal, platform, country, preferences, createdAt, created_at",
        ),
      firebaseAdmin.from("user_onboarding_profiles").select("*"),
      firebaseAdmin.from("onboarding_progress").select("*"),
      firebaseAdmin.from("user_acquisition_sources").select("*"),
      firebaseAdmin.from("analytics_events").select("*"),
      firebaseAdmin.from("user_activity").select("*"),
      firebaseAdmin
        .from("subscriptions")
        .select("user_id, tier, status, store, period_start, created_at"),
      firebaseAdmin.from("payments").select("user_id, amount_usd, currency, kind, occurred_at"),
    ]);

    void auditLog({
      actor_id: context.userId,
      action: "admin.user_insights_viewed",
      target_table: "user_onboarding_profiles",
      metadata: {
        from: data.from,
        to: data.to,
        platform: data.platform ?? "all",
        country: data.country ?? "all",
        channel: data.channel ?? "all",
      },
    });

    return aggregateUserInsights({
      filters: data,
      profiles: (profiles ?? []) as RawProfileDoc[],
      onboardingProfiles: (onboardingProfiles ?? []) as RawOnboardingProfileDoc[],
      onboardingProgress: (onboardingProgress ?? []) as RawOnboardingProgressDoc[],
      acquisitionSources: (acquisitionSources ?? []) as RawAcquisitionDoc[],
      analyticsEvents: (analyticsEvents ?? []) as RawAnalyticsEventDoc[],
      userActivity: (userActivity ?? []) as RawUserActivityDoc[],
      subscriptions: (subscriptions ?? []) as RawSubscriptionDoc[],
      payments: (payments ?? []) as RawPaymentDoc[],
    });
  });

const InspectUsersSchema = z.object({
  search: z.string().max(80).optional().default(""),
  limit: z.number().int().min(1).max(100).optional().default(25),
});

export type PrivacySafeUserInspectionRow = {
  maskedUserId: string;
  preferredName: string;
  platform: string;
  country: string;
  onboardingStatus: "completed" | "in_progress" | "abandoned" | "not_started";
  currentPage: number | null;
  primaryGoal: string | null;
  challengeCount: number;
  cookingLevel: string | null;
  budgetRangeZar: string | null;
  acquisitionChannel: string;
  subscriptionStatus: string;
  updatedAt: string | null;
};

export const adminInspectInsightUsers = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => InspectUsersSchema.parse(v))
  .handler(async ({ data, context }): Promise<{ rows: PrivacySafeUserInspectionRow[] }> => {
    await assertAdmin(context.userId, context.claims);
    const { firebaseAdmin } = await loadFirebaseAdmin();

    const [
      { data: profiles },
      { data: onboardingProfiles },
      { data: progress },
      { data: acq },
      { data: subs },
    ] = await Promise.all([
      firebaseAdmin
        .from("profiles")
        .select(
          "id, displayName, onboarding_completed, onboarding_step, goal, platform, country, updatedAt",
        ),
      firebaseAdmin
        .from("user_onboarding_profiles")
        .select(
          "user_id, preferred_name, primary_goal, challenges, cooking_level, budget_range_zar, onboarding_completed, platform, country, updated_at",
        ),
      firebaseAdmin.from("onboarding_progress").select("user_id, current_page, status, updated_at"),
      firebaseAdmin
        .from("user_acquisition_sources")
        .select("user_id, self_reported_source, utm_source"),
      firebaseAdmin.from("subscriptions").select("user_id, status"),
    ]);

    const opMap = new Map<string, Record<string, unknown>>();
    for (const r of (onboardingProfiles ?? []) as Record<string, unknown>[]) {
      opMap.set(String(r["user_id"]), r);
    }
    const progMap = new Map<string, Record<string, unknown>>();
    for (const r of (progress ?? []) as Record<string, unknown>[]) {
      progMap.set(String(r["user_id"]), r);
    }
    const acqMap = new Map<string, Record<string, unknown>>();
    for (const r of (acq ?? []) as Record<string, unknown>[]) {
      acqMap.set(String(r["user_id"]), r);
    }
    const subMap = new Map<string, string>();
    for (const r of (subs ?? []) as Record<string, unknown>[]) {
      subMap.set(String(r["user_id"]), String(r["status"] ?? "free"));
    }

    const q = data.search.trim().toLowerCase();
    const rows: PrivacySafeUserInspectionRow[] = [];

    for (const p of (profiles ?? []) as Record<string, unknown>[]) {
      const uid = String(p["id"] ?? "");
      if (!uid) continue;
      const op = opMap.get(uid);
      const prog = progMap.get(uid);
      const acqRow = acqMap.get(uid);

      const preferredName = String(op?.["preferred_name"] ?? p["displayName"] ?? "Member").slice(
        0,
        40,
      );
      const primaryGoal =
        (op?.["primary_goal"] as string | null) ?? (p["goal"] as string | null) ?? null;
      const channel = String(
        acqRow?.["self_reported_source"] ?? acqRow?.["utm_source"] ?? "Direct / Organic",
      );
      const maskedUserId = `${uid.slice(0, 6)}…${uid.slice(-4)}`;

      if (
        q &&
        !preferredName.toLowerCase().includes(q) &&
        !uid.toLowerCase().startsWith(q) &&
        !channel.toLowerCase().includes(q) &&
        !(primaryGoal ?? "").toLowerCase().includes(q)
      ) {
        continue;
      }

      const completed = Boolean(op?.["onboarding_completed"] ?? p["onboarding_completed"]);
      const status: PrivacySafeUserInspectionRow["onboardingStatus"] = completed
        ? "completed"
        : prog?.["status"] === "abandoned"
          ? "abandoned"
          : prog?.["status"] === "in_progress"
            ? "in_progress"
            : "not_started";

      // Privacy-by-design: NEVER return emails, tokens, passwords, private Mia transcripts, or individual allergy lists.
      rows.push({
        maskedUserId,
        preferredName,
        platform: String(op?.["platform"] ?? p["platform"] ?? "web"),
        country: String(op?.["country"] ?? p["country"] ?? "ZA"),
        onboardingStatus: status,
        currentPage:
          typeof prog?.["current_page"] === "number"
            ? (prog["current_page"] as number)
            : typeof p["onboarding_step"] === "number"
              ? (p["onboarding_step"] as number) + 1
              : null,
        primaryGoal,
        challengeCount: Array.isArray(op?.["challenges"])
          ? (op!["challenges"] as unknown[]).length
          : 0,
        cookingLevel: (op?.["cooking_level"] as string | null) ?? null,
        budgetRangeZar: (op?.["budget_range_zar"] as string | null) ?? null,
        acquisitionChannel: channel,
        subscriptionStatus: subMap.get(uid) ?? "free",
        updatedAt:
          (op?.["updated_at"] as string | null) ?? (p["updatedAt"] as string | null) ?? null,
      });

      if (rows.length >= data.limit) break;
    }

    void auditLog({
      actor_id: context.userId,
      action: "admin.user_insights_inspected",
      target_table: "user_onboarding_profiles",
      metadata: { searchLen: q.length, returnedCount: rows.length },
    });

    return { rows };
  });

export const logAdminInsightsExport = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => z.object({ rowCount: z.number().int().min(0).max(100000) }).parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId, context.claims);
    await auditLog({
      actor_id: context.userId,
      action: "admin.user_insights_csv_exported",
      target_table: "user_onboarding_profiles",
      metadata: { rowCount: data.rowCount },
    });
    return { ok: true as const };
  });
