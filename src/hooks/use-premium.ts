import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { getMyUsage } from "@/lib/premium.functions";
import { verifyMyPremium } from "@/lib/billing.functions";

export function usePremium() {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ["entitlement", user?.id ?? "anon"],
    queryFn: () => verifyMyPremium(),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  return {
    isPremium:
      !!user && !query.isError && !!query.data?.isPremium && query.data.verifiedUntil > Date.now(),
    tier: query.data?.tier ?? "free",
    trialActive: query.data?.trialActive ?? false,
    entitlement: query.data,
    loading: !!user && query.isPending,
    error: query.error,
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
