import { Capacitor } from "@capacitor/core";
import type { createPurchaseSession } from "@/lib/billing.functions";
import { detectCurrency, type CurrencyCode } from "@/lib/currency";

type Identity = Awaited<ReturnType<typeof createPurchaseSession>> & {
  iosApiKey?: string | null;
};
export type PlanKind = "monthly" | "yearly" | "family";
export type BillingPlan = {
  id: string;
  kind: PlanKind;
  price: string;
  period: string;
  trialDays: number;
  purchase: () => Promise<unknown>;
};
export type BillingStore = { plans: BillingPlan[]; restore: () => Promise<unknown> };

const PLAN_ORDER: Record<PlanKind, number> = { monthly: 0, yearly: 1, family: 2 };

export function planKind(identifier: string, product: string, period: string): PlanKind | null {
  const key = `${identifier}_${product}`.toLowerCase();
  if (/(?:^|[_.-])family(?:$|[_.-])/.test(key) || key.includes("premium_family_monthly")) {
    return "family";
  }
  if (/(?:^|[_.-])lifetime(?:$|[_.-])/.test(key) || period === "") {
    if (/lifetime|forever|one.?time/.test(key)) return "family";
  }
  if (
    period === "P1Y" ||
    /(?:^|[_.-])(?:annual|yearly)(?:$|[_.-])/.test(key) ||
    key.includes("premium_yearly")
  ) {
    return "yearly";
  }
  if (
    period === "P1M" ||
    /(?:^|[_.-])monthly(?:$|[_.-])/.test(key) ||
    key.includes("premium_monthly")
  ) {
    return "monthly";
  }
  return null;
}

export function periodLabel(iso: string): string {
  if (!iso) return "once";
  const match = /^P(\d+)([DWMY])$/.exec(iso);
  if (!match) return "billing period";
  const unit = ({ D: "day", W: "week", M: "month", Y: "year" } as Record<string, string>)[match[2]];
  return Number(match[1]) === 1 ? unit : `${match[1]} ${unit}s`;
}

export function sevenDayTrial(iso: string | null | undefined, hasIntroPrice: boolean): number {
  return !hasIntroPrice && (iso === "P7D" || iso === "P1W") ? 7 : 0;
}

export function purchaseWasCancelled(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    userCancelled?: boolean;
    code?: string | number;
    errorCode?: number | string;
    purchasesErrorCode?: number;
    name?: string;
  };
  return (
    e.userCancelled === true ||
    e.errorCode === 1 ||
    String(e.errorCode) === "1" ||
    String(e.code) === "1" ||
    e.purchasesErrorCode === 1 ||
    e.name === "UserCancelledError"
  );
}

export function purchaseIsPending(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    code?: string | number;
    errorCode?: number | string;
    purchasesErrorCode?: number;
    name?: string;
    message?: string;
  };
  return (
    e.errorCode === 20 ||
    String(e.errorCode) === "20" ||
    String(e.code) === "20" ||
    e.purchasesErrorCode === 20 ||
    e.name === "PaymentPendingError" ||
    /payment.?pending/i.test(e.message ?? "")
  );
}

function preferredWebCurrency(explicit?: CurrencyCode): string {
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("mealmate-currency")?.trim().toUpperCase();
    if (stored && /^[A-Z]{3}$/.test(stored)) return stored;
  }
  return detectCurrency() || "ZAR";
}

let nativeUser: string | null = null;
let webUser: string | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function loadBillingStore(
  identity: Identity,
  currency?: CurrencyCode,
): Promise<BillingStore> {
  const task = queue.catch(() => undefined).then(() => configureStore(identity, currency));
  queue = task;
  return task;
}

