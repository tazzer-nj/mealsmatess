export const FREE_MIA_SEARCH_LIMIT = 2;

export const MIA_FREE_LIMIT_ERROR_CODE = "MIA_FREE_LIMIT" as const;

export const MIA_FREE_LIMIT_MESSAGE =
  "You've used your 2 free Mia searches. Start your 3-day free trial to continue chatting with Mia.";

export type MiaQuotaSnapshot = {
  isPremium: boolean;
  trialActive: boolean;
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
};

const FREE_MODE_KEY_PREFIX = "mealmate.free-mode.v1:";
const DEVICE_FP_KEY = "mealmate.device-fp.v1";

export function readLocalFreeMode(userId?: string | null): boolean {
  if (!userId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`${FREE_MODE_KEY_PREFIX}${userId}`) === "1";
  } catch {
    return false;
  }
}

export function writeLocalFreeMode(userId: string, enabled: boolean): void {
  if (!userId || typeof window === "undefined") return;
  try {
    if (enabled) {
      window.localStorage.setItem(`${FREE_MODE_KEY_PREFIX}${userId}`, "1");
    } else {
      window.localStorage.removeItem(`${FREE_MODE_KEY_PREFIX}${userId}`);
    }
  } catch {
    // Storage may be restricted in WebViews
  }
}

export function getClientDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(DEVICE_FP_KEY);
    if (existing && existing.length >= 8) return existing;
    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 24)
        : `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem(DEVICE_FP_KEY, generated);
    return generated;
  } catch {
    return "";
  }
}
