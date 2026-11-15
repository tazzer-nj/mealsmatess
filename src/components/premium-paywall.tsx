import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Loader2,
  Lock,
  Mic,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  XCircle,
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
import paywallHeroImage from "@/assets/images/paywall_editorial_hero_1794594256521.jpg";

interface FeatureCard {
  icon: typeof Camera;
  tag: string;
  title: string;
  desc: string;
  metric: string;
}

const MIA_FACTS = [
  {
    id: "scan",
    label: "Fridge Scan",
    quote:
      "Snap a photo of what’s in your fridge — I’ll build a complete recipe in under 10 seconds.",
  },
  {
    id: "voice",
    label: "Voice Mode",
    quote:
      "Hands covered in flour? Talk to me hands-free for step-by-step guidance & instant swaps.",
  },
  {
    id: "save",
    label: "Save Money",
    quote: "MealMate households cut food waste and save an average of R1,800/month on groceries.",
  },
  {
    id: "trial",
    label: "7-Day Trial",
    quote: "Unlock every feature today for free. We’ll remind you on Day 5 before anything bills.",
  },
] as const;

const INCLUDED_BENEFITS: FeatureCard[] = [
  {
    icon: Camera,
    tag: "Visual AI",
    title: "Pantry & Fridge Photo Scanner",
    desc: "Snap your counter or fridge. Mia generates balanced recipes sized for your household.",
    metric: "10s recipe match",
  },
  {
    icon: Mic,
    tag: "Hands-Free",
    title: "Voice Cook Mode & Live Swaps",
    desc: "Hear every step aloud without touching your screen. Ask for missing ingredient swaps live.",
    metric: "100% hands-free",
  },
  {
    icon: Refrigerator,
    tag: "Zero Waste",
    title: "Smart Pantry & Expiry Guard",
    desc: "Track what you own so Mia prioritizes ingredients nearing expiry before they spoil.",
    metric: "Save ~30% monthly",
  },
  {
    icon: CalendarCheck,
    tag: "Auto-Sorted",
    title: "Weekly Planner & Aisle Lists",
    desc: "One-tap weekly meal plans synced to aisle-by-aisle and alphabetical grocery lists.",
    metric: "5+ hrs saved weekly",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Dinner Decisions",
    without: "30+ mins debating takeout or scrolling ads",
    withMealMate: "10-second recipe matched to your fridge",
  },
  {
    feature: "While Cooking",
    without: "Dirty fingers unlocking static recipe blogs",
    withMealMate: "Hands-free conversational voice guide with Mia",
  },
  {
    feature: "Grocery Spend",
    without: "Forgotten produce spoiling in the back drawer",
    withMealMate: "Expiry-first meal plans & aisle-sorted lists",
  },
  {
    feature: "Macros & Household",
    without: "Generic serving sizes & manual math",
    withMealMate: "Auto-scaled to your diet, allergies & family",
  },
];

