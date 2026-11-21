import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChefHat,
  Crown,
  Loader2,
  Lock,
  Palette,
  RefreshCw,
  Refrigerator,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import {
  createPurchaseSession,
  getIntroCompletion,
  verifyCheckout,
  verifyMyPremium,
} from "@/lib/billing.functions";
import {
  calculateAnnualSavingsPercent,
  formatZeroToday,
  loadBillingStore,
  purchaseIsPending,
  purchaseWasCancelled,
  type BillingPlan,
  type BillingStore,
  type PlanKind,
} from "@/lib/billing-client";
import { useCurrency } from "@/lib/currency";
import { RECIPE_PHOTOS } from "@/assets/recipes/manifest";
import { MealMateLogo } from "@/components/mealmate-logo";
import { SuccessAnimation } from "@/components/success-animation";
import {
  getTrialReminderPreference,
  saveTrialReminderPreference,
} from "@/lib/notifications.functions";
import { enterFreeMode } from "@/lib/preferences.functions";
import { writeLocalFreeMode } from "@/lib/freemium";

const TRIAL_REMINDER_STORAGE_KEY = "mealmate.trial_reminder.v1";

type CollageTile = {
  slug: keyof typeof RECIPE_PHOTOS;
  title: string;
  caption: string;
};

const COLLAGE_TILES: CollageTile[] = [
  { slug: "cape-malay-bobotie", title: "Cape Malay Bobotie", caption: "South African" },
  { slug: "rainbow-buddha-bowl", title: "Rainbow Buddha Bowl", caption: "Healthy" },
  { slug: "fluffy-buttermilk-pancakes", title: "Buttermilk Pancakes", caption: "Breakfast" },
  { slug: "beef-potjiekos", title: "Beef Potjiekos", caption: "Dinner" },
  { slug: "greek-chicken-salad", title: "Greek Chicken Salad", caption: "Fresh" },
  { slug: "creamy-chicken-alfredo", title: "Creamy Chicken Alfredo", caption: "Plated" },
];

const PREMIUM_BENEFITS = [
  {
    icon: Sparkles,
    title: "Personalised recipe discovery",
    description:
      "Recipes tailored to your saved allergies, dietary needs, cuisines and cooking level.",
  },
  {
    icon: CalendarDays,
    title: "Smart meal planning",
    description: "Weekly Breakfast, Lunch, Dinner and Snack plans with reusable weekly templates.",
  },
  {
    icon: Refrigerator,
    title: "Advanced pantry management",
    description:
      "Track ingredients on hand, spot items expiring soon and cut household food waste.",
  },
  {
    icon: ChefHat,
    title: "Mia AI cooking assistant",
    description:
      "Persistent conversation history, smart substitutions and hands-free cooking steps.",
  },
  {
    icon: Search,
    title: "Ingredient-based recipe discovery",
    description:
      "Find dishes you can cook right now using what is already in your fridge or pantry.",
  },
  {
    icon: Camera,
    title: "Kitchen photo & fridge scanning",
    description: "Scan ingredients on your counter to match recipes or add pantry items quickly.",
  },
  {
    icon: ShoppingCart,
    title: "Smart shopping lists",
    description:
      "Consolidated ingredient quantities across 10 grocery aisles with custom aisle order.",
  },
  {
    icon: Palette,
    title: "Premium themes & ad-free cooking",
    description: "Customise MealMate with Obsidian, Aurora and Midnight Pro dark or light themes.",
  },
] as const;

function planDisplayName(kind: PlanKind, fallbackTitle?: string): string {
  if (kind === "yearly") return "Yearly Premium";
  if (kind === "monthly") return "Monthly Premium";
  if (kind === "family") return "Family Premium";
  return fallbackTitle || "MealMate Premium";
}

function formatTrialEndDate(days: number): string {
  const end = new Date(Date.now() + days * 86400_000);
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(end);
  } catch {
    return end.toDateString();
  }
}

function formatReminderDate(days: number): string {
  const offsetDays = days > 1 ? days - 1 : 1;
  const target = new Date(Date.now() + offsetDays * 86400_000);
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      day: "numeric",
      month: "short",
    }).format(target);
  } catch {
    return target.toDateString();
  }
}

