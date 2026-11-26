import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { UpgradeModalProvider } from "@/components/upgrade-modal";
import { AuthGate } from "@/components/auth-gate";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";
import { MiaProvider } from "@/components/mia-provider";
import { AuthLayout } from "@/routes/auth";
import {
  normalizePreferences,
  readLocalPreferences,
  shouldOfferOnboarding,
  writeLocalPreferences,
} from "@/lib/preferences";
import { getContinueCooking, setContinueCooking } from "@/lib/continue-cooking";

const mocks = vi.hoisted(() => ({
  pathname: "/auth",
  navigate: vi.fn(),
  session: { user: null, loading: false },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useSearch: () => ({}) }),
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
  useSearch: () => ({}),
  Outlet: () => <div data-testid="outlet" />,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => mocks.session,
  signOutUnified: vi.fn(),
}));

vi.mock("@/hooks/use-premium", () => ({
  usePremium: () => ({ isPremium: false, loading: false, error: null, retry: vi.fn() }),
}));

vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendPasswordReset: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => undefined),
}));

vi.mock("@/lib/preferences.functions", () => ({
  getMyPreferences: vi.fn().mockResolvedValue(null),
  saveMyPreferences: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/billing.functions", () => ({
  getIntroCompletion: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/premium.functions", () => ({
  adminIsAdmin: vi.fn().mockResolvedValue({ isAdmin: false }),
  getMyMiaQuota: vi.fn().mockResolvedValue({
    used: 0,
    limit: 5,
    remaining: 5,
    isPremium: false,
    resetAt: null,
  }),
}));

vi.mock("@/lib/themes.functions", () => ({
  getMyThemePreference: vi.fn().mockResolvedValue(null),
  saveMyThemePreference: vi.fn().mockResolvedValue(null),
}));

describe("Restricted in-app WebView safety", () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
  const originalSessionStorage = Object.getOwnPropertyDescriptor(window, "sessionStorage");

  beforeEach(() => {
    const throwingStorage = {
      getItem: () => {
        throw new DOMException("Access is denied", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("Access is denied", "SecurityError");
      },
      removeItem: () => {
        throw new DOMException("Access is denied", "SecurityError");
      },
      clear: () => {
        throw new DOMException("Access is denied", "SecurityError");
      },
      key: () => null,
      length: 0,
    };

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: throwingStorage,
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: throwingStorage,
    });
  });

  afterEach(() => {
    cleanup();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    if (originalSessionStorage) {
      Object.defineProperty(window, "sessionStorage", originalSessionStorage);
    }
  });

  it("renders root providers and /auth cleanly when WebView blocks localStorage and sessionStorage", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LocaleProvider>
              <UpgradeModalProvider>
                <AuthGate>
                  <ConsumerAccessGate>
                    <MiaProvider>
                      <AuthLayout />
                    </MiaProvider>
                  </ConsumerAccessGate>
                </AuthGate>
              </UpgradeModalProvider>
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>,
      ),
    ).not.toThrow();

    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Email/i })).toBeInTheDocument();
    expect(screen.queryByText(/whop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/This page didn't load/i)).not.toBeInTheDocument();
  });

  it("handles preference and continue-cooking storage helpers safely when storage throws", () => {
    expect(readLocalPreferences()).toBeNull();
    expect(shouldOfferOnboarding()).toBe(false);
    expect(() =>
      writeLocalPreferences(normalizePreferences({ goal: "healthy_cooking" })),
    ).not.toThrow();

    expect(getContinueCooking()).toBeNull();
    expect(() =>
      setContinueCooking({
        slug: "test-pasta",
        name: "Test Pasta",
        image_url: null,
        cooking_time_minutes: 15,
        calories: 400,
      }),
    ).not.toThrow();
  });
});
