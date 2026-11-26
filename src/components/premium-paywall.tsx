import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChefHat,
  CreditCard,
  Crown,
  ExternalLink,
  Loader2,
  Lock,
  Palette,
  RefreshCw,
  Refrigerator,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
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
import { WhopCheckoutSheet } from "@/components/whop-checkout-sheet";
import { redeemPromoCode } from "@/lib/premium.functions";
import {
  cancelWhopSubscription,
  createWhopCheckoutSession,
  verifyWhopCheckoutCompletion,
  type WhopCheckoutSessionResponse,
} from "@/lib/whop-client";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";

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

function formatDiscountedPriceDisplay(
  plan: Pick<BillingPlan, "price" | "priceAmount">,
  percentOff: number,
): string {
  if (!plan.priceAmount || plan.priceAmount <= 0 || percentOff <= 0) return plan.price;
  const pct = Math.min(99, Math.max(1, Math.round(percentOff)));
  const discounted = Math.max(0.5, Number((plan.priceAmount * (1 - pct / 100)).toFixed(2)));
  const prefix = plan.price.match(/^[^\d\s-]+/)?.[0] ?? "$";
  const hasSpaceAfterPrefix = /^[^\d\s-]+\s+/.test(plan.price);
  const formatted =
    discounted % 1 === 0 && !plan.price.includes(".")
      ? discounted.toFixed(0)
      : discounted.toFixed(2);
  return `${prefix}${hasSpaceAfterPrefix ? " " : ""}${formatted}`;
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

function formatSubscriptionDate(iso: string | null | undefined): string {
  if (!iso) return "Not scheduled";
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "Not scheduled";
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(parsed));
  } catch {
    return new Date(parsed).toDateString();
  }
}

function storeLabel(store: string | null | undefined): string {
  switch ((store ?? "").toLowerCase()) {
    case "whop":
      return "Whop Checkout";
    case "play_store":
      return "Google Play Store";
    case "app_store":
    case "mac_app_store":
      return "Apple App Store";
    case "stripe":
    case "rc_billing":
    case "paddle":
      return "MealMate Web Billing";
    case "admin":
      return "MealMate Admin";
    case "promotional":
      return "Promotional Grant";
    default:
      return "Official Store";
  }
}

function tierLabel(tier: string | null | undefined): string {
  const key = (tier ?? "").toLowerCase();
  if (key.includes("family")) return "Family Premium";
  if (key.includes("month")) return "Monthly Premium";
  if (key.includes("year") || key.includes("annual")) return "Yearly Premium";
  if (key === "admin") return "MealMate Admin";
  return "MealMate Premium";
}

function planMatchesTier(planKind: PlanKind, tier: string | null | undefined): boolean {
  const key = (tier ?? "").toLowerCase();
  if (planKind === "family") return key.includes("family");
  if (planKind === "monthly") return key.includes("month") && !key.includes("family");
  if (planKind === "yearly") return key.includes("year") || key.includes("annual");
  return false;
}

