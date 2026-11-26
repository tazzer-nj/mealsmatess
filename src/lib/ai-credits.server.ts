// Server-only: consumes one Mia AI request against the user's plan allowance.
// The counting happens atomically in the database (consume_ai_credit), so the
// limit cannot be bypassed by refreshing, reinstalling or editing app state.

import { MIA_FREE_LIMIT_MESSAGE } from "@/lib/freemium";

export type AiCreditOutcome = {
  allowed: true;
  premium: boolean;
  used?: number;
  limit?: number;
  remaining?: number;
};

export class AiLimitError extends Error {
  constructor(
    public reason: "daily" | "monthly" | "free_limit",
    public resetsAt: string | null,
    public quota?: { used?: number; limit?: number; remaining?: number },
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
        ? MIA_FREE_LIMIT_MESSAGE
        : reason === "daily"
          ? `MEALMATE_LIMIT_AI_DAILY: You've used today's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.`
          : `MEALMATE_LIMIT_AI_MONTHLY: You've used this month's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.`,
    );
  }
}

export async function requireAiCredit(
  userId: string,
  options?: { allowFreeTier?: boolean; deviceFingerprint?: string; email?: string | null },
): Promise<AiCreditOutcome> {
  const { firebaseAdmin } = await import("@/server/firebase-admin");
  const { data, error } = await firebaseAdmin.rpc("consume_ai_credit", {
    _user_id: userId,
    _allow_free_tier: options?.allowFreeTier === true,
    _device_fingerprint: options?.deviceFingerprint ?? null,
    _email: options?.email ?? null,
  });
  if (error) throw new Error(`Could not check your Mia AI allowance: ${error.message}`);
  const r = data as {
    allowed: boolean;
    premium?: boolean;
    reason?: "daily" | "monthly" | "free_limit";
    resets_at?: string | null;
    used?: number;
    limit?: number;
    remaining?: number;
  } | null;
  if (!r?.allowed) {
    throw new AiLimitError(r?.reason ?? "daily", r?.resets_at ?? null, {
      used: r?.used,
      limit: r?.limit,
      remaining: r?.remaining,
    });
  }
  return {
    allowed: true,
    premium: r.premium !== false,
    used: r.used,
    limit: r.limit,
    remaining: r.remaining,
  };
}
