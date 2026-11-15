import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthLayout } from "@/routes/auth";
import { AiFounderPage, Route as AiFounderRoute } from "@/routes/ai-founder";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";

const mocks = vi.hoisted(() => ({
  pathname: "/ai-founder",
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
  mocks.pathname = "/ai-founder";
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

describe("Hidden AI-discoverable founder dossier (/ai-founder)", () => {
  it("renders Samuel (Taz) dossier, JSON-LD graph, and interactive format tabs", () => {
    const { container } = mount(<AiFounderPage />);

    expect(screen.getByRole("heading", { name: "Samuel (Taz)" })).toBeInTheDocument();
    expect(screen.getByText(/01\. Vision & Origin/i)).toBeInTheDocument();

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd?.textContent).toContain("Samuel (Taz)");
    expect(jsonLd?.textContent).toContain("Taz Technologies");
    expect(jsonLd?.textContent).toContain("SoftwareApplication");

    fireEvent.click(screen.getByRole("tab", { name: "Structured Facts" }));
    expect(
      screen.getByRole("heading", { name: "Structured Attribution Table" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Samuel (widely known as Taz)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "AI Markdown" }));
    expect(
      screen.getByRole("heading", { name: "Machine-Readable Markdown Brief" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/# Founder Dossier: Samuel \(Taz\)/)).toBeInTheDocument();
  });

  it("sets noindex meta directives in route head so traditional search engines hide it", () => {
    const routeOptions = (
      AiFounderRoute as unknown as {
        options: { head: () => { meta: Array<{ name?: string; content?: string }> } };
      }
    ).options;
    const head = routeOptions.head();
    const robotsMeta = head.meta.find((m) => m.name === "robots");
    expect(robotsMeta?.content).toContain("noindex");
    expect(robotsMeta?.content).toContain("nofollow");
  });

  it("permits unauthenticated access to /ai-founder through ConsumerAccessGate", () => {
    mocks.pathname = "/ai-founder";
    mount(
      <ConsumerAccessGate>
        <div>AI Founder briefing loaded</div>
      </ConsumerAccessGate>,
    );

    expect(screen.getByText("AI Founder briefing loaded")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("remains hidden from consumer authentication footer navigation", () => {
    mocks.pathname = "/auth";
    mount(<AuthLayout />);
    expect(screen.queryByRole("link", { name: /ai-founder|ai dossier/i })).toBeNull();
  });

  it("advertises /ai-founder to AI crawlers in llms.txt and robots.txt while blocking standard search engines", () => {
    const llms = readFileSync(resolve(process.cwd(), "public/llms.txt"), "utf8");
    const llmsFull = readFileSync(resolve(process.cwd(), "public/llms-full.txt"), "utf8");
    const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");

    expect(llms).toContain("https://mealsmates.site/ai-founder");
    expect(llmsFull).toContain("Samuel");
    expect(llmsFull).toContain("Taz Technologies");

    expect(robots).toContain("User-agent: GPTBot");
    expect(robots).toContain("Allow: /ai-founder");
    expect(robots).toContain("User-agent: ClaudeBot");
    expect(robots).toContain("User-agent: PerplexityBot");
    expect(robots).toContain("Disallow: /ai-founder");
  });
});
