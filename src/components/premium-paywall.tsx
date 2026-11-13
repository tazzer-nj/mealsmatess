import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Camera,
  Check,
  Loader2,
  Refrigerator,
  ShieldCheck,
  Sparkles,
  Utensils,
  UtensilsCrossed,
  Volume2,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import {
  createPurchaseSession,
  redeemPromoCode,
  verifyCheckout,
  verifyMyPremium,
  getIntroCompletion,
} from "@/lib/billing.functions";
import {
  loadBillingStore,
  purchaseWasCancelled,
  type BillingStore,
  type PlanKind,
} from "@/lib/billing-client";
import { MealMateLogo } from "@/components/mealmate-logo";
import paywallHeroImage from "@/assets/images/paywall_editorial_hero_1794594256521.jpg";

const VALUE_BENEFITS = [
  {
    icon: Bot,
    title: "AI conversations with Mia",
    desc: "Get real-time cooking guidance, swaps, and answers while you prepare meals.",
  },
  {
    icon: Sparkles,
    title: "AI recipe generation",
    desc: "Create original recipes tailored to your ingredients, dietary goals, and pace.",
  },
  {
    icon: Camera,
    title: "Ingredient scanning",
    desc: "Scan items in your kitchen to uncover recipes you can cook right now.",
  },
  {
    icon: CalendarCheck,
    title: "Smart meal planning",
    desc: "Plan your week effortlessly with organised grocery lists.",
  },
  {
    icon: Refrigerator,
    title: "Pantry assistance",
    desc: "Track what is in your kitchen and reduce everyday food waste.",
  },
  {
    icon: Utensils,
    title: "Personalised recommendations",
    desc: "South African staples and global dishes tuned to your preferences.",
  },
  {
    icon: Volume2,
    title: "Voice conversations",
    desc: "Hands-free voice assistance with Mia so you never miss a step.",
  },
];

