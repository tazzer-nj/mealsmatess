import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MiaThoughtBubble } from "@/components/mia-thought-bubble";
import { AuthMiaStage } from "@/components/auth-mia-stage";
import { MiaLoadingCard } from "@/components/mia-loading-card";
import { SplashScreen } from "@/components/splash-screen";
import { Route as ScanRoute } from "@/routes/scan";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
      className?: string;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("Mia animated thought bubble and page fixes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders cloud thought bubble with animated trailing circles in thinking and thought variants", () => {
    const { rerender, container } = render(
      <MiaThoughtBubble variant="thinking" tone="light" tailPosition="bottom" />,
    );

    const thinkingBubble = container.querySelector('[data-mia-thought-bubble="true"]');
    expect(thinkingBubble).toHaveAttribute("data-mia-thought-variant", "thinking");
    expect(screen.getByText("Mia is thinking...")).toBeInTheDocument();
    expect(
      container.querySelectorAll(".mia-thought-dot-1, .mia-thought-dot-2, .mia-thought-dot-3"),
    ).toHaveLength(3);
    expect(container.querySelectorAll('[data-mia-thought-tail="bottom"] > span')).toHaveLength(3);

    rerender(
      <MiaThoughtBubble variant="thought" tone="surface" tailPosition="left" role="status">
        <p>Roasted garlic tip</p>
      </MiaThoughtBubble>,
    );

    const poppedBubble = container.querySelector('[data-mia-thought-bubble="true"]');
    expect(poppedBubble).toHaveAttribute("data-mia-thought-variant", "thought");
    expect(screen.getByText("Roasted garlic tip")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-mia-thought-tail="left"] > span')).toHaveLength(3);
  });

  it("cycles AuthMiaStage from dancing to thinking to popped animated thought bubble", () => {
    const { container } = render(<AuthMiaStage />);

    expect(screen.getByText("Chef Mia is getting ready...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText("Chef Mia is getting ready...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByText("Mia is thinking...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Mia Fun Fact/i)).toBeInTheDocument();
    expect(container.querySelector('[data-mia-thought-tail="bottom"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("status"));
    expect(screen.getByText("Chef Mia is getting ready...")).toBeInTheDocument();
  });

  it("renders MiaLoadingCard tips inside an animated thought bubble", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { container } = render(<MiaLoadingCard active delayMs={0} rotateMs={0} />);

    expect(container.querySelector('[data-mia-thought-bubble="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-mia-thought-tail="left"]')).toBeInTheDocument();
  });

  it("uses local mascot image on SplashScreen without broken /__l5e assets", () => {
    const { container } = render(<SplashScreen />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/mascots/mascot-classic.png");
  });

  it("keeps /scan search params empty by default to prevent SSR 307 redirects", () => {
    const validate = ScanRoute.options.validateSearch as (search: Record<string, unknown>) => {
      mode?: "ingredients" | "dish";
    };

    expect(validate({})).toEqual({});
    expect(validate({ mode: "dish" })).toEqual({ mode: "dish" });
    expect(validate({ mode: "ingredients" })).toEqual({ mode: "ingredients" });
  });
});
