import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  native: true,
  configure: vi.fn(),
  login: vi.fn(),
  offerings: vi.fn(),
  purchase: vi.fn(),
  restore: vi.fn(),
  web: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => mocks.native, getPlatform: () => "android" },
}));
vi.mock("@revenuecat/purchases-capacitor", () => ({
  Purchases: {
    configure: mocks.configure,
    logIn: mocks.login,
    getOfferings: mocks.offerings,
    purchaseSubscriptionOption: mocks.purchase,
    restorePurchases: mocks.restore,
  },
}));
vi.mock("@revenuecat/purchases-js", () => ({ Purchases: { configure: mocks.web } }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.native = true;
});
const identity = {
  isActive: false,
  appUserId: "server-issued",
  offering: "default" as const,
  androidApiKey: "synthetic-public-android",
  iosApiKey: null,
  webApiKey: "synthetic-public-web",
};
const option = {
  isPrepaid: false,
  installmentsInfo: null,
  billingPeriod: { iso8601: "P1Y" },
  fullPricePhase: { price: { formatted: "R399.00" } },
  freePhase: { billingPeriod: { iso8601: "P7D" } },
  introPhase: null,
};
describe("Android RevenueCat store adapter", () => {
  it("uses default offering, exact eligible offer and native restore", async () => {
    mocks.offerings.mockResolvedValue({
      all: {
        default: {
          availablePackages: [
            {
              identifier: "$rc_annual",
              product: { identifier: "annual", defaultOption: option, priceString: "R399.00" },
            },
          ],
        },
        other: { availablePackages: [] },
      },
    });
    const { loadBillingStore } = await import("@/lib/billing-client");
    const store = await loadBillingStore(identity);
    expect(mocks.configure).toHaveBeenCalledWith({
      apiKey: identity.androidApiKey,
      appUserID: identity.appUserId,
    });
    expect(store.plans[0]).toMatchObject({
      kind: "yearly",
      price: "R399.00",
      period: "year",
      trialDays: 7,
    });
    await store.plans[0].purchase();
    expect(mocks.purchase).toHaveBeenCalledWith({ subscriptionOption: option });
    await store.restore();
    expect(mocks.restore).toHaveBeenCalledOnce();
    expect(mocks.web).not.toHaveBeenCalled();
  });
  it("does not switch to web checkout if the native plugin or configuration fails", async () => {
    const { loadBillingStore } = await import("@/lib/billing-client");
    await expect(loadBillingStore({ ...identity, androidApiKey: null })).rejects.toThrow(
      "not available",
    );
    mocks.configure.mockRejectedValueOnce(new Error("plugin unavailable"));
    await expect(loadBillingStore(identity)).rejects.toThrow("plugin unavailable");
    expect(mocks.web).not.toHaveBeenCalled();
  });
  it("does not manufacture products when default is absent", async () => {
    mocks.offerings.mockResolvedValue({ all: { other: { availablePackages: [] } } });
    const { loadBillingStore } = await import("@/lib/billing-client");
    await expect(loadBillingStore(identity)).rejects.toThrow("temporarily unavailable");
  });
});

describe("Web RevenueCat store adapter", () => {
  it("fails closed when webApiKey is missing instead of inventing prices", async () => {
    mocks.native = false;
    const { loadBillingStore } = await import("@/lib/billing-client");
    await expect(loadBillingStore({ ...identity, webApiKey: null })).rejects.toThrow(
      "REVENUECAT_WEB_PUBLIC_KEY",
    );
  });

  it("loads live ZAR offerings for premium_monthly, premium_yearly and premium_family_monthly", async () => {
    mocks.native = false;
    const getOfferings = vi.fn().mockResolvedValue({
      all: {
        default: {
          availablePackages: [
            {
              identifier: "$rc_family",
              product: {
                identifier: "premium_family_monthly",
                price: { formattedPrice: "R 249.00" },
                period: { number: 1, unit: "month" },
                freeTrialPhase: null,
                introPricePhase: null,
              },
            },
            {
              identifier: "$rc_monthly",
              product: {
                identifier: "premium_monthly",
                price: { formattedPrice: "R 189.00" },
                period: { number: 1, unit: "month" },
                freeTrialPhase: null,
                introPricePhase: null,
              },
            },
            {
              identifier: "$rc_annual",
              product: {
                identifier: "premium_yearly",
                price: { formattedPrice: "R 1,399.00" },
                period: { number: 1, unit: "year" },
                freeTrialPhase: { periodDuration: "P7D" },
                introPricePhase: null,
              },
            },
          ],
        },
      },
    });
    const purchase = vi.fn().mockResolvedValue({ customerInfo: {} });
    const getCustomerInfo = vi.fn().mockResolvedValue({});
    mocks.web.mockReturnValue({ getOfferings, purchase, getCustomerInfo, changeUser: vi.fn() });

    const { loadBillingStore, purchaseIsPending, purchaseWasCancelled } =
      await import("@/lib/billing-client");
    const store = await loadBillingStore(identity, "ZAR");
    expect(getOfferings).toHaveBeenCalledWith({ offeringIdentifier: "default", currency: "ZAR" });
    expect(store.plans.map((p) => [p.kind, p.price, p.period, p.trialDays])).toEqual([
      ["monthly", "R 189.00", "month", 0],
      ["yearly", "R 1,399.00", "year", 7],
      ["family", "R 249.00", "month", 0],
    ]);
    await store.plans[1].purchase();
    expect(purchase).toHaveBeenCalledWith({
      rcPackage: expect.objectContaining({ identifier: "$rc_annual" }),
      skipSuccessPage: true,
    });
    await store.restore();
    expect(getCustomerInfo).toHaveBeenCalledOnce();
    expect(purchaseWasCancelled({ errorCode: 1 })).toBe(true);
    expect(purchaseIsPending({ errorCode: 20 })).toBe(true);
  });
});