export function PremiumPaywall() {
  const { user, loading: sessionLoading } = useSession();
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
  const [promoCode, setPromoCode] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);
  const lock = useRef(false);
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

  async function routeNext() {
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
  }

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;
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
        return loadBillingStore(identity);
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
  }, [userId, sessionLoading, attempt, navigate]);

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

  async function applyPromo() {
    if (!userId) {
      setMessage("Sign in first, then enter your promo code.");
      return;
    }
    if (!promoCode.trim() || promoBusy || lock.current) return;
    lock.current = true;
    setPromoBusy(true);
    setMessage("");
    try {
      const access = await redeemPromoCode({ data: { code: promoCode.trim() } });
      if (access.isPremium) {
        await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
        setMessage("Promo applied — Premium is unlocked.");
        await routeNext();
        return;
      }
      setMessage("Promo could not be applied. Try again.");
    } catch {
      setMessage("That promo code is not valid, or you need to sign in and try again.");
    } finally {
      lock.current = false;
      setPromoBusy(false);
    }
  }

  async function perform(action: "purchase" | "restore" | "verify") {
    if (lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (action === "purchase") {
        const plan = store?.plans.find((p) => p.kind === selected);
        if (!plan) throw new Error("Plan unavailable");
        await plan.purchase();
        setPendingVerification(true);
      } else if (action === "restore") {
        if (store) await store.restore();
      }
      await confirm();
    } catch (error) {
      setMessage(
        purchaseWasCancelled(error)
          ? "Checkout cancelled. Choose a plan whenever you’re ready."
          : "We couldn’t confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.",
      );
      if (!purchaseWasCancelled(error) && action === "purchase") setPendingVerification(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const plan = store?.plans.find((p) => p.kind === selected);

  return (
    <main className="premium-flow paywall paywall-redesign">
      <div className="paywall-shell">
        <div className="mb-4 flex items-center justify-between px-1">
          <MealMateLogo imageClassName="size-8 rounded-xl border border-border" showName />
          <span className="text-xs font-medium text-muted-foreground">MealMate Consumer</span>
        </div>

        <div className="paywall-grid">
          {/* Left Column: Culinary Photo & Real Benefits */}
          <section className="paywall-editorial">
            <div className="paywall-photo" aria-hidden="true">
              {heroFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
              ) : (
                <img
                  src={paywallHeroImage}
                  alt="Pan-seared sea bass with charred lemon and herb oil"
                  onError={() => setHeroFailed(true)}
                />
              )}
              <div className="paywall-photo-badge">
                <Sparkles size={12} className="text-[#A5B4FC]" aria-hidden="true" />
                <span>MealMate Premium</span>
              </div>
            </div>

            <div className="paywall-editorial-body">
              <p className="premium-eyebrow">Membership</p>
              <h1>Make every meal better.</h1>
              <p className="premium-description">
                Your personal food companion. Discover recipes, plan meals and cook smarter with
                Mia.
              </p>

              <div className="paywall-benefits">
                {VALUE_BENEFITS.map((item) => (
                  <div key={item.title} className="paywall-benefit-row">
                    <div className="paywall-benefit-icon">
                      <item.icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="paywall-benefit-title">{item.title}</div>
                      <div className="paywall-benefit-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Plans & Checkout */}
          <section className="paywall-checkout">
            <div className="mb-5">
              <h2 className="text-lg font-medium tracking-tight text-foreground">
                Choose your plan
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Real store pricing verified directly at checkout. Cancel anytime.
              </p>
            </div>

            <fieldset className="premium-plans" disabled={busy || loading}>
              <legend className="sr-only">Choose a subscription plan</legend>
              {(["monthly", "yearly", "family"] as const).map((kind) => {
                const option = store?.plans.find((p) => p.kind === kind);
                const isSelected = selected === kind && !!option;
                return (
                  <label
                    key={kind}
                    className={`premium-plan ${isSelected ? "selected" : ""} ${!option ? "unavailable" : ""}`}
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
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected
                            ? "border-[var(--periwinkle)] bg-[var(--periwinkle)] text-white"
                            : "border-border bg-card"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={2.75} />}
                      </div>
                      <div className="plan-name">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>
                            {kind === "monthly"
                              ? "Monthly"
                              : kind === "yearly"
                                ? "Yearly"
                                : "Family Plan"}
                          </span>
                          {kind === "yearly" && <span className="plan-badge">Best Value</span>}
                        </div>
                        {option?.trialDays === 7 && (
                          <span className="plan-trial">7-day free trial included</span>
                        )}
                      </div>
                    </div>

                    <div className="plan-price">
                      {loading ? (
                        <span className="text-xs font-normal text-muted-foreground">Loading…</span>
                      ) : option ? (
                        <>
                          <span>{option.price}</span>
                          <small> / {option.period}</small>
                        </>
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
                    <span>{plan?.trialDays === 7 ? "Start 7-day free trial" : "Subscribe"}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            )}

            {plan && (
              <p className="premium-terms">
                {plan.trialDays === 7
                  ? `7 days free, then ${plan.price} every ${plan.period}.`
                  : `${plan.price} billed every ${plan.period}.`}{" "}
                Cancel anytime before renewal in your store settings.
              </p>
            )}

            <div className="premium-promo">
              <label className="premium-promo-label" htmlFor="promo-code">
                Have an access or promo code?
              </label>
              <div className="premium-promo-row">
                <input
                  id="promo-code"
                  type="text"
                  className="premium-promo-input"
                  placeholder="ENTER CODE"
                  value={promoCode}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={busy || promoBusy || !online}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void applyPromo();
                    }
                  }}
                />
                <button
                  type="button"
                  className="premium-promo-button"
                  disabled={busy || promoBusy || !online || !promoCode.trim()}
                  onClick={() => void applyPromo()}
                >
                  {promoBusy ? <Loader2 className="animate-spin" size={15} /> : "Apply"}
                </button>
              </div>
              {!userId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <Link
                    to="/auth"
                    search={{ mode: "signin" }}
                    className="underline hover:text-foreground"
                  >
                    Sign in
                  </Link>{" "}
                  to redeem your code.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => void perform("restore")}
                disabled={busy || loading || !online}
                className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-[var(--periwinkle)]" aria-hidden="true" />{" "}
              Encrypted checkout · Verified access
            </p>

            <div className="premium-footer-links">
              <Link to="/legal/terms">Terms</Link>
              <span>·</span>
              <Link to="/legal/privacy">Privacy</Link>
              <span>·</span>
              <Link to="/support">Help</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
