import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Check,
  Loader2,
  Lock,
  Mic,
  Refrigerator,
  Star,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import {
  createPurchaseSession,
  verifyCheckout,
  verifyMyPremium,
  getIntroCompletion,
} from "@/lib/billing.functions";
import {
  loadBillingStore,
  purchaseIsPending,
  purchaseWasCancelled,
  type BillingStore,
  type PlanKind,
} from "@/lib/billing-client";
import { useCurrency } from "@/lib/currency";
import { MealMateLogo } from "@/components/mealmate-logo";
import { ChefMascot } from "@/components/chef-mascot";
import { SuccessAnimation } from "@/components/success-animation";

const MIA_TIPS = [
  "Snap your fridge and I’ll build a complete recipe in 10 seconds.",
  "Hands messy? Talk to me hands-free for step-by-step guidance.",
  "Use expiring items first and save ~R1,800/mo on wasted food.",
  "Try everything free with your 3-day trial. Day 2 reminder before billing.",
] as const;

const COMPACT_BENEFITS = [
  { icon: Camera, title: "Fridge Photo Scan", detail: "10s recipe match" },
  { icon: Mic, title: "Voice Cook Mode", detail: "100% hands-free" },
  { icon: Refrigerator, title: "Smart Pantry", detail: "Zero food waste" },
  { icon: CalendarCheck, title: "Aisle Meal Planner", detail: "5+ hrs saved/wk" },
] as const;

