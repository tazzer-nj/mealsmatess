import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { PremiumPaywall } from "@/components/premium-paywall";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";
import { MiaProvider } from "@/components/mia-provider";
import { UpgradeModalProvider } from "@/components/upgrade-modal";
import { useMia, type MiaContextValue } from "@/hooks/use-mia";
import {
  MIA_FREE_LIMIT_ERROR_CODE,
  MIA_FREE_LIMIT_MESSAGE,
  readLocalFreeMode,
} from "@/lib/freemium";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  session: {
    user: { id: "free-user", email: "chef@example.com" } as null | { id: string; email?: string },
    loading: false,
  },
  access: { isPremium: false, loading: false, error: null as Error | null, retry: vi.fn() },
  path: "/premium",
  create: vi.fn(),
  load: vi.fn(),
  verify: vi.fn(),
  purchase: vi.fn(),
  restore: vi.fn(),
  intro: vi.fn(),
  prefs: vi.fn(),
  enterFreeMode: vi.fn(),
  getReminder: vi.fn(),
  saveReminder: vi.fn(),
  aiApi: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ location: { pathname: mocks.path } }),
  Link: ({ children, to, onClick }: { children: ReactNode; to: string; onClick?: () => void }) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/use-session", () => ({ useSession: () => mocks.session }));
