import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  Bot,
  Utensils,
  CalendarCheck,
  Refrigerator,
  ScanLine,
  Compass,
  Mic,
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
import { RecipeImage } from "@/components/recipe-image";

const BENEFITS = [
  { icon: Bot, title: "Your personal AI food companion", desc: "Mia, in your kitchen." },
  {
    icon: Utensils,
    title: "Intelligent recipe generation",
    desc: "Tailored to your taste and household.",
  },
  {
    icon: ScanLine,
    title: "Smart ingredient scanning",
    desc: "Turn a photo into a recipe.",
  },
  {
    icon: CalendarCheck,
    title: "Personalised meal planning",
    desc: "Weeks that plan themselves.",
  },
  { icon: Refrigerator, title: "Pantry assistance", desc: "Cook with what you already have." },
  { icon: Compass, title: "Advanced food discovery", desc: "Find something new, easily." },
  { icon: Mic, title: "Voice conversations with Mia", desc: "Hands-free while you cook." },
];

const PLAN_LABEL: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  family: "Family",
};

/** Percentage saved by the yearly plan versus paying monthly, when both prices parse. */
function yearlySaving(store: BillingStore | null): number | null {
  if (!store) return null;
  const price = (kind: PlanKind) => {
    const plan = store.plans.find((p) => p.kind === kind);
    if (!plan) return null;
    const digits = plan.price.replace(/[^\d.,]/g, "").replace(/,/g, "");
    const value = Number.parseFloat(digits);
    return Number.isFinite(value) && value > 0 ? value : null;
  };
  const monthly = price("monthly");
  const yearly = price("yearly");
  if (!monthly || !yearly) return null;
  const saving = Math.round((1 - yearly / (monthly * 12)) * 100);
  return saving > 0 && saving < 100 ? saving : null;
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
  const [promoOpen, setPromoOpen] = useState(false);
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
        const raw =
          error instanceof Error ? error.message : typeof error === "string" ? error : "";
        if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw))
          setMessage(raw);
        else if (/forbidden|401|403|unauthorized/i.test(raw))
          setMessage("We couldn't start checkout from this page. Refresh and try again.");
        else if (!navigator.onLine)
          setMessage("You're offline. Connect to the internet and try again.");
        else
          setMessage(
            "We couldn't load subscription plans. Check your connection and try again. If this continues, confirm RevenueCat web billing is configured.",
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
      "Your subscription isn't confirmed yet. If you just purchased, check access again. You won't be charged by checking.",
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
          ? "Checkout cancelled. Choose a plan whenever you're ready."
          : "We couldn't confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.",
      );
      if (!purchaseWasCancelled(error) && action === "purchase") setPendingVerification(true);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const plan = store?.plans.find((p) => p.kind === selected);
  const saving = yearlySaving(store);
  const disabled = loading || busy || !online;

  return (
    <main className="premium-flow mm-fade-in">
      <div className="mx-auto w-full max-w-lg px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            aria-label="Back to MealMate"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
          <span className="text-[13px] font-medium tracking-[0.02em] text-[#A1A1AA]">
            MealMate<span className="text-white">.</span>
          </span>
          <span className="h-10 w-10" aria-hidden />
        </div>

        {/* Food visual */}
        <div className="mt-4 overflow-hidden rounded-[20px] border border-[#1E1E1E]">
          <div className="relative aspect-[16/10] w-full">
            <RecipeImage recipe={{ name: "Creamy chicken alfredo" }} size="hero" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} /> MealMate Premium
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="mt-7 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[38px]">
          Make every meal
          <br />
          better.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#A1A1AA]">
          Unlock your personal food companion. Discover recipes, plan meals and cook smarter with
          Mia.
        </p>

        {/* Benefits */}
        <ul className="mt-7 space-y-3.5">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium leading-tight text-white">{title}</p>
                <p className="mt-0.5 text-[12.5px] text-[#71717A]">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Plans */}
        <fieldset className="mt-8 space-y-2.5" disabled={disabled}>
          <legend className="sr-only">Choose a subscription plan</legend>
          {loading
            ? ([0, 1] as const).map((i) => <div key={i} className="mm-skeleton h-[76px] w-full" />)
            : (["monthly", "yearly", "family"] as const).map((kind) => {
                const option = store?.plans.find((p) => p.kind === kind);
                if (!option) return null;
                const active = selected === kind;
                return (
                  <label
                    key={kind}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-[16px] border p-4 transition-colors duration-150 " +
                      (active
                        ? "border-white bg-[#171717]"
                        : "border-[#262626] bg-[#141414] hover:border-[#303030]")
                    }
                  >
                    <input
                      type="radio"
                      name="subscription"
                      value={kind}
                      checked={active}
                      onChange={() => setSelected(kind)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " +
                        (active ? "border-white bg-white text-[#080808]" : "border-[#3F3F46]")
                      }
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-medium text-white">
                          {PLAN_LABEL[kind] ?? kind}
                        </span>
                        {kind === "yearly" && saving !== null && (
                          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10.5px] font-medium text-white">
                            Save {saving}%
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-[#71717A]">
                        {option.trialDays === 7
                          ? `7 days free, then ${option.price} / ${option.period}`
                          : `Billed every ${option.period}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[16px] font-semibold tracking-[-0.01em] text-white">
                        {option.price}
                      </span>
                      <span className="block text-[11.5px] text-[#71717A]">
                        / {option.period}
                      </span>
                    </span>
                  </label>
                );
              })}
        </fieldset>

        {/* Status */}
        {!online && (
          <p role="alert" className="mm-alert mt-4">
            You&apos;re offline. Connect to verify your subscription or make a purchase.
          </p>
        )}
        {message && (
          <p role="status" className="mm-alert mt-4">
            {message}
          </p>
        )}
        {!store && !loading && (
          <button
            type="button"
            className="mm-btn mm-btn-secondary mm-btn-block mt-4"
            onClick={() => setAttempt((n) => n + 1)}
            disabled={busy || !online}
          >
            Try again
          </button>
        )}

        {/* Purchase */}
        {pendingVerification ? (
          <button
            type="button"
            className="mm-btn mm-btn-primary mm-btn-block mt-5"
            disabled={busy || !online}
            onClick={() => void perform("verify")}
          >
            {busy ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              "Check subscription access"
            )}
          </button>
        ) : (
          <button
            type="button"
            className="mm-btn mm-btn-primary mm-btn-block mt-5"
            disabled={disabled || !plan}
            onClick={() => void perform("purchase")}
          >
            {busy || loading ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : plan?.trialDays === 7 ? (
              "Start 7-day free trial"
            ) : (
              "Unlock MealMate Premium"
            )}
          </button>
        )}

        {plan && (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[#71717A]">
            {plan.trialDays === 7
              ? `7 days free, then ${plan.price} every ${plan.period}. `
              : `${plan.price} billed every ${plan.period}. `}
            Auto-renews until cancelled. Cancel before renewal in your store or billing account
            settings. Final taxes are confirmed at checkout.
          </p>
        )}

        {/* Recovery */}
        <div className="mt-5 flex items-center justify-center gap-3 text-[13px]">
          <button
            type="button"
            onClick={() => void perform("restore")}
            disabled={disabled}
            className="font-medium text-[#A1A1AA] underline-offset-4 transition-colors hover:text-white hover:underline disabled:opacity-50"
          >
            Restore purchases
          </button>
          {!userId && (
            <>
              <span className="text-[#3F3F46]">·</span>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="font-medium text-[#A1A1AA] transition-colors hover:text-white"
              >
                Already subscribed?
              </Link>
            </>
          )}
        </div>

        {/* Promo */}
        <div className="mt-6 border-t border-[#1E1E1E] pt-4">
          {promoOpen ? (
            <div className="flex gap-2">
              <input
                id="promo-code"
                type="text"
                aria-label="Promo code"
                className="mm-input"
                placeholder="Enter promo code"
                value={promoCode}
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
                className="mm-btn mm-btn-secondary shrink-0 px-5"
                disabled={busy || promoBusy || !online || !promoCode.trim()}
                onClick={() => void applyPromo()}
              >
                {promoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              className="mx-auto block text-[12.5px] text-[#71717A] transition-colors hover:text-white"
            >
              Have a promo code?
            </button>
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#52525B]">
          <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> Secure checkout · Access after
          confirmation
        </p>
        <p className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[#71717A]">
          <Link to="/legal/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <span>·</span>
          <Link to="/legal/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <span>·</span>
          <Link to="/support" className="transition-colors hover:text-white">
            Help
          </Link>
        </p>
      </div>
    </main>
  );
}
