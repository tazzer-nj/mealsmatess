import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  ChefHat,
  Loader2,
  Mic,
  Refrigerator,
  ScanLine,
  ShieldCheck,
  Utensils,
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
import { RecipeImage } from "@/components/recipe-image";

const BENEFITS = [
  { icon: Bot, label: "Your personal food companion" },
  { icon: ChefHat, label: "Intelligent recipe generation" },
  { icon: ScanLine, label: "Smart ingredient scanning" },
  { icon: CalendarCheck, label: "Personalised meal planning" },
  { icon: Refrigerator, label: "Pantry assistance" },
  { icon: Utensils, label: "Advanced food discovery" },
  { icon: Mic, label: "Voice conversations with Mia" },
];

const PLAN_LABEL: Record<PlanKind, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  family: "Family",
};

const PLAN_NOTE: Record<PlanKind, string> = {
  monthly: "Flexible, cancel anytime",
  yearly: "One payment for the whole year",
  family: "Share MealMate with your household",
};

/** Reads a formatted store price without assuming a currency or rounding rule. */
function amountOf(price: string): number | null {
  const match = /(\d[\d\s.,]*)/.exec(price);
  if (!match) return null;
  const raw = match[1].trim();
  const decimals = /[.,](\d{2})$/.exec(raw);
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (decimals) return Number(`${digits.slice(0, digits.length - 2)}.${decimals[1]}`);
  return Number(digits);
}

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
        setSelected(next.plans.find((p) => p.kind === "yearly")?.kind ?? next.plans[0].kind);
      })
      .catch((error) => {
        if (!active) return;
        const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
        if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw))
          setMessage(raw);
        else if (/forbidden|401|403|unauthorized/i.test(raw))
          setMessage("We couldn’t start checkout from this page. Refresh and try again.");
        else if (!navigator.onLine)
          setMessage("You’re offline. Connect to the internet and try again.");
        else
          setMessage(
            "We couldn’t load subscription plans. Check your connection and try again. If this continues, confirm RevenueCat web billing is configured.",
          );
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
  const monthly = store?.plans.find((p) => p.kind === "monthly");
  const yearly = store?.plans.find((p) => p.kind === "yearly");
  const monthlyAmount = monthly ? amountOf(monthly.price) : null;
  const yearlyAmount = yearly ? amountOf(yearly.price) : null;
  const savingPercent =
    monthlyAmount && yearlyAmount && monthlyAmount * 12 > yearlyAmount
      ? Math.round((1 - yearlyAmount / (monthlyAmount * 12)) * 100)
      : null;

  return (
    <main className="paywall-redesign">
      <div className="paywall-hero">
        <RecipeImage
          recipe={{ name: "Creamy chicken alfredo" }}
          size="hero"
          priority
          className="paywall-hero-media"
        />
        <div className="paywall-hero-top">
          <span className="paywall-brand">
            <MealMateLogo imageClassName="size-6 rounded-md object-contain" showName={false} />
            MealMate
          </span>
        </div>
      </div>

      <section className="paywall-content">
        <p className="premium-eyebrow">MealMate Premium</p>
        <h1>Make every meal better.</h1>
        <p className="paywall-description">
          Unlock your personal food companion. Discover recipes, plan meals and cook smarter with
          Mia.
        </p>

        <ul className="paywall-benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit.label} className="paywall-benefit">
              <benefit.icon strokeWidth={1.7} aria-hidden="true" />
              {benefit.label}
            </li>
          ))}
        </ul>

        <fieldset className="paywall-plans" disabled={busy || loading}>
          <legend className="sr-only">Choose a subscription plan</legend>
          {loading
            ? [0, 1].map((i) => <div key={i} className="paywall-plan-skeleton" />)
            : (["yearly", "monthly", "family"] as const).map((kind) => {
                const option = store?.plans.find((p) => p.kind === kind);
                const isSelected = selected === kind && !!option;
                return (
                  <button
                    key={kind}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!option}
                    className="paywall-plan"
                    data-selected={isSelected}
                    data-unavailable={!option}
                    onClick={() => setSelected(kind)}
                  >
                    <span className="paywall-radio" aria-hidden="true" />
                    <span className="paywall-plan-body">
                      <span className="paywall-plan-name">
                        {PLAN_LABEL[kind]}
                        {kind === "yearly" && option && savingPercent ? (
                          <span className="paywall-badge">Save {savingPercent}%</span>
                        ) : null}
                      </span>
                      <span className="paywall-plan-note">
                        {option
                          ? option.trialDays === 7
                            ? `7 days free, then billed ${option.period === "year" ? "yearly" : option.period}`
                            : PLAN_NOTE[kind]
                          : loading
                            ? "Loading store prices…"
                            : "Currently unavailable"}
                      </span>
                    </span>
                    <span className="paywall-plan-price">
                      <strong>{option ? option.price : "—"}</strong>
                      <span>{option ? `per ${option.period}` : "not offered"}</span>
                    </span>
                  </button>
                );
              })}
        </fieldset>

        {!online ? (
          <p role="alert" className="paywall-notice">
            You’re offline. Connect to verify your subscription or make a purchase.
          </p>
        ) : null}
        {message ? (
          <p role="status" className="paywall-notice">
            {message}
          </p>
        ) : null}

        {!store && !loading ? (
          <button
            type="button"
            className="paywall-secondary"
            onClick={() => setAttempt((n) => n + 1)}
            disabled={busy || !online}
          >
            Try again
          </button>
        ) : null}

        {pendingVerification ? (
          <button
            type="button"
            className="paywall-cta"
            disabled={busy || !online}
            onClick={() => void perform("verify")}
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : "Check subscription access"}
          </button>
        ) : (
          <button
            type="button"
            className="paywall-cta"
            disabled={loading || busy || !online || !plan}
            onClick={() => void perform("purchase")}
          >
            {busy || loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Unlock MealMate Premium
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </button>
        )}

        {plan ? (
          <p className="paywall-fineprint">
            {plan.trialDays === 7
              ? `7 days free, then ${plan.price} every ${plan.period}.`
              : `${plan.price} every ${plan.period}.`}{" "}
            Auto-renews until cancelled. Cancel any time in your store or billing settings before
            renewal. Final taxes and trial eligibility are confirmed at checkout.
          </p>
        ) : null}

        <details className="paywall-promo">
          <summary>Have a promo code?</summary>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              className="paywall-promo-input"
              placeholder="Enter code"
              value={promoCode}
              aria-label="Promo code"
              autoCapitalize="none"
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
              className="mm-btn mm-btn--secondary mm-btn--sm"
              disabled={busy || promoBusy || !online || !promoCode.trim()}
              onClick={() => void applyPromo()}
            >
              {promoBusy ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
            </button>
          </div>
          {!userId ? (
            <p className="mm-meta mt-2">
              <Link to="/auth" search={{ mode: "signin" }} className="underline">
                Sign in
              </Link>{" "}
              to redeem a code.
            </p>
          ) : null}
        </details>

        <div className="paywall-links">
          <button
            type="button"
            onClick={() => void perform("restore")}
            disabled={busy || loading || !online}
          >
            Restore purchases
          </button>
          {!userId ? (
            <Link to="/auth" search={{ mode: "signin" }}>
              Already subscribed? Sign in
            </Link>
          ) : null}
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/privacy">Privacy</Link>
        </div>

        <p className="paywall-secure">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Secure checkout · Access opens after confirmation
        </p>
      </section>
    </main>
  );
}