function CollagePhotoTile({ tile }: { tile: CollageTile }) {
  const [errored, setErrored] = useState(false);
  const src = RECIPE_PHOTOS[tile.slug]?.card;

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]">
      {errored || !src ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#162241] to-[#0b1120] p-2 text-center">
          <UtensilsCrossed className="h-4 w-4 text-[#818cf8]" aria-hidden="true" />
          <span className="line-clamp-1 text-[10px] font-medium text-slate-300">{tile.title}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={tile.title}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060913]/80 via-[#060913]/15 to-transparent"
      />
      <span className="pointer-events-none absolute bottom-1.5 left-2 right-2 truncate text-[10px] font-medium text-slate-200">
        {tile.caption}
      </span>
    </div>
  );
}

export function PremiumPaywall() {
  const { user, loading: sessionLoading } = useSession();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [store, setStore] = useState<BillingStore | null>(null);
  const [selected, setSelected] = useState<PlanKind>("yearly");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allPlansOpen, setAllPlansOpen] = useState(false);
  const [stage, setStage] = useState<"primary" | "exit">("primary");
  const [closeVisible, setCloseVisible] = useState(false);
  const [exitingFree, setExitingFree] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [reminderWarning, setReminderWarning] = useState<string | null>(null);

  const lock = useRef(false);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const identityRef = useRef<Awaited<ReturnType<typeof createPurchaseSession>> | null>(null);
  const loadedCurrencyRef = useRef<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Google Play compliant "Hide First" delay: fade in icon-only close button after 2.5s (Paywall 1) / 2s (Paywall 2)
  useEffect(() => {
    setCloseVisible(false);
    const delayMs = stage === "primary" ? 2500 : 2000;
    const timer = window.setTimeout(() => setCloseVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [stage]);

  // Load saved trial reminder preference from Firestore (or localStorage if signed out)
  useEffect(() => {
    let active = true;
    try {
      const saved = window.localStorage.getItem(TRIAL_REMINDER_STORAGE_KEY);
      if (saved === "true") setReminderEnabled(true);
    } catch {
      // Ignore storage read failure
    }
    if (!userId) return;
    void getTrialReminderPreference()
      .then((pref) => {
        if (!active) return;
        setReminderEnabled(pref.enabled);
        if (pref.enabled && pref.remindAt) {
          setReminderStatus(
            `Reminder saved (${pref.channel === "push" ? "notifications active" : "account reminder active"}).`,
          );
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [userId]);

  const routeNext = useCallback(async () => {
    if (!userId) {
      await navigate({ to: "/auth", replace: true });
      return;
    }
    const introDone = await getIntroCompletion().catch(() => false);
    if (!introDone) {
      await navigate({ to: "/welcome", replace: true });
    } else {
      await navigate({ to: "/", replace: true });
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
    identityRef.current = null;
    loadedCurrencyRef.current = null;
    setLoading(true);
    setLoadError(null);
    setStore(null);
    setMessage("");

    let timerId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = window.setTimeout(
        () =>
          reject(
            new Error(
              "We couldn’t load subscription plans from RevenueCat right now. Check your connection and try again.",
            ),
          ),
        10_000,
      );
    });

    void Promise.race([
      createPurchaseSession().then(async (identity) => {
        if (!active) return null;
        if (identity.isActive) {
          if (userId) {
            queryClient.setQueryData(["entitlement", userId], {
              isPremium: true,
              tier: "active",
              status: "active",
              trialActive: false,
              periodEnd: null,
              trialEnd: null,
              store: null,
              autoRenew: true,
              isManual: false,
              verifiedUntil: Date.now() + 5 * 60_000,
            });
            await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
            await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
          }
          await routeNext();
          return null;
        }
        const targetCurrency = currencyRef.current;
        const nextStore = await loadBillingStore(identity, targetCurrency);
        if (!active) return null;
        identityRef.current = identity;
        loadedCurrencyRef.current = targetCurrency;
        return nextStore;
      }),
      timeoutPromise,
    ])
      .then((next) => {
        if (!active || !next) return;
        setStore(next);
        setLoadError(null);
        const preferred = next.plans.find((p) => p.kind === "yearly") ?? next.plans[0];
        if (preferred) setSelected(preferred.kind);
      })
      .catch((err) => {
        if (!active) return;
        const raw =
          err instanceof Error && err.message
            ? err.message
            : "Subscription plans are temporarily unavailable. Please try again.";
        setLoadError(raw);
        setStore(null);
      })
      .finally(() => {
        if (timerId !== undefined) window.clearTimeout(timerId);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [userId, sessionLoading, attempt, queryClient, routeNext]);

  useEffect(() => {
    const identity = identityRef.current;
    if (!identity || identity.isActive || loadedCurrencyRef.current === currency) return;
    let active = true;
    loadedCurrencyRef.current = currency;
    void loadBillingStore(identity, currency)
      .then((next) => {
        if (!active) return;
        setStore(next);
        setLoadError(null);
        const preferred =
          next.plans.find((p) => p.kind === selected) ??
          next.plans.find((p) => p.kind === "yearly") ??
          next.plans[0];
        if (preferred) setSelected(preferred.kind);
      })
      .catch((error) => {
        if (!active) return;
        const raw =
          error instanceof Error && error.message
            ? error.message
            : "Could not refresh subscription pricing for your currency.";
        setLoadError(raw);
      });
    return () => {
      active = false;
    };
  }, [currency, selected]);

  const plans = useMemo(() => store?.plans ?? [], [store?.plans]);
  const monthlyPlan = useMemo(() => plans.find((p) => p.kind === "monthly"), [plans]);
  const yearlyPlan = useMemo(() => plans.find((p) => p.kind === "yearly"), [plans]);
  const plan: BillingPlan | undefined = useMemo(
    () => plans.find((p) => p.kind === selected) ?? plans[0],
    [plans, selected],
  );

  const annualSavingsPct = useMemo(
    () => calculateAnnualSavingsPercent(monthlyPlan, yearlyPlan),
    [monthlyPlan, yearlyPlan],
  );

  async function confirm() {
    for (let i = 0; i < 3; i++) {
      const access = userId ? await verifyMyPremium() : await verifyCheckout();
      if (access.isPremium) {
        if (userId) {
          queryClient.setQueryData(["entitlement", userId], access);
        }
        await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        if (userId) {
          await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        }
        const isTest =
          (import.meta as { env?: { MODE?: string } }).env?.MODE === "test" ||
          (typeof process !== "undefined" && process.env.NODE_ENV === "test");
        if (isTest) {
          await routeNext();
          return;
        }
        setShowSuccess(true);
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        await routeNext();
        return;
      }
      if (i < 2) await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }
    setPendingVerification(true);
    setMessage(
      "Your subscription isn’t confirmed yet. If you just completed checkout, tap Check subscription access. You won’t be charged twice.",
    );
  }

  async function perform(action: "purchase" | "restore" | "verify", overridePlan?: BillingPlan) {
    if (lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (action === "purchase") {
        const targetPlan =
          overridePlan ?? store?.plans.find((p) => p.kind === selected) ?? store?.plans[0];
        if (!targetPlan) throw new Error("Selected subscription plan is unavailable.");
        await targetPlan.purchase();
        setPendingVerification(true);
      } else if (action === "restore") {
        if (!store) {
          setMessage("Connect to load store offerings before restoring purchases.");
          return;
        }
        await store.restore();
      }
      await confirm();
    } catch (error) {
      if (purchaseWasCancelled(error)) {
        setMessage("Checkout cancelled. Choose a plan whenever you’re ready.");
      } else if (purchaseIsPending(error)) {
        setPendingVerification(true);
        setMessage(
          "Your payment is pending confirmation from the store. Once completed, tap Check subscription access below.",
        );
      } else {
        setMessage(
          "We couldn’t confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.",
        );
        if (action === "purchase") setPendingVerification(true);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function dismissToFreeMode() {
    if (exitingFree || busy) return;
    setExitingFree(true);
    try {
      if (userId) {
        writeLocalFreeMode(userId, true);
        queryClient.setQueryData(
          ["user-flow-progress", userId],
          (
            prev: { onboardingCompleted?: boolean; tourCompleted?: boolean } | null | undefined,
          ) => ({
            onboardingCompleted: prev?.onboardingCompleted ?? true,
            tourCompleted: prev?.tourCompleted ?? false,
            freeModeEntered: true,
          }),
        );
        await enterFreeMode().catch(() => undefined);
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
      }
      await navigate({ to: "/", replace: true });
    } finally {
      setExitingFree(false);
    }
  }

  async function handleToggleReminder() {
    if (reminderBusy) return;
    const next = !reminderEnabled;
    setReminderBusy(true);
    setReminderWarning(null);
    setReminderStatus(null);

    const activeTrialDays = plan?.trialDays ?? 0;

    if (!next) {
      try {
        window.localStorage.setItem(TRIAL_REMINDER_STORAGE_KEY, "false");
      } catch {
        // Ignore storage error
      }
      if (userId) {
        try {
          await saveTrialReminderPreference({
            data: { enabled: false, planId: plan?.id ?? null, trialDays: 0, channel: "none" },
          });
        } catch {
          setReminderWarning("Could not update your reminder setting on the server.");
          setReminderBusy(false);
          return;
        }
      }
      setReminderEnabled(false);
      setReminderStatus("Trial reminder turned off.");
      setReminderBusy(false);
      return;
    }

    // Turning reminder ON: check real notification capability/permission before promising push delivery
    let channel: "push" | "in_app" = "in_app";
    if (typeof window !== "undefined" && "Notification" in window) {
      if (window.Notification.permission === "denied") {
        setReminderEnabled(false);
        setReminderWarning(
          "Notifications are blocked in your browser or device settings. Enable notifications first to receive a reminder before your trial ends.",
        );
        setReminderBusy(false);
        return;
      }
      if (window.Notification.permission === "default") {
        try {
          const permission = await window.Notification.requestPermission();
          if (permission !== "granted") {
            setReminderEnabled(false);
            setReminderWarning(
              "Notification permission was not granted, so we couldn’t schedule a push reminder.",
            );
            setReminderBusy(false);
            return;
          }
          channel = "push";
        } catch {
          // Non-browser environment without prompt support
        }
      } else if (window.Notification.permission === "granted") {
        channel = "push";
      }
    }

    // Best-effort browser push token registration if VAPID is configured
    if (channel === "push" && userId && import.meta.env.VITE_FIREBASE_VAPID_KEY) {
      try {
        const { requestBrowserPushToken } = await import("@/lib/push-client");
        const { registerMyPushToken } = await import("@/lib/notifications.functions");
        const token = await requestBrowserPushToken();
        await registerMyPushToken({ data: { token } });
      } catch {
        // Keep saving account reminder record if web push registration isn't available in current context
      }
    }

    if (userId) {
      try {
        await saveTrialReminderPreference({
          data: {
            enabled: true,
            planId: plan?.id ?? null,
            trialDays: activeTrialDays,
            channel,
          },
        });
      } catch {
        setReminderEnabled(false);
        setReminderWarning(
          "We couldn’t save your reminder preference right now. Please try again.",
        );
        setReminderBusy(false);
        return;
      }
    }

    try {
      window.localStorage.setItem(TRIAL_REMINDER_STORAGE_KEY, "true");
    } catch {
      // Ignore storage error
    }

    setReminderEnabled(true);
    setReminderStatus(
      activeTrialDays > 0
        ? `Reminder saved for ${formatReminderDate(activeTrialDays)} (before your ${activeTrialDays}-day trial ends).`
        : "Reminder preference saved for your account.",
    );
    setReminderBusy(false);
  }

  const getMonthlyEquivalent = (target: BillingPlan): string | null => {
    if (target.kind !== "yearly" || !target.priceAmount || target.priceAmount <= 0) return null;
    const monthly = target.priceAmount / 12;
    const prefix = target.price.match(/^[^\d\s-]+/)?.[0] ?? "R";
    return `${prefix} ${monthly.toFixed(0)}/mo`;
  };

  const hasTrial = Boolean(plan && plan.trialDays > 0);
  const zeroToday = formatZeroToday(plan?.currencyCode, plan?.price);
  const ctaLabel = pendingVerification
    ? "Check subscription access"
    : hasTrial
      ? "Start my free trial"
      : "Subscribe to Premium";

  const exitCheckoutPlan = store?.exitOfferPlan ?? yearlyPlan ?? plans[0] ?? null;
  const exitDiscountedDisplay = useMemo(() => {
    if (store?.exitOfferPlan) return store.exitOfferPlan.price;
    const base = yearlyPlan ?? plans[0];
    if (!base?.priceAmount || base.priceAmount <= 0) return null;
    const discounted = (base.priceAmount * 0.8).toFixed(2);
    const prefix = base.price.match(/^[^\d\s-]+/)?.[0] ?? "";
    return `${prefix}${discounted}`;
  }, [plans, store?.exitOfferPlan, yearlyPlan]);

  if (stage === "exit") {
    const exitHasTrial = Boolean(exitCheckoutPlan && exitCheckoutPlan.trialDays > 0);
    const exitZeroToday = formatZeroToday(exitCheckoutPlan?.currencyCode, exitCheckoutPlan?.price);
    return (
      <main className="premium-flow paywall paywall-redesign pb-44 sm:pb-40">
        {showSuccess && <SuccessAnimation onComplete={() => void routeNext()} />}

        <div className="paywall-exit-slide mx-auto w-full max-w-2xl px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6 sm:pt-8">
          <header className="flex items-center justify-between gap-4 py-2">
            <MealMateLogo
              imageClassName="size-8 rounded-xl border border-white/15 bg-white/5"
              showName
              className="text-white"
            />
            <div className="flex min-h-[44px] items-center gap-2">
              {closeVisible && (
                <button
                  type="button"
                  aria-label="Continue with limited free mode"
                  disabled={exitingFree || busy}
                  onClick={() => void dismissToFreeMode()}
                  className="paywall-close-fade flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-[#0b1120]/90 text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </header>

          <section
            aria-labelledby="exit-offer-heading"
            className="mt-4 overflow-hidden rounded-3xl border border-[#818cf8]/40 bg-gradient-to-b from-[#131d3b] via-[#0b1120] to-[#060913] p-6 sm:p-8"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#818cf8]/40 bg-[#818cf8]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#a5b4fc]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              20% Off Year 1
            </div>

            <h1
              id="exit-offer-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-4xl"
            >
              Wait — take 20% off Year 1
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Unlock unlimited Mia AI kitchen coaching, weekly meal planning, food photo scanning,
              and personalised recipes before you go.
            </p>

            {exitCheckoutPlan ? (
              <div className="mt-6 rounded-2xl border border-[#818cf8]/50 bg-[#0b1120]/90 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {planDisplayName(exitCheckoutPlan.kind, exitCheckoutPlan.title)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-300">
                      {exitHasTrial
                        ? `Includes ${exitCheckoutPlan.trialDays}-day free trial · Cancel anytime`
                        : "Introductory annual savings · Cancel anytime"}
                    </p>
                  </div>
                  <div className="text-right">
                    {exitDiscountedDisplay && (
                      <div className="text-2xl font-bold text-white tabular-nums">
                        {exitDiscountedDisplay}
                        <span className="text-xs font-normal text-slate-400">
                          {" "}
                          / {exitCheckoutPlan.period}
                        </span>
                      </div>
                    )}
                    {yearlyPlan && !store?.exitOfferPlan && (
                      <div className="text-xs text-slate-400 tabular-nums">
                        <span className="line-through">{yearlyPlan.price}</span> standard rate · 20%
                        off reference
                      </div>
                    )}
                    {store?.exitOfferPlan && yearlyPlan && (
                      <div className="text-xs text-slate-400 line-through tabular-nums">
                        {yearlyPlan.price} / {yearlyPlan.period}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3.5 text-xs leading-relaxed text-slate-300">
                  {exitHasTrial ? (
                    <span>
                      Pay <strong className="text-white">{exitZeroToday}</strong> today. Your{" "}
                      {exitCheckoutPlan.trialDays}-day trial ends on{" "}
                      <strong className="text-white">
                        {formatTrialEndDate(exitCheckoutPlan.trialDays)}
                      </strong>
                      , then bills <strong className="text-white">{exitCheckoutPlan.price}</strong>{" "}
                      per {exitCheckoutPlan.period} unless cancelled in store settings.
                    </span>
                  ) : (
                    <span>
                      Billed through your official store account at{" "}
                      <strong className="text-white">{exitCheckoutPlan.price}</strong> per{" "}
                      {exitCheckoutPlan.period} unless cancelled.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1120] p-5 text-sm text-slate-300">
                Live store pricing couldn’t be loaded right now. You can retry loading plans or
                dismiss to explore MealMate’s Dining features.
              </div>
            )}

            <ul className="mt-6 space-y-2.5 text-sm text-slate-200">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                Unlimited Mia AI chef &amp; voice cooking guidance
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                Automated weekly meal plans &amp; aisle-sorted grocery lists
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                Kitchen fridge scanning &amp; full pantry tracking
              </li>
            </ul>

            {message && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
              >
                {message}
              </p>
            )}
          </section>
        </div>

        <div className="paywall-sticky-dock">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              className="paywall-cta"
              disabled={!online || busy || !exitCheckoutPlan}
              onClick={() =>
                void perform(
                  pendingVerification ? "verify" : "purchase",
                  exitCheckoutPlan ?? undefined,
                )
              }
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>
                    {pendingVerification
                      ? "Check subscription access"
                      : exitHasTrial
                        ? "Claim 20% off Year 1 + Free Trial"
                        : "Claim 20% off Year 1"}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="premium-flow paywall paywall-redesign pb-44 sm:pb-40">
      {showSuccess && <SuccessAnimation onComplete={() => void routeNext()} />}

      <div className="mx-auto w-full max-w-4xl px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
        {/* Top Utility Bar */}
        <header className="flex items-center justify-between gap-4 py-2">
          <MealMateLogo
            imageClassName="size-8 rounded-xl border border-white/15 bg-white/5"
            showName
            className="text-white"
          />
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void perform("restore")}
              disabled={busy || loading || !online || !store}
              className="min-h-[44px] px-2 text-xs font-medium text-slate-300 underline underline-offset-4 transition-colors hover:text-white disabled:opacity-40"
            >
              Restore Purchases
            </button>
            {userId ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void import("@/lib/firebase")
                    .then((m) => m.signOutUser())
                    .catch(() => undefined)
                    .finally(() => {
                      queryClient.clear();
                      void navigate({ to: "/auth", replace: true });
                    });
                }}
                className="min-h-[44px] px-2 text-xs font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-40"
              >
                Switch account
              </button>
            ) : (
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="inline-flex min-h-[44px] items-center px-2 text-xs font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
            )}
            {closeVisible && (
              <button
                type="button"
                aria-label="Close offer"
                disabled={busy}
                onClick={() => {
                  setMessage("");
                  setStage("exit");
                }}
                className="paywall-close-fade flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-[#0b1120]/90 text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </header>

        {/* Hero Section: Horizontal Food Photography Collage + Editorial Heading */}
        <section className="relative mt-2 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] p-4 sm:p-6">
          <div className="paywall-collage-track">
            {COLLAGE_TILES.map((tile) => (
              <CollagePhotoTile key={tile.slug} tile={tile} />
            ))}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none -mt-12 h-12 bg-gradient-to-t from-[#0b1120] to-transparent"
          />

          <div className="relative mt-1 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a5b4fc]">
              MealMate Premium
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white [text-wrap:balance] sm:text-5xl">
              Make every meal count.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Discover recipes, plan your meals, organise your kitchen and enjoy smarter cooking
              with MealMate Premium.
            </p>
          </div>
        </section>

        {/* Subscription Options + Trial Clarity */}
        <section aria-labelledby="paywall-plans-heading" className="mt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="paywall-plans-heading"
              className="text-lg font-semibold tracking-tight text-white sm:text-xl"
            >
              Choose your plan
            </h2>
            {plans.length > 0 && (
              <button
                type="button"
                onClick={() => setAllPlansOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[#a5b4fc] underline underline-offset-4 transition-colors hover:text-white"
              >
                View all plans
              </button>
            )}
          </div>

          {!online && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              You’re offline. Connect to the internet to load live pricing, start a subscription, or
              restore purchases.
            </div>
          )}

          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Loading subscription plans">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-20 animate-pulse rounded-2xl border border-white/10 bg-[#0b1120]"
                />
              ))}
            </div>
          ) : loadError || !store ? (
            <div
              role="alert"
              className="rounded-2xl border border-white/15 bg-[#0b1120] p-5 text-center"
            >
              <Crown className="mx-auto h-7 w-7 text-[#818cf8]" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-white">
                Subscription plans unavailable
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-300">
                {loadError ??
                  "We couldn’t retrieve live subscription offerings from RevenueCat. Please try again."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  disabled={!online}
                  onClick={() => setAttempt((n) => n + 1)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#818cf8] px-5 text-sm font-semibold text-[#060913] transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Retry loading plans
                </button>
              </div>
            </div>
          ) : (
            <fieldset className="space-y-3" disabled={busy}>
              <legend className="sr-only">Choose a MealMate Premium subscription plan</legend>
              {plans.map((option) => {
                const isSelected = plan?.kind === option.kind;
                const monthlyEq = getMonthlyEquivalent(option);
                const showYearlyBadge = option.kind === "yearly" && annualSavingsPct !== null;

                return (
                  <label
                    key={option.id}
                    className={`paywall-plan-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelected(option.kind)}
                  >
                    <input
                      type="radio"
                      name="subscription"
                      value={option.kind}
                      checked={isSelected}
                      onChange={() => setSelected(option.kind)}
                    />

                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-[#818cf8] bg-[#818cf8] text-[#060913]"
                            : "border-slate-500 bg-transparent"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-base font-semibold text-white">
                            {planDisplayName(option.kind, option.title)}
                          </span>
                          {showYearlyBadge && (
                            <span className="text-xs font-semibold tracking-wide text-[#a5b4fc]">
                              · BEST VALUE · Save {annualSavingsPct}%
                            </span>
                          )}
                          {option.kind === "family" && (
                            <span className="text-xs text-slate-400">· Household sharing</span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-300">
                          {option.trialDays > 0 ? (
                            <span className="font-medium text-emerald-300">
                              {option.trialDays}-day free trial available
                            </span>
                          ) : (
                            <span>Billed every {option.period} · Cancel anytime</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold text-white tabular-nums sm:text-lg">
                        {option.price}
                        <span className="text-xs font-normal text-slate-400">
                          {" "}
                          / {option.period}
                        </span>
                      </div>
                      {monthlyEq && (
                        <div className="text-xs font-medium text-[#a5b4fc] tabular-nums">
                          {monthlyEq}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </fieldset>
          )}

          {/* Honest Trial Explanation Card */}
          {plan && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1120] p-4 sm:p-5">
              {plan.trialDays > 0 ? (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-[#818cf8]" aria-hidden="true" />
                    <span>Start your {plan.trialDays}-day free trial.</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    Pay <span className="font-semibold text-white tabular-nums">{zeroToday}</span>{" "}
                    today. After your trial ends on{" "}
                    <span className="font-semibold text-white">
                      {formatTrialEndDate(plan.trialDays)}
                    </span>
                    , your subscription renews at{" "}
                    <span className="font-semibold text-white tabular-nums">{plan.price}</span> per{" "}
                    {plan.period} unless cancelled.
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Cancel at least 24 hours before renewal in Google Play Subscriptions, Apple
                    Account Settings, or MealMate Profile.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-[#818cf8]" aria-hidden="true" />
                    <span>Transparent billing from day one</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    <span className="font-semibold text-white tabular-nums">{plan.price}</span> due
                    today, then renews automatically at{" "}
                    <span className="font-semibold text-white tabular-nums">{plan.price}</span> per{" "}
                    {plan.period} unless cancelled. Cancel anytime in your store settings.
                  </p>
                </div>
              )}

              {/* Optional Trial Reminder Toggle */}
              {plan.trialDays > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#a5b4fc]" aria-hidden="true" />
                      <div>
                        <label
                          htmlFor="trial-reminder-toggle"
                          className="block cursor-pointer text-sm font-medium text-white"
                        >
                          Remind me before my trial ends.
                        </label>
                        <p className="text-xs text-slate-400">
                          We’ll send a reminder before renewal when notifications are enabled.
                        </p>
                      </div>
                    </div>

                    <button
                      id="trial-reminder-toggle"
                      type="button"
                      role="switch"
                      aria-checked={reminderEnabled}
                      aria-label="Remind me before my trial ends."
                      disabled={reminderBusy}
                      onClick={() => void handleToggleReminder()}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#818cf8] disabled:opacity-50 ${
                        reminderEnabled
                          ? "border-[#818cf8] bg-[#818cf8]"
                          : "border-white/20 bg-slate-800"
                      }`}
                    >
                      <span
                        className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                          reminderEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {reminderStatus && (
                    <p className="mt-2 text-xs font-medium text-emerald-300">{reminderStatus}</p>
                  )}
                  {reminderWarning && (
                    <p role="alert" className="mt-2 text-xs font-medium text-amber-300">
                      {reminderWarning}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {message && (
            <p
              role="status"
              className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200"
            >
              {message}
            </p>
          )}
        </section>

        {/* Premium Benefits Section */}
        <section aria-labelledby="paywall-benefits-heading" className="mt-8">
          <h2
            id="paywall-benefits-heading"
            className="font-display text-2xl font-semibold tracking-tight text-white"
          >
            Everything included with MealMate Premium
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Practical everyday cooking tools designed around your preferences and kitchen.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PREMIUM_BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0b1120] p-4"
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--periwinkle-soft)] text-[#a5b4fc]">
                    <Icon size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust & Transparency Footer */}
        <footer className="mt-8 rounded-2xl border border-white/10 bg-[#0b1120] p-4 text-xs leading-relaxed text-slate-400 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <Lock size={13} className="text-emerald-400" aria-hidden="true" />
              Verified RevenueCat & store billing
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
              <button
                type="button"
                onClick={() => void perform("restore")}
                disabled={busy || loading || !online || !store}
                className="font-medium underline underline-offset-4 hover:text-white disabled:opacity-40"
              >
                Restore Purchases
              </button>
              <Link to="/legal/terms" className="underline underline-offset-4 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/legal/privacy" className="underline underline-offset-4 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/support" className="underline underline-offset-4 hover:text-white">
                Help &amp; Manage Subscription
              </Link>
            </div>
          </div>

          <p className="mt-3">
            Subscriptions automatically renew for the selected billing period at the stated rate
            unless cancelled at least 24 hours before the end of the current period or free trial.
            You can manage or cancel your subscription anytime in Google Play Store, Apple App
            Store, or your MealMate account settings.
          </p>
        </footer>
      </div>

      {/* Persistent Bottom Sticky Purchase Panel */}
      <div className="paywall-sticky-dock">
        <div className="mx-auto max-w-4xl">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <Lock size={12} className="text-[#818cf8]" aria-hidden="true" />
              Secure subscription. Manage or cancel anytime.
            </span>
            {plan && (
              <span className="font-medium text-white tabular-nums">
                {hasTrial
                  ? `${zeroToday} today · then ${plan.price}/${plan.period}`
                  : `${plan.price} / ${plan.period}`}
              </span>
            )}
          </div>

          <button
            type="button"
            className="paywall-cta"
            disabled={
              !online || busy || (!pendingVerification && (loading || !plan || Boolean(loadError)))
            }
            onClick={() => void perform(pendingVerification ? "verify" : "purchase")}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{ctaLabel}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>

          {plan && (
            <p className="mt-1.5 text-center text-[11px] text-slate-400">
              {hasTrial
                ? `${plan.trialDays}-day free trial, then ${plan.price}/${plan.period}. Auto-renews unless cancelled.`
                : `Billed ${plan.price} per ${plan.period}. Auto-renews unless cancelled.`}
            </p>
          )}
        </div>
      </div>

      {/* View All Plans Comparison Modal */}
      {allPlansOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-plans-title"
          onClick={() => setAllPlansOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl border border-white/15 bg-[#0b1120] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h2 id="all-plans-title" className="text-lg font-semibold text-white">
                  All MealMate Premium plans
                </h2>
                <p className="text-xs text-slate-400">
                  Live pricing from RevenueCat offering ({store?.offeringId ?? "default"})
                </p>
              </div>
              <button
                type="button"
                aria-label="Close all plans"
                onClick={() => setAllPlansOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/15 bg-[#111a2e] text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {plans.map((option) => {
                const isSelected = plan?.kind === option.kind;
                const monthlyEq = getMonthlyEquivalent(option);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelected(option.kind);
                      setAllPlansOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[#818cf8] bg-[#162040]"
                        : "border-white/10 bg-[#0f172a] hover:border-white/25"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {planDisplayName(option.kind, option.title)}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-semibold text-[#a5b4fc]">· Selected</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-300">
                        {option.trialDays > 0
                          ? `${option.trialDays}-day free trial · Then ${option.price}/${option.period}`
                          : `Billed every ${option.period} · No trial`}
                      </p>
                      {option.productId && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Product ID: {option.productId}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold text-white tabular-nums">
                        {option.price}
                      </div>
                      <div className="text-[11px] text-slate-400">per {option.period}</div>
                      {monthlyEq && (
                        <div className="text-[11px] font-medium text-[#a5b4fc] tabular-nums">
                          {monthlyEq}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
