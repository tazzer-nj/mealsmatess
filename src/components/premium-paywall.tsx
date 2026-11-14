import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  HelpCircle,
  Loader2,
  Lock,
  MessageCircle,
  Mic,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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

const MIA_SUPERPOWERS: FeatureCard[] = [
  {
    icon: Camera,
    tag: "Visual Intelligence",
    title: "Mia Pantry & Food Scanner",
    desc: "Snap a photo of your fridge, counter, or random ingredients. Mia invents gourmet recipes in seconds with exact portions.",
    metric: "Instant recipe generation",
  },
  {
    icon: Mic,
    tag: "Voice Cook Mode",
    title: "Hands-Free Voice Kitchen Guide",
    desc: "Cook with messy hands without touching your phone. Mia speaks steps aloud and answers real-time cooking substitutions.",
    metric: "100% hands-free",
  },
  {
    icon: Refrigerator,
    tag: "Zero Food Waste",
    title: "Smart Pantry & Expiry Guard",
    desc: "Track ingredients you already own. Mia prioritizes what is expiring soon so you save money and never toss wilted herbs again.",
    metric: "Save ~30% on groceries",
  },
  {
    icon: CalendarCheck,
    tag: "Effortless Prep",
    title: "Weekly Planner & Aisle Grocery Sync",
    desc: "1-tap meal schedules tuned to your household size and dietary goals. Auto-generates organized, categorized shopping checklists.",
    metric: "5+ hours saved weekly",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Dinner Planning",
    without: "30+ mins stressed wondering what to cook",
    withMealMate: "Instant personalized recipe from your ingredients",
  },
  {
    feature: "Kitchen Cooking",
    without: "Messy hands tapping ads on static recipe blogs",
    withMealMate: "Hands-free conversational voice guidance with Mia",
  },
  {
    feature: "Pantry & Groceries",
    without: "R1,000s wasted on spoiled, forgotten food",
    withMealMate: "Auto-deduct pantry sync & aisle-by-aisle shopping lists",
  },
  {
    feature: "Diet & Personalization",
    without: "Generic recipes that don't match your macros",
    withMealMate: "Customized to your exact taste, calories & family size",
  },
];

