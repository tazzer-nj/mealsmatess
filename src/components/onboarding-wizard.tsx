import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { OnboardingStepContent } from "@/components/onboarding-preferences";
import { auth } from "@/lib/firebase";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboarding-progress";
import { EMPTY_PREFERENCES, writeLocalPreferences, type FoodPreferences } from "@/lib/preferences";
import { getMyPreferences, saveMyPreferences } from "@/lib/preferences.functions";

export const DEFAULT_ONBOARDING_STEPS = 6;
const DEFAULT_HOUSEHOLD_SIZE = "2 people (couple)";
const AUTO_SAVE_DEBOUNCE_MS = 600;

export type OnboardingWizardProps = {
  userId: string;
  userDisplayName?: string;
  totalSteps?: number;
  onCompleted?: () => void | Promise<void>;
};

function clampStep(step: number, totalSteps: number) {
  return Math.min(Math.max(0, step), Math.max(0, totalSteps - 1));
}

export function OnboardingWizard({
  userId,
  userDisplayName = "",
  totalSteps = DEFAULT_ONBOARDING_STEPS,
  onCompleted,
}: OnboardingWizardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<FoodPreferences>(EMPTY_PREFERENCES);
  const [preferredName, setPreferredName] = useState(userDisplayName);
  const [householdSize, setHouseholdSize] = useState(DEFAULT_HOUSEHOLD_SIZE);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef({
    step,
    preferences,
    preferredName,
    householdSize,
    loading,
  });

  latestStateRef.current = {
    step,
    preferences,
    preferredName,
    householdSize,
    loading,
  };

  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current !== null) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  const buildPayload = useCallback(
    ({
      targetStep,
      completed,
      overridePrefs,
      base = latestStateRef.current,
    }: {
      targetStep: number;
      completed: boolean;
      overridePrefs?: Partial<FoodPreferences>;
      base?: typeof latestStateRef.current;
    }): FoodPreferences => {
      const trimmedName = base.preferredName.trim() || null;
      return {
        ...base.preferences,
        ...overridePrefs,
        preferred_name: trimmedName,
        meals_per_day: base.householdSize,
        household_size: base.householdSize,
        onboarding_step: targetStep,
        onboarding_completed: completed,
      };
    },
    [],
  );

  const flushPartialToFirestore = useCallback(async () => {
    const current = latestStateRef.current;
    if (
      current.loading ||
      current.preferences.onboarding_completed ||
      !dirtyRef.current ||
      inFlightRef.current
    ) {
      return;
    }

    clearAutoSaveTimer();
    dirtyRef.current = false;

    const payload = buildPayload({
      targetStep: current.step,
      completed: false,
      base: current,
    });

    try {
      await saveMyPreferences({
        data: {
          ...payload,
          onboarding_completed: false,
        },
      });
    } catch {
      // Mark dirty again so the next interaction or step transition retries Firestore sync.
      dirtyRef.current = true;
    }
  }, [buildPayload, clearAutoSaveTimer]);

  const scheduleAutoSave = useCallback(() => {
    dirtyRef.current = true;
    clearAutoSaveTimer();
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      void flushPartialToFirestore();
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [clearAutoSaveTimer, flushPartialToFirestore]);

  // Hydrate multi-step onboarding state from the user's Firestore profile and local draft.
  useEffect(() => {
    let active = true;
    void (async () => {
      const draft = readOnboardingDraft(userId);
      try {
        const remote = await getMyPreferences();
        if (!active) return;

        if (remote?.onboarding_completed) {
          clearOnboardingDraft(userId);
          if (onCompleted) {
            await onCompleted();
          } else {
            await navigate({ to: "/premium", replace: true });
          }
          return;
        }

        const remoteUpdatedAt = remote?.updated_at ?? "";
        const draftUpdatedAt = draft?.preferences.updated_at ?? draft?.savedAt ?? "";
        const draftIsNewer =
          Boolean(draft) &&
          (!remote ||
            (Boolean(draftUpdatedAt) && (!remoteUpdatedAt || draftUpdatedAt > remoteUpdatedAt)));

        const hydratedPrefs: FoodPreferences = {
          ...EMPTY_PREFERENCES,
          ...(remote ?? {}),
          ...(draftIsNewer && draft?.preferences ? draft.preferences : {}),
        };

        setPreferences(hydratedPrefs);

        const restoredName = hydratedPrefs.preferred_name ?? userDisplayName ?? "";
        setPreferredName(restoredName);

        const restoredHousehold =
          hydratedPrefs.household_size ?? hydratedPrefs.meals_per_day ?? DEFAULT_HOUSEHOLD_SIZE;
        setHouseholdSize(restoredHousehold);

        const restoredStep = draftIsNewer ? draft?.step : (remote?.onboarding_step ?? draft?.step);
        if (typeof restoredStep === "number") {
          setStep(clampStep(restoredStep, totalSteps));
        }

        // If local storage captured newer un-synced edits before tab close, sync them up.
        if (remote && draft && draftIsNewer && draftUpdatedAt > remoteUpdatedAt) {
          void saveMyPreferences({
            data: {
              ...hydratedPrefs,
              preferred_name: restoredName.trim() || null,
              meals_per_day: restoredHousehold,
              household_size: restoredHousehold,
              onboarding_step:
                typeof restoredStep === "number" ? clampStep(restoredStep, totalSteps) : 0,
              onboarding_completed: false,
            },
          }).catch(() => {
            dirtyRef.current = true;
          });
        }
      } catch {
        if (!active) return;
        if (draft?.preferences) {
          const restoredPrefs = { ...EMPTY_PREFERENCES, ...draft.preferences };
          setPreferences(restoredPrefs);
          setPreferredName(restoredPrefs.preferred_name ?? userDisplayName ?? "");
          const restoredHousehold =
            restoredPrefs.household_size ?? restoredPrefs.meals_per_day ?? DEFAULT_HOUSEHOLD_SIZE;
          setHouseholdSize(restoredHousehold);
        }
        if (typeof draft?.step === "number") {
          setStep(clampStep(draft.step, totalSteps));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, userDisplayName, totalSteps, navigate, onCompleted]);

  // Keep local draft synchronized for instant same-browser recovery while incomplete.
  useEffect(() => {
    if (loading || preferences.onboarding_completed) return;
    saveOnboardingDraft(userId, step, {
      ...preferences,
      preferred_name: preferredName.trim() || null,
      meals_per_day: householdSize,
      household_size: householdSize,
      onboarding_step: step,
    });
  }, [userId, step, preferences, preferredName, householdSize, loading]);

  // Flush unsaved partial answers to Firestore if the user refreshes or closes the tab/app.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushPartialToFirestore();
      }
    };
    const handlePageHide = () => {
      void flushPartialToFirestore();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      clearAutoSaveTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [clearAutoSaveTimer, flushPartialToFirestore]);

  async function persistStepToFirestore({
    targetStep,
    completed,
    overridePrefs,
  }: {
    targetStep: number;
    completed: boolean;
    overridePrefs?: Partial<FoodPreferences>;
  }): Promise<FoodPreferences | null> {
    if (inFlightRef.current || busy) return null;

    const trimmedName = preferredName.trim();
    if (step === 0 && !trimmedName) {
      const msg = "Please enter your preferred name.";
      setStepError(msg);
      toast.error(msg);
      return null;
    }

    clearAutoSaveTimer();
    dirtyRef.current = false;
    inFlightRef.current = true;
    setBusy(true);
    setSavingStep(true);
    setStepError(null);

    const nextPrefs = buildPayload({
      targetStep,
      completed,
      overridePrefs,
    });

    try {
      await saveMyPreferences({
        data: {
          ...nextPrefs,
          ...(trimmedName ? { preferred_name: trimmedName } : {}),
          onboarding_completed: completed,
        },
      });

      if (trimmedName && auth?.currentUser) {
        try {
          if (auth.currentUser.displayName !== trimmedName) {
            await updateProfile(auth.currentUser, { displayName: trimmedName });
          }
        } catch {
          // Non-blocking: Firestore profile preferences are already saved
        }
      }

      const persistedPrefs: FoodPreferences = {
        ...nextPrefs,
        updated_at: new Date().toISOString(),
      };
      setPreferences(persistedPrefs);

      if (completed) {
        writeLocalPreferences(persistedPrefs);
        clearOnboardingDraft(userId);
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        await queryClient.invalidateQueries({ queryKey: ["preferences"] });
      } else {
        saveOnboardingDraft(userId, targetStep, persistedPrefs);
      }

      return persistedPrefs;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : completed
            ? "Could not finish setup. Please try again."
            : "Could not save your preferences. Please try again.";
      setStepError(message);
      toast.error(message);
      return null;
    } finally {
      inFlightRef.current = false;
      setBusy(false);
      setSavingStep(false);
    }
  }

  async function handleNext() {
    const nextStep = clampStep(step + 1, totalSteps);
    const saved = await persistStepToFirestore({
      targetStep: nextStep,
      completed: false,
    });
    if (saved) {
      setStep(nextStep);
    }
  }

  async function handleSkipStep() {
    const nextStep = clampStep(step + 1, totalSteps);
    const overridePrefs: Partial<FoodPreferences> =
      step === 2 ? { dietary_restrictions: [] } : step === 3 ? { allergies: [] } : {};
    const saved = await persistStepToFirestore({
      targetStep: nextStep,
      completed: false,
      overridePrefs,
    });
    if (saved) {
      setStep(nextStep);
    }
  }

  function handleBack() {
    if (busy || inFlightRef.current) return;
    setStepError(null);
    const prevStep = Math.max(0, step - 1);
    setStep(prevStep);
    latestStateRef.current = { ...latestStateRef.current, step: prevStep };
    scheduleAutoSave();
  }

  async function handleFinish() {
    const saved = await persistStepToFirestore({
      targetStep: clampStep(step, totalSteps),
      completed: true,
    });
    if (!saved) return;

    toast.success("Preferences saved!");
    if (onCompleted) {
      await onCompleted();
    } else {
      await navigate({ to: "/premium", replace: true });
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const isLast = step === totalSteps - 1;

  return (
    <OnboardingLayout
      step={step}
      total={totalSteps}
      onBack={step > 0 && !busy ? handleBack : undefined}
      busy={busy}
      footer={
        <div className="flex w-full flex-col gap-2">
          {stepError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
            >
              {stepError}
            </p>
          )}
          <button
            type="button"
            className="onboarding-primary-btn"
            disabled={busy}
            onClick={() => void (isLast ? handleFinish() : handleNext())}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>
                  {savingStep ? (isLast ? "Finishing setup..." : "Saving...") : "Please wait..."}
                </span>
              </>
            ) : (
              <>
                <span>{isLast ? "Complete Setup" : "Continue"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      }
    >
      <OnboardingStepContent
        step={step}
        preferences={preferences}
        preferredName={preferredName}
        onPreferredNameChange={(value) => {
          setStepError(null);
          setPreferredName(value);
          latestStateRef.current = { ...latestStateRef.current, preferredName: value };
          scheduleAutoSave();
        }}
        householdSize={householdSize}
        onHouseholdSizeChange={(size) => {
          setStepError(null);
          setHouseholdSize(size);
          setPreferences((prev) => {
            const next = {
              ...prev,
              meals_per_day: size,
              household_size: size,
              updated_at: new Date().toISOString(),
            };
            latestStateRef.current = {
              ...latestStateRef.current,
              householdSize: size,
              preferences: next,
            };
            return next;
          });
          scheduleAutoSave();
        }}
        onChange={(nextPrefs) => {
          setStepError(null);
          const stamped: FoodPreferences = {
            ...nextPrefs,
            updated_at: new Date().toISOString(),
          };
          setPreferences(stamped);
          latestStateRef.current = { ...latestStateRef.current, preferences: stamped };
          scheduleAutoSave();
        }}
        onSkipStep={!isLast ? () => void handleSkipStep() : undefined}
        disabled={busy}
      />
    </OnboardingLayout>
  );
}
