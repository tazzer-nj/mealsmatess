import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PremiumPaywall } from "@/components/premium-paywall";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";
import { Route } from "@/routes/welcome";
import { planKind, sevenDayTrial } from "@/lib/billing-client";
import type { ComponentType, ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  session: { user: null as null | { id: string }, loading: false },
  access: { isPremium: false, loading: false, error: null as Error | null, retry: vi.fn() },
  path: "/planner",
  create: vi.fn(),
  load: vi.fn(),
  verify: vi.fn(),
  purchase: vi.fn(),
  restore: vi.fn(),
  intro: vi.fn(),
  complete: vi.fn(),
  prefs: vi.fn(),
  getReminder: vi.fn(),
  saveReminder: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ location: { pathname: mocks.path } }),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock("@/hooks/use-session", () => ({ useSession: () => mocks.session }));
vi.mock("@/hooks/use-premium", () => ({ usePremium: () => mocks.access }));
vi.mock("@/lib/billing.functions", () => ({
  createPurchaseSession: mocks.create,
  verifyMyPremium: mocks.verify,
  verifyCheckout: mocks.verify,
  getIntroCompletion: mocks.intro,
  completeIntro: mocks.complete,
}));
vi.mock("@/lib/notifications.functions", () => ({
  getTrialReminderPreference: mocks.getReminder,
  saveTrialReminderPreference: mocks.saveReminder,
}));
vi.mock("@/lib/preferences.functions", () => ({ getMyPreferences: () => mocks.prefs() }));
vi.mock("@/lib/billing-client", async (original) => ({
  ...(await original<typeof import("@/lib/billing-client")>()),
  loadBillingStore: mocks.load,
}));
vi.mock("@/components/recipe-image", () => ({ RecipeImage: () => <div>Food photograph</div> }));

const Welcome = Route.options.component as ComponentType;

function mount(children: ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  onlineManager.setOnline(true);
  localStorage.clear();
  mocks.session.user = null;
  mocks.path = "/planner";
  mocks.access = { isPremium: false, loading: false, error: null, retry: vi.fn() };
  mocks.create.mockResolvedValue({ appUserId: "synthetic" });
  mocks.verify.mockResolvedValue({ isPremium: true });
  mocks.purchase.mockResolvedValue({});
  mocks.restore.mockResolvedValue({});
  mocks.intro.mockResolvedValue(false);
  mocks.complete.mockResolvedValue(true);
  mocks.prefs.mockResolvedValue(null);
  mocks.getReminder.mockResolvedValue({
    enabled: false,
    planId: null,
    remindAt: null,
    channel: null,
  });
  mocks.saveReminder.mockResolvedValue({
    enabled: true,
    planId: "yearly",
    remindAt: "2026-11-26T00:00:00Z",
    channel: "in_app",
  });
  mocks.load.mockResolvedValue({
    offeringId: "default",
    plans: [
      {
        id: "yearly",
        productId: "premium_yearly",
        kind: "yearly",
        price: "R1,399.00",
        priceAmount: 1399,
        currencyCode: "ZAR",
        period: "year",
        trialDays: 7,
        purchase: mocks.purchase,
      },
    ],
    restore: mocks.restore,
  });
});

afterEach(cleanup);

