import { describe, expect, it, vi, beforeEach } from "vitest";
import { EMPTY_PREFERENCES, preferenceScore, type FoodPreferences } from "@/lib/preferences";
import {
  buildDynamicOnboardingSummary,
  buildMiaPersonalisationContext,
  buildPersonalisationProfile,
  getRelevantOnboardingBenefits,
} from "@/lib/personalisation";
import {
  aggregateUserInsights,
  buildUserInsightsCsv,
  safeCsvCell,
} from "@/lib/user-insights-aggregator";

const rbacMocks = vi.hoisted(() => ({
  isAdminAccount: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/firebase-auth-middleware", () => ({
  requireFirebaseAuth: (_ctx: unknown) => undefined,
}));

vi.mock("@/server/firebase-admin", () => ({
  isAdminAccount: rbacMocks.isAdminAccount,
}));

vi.mock("@/lib/firebase-admin-access", () => ({
  loadFirebaseAdmin: async () => ({
    firebaseAdmin: { from: rbacMocks.from },
  }),
}));

vi.mock("@/lib/security.server", () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const chain = {
      middleware: () => chain,
      validator: (validate: (v: unknown) => unknown) => ({
        handler:
          (fn: (args: { data: unknown; context: unknown }) => Promise<unknown>) =>
          async (input: { data?: unknown; context?: unknown } = {}) => {
            const parsed = validate(input.data);
            return fn({
              data: parsed,
              context: input.context ?? { userId: "user-1", claims: { email: "user@example.com" } },
            });
          },
      }),
    };
    return chain;
  },
}));

describe("MealMate personalisation engine", () => {
  it("separates strict allergy exclusions from preferences and scores matching recipes accurately", () => {
    const prefs: FoodPreferences = {
      ...EMPTY_PREFERENCES,
      preferred_name: "Thabo",
      goals: ["Save money on food.", "Reduce food waste."],
      challenges: ["Healthy food feels expensive.", "I waste groceries."],
      meal_enjoyments: ["South African food", "High-protein meals"],
      allergies: ["Peanuts", "Shellfish"],
      dietary_restrictions: ["Halal"],
      disliked_foods: ["Mushrooms"],
      cooking_time: "15–30 minutes",
      budget_range_zar: "Under R1,000 / month",
    };

    const profile = buildPersonalisationProfile(prefs);
    expect(profile.budget_tier).toBe("budget");
    expect(profile.pantry_focus).toBe("zero_waste");
    expect(profile.suggested_max_minutes).toBe(30);
    expect(profile.strict_exclusions).toEqual(
      expect.arrayContaining(["peanuts", "shellfish", "halal", "mushrooms"]),
    );
    expect(profile.strict_exclusions).not.toContain("south african food");
    expect(profile.balanced_nutrition_safeguard).toBe(false);

    // Safe quick chicken meal scores high; peanut dish is strongly penalised
    const safeScore = preferenceScore(
      {
        name: "15-minute Peri Peri Chicken Bowl",
        category: "High Protein",
        cuisine: "South African",
        prepTime: "10 min",
        cookTime: "15 min",
        ingredients: ["chicken breast", "rice", "lemon", "garlic"],
      },
      prefs,
    );
    const unsafeScore = preferenceScore(
      {
        name: "Pork & Peanut Noodles with Mushrooms",
        category: "Dinner",
        cuisine: "Asian",
        ingredients: ["pork", "peanuts", "mushrooms"],
      },
      prefs,
    );

    expect(safeScore).toBeGreaterThan(0);
    expect(unsafeScore).toBeLessThan(-100);
  });

  it("enforces youth balanced-nutrition safeguard for under_18 users without weight-loss targets", () => {
    const teenPrefs: FoodPreferences = {
      ...EMPTY_PREFERENCES,
      preferred_name: "Lindiwe",
      age_bracket: "under_18",
      balanced_nutrition_safeguard: true,
      goals: ["Eat healthier.", "Lose weight in a healthy way."],
      challenges: ["I skip meals"],
      allergies: ["Milk / Lactose"],
    };

    const profile = buildPersonalisationProfile(teenPrefs);
    expect(profile.balanced_nutrition_safeguard).toBe(true);

    const miaContext = buildMiaPersonalisationContext(teenPrefs);
    expect(miaContext).toContain("CRITICAL YOUTH SAFETY RULE");
    expect(miaContext).toContain("NEVER recommend weight-loss diets");
    expect(miaContext).toContain("Milk / Lactose");

    const benefits = getRelevantOnboardingBenefits(teenPrefs);
    expect(benefits.some((b) => /Auto|automatic|approachable|coaching/i.test(b))).toBe(true);

    const summary = buildDynamicOnboardingSummary(teenPrefs);
    expect(summary).toContain("Lindiwe");
    expect(summary).not.toContain("lose weight");
  });
});

