import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { isHardcodedAdminEmail } from "@/lib/admin-emails";
import { getMyUsage } from "@/lib/premium.functions";
import { verifyMyPremium } from "@/lib/billing.functions";

const LEASE_WINDOW_MS = 5 * 60_000;
const VERIFY_TIMEOUT_MS = 10_000;

function verifyWithTimeout() {
  return Promise.race([
    verifyMyPremium(),
    new Promise<never>((_, reject) =>
      window.setTimeout(
        () => reject(new Error("Subscription verification timed out. Please try again.")),
        VERIFY_TIMEOUT_MS,
      ),
    ),
  ]);
}

export function usePremium() {
  const { user } = useSession();
  const emailAdmin = isHardcodedAdminEmail(user?.email);

  const query = useQuery({
    queryKey: ["entitlement", user?.id ?? "anon"],
    queryFn: () => verifyWithTimeout(),
    enabled: !!user && !emailAdmin,
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
