export type UserInsightsFilter = {
  from: string;
  to: string;
  platform?: string | null;
  country?: string | null;
  channel?: string | null;
  subscriptionStatus?: string | null;
  onboardingCompleted?: "all" | "completed" | "incomplete";
};

export type RawProfileDoc = {
  id: string;
  displayName?: string | null;
  onboarding_completed?: boolean;
  onboarding_step?: number | null;
  goal?: string | null;
  platform?: string | null;
  country?: string | null;
  preferences?: Record<string, unknown> | null;
  createdAt?: string | null;
  created_at?: string | null;
};

export type RawOnboardingProfileDoc = {
  user_id: string;
  preferred_name?: string | null;
  household_size?: string | null;
  goals?: string[];
  primary_goal?: string | null;
  challenges?: string[];
  health_goals?: string[];
  age_bracket?: string | null;
  balanced_nutrition_safeguard?: boolean;
  eating_habits?: string | null;
  cooking_frequency?: string | null;
  primary_challenge?: string | null;
  meal_enjoyments?: string[];
  dietary_restrictions?: string[];
  preferred_cuisines?: string[];
  cooking_time?: string | null;
  cooking_level?: string | null;
  budget_range_zar?: string | null;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  platform?: string | null;
  country?: string | null;
  updated_at?: string | null;
};

export type RawOnboardingProgressDoc = {
  user_id: string;
  current_page?: number;
  max_page_reached?: number;
  completed_pages?: number[];
  status?: "in_progress" | "completed" | "abandoned";
  started_at?: string | null;
  last_active_at?: string | null;
  completed_at?: string | null;
  abandoned_at?: string | null;
  abandoned_page?: number | null;
  completion_duration_seconds?: number | null;
  platform?: string | null;
  country?: string | null;
};

export type RawAcquisitionDoc = {
  user_id: string;
  self_reported_source?: string | null;
  other_detail?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  platform?: string | null;
  country?: string | null;
  captured_at?: string | null;
};

export type RawAnalyticsEventDoc = {
  id?: string;
  user_id: string;
  event_name: string;
  page_number?: number | null;
  platform?: string | null;
  country?: string | null;
  channel?: string | null;
  created_at: string;
};

export type RawUserActivityDoc = {
  id?: string;
  user_id: string;
  activity_type: string;
  platform?: string | null;
  created_at: string;
};

export type RawSubscriptionDoc = {
  user_id: string;
  tier?: string | null;
  status?: string | null;
  store?: string | null;
  period_start?: string | null;
  created_at?: string | null;
};

export type RawPaymentDoc = {
  user_id: string;
  amount_usd?: number | null;
  currency?: string | null;
  kind?: string | null;
  occurred_at?: string | null;
};

export type CountShare = { name: string; count: number; pct: number };

export type ActionableInsight = {
  id: string;
  severity: "high" | "medium" | "positive";
  title: string;
  evidence: string;
  recommendation: string;
};

export type UserInsightsReport = {
  generatedAt: string;
  filterOptions: {
    platforms: string[];
    countries: string[];
    channels: string[];
  };
  overview: {
    totalUsers: number;
    newUsersInRange: number;
    onboardingCompletedCount: number;
    onboardingCompletionRatePct: number;
    onboardingDropOffRatePct: number;
    paywallViewedUsers: number;
    trialStarts: number;
    paidConversions: number;
    activePaidSubscribers: number;
    activeTrialSubscribers: number;
    mrrUsd: number;
    arrUsd: number;
  };
  challenges: CountShare[];
  goals: {
    foodGoals: CountShare[];
    healthGoals: CountShare[];
    balancedSafeguardCount: number;
  };
  preferences: {
    mealEnjoyments: CountShare[];
    dietaryRestrictions: CountShare[];
  };
  habitsAndLifestyle: {
    eatingHabits: CountShare[];
    cookingFrequency: CountShare[];
    cookingTimes: CountShare[];
    cookingLevels: CountShare[];
    budgetRangesZar: CountShare[];
  };
  acquisition: {
    selfReported: CountShare[];
    utmChannels: CountShare[];
    channelPerformance: Array<{
      channel: string;
      users: number;
      onboardingCompletedPct: number;
      trialRatePct: number;
      paidConversionRatePct: number;
    }>;
  };
  funnel: {
    milestones: Array<{ step: string; users: number; conversionFromPrevPct: number }>;
    onboardingPages: Array<{
      page: number;
      label: string;
      usersReached: number;
      dropOffPct: number;
    }>;
    avgCompletionDurationSeconds: number | null;
    mostAbandonedPage: number | null;
  };
  subscriptions: {
    byStatus: CountShare[];
    byTier: CountShare[];
    trialToPaidRatePct: number;
    cancellationRatePct: number;
    revenueInRangeUsd: number;
  };
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    d1RetentionPct: number;
    d7RetentionPct: number;
    d30RetentionPct: number;
    topFeatures: CountShare[];
    completedVsIncompleteRetention: {
      completedActivePct: number;
      incompleteActivePct: number;
    };
    dailyTrend: Array<{ date: string; activeUsers: number; signups: number }>;
  };
  actionableInsights: ActionableInsight[];
};

