import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import { OnboardingLayout } from "@/components/onboarding-layout";
import {
  OnboardingProcessingView,
  OnboardingResultsView,
  OnboardingStepContent,
  type ProcessingStepItem,
} from "@/components/onboarding-preferences";
import { auth } from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import { type AppLanguageCode } from "@/lib/i18n";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboarding-progress";
import { EMPTY_PREFERENCES, writeLocalPreferences, type FoodPreferences } from "@/lib/preferences";
import { getMyPreferences, saveMyPreferences } from "@/lib/preferences.functions";
import {
  readClientProfilePreferences,
  writeClientProfilePreferences,
} from "@/lib/client-profile-prefs";
import { buildPersonalisationProfile } from "@/lib/personalisation";
import {
  captureInitialAttribution,
  detectClientCountry,
  detectClientPlatform,
  dispatchAnalyticsEvent,
  saveStructuredOnboardingClientFallback,
} from "@/lib/analytics-events";

export const DEFAULT_ONBOARDING_STEPS = 8;
const DEFAULT_HOUSEHOLD_SIZE = "2 people (couple)";
const AUTO_SAVE_DEBOUNCE_MS = 600;

export type OnboardingWizardProps = {
  userId: string;
  userDisplayName?: string;
  totalSteps?: number;
  onCompleted?: () => void | Promise<void>;
};

type WizardPhase = "questions" | "processing" | "results";

const INITIAL_PROCESSING_STEPS: ProcessingStepItem[] = [
  { id: "prefs", label: "Understanding your food preferences", status: "pending" },
  { id: "habits", label: "Learning your cooking habits", status: "pending" },
  { id: "goals", label: "Organising your goals", status: "pending" },
  { id: "recs", label: "Preparing your recommendations", status: "pending" },
  { id: "mia", label: "Personalising Mia", status: "pending" },
];

function clampStep(step: number, totalSteps: number) {
  return Math.min(Math.max(0, step), Math.max(0, totalSteps - 1));
}

