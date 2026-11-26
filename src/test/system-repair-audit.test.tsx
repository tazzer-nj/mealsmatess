import { render, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const whopMocks = vi.hoisted(() => ({
  cancelMembership: vi.fn(),
  listMemberships: vi.fn(),
  accessGet: vi.fn(),
  subGet: vi.fn(),
  accessSet: vi.fn(),
  subSet: vi.fn(),
  profileSet: vi.fn(),
}));

const aiMocks = vi.hoisted(() => ({
  waitForAuth: vi.fn(),
}));

vi.mock("@whop/sdk", () => ({
  WhopClient: class {
    memberships = {
      cancel: whopMocks.cancelMembership,
      list: whopMocks.listMemberships,
    };
  },
}));

vi.mock("@/server/firebase-admin", () => ({
  getFirebaseAdminFirestore: () => ({
    collection: (name: string) => ({
      doc: (_id: string) => {
        if (name === "whop_access") {
          return {
            get: whopMocks.accessGet,
            set: whopMocks.accessSet,
          };
        }
        if (name === "subscriptions") {
          return {
            get: whopMocks.subGet,
            set: whopMocks.subSet,
          };
        }
        return {
          get: vi.fn().mockResolvedValue({ exists: false, data: () => undefined }),
          set: whopMocks.profileSet,
        };
      },
    }),
  }),
  firebaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

vi.mock("@/lib/firebase", () => ({
  waitForFirebaseAuth: aiMocks.waitForAuth,
}));

import { postAuthenticatedAi } from "@/lib/ai-api";
import { cancelWhopMembershipForUser } from "@/server/whop";

describe("MealMate critical system repair audit", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    whopMocks.accessSet.mockResolvedValue(undefined);
    whopMocks.subSet.mockResolvedValue(undefined);
    whopMocks.profileSet.mockResolvedValue(undefined);
    aiMocks.waitForAuth.mockResolvedValue({
      getIdToken: vi.fn().mockResolvedValue("fake-token"),
    });
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  });

  afterEach(() => {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
  });

  it("targets the configured MealMate Firebase project and Firestore database ID", () => {
    expect(firebaseAppletConfig.projectId).toBe("ai-studio-applet-webapp-85feb");
    expect(firebaseAppletConfig.firestoreDatabaseId).toBe(
      "ai-studio-mealsmatess-ce52aaad-6e1c-4c5f-88a6-79cdcaf3f2f9",
    );
  });

  it("maps AI request failures cleanly and never emits the generic fallback string", async () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    await expect(postAuthenticatedAi("/api/mia", { message: "Hi" })).rejects.toThrow(/offline/i);

    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    for (const [status, pattern] of [
      [401, /session expired/i],
      [429, /Too many AI requests/i],
      [503, /temporarily unavailable/i],
    ] as const) {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(null, {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      );
      let caught: Error | null = null;
      try {
        await postAuthenticatedAi("/api/mia", { message: "Hi" });
      } catch (err) {
        caught = err as Error;
      }
      expect(caught).not.toBeNull();
      expect(caught?.message).toMatch(pattern);
      expect(caught?.message).not.toContain("The AI request could not be completed");
    }
  });

  it("cancels an active Whop membership at period end and retains access until expiry", async () => {
    process.env["WHOP_API_KEY"] = "whop_test_key";
    process.env["WHOP_ACCOUNT_ID"] = "biz_test_account";

    const futureIso = "2027-06-01T00:00:00.000Z";
    whopMocks.accessGet.mockResolvedValue({
      exists: true,
      data: () => ({
        is_premium: true,
        tier: "annual",
        status: "active",
        whop_membership_id: "mem_abc123",
        whop_user_id: "user_whop_1",
        period_end: futureIso,
        auto_renew: true,
      }),
    });
    whopMocks.subGet.mockResolvedValue({ exists: false, data: () => undefined });
    whopMocks.cancelMembership.mockResolvedValue({
      id: "mem_abc123",
      status: "active",
      cancel_at_period_end: true,
      current_period_end: futureIso,
    });
    whopMocks.listMemberships.mockResolvedValue({
      data: [
        {
          id: "mem_abc123",
          status: "active",
          cancel_at_period_end: true,
          current_period_end: futureIso,
          variant_id: "var_annual",
          metadata: { plan_kind: "yearly" },
        },
      ],
    });

    const result = await cancelWhopMembershipForUser("uid-cancel-test");
    expect(result.cancelled).toBe(true);
    expect(result.periodEnd).toBe(futureIso);
    expect(result.access.autoRenew).toBe(false);
    expect(whopMocks.cancelMembership).toHaveBeenCalledWith({
      id: "mem_abc123",
      cancel_at_period_end: true,
    });
    expect(whopMocks.accessSet).toHaveBeenCalled();
  });
});

describe("MiaProvider retry preserves voice mode", () => {
  it("retries failed voice turns with voice=true", async () => {
    vi.resetModules();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Mia timed out" }), {
          status: 504,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ reply: "Simmer for 10 minutes." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    globalThis.fetch = fetchMock;
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });

    vi.doMock("@tanstack/react-router", () => ({
      useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
        select({ location: { pathname: "/chat" } }),
    }));
    vi.doMock("@/hooks/use-session", () => ({
      useSession: () => ({ user: { id: "mia-user" }, loading: false, firebaseUser: null }),
    }));
    vi.doMock("@/hooks/use-premium", () => ({
      usePremium: () => ({ isPremium: true, loading: false }),
    }));
    vi.doMock("@/components/upgrade-modal", () => ({
      useOptionalUpgradeModal: () => null,
    }));

    const { MiaProvider } = await import("@/components/mia-provider");
    const { useMia } = await import("@/hooks/use-mia");

    let api: ReturnType<typeof useMia> | null = null;
    function Capture() {
      api = useMia();
      return null;
    }

    render(
      <MiaProvider>
        <Capture />
      </MiaProvider>,
    );

    await act(async () => {
      await expect(api!.ask("How long do I simmer?", { voice: true })).rejects.toThrow();
    });
    await waitFor(() => expect(api!.turns).toHaveLength(1));
    const failedTurn = api!.turns[0];
    expect(failedTurn?.voiceRequested).toBe(true);

    await act(async () => {
      await api!.retry(failedTurn!.id);
    });

    await waitFor(() => expect(api!.turns[0]?.answer).toBe("Simmer for 10 minutes."));
    const secondCallBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body ?? "{}"));
    expect(secondCallBody.voice).toBe(true);
  });
});