const PAGE_LABELS = [
  "Page 1 · Food Goals",
  "Page 2 · Challenges",
  "Page 3 · Health Goals",
  "Page 4 · Eating Habits",
  "Page 5 · Tastes & Safety",
  "Page 6 · Lifestyle & ZAR",
  "Page 7 · Discovery",
  "Page 8 · Summary",
];

function pct(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function toCountShares(counts: Map<string, number>, denominator: number): CountShare[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([name, count]) => ({
      name,
      count,
      pct: pct(count, denominator),
    }));
}

function normalizeChannelName(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "Direct / Organic";
  return raw.trim();
}

function inIsoRange(iso: string | null | undefined, fromMs: number, toMs: number): boolean {
  if (!iso) return false;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return false;
  return ms >= fromMs && ms <= toMs;
}

function monthlyUsdEquivalent(tier: string | null | undefined): number {
  switch ((tier ?? "").toLowerCase()) {
    case "annual":
    case "yearly":
      return 79.99 / 12;
    case "family":
      return 119.99 / 12;
    case "monthly":
      return 9.99;
    default:
      return 0;
  }
}

export function aggregateUserInsights(input: {
  filters: UserInsightsFilter;
  profiles: RawProfileDoc[];
  onboardingProfiles: RawOnboardingProfileDoc[];
  onboardingProgress: RawOnboardingProgressDoc[];
  acquisitionSources: RawAcquisitionDoc[];
  analyticsEvents: RawAnalyticsEventDoc[];
  userActivity: RawUserActivityDoc[];
  subscriptions: RawSubscriptionDoc[];
  payments: RawPaymentDoc[];
  now?: Date;
}): UserInsightsReport {
  const now = input.now ?? new Date();
  const fromMs = Date.parse(input.filters.from) || now.getTime() - 30 * 86_400_000;
  const toMs = Date.parse(input.filters.to) || now.getTime();

  const onboardingByUser = new Map<string, RawOnboardingProfileDoc>();
  for (const row of input.onboardingProfiles) onboardingByUser.set(row.user_id, row);

  const progressByUser = new Map<string, RawOnboardingProgressDoc>();
  for (const row of input.onboardingProgress) progressByUser.set(row.user_id, row);

  const acqByUser = new Map<string, RawAcquisitionDoc>();
  for (const row of input.acquisitionSources) acqByUser.set(row.user_id, row);

  const subByUser = new Map<string, RawSubscriptionDoc>();
  for (const sub of input.subscriptions) {
    const existing = subByUser.get(sub.user_id);
    if (
      !existing ||
      (sub.status === "active" && existing.status !== "active") ||
      String(sub.created_at ?? "") > String(existing.created_at ?? "")
    ) {
      subByUser.set(sub.user_id, sub);
    }
  }

  const allUserIds = new Set<string>();
  for (const p of input.profiles) allUserIds.add(p.id);
  for (const op of input.onboardingProfiles) allUserIds.add(op.user_id);
  for (const pr of input.onboardingProgress) allUserIds.add(pr.user_id);

  const profileByUser = new Map<string, RawProfileDoc>();
  for (const p of input.profiles) profileByUser.set(p.id, p);

  const platformsSet = new Set<string>();
  const countriesSet = new Set<string>();
  const channelsSet = new Set<string>();

  type UserRecord = {
    userId: string;
    platform: string;
    country: string;
    channel: string;
    selfReportedSource: string | null;
    utmSource: string | null;
    subStatus: string;
    subTier: string;
    onboardingCompleted: boolean;
    createdAt: string | null;
  };

  const allUsers: UserRecord[] = [];
  for (const userId of allUserIds) {
    const prof = profileByUser.get(userId);
    const op = onboardingByUser.get(userId);
    const acq = acqByUser.get(userId);
    const sub = subByUser.get(userId);

    const prefsRaw = (prof?.preferences ?? {}) as Record<string, unknown>;
    const prefsAcq = (prefsRaw["acquisition"] ?? {}) as Record<string, unknown>;

    const platform = (op?.platform ?? prof?.platform ?? acq?.platform ?? "web").toLowerCase();
    const country = (op?.country ?? prof?.country ?? acq?.country ?? "ZA").toUpperCase();
    const utmSource =
      acq?.utm_source ??
      (typeof prefsAcq["utm_source"] === "string" ? prefsAcq["utm_source"] : null);
    const selfReported =
      acq?.self_reported_source ??
      (typeof prefsAcq["self_reported_source"] === "string"
        ? prefsAcq["self_reported_source"]
        : null);
    const channel = normalizeChannelName(selfReported || utmSource);
    const subStatus = (sub?.status ?? "free").toLowerCase();
    const subTier = (sub?.tier ?? "free").toLowerCase();
    const onboardingCompleted = Boolean(op?.onboarding_completed || prof?.onboarding_completed);
    const createdAt =
      prof?.created_at ??
      prof?.createdAt ??
      progressByUser.get(userId)?.started_at ??
      acq?.captured_at ??
      null;

    platformsSet.add(platform);
    countriesSet.add(country);
    channelsSet.add(channel);

    allUsers.push({
      userId,
      platform,
      country,
      channel,
      selfReportedSource: selfReported,
      utmSource,
      subStatus,
      subTier,
      onboardingCompleted,
      createdAt,
    });
  }

  const filteredUsers = allUsers.filter((u) => {
    if (input.filters.platform && input.filters.platform !== "all") {
      if (u.platform !== input.filters.platform.toLowerCase()) return false;
    }
    if (input.filters.country && input.filters.country !== "all") {
      if (u.country !== input.filters.country.toUpperCase()) return false;
    }
    if (input.filters.channel && input.filters.channel !== "all") {
      if (u.channel !== input.filters.channel) return false;
    }
    if (input.filters.subscriptionStatus && input.filters.subscriptionStatus !== "all") {
      if (u.subStatus !== input.filters.subscriptionStatus.toLowerCase()) return false;
    }
    if (input.filters.onboardingCompleted === "completed" && !u.onboardingCompleted) return false;
    if (input.filters.onboardingCompleted === "incomplete" && u.onboardingCompleted) return false;
    return true;
  });

  const filteredUserIds = new Set(filteredUsers.map((u) => u.userId));
  const totalUsers = filteredUsers.length;
  const newUsersInRange = filteredUsers.filter((u) => inIsoRange(u.createdAt, fromMs, toMs)).length;
  const completedUsers = filteredUsers.filter((u) => u.onboardingCompleted);
  const onboardingCompletedCount = completedUsers.length;
  const onboardingCompletionRatePct = pct(onboardingCompletedCount, totalUsers);
  const onboardingDropOffRatePct =
    totalUsers > 0 ? Math.round((100 - onboardingCompletionRatePct) * 10) / 10 : 0;

  // Events filtered to active cohort & date range
  const filteredEvents = input.analyticsEvents.filter(
    (e) => filteredUserIds.has(e.user_id) && inIsoRange(e.created_at, fromMs, toMs),
  );
  const usersWithEvent = (name: string) =>
    new Set(filteredEvents.filter((e) => e.event_name === name).map((e) => e.user_id));

  const paywallViewedUsers = usersWithEvent("paywall_viewed").size;
  const trialStartedUsers = usersWithEvent("trial_started");
  const subStartedUsers = usersWithEvent("subscription_started");

  const activePaidSubscribers = filteredUsers.filter((u) => u.subStatus === "active").length;
  const activeTrialSubscribers = filteredUsers.filter((u) => u.subStatus === "trialing").length;
  let mrrUsd = 0;
  for (const u of filteredUsers) {
    if (u.subStatus === "active") {
      mrrUsd += monthlyUsdEquivalent(u.subTier);
    }
  }
  mrrUsd = Math.round(mrrUsd * 100) / 100;
  const arrUsd = Math.round(mrrUsd * 12 * 100) / 100;

  // Sections B–E aggregations from onboarding profiles + profile preferences fallback
  const challengeCounts = new Map<string, number>();
  const foodGoalCounts = new Map<string, number>();
  const healthGoalCounts = new Map<string, number>();
  const enjoymentCounts = new Map<string, number>();
  const dietCounts = new Map<string, number>();
  const eatingHabitCounts = new Map<string, number>();
  const frequencyCounts = new Map<string, number>();
  const cookingTimeCounts = new Map<string, number>();
  const cookingLevelCounts = new Map<string, number>();
  const budgetCounts = new Map<string, number>();
  let balancedSafeguardCount = 0;

  for (const u of filteredUsers) {
    const op = onboardingByUser.get(u.userId);
    const prefs = (profileByUser.get(u.userId)?.preferences ?? {}) as Record<string, unknown>;

    const goals = op?.goals?.length
      ? op.goals
      : Array.isArray(prefs["goals"])
        ? (prefs["goals"] as string[])
        : u.onboardingCompleted && profileByUser.get(u.userId)?.goal
          ? [String(profileByUser.get(u.userId)!.goal)]
          : [];
    for (const g of goals) if (g) foodGoalCounts.set(g, (foodGoalCounts.get(g) ?? 0) + 1);

    const challenges = op?.challenges?.length
      ? op.challenges
      : Array.isArray(prefs["challenges"])
        ? (prefs["challenges"] as string[])
        : [];
    for (const c of challenges) if (c) challengeCounts.set(c, (challengeCounts.get(c) ?? 0) + 1);

    const hGoals = op?.health_goals?.length
      ? op.health_goals
      : Array.isArray(prefs["health_goals"])
        ? (prefs["health_goals"] as string[])
        : [];
    for (const hg of hGoals) if (hg) healthGoalCounts.set(hg, (healthGoalCounts.get(hg) ?? 0) + 1);

    if (op?.balanced_nutrition_safeguard || prefs["balanced_nutrition_safeguard"] === true) {
      balancedSafeguardCount += 1;
    }

    const enjoys = op?.meal_enjoyments?.length
      ? op.meal_enjoyments
      : Array.isArray(prefs["meal_enjoyments"])
        ? (prefs["meal_enjoyments"] as string[])
        : Array.isArray(prefs["favorite_foods"])
          ? (prefs["favorite_foods"] as string[])
          : [];
    for (const e of enjoys) if (e) enjoymentCounts.set(e, (enjoymentCounts.get(e) ?? 0) + 1);

    // STRICTLY aggregate diet counts only (never expose user allergies individually or in bulk table).
    const diets = op?.dietary_restrictions?.length
      ? op.dietary_restrictions
      : Array.isArray(prefs["dietary_restrictions"])
        ? (prefs["dietary_restrictions"] as string[])
        : [];
    for (const d of diets) if (d) dietCounts.set(d, (dietCounts.get(d) ?? 0) + 1);

    const habit =
      op?.eating_habits ??
      (typeof prefs["eating_habits"] === "string" ? prefs["eating_habits"] : null);
    if (habit) eatingHabitCounts.set(habit, (eatingHabitCounts.get(habit) ?? 0) + 1);

    const freq =
      op?.cooking_frequency ??
      (typeof prefs["cooking_frequency"] === "string" ? prefs["cooking_frequency"] : null);
    if (freq) frequencyCounts.set(freq, (frequencyCounts.get(freq) ?? 0) + 1);

    const cTime =
      op?.cooking_time ??
      (typeof prefs["cooking_time"] === "string" ? prefs["cooking_time"] : null);
    if (cTime) cookingTimeCounts.set(cTime, (cookingTimeCounts.get(cTime) ?? 0) + 1);

    const cLevel =
      op?.cooking_level ??
      (typeof prefs["cooking_level"] === "string" ? prefs["cooking_level"] : null);
    if (cLevel) cookingLevelCounts.set(cLevel, (cookingLevelCounts.get(cLevel) ?? 0) + 1);

    const budget =
      op?.budget_range_zar ??
      (typeof prefs["budget_range_zar"] === "string" ? prefs["budget_range_zar"] : null);
    if (budget) budgetCounts.set(budget, (budgetCounts.get(budget) ?? 0) + 1);
  }

  // Section F: Acquisition attribution breakdown
  const selfReportedCounts = new Map<string, number>();
  const utmCounts = new Map<string, number>();
  const channelGroups = new Map<string, UserRecord[]>();

  for (const u of filteredUsers) {
    const sr = u.selfReportedSource || "Unspecified";
    selfReportedCounts.set(sr, (selfReportedCounts.get(sr) ?? 0) + 1);
    const utm = u.utmSource || "None";
    utmCounts.set(utm, (utmCounts.get(utm) ?? 0) + 1);

    const list = channelGroups.get(u.channel) ?? [];
    list.push(u);
    channelGroups.set(u.channel, list);
  }

  const channelPerformance = Array.from(channelGroups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .map(([channel, group]) => {
      const groupCompleted = group.filter((u) => u.onboardingCompleted).length;
      const groupTrials = group.filter(
        (u) => u.subStatus === "trialing" || trialStartedUsers.has(u.userId),
      ).length;
      const groupPaid = group.filter(
        (u) => u.subStatus === "active" || subStartedUsers.has(u.userId),
      ).length;
      return {
        channel,
        users: group.length,
        onboardingCompletedPct: pct(groupCompleted, group.length),
        trialRatePct: pct(groupTrials, group.length),
        paidConversionRatePct: pct(groupPaid, group.length),
      };
    });

  // Section G: Funnel & Onboarding Page-by-Page Retention
  const signupCount = Math.max(totalUsers, usersWithEvent("signup_completed").size);
  const startedUsersCount = Math.max(
    onboardingCompletedCount,
    usersWithEvent("onboarding_started").size,
    filteredUsers.filter((u) => progressByUser.has(u.userId)).length,
  );
  const trialsCount = Math.max(activeTrialSubscribers, trialStartedUsers.size);
  const paidCount = Math.max(activePaidSubscribers, subStartedUsers.size);

  const milestones = [
    { step: "Signup Completed", users: signupCount, conversionFromPrevPct: 100 },
    {
      step: "Onboarding Started",
      users: startedUsersCount,
      conversionFromPrevPct: pct(startedUsersCount, signupCount),
    },
    {
      step: "Onboarding Completed",
      users: onboardingCompletedCount,
      conversionFromPrevPct: pct(onboardingCompletedCount, startedUsersCount),
    },
    {
      step: "Paywall Viewed",
      users: paywallViewedUsers,
      conversionFromPrevPct: pct(paywallViewedUsers, onboardingCompletedCount),
    },
    {
      step: "Trial Started",
      users: trialsCount,
      conversionFromPrevPct: pct(
        trialsCount,
        Math.max(paywallViewedUsers, onboardingCompletedCount),
      ),
    },
    {
      step: "Subscription Started",
      users: paidCount,
      conversionFromPrevPct: pct(paidCount, Math.max(trialsCount, paywallViewedUsers, 1)),
    },
  ];

  const pageReachCounts = Array.from({ length: 8 }, () => new Set<string>());
  const abandonedPageCounts = new Map<number, number>();
  const durations: number[] = [];

  for (const uid of filteredUserIds) {
    const prog = progressByUser.get(uid);
    if (prog) {
      const maxReached = Math.min(8, Math.max(1, prog.max_page_reached ?? prog.current_page ?? 1));
      for (let p = 1; p <= maxReached; p++) {
        pageReachCounts[p - 1]!.add(uid);
      }
      if (prog.status === "abandoned" || (prog.status === "in_progress" && prog.abandoned_page)) {
        const abPage = prog.abandoned_page ?? prog.current_page ?? maxReached;
        abandonedPageCounts.set(abPage, (abandonedPageCounts.get(abPage) ?? 0) + 1);
      }
      if (
        typeof prog.completion_duration_seconds === "number" &&
        prog.completion_duration_seconds > 0 &&
        prog.completion_duration_seconds <= 86400
      ) {
        durations.push(prog.completion_duration_seconds);
      }
    } else if (
      onboardingByUser.get(uid)?.onboarding_completed ||
      profileByUser.get(uid)?.onboarding_completed
    ) {
      for (let p = 1; p <= 8; p++) pageReachCounts[p - 1]!.add(uid);
    }
  }
  for (const evt of filteredEvents) {
    if (
      (evt.event_name === "onboarding_page_viewed" ||
        evt.event_name === "onboarding_page_completed") &&
      typeof evt.page_number === "number" &&
      evt.page_number >= 1 &&
      evt.page_number <= 8
    ) {
      pageReachCounts[evt.page_number - 1]!.add(evt.user_id);
    }
    if (evt.event_name === "onboarding_abandoned" && typeof evt.page_number === "number") {
      abandonedPageCounts.set(evt.page_number, (abandonedPageCounts.get(evt.page_number) ?? 0) + 1);
    }
  }

  const onboardingPages = PAGE_LABELS.map((label, idx) => {
    const usersReached = pageReachCounts[idx]!.size;
    const prevUsers =
      idx === 0 ? Math.max(startedUsersCount, usersReached) : pageReachCounts[idx - 1]!.size;
    const drop =
      prevUsers > 0
        ? Math.max(0, Math.round(((prevUsers - usersReached) / prevUsers) * 1000) / 10)
        : 0;
    return { page: idx + 1, label, usersReached, dropOffPct: drop };
  });

  let mostAbandonedPage: number | null = null;
  let maxAbandoned = 0;
  for (const [pg, count] of abandonedPageCounts.entries()) {
    if (count > maxAbandoned) {
      maxAbandoned = count;
      mostAbandonedPage = pg;
    }
  }

  const avgCompletionDurationSeconds =
    durations.length > 0
      ? Math.round(durations.reduce((s, x) => s + x, 0) / durations.length)
      : null;

  // Section H: Subscriptions & revenue
  const subStatusCounts = new Map<string, number>();
  const subTierCounts = new Map<string, number>();
  let cancelledCount = 0;
  for (const u of filteredUsers) {
    subStatusCounts.set(u.subStatus, (subStatusCounts.get(u.subStatus) ?? 0) + 1);
    if (u.subStatus !== "free") {
      subTierCounts.set(u.subTier, (subTierCounts.get(u.subTier) ?? 0) + 1);
    }
    if (u.subStatus === "cancelled" || u.subStatus === "expired") cancelledCount += 1;
  }
  const revenueInRangeUsd =
    Math.round(
      input.payments
        .filter((p) => filteredUserIds.has(p.user_id) && inIsoRange(p.occurred_at, fromMs, toMs))
        .reduce((sum, p) => sum + (Number(p.amount_usd) || 0), 0) * 100,
    ) / 100;

  const totalSubscribedOrCancelled =
    activePaidSubscribers + activeTrialSubscribers + cancelledCount;
  const trialToPaidRatePct = pct(
    paidCount,
    Math.max(trialsCount, activePaidSubscribers + activeTrialSubscribers),
  );
  const cancellationRatePct = pct(cancelledCount, totalSubscribedOrCancelled);

  // Section I: Engagement & Meaningful Cohort Retention (strictly from user_activity)
  const validActivities = input.userActivity.filter((a) => filteredUserIds.has(a.user_id));
  const nowMs = now.getTime();
  const oneDayAgo = nowMs - 86_400_000;
  const sevenDaysAgo = nowMs - 7 * 86_400_000;
  const thirtyDaysAgo = nowMs - 30 * 86_400_000;

  const dauSet = new Set<string>();
  const wauSet = new Set<string>();
  const mauSet = new Set<string>();
  const featureCounts = new Map<string, number>();
  const activeDatesByUser = new Map<string, number[]>();
  const dailyActiveMap = new Map<string, Set<string>>();

  for (const act of validActivities) {
    const ms = Date.parse(act.created_at);
    if (!Number.isFinite(ms)) continue;
    if (ms >= oneDayAgo) dauSet.add(act.user_id);
    if (ms >= sevenDaysAgo) wauSet.add(act.user_id);
    if (ms >= thirtyDaysAgo) mauSet.add(act.user_id);

    const list = activeDatesByUser.get(act.user_id) ?? [];
    list.push(ms);
    activeDatesByUser.set(act.user_id, list);

    if (inIsoRange(act.created_at, fromMs, toMs)) {
      featureCounts.set(act.activity_type, (featureCounts.get(act.activity_type) ?? 0) + 1);
      const day = act.created_at.slice(0, 10);
      const daySet = dailyActiveMap.get(day) ?? new Set<string>();
      daySet.add(act.user_id);
      dailyActiveMap.set(day, daySet);
    }
  }

  let d1Eligible = 0;
  let d1Retained = 0;
  let d7Eligible = 0;
  let d7Retained = 0;
  let d30Eligible = 0;
  let d30Retained = 0;

  for (const u of filteredUsers) {
    const signupMs = u.createdAt ? Date.parse(u.createdAt) : NaN;
    if (!Number.isFinite(signupMs)) continue;
    const actTimes = activeDatesByUser.get(u.userId) ?? [];
    const ageDays = (nowMs - signupMs) / 86_400_000;
    if (ageDays >= 1) {
      d1Eligible += 1;
      if (actTimes.some((t) => t - signupMs >= 20 * 3_600_000)) d1Retained += 1;
    }
    if (ageDays >= 7) {
      d7Eligible += 1;
      if (actTimes.some((t) => t - signupMs >= 6 * 86_400_000)) d7Retained += 1;
    }
    if (ageDays >= 30) {
      d30Eligible += 1;
      if (actTimes.some((t) => t - signupMs >= 28 * 86_400_000)) d30Retained += 1;
    }
  }

  const completedActiveUsers = completedUsers.filter((u) => mauSet.has(u.userId)).length;
  const incompleteUsers = filteredUsers.filter((u) => !u.onboardingCompleted);
  const incompleteActiveUsers = incompleteUsers.filter((u) => mauSet.has(u.userId)).length;

  const signupDailyMap = new Map<string, number>();
  for (const u of filteredUsers) {
    if (u.createdAt && inIsoRange(u.createdAt, fromMs, toMs)) {
      const day = u.createdAt.slice(0, 10);
      signupDailyMap.set(day, (signupDailyMap.get(day) ?? 0) + 1);
    }
  }

  const allDays = Array.from(new Set([...dailyActiveMap.keys(), ...signupDailyMap.keys()])).sort();
  const dailyTrend = allDays.slice(-30).map((date) => ({
    date,
    activeUsers: dailyActiveMap.get(date)?.size ?? 0,
    signups: signupDailyMap.get(date) ?? 0,
  }));

  // Section J: Deterministic Evidence-Based Actionable Insights
  const actionableInsights: ActionableInsight[] = [];

  if (mostAbandonedPage !== null && maxAbandoned > 0) {
    actionableInsights.push({
      id: "onboarding-dropoff",
      severity: "high",
      title: `Highest onboarding abandonment occurs on Page ${mostAbandonedPage}`,
      evidence: `${maxAbandoned} abandoned sessions recorded at ${PAGE_LABELS[mostAbandonedPage - 1] ?? `Page ${mostAbandonedPage}`}. Overall onboarding drop-off is ${onboardingDropOffRatePct}%.`,
      recommendation: `Simplify prompts or reduce cognitive load on Page ${mostAbandonedPage} to lift completion above ${Math.min(95, Math.round(onboardingCompletionRatePct + 12))}%.`,
    });
  }

  const topChallenges = toCountShares(challengeCounts, Math.max(1, onboardingCompletedCount));
  if (topChallenges[0]) {
    actionableInsights.push({
      id: "top-challenge",
      severity: "medium",
      title: `Top user struggle: "${topChallenges[0].name}"`,
      evidence: `${topChallenges[0].pct}% (${topChallenges[0].count} users) flagged this challenge on Page 2.`,
      recommendation: /time/i.test(topChallenges[0].name)
        ? "Feature 15-minute weeknight collections prominently at the top of Home & Recipes."
        : /waste|ingredients/i.test(topChallenges[0].name)
          ? "Prompt users to scan or add 3 pantry items immediately after Personalisation."
          : /expensive/i.test(topChallenges[0].name)
            ? "Highlight ZAR budget-friendly meal plans directly on the paywall benefits card."
            : "Surface curated daily meal suggestions on the Home card to eliminate decision fatigue.",
    });
  }

  if (channelPerformance.length > 1) {
    const bestPaidChannel = channelPerformance
      .filter((c) => c.users >= 2)
      .sort((a, b) => b.paidConversionRatePct - a.paidConversionRatePct)[0];
    if (bestPaidChannel && bestPaidChannel.paidConversionRatePct > 0) {
      actionableInsights.push({
        id: "top-channel",
        severity: "positive",
        title: `${bestPaidChannel.channel} leads paid conversion at ${bestPaidChannel.paidConversionRatePct}%`,
        evidence: `${bestPaidChannel.users} users acquired via ${bestPaidChannel.channel} with ${bestPaidChannel.onboardingCompletedPct}% onboarding completion.`,
        recommendation: `Allocate higher creative spend and tailored onboarding messaging toward ${bestPaidChannel.channel}.`,
      });
    }
  }

  if (paywallViewedUsers > 0 && trialToPaidRatePct < 25) {
    actionableInsights.push({
      id: "paywall-conversion",
      severity: "medium",
      title: "Paywall views vs paid conversions show room to sharpen trial value",
      evidence: `${paywallViewedUsers} paywall views yielded ${paidCount} paid conversions (${trialToPaidRatePct}% conversion rate).`,
      recommendation:
        "Show the user's personalised Page 8 benefits summary above the pricing toggle on /premium.",
    });
  }

  if (completedUsers.length > 0 && incompleteUsers.length > 0) {
    const compPct = pct(completedActiveUsers, completedUsers.length);
    const incPct = pct(incompleteActiveUsers, incompleteUsers.length);
    if (compPct > incPct) {
      actionableInsights.push({
        id: "onboarding-retention-lift",
        severity: "positive",
        title: "Personalised users show stronger 30-day active engagement",
        evidence: `${compPct}% MAU among onboarding completers vs ${incPct}% among incomplete accounts.`,
        recommendation:
          "Prompt incomplete accounts with a gentle one-tap resume banner when returning to Home.",
      });
    }
  }

  return {
    generatedAt: now.toISOString(),
    filterOptions: {
      platforms: Array.from(platformsSet).sort(),
      countries: Array.from(countriesSet).sort(),
      channels: Array.from(channelsSet).sort(),
    },
    overview: {
      totalUsers,
      newUsersInRange,
      onboardingCompletedCount,
      onboardingCompletionRatePct,
      onboardingDropOffRatePct,
      paywallViewedUsers,
      trialStarts: trialsCount,
      paidConversions: paidCount,
      activePaidSubscribers,
      activeTrialSubscribers,
      mrrUsd,
      arrUsd,
    },
    challenges: topChallenges,
    goals: {
      foodGoals: toCountShares(foodGoalCounts, Math.max(1, onboardingCompletedCount)),
      healthGoals: toCountShares(healthGoalCounts, Math.max(1, onboardingCompletedCount)),
      balancedSafeguardCount,
    },
    preferences: {
      mealEnjoyments: toCountShares(enjoymentCounts, Math.max(1, onboardingCompletedCount)),
      dietaryRestrictions: toCountShares(dietCounts, Math.max(1, onboardingCompletedCount)),
    },
    habitsAndLifestyle: {
      eatingHabits: toCountShares(eatingHabitCounts, Math.max(1, onboardingCompletedCount)),
      cookingFrequency: toCountShares(frequencyCounts, Math.max(1, onboardingCompletedCount)),
      cookingTimes: toCountShares(cookingTimeCounts, Math.max(1, onboardingCompletedCount)),
      cookingLevels: toCountShares(cookingLevelCounts, Math.max(1, onboardingCompletedCount)),
      budgetRangesZar: toCountShares(budgetCounts, Math.max(1, onboardingCompletedCount)),
    },
    acquisition: {
      selfReported: toCountShares(selfReportedCounts, Math.max(1, totalUsers)),
      utmChannels: toCountShares(utmCounts, Math.max(1, totalUsers)),
      channelPerformance,
    },
    funnel: {
      milestones,
      onboardingPages,
      avgCompletionDurationSeconds,
      mostAbandonedPage,
    },
    subscriptions: {
      byStatus: toCountShares(subStatusCounts, Math.max(1, totalUsers)),
      byTier: toCountShares(
        subTierCounts,
        Math.max(1, activePaidSubscribers + activeTrialSubscribers),
      ),
      trialToPaidRatePct,
      cancellationRatePct,
      revenueInRangeUsd,
    },
    engagement: {
      dau: dauSet.size,
      wau: wauSet.size,
      mau: mauSet.size,
      d1RetentionPct: pct(d1Retained, d1Eligible),
      d7RetentionPct: pct(d7Retained, d7Eligible),
      d30RetentionPct: pct(d30Retained, d30Eligible),
      topFeatures: toCountShares(featureCounts, Math.max(1, validActivities.length)),
      completedVsIncompleteRetention: {
        completedActivePct: pct(completedActiveUsers, completedUsers.length),
        incompleteActivePct: pct(incompleteActiveUsers, incompleteUsers.length),
      },
      dailyTrend,
    },
    actionableInsights,
  };
}

/** Escape CSV cells and neutralize spreadsheet formula injection (=, +, -, @, tab, CR). */
export function safeCsvCell(value: unknown): string {
  let str = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildUserInsightsCsv(report: UserInsightsReport): string {
  const rows: Array<Array<unknown>> = [
    ["Section", "Metric", "Value", "Detail"],
    ["Overview", "Total Users", report.overview.totalUsers, "Filtered cohort"],
    ["Overview", "New Users", report.overview.newUsersInRange, "In selected range"],
    [
      "Overview",
      "Onboarding Completion Rate %",
      report.overview.onboardingCompletionRatePct,
      "Completed / Total",
    ],
    ["Overview", "Trial Starts", report.overview.trialStarts, "RevenueCat trials"],
    ["Overview", "Paid Conversions", report.overview.paidConversions, "Confirmed paid"],
    ["Overview", "MRR (USD)", report.overview.mrrUsd, "Active monthly normalized"],
    ["Overview", "ARR (USD)", report.overview.arrUsd, "MRR x 12"],
  ];

  for (const item of report.challenges) {
    rows.push(["Top Challenges", item.name, item.count, `${item.pct}%`]);
  }
  for (const item of report.goals.foodGoals) {
    rows.push(["Food Goals", item.name, item.count, `${item.pct}%`]);
  }
  for (const item of report.goals.healthGoals) {
    rows.push(["Health Goals", item.name, item.count, `${item.pct}%`]);
  }
  for (const item of report.preferences.mealEnjoyments) {
    rows.push(["Meal Enjoyments", item.name, item.count, `${item.pct}%`]);
  }
  for (const item of report.preferences.dietaryRestrictions) {
    rows.push(["Dietary Restrictions (Aggregate)", item.name, item.count, `${item.pct}%`]);
  }
  for (const item of report.habitsAndLifestyle.budgetRangesZar) {
    rows.push(["ZAR Budget", item.name, item.count, `${item.pct}%`]);
  }
  for (const ch of report.acquisition.channelPerformance) {
    rows.push([
      "Acquisition Channel",
      ch.channel,
      ch.users,
      `Onboarded ${ch.onboardingCompletedPct}% | Trial ${ch.trialRatePct}% | Paid ${ch.paidConversionRatePct}%`,
    ]);
  }
  for (const m of report.funnel.onboardingPages) {
    rows.push(["Onboarding Page", m.label, m.usersReached, `Drop-off ${m.dropOffPct}%`]);
  }
  rows.push([
    "Retention",
    "DAU / WAU / MAU",
    `${report.engagement.dau} / ${report.engagement.wau} / ${report.engagement.mau}`,
    "Meaningful activity",
  ]);
  rows.push([
    "Retention",
    "D1 / D7 / D30 %",
    `${report.engagement.d1RetentionPct}% / ${report.engagement.d7RetentionPct}% / ${report.engagement.d30RetentionPct}%`,
    "Cohort retention",
  ]);

  return rows.map((row) => row.map(safeCsvCell).join(",")).join("\n");
}
