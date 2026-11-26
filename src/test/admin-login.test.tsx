import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth-gate";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";
import { AuthLayout } from "@/routes/auth";
import { useFlowController } from "@/lib/flow-controller";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  navigate: vi.fn(),
  session: {
    user: null as null | { id: string; email: string | null; emailVerified?: boolean },
    loading: false,
  },
  premium: { isPremium: false, loading: false, error: null as Error | null, retry: vi.fn() },
  getPrefs: vi.fn(),
  getIntro: vi.fn(),
  adminIsAdmin: vi.fn(),
  signInWithEmail: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useSearch: () => ({}) }),
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
  useSearch: () => ({}),
  Outlet: () => <div data-testid="auth-outlet" />,
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
vi.mock("@/hooks/use-premium", () => ({ usePremium: () => mocks.premium }));
vi.mock("@/lib/preferences.functions", () => ({ getMyPreferences: mocks.getPrefs }));
vi.mock("@/lib/billing.functions", () => ({ getIntroCompletion: mocks.getIntro }));
vi.mock("@/lib/premium.functions", () => ({ adminIsAdmin: mocks.adminIsAdmin }));
vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithGoogle: vi.fn(),
  signInWithEmail: mocks.signInWithEmail,
  signUpWithEmail: vi.fn(),
  sendPasswordReset: vi.fn(),
}));

function mount(ui: ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

function FlowHarness() {
  const flow = useFlowController();
  return (
    <div data-testid="flow-state">
      {flow.state}:{String(flow.isAdmin)}:{String(flow.access.isPremium)}
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pathname = "/";
  mocks.session = { user: null, loading: false };
  mocks.premium = { isPremium: false, loading: false, error: null, retry: vi.fn() };
  mocks.getPrefs.mockResolvedValue(null);
  mocks.getIntro.mockResolvedValue(false);
  mocks.adminIsAdmin.mockResolvedValue({ isAdmin: false });
  mocks.signInWithEmail.mockResolvedValue({
    user: { uid: "admin-uid", email: "ttmine60@gmail.com" },
  });
});

afterEach(cleanup);

describe("Admin direct login access", () => {
  it("grants application_ready and premium immediately for designated admin email accounts", () => {
    mocks.session = {
      user: { id: "uid-admin", email: "ttmine60@gmail.com", emailVerified: false },
      loading: false,
    };

    mount(<FlowHarness />);
    expect(screen.getByTestId("flow-state")).toHaveTextContent("application_ready:true:true");
    expect(mocks.getPrefs).not.toHaveBeenCalled();
    expect(mocks.getIntro).not.toHaveBeenCalled();
  });

  it("grants application_ready immediately for server-verified admin roles without onboarding or subscription", async () => {
    mocks.session = {
      user: { id: "uid-custom-admin", email: "ops@mealsmates.site", emailVerified: true },
      loading: false,
    };
    mocks.adminIsAdmin.mockResolvedValue({ isAdmin: true });

    mount(<FlowHarness />);
    await waitFor(() =>
      expect(screen.getByTestId("flow-state")).toHaveTextContent("application_ready:true:true"),
    );
  });

  it("lets admins through AuthGate without email verification prompt while still gating regular users", () => {
    mocks.session = {
      user: { id: "uid-admin", email: "tatendamkhwanazi6@gmail.com", emailVerified: false },
      loading: false,
    };
    const adminView = mount(
      <AuthGate>
        <div>Home Feed</div>
      </AuthGate>,
    );
    expect(screen.getByText("Home Feed")).toBeInTheDocument();
    expect(screen.queryByText("Verify your email")).not.toBeInTheDocument();
    adminView.unmount();

    mocks.session = {
      user: { id: "uid-user", email: "cook@example.com", emailVerified: false },
      loading: false,
    };
    mount(
      <AuthGate>
        <div>Home Feed</div>
      </AuthGate>,
    );
    expect(screen.getByText("Verify your email")).toBeInTheDocument();
  });

  it("redirects admins straight to / from /onboarding and /premium inside ConsumerAccessGate", async () => {
    mocks.session = {
      user: { id: "uid-admin", email: "ttmine60@gmail.com", emailVerified: true },
      loading: false,
    };
    mocks.pathname = "/premium";

    mount(
      <ConsumerAccessGate>
        <div>Paywall view</div>
      </ConsumerAccessGate>,
    );

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true }));
  });

  it("renders only Google and Email sign-in options on /auth without Whop auth", () => {
    mocks.pathname = "/auth";
    mount(<AuthLayout />);

    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue with Email/i })).toBeInTheDocument();
    expect(screen.queryByText(/whop/i)).not.toBeInTheDocument();
  });

  it("navigates straight to / after email login for an admin account", async () => {
    mocks.pathname = "/auth";
    mount(<AuthLayout />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with email/i }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ttmine60@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true }));
  });
});
