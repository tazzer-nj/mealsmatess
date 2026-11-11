import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { OnboardingStepContent } from "@/components/onboarding-preferences";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { useSession } from "@/hooks/use-session";
import {
  EMPTY_PREFERENCES,
  type FoodPreferences,
} from "@/lib/preferences";
import { getMyPreferences, saveMyPreferences } from "@/lib/preferences.functions";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboarding-progress";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Personalize MealMate — Onboarding" }] }),
  component: OnboardingPage,
});

const TOTAL_STEPS = 6;

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
      <main className="flex min-h-dvh items-center justify-center bg-[#05070a]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return <PersonalOnboarding key={user.id} userId={user.id} userDisplayName={user.displayName ?? ""} />;
}

function PersonalOnboarding({ userId, userDisplayName }: { userId: string; userDisplayName: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<FoodPreferences>(EMPTY_PREFERENCES);
  const [preferredName, setPreferredName] = useState(userDisplayName || "");
  const [householdSize, setHouseholdSize] = useState("2 people (couple)");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const draft = readOnboardingDraft(userId);
      try {
        const remote = await getMyPreferences();
        if (!active) return;
        if (remote?.onboarding_completed) {
          void navigate({ to: "/premium", replace: true });
          return;
        }
        if (remote) {
          setPrefs({
            ...EMPTY_PREFERENCES,
            ...remote,
          });
          if (remote.meals_per_day) setHouseholdSize(remote.meals_per_day);
        } else if (draft?.preferences) {
          setPrefs({ ...EMPTY_PREFERENCES, ...draft.preferences });
        }
        if (typeof draft?.step === "number") setStep(draft.step);
      } catch {
        if (draft?.preferences) setPrefs({ ...EMPTY_PREFERENCES, ...draft.preferences });
        if (typeof draft?.step === "number") setStep(draft.step);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, navigate]);

  useEffect(() => {
    if (loading) return;
    saveOnboardingDraft(userId, step, prefs);
  }, [userId, step, prefs, loading]);

  function next() {
    if (step === 0 && !preferredName.trim()) {
      toast.error("Please enter your preferred name.");
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    if (started.current || busy) return;
    started.current = true;
    setBusy(true);

    try {
      const finalPrefs: FoodPreferences = {
        ...prefs,
        meals_per_day: householdSize,
        onboarding_completed: true,
      };

      await saveMyPreferences({
        data: {
          ...finalPrefs,
          onboarding_completed: true,
        },
      });

      clearOnboardingDraft(userId);
      await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
      await queryClient.invalidateQueries({ queryKey: ["preferences"] });

      toast.success("Preferences saved!");
      await navigate({ to: "/premium", replace: true });
    } catch (error) {
      started.current = false;
      setBusy(false);
      toast.error(error instanceof Error ? error.message : "Could not finish setup. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#05070a]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <OnboardingLayout
      step={step}
      total={TOTAL_STEPS}
      onBack={step > 0 && !busy ? back : undefined}
      busy={busy}
      footer={
        <button
          type="button"
          className="onboarding-primary-btn"
          disabled={busy}
          onClick={() => void (isLast ? finish() : next())}
        >
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span>{isLast ? "Complete Setup" : "Continue"}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      }
    >
      <OnboardingStepContent
        step={step}
        preferences={prefs}
        preferredName={preferredName}
        onPreferredNameChange={setPreferredName}
        householdSize={householdSize}
        onHouseholdSizeChange={setHouseholdSize}
        onChange={setPrefs}
        disabled={busy}
      />
    </OnboardingLayout>
  );
}