describe("onboarding and mandatory paywall", () => {
  it("finishes 6 app tour sections and marks tour complete", async () => {
    mocks.session.user = { id: "subscriber" };
    mount(<Welcome />);
    for (let step = 1; step <= 5; step++) {
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(step));
      fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    }
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "6");
    fireEvent.click(screen.getByRole("button", { name: /Get Started/i }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true }));
    expect(mocks.complete).toHaveBeenCalled();
  });

  it("resumes a confirmed purchase without offering another checkout", async () => {
    mocks.create.mockResolvedValueOnce({ appUserId: "existing", isActive: true });
    mount(<PremiumPaywall />);
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/auth", replace: true }),
    );
    expect(mocks.load).not.toHaveBeenCalled();
    expect(mocks.purchase).not.toHaveBeenCalled();
  });

  it("keeps cancelled checkout on the paywall with no free exit", async () => {
    mocks.purchase.mockRejectedValue({ userCancelled: true });
    mount(<PremiumPaywall />);
    fireEvent.click(await screen.findByRole("button", { name: "Start my free trial" }));
    await screen.findByText(/Checkout cancelled/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(screen.queryByText(/Continue Free|Skip|Close paywall/)).not.toBeInTheDocument();
    expect(screen.getByText(/7-day free trial, then R1,399.00\/year/i)).toBeInTheDocument();
  });

  it("handles pending store payments without opening the app", async () => {
    mocks.purchase.mockRejectedValue({ errorCode: 20, name: "PaymentPendingError" });
    mount(<PremiumPaywall />);
    fireEvent.click(await screen.findByRole("button", { name: "Start my free trial" }));
    await screen.findByText(/pending confirmation/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Check subscription access" })).toBeEnabled();
  });

  it("waits for server verification after payment before opening app tour or sign-in", async () => {
    let resolve!: (value: unknown) => void;
    mocks.verify.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    mount(<PremiumPaywall />);
    fireEvent.click(await screen.findByRole("button", { name: "Start my free trial" }));
    await waitFor(() => expect(mocks.verify).toHaveBeenCalled());
    expect(mocks.navigate).not.toHaveBeenCalled();
    resolve({ isPremium: true });
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/auth", replace: true }),
    );
  });

  it("restores an existing account without another purchase", async () => {
    mocks.session.user = { id: "subscriber" };
    mount(<PremiumPaywall />);
    const restoreButtons = await screen.findAllByRole("button", { name: "Restore Purchases" });
    await waitFor(() => expect(restoreButtons[0]).not.toBeDisabled());
    fireEvent.click(restoreButtons[0]);
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/welcome", replace: true }),
    );
    expect(mocks.restore).toHaveBeenCalledOnce();
    expect(mocks.purchase).not.toHaveBeenCalled();
  });

  it("keeps failed verification retryable without opening the app", async () => {
    mocks.verify.mockRejectedValue(new Error("offline"));
    mount(<PremiumPaywall />);
    fireEvent.click(await screen.findByRole("button", { name: "Start my free trial" }));
    await screen.findByText(/couldn’t confirm/);
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Check subscription access" })).toBeEnabled();
  });

  it("keeps an inactive restored purchase on the paywall", async () => {
    mocks.verify.mockResolvedValue({ isPremium: false });
    mount(<PremiumPaywall />);
    const restoreButtons = await screen.findAllByRole("button", { name: "Restore Purchases" });
    await waitFor(() => expect(restoreButtons[0]).not.toBeDisabled());
    fireEvent.click(restoreButtons[0]);
    await screen.findByText(/subscription isn’t confirmed/, {}, { timeout: 4000 });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.purchase).not.toHaveBeenCalled();
  });

  it("blocks checkout while offline", async () => {
    mount(<PremiumPaywall />);
    const purchase = await screen.findByRole("button", { name: "Start my free trial" });
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
    fireEvent(window, new Event("offline"));
    expect(purchase).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("You’re offline");
    expect(mocks.purchase).not.toHaveBeenCalled();
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
    fireEvent(window, new Event("online"));
  });

  it("shows an honest error and retry button when RevenueCat offerings fail (no fake prices)", async () => {
    mocks.load.mockRejectedValue(new Error("RevenueCat unavailable"));
    mount(<PremiumPaywall />);
    await screen.findByText(/Subscription plans unavailable/);
    expect(screen.getByRole("button", { name: /Retry loading plans/i })).toBeEnabled();
    expect(screen.queryByText(/R399\.00|R189\.00|R249\.00/)).not.toBeInTheDocument();
  });

  it("shows truthful trial vs paid copy, accurate savings, View all plans, and trial reminder toggle", async () => {
    mocks.session.user = { id: "subscriber" };
    mocks.load.mockResolvedValueOnce({
      offeringId: "default",
      plans: [
        {
          id: "$rc_monthly",
          productId: "premium_monthly",
          kind: "monthly",
          price: "R189.00",
          priceAmount: 189,
          currencyCode: "ZAR",
          period: "month",
          trialDays: 0,
          purchase: mocks.purchase,
        },
        {
          id: "$rc_annual",
          productId: "premium_yearly",
          kind: "yearly",
          price: "R1,399.00",
          priceAmount: 1399,
          currencyCode: "ZAR",
          period: "year",
          trialDays: 7,
          purchase: mocks.purchase,
        },
        {
          id: "$rc_family",
          productId: "premium_family_monthly",
          kind: "family",
          price: "R249.00",
          priceAmount: 249,
          currencyCode: "ZAR",
          period: "month",
          trialDays: 3,
          purchase: mocks.purchase,
        },
      ],
      restore: mocks.restore,
    });
    mount(<PremiumPaywall />);
    expect(await screen.findByText(/Make every meal count\./i)).toBeInTheDocument();
    expect(screen.getByText(/BEST VALUE · Save 38%/)).toBeInTheDocument();
    expect(screen.getByText(/Start your 7-day free trial\./)).toBeInTheDocument();

    // Toggle trial reminder on
    const toggle = screen.getByRole("switch", { name: /Remind me before my trial ends\./i });
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(mocks.saveReminder).toHaveBeenCalledWith({
        data: expect.objectContaining({ enabled: true, trialDays: 7 }),
      }),
    );
    expect(await screen.findByText(/Reminder saved for/i)).toBeInTheDocument();

    // Switching to Monthly (no trial) must switch CTA to "Subscribe to Premium" and hide free trial wording
    fireEvent.click(screen.getByText("Monthly Premium"));
    expect(screen.getByRole("button", { name: "Subscribe to Premium" })).toBeEnabled();
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === "P" && /R189\.00\s+due\s+today/i.test(element.textContent ?? ""),
      ),
    ).toBeInTheDocument();

    // Open View all plans dialog and select Family Premium
    fireEvent.click(screen.getByRole("button", { name: /View all plans/i }));
    const dialog = await screen.findByRole("dialog", { name: /All MealMate Premium plans/i });
    expect(dialog).toHaveTextContent("Family Premium");
    expect(dialog).toHaveTextContent("R249.00");
    fireEvent.click(screen.getByRole("button", { name: /Family Premium/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not invent trial eligibility or map unrelated package names", () => {
    expect(sevenDayTrial("P7D", false)).toBe(7);
    expect(sevenDayTrial("P1W", false)).toBe(7);
    expect(sevenDayTrial("P3D", false)).toBe(0);
    expect(sevenDayTrial("P7D", true)).toBe(0);
    expect(planKind("family", "household", "P1M")).toBe("family");
    expect(planKind("a", "product", "P1Y")).toBe("yearly");
    expect(planKind("a", "product", "P3M")).toBeNull();
  });
});

