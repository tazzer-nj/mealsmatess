import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MIA_WAIT_MOMENTS, MiaLoadingCard } from "@/components/mia-loading-card";

vi.mock("@tanstack/react-router", () => ({
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
}));

describe("Mia loading companion card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("stays hidden on sub-second fast loads and appears only when loading takes time", () => {
    render(<MiaLoadingCard active delayMs={700} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByAltText("Mia AI Chef Mascot")).toBeInTheDocument();
    expect(screen.getByText(/Mia Fun Fact/i)).toBeInTheDocument();
  });

  it("cycles from fun facts to 20% discounts for 2 when clicking Next", () => {
    render(<MiaLoadingCard active delayMs={0} rotateMs={0} />);
    expect(screen.getByText(/Cape Malay Bobotie/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show next tip from Mia/i }));
    expect(screen.getByText(/20% Off for 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Save 20% on meals for two/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MIA20FOR2/i })).toBeInTheDocument();
  });

  it("keeps all Mia wait moments clean without double dashes, en dashes, or em dashes", () => {
    const facts = MIA_WAIT_MOMENTS.filter((item) => item.kind === "fact");
    const discounts = MIA_WAIT_MOMENTS.filter((item) => item.kind === "discount");
    expect(facts.length).toBeGreaterThanOrEqual(4);
    expect(discounts.length).toBeGreaterThanOrEqual(2);

    for (const moment of MIA_WAIT_MOMENTS) {
      expect(JSON.stringify(moment)).not.toMatch(/--|–|—/);
    }
  });
});
