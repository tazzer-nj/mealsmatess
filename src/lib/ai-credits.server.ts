// Server-only: consumes one Mia AI request against the user's plan allowance.
// The counting happens atomically in the database (consume_ai_credit), so the
// limit cannot be bypassed by refreshing, reinstalling or editing app state.

export type AiCreditCheckResult = {
  allowed: true;
  premium: boolean;
  trial?: boolean;
  tier?: string;
  used?: number;
  limit?: number;
  remaining?: number;
};

export class AiLimitError extends Error {
  constructor(
    public reason: "daily" | "monthly" | "free_limit",
    public resetsAt: string | null,
    public quota?: { used: number; limit: number; remaining: number },
  ) {
    const when = resetsAt
      ? new Date(resetsAt).toLocaleString("en-ZA", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }) + " UTC"
      : "soon";
    super(
      reason === "free_limit"
        ? "MEALMATE_LIMIT_MIA_FREE: You’ve used your 2 free Mia searches. Start your 3-day free trial to unlock unlimited Mia!"
        : reason === "daily"
          ? `MEALMATE_LIMIT_AI_DAILY: You've used today's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.`
          : `MEALMATE_LIMIT_AI_MONTHLY: You've used this month's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.`,
    );
  }
}

export async function requireAiCredit(
  userId: string,
  options?: {
    allowFreeTier?: boolean;
    deviceFingerprint?: string;
    email?: string | null;
  },
): Promise<AiCreditCheckResult> {
  const { firebaseAdmin } = await import("@/server/firebase-admin");
  const { data, error } = await firebaseAdmin.rpc("consume_ai_credit", {
    _user_id: userId,
    ...(options?.allowFreeTier ? { _allow_free_tier: true } : {}),
    ...(options?.deviceFingerprint ? { _device_fingerprint: options.deviceFingerprint } : {}),
    ...(options?.email ? { _email: options.email } : {}),
  });
  if (error) throw new Error(`Could not check your Mia AI allowance: ${error.message}`);
  const r = data as {
    allowed: boolean;
    premium?: boolean;
    trial?: boolean;
    tier?: string;
    reason?: "daily" | "monthly" | "free_limit";
    resets_at?: string;
    used?: number;
    limit?: number;
    remaining?: number;
  } | null;
  if (!r?.allowed) {
    throw new AiLimitError(
      r?.reason ?? "daily",
      r?.resets_at ?? null,
      typeof r?.used === "number" && typeof r?.limit === "number"
        ? { used: r.used, limit: r.limit, remaining: Math.max(0, r.remaining ?? 0) }
        : undefined,
    );
  }
  return {
    allowed: true,
    premium: Boolean(r.premium),
    trial: r.trial,
    tier: r.tier,
    used: r.used,
    limit: r.limit,
    remaining: r.remaining,
  };
}
