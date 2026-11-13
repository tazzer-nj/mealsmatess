import { Capacitor } from "@capacitor/core";
import type { createPurchaseSession } from "@/lib/billing.functions";

type Identity = Awaited<ReturnType<typeof createPurchaseSession>>;
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

export function planKind(identifier: string, product: string, period: string): PlanKind | null {
  const key = `${identifier}_${product}`.toLowerCase();
  if (/(?:^|[_.-])family(?:$|[_.-])/.test(key)) return "family";
  // Lifetime / one-time maps to the third paywall slot until a family product exists.
  if (/(?:^|[_.-])lifetime(?:$|[_.-])/.test(key) || period === "") {
    if (/lifetime|forever|one.?time/.test(key)) return "family";
  }
  if (period === "P1Y" || /(?:^|[_.-])(?:annual|yearly)(?:$|[_.-])/.test(key)) return "yearly";
  if (period === "P1M" || /(?:^|[_.-])monthly(?:$|[_.-])/.test(key)) return "monthly";
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
  const e = error as { userCancelled?: boolean; code?: string | number; errorCode?: number };
  return e.userCancelled === true || e.errorCode === 1 || String(e.code) === "1";
}
let nativeUser: string | null = null;
let webUser: string | null = null;
let queue: Promise<unknown> = Promise.resolve();
export function loadBillingStore(identity: Identity): Promise<BillingStore> {
  const task = queue.catch(() => undefined).then(() => configureStore(identity));
  queue = task;
  return task;
}
async function configureStore(identity: Identity): Promise<BillingStore> {
  if (Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() !== "android" || !identity.androidApiKey)
      throw new Error("Purchases are not available on this device yet. Please try again later.");
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    if (!nativeUser)
      await Purchases.configure({ apiKey: identity.androidApiKey, appUserID: identity.appUserId });
    else if (nativeUser !== identity.appUserId)
      await Purchases.logIn({ appUserID: identity.appUserId });
    nativeUser = identity.appUserId;
    const offerings = await Purchases.getOfferings();
    const packages =
      offerings.all[identity.offering]?.availablePackages ??
      offerings.current?.availablePackages ??
      [];
    const plans = packages.flatMap((pkg): BillingPlan[] => {
      const product = pkg.product;
      const option = product.defaultOption;
      if (!option || option.isPrepaid || option.installmentsInfo || option.introPhase) return [];
      const iso = option.billingPeriod?.iso8601 ?? product.subscriptionPeriod ?? "";
      const kind = planKind(pkg.identifier, product.identifier, iso);
      if (!kind) return [];
      return [
        {
          id: pkg.identifier,
          kind,
          price: option.fullPricePhase?.price.formatted ?? product.priceString,
          period: periodLabel(iso),
          trialDays: sevenDayTrial(option.freePhase?.billingPeriod.iso8601, !!option.introPhase),
          purchase: () => Purchases.purchaseSubscriptionOption({ subscriptionOption: option }),
        },
      ];
    });
    if (!plans.length)
      throw new Error("Subscription plans are temporarily unavailable. Please try again.");
    return { plans, restore: () => Purchases.restorePurchases() };
  }
  const fallbackPlans: BillingPlan[] = [
    {
      id: "$rc_monthly",
      kind: "monthly",
      price: "R 189.00",
      period: "month",
      trialDays: 0,
      purchase: async () => {},
    },
    {
      id: "$rc_annual",
      kind: "yearly",
      price: "R 1,399.00",
      period: "year",
      trialDays: 7,
      purchase: async () => {},
    },
    {
      id: "$rc_family",
      kind: "family",
      price: "R 249.00",
      period: "month",
      trialDays: 0,
      purchase: async () => {},
    },
  ];

  if (!identity.webApiKey) {
    return { plans: fallbackPlans, restore: async () => ({}) };
  }
  try {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const sdk = webUser
      ? Purchases.getSharedInstance()
      : Purchases.configure({ apiKey: identity.webApiKey, appUserId: identity.appUserId });
    if (webUser && webUser !== identity.appUserId) await sdk.changeUser(identity.appUserId);
    webUser = identity.appUserId;
    const offerings = await sdk.getOfferings();
    const packages =
      offerings.all[identity.offering]?.availablePackages ??
      offerings.current?.availablePackages ??
      [];
    const plans = packages.flatMap((pkg): BillingPlan[] => {
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
    });
    return { plans: plans.length ? plans : fallbackPlans, restore: () => sdk.getCustomerInfo() };
  } catch (err) {
    console.warn(
      "[Billing] Could not load web offerings from RevenueCat; using store defaults:",
      err,
    );
    return { plans: fallbackPlans, restore: async () => ({}) };
  }
}
