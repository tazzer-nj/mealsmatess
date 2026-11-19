import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthLayout } from "@/routes/auth";
import { AboutPage, Route as AboutRoute } from "@/routes/about";
import { ConsumerAccessGate } from "@/components/consumer-access-gate";

const mocks = vi.hoisted(() => ({
  pathname: "/about",
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
  mocks.pathname = "/about";
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

describe("Public Google & AI Search Feature Visibility (/about & crawler manifests)", () => {
  it("renders all core MealMate features and Schema.org SoftwareApplication + FAQPage JSON-LD", () => {
    const { container } = mount(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: "Discover. Plan. Eat. Enjoy." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mia AI Voice Sous Chef")).toBeInTheDocument();
    expect(screen.getByText("Fridge & Ingredient Photo Scanner")).toBeInTheDocument();
    expect(screen.getByText("Personalized AI Recipe Generator")).toBeInTheDocument();
    expect(screen.getByText("Smart Pantry & Zero-Waste Tracking")).toBeInTheDocument();
    expect(screen.getByText("Weekly Meal Planner & Aisle Grocery Lists")).toBeInTheDocument();
    expect(screen.getByText("Local Dining & Restaurant Discovery")).toBeInTheDocument();

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd?.textContent).toContain("SoftwareApplication");
    expect(jsonLd?.textContent).toContain("FAQPage");
    expect(jsonLd?.textContent).toContain("featureList");
    expect(jsonLd?.textContent).toContain("Mia AI Voice Sous Chef");
  });

  it("sets indexable robots, SEO description, OpenGraph, and Twitter card meta on /about", () => {
    const routeOptions = (
      AboutRoute as unknown as {
        options: {
          head: () => {
            meta: Array<{ title?: string; name?: string; property?: string; content?: string }>;
          };
        };
      }
    ).options;
    const head = routeOptions.head();

    const titleMeta = head.meta.find((m) => m.title);
    const robotsMeta = head.meta.find((m) => m.name === "robots");
    const descMeta = head.meta.find((m) => m.name === "description");
    const ogTitle = head.meta.find((m) => m.property === "og:title");
    const twitterCard = head.meta.find((m) => m.name === "twitter:card");

    expect(titleMeta?.title).toContain("MealMate Features");
    expect(robotsMeta?.content).toBe("index, follow");
    expect(descMeta?.content).toContain("Mia AI voice cooking");
    expect(ogTitle?.content).toContain("MealMate");
    expect(twitterCard?.content).toBe("summary_large_image");
  });

  it("permits unauthenticated crawlers and visitors to view /about through ConsumerAccessGate", () => {
    mocks.pathname = "/about";
    mount(
      <ConsumerAccessGate>
        <div>MealMate features visible</div>
      </ConsumerAccessGate>,
    );

    expect(screen.getByText("MealMate features visible")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("exposes /about Features link from /auth footer while keeping /ai-founder unlisted", () => {
    mocks.pathname = "/auth";
    mount(<AuthLayout />);

    const featuresLink = screen.getByRole("link", { name: "Features" });
    expect(featuresLink).toHaveAttribute("href", "/about");
    expect(screen.queryByRole("link", { name: /ai-founder|ai dossier/i })).toBeNull();
  });

  it("exposes /about and core features in robots.txt, sitemap.xml, llms.txt, and llms-full.txt", () => {
    const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8");
    const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
    const llms = readFileSync(resolve(process.cwd(), "public/llms.txt"), "utf8");
    const llmsFull = readFileSync(resolve(process.cwd(), "public/llms-full.txt"), "utf8");

    expect(robots).toContain("Allow: /about");
    expect(robots).toContain("User-agent: Googlebot");
    expect(robots).toContain("User-agent: Google-Extended");
    expect(robots).toContain("User-agent: GPTBot");
    expect(robots).toContain("Sitemap: https://mealsmates.site/sitemap.xml");

    expect(sitemap).toContain("https://mealsmates.site/about");
    expect(sitemap).not.toContain("/ai-founder");

    expect(llms).toContain("https://mealsmates.site/about");
    expect(llms).toContain("Mia AI Voice Sous Chef");
    expect(llmsFull).toContain("https://mealsmates.site/about");
    expect(llmsFull).toContain("Fridge & Ingredient Photo Scanner");
  });
});