const REVIEWS = [
  {
    quote:
      "We stopped ordering expensive takeout on weeknights because Mia gives us dinner ideas in 10 seconds from what is already in our fridge.",
    author: "Sipho & Lerato M.",
    role: "Family of 4 · Johannesburg",
    rating: 5,
    highlight: "Saved R1,800/mo",
  },
  {
    quote:
      "Voice cook mode is a lifesaver. I can ask Mia for a swap while searing fish without getting butter all over my phone.",
    author: "Elena R.",
    role: "Home Cook · Cape Town",
    rating: 5,
    highlight: "5+ hrs saved/week",
  },
  {
    quote:
      "Having my pantry, weekly plan, and aisle-sorted shopping list connected in one clean app pays for itself in the first week.",
    author: "David K.",
    role: "Verified Member · Durban",
    rating: 5,
    highlight: "Zero food waste",
  },
];

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
  const [heroFailed, setHeroFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<"benefits" | "comparison" | "reviews">("benefits");
  const [factIndex, setFactIndex] = useState(0);
  const [mascotPulseKey, setMascotPulseKey] = useState(0);

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
    void createPurchaseSession()
      .then(async (identity) => {
        if (!active) return null;
        if (identity.isActive) {
          await routeNext();
          return null;
        }
        const targetCurrency = currencyRef.current;
        const nextStore = await loadBillingStore(identity, targetCurrency);
        if (!active) return null;
        identityRef.current = identity;
        loadedCurrencyRef.current = targetCurrency;
        return nextStore;
      })
      .then((next) => {
        if (!active || !next) return;
        setStore(next);
        const best = next.plans.find((p) => p.kind === "yearly") ?? next.plans[0];
        if (best) setSelected(best.kind);
      })
      .catch((error) => {
        if (!active) return;
        const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
        if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw))
          setMessage(raw);
        else if (!navigator.onLine)
          setMessage("You’re offline. Connect to the internet and try again.");
        else
          setMessage("We couldn’t load subscription plans. Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, sessionLoading, attempt, routeNext]);

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
          setMessage(raw);
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
        await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        if (userId) {
          await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        }
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
  const currentFact = MIA_FACTS[factIndex]!;

  function handleMascotInteract(nextIndex?: number) {
    setMascotPulseKey((k) => k + 1);
    setFactIndex((prev) =>
      typeof nextIndex === "number" ? nextIndex : (prev + 1) % MIA_FACTS.length,
    );
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
      <div className="paywall-shell">
        {/* Compact Brand Bar */}
        <header className="mb-5 flex items-center justify-between gap-3 border-b border-border/70 pb-3.5">
          <div className="flex items-center gap-2.5">
            <MealMateLogo imageClassName="size-8 rounded-xl border border-border/80" showName />
            <span className="hidden rounded-md bg-[var(--periwinkle-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--periwinkle)] sm:inline-flex">
              Premium
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
              <Star size={11} className="fill-amber-500 text-amber-500" aria-hidden="true" />
              <span className="tabular-nums font-semibold">4.9</span>
              <span className="hidden text-muted-foreground sm:inline">· 250k+ cooks</span>
            </div>

            <button
              type="button"
              onClick={() => void perform("restore")}
              disabled={busy || loading || !online}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Restore
            </button>
          </div>
        </header>

        {/* Interactive Full-Body Mia Stage + Just-the-Facts Hero */}
        <section className="mb-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Full-body moving & interactive Mia mascot */}
            <div className="relative flex shrink-0 flex-col items-center">
              <button
                type="button"
                onClick={() => handleMascotInteract()}
                aria-label="Tap Mia to hear culinary facts"
                className="group relative flex flex-col items-center rounded-2xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
              >
                <div key={mascotPulseKey} className="relative flex items-center justify-center">
                  <ChefMascot animate interactive className="h-28 w-28 sm:h-32 sm:w-32" />
                </div>
                <span className="mia-ground-shadow -mt-1.5" aria-hidden="true" />
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors group-hover:border-[var(--periwinkle)] group-hover:text-foreground">
                  <Sparkles size={10} className="text-[var(--periwinkle)]" aria-hidden="true" />
                  Tap Mia
                </span>
              </button>
            </div>

            {/* Speech Bubble + Interactive Topic Pills */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--periwinkle)]">
                Chef-Grade Kitchen Intelligence · Taz Technologies
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Cook effortlessly. Waste zero food.
              </h1>

              {/* Interactive Mia Speech Bubble */}
              <div
                onClick={() => handleMascotInteract()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMascotInteract();
                  }
                }}
                className="mt-3 cursor-pointer rounded-xl border border-border bg-secondary/70 px-3.5 py-2.5 text-left transition-colors hover:border-[var(--periwinkle)]/60"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[var(--periwinkle)]">
                  <span>Mia · {currentFact.label}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {factIndex + 1}/{MIA_FACTS.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground sm:text-sm">
                  “{currentFact.quote}”
                </p>
              </div>

              {/* Topic Selector Chips */}
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                {MIA_FACTS.map((fact, idx) => {
                  const active = idx === factIndex;
                  return (
                    <button
                      key={fact.id}
                      type="button"
                      onClick={() => handleMascotInteract(idx)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                        active
                          ? "border-[var(--periwinkle)] bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]"
                          : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fact.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Responsive Split: Mobile puts Checkout & Prices immediately visible; Desktop displays Editorial Left + Sticky Checkout Right */}
        <div className="paywall-grid shadow-sm">
          {/* Benefits & Proof Column */}
          <section className="paywall-editorial">
            <div className="paywall-photo relative" aria-hidden="true">
              {heroFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                  <UtensilsCrossed className="size-8" />
                </div>
              ) : (
                <img
                  src={paywallHeroImage}
                  alt="Freshly cooked meal prepared with Mia"
                  onError={() => setHeroFailed(true)}
                />
              )}
              <div className="paywall-photo-badge">
                <ChefMascot className="size-4 shrink-0" />
                <span>MealMate Premium · Just the Facts</span>
              </div>
            </div>

            <div className="paywall-editorial-body">
              {/* Segmented Tabs */}
              <div className="mb-4 flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("benefits")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "benefits"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  What You Get
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("comparison")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "comparison"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Before vs. After
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "reviews"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Reviews
                </button>
              </div>

              {activeTab === "benefits" && (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {INCLUDED_BENEFITS.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
                            <feature.icon size={16} />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {feature.tag}
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-xs font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {feature.desc}
                        </p>
                      </div>
                      <div className="mt-2.5 border-t border-border/60 pt-2 text-[11px] font-semibold text-[var(--periwinkle)]">
                        ✓ {feature.metric}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "comparison" && (
                <div className="space-y-2.5">
                  {COMPARISON_ROWS.map((row) => (
                    <div
                      key={row.feature}
                      className="rounded-xl border border-border bg-card p-3.5"
                    >
                      <div className="text-xs font-semibold text-foreground">{row.feature}</div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                          <span>{row.without}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs font-medium text-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--positive)]" />
                          <span>{row.withMealMate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl border border-[var(--periwinkle)]/30 bg-[var(--periwinkle-soft)] px-3.5 py-2.5 text-xs text-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-[var(--periwinkle)]" /> Avg. household time
                      saved
                    </span>
                    <span className="font-bold text-[var(--periwinkle)]">5.4 Hours / Week</span>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-2.5">
                  {REVIEWS.map((rev) => (
                    <div key={rev.author} className="rounded-xl border border-border bg-card p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-500" />
                          ))}
                        </div>
                        <span className="rounded-md bg-[var(--periwinkle-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--periwinkle)]">
                          {rev.highlight}
                        </span>
                      </div>
                      <p className="mt-2 text-xs italic leading-relaxed text-foreground">
                        “{rev.quote}”
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{rev.author}</span>
                        <span>{rev.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Plans & Checkout Column (Appears immediately below Mia on mobile) */}
          <section className="paywall-checkout">
            <div>
              <div className="mb-4">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--periwinkle-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--periwinkle)]">
                  <ShieldCheck size={13} />
                  <span>Cancel Anytime · Transparent Pricing</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Choose your plan
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Full access to Mia AI Chef, pantry scanner, meal planner & aisle-sorted lists.
                </p>
              </div>

              {/* Plan Cards */}
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

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-white"
                              : "border-border bg-card"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
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
                            {kind === "yearly" && (
                              <span className="plan-badge">Best Value · Save 50%</span>
                            )}
                            {kind === "family" && (
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                                Up to 5 Accounts
                              </span>
                            )}
                          </div>
                          {option?.trialDays === 7 ? (
                            <span className="plan-trial">7-day free trial included</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {kind === "monthly"
                                ? "Flexible month-to-month"
                                : "Shared family pantry & lists"}
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
                            <div className="text-sm font-bold text-foreground sm:text-base tabular-nums">
                              <span>{option.price}</span>
                              <small> / {option.period}</small>
                            </div>
                            {perMonth && (
                              <span className="text-[11px] font-semibold text-[var(--periwinkle)] tabular-nums">
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

              {/* 3-Step Free Trial Timeline */}
              {plan?.trialDays === 7 && (
                <div className="mb-4 rounded-xl border border-border bg-secondary/60 p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    How your 7-day free trial works
                  </div>
                  <div className="relative mt-2.5 space-y-2.5 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-[var(--periwinkle)] bg-background">
                        <div className="size-1.5 rounded-full bg-[var(--periwinkle)]" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        Today · Instant full unlock
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Unlimited Mia AI Chef, pantry scanner & voice cook mode — R0 due today.
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-border bg-background">
                        <Bell size={9} className="text-muted-foreground" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        Day 5 · Trial reminder
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        We notify you 48 hours before your trial ends.
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-[var(--positive)] bg-background">
                        <Check size={9} className="text-[var(--positive)]" strokeWidth={3} />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        Day 7 · Plan starts ({plan.price}/{plan.period})
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Cancel anytime in 1 tap before Day 7 and pay nothing.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notices */}
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

              {/* Primary CTA */}
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
                      <span>{plan?.trialDays === 7 ? "Start 7-day free trial" : "Subscribe"}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              )}

              {/* Terms Disclosure */}
              {plan && (
                <p className="premium-terms">
                  {plan.trialDays === 7
                    ? `7 days free, then ${plan.price} every ${plan.period}.`
                    : `${plan.price} billed every ${plan.period}.`}{" "}
                  Cancel anytime before renewal in your store settings.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 border-t border-border/70 pt-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => void perform("restore")}
                  disabled={busy || loading || !online}
                  className="text-xs font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Restore Purchases
                </button>
                {!userId && (
                  <Link
                    to="/auth"
                    search={{ mode: "signin" }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Already subscribed? Sign in
                  </Link>
                )}
              </div>

              <div className="mt-3.5 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-[var(--positive)]" /> Secure Checkout
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HeartHandshake size={12} className="text-[var(--periwinkle)]" /> Cancel Anytime
                </span>
              </div>

              <div className="premium-footer-links">
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
    </main>
  );
}
