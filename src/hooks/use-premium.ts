import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { isHardcodedAdminEmail } from "@/lib/admin-emails";
import { getMyUsage } from "@/lib/premium.functions";
import { verifyMyPremium } from "@/lib/billing.functions";

type Entitlement = Awaited<ReturnType<typeof verifyMyPremium>>;

const LEASE_WINDOW_MS = 5 * 60_000;
const VERIFY_TIMEOUT_MS = 10_000;
const LEASE_KEY_PREFIX = "mealmate.entitlement-lease.v1:";

type CachedLease = {
  entitlement: Entitlement;
  cachedAt: number;
};

function readEntitlementLease(userId: string | undefined): CachedLease | undefined {
  if (!userId || typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(`${LEASE_KEY_PREFIX}${userId}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as CachedLease;
    const e = parsed?.entitlement;
    if (!e || !e.isPremium) {
      window.localStorage.removeItem(`${LEASE_KEY_PREFIX}${userId}`);
      return undefined;
    }
    const expiresAt = Math.min(
      Number(e.verifiedUntil || 0),
      Number(parsed.cachedAt || 0) + LEASE_WINDOW_MS,
    );
    if (Date.now() >= expiresAt) {
      window.localStorage.removeItem(`${LEASE_KEY_PREFIX}${userId}`);
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function writeEntitlementLease(userId: string | undefined, entitlement: Entitlement) {
  if (!userId || typeof window === "undefined") return;
  try {
    if (!entitlement.isPremium || entitlement.verifiedUntil <= Date.now()) {
      window.localStorage.removeItem(`${LEASE_KEY_PREFIX}${userId}`);
      return;
    }
    window.localStorage.setItem(
      `${LEASE_KEY_PREFIX}${userId}`,
      JSON.stringify({ entitlement, cachedAt: Date.now() } satisfies CachedLease),
    );
  } catch {
    // Ignore storage errors
  }
}

async function verifyWithTimeout(userId: string | undefined) {
  const result = await Promise.race([
    verifyMyPremium(),
    new Promise<never>((_, reject) =>
      window.setTimeout(
        () => reject(new Error("Subscription verification timed out. Please try again.")),
        VERIFY_TIMEOUT_MS,
      ),
    ),
  ]);
  writeEntitlementLease(userId, result);
  return result;
}

export function usePremium() {
  const { user } = useSession();
  const emailAdmin = isHardcodedAdminEmail(user?.email);
  const cachedLease = !emailAdmin ? readEntitlementLease(user?.id) : undefined;

  const query = useQuery({
    queryKey: ["entitlement", user?.id ?? "anon"],
    queryFn: () => verifyWithTimeout(user?.id),
    enabled: !!user && !emailAdmin,
    initialData: cachedLease?.entitlement,
    initialDataUpdatedAt: cachedLease?.cachedAt,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (user && emailAdmin) {
    return {
      isPremium: true,
      tier: "admin",
      trialActive: false,
      entitlement: {
        isPremium: true,
        tier: "admin",
        status: "active",
        trialActive: false,
        periodEnd: null,
        trialEnd: null,
        store: "admin",
        autoRenew: false,
        isManual: true,
        verifiedUntil: Date.now() + LEASE_WINDOW_MS,
      },
      loading: false,
      error: null,
      retry: query.refetch,
    };
  }

  const withinLease =
    !!query.data?.isPremium &&
    (query.dataUpdatedAt > 0
      ? Date.now() - query.dataUpdatedAt < LEASE_WINDOW_MS
      : query.data.verifiedUntil > Date.now());
  const activePremium = !!user && withinLease;

  return {
    isPremium: activePremium,
    tier: query.data?.tier ?? "free",
    trialActive: query.data?.trialActive ?? false,
    entitlement: query.data,
    loading: !!user && query.isPending,
    // Preserve an active verified 5-minute lease across transient background poll hiccups.
    error: activePremium ? null : query.error,
    retry: query.refetch,
  };
}

export function useUsage() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["usage", user?.id ?? "anon"],
    queryFn: () => getMyUsage(),
    enabled: !!user,
    staleTime: 30_000,
  });
}