export function PremiumPaywall() {
  const { user, loading: sessionLoading } = useSession();
  const { isPremium, tier, trialActive, entitlement, retry: retryEntitlement } = usePremium();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const routerSearchStr = useRouterState({
    select: (s) => (s as { location?: { searchStr?: string } }).location?.searchStr ?? "",
  });
  const searchParams = useMemo(() => {
    const raw = routerSearchStr || (typeof window !== "undefined" ? window.location.search : "");
    return new URLSearchParams(raw);
  }, [routerSearchStr]);
  const manageRequested = searchParams.get("manage") === "1";
  const initialPromoParam = (searchParams.get("promo") ?? "").trim().toUpperCase();

  const [store, setStore] = useState<BillingStore | null>(null);
  const [selected, setSelected] = useState<PlanKind>("yearly");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState("");
  const [statusNotice, setStatusNotice] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allPlansOpen, setAllPlansOpen] = useState(false);
  const [stage, setStage] = useState<"primary" | "exit">("primary");
  const [closeVisible, setCloseVisible] = useState(false);
  const [exitingFree, setExitingFree] = useState(false);
  const [whopCheckout, setWhopCheckout] = useState<WhopCheckoutSessionResponse | null>(null);
  const [identityActive, setIdentityActive] = useState(false);

  const [promoOpen, setPromoOpen] = useState(Boolean(initialPromoParam));
  const [promoCodeInput, setPromoCodeInput] = useState(initialPromoParam);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentOff: number } | null>(
    null,
  );
  const autoAppliedPromoRef = useRef<string | null>(null);

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
  const showManageView = Boolean(
    userId && (isPremium || identityActive || (manageRequested && entitlement?.isPremium)),
  );

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

  // Emit deduplicated paywall_viewed event (never treated as subscription conversion).
  const paywallViewedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || paywallViewedRef.current === `${userId}:${stage}`) return;
    paywallViewedRef.current = `${userId}:${stage}`;
    void import("@/lib/analytics-events")
      .then(({ dispatchAnalyticsEvent }) =>
        dispatchAnalyticsEvent({
          userId,
          eventName: "paywall_viewed",
          dedupeKey: `paywall_${stage}_${new Date().toISOString().slice(0, 10)}`,
          metadata: { stage, currency },
        }),
      )
      .catch(() => undefined);
  }, [userId, stage, currency]);

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
          if (!userId) {
            // Guest who already completed a checkout before signing in: resume into /auth.
            await routeNext();
            return null;
          }
          setIdentityActive(true);
          void queryClient.invalidateQueries({ queryKey: ["entitlement"] });
          void queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
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
    if (!identity || (!userId && identity.isActive) || loadedCurrencyRef.current === currency)
      return;
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
          void dispatchAnalyticsEvent({
            userId,
            eventName: "subscription_converted",
            dedupeKey: `sub_converted_${access.tier ?? "premium"}`,
            metadata: {
              tier: access.tier ?? null,
              store: access.store ?? null,
              promoCode: appliedPromo?.code ?? null,
            },
          });
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

  const applyPromoCodeValue = useCallback(
    async (rawCode: string) => {
      const normalized = rawCode.trim().toUpperCase();
      if (!normalized || promoBusy || !online) return;
      if (!userId) {
        setPromoFeedback({
          kind: "error",
          text: "Sign in to your MealMate account first to redeem a promo code.",
        });
        return;
      }
      setPromoBusy(true);
      setPromoFeedback(null);
      setMessage("");
      try {
        const result = await redeemPromoCode({ data: { code: normalized } });
        if (result.kind === "percent_discount" && result.percentOff) {
          setAppliedPromo({ code: result.code, percentOff: result.percentOff });
          setPromoCodeInput(result.code);
          setPromoFeedback({
            kind: "success",
            text: result.message,
          });
          return;
        }

        setAppliedPromo(null);
        setPromoFeedback({ kind: "success", text: result.message });
        await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        await retryEntitlement?.();
        await confirm();
      } catch (error) {
        setPromoFeedback({
          kind: "error",
          text:
            error instanceof Error && error.message
              ? error.message
              : "Could not apply that promo code. Double-check the spelling and try again.",
        });
      } finally {
        setPromoBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [online, promoBusy, queryClient, retryEntitlement, userId],
  );

  useEffect(() => {
    if (!initialPromoParam || !userId || sessionLoading) return;
    if (autoAppliedPromoRef.current === `${userId}:${initialPromoParam}`) return;
    autoAppliedPromoRef.current = `${userId}:${initialPromoParam}`;
    setPromoOpen(true);
    setPromoCodeInput(initialPromoParam);
    void applyPromoCodeValue(initialPromoParam);
  }, [applyPromoCodeValue, initialPromoParam, sessionLoading, userId]);

  async function perform(action: "purchase" | "restore" | "verify", overridePlan?: BillingPlan) {
    if (lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    let isWhopSetupError = false;
    try {
      if (action === "purchase") {
        const targetPlan =
          overridePlan ?? store?.plans.find((p) => p.kind === selected) ?? store?.plans[0];
        if (!targetPlan) throw new Error("Selected subscription plan is unavailable.");

        if (userId) {
          void dispatchAnalyticsEvent({
            userId,
            eventName: "subscription_started",
            entityId: targetPlan.id,
            metadata: {
              kind: targetPlan.kind,
              provider: targetPlan.provider ?? store?.provider ?? "revenuecat",
              promoCode: appliedPromo?.code ?? null,
            },
          });
        }

        if (targetPlan.provider === "whop" || store?.provider === "whop") {
          if (!userId) {
            await navigate({ to: "/auth", replace: false });
            return;
          }
          const planKind =
            targetPlan.whopPlanKind ?? (stage === "exit" ? "yearly_exit" : targetPlan.kind);
          isWhopSetupError = true;
          const session = await createWhopCheckoutSession(
            planKind,
            stage === "exit" ? null : (appliedPromo?.code ?? null),
          );
          isWhopSetupError = false;
          setWhopCheckout(session);
          return;
        }

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
          isWhopSetupError && error instanceof Error && error.message
            ? error.message
            : "We couldn’t confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.",
        );
        if (action === "purchase" && !isWhopSetupError) setPendingVerification(true);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function handleWhopCheckoutComplete(paymentId: string, receiptStatus?: string) {
    if (receiptStatus === "canceled") {
      setWhopCheckout(null);
      setMessage("Checkout cancelled. Choose a plan whenever you’re ready.");
      return;
    }
    if (receiptStatus === "failed") {
      setWhopCheckout(null);
      setMessage("Payment failed. Check your card details and try again.");
      return;
    }
    try {
      const access = await verifyWhopCheckoutCompletion(paymentId);
      setWhopCheckout(null);
      if (access.isPremium) {
        if (userId) {
          queryClient.setQueryData(["entitlement", userId], access);
          void dispatchAnalyticsEvent({
            userId,
            eventName: "subscription_converted",
            dedupeKey: `sub_converted_${access.tier ?? "premium"}`,
            metadata: {
              tier: access.tier ?? null,
              store: access.store ?? "whop",
              promoCode: appliedPromo?.code ?? null,
            },
          });
        }
        await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        if (userId) {
          await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        }
        setShowSuccess(true);
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        await routeNext();
        return;
      }
      await confirm();
    } catch {
      setWhopCheckout(null);
      await confirm();
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

  async function handleCancelWhopSubscription() {
    if (cancelling || !online || !userId) return;
    setCancelling(true);
    setMessage("");
    setStatusNotice("");
    try {
      const result = await cancelWhopSubscription();
      queryClient.setQueryData(["entitlement", userId], result.access);
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      setCancelConfirmOpen(false);
      setStatusNotice(
        result.periodEnd
          ? `Auto-renewal turned off. You keep MealMate Premium until ${formatSubscriptionDate(result.periodEnd)}.`
          : "Auto-renewal turned off for your Whop subscription.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not cancel your subscription right now. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  }

  async function handleRefreshStatus() {
    if (busy || !online) return;
    setBusy(true);
    setMessage("");
    setStatusNotice("");
    try {
      const access = userId ? await verifyMyPremium() : await verifyCheckout();
      if (userId) {
        queryClient.setQueryData(["entitlement", userId], access);
      }
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      await retryEntitlement?.();
      setStatusNotice(
        access.isPremium
          ? "Subscription status verified with your billing provider."
          : "No active paid subscription was found on this account.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not refresh subscription status right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  const getMonthlyEquivalent = (target: BillingPlan): string | null => {
    if (target.kind !== "yearly" || !target.priceAmount || target.priceAmount <= 0) return null;
    const monthly = target.priceAmount / 12;
    const prefix = target.price.match(/^[^\d\s-]+/)?.[0] ?? "R";
    return `${prefix} ${monthly.toFixed(0)}/mo`;
  };

  const exitCheckoutPlan = store?.exitOfferPlan ?? yearlyPlan ?? plans[0] ?? null;
  const exitDiscountedDisplay = useMemo(() => {
    if (store?.exitOfferPlan) return store.exitOfferPlan.price;
    const base = yearlyPlan ?? plans[0];
    if (!base?.priceAmount || base.priceAmount <= 0) return null;
    const discounted = (base.priceAmount * 0.8).toFixed(2);
    const prefix = base.price.match(/^[^\d\s-]+/)?.[0] ?? "";
    return `${prefix}${discounted}`;
  }, [plans, store?.exitOfferPlan, yearlyPlan]);
  const effectivePlanPrice = useMemo(() => {
    if (!plan) return "";
    if (!appliedPromo) return plan.price;
    return formatDiscountedPriceDisplay(plan, appliedPromo.percentOff);
  }, [appliedPromo, plan]);

  if (showManageView) {
    const activeTier = entitlement?.tier ?? tier ?? "active";
    const activeStore = entitlement?.store ?? store?.provider ?? null;
    const isWhopSub = (activeStore ?? "").toLowerCase() === "whop";
    const isPlaySub = (activeStore ?? "").toLowerCase() === "play_store";
    const isAppleSub =
      (activeStore ?? "").toLowerCase() === "app_store" ||
      (activeStore ?? "").toLowerCase() === "mac_app_store";
    const isManualGrant = Boolean(entitlement?.isManual);
    const autoRenew = entitlement?.autoRenew !== false;
    const renewalIso = entitlement?.trialActive
      ? (entitlement?.trialEnd ?? entitlement?.periodEnd)
      : entitlement?.periodEnd;
    const statusLabel = entitlement?.trialActive
      ? "Free Trial Active"
      : !autoRenew && entitlement?.periodEnd
        ? "Cancelled · Active until period end"
        : isManualGrant
          ? "Admin / Promotional Access"
          : "Active";

    return (
      <main className="premium-flow paywall paywall-redesign pb-28 sm:pb-20">
        {whopCheckout && (
          <WhopCheckoutSheet
            checkoutConfigId={whopCheckout.checkoutConfigId}
            returnUrl={whopCheckout.returnUrl}
            planTitle={whopCheckout.plan.title}
            priceLabel={`${whopCheckout.plan.price} / ${whopCheckout.plan.period}`}
            trialDays={whopCheckout.plan.trialDays}
            buyerEmail={user?.email}
            onClose={() => setWhopCheckout(null)}
            onComplete={handleWhopCheckoutComplete}
          />
        )}

        <div className="mx-auto w-full max-w-4xl px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-6 sm:pt-6">
          <header className="flex flex-wrap items-center justify-between gap-3 py-2">
            <Link
              to="/settings"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-[#0b1120] px-3.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/30 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <MealMateLogo
              imageClassName="size-8 rounded-xl border border-white/15 bg-white/5"
              showName
              className="text-white"
            />
            <button
              type="button"
              onClick={() => void handleRefreshStatus()}
              disabled={busy || !online}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 bg-[#0b1120] px-3.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              Refresh status
            </button>
          </header>

          {!online && (
            <div
              role="alert"
              className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              You’re offline. Connect to the internet to switch plans, restore purchases, or update
              your subscription.
            </div>
          )}

          {/* Current Subscription Overview */}
          <section
            aria-labelledby="manage-premium-heading"
            className="mt-4 rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-[#0e2618] via-[#0f1c18] to-[#0b1120] p-6 shadow-xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  {statusLabel}
                </div>
                <h1
                  id="manage-premium-heading"
                  className="mt-3 font-display text-3xl font-semibold tracking-tight text-white"
                >
                  {tierLabel(activeTier)}
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Manage your MealMate Premium membership, billing schedule, and plan tier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void perform("restore")}
                disabled={busy || loading || !online || !store}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-40"
              >
                Restore Purchases
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Plan
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white">{tierLabel(activeTier)}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {autoRenew ? "Next Renewal / End" : "Access Ends"}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-white tabular-nums">
                  {isManualGrant
                    ? "Ongoing access"
                    : renewalIso
                      ? formatSubscriptionDate(renewalIso)
                      : "Verified active"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Payment Method &amp; Store
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                  {storeLabel(activeStore)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Trial &amp; Payment Status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-emerald-300">
                  {entitlement?.trialActive || trialActive
                    ? "3-day free trial active"
                    : isManualGrant
                      ? "Complimentary access"
                      : autoRenew
                        ? "Paid · Auto-renew on"
                        : "Paid · Auto-renew off"}
                </dd>
              </div>
            </dl>

            {statusNotice && (
              <p
                role="status"
                className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100"
              >
                {statusNotice}
              </p>
            )}
            {message && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {message}
              </p>
            )}
          </section>

          {/* Upgrade / Downgrade / Plan Pricing in User Currency (ZAR default) */}
          <section aria-labelledby="switch-plan-heading" className="mt-7">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2
                  id="switch-plan-heading"
                  className="text-lg font-semibold tracking-tight text-white"
                >
                  Available plans ({currency})
                </h2>
                <p className="text-xs text-slate-400">
                  Compare Monthly, Yearly, and Family plans or switch your subscription tier.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className="h-20 animate-pulse rounded-2xl border border-white/10 bg-[#0b1120]"
                  />
                ))}
              </div>
            ) : loadError || !store ? (
              <div className="rounded-2xl border border-white/15 bg-[#0b1120] p-5 text-center">
                <p className="text-sm text-slate-300">
                  {loadError ?? "Couldn't load store pricing right now."}
                </p>
                <button
                  type="button"
                  disabled={!online}
                  onClick={() => setAttempt((n) => n + 1)}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#818cf8] px-4 text-xs font-semibold text-[#060913]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry loading plans
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((option) => {
                  const isCurrent = planMatchesTier(option.kind, activeTier);
                  const monthlyEq = getMonthlyEquivalent(option);
                  const isUpgrade =
                    (activeTier.toLowerCase().includes("month") &&
                      (option.kind === "yearly" || option.kind === "family")) ||
                    (activeTier.toLowerCase().includes("year") && option.kind === "family");

                  return (
                    <div
                      key={option.id}
                      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${
                        isCurrent
                          ? "border-emerald-400/50 bg-[#0f2419]"
                          : "border-white/10 bg-[#0b1120]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-white">
                            {planDisplayName(option.kind, option.title)}
                          </span>
                          {isCurrent && (
                            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                              Current plan
                            </span>
                          )}
                          {option.kind === "yearly" && annualSavingsPct !== null && !isCurrent && (
                            <span className="text-xs font-semibold text-[#a5b4fc]">
                              Save {annualSavingsPct}%
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-300">
                          {option.price} / {option.period}
                          {monthlyEq ? ` (${monthlyEq})` : ""} ·{" "}
                          {option.trialDays > 0
                            ? `${option.trialDays}-day free trial for eligible new subscribers`
                            : "Auto-renewing"}
                        </p>
                        {option.billingNote && (
                          <p className="mt-0.5 text-[11px] text-slate-400">{option.billingNote}</p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 text-xs font-semibold text-emerald-200">
                            <Check className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : isManualGrant ? (
                          <span className="text-xs text-slate-400">Managed by admin</span>
                        ) : (
                          <button
                            type="button"
                            disabled={!online || busy}
                            onClick={() => void perform("purchase", option)}
                            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-40"
                          >
                            {isUpgrade ? "Upgrade" : "Switch plan"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Cancel / Store Management Controls */}
          <section
            aria-labelledby="cancel-sub-heading"
            className="mt-7 rounded-3xl border border-white/10 bg-[#0b1120] p-5 sm:p-6"
          >
            <h2 id="cancel-sub-heading" className="text-base font-semibold text-white">
              Manage or cancel subscription
            </h2>
            {isManualGrant ? (
              <p className="mt-1.5 text-sm text-slate-300">
                Your account has MealMate admin or promotional access, so there is no recurring
                store charge to cancel.
              </p>
            ) : isWhopSub ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-slate-300">
                  {autoRenew
                    ? "Cancel anytime. Stopping auto-renewal keeps your Premium access until the end of your current billing period or trial."
                    : `Auto-renewal is already turned off. Your access remains active until ${formatSubscriptionDate(renewalIso)}.`}
                </p>
                {autoRenew &&
                  (!cancelConfirmOpen ? (
                    <button
                      type="button"
                      disabled={!online || cancelling}
                      onClick={() => setCancelConfirmOpen(true)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-400/35 bg-red-500/10 px-4 text-xs font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-40"
                    >
                      Cancel subscription
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-red-400/30 bg-red-500/10 p-3.5">
                      <span className="flex-1 text-xs text-red-100">
                        Stop future renewals for your Whop subscription? You keep access through{" "}
                        {formatSubscriptionDate(renewalIso)}.
                      </span>
                      <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => setCancelConfirmOpen(false)}
                        className="inline-flex min-h-[38px] items-center rounded-xl border border-white/20 px-3 text-xs font-medium text-white"
                      >
                        Keep plan
                      </button>
                      <button
                        type="button"
                        disabled={cancelling}
                        onClick={() => void handleCancelWhopSubscription()}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-red-500 px-3.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {cancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Confirm cancel
                      </button>
                    </div>
                  ))}
              </div>
            ) : isPlaySub ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-slate-300">
                  Google Play manages billing and cancellations for this subscription. Opening
                  Google Play lets you cancel or change renewal settings directly.
                </p>
                <a
                  href="https://play.google.com/store/account/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Open Google Play Subscriptions
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : isAppleSub ? (
              <div className="mt-2 space-y-3">
                <p className="text-sm text-slate-300">
                  Apple App Store manages billing and cancellations for this subscription.
                </p>
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Open Apple Subscriptions
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2.5">
                <a
                  href="https://play.google.com/store/account/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Google Play Subscriptions
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Apple Subscriptions
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link
                  to="/support"
                  className="inline-flex min-h-[42px] items-center rounded-xl border border-white/15 px-4 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Billing support
                </Link>
              </div>
            )}
          </section>

          {/* Benefits Included */}
          <section aria-labelledby="manage-benefits-heading" className="mt-8">
            <h2
              id="manage-benefits-heading"
              className="font-display text-2xl font-semibold tracking-tight text-white"
            >
              Included with your subscription
            </h2>
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
        </div>
      </main>
    );
  }

  const hasTrial = Boolean(plan && plan.trialDays > 0);
  const zeroToday = formatZeroToday(plan?.currencyCode, plan?.price);
  const ctaLabel = pendingVerification
    ? "Check subscription access"
    : hasTrial
      ? "Start my free trial"
      : "Subscribe to Premium";

  if (stage === "exit") {
    const exitHasTrial = Boolean(exitCheckoutPlan && exitCheckoutPlan.trialDays > 0);
    const exitZeroToday = formatZeroToday(exitCheckoutPlan?.currencyCode, exitCheckoutPlan?.price);
    return (
      <main className="premium-flow paywall paywall-redesign pb-44 sm:pb-40">
        {showSuccess && <SuccessAnimation onComplete={() => void routeNext()} />}
        {whopCheckout && (
          <WhopCheckoutSheet
            checkoutConfigId={whopCheckout.checkoutConfigId}
            returnUrl={whopCheckout.returnUrl}
            planTitle={whopCheckout.plan.title}
            priceLabel={`${whopCheckout.plan.price} / ${whopCheckout.plan.period}`}
            trialDays={whopCheckout.plan.trialDays}
            buyerEmail={user?.email}
            appliedPromo={whopCheckout.appliedPromo}
            onClose={() => setWhopCheckout(null)}
            onComplete={handleWhopCheckoutComplete}
          />
        )}

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
      {whopCheckout && (
        <WhopCheckoutSheet
          checkoutConfigId={whopCheckout.checkoutConfigId}
          returnUrl={whopCheckout.returnUrl}
          planTitle={whopCheckout.plan.title}
          priceLabel={`${whopCheckout.plan.price} / ${whopCheckout.plan.period}`}
          trialDays={whopCheckout.plan.trialDays}
          buyerEmail={user?.email}
          appliedPromo={whopCheckout.appliedPromo}
          onClose={() => setWhopCheckout(null)}
          onComplete={handleWhopCheckoutComplete}
        />
      )}

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
                  void import("@/hooks/use-session")
                    .then((m) => m.signOutUnified())
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
                        {option.billingNote && (
                          <p className="mt-0.5 text-[11px] text-slate-400">{option.billingNote}</p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold text-white tabular-nums sm:text-lg">
                        {appliedPromo ? (
                          <>
                            <span>
                              {formatDiscountedPriceDisplay(option, appliedPromo.percentOff)}
                            </span>
                            <span className="ml-1.5 text-xs font-normal text-slate-400 line-through">
                              {option.price}
                            </span>
                          </>
                        ) : (
                          option.price
                        )}
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
                    <span className="font-semibold text-white tabular-nums">
                      {effectivePlanPrice}
                    </span>{" "}
                    per {plan.period} unless cancelled.
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
                    <span className="font-semibold text-white tabular-nums">
                      {effectivePlanPrice}
                    </span>{" "}
                    due today, then renews automatically at{" "}
                    <span className="font-semibold text-white tabular-nums">
                      {effectivePlanPrice}
                    </span>{" "}
                    per {plan.period} unless cancelled. Cancel anytime in your store settings.
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

          {/* Promo Code Entry */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1120] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setPromoOpen((prev) => !prev);
                  setPromoFeedback(null);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#a5b4fc] transition-colors hover:text-white"
              >
                <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{promoOpen ? "Hide promo code" : "Have a promo code?"}</span>
              </button>

              {appliedPromo && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span>
                    {appliedPromo.code} · {appliedPromo.percentOff}% off applied
                  </span>
                  <button
                    type="button"
                    aria-label="Remove promo code"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoFeedback(null);
                      setPromoCodeInput("");
                    }}
                    className="rounded-full p-0.5 text-emerald-200/80 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {promoOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void applyPromoCodeValue(promoCodeInput);
                }}
                className="mt-3 flex flex-col gap-2 sm:flex-row"
              >
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  aria-label="Promo code"
                  maxLength={40}
                  disabled={promoBusy || !online}
                  className="h-11 flex-1 rounded-xl border border-white/15 bg-[#060913] px-3.5 text-sm uppercase tracking-wide text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500 focus:border-[#818cf8] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={promoBusy || !online || promoCodeInput.trim().length < 2}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#818cf8] px-5 text-sm font-semibold text-[#060913] transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {promoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply code"}
                </button>
              </form>
            )}

            {promoFeedback && (
              <p
                role={promoFeedback.kind === "error" ? "alert" : "status"}
                className={`mt-2.5 text-xs font-medium ${
                  promoFeedback.kind === "error" ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {promoFeedback.text}{" "}
                {promoFeedback.kind === "error" && !userId && (
                  <Link to="/auth" className="underline underline-offset-2 hover:text-white">
                    Sign in
                  </Link>
                )}
              </p>
            )}
          </div>

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

          {/* Transparent Free vs Premium Comparison (No fake prices) */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120]">
            <div className="border-b border-white/10 px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold text-white">Compare Free vs MealMate Premium</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Keep cooking with generous free recipes, or unlock Mia&apos;s full kitchen planner.
              </p>
            </div>
            <div className="divide-y divide-white/10 text-xs">
              {[
                {
                  feature: "Curated recipes, ratings & Cookbook collections",
                  free: "Included",
                  premium: "Included",
                },
                {
                  feature: "Mia AI cooking guidance",
                  free: "10 prompts / day",
                  premium: "Unlimited + Voice Mode",
                },
                {
                  feature: "Weekly meal planner & auto grocery lists",
                  free: "Manual planning",
                  premium: "Full AI Plan & Shop + Aisle Sort",
                },
                {
                  feature: "Smart pantry tracking & expiry alerts",
                  free: "—",
                  premium: "Included",
                },
                {
                  feature: "Pricing",
                  free: "Free forever",
                  premium: yearlyPlan
                    ? `${yearlyPlan.price}/${yearlyPlan.period}${annualSavingsPct ? ` (Save ${annualSavingsPct}%)` : ""}`
                    : monthlyPlan
                      ? `${monthlyPlan.price}/${monthlyPlan.period}`
                      : "Live store rate",
                },
              ].map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-2 px-4 py-3 sm:px-5"
                >
                  <span className="font-medium text-slate-200">{row.feature}</span>
                  <span className="text-slate-400">{row.free}</span>
                  <span className="font-semibold text-[#a5b4fc] tabular-nums">{row.premium}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Transparency Footer */}
        <footer className="mt-8 rounded-2xl border border-white/10 bg-[#0b1120] p-4 text-xs leading-relaxed text-slate-400 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
              <Lock size={13} className="text-emerald-400" aria-hidden="true" />
              {store?.provider === "whop"
                ? "Verified Whop checkout & subscription billing"
                : "Verified RevenueCat & store billing"}
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
                  ? `${zeroToday} today · then ${effectivePlanPrice}/${plan.period}`
                  : `${effectivePlanPrice} / ${plan.period}`}
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
                ? `${plan.trialDays}-day free trial, then ${effectivePlanPrice}/${plan.period}. Auto-renews unless cancelled.`
                : `Billed ${effectivePlanPrice} per ${plan.period}. Auto-renews unless cancelled.`}
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