async function configureStore(identity: Identity, currency?: CurrencyCode): Promise<BillingStore> {
  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    const apiKey =
      platform === "android"
        ? identity.androidApiKey
        : platform === "ios"
          ? identity.iosApiKey
          : null;
    if (!apiKey) {
      throw new Error(
        `In-app purchases are not available on ${platform} yet. Configure the store RevenueCat public key to enable purchases.`,
      );
    }
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    if (!nativeUser) {
      await Purchases.configure({ apiKey, appUserID: identity.appUserId });
    } else if (nativeUser !== identity.appUserId) {
      await Purchases.logIn({ appUserID: identity.appUserId });
    }
    nativeUser = identity.appUserId;
    const offerings = await Purchases.getOfferings();
    const packages =
      offerings.all[identity.offering]?.availablePackages ??
      offerings.current?.availablePackages ??
      [];
    const plans = packages
      .flatMap((pkg): BillingPlan[] => {
        const product = pkg.product;
        const option = product.defaultOption;
        if (option) {
          if (option.isPrepaid || option.installmentsInfo || option.introPhase) return [];
          const iso = option.billingPeriod?.iso8601 ?? product.subscriptionPeriod ?? "";
          const kind = planKind(pkg.identifier, product.identifier, iso);
          if (!kind) return [];
          return [
            {
              id: pkg.identifier,
              kind,
              price: option.fullPricePhase?.price.formatted ?? product.priceString,
              period: periodLabel(iso),
              trialDays: sevenDayTrial(
                option.freePhase?.billingPeriod.iso8601,
                !!option.introPhase,
              ),
              purchase: () => Purchases.purchaseSubscriptionOption({ subscriptionOption: option }),
            },
          ];
        }
        if (platform === "ios") {
          const iso = product.subscriptionPeriod ?? "";
          const kind = planKind(pkg.identifier, product.identifier, iso);
          if (!kind) return [];
          const intro = product.introPrice;
          const hasPaidIntro = !!intro && intro.price > 0;
          const trialIso =
            intro && intro.price === 0
              ? `P${intro.periodNumberOfUnits}${intro.periodUnit.slice(0, 1).toUpperCase()}`
              : null;
          return [
            {
              id: pkg.identifier,
              kind,
              price: product.priceString,
              period: periodLabel(iso),
              trialDays: sevenDayTrial(trialIso, hasPaidIntro),
              purchase: () => Purchases.purchasePackage({ aPackage: pkg }),
            },
          ];
        }
        return [];
      })
      .sort((a, b) => PLAN_ORDER[a.kind] - PLAN_ORDER[b.kind]);
    if (!plans.length) {
      throw new Error("Subscription plans are temporarily unavailable. Please try again.");
    }
    return { plans, restore: () => Purchases.restorePurchases() };
  }

  if (!identity.webApiKey) {
    throw new Error(
      "Web subscriptions are not configured yet. Configure REVENUECAT_WEB_PUBLIC_KEY in your production environment.",
    );
  }

  const { Purchases } = await import("@revenuecat/purchases-js");
  const sdk = webUser
    ? Purchases.getSharedInstance()
    : Purchases.configure({ apiKey: identity.webApiKey, appUserId: identity.appUserId });
  if (webUser && webUser !== identity.appUserId) {
    await sdk.changeUser(identity.appUserId);
  }
  webUser = identity.appUserId;

  const targetCurrency = preferredWebCurrency(currency);
  let offerings;
  try {
    offerings = await sdk.getOfferings({
      offeringIdentifier: identity.offering,
      currency: targetCurrency,
    });
  } catch {
    offerings = await sdk.getOfferings();
  }

  const packages =
    offerings.all[identity.offering]?.availablePackages ??
    offerings.current?.availablePackages ??
    [];
  const plans = packages
    .flatMap((pkg): BillingPlan[] => {
      const product = pkg.product;
      if (product.introPricePhase) return [];
      const iso = product.period
        ? `P${product.period.number}${product.period.unit[0].toUpperCase()}`
        : "";
      const kind = planKind(pkg.identifier, product.identifier, iso);
      if (!kind) return [];
      return [
        {
          id: pkg.identifier,
          kind,
          price: product.price.formattedPrice,
          period: periodLabel(iso),
          trialDays: sevenDayTrial(
            product.freeTrialPhase?.periodDuration,
            !!product.introPricePhase,
          ),
          purchase: () => sdk.purchase({ rcPackage: pkg, skipSuccessPage: true }),
        },
      ];
    })
    .sort((a, b) => PLAN_ORDER[a.kind] - PLAN_ORDER[b.kind]);

  if (!plans.length) {
    throw new Error("Subscription plans are temporarily unavailable. Please try again.");
  }

  return { plans, restore: () => sdk.getCustomerInfo() };
}
