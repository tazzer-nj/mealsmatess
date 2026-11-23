import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

import { isHardcodedAdminEmail } from "@/lib/admin-emails";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Personalize MealMate | Onboarding" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth", replace: true });
    } else if (isHardcodedAdminEmail(user.email)) {
      void navigate({ to: "/", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <main className="onboarding-shell flex min-h-dvh items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className="onboarding-frame w-full max-w-xl space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Skeleton className="skeleton-shimmer h-6 w-28 rounded-lg" />
            <Skeleton className="skeleton-shimmer h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="skeleton-shimmer h-2 w-full rounded-full" />
          <div className="space-y-2.5 pt-2">
            <Skeleton className="skeleton-shimmer h-8 w-3/4 rounded-xl" />
            <Skeleton className="skeleton-shimmer h-4 w-1/2 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="skeleton-shimmer h-16 rounded-2xl" />
            <Skeleton className="skeleton-shimmer h-16 rounded-2xl" />
            <Skeleton className="skeleton-shimmer h-16 rounded-2xl" />
            <Skeleton className="skeleton-shimmer h-16 rounded-2xl" />
          </div>
          <Skeleton className="skeleton-shimmer mt-4 h-12 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <OnboardingWizard key={user.id} userId={user.id} userDisplayName={user.displayName ?? ""} />
  );
}
