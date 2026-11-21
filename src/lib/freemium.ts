export const FREE_MIA_SEARCH_LIMIT = 2;

export const MIA_FREE_LIMIT_ERROR_CODE = "MIA_FREE_LIMIT_REACHED";

export const MIA_FREE_LIMIT_MESSAGE =
  "You’ve used your 2 free Mia searches. Start your 3-day free trial to unlock unlimited Mia!";

export type MiaQuotaSnapshot = {
  isPremium: boolean;
  trialActive: boolean;
  freeUsed: number;
  freeLimit: number;
  freeRemaining: number;
};

const DEVICE_FP_STORAGE_KEY = "mealmate.device.fp.v1";

function hashStringHex(input: string): string {
  // Deterministic 64-bit FNV-1a mix producing a 16-hex token without async WebCrypto dependencies.
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `${part1}${part2}`;
}

/**
 * Generates a stable, non-PII device fingerprint combining persistent token + stable device/browser traits
 * so server-side free quota cannot be bypassed just by clearing cache.
 */
export function getClientDeviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  const traits = [
    typeof navigator !== "undefined" ? navigator.userAgent : "",
    typeof navigator !== "undefined" ? navigator.language : "",
    typeof navigator !== "undefined" ? String(navigator.hardwareConcurrency ?? "") : "",
    typeof screen !== "undefined" ? `${screen.width}x${screen.height}x${screen.colorDepth}` : "",
    (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      } catch {
        return "";
      }
    })(),
  ].join("|");
  const hardwareHash = hashStringHex(traits);

  let storedId = "";
  try {
    storedId = window.localStorage.getItem(DEVICE_FP_STORAGE_KEY) ?? "";
    if (!storedId) {
      storedId = `mm_${hardwareHash}_${hashStringHex(String(Math.random()))}`;
      window.localStorage.setItem(DEVICE_FP_STORAGE_KEY, storedId);
    }
  } catch {
    storedId = `mm_${hardwareHash}`;
  }

  return `${hardwareHash}:${storedId}`.slice(0, 128);
}

export function freeModeStorageKey(userId: string): string {
  return `mealmate.free_mode.${userId}`;
}

export function readLocalFreeMode(userId: string | undefined | null): boolean {
  if (!userId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(freeModeStorageKey(userId)) === "true";
  } catch {
    return false;
  }
}

export function writeLocalFreeMode(userId: string | undefined | null, enabled: boolean): void {
  if (!userId || typeof window === "undefined") return;
  try {
    if (enabled) {
      window.localStorage.setItem(freeModeStorageKey(userId), "true");
    } else {
      window.localStorage.removeItem(freeModeStorageKey(userId));
    }
  } catch {
    // Ignore storage access errors in privacy-restricted webviews
  }
}
