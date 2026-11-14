import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthLayout } from "@/routes/auth";
import { FounderCompanyPage } from "@/routes/auth.founder";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";

const mocks = vi.hoisted(() => ({
  pathname: "/auth",
  navigate: vi.fn(),
  session: { user: null as null | { id: string }, loading: false },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useSearch: () => ({}) }),
  useNavigate: () => mocks.navigate,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ location: { pathname: mocks.pathname } }),
  useSearch: () => ({}),
  Outlet: () => <div data-testid="auth-outlet" />,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/use-session", () => ({ useSession: () => mocks.session }));
vi.mock("@/lib/flow-controller", () => ({
  useFlowController: () => ({
    state: "unauthenticated",
    user: null,
    access: { isPremium: false, loading: false, error: null, retry: vi.fn() },
  }),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendPasswordReset: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.pathname = "/auth";
  mocks.session.user = null;
});

afterEach(cleanup);

function mount(ui: ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

describe("Authentication footer and Founder & Company page", () => {
  it("renders Privacy, Help, Terms and Founder & Company links on the authentication footer", () => {
    mount(<AuthLayout />);

    const footerNav = screen.getByRole("navigation", { name: "Authentication footer links" });
    expect(footerNav).toHaveTextContent("Privacy|Help|Terms|Founder & Company");

    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/legal/privacy");
    expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "Founder & Company" })).toHaveAttribute(
      "href",
      "/auth/founder",
    );
  });

  it("renders Samuel (Taz), Taz Technologies, website, ownership and back button on /auth/founder", () => {
    mocks.pathname = "/auth/founder";
    mount(<FounderCompanyPage />);

    expect(screen.getByRole("heading", { name: "Samuel (Taz)" })).toBeInTheDocument();
    expect(screen.getByText(/Founder & Developer of Taz Technologies\./)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Samuel, widely known as Taz, is the founder of Taz Technologies and the creator of MealMate\./,
      ),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Taz Technologies" })).toBeInTheDocument();
    expect(
      screen.getByText(
        /An independent technology brand focused on building modern digital products and experiences\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /MealMate is a product founded and developed under Taz Technologies by Samuel \(Taz\)\./,
      ),
    ).toBeInTheDocument();

    const website = screen.getByRole("link", { name: /https:\/\/mealsmates\.site/i });
    expect(website).toHaveAttribute("href", "https://mealsmates.site");

    expect(screen.getByRole("link", { name: /Back to sign in/i })).toHaveAttribute("href", "/auth");
  });

  it("permits unauthenticated access to /auth/founder through ConsumerAccessGate", () => {
    mocks.pathname = "/auth/founder";
    mount(
      <ConsumerAccessGate>
        <div>Founder &amp; Company public view</div>
      </ConsumerAccessGate>,
    );

    expect(screen.getByText("Founder & Company public view")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