vi.mock("@/hooks/use-premium", () => ({ usePremium: () => mocks.access }));
vi.mock("@/lib/billing.functions", () => ({
  createPurchaseSession: mocks.create,
  verifyMyPremium: mocks.verify,
  verifyCheckout: mocks.verify,
  getIntroCompletion: mocks.intro,
}));
vi.mock("@/lib/notifications.functions", () => ({
  getTrialReminderPreference: mocks.getReminder,
  saveTrialReminderPreference: mocks.saveReminder,
}));
vi.mock("@/lib/preferences.functions", () => ({
  getMyPreferences: () => mocks.prefs(),
  enterFreeMode: mocks.enterFreeMode,
}));
vi.mock("@/lib/premium.functions", () => ({
  adminIsAdmin: mocks.isAdmin,
}));
vi.mock("@/lib/billing-client", async (original) => ({
  ...(await original<typeof import("@/lib/billing-client")>()),
  loadBillingStore: mocks.load,
}));
vi.mock("@/lib/ai-api", async (original) => ({
  ...(await original<typeof import("@/lib/ai-api")>()),
  postAuthenticatedAi: mocks.aiApi,
}));
vi.mock("@/components/recipe-image", () => ({ RecipeImage: () => <div>Food photograph</div> }));

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
  mocks.session = { user: { id: "free-user", email: "chef@example.com" }, loading: false };
  mocks.access = { isPremium: false, loading: false, error: null, retry: vi.fn() };
  mocks.path = "/premium";
  mocks.create.mockResolvedValue({ appUserId: "synthetic" });
  mocks.verify.mockResolvedValue({ isPremium: false });
  mocks.purchase.mockResolvedValue({});
  mocks.restore.mockResolvedValue({});
  mocks.intro.mockResolvedValue(false);
  mocks.prefs.mockResolvedValue({ onboarding_completed: true, free_mode_entered: false });
  mocks.enterFreeMode.mockResolvedValue({ ok: true, freeModeEntered: true });
  mocks.isAdmin.mockResolvedValue({ isAdmin: false });
  mocks.getReminder.mockResolvedValue({
    enabled: false,
    planId: null,
    remindAt: null,
    channel: null,
  });
  mocks.load.mockResolvedValue({
    offeringId: "default",
    plans: [
      {
        id: "$rc_annual",
        productId: "premium_yearly",
        kind: "yearly",
        price: "$79.99",
        priceAmount: 79.99,
        currencyCode: "USD",
        period: "year",
        trialDays: 3,
        purchase: mocks.purchase,
      },
      {
        id: "$rc_monthly",
        productId: "premium_monthly",
        kind: "monthly",
        price: "$9.99",
        priceAmount: 9.99,
        currencyCode: "USD",
        period: "month",
        trialDays: 0,
        purchase: mocks.purchase,
      },
    ],
    restore: mocks.restore,
  });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("Hide First two-stage paywall and Free Mode entry", () => {
  it("delays X on Paywall 1 (2.5s), transitions to 20% off Paywall 2 with delayed X (2s), and drops into Free Mode", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mount(<PremiumPaywall />);

    expect(await screen.findByText(/Make every meal count\./i)).toBeInTheDocument();
    // X button hidden initially on Paywall 1
    expect(screen.queryByRole("button", { name: "Close offer" })).not.toBeInTheDocument();

    // After 2.5 seconds, X fades in
    act(() => {
      vi.advanceTimersByTime(2550);
    });
    const closePrimary = screen.getByRole("button", { name: "Close offer" });
    fireEvent.click(closePrimary);

    // Paywall 2 (Exit Offer) slides up with X hidden for 2s
    expect(await screen.findByText(/Wait — take 20% off Year 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$63\.99/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Continue with limited free mode" }),
    ).not.toBeInTheDocument();

    // After 2 seconds, X fades in on Paywall 2
    act(() => {
      vi.advanceTimersByTime(2050);
    });
    const closeExit = screen.getByRole("button", { name: "Continue with limited free mode" });
    fireEvent.click(closeExit);

    await waitFor(() => expect(mocks.enterFreeMode).toHaveBeenCalledOnce());
    expect(readLocalFreeMode("free-user")).toBe(true);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true }));
  });

  it("allows Free Mode users into Home & Dining while keeping non-dismissed users on /premium", async () => {
    mocks.path = "/restaurants";
    mocks.prefs.mockResolvedValueOnce({ onboarding_completed: true, free_mode_entered: true });
    mount(
      <ConsumerAccessGate>
        <div>Dining Unlocked</div>
      </ConsumerAccessGate>,
    );
    expect(await screen.findByText("Dining Unlocked")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

describe("Mia 2 free searches limit and Search #3 paywall popup", () => {
  it("tracks 2 free searches, pops up UpgradeModal on Search #3, and handles server 402", async () => {
    mocks.path = "/chat";
    let mia!: MiaContextValue;
    function Capture() {
      mia = useMia();
      return null;
    }

    mocks.aiApi.mockImplementation(
      async (
        _path: string,
        _body: unknown,
        opts?: {
          onQuota?: (q: {
            isPremium: boolean;
            trialActive: boolean;
            freeUsed: number;
            freeLimit: number;
            freeRemaining: number;
          }) => void;
        },
      ) => {
        const callCount = mocks.aiApi.mock.calls.length;
        if (callCount <= 2) {
          opts?.onQuota?.({
            isPremium: false,
            trialActive: false,
            freeUsed: callCount,
            freeLimit: 2,
            freeRemaining: 2 - callCount,
          });
          return { reply: `Suggestion #${callCount}` };
        }
        throw Object.assign(new Error(MIA_FREE_LIMIT_MESSAGE), {
          name: "MiaFreeLimitError",
          code: MIA_FREE_LIMIT_ERROR_CODE,
        });
      },
    );

    mount(
      <UpgradeModalProvider>
        <MiaProvider>
          <Capture />
        </MiaProvider>
      </UpgradeModalProvider>,
    );

    expect(mia.quota?.freeRemaining).toBe(2);

    await act(async () => {
      await mia.ask("Search 1");
    });
    expect(mia.quota?.freeRemaining).toBe(1);

    await act(async () => {
      await mia.ask("Search 2");
    });
    expect(mia.quota?.freeRemaining).toBe(0);

    // Search #3 triggers the paywall modal immediately
    await act(async () => {
      await expect(mia.ask("Search 3")).rejects.toThrow(MIA_FREE_LIMIT_MESSAGE);
    });
    expect(mocks.aiApi).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("dialog")).toHaveTextContent(MIA_FREE_LIMIT_MESSAGE);
    expect(screen.getByRole("link", { name: "Start 3-day free trial" })).toHaveAttribute(
      "href",
      "/premium",
    );
  });
});
