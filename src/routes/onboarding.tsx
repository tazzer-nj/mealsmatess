import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Personalize MealMate — Onboarding" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <OnboardingWizard key={user.id} userId={user.id} userDisplayName={user.displayName ?? ""} />
  );
}