export function OnboardingWizard({
  userId,
  userDisplayName = "",
  totalSteps = DEFAULT_ONBOARDING_STEPS,
  onCompleted,
}: OnboardingWizardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<WizardPhase>("questions");
  const [processingSteps, setProcessingSteps] =
    useState<ProcessingStepItem[]>(INITIAL_PROCESSING_STEPS);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<FoodPreferences>(EMPTY_PREFERENCES);
  const [preferredName, setPreferredName] = useState(userDisplayName);
  const [householdSize, setHouseholdSize] = useState(DEFAULT_HOUSEHOLD_SIZE);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const dirtyRef = useRef(false);
  const startedAtRef = useRef<string>(new Date().toISOString());
  const maxPageReachedRef = useRef<number>(1);
  const completedPagesRef = useRef<Set<number>>(new Set());
  const lastViewedPageRef = useRef<number | null>(null);
  const abandonedSentRef = useRef<boolean>(false);
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
      const merged: FoodPreferences = {
        ...base.preferences,
        ...overridePrefs,
        preferred_name: trimmedName,
        meals_per_day: base.householdSize,
        household_size: base.householdSize,
        onboarding_step: targetStep,
        onboarding_completed: completed,
      };
      if (completed) {
        merged.personalisation_profile = buildPersonalisationProfile(merged);
      }
      return merged;
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
    const platform = detectClientPlatform();
    const country = detectClientCountry();

    try {
      await saveMyPreferences({
        data: {
          ...payload,
          onboarding_completed: false,
          platform,
          country,
        },
      });
    } catch {
      const savedDirect = await writeClientProfilePreferences(
        userId,
        {
          ...payload,
          onboarding_completed: false,
        },
        { platform, country },
      ).catch(() => false);
      if (!savedDirect) {
        dirtyRef.current = true;
      }
    }
  }, [userId, buildPayload, clearAutoSaveTimer]);

  const scheduleAutoSave = useCallback(() => {
    dirtyRef.current = true;
    clearAutoSaveTimer();
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      void flushPartialToFirestore();
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [clearAutoSaveTimer, flushPartialToFirestore]);

  const resolvePostOnboardingDestination = useCallback(async (): Promise<"/welcome" | "/premium" | "/"> => {
    try {
      const { verifyMyPremium, getIntroCompletion } = await import("@/lib/billing.functions");
      const access = await verifyMyPremium().catch(() => null);
      if (access?.isPremium) {
        const introDone = await getIntroCompletion().catch(() => false);
        return introDone ? "/" : "/welcome";
      }
    } catch {
      // Fallback to paywall route when entitlement cannot be confirmed
    }
    return "/premium";
  }, []);

  // Hydrate multi-step onboarding state from Firestore + local draft.
  useEffect(() => {
    let active = true;
    const utm = captureInitialAttribution();
    void (async () => {
      const draft = readOnboardingDraft(userId);
      if (draft?.startedAt) startedAtRef.current = draft.startedAt;
      if (typeof draft?.maxPageReached === "number") {
        maxPageReachedRef.current = Math.max(1, draft.maxPageReached);
      }
      if (Array.isArray(draft?.completedPages)) {
        for (const p of draft.completedPages) completedPagesRef.current.add(p);
      }

      try {
        const remote = await getMyPreferences().catch(() => readClientProfilePreferences(userId));
        if (!active) return;

        if (remote?.onboarding_completed) {
          clearOnboardingDraft(userId);
          if (onCompleted) {
            await onCompleted();
          } else {
            const dest = await resolvePostOnboardingDestination();
            await navigate({ to: dest, replace: true });
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

        if (!hydratedPrefs.acquisition && utm) {
          hydratedPrefs.acquisition = {
            self_reported_source: null,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            referrer: utm.referrer,
            captured_at: utm.captured_at,
          };
        }

        setPreferences(hydratedPrefs);

        const restoredName = hydratedPrefs.preferred_name ?? userDisplayName ?? "";
        setPreferredName(restoredName);

        const restoredHousehold =
          hydratedPrefs.household_size ?? hydratedPrefs.meals_per_day ?? DEFAULT_HOUSEHOLD_SIZE;
        setHouseholdSize(restoredHousehold);

        const restoredStep = draftIsNewer ? draft?.step : (remote?.onboarding_step ?? draft?.step);
        if (typeof restoredStep === "number") {
          const clamped = clampStep(restoredStep, totalSteps);
          setStep(clamped);
          maxPageReachedRef.current = Math.max(maxPageReachedRef.current, clamped + 1);
        }

        void dispatchAnalyticsEvent({
          userId,
          eventName: "onboarding_started",
          pageNumber: 1,
          dedupeKey: "start",
          metadata: {
            resumed: typeof restoredStep === "number" && restoredStep > 0,
            resumedPage: typeof restoredStep === "number" ? restoredStep + 1 : 1,
          },
        });

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
  }, [userId, userDisplayName, totalSteps, navigate, onCompleted, resolvePostOnboardingDestination]);

  // Record onboarding_page_viewed on each page transition.
  useEffect(() => {
    if (loading || phase !== "questions") return;
    const pageNum = step + 1;
    maxPageReachedRef.current = Math.max(maxPageReachedRef.current, pageNum);
    if (lastViewedPageRef.current === pageNum) return;
    lastViewedPageRef.current = pageNum;
    void dispatchAnalyticsEvent({
      userId,
      eventName: "onboarding_page_viewed",
      pageNumber: pageNum,
      metadata: { pageNumber: pageNum },
    });
  }, [loading, phase, step, userId]);

  // Synchronize local draft while incomplete.
  useEffect(() => {
    if (loading || preferences.onboarding_completed) return;
    saveOnboardingDraft(
      userId,
      step,
      {
        ...preferences,
        preferred_name: preferredName.trim() || null,
        meals_per_day: householdSize,
        household_size: householdSize,
        onboarding_step: step,
      },
      {
        startedAt: startedAtRef.current,
        maxPageReached: maxPageReachedRef.current,
        completedPages: Array.from(completedPagesRef.current),
      },
    );
  }, [userId, step, preferences, preferredName, householdSize, loading]);

  // Flush partial edits and record onboarding_abandoned when leaving mid-flow.
  useEffect(() => {
    const emitAbandonedIfIncomplete = () => {
      const current = latestStateRef.current;
      if (
        current.loading ||
        current.preferences.onboarding_completed ||
        abandonedSentRef.current
      ) {
        return;
      }
      abandonedSentRef.current = true;
      const pageNum = current.step + 1;
      void dispatchAnalyticsEvent({
        userId,
        eventName: "onboarding_abandoned",
        pageNumber: pageNum,
        dedupeKey: `abandoned_${pageNum}_${new Date().toISOString().slice(0, 10)}`,
        metadata: {
          abandonedPage: pageNum,
          maxPageReached: maxPageReachedRef.current,
        },
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushPartialToFirestore();
        emitAbandonedIfIncomplete();
      }
    };
    const handlePageHide = () => {
      void flushPartialToFirestore();
      emitAbandonedIfIncomplete();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      clearAutoSaveTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [clearAutoSaveTimer, flushPartialToFirestore, userId]);

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
      const msg = t("onboarding.nameRequired");
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
    const platform = detectClientPlatform();
    const country = detectClientCountry();
    const currentPage = step + 1;
    completedPagesRef.current.add(currentPage);

    try {
      const dataPayload: FoodPreferences = {
        ...nextPrefs,
        ...(trimmedName ? { preferred_name: trimmedName } : {}),
        onboarding_completed: completed,
      };
      try {
        await saveMyPreferences({
          data: {
            ...dataPayload,
            platform,
            country,
          },
        });
      } catch (serverErr) {
        const savedDirect = await writeClientProfilePreferences(userId, dataPayload, {
          platform,
          country,
        }).catch(() => false);
        if (!savedDirect) throw serverErr;
      }

      if (trimmedName && auth?.currentUser) {
        try {
          if (auth.currentUser.displayName !== trimmedName) {
            await updateProfile(auth.currentUser, { displayName: trimmedName });
          }
        } catch {
          // Non-blocking: Firestore profile preferences are already saved
        }
      }

      const nowIso = new Date().toISOString();
      const persistedPrefs: FoodPreferences = {
        ...dataPayload,
        updated_at: nowIso,
      };
      setPreferences(persistedPrefs);

      void dispatchAnalyticsEvent({
        userId,
        eventName: "onboarding_page_completed",
        pageNumber: currentPage,
        dedupeKey: `page_done_${currentPage}_${startedAtRef.current.slice(0, 10)}`,
        metadata: { pageNumber: currentPage },
      });

      if (!completed) {
        saveOnboardingDraft(userId, targetStep, persistedPrefs, {
          startedAt: startedAtRef.current,
          maxPageReached: maxPageReachedRef.current,
          completedPages: Array.from(completedPagesRef.current),
        });
        // Non-blocking structured progress sync
        void import("@/lib/analytics-events.functions")
          .then(({ saveStructuredOnboardingState }) =>
            saveStructuredOnboardingState({
              data: {
                preferences: persistedPrefs as unknown as Record<string, unknown>,
                currentPage: targetStep + 1,
                maxPageReached: maxPageReachedRef.current,
                completedPages: Array.from(completedPagesRef.current),
                status: "in_progress",
                startedAt: startedAtRef.current,
                platform,
                country,
              },
            }),
          )
          .catch(() =>
            saveStructuredOnboardingClientFallback({
              userId,
              preferences: persistedPrefs,
              currentPage: targetStep + 1,
              maxPageReached: maxPageReachedRef.current,
              completedPages: Array.from(completedPagesRef.current),
              status: "in_progress",
              startedAt: startedAtRef.current,
              acquisition: persistedPrefs.acquisition,
            }),
          );
      } else {
        writeLocalPreferences(persistedPrefs);
        clearOnboardingDraft(userId);
        queryClient.setQueryData(
          ["user-flow-progress", userId],
          (
            prev: { onboardingCompleted?: boolean; tourCompleted?: boolean } | null | undefined,
          ) => ({
            onboardingCompleted: true,
            tourCompleted: Boolean(prev?.tourCompleted),
          }),
        );
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        await queryClient.invalidateQueries({ queryKey: ["preferences"] });
      }

      return persistedPrefs;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : completed
            ? t("onboarding.finishError")
            : t("onboarding.saveError");
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
    const saved = await persistStepToFirestore({
      targetStep: nextStep,
      completed: false,
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

  function updateProcessingStep(index: number, status: ProcessingStepItem["status"]) {
    setProcessingSteps((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status } : item)),
    );
  }

  async function runBuildPersonalisedExperience() {
    if (inFlightRef.current || busy) return;
    setProcessingError(null);
    setProcessingSteps(
      INITIAL_PROCESSING_STEPS.map((s, idx) => ({
        ...s,
        status: idx === 0 ? "active" : "pending",
      })),
    );
    setPhase("processing");

    // Step 1: Save preferences & mark completed
    const saved = await persistStepToFirestore({
      targetStep: clampStep(step, totalSteps),
      completed: true,
    });
    if (!saved) {
      setProcessingSteps((prev) =>
        prev.map((item, idx) => (idx === 0 ? { ...item, status: "error" } : item)),
      );
      setProcessingError(
        "Could not save your preferences right now. Check your connection and try again.",
      );
      return;
    }
    updateProcessingStep(0, "done");

    const nowIso = new Date().toISOString();
    const durationSec = Math.max(
      1,
      Math.round((Date.parse(nowIso) - Date.parse(startedAtRef.current)) / 1000),
    );
    const platform = detectClientPlatform();
    const country = detectClientCountry();

    // Step 2: Persist structured habits, answers, progress, and immutable attribution
    updateProcessingStep(1, "active");
    try {
      const { saveStructuredOnboardingState } = await import("@/lib/analytics-events.functions");
      await saveStructuredOnboardingState({
        data: {
          preferences: saved as unknown as Record<string, unknown>,
          currentPage: totalSteps,
          maxPageReached: totalSteps,
          completedPages: Array.from({ length: totalSteps }, (_, i) => i + 1),
          status: "completed",
          startedAt: startedAtRef.current,
          completedAt: nowIso,
          completionDurationSeconds: durationSec,
          platform,
          country,
        },
      });
    } catch {
      await saveStructuredOnboardingClientFallback({
        userId,
        preferences: saved,
        currentPage: totalSteps,
        maxPageReached: totalSteps,
        completedPages: Array.from({ length: totalSteps }, (_, i) => i + 1),
        status: "completed",
        startedAt: startedAtRef.current,
        completedAt: nowIso,
        completionDurationSeconds: durationSec,
        acquisition: saved.acquisition,
      });
    }
    updateProcessingStep(1, "done");

    // Step 3: Build & store personalisation profile in preferences
    updateProcessingStep(2, "active");
    const builtProfile = buildPersonalisationProfile(saved);
    const finalPrefs: FoodPreferences = {
      ...saved,
      personalisation_profile: builtProfile,
      onboarding_completed: true,
    };
    setPreferences(finalPrefs);
    writeLocalPreferences(finalPrefs);
    updateProcessingStep(2, "done");

    // Step 4: Pre-warm personalised recipe recommendations in React Query cache
    updateProcessingStep(3, "active");
    try {
      const { trendingRecipesQuery, southAfricanFavoritesQuery } = await import("@/lib/queries");
      await Promise.all([
        queryClient.prefetchQuery(trendingRecipesQuery()).catch(() => undefined),
        queryClient.prefetchQuery(southAfricanFavoritesQuery()).catch(() => undefined),
      ]);
    } catch {
      // Non-blocking prefetch when offline or mocked
    }
    updateProcessingStep(3, "done");

    // Step 5: Finalise Mia personalisation & analytics completion events
    updateProcessingStep(4, "active");
    await Promise.all([
      dispatchAnalyticsEvent({
        userId,
        eventName: "onboarding_completed",
        pageNumber: totalSteps,
        dedupeKey: "completed",
        channel:
          saved.acquisition?.utm_source ?? saved.acquisition?.self_reported_source ?? null,
        metadata: {
          durationSeconds: durationSec,
          selfReportedSource: saved.acquisition?.self_reported_source ?? null,
        },
      }),
      dispatchAnalyticsEvent({
        userId,
        eventName: "personalisation_completed",
        pageNumber: totalSteps,
        dedupeKey: "personalisation_done",
        metadata: {
          recommendedCategories: builtProfile.recommended_categories,
          budgetTier: builtProfile.budget_tier,
          pantryFocus: builtProfile.pantry_focus,
          balancedNutritionSafeguard: builtProfile.balanced_nutrition_safeguard,
        },
      }),
    ]);
    updateProcessingStep(4, "done");

    toast.success(t("onboarding.preferencesSaved"));
    if (onCompleted) {
      await onCompleted();
    } else {
      setPhase("results");
    }
  }

  async function handleResultsContinue() {
    if (busy) return;
    setBusy(true);
    try {
      const dest = await resolvePostOnboardingDestination();
      await navigate({ to: dest, replace: true });
    } finally {
      setBusy(false);
    }
  }

  function handleLanguageChange(nextLang: AppLanguageCode) {
    if (auth?.currentUser?.uid !== userId) return;
    void Promise.resolve(
      firebaseData
        .from("profiles")
        .update({ locale: nextLang } as never)
        .eq("id", userId)
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ["locale", userId] });
          void queryClient.invalidateQueries({ queryKey: ["profile-prefs", userId] });
        }),
    ).catch(() => {
      // Non-blocking: localStorage and active i18n session remain updated.
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (phase === "processing") {
    return (
      <OnboardingLayout
        step={totalSteps - 1}
        total={totalSteps}
        busy={!processingError}
        hideStepCounter
        customMeta={{
          stepName: "Personalising",
          title: "Building your food experience...",
          desc: "MealMate is applying your answers across your home feed, recipes, planner, and Mia.",
        }}
        onBack={processingError ? () => setPhase("questions") : undefined}
        onLanguageChange={handleLanguageChange}
        footer={
          processingError ? (
            <button
              type="button"
              className="onboarding-primary-btn"
              onClick={() => void runBuildPersonalisedExperience()}
            >
              <span>Try again</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div className="flex h-12 items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <Loader2 size={15} className="animate-spin text-[var(--periwinkle)]" />
              <span>Preparing your personalised kitchen...</span>
            </div>
          )
        }
      >
        <OnboardingProcessingView
          steps={processingSteps}
          error={processingError}
          onRetry={() => void runBuildPersonalisedExperience()}
        />
      </OnboardingLayout>
    );
  }

  if (phase === "results") {
    return (
      <OnboardingLayout
        step={totalSteps - 1}
        total={totalSteps}
        busy={busy}
        hideStepCounter
        customMeta={{
          stepName: "Ready",
          title: "Your MealMate experience is ready.",
          desc: "Everything below is now configured around your goals, challenges, and tastes.",
        }}
        onLanguageChange={handleLanguageChange}
        footer={
          <button
            type="button"
            className="onboarding-primary-btn"
            disabled={busy}
            onClick={() => void handleResultsContinue()}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>{t("onboarding.pleaseWait")}</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        }
      >
        <OnboardingResultsView preferences={preferences} />
      </OnboardingLayout>
    );
  }

  const isLast = step === totalSteps - 1;
  const finishLabel = t("onboarding.buildExperience", {
    defaultValue: "Build My MealMate Experience",
  });

  return (
    <OnboardingLayout
      step={step}
      total={totalSteps}
      onBack={step > 0 && !busy ? handleBack : undefined}
      onLanguageChange={handleLanguageChange}
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
            onClick={() => void (isLast ? runBuildPersonalisedExperience() : handleNext())}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>
                  {savingStep
                    ? isLast
                      ? t("onboarding.finishingSetup")
                      : t("onboarding.saving")
                    : t("onboarding.pleaseWait")}
                </span>
              </>
            ) : (
              <>
                <span>{isLast ? finishLabel : t("onboarding.continue")}</span>
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