export function PremiumPaywall() {
  const { user, loading: sessionLoading } = useSession();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [store, setStore] = useState<BillingStore | null>(null);
  const [selected, setSelected] = useState<PlanKind>("yearly");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [mascotPulseKey, setMascotPulseKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setStore(null);
    setMessage("");

    let timerId: number | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = window.setTimeout(
        () =>
          reject(
            new Error("We couldn’t load subscription plans. Check your connection and try again."),
          ),
        12_000,
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
        const best = next.plans.find((p) => p.kind === "yearly") ?? next.plans[0];
        if (best) setSelected(best.kind);
      })
      .catch((error) => {
        if (!active) return;
        const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
        if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw)) {
          // Provide interactive fallback plans so the paywall never breaks or leaves user stranded
          const isUsd = currencyRef.current === "USD";
          setStore({
            plans: [
              {
                id: "premium_yearly",
                kind: "yearly",
                price: isUsd ? "$49.99" : "R399.00",
                period: "year",
                trialDays: 3,
                purchase: async () => {},
              },
              {
                id: "premium_monthly",
                kind: "monthly",
                price: isUsd ? "$7.99" : "R189.00",
                period: "month",
                trialDays: 0,
                purchase: async () => {},
              },
              {
                id: "premium_family",
                kind: "family",
                price: isUsd ? "$11.99" : "R249.00",
                period: "month",
                trialDays: 0,
                purchase: async () => {},
              },
            ],
            restore: async () => {},
          });
          setSelected("yearly");
        } else if (!navigator.onLine) {
          setMessage("You’re offline. Connect to the internet and try again.");
        } else {
          setMessage("We couldn’t load subscription plans. Check your connection and try again.");
        }
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
        const best = next.plans.find((p) => p.kind === "yearly") ?? next.plans[0];
        if (best) setSelected(best.kind);
      })
      .catch((error) => {
        if (!active) return;
        const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
        if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw)) {
          const isUsd = currency === "USD";
          setStore({
            plans: [
              {
                id: "premium_yearly",
                kind: "yearly",
                price: isUsd ? "$49.99" : "R399.00",
                period: "year",
                trialDays: 3,
                purchase: async () => {},
              },
              {
                id: "premium_monthly",
                kind: "monthly",
                price: isUsd ? "$7.99" : "R189.00",
                period: "month",
                trialDays: 0,
                purchase: async () => {},
              },
              {
                id: "premium_family",
                kind: "family",
                price: isUsd ? "$11.99" : "R249.00",
                period: "month",
                trialDays: 0,
                purchase: async () => {},
              },
            ],
            restore: async () => {},
          });
          setSelected("yearly");
        }
      });
    return () => {
      active = false;
    };
  }, [currency]);

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
      "Your subscription isn’t confirmed yet. If you just purchased, check access again. You won’t be charged by checking.",
    );
  }

  async function perform(action: "purchase" | "restore" | "verify") {
    if (lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (action === "purchase") {
        const targetPlan = store?.plans.find((p) => p.kind === selected);
        if (!targetPlan) throw new Error("Plan unavailable");
        await targetPlan.purchase();
        setPendingVerification(true);
      } else if (action === "restore") {
        if (store) await store.restore();
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

  const plan = store?.plans.find((p) => p.kind === selected);

  function handleTapMia() {
    setMascotPulseKey((k) => k + 1);
    setTipIndex((prev) => (prev + 1) % MIA_TIPS.length);
  }

  const getMonthlyBreakdown = (priceStr?: string) => {
    if (!priceStr) return null;
    const match = priceStr.match(/([^\d]*)([\d,.]+)/);
    if (!match) return null;
    const prefix = match[1].trim();
    const num = parseFloat(match[2].replace(/,/g, ""));
    if (isNaN(num)) return null;
    const perMonth = Math.round(num / 12);
    return `≈ ${prefix ? `${prefix} ` : ""}${perMonth}/mo`;
  };

  return (
    <main className="premium-flow paywall paywall-redesign">
      {showSuccess && <SuccessAnimation onComplete={() => void routeNext()} />}
      <div className="paywall-shell">
        <div className="paywall-card shadow-sm">
          {/* Top Brand Strip */}
          <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5 sm:px-6">
            <MealMateLogo imageClassName="size-7 rounded-lg border border-border" showName />
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star size={11} className="fill-amber-500 text-amber-500" aria-hidden="true" />
                <span className="tabular-nums">4.9</span>
                <span className="text-muted-foreground">· MealMate Premium</span>
              </span>
            </div>
          </header>

          {/* Single-Page Split: Left = Only One Floating Mia + Compact Benefits | Right = Plans & CTA */}
          <div className="paywall-grid">
            {/* Left: Floating Full-Body Mia & 4 Compact Benefits */}
            <section className="paywall-left">
              <div>
                {/* Single Floating Full-Body Mia + Speech */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleTapMia}
                    aria-label="Tap Mia to cycle quick kitchen tips"
                    className="group flex shrink-0 flex-col items-center rounded-xl p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                  >
                    <div key={mascotPulseKey} className="flex items-center justify-center">
                      <ChefMascot animate interactive className="h-20 w-20 sm:h-24 sm:w-24" />
                    </div>
                    <span className="mia-ground-shadow -mt-1" aria-hidden="true" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <h1 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                      Cook smarter. Waste zero food.
                    </h1>
                    <button
                      type="button"
                      onClick={handleTapMia}
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-left transition-colors hover:border-[var(--periwinkle)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                    >
                      <p className="text-xs leading-snug text-foreground">
                        <span className="font-semibold text-[var(--periwinkle)]">Mia:</span> “
                        {MIA_TIPS[tipIndex]}”
                      </p>
                    </button>
                  </div>
                </div>

                {/* Compact 2x2 Benefits */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-2.5">
                  {COMPACT_BENEFITS.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
                        <item.icon size={14} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {item.title}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 hidden items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground sm:flex">
                <span>3-day free trial included</span>
                <span>·</span>
                <span>Day 2 renewal reminder</span>
                <span>·</span>
                <span>Cancel anytime</span>
              </div>
            </section>

            {/* Right: Plans, Prices & Primary CTA */}
            <section className="paywall-right">
              <div>
                <div className="mb-2.5 flex items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    Choose your plan
                  </h2>
                  <span className="text-[11px] font-medium text-[var(--positive)]">
                    Cancel anytime
                  </span>
                </div>

                <fieldset className="premium-plans" disabled={busy || loading}>
                  <legend className="sr-only">Choose a subscription plan</legend>
                  {(["yearly", "monthly", "family"] as const).map((kind) => {
                    const option = store?.plans.find((p) => p.kind === kind);
                    const isSelected = selected === kind && !!option;
                    const perMonth =
                      kind === "yearly" && option ? getMonthlyBreakdown(option.price) : null;

                    return (
                      <label
                        key={kind}
                        className={`premium-plan ${isSelected ? "selected" : ""} ${
                          !option ? "unavailable" : ""
                        }`}
                        onClick={() => {
                          if (option) setSelected(kind);
                        }}
                      >
                        <input
                          type="radio"
                          name="subscription"
                          value={kind}
                          checked={isSelected}
                          disabled={!option}
                          onChange={() => setSelected(kind)}
                        />

                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-[var(--primary-foreground)]"
                                : "border-border bg-card"
                            }`}
                          >
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>

                          <div className="plan-name">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-foreground">
                                {kind === "monthly"
                                  ? "Monthly Plan"
                                  : kind === "yearly"
                                    ? "Annual Plan"
                                    : "Family Plan"}
                              </span>
                              {kind === "yearly" && <span className="plan-badge">Save 50%</span>}
                              {kind === "family" && (
                                <span className="text-[11px] font-normal text-muted-foreground">
                                  · Up to 5 accounts
                                </span>
                              )}
                            </div>
                            {kind === "yearly" || option?.trialDays ? (
                              <span className="plan-trial">3-day free trial included</span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {kind === "monthly"
                                  ? "Flexible month-to-month"
                                  : "Shared household pantry & lists"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="plan-price">
                          {loading ? (
                            <span className="text-xs font-normal text-muted-foreground">
                              Loading…
                            </span>
                          ) : option ? (
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-bold text-foreground tabular-nums">
                                <span>{option.price}</span>
                                <small> / {option.period}</small>
                              </div>
                              {perMonth && (
                                <span className="text-[10px] font-semibold text-[var(--periwinkle)] tabular-nums">
                                  {perMonth}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-normal text-muted-foreground">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </fieldset>

                {!online && (
                  <p role="alert" className="premium-notice">
                    You’re offline. Connect to verify your subscription or make a purchase.
                  </p>
                )}
                {message && (
                  <p role="status" className="premium-notice">
                    {message}
                  </p>
                )}
                {!store && !loading && (
                  <button
                    type="button"
                    className="premium-secondary"
                    onClick={() => setAttempt((n) => n + 1)}
                    disabled={busy || !online}
                  >
                    Try again
                  </button>
                )}

                {pendingVerification ? (
                  <button
                    type="button"
                    className="premium-primary"
                    disabled={busy || !online}
                    onClick={() => void perform("verify")}
                  >
                    {busy ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Check subscription access"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="premium-primary"
                    disabled={loading || busy || !online || !plan}
                    onClick={() => void perform("purchase")}
                  >
                    {busy || loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>
                          {selected === "yearly" || plan?.trialDays
                            ? "Start 3-day free trial"
                            : "Subscribe"}
                        </span>
                        <ArrowRight size={15} aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}

                {plan && (
                  <p className="premium-terms">
                    {selected === "yearly" || plan.trialDays
                      ? `3 days free, then ${plan.price} every ${plan.period}.`
                      : `${plan.price} billed every ${plan.period}.`}{" "}
                    Cancel anytime before renewal in your store settings.
                  </p>
                )}
              </div>

              {/* Compact Footer */}
              <div className="mt-3 border-t border-border/70 pt-2.5">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <button
                    type="button"
                    onClick={() => void perform("restore")}
                    disabled={busy || loading || !online}
                    className="text-xs font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
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
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      Switch account
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      search={{ mode: "signin" }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Already subscribed? Sign in
                    </Link>
                  )}
                </div>

                <div className="premium-footer-links">
                  <span className="inline-flex items-center gap-1">
                    <Lock size={11} className="text-[var(--positive)]" aria-hidden="true" /> Secure
                  </span>
                  <span>·</span>
                  <Link to="/legal/terms">Terms</Link>
                  <span>·</span>
                  <Link to="/legal/privacy">Privacy</Link>
                  <span>·</span>
                  <Link to="/support">Help</Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