describe("Admin User Insights aggregator & CSV security", () => {
  const now = new Date("2026-11-20T12:00:00.000Z");

  it("computes Sections A–J accurately including funnel drop-offs, avg duration, retention, and separate paywall vs paid metrics", () => {
    const report = aggregateUserInsights({
      now,
      filters: {
        from: "2026-10-01T00:00:00.000Z",
        to: "2026-11-21T00:00:00.000Z",
        onboardingCompleted: "all",
      },
      profiles: [
        {
          id: "u1",
          onboarding_completed: true,
          platform: "web",
          country: "ZA",
          created_at: "2026-10-10T10:00:00.000Z",
        },
        {
          id: "u2",
          onboarding_completed: false,
          platform: "android",
          country: "ZA",
          created_at: "2026-11-10T10:00:00.000Z",
        },
        {
          id: "u3",
          onboarding_completed: true,
          platform: "web",
          country: "ZA",
          created_at: "2026-11-18T10:00:00.000Z",
        },
      ],
      onboardingProfiles: [
        {
          user_id: "u1",
          goals: ["Eat healthier.", "Save money on food."],
          challenges: ["I don't have enough time to cook."],
          health_goals: ["Build healthier eating habits."],
          meal_enjoyments: ["South African food"],
          dietary_restrictions: ["Halal"],
          budget_range_zar: "Under R1,000 / month",
          cooking_time: "Under 15 minutes",
          cooking_level: "Beginner",
          onboarding_completed: true,
          platform: "web",
          country: "ZA",
        },
        {
          user_id: "u3",
          goals: ["Save money on food."],
          challenges: ["Healthy food feels expensive."],
          health_goals: ["Improve my energy."],
          meal_enjoyments: ["Quick meals"],
          dietary_restrictions: ["Vegetarian"],
          budget_range_zar: "R1,000–R2,500 / month",
          cooking_time: "15–30 minutes",
          cooking_level: "Intermediate",
          onboarding_completed: true,
          platform: "web",
          country: "ZA",
        },
      ],
      onboardingProgress: [
        {
          user_id: "u1",
          max_page_reached: 8,
          status: "completed",
          completion_duration_seconds: 120,
        },
        {
          user_id: "u2",
          current_page: 4,
          max_page_reached: 4,
          abandoned_page: 4,
          status: "abandoned",
        },
        {
          user_id: "u3",
          max_page_reached: 8,
          status: "completed",
          completion_duration_seconds: 180,
        },
      ],
      acquisitionSources: [
        { user_id: "u1", self_reported_source: "TikTok", utm_source: "tiktok" },
        { user_id: "u2", self_reported_source: "Google Search", utm_source: "google" },
        { user_id: "u3", self_reported_source: "TikTok", utm_source: "tiktok" },
      ],
      analyticsEvents: [
        { user_id: "u1", event_name: "paywall_viewed", created_at: "2026-10-10T10:05:00.000Z" },
        { user_id: "u3", event_name: "paywall_viewed", created_at: "2026-11-18T10:05:00.000Z" },
        { user_id: "u1", event_name: "trial_started", created_at: "2026-10-10T10:06:00.000Z" },
        { user_id: "u1", event_name: "subscription_started", created_at: "2026-10-13T10:06:00.000Z" },
      ],
      userActivity: [
        // u1 active on D1, D7, D30
        { user_id: "u1", activity_type: "recipe_viewed", created_at: "2026-10-12T10:00:00.000Z" },
        { user_id: "u1", activity_type: "meal_plan_created", created_at: "2026-10-18T10:00:00.000Z" },
        { user_id: "u1", activity_type: "mia_interaction", created_at: "2026-11-19T15:00:00.000Z" },
        // u3 active on D1 + within last 24h
        { user_id: "u3", activity_type: "recipe_saved", created_at: "2026-11-20T09:00:00.000Z" },
      ],
      subscriptions: [
        { user_id: "u1", tier: "monthly", status: "active" },
        { user_id: "u3", tier: "annual", status: "trialing" },
      ],
      payments: [{ user_id: "u1", amount_usd: 9.99, currency: "USD", occurred_at: "2026-10-13T10:06:00.000Z" }],
    });

    expect(report.overview.totalUsers).toBe(3);
    expect(report.overview.onboardingCompletedCount).toBe(2);
    expect(report.overview.onboardingCompletionRatePct).toBeCloseTo(66.7, 1);
    expect(report.overview.paywallViewedUsers).toBe(2);
    expect(report.overview.trialStarts).toBe(1);
    expect(report.overview.paidConversions).toBe(1);
    expect(report.overview.mrrUsd).toBe(9.99);

    expect(report.funnel.avgCompletionDurationSeconds).toBe(150);
    expect(report.funnel.mostAbandonedPage).toBe(4);
    expect(report.funnel.onboardingPages[4]!.usersReached).toBe(2); // Page 5 dropped u2

    expect(report.engagement.dau).toBe(2);
    expect(report.engagement.d1RetentionPct).toBe(66.7); // u1 & u3 retained out of 3 >=1d old
    expect(report.engagement.d30RetentionPct).toBe(100); // u1 is only >=30d cohort user and returned at day 40

    expect(report.acquisition.channelPerformance.find((c) => c.channel === "TikTok")?.paidConversionRatePct).toBe(50);
    expect(report.actionableInsights.some((i) => i.id === "onboarding-dropoff")).toBe(true);
  });

  it("neutralizes spreadsheet formula injection in CSV export and omits emails or individual allergies", () => {
    expect(safeCsvCell("=CMD('calc')")).toBe("'=CMD('calc')");
    expect(safeCsvCell("+123")).toBe("'+123");
    expect(safeCsvCell("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");

    const report = aggregateUserInsights({
      filters: { from: "2026-10-01T00:00:00.000Z", to: "2026-11-21T00:00:00.000Z" },
      profiles: [{ id: "u1", onboarding_completed: true }],
      onboardingProfiles: [
        {
          user_id: "u1",
          challenges: ["=HYPERLINK(\"http://evil\")"],
          dietary_restrictions: ["Halal"],
          onboarding_completed: true,
        },
      ],
      onboardingProgress: [],
      acquisitionSources: [],
      analyticsEvents: [],
      userActivity: [],
      subscriptions: [],
      payments: [],
    });

    const csv = buildUserInsightsCsv(report);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain("@gmail.com");
    expect(csv).not.toContain("Peanuts");
  });

  it("blocks non-admin access with 403 and masks UIDs without leaking emails or allergies", async () => {
    const { adminInspectInsightUsers, getUserInsights } = await import(
      "@/lib/user-insights.functions"
    );

    rbacMocks.isAdminAccount.mockResolvedValueOnce(false);
    await expect(
      getUserInsights({
        data: { from: "2026-10-01T00:00:00.000Z", to: "2026-11-20T00:00:00.000Z" },
      } as never),
    ).rejects.toMatchObject({ status: 403 });

    rbacMocks.isAdminAccount.mockResolvedValueOnce(true);
    rbacMocks.from.mockImplementation((table: string) => ({
      select: async () => {
        if (table === "profiles") {
          return {
            data: [
              {
                id: "firebase-user-1234567890",
                displayName: "Thabo",
                onboarding_completed: true,
                platform: "web",
                country: "ZA",
              },
            ],
          };
        }
        if (table === "user_onboarding_profiles") {
          return {
            data: [
              {
                user_id: "firebase-user-1234567890",
                preferred_name: "Thabo",
                primary_goal: "Eat healthier.",
                challenges: ["I waste groceries."],
                budget_range_zar: "Under R1,000 / month",
                onboarding_completed: true,
              },
            ],
          };
        }
        return { data: [] };
      },
    }));

    const inspected = await adminInspectInsightUsers({
      data: { search: "", limit: 10 },
    } as never);

    expect(inspected.rows).toHaveLength(1);
    const row = inspected.rows[0]!;
    expect(row.maskedUserId).toBe("fireba…7890");
    expect(Object.keys(row)).not.toContain("email");
    expect(Object.keys(row)).not.toContain("allergies");
  });
});
