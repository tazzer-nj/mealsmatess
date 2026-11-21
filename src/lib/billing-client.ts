import { Capacitor } from "@capacitor/core";
import type { createPurchaseSession } from "@/lib/billing.functions";
import { detectCurrency, type CurrencyCode } from "@/lib/currency";

type Identity = Awaited<ReturnType<typeof createPurchaseSession>> & {
  iosApiKey?: string | null;
};

export type PlanKind = "monthly" | "yearly" | "family";

export type BillingPlan = {
  id: string;
  productId?: string;
  title?: string;
  kind: PlanKind;
  price: string;
  priceAmount?: number | null;
  currencyCode?: string | null;
  period: string;
  periodUnit?: "day" | "week" | "month" | "year" | "once";
  trialDays: number;
  purchase: () => Promise<unknown>;
};

export type BillingStore = {
  offeringId?: string;
  plans: BillingPlan[];
  exitOfferPlan?: BillingPlan | null;
  restore: () => Promise<unknown>;
};

const PLAN_ORDER: Record<PlanKind, number> = { monthly: 0, yearly: 1, family: 2 };

export function planKind(identifier: string, product: string, period: string): PlanKind | null {
  const key = `${identifier}_${product}`.toLowerCase();
  if (
    /(?:^|[_.-])family(?:$|[_.-])/.test(key) ||
    key.includes("premium_family_monthly") ||
    key.includes("premium_family")
  ) {
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

export function periodUnitFromIso(iso: string): "day" | "week" | "month" | "year" | "once" {
  if (!iso) return "once";
  const match = /^P\d+([DWMY])$/.exec(iso);
  if (!match) return "month";
  return (
    ({ D: "day", W: "week", M: "month", Y: "year" } as const)[match[1] as "D" | "W" | "M" | "Y"] ??
    "month"
  );
}

/** Parse an ISO-8601 duration string (e.g., "P7D", "P3D", "P1W", "P1M") into whole days. */
export function parseTrialDaysFromIso(iso: string | null | undefined): number {
  if (!iso || typeof iso !== "string") return 0;
  const match = /^P(\d+)([DWMY])$/i.exec(iso.trim());
  if (!match) return 0;
  const count = Number(match[1]);
  if (!Number.isFinite(count) || count <= 0) return 0;
  switch (match[2].toUpperCase()) {
    case "D":
      return count;
    case "W":
      return count * 7;
    case "M":
      return count * 30;
    case "Y":
      return count * 365;
    default:
      return 0;
  }
}

export function sevenDayTrial(iso: string | null | undefined, hasIntroPrice: boolean): number {
  return !hasIntroPrice && (iso === "P7D" || iso === "P1W") ? 7 : 0;
}

export function parseNumericPrice(
  formattedPrice: string | null | undefined,
  amountMicros?: number | null,
): number | null {
  if (typeof amountMicros === "number" && Number.isFinite(amountMicros) && amountMicros > 0) {
    return amountMicros / 1_000_000;
  }
  if (!formattedPrice) return null;
  const cleaned = formattedPrice.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;
  // Handle both "1,399.00" and "1 399,00" styles cleanly
  const commaCount = (cleaned.match(/,/g) ?? []).length;
  const dotCount = (cleaned.match(/\./g) ?? []).length;
  let normalized = cleaned;
  if (commaCount > 0 && dotCount > 0) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (commaCount === 1 && /,\d{2}$/.test(cleaned)) {
    normalized = cleaned.replace(",", ".");
  } else {
    normalized = cleaned.replace(/,/g, "");
  }
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Returns the mathematically accurate savings percentage of yearly vs 12x monthly,
 * or null when monthly/yearly pricing isn't comparable or yields no savings.
 */
export function calculateAnnualSavingsPercent(
  monthly: BillingPlan | undefined,
  yearly: BillingPlan | undefined,
): number | null {
  if (!monthly || !yearly) return null;
  if (monthly.currencyCode && yearly.currencyCode && monthly.currencyCode !== yearly.currencyCode) {
    return null;
  }
  const monthlyAmt = monthly.priceAmount ?? parseNumericPrice(monthly.price);
  const yearlyAmt = yearly.priceAmount ?? parseNumericPrice(yearly.price);
  if (!monthlyAmt || !yearlyAmt || monthlyAmt <= 0 || yearlyAmt <= 0) return null;
  const annualized = monthlyAmt * 12;
  if (yearlyAmt >= annualized) return null;
  const pct = Math.round(((annualized - yearlyAmt) / annualized) * 100);
  return pct >= 1 ? pct : null;
}

export function formatZeroToday(currencyCode?: string | null, priceSample?: string): string {
  const code = currencyCode?.toUpperCase();
  if (code === "ZAR" || (!code && priceSample?.trim().startsWith("R"))) return "R0";
  if (code === "USD" || (!code && priceSample?.trim().startsWith("$"))) return "$0";
  if (code === "EUR" || (!code && priceSample?.trim().startsWith("€"))) return "€0";
  if (code === "GBP" || (!code && priceSample?.trim().startsWith("£"))) return "£0";
  if (code) {
    try {
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 0,
      }).format(0);
    } catch {
      return `${code} 0`;
    }
  }
  return "R0";
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
let sdkPreloadPromise: Promise<unknown> | null = null;

const STORE_CACHE_TTL_MS = 5 * 60_000;
const storeCache = new Map<string, { expiresAt: number; store: BillingStore }>();
const inFlightStoreLoads = new Map<string, Promise<BillingStore>>();

function isTestEnv() {
  return typeof process !== "undefined" && Boolean(process.env["VITEST"]);
}

export function preloadBillingSdk(): void {
  if (typeof window === "undefined" || isTestEnv() || Capacitor.isNativePlatform()) return;
  if (!sdkPreloadPromise) {
    sdkPreloadPromise = import("@revenuecat/purchases-js").catch(() => undefined);
  }
}

export function getCachedBillingStore(
  appUserId: string,
  currency?: CurrencyCode,
): BillingStore | null {
  if (isTestEnv()) return null;
  const targetCurrency = preferredWebCurrency(currency);
  const key = `${appUserId}:${targetCurrency}`;
  const entry = storeCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    storeCache.delete(key);
    return null;
  }
  return entry.store;
}

export function loadBillingStore(
  identity: Identity,
  currency?: CurrencyCode,
): Promise<BillingStore> {
  if (!isTestEnv()) {
    const targetCurrency = preferredWebCurrency(currency);
    const key = `${identity.appUserId}:${targetCurrency}`;
    const cached = getCachedBillingStore(identity.appUserId, currency);
    if (cached) return Promise.resolve(cached);

    const existing = inFlightStoreLoads.get(key);
    if (existing) return existing;

    const task = queue
      .catch(() => undefined)
      .then(() => configureStore(identity, currency))
      .then((store) => {
        storeCache.set(key, { expiresAt: Date.now() + STORE_CACHE_TTL_MS, store });
        return store;
      })
      .finally(() => {
        if (inFlightStoreLoads.get(key) === task) inFlightStoreLoads.delete(key);
      });
    queue = task;
    inFlightStoreLoads.set(key, task);
    return task;
  }

  const task = queue.catch(() => undefined).then(() => configureStore(identity, currency));
  queue = task;
  return task;
}

function webTrialDays(freeTrialPhase: unknown): number {
  if (!freeTrialPhase || typeof freeTrialPhase !== "object") return 0;
  const phase = freeTrialPhase as {
    periodDuration?: string | null;
    period?: { number?: number; unit?: string } | null;
  };
  if (typeof phase.periodDuration === "string" && phase.periodDuration) {
    return parseTrialDaysFromIso(phase.periodDuration);
  }
  if (phase.period?.number && phase.period?.unit) {
    const iso = `P${phase.period.number}${phase.period.unit[0].toUpperCase()}`;
    return parseTrialDaysFromIso(iso);
  }
  return 0;
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
    const selectedOffering = offerings.all[identity.offering] ?? offerings.current;
    const packages = selectedOffering?.availablePackages ?? [];
    const mapNativePackage = (pkg: (typeof packages)[number]): BillingPlan[] => {
      const product = pkg.product as unknown as {
        identifier: string;
        title?: string;
        priceString: string;
        price?: number;
        currencyCode?: string;
        subscriptionPeriod?: string | null;
        introPrice?: {
          price: number;
          periodNumberOfUnits: number;
          periodUnit: string;
        } | null;
        defaultOption?: {
          isPrepaid?: boolean;
          installmentsInfo?: unknown;
          introPhase?: unknown;
          freePhase?: { billingPeriod?: { iso8601?: string } | null } | null;
          billingPeriod?: { iso8601?: string } | null;
          fullPricePhase?: {
            price?: { formatted?: string; amountMicros?: number; currencyCode?: string };
          } | null;
        } | null;
      };
      const option = product.defaultOption;
      if (option) {
        if (option.isPrepaid || option.installmentsInfo || option.introPhase) return [];
        const iso = option.billingPeriod?.iso8601 ?? product.subscriptionPeriod ?? "";
        const kind = planKind(pkg.identifier, product.identifier, iso);
        if (!kind) return [];
        const formatted = option.fullPricePhase?.price?.formatted ?? product.priceString;
        const amountMicros = option.fullPricePhase?.price?.amountMicros ?? null;
        const trialIso = option.freePhase?.billingPeriod?.iso8601 ?? null;
        return [
          {
            id: pkg.identifier,
            productId: product.identifier,
            title: product.title,
            kind,
            price: formatted,
            priceAmount: parseNumericPrice(formatted, amountMicros) ?? product.price ?? null,
            currencyCode:
              option.fullPricePhase?.price?.currencyCode ?? product.currencyCode ?? null,
            period: periodLabel(iso),
            periodUnit: periodUnitFromIso(iso),
            trialDays: parseTrialDaysFromIso(trialIso),
            purchase: () =>
              Purchases.purchaseSubscriptionOption({
                subscriptionOption: option as never,
              }),
          },
        ];
      }
      if (platform === "ios") {
        const iso = product.subscriptionPeriod ?? "";
        const kind = planKind(pkg.identifier, product.identifier, iso);
        if (!kind) return [];
        const intro = product.introPrice;
        const trialIso =
          intro && intro.price === 0
            ? `P${intro.periodNumberOfUnits}${intro.periodUnit.slice(0, 1).toUpperCase()}`
            : null;
        return [
          {
            id: pkg.identifier,
            productId: product.identifier,
            title: product.title,
            kind,
            price: product.priceString,
            priceAmount:
              typeof product.price === "number" && product.price > 0
                ? product.price
                : parseNumericPrice(product.priceString),
            currencyCode: product.currencyCode ?? null,
            period: periodLabel(iso),
            periodUnit: periodUnitFromIso(iso),
            trialDays: parseTrialDaysFromIso(trialIso),
            purchase: () => Purchases.purchasePackage({ aPackage: pkg }),
          },
        ];
      }
      return [];
    };

    const plans = packages
      .flatMap(mapNativePackage)
      .sort((a, b) => PLAN_ORDER[a.kind] - PLAN_ORDER[b.kind]);
    if (!plans.length) {
      throw new Error("Subscription plans are temporarily unavailable. Please try again.");
    }
    const exitOffering =
      offerings.all["exit_offer"] ?? offerings.all["annual_discount"] ?? offerings.all["discount"];
    const exitPlans = (exitOffering?.availablePackages ?? []).flatMap(mapNativePackage);
    const exitOfferPlan = exitPlans.find((p) => p.kind === "yearly") ?? exitPlans[0] ?? null;

    return {
      offeringId: selectedOffering?.identifier ?? identity.offering,
      plans,
      exitOfferPlan,
      restore: () => Purchases.restorePurchases(),
    };
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

  const selectedOffering = offerings.all[identity.offering] ?? offerings.current;
  const packages = selectedOffering?.availablePackages ?? [];
  const mapWebPackage = (pkg: (typeof packages)[number]): BillingPlan[] => {
    const product = pkg.product as unknown as {
      identifier: string;
      title?: string;
      price: {
        formattedPrice: string;
        amountMicros?: number;
        amount?: number;
        currency?: string;
      };
      period?: { number: number; unit: string } | null;
      freeTrialPhase?: unknown;
      introPricePhase?: unknown;
    };
    if (product.introPricePhase && !product.freeTrialPhase) return [];
    const iso = product.period
      ? `P${product.period.number}${product.period.unit[0].toUpperCase()}`
      : "";
    const kind = planKind(pkg.identifier, product.identifier, iso);
    if (!kind) return [];
    const formatted = product.price.formattedPrice;
    const numeric =
      typeof product.price.amount === "number" && product.price.amount > 0
        ? product.price.amount
        : parseNumericPrice(formatted, product.price.amountMicros);
    return [
      {
        id: pkg.identifier,
        productId: product.identifier,
        title: product.title,
        kind,
        price: formatted,
        priceAmount: numeric,
        currencyCode: product.price.currency ?? targetCurrency,
        period: periodLabel(iso),
        periodUnit: periodUnitFromIso(iso),
        trialDays: webTrialDays(product.freeTrialPhase),
        purchase: () => sdk.purchase({ rcPackage: pkg, skipSuccessPage: true }),
      },
    ];
  };

  const plans = packages
    .flatMap(mapWebPackage)
    .sort((a, b) => PLAN_ORDER[a.kind] - PLAN_ORDER[b.kind]);

  if (!plans.length) {
    throw new Error("Subscription plans are temporarily unavailable. Please try again.");
  }

  const exitOffering =
    offerings.all["exit_offer"] ?? offerings.all["annual_discount"] ?? offerings.all["discount"];
  const exitPlans = (exitOffering?.availablePackages ?? []).flatMap(mapWebPackage);
  const exitOfferPlan = exitPlans.find((p) => p.kind === "yearly") ?? exitPlans[0] ?? null;

  return {
    offeringId: selectedOffering?.identifier ?? identity.offering,
    plans,
    exitOfferPlan,
    restore: () => sdk.getCustomerInfo(),
  };
}
