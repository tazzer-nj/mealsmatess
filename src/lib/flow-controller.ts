import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useQuery } from "@tanstack/react-query";
import { getMyPreferences } from "@/lib/preferences.functions";
import { getIntroCompletion } from "@/lib/billing.functions";
import { adminIsAdmin } from "@/lib/premium.functions";
import { isHardcodedAdminEmail } from "@/lib/admin-emails";
import { readClientProfilePreferences } from "@/lib/client-profile-prefs";
import { hasSeenTour } from "@/lib/preferences";

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
  const emailAdmin = isHardcodedAdminEmail(user?.email);
  const access = usePremium();

  const adminQuery = useQuery({
    queryKey: ["admin-flow-access", userId],
    queryFn: () => adminIsAdmin().catch(() => ({ isAdmin: false })),
    enabled: !!userId && !emailAdmin,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAdmin = Boolean(userId && (emailAdmin || adminQuery.data?.isAdmin));

  const userProgress = useQuery({
    queryKey: ["user-flow-progress", userId],
    queryFn: async () => {
      if (!userId) return null;
      const [remotePrefs, introCompleted] = await Promise.all([
        getMyPreferences().catch(() => readClientProfilePreferences(userId)),
        getIntroCompletion().catch(() => hasSeenTour()),
      ]);
      return {
        onboardingCompleted: Boolean(remotePrefs?.onboarding_completed),
        tourCompleted: Boolean(introCompleted),
      };
    },
    enabled: !!userId && !isAdmin,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (sessionLoading) {
    return { state: "loading" as FlowState, user, access, progress: null, isAdmin: false };
  }

  if (!user) {
    return {
      state: "unauthenticated" as FlowState,
      user: null,
      access,
      progress: null,
      isAdmin: false,
    };
  }

  if (isAdmin) {
    return {
      state: "application_ready" as FlowState,
      user,
      access: { ...access, isPremium: true, loading: false, error: null },
      progress: { onboardingCompleted: true, tourCompleted: true, isPremium: true },
      isAdmin: true,
    };
  }

  if (adminQuery.isPending || userProgress.isPending || access.loading) {
    return { state: "loading" as FlowState, user, access, progress: null, isAdmin: false };
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
    isAdmin: false,
  };
}