const REVIEWS = [
  {
    quote:
      "Mia has completely changed our family routine. We stopped ordering takeout out of exhaustion because Mia gives us dinner ideas in 10 seconds from what we already have.",
    author: "Sipho & Lerato M.",
    role: "Family of 4 · Johannesburg",
    rating: 5,
    highlight: "Saved R1,800/mo on groceries",
  },
  {
    quote:
      "The hands-free voice cook mode is pure magic. I can ask Mia for a substitution while searing fish without getting butter on my phone screen.",
    author: "Elena R.",
    role: "Home Cook & Fitness Enthusiast · Cape Town",
    rating: 5,
    highlight: "5+ hours saved every week",
  },
  {
    quote:
      "Better than every recipe app I have tried. It feels like having a private chef and nutritionist who actually knows what is inside my fridge.",
    author: "David K.",
    role: "Verified Subscriber · Durban",
    rating: 5,
    highlight: "Zero food waste achieved",
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
  const [activeTab, setActiveTab] = useState<"comparison" | "features" | "reviews">("comparison");
  const lock = useRef(false);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const identityRef = useRef<Awaited<ReturnType<typeof createPurchaseSession>> | null>(null);
  const loadedCurrencyRef = useRef<string | null>(null);
  const userId = user?.id;
  const radioGroupId = useId();

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

  // Helper to extract monthly breakdown approximation for yearly plans
  const getMonthlyBreakdown = (priceStr?: string) => {
    if (!priceStr) return null;
    const match = priceStr.match(/([^\d]*)([\d,.]+)/);
    if (!match) return null;
    const prefix = match[1].trim();
    const num = parseFloat(match[2].replace(/,/g, ""));
    if (isNaN(num)) return null;
    const perMonth = Math.round(num / 12);
    return `${prefix ? prefix + " " : ""}${perMonth}/mo`;
  };

  return (
    <main className="premium-flow paywall paywall-redesign">
      <div className="paywall-shell">
        {/* Navigation Bar / Trust Banner */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <MealMateLogo
              imageClassName="size-9 rounded-xl border border-border/80 shadow-sm"
              showName
            />
            <div className="hidden h-4 w-px bg-border/80 sm:block" />
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline-block">
              Premium with Mia
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
              <div className="flex text-amber-500" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-500" />
                ))}
              </div>
              <span className="tabular-nums font-semibold">4.9</span>
              <span className="text-muted-foreground">· 250k+ cooks</span>
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

        {/* Hero Section */}
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--periwinkle)]">
            <ChefMascot className="size-4 shrink-0" />
            <span>The Culinary Companion That Competes with the World's Best</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Cook effortlessly. Plan smartly.{" "}
            <span className="text-[var(--periwinkle)]">Never waste food.</span>
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            MealMate Premium pairs you with <strong>Mia</strong> — your private AI chef and
            nutritionist. Generate instant recipes from your pantry, follow hands-free voice cook
            mode, and automate your weekly prep.
          </p>
        </section>

        {/* Two-Column Responsive Layout */}
        <div className="paywall-grid shadow-xl">
          {/* Left Column: Visual Showcase, Comparison & Social Proof */}
          <section className="paywall-editorial flex flex-col justify-between">
            {/* Visual Hero Photo with Mia Overlay */}
            <div className="paywall-photo relative" aria-hidden="true">
              {heroFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                  <UtensilsCrossed className="size-8" />
                </div>
              ) : (
                <img
                  src={paywallHeroImage}
                  alt="Pan-seared gourmet dish prepared with Mia"
                  onError={() => setHeroFailed(true)}
                  className="size-full object-cover"
                />
              )}
              <div className="paywall-photo-badge">
                <ChefMascot className="size-4 shrink-0" />
                <span>Mia AI Chef · Master Cook Suite</span>
              </div>
            </div>

            <div className="paywall-editorial-body">
              {/* Tab Navigation for Value Exploration */}
              <div className="mb-6 flex items-center justify-start gap-1 rounded-xl border border-border/80 bg-secondary/80 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("comparison")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "comparison"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Why MealMate
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("features")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "features"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mia's Superpowers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                    activeTab === "reviews"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Member Stories
                </button>
              </div>

              {/* TAB 1: CAL AI STYLE BEFORE VS AFTER COMPARISON */}
              {activeTab === "comparison" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Routine Kitchen Frustrations</span>
                    <span className="text-[var(--periwinkle)]">With MealMate + Mia</span>
                  </div>

                  <div className="space-y-3">
                    {COMPARISON_ROWS.map((row) => (
                      <div
                        key={row.feature}
                        className="rounded-xl border border-border/60 bg-card/60 p-3.5 transition-colors hover:bg-card"
                      >
                        <div className="text-xs font-semibold text-foreground">{row.feature}</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <XCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                            <span>{row.without}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs font-medium text-foreground">
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                            <span>{row.withMealMate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--periwinkle)]/30 bg-[var(--periwinkle-soft)] p-3 text-xs text-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={15} className="text-[var(--periwinkle)]" /> Average time saved
                      per home:
                    </span>
                    <span className="font-bold text-[var(--periwinkle)]">5.4 Hours / Week</span>
                  </div>
                </div>
              )}

              {/* TAB 2: RECIME STYLE CULINARY POWER CARDS */}
              {activeTab === "features" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {MIA_SUPERPOWERS.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/70 p-3.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
                            <feature.icon size={16} />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {feature.tag}
                          </span>
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {feature.desc}
                        </p>
                      </div>
                      <div className="mt-3 border-t border-border/50 pt-2 text-[11px] font-semibold text-[var(--periwinkle)]">
                        ✓ {feature.metric}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: MEMBER REVIEWS & PROOF */}
              {activeTab === "reviews" && (
                <div className="space-y-3">
                  {REVIEWS.map((rev) => (
                    <div
                      key={rev.author}
                      className="rounded-xl border border-border/60 bg-card/70 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-amber-500" />
                          ))}
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {rev.highlight}
                        </span>
                      </div>
                      <p className="mt-2 text-xs italic leading-relaxed text-foreground">
                        "{rev.quote}"
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

          {/* Right Column: Plans, Guarantee & Checkout */}
          <section className="paywall-checkout flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--periwinkle-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--periwinkle)]">
                  <ShieldCheck size={13} />
                  <span>100% Risk-Free Guarantee</span>
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Choose your membership
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Experience full access to Mia. Cancel anytime with one tap in your store settings
                  before your trial ends.
                </p>
              </div>

              {/* Plan Cards */}
              <fieldset className="premium-plans" disabled={busy || loading}>
                <legend className="sr-only">Choose a subscription plan</legend>
                {(["monthly", "yearly", "family"] as const).map((kind) => {
                  const option = store?.plans.find((p) => p.kind === kind);
                  const isSelected = selected === kind && !!option;
                  const perMonth =
                    kind === "yearly" && option ? getMonthlyBreakdown(option.price) : null;

                  return (
                    <label
                      key={kind}
                      className={`premium-plan group relative flex items-center justify-between gap-3 p-4 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? "selected border-[var(--periwinkle)] bg-card shadow-md ring-1 ring-[var(--periwinkle)]"
                          : "border-border/80 bg-secondary/70 hover:border-border hover:bg-secondary"
                      } ${!option ? "unavailable opacity-50 cursor-not-allowed" : ""}`}
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
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-white shadow-sm"
                              : "border-border bg-card"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>

                        <div className="plan-name">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {kind === "monthly"
                                ? "Monthly Plan"
                                : kind === "yearly"
                                  ? "Annual Plan"
                                  : "Family Plan"}
                            </span>
                            {kind === "yearly" && (
                              <span className="plan-badge rounded-md bg-[var(--periwinkle-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--periwinkle)] uppercase tracking-wide">
                                Best Value · Save 50%
                              </span>
                            )}
                            {kind === "family" && (
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Up to 5 Accounts
                              </span>
                            )}
                          </div>
                          {option?.trialDays === 7 ? (
                            <span className="plan-trial text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              7-day free trial included
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {kind === "monthly"
                                ? "Flexible month-to-month"
                                : "Shared kitchen sync"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="plan-price text-right">
                        {loading ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            Loading…
                          </span>
                        ) : option ? (
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-foreground sm:text-base tabular-nums">
                              <span>{option.price}</span>
                              <small className="text-xs font-normal text-muted-foreground">
                                {" "}
                                / {option.period}
                              </small>
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

              {/* CAL AI SIGNATURE: 3-STEP TRIAL TIMELINE */}
              {plan?.trialDays === 7 && (
                <div className="mb-5 rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    How Your Free Trial Works
                  </div>
                  <div className="mt-3 relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-[var(--periwinkle)] bg-background flex items-center justify-center">
                        <div className="size-1.5 rounded-full bg-[var(--periwinkle)]" />
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        Today · Instant Unlock
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Get immediate unlimited access to Mia, ingredient scanning, and voice cook
                        mode.
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-border bg-background flex items-center justify-center">
                        <Bell size={9} className="text-muted-foreground" />
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        Day 5 · Gentle Reminder
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        We send you a reminder notification before your trial converts.
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 size-4 rounded-full border-2 border-emerald-500 bg-background flex items-center justify-center">
                        <Check size={9} className="text-emerald-500" strokeWidth={3} />
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        Day 7 · Membership Starts
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Billed at {plan.price}/{plan.period}. Cancel anytime in 1 tap if not
                        satisfied.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notices */}
              {!online && (
                <p role="alert" className="premium-notice mb-4">
                  You’re offline. Connect to verify your subscription or make a purchase.
                </p>
              )}
              {message && (
                <p role="status" className="premium-notice mb-4">
                  {message}
                </p>
              )}
              {!store && !loading && (
                <button
                  type="button"
                  className="premium-secondary w-full"
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
                  className="premium-primary shadow-lg shadow-[var(--periwinkle)]/20"
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
                  className="premium-primary shadow-lg shadow-[var(--periwinkle)]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
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

            {/* Reassurance Footer */}
            <div className="mt-6 pt-4 border-t border-border/60">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => void perform("restore")}
                  disabled={busy || loading || !online}
                  className="text-xs font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-emerald-500" /> Secure Checkout
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <HeartHandshake size={12} className="text-[var(--periwinkle)]" /> Cancel Anytime
                </span>
              </div>

              <div className="premium-footer-links mt-4">
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
