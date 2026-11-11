import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useQuery } from "@tanstack/react-query";
import { getMyPreferences } from "@/lib/preferences.functions";
import { getIntroCompletion } from "@/lib/billing.functions";

export type FlowState =
  | "loading"
  | "unauthenticated"
  | "onboarding_required"
  | "paywall_required"
  | "app_tour_required"
  | "application_ready";

export function useFlowController() {
  const { user, loading: sessionLoading } = useSession();
  const userId = user?.id;
  const access = usePremium();

  const userProgress = useQuery({
    queryKey: ["user-flow-progress", userId],
    queryFn: async () => {
      if (!userId) return null;
      const [remotePrefs, introCompleted] = await Promise.all([
        getMyPreferences().catch(() => null),
        getIntroCompletion().catch(() => false),
      ]);
      return {
        onboardingCompleted: Boolean(remotePrefs?.onboarding_completed),
        tourCompleted: Boolean(introCompleted),
      };
    },
    enabled: !!userId,
    staleTime: 10_000,
  });

  if (sessionLoading) {
    return { state: "loading" as FlowState, user, access, progress: null };
  }

  if (!user) {
    return { state: "unauthenticated" as FlowState, user: null, access, progress: null };
  }

  if (userProgress.isPending || access.loading) {
    return { state: "loading" as FlowState, user, access, progress: null };
  }

  const onboardingCompleted = Boolean(userProgress.data?.onboardingCompleted);
  const tourCompleted = Boolean(userProgress.data?.tourCompleted);
  const isPremium = Boolean(access.isPremium);

  let state: FlowState;
  if (!onboardingCompleted) {
    state = "onboarding_required";
  } else if (!isPremium) {
    state = "paywall_required";
  } else if (!tourCompleted) {
    state = "app_tour_required";
  } else {
    state = "application_ready";
  }

  return {
    state,
    user,
    access,
    progress: { onboardingCompleted, tourCompleted, isPremium },
  };
}