describe("Consumer route enforcement", () => {
  it("redirects an unauthenticated user to /auth without mounting protected content", async () => {
    mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/auth", replace: true }),
    );
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
  });

  it("redirects authenticated user without onboarding to /onboarding", async () => {
    mocks.session.user = { id: "new-user" };
    mocks.prefs.mockResolvedValue(null);
    mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/onboarding", replace: true }),
    );
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
  });

  it("redirects completed onboarding without premium to /premium", async () => {
    mocks.session.user = { id: "onboarded-unpaid" };
    mocks.prefs.mockResolvedValue({ onboarding_completed: true });
    mocks.access.isPremium = false;
    mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
  });

  it("redirects verified premium subscriber without tour to /welcome", async () => {
    mocks.session.user = { id: "paid-notour" };
    mocks.prefs.mockResolvedValue({ onboarding_completed: true });
    mocks.access.isPremium = true;
    mocks.intro.mockResolvedValue(false);
    mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/welcome", replace: true }),
    );
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
  });

  it("blocks pending and failed verification, and admits verified subscribers with completed tour", async () => {
    mocks.session.user = { id: "subscriber" };
    mocks.prefs.mockResolvedValue({ onboarding_completed: true });
    mocks.intro.mockResolvedValue(true);
    mocks.access.loading = true;
    const page = mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
    page.unmount();

    mocks.access.loading = false;
    mocks.access.error = new Error("offline");
    const failure = mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    await screen.findByText(/couldn’t verify/);
    expect(screen.queryByText("Protected app")).not.toBeInTheDocument();
    failure.unmount();

    mocks.access.error = null;
    mocks.access.isPremium = true;
    mount(
      <ConsumerAccessGate>
        <div>Protected app</div>
      </ConsumerAccessGate>,
    );
    expect(await screen.findByText("Protected app")).toBeInTheDocument();
  });

  it("keeps legal and sign-in recovery available without exposing the app", () => {
    mocks.path = "/legal/terms";
    mount(
      <ConsumerAccessGate>
        <div>Legal terms</div>
      </ConsumerAccessGate>,
    );
    expect(screen.getByText("Legal terms")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("never traps /premium behind subscription-error or checking-access screens", () => {
    mocks.session.user = { id: "user-on-paywall" };
    mocks.path = "/premium";
    mocks.access.error = new Error("offline");
    const errored = mount(
      <ConsumerAccessGate>
        <div>Paywall Screen</div>
      </ConsumerAccessGate>,
    );
    expect(screen.getByText("Paywall Screen")).toBeInTheDocument();
    expect(screen.queryByText(/Let’s check your subscription/)).not.toBeInTheDocument();
    errored.unmount();

    mocks.access.error = null;
    mocks.access.loading = true;
    mount(
      <ConsumerAccessGate>
        <div>Paywall Screen</div>
      </ConsumerAccessGate>,
    );
    expect(screen.getByText("Paywall Screen")).toBeInTheDocument();
    expect(screen.queryByText(/Checking your access/)).not.toBeInTheDocument();
  });
});
