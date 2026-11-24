import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookingInput } from "@/components/cooking-input";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeProvider } from "@/components/theme-provider";
import { applyMealMateThemeToDom, getMealMateTheme } from "@/lib/themes";

const mockGetMyTheme = vi.fn();
const mockSaveMyTheme = vi.fn();
const mockUseSession = vi.fn();
const mockUsePremium = vi.fn();
const mockOpenUpgrade = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string; [k: string]: unknown }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/preferences.functions", () => ({
  getMyTheme: (...args: unknown[]) => mockGetMyTheme(...args),
  saveMyTheme: (...args: unknown[]) => mockSaveMyTheme(...args),
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => mockUseSession(),
}));

vi.mock("@/hooks/use-premium", () => ({
  usePremium: () => mockUsePremium(),
}));

vi.mock("@/components/upgrade-modal", () => ({
  useUpgradeModal: () => ({ open: mockOpenUpgrade, close: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.cssText = "";
  document.head.innerHTML =
    '<meta name="theme-color" content="#faf7f1" /><meta name="apple-mobile-web-app-status-bar-style" content="default" />';

  mockGetMyTheme.mockReset();
  mockSaveMyTheme.mockReset();
  mockUseSession.mockReset();
  mockUsePremium.mockReset();
  mockOpenUpgrade.mockReset();

  mockGetMyTheme.mockResolvedValue({ themeId: "classic-light", updatedAt: null });
  mockSaveMyTheme.mockResolvedValue({
    ok: true,
    themeId: "midnight-black",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  mockUseSession.mockReturnValue({ user: null, loading: false, firebaseUser: null });
  mockUsePremium.mockReturnValue({
    isPremium: false,
    tier: "free",
    trialActive: false,
    entitlement: null,
    isLoading: false,
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe("CookingInput surface & redesigned Default Kitchen Themes", () => {
  it("renders CookingInput with transparent inner field and all 4 kitchen action buttons", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();

    const { container } = render(
      <CookingInput value="garlic butter pasta" onChange={onChange} onSubmit={onSubmit} />,
    );

    const form = container.querySelector("form.cooking-input");
    expect(form).not.toBeNull();
    expect(form?.className).toContain("rounded-3xl");
    expect(form?.className).not.toContain("bg-background");

    const input = screen.getByPlaceholderText("What can I cook today?");
    expect(input.className).toContain("bg-transparent");
    expect(input.className).toContain("focus-visible:bg-transparent");

    expect(screen.getByRole("link", { name: "Scan ingredients" })).toHaveAttribute("href", "/scan");
    expect(screen.getByRole("link", { name: "Pantry" })).toHaveAttribute("href", "/pantry");
    expect(screen.getByRole("link", { name: "Meal planner" })).toHaveAttribute("href", "/planner");

    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("applies Default White (light) and Default Black (dark) tokens and status bar metadata", () => {
    const fresh = getMealMateTheme("classic-light");
    const midnight = getMealMateTheme("midnight-black");

    expect(fresh.name).toBe("Default White");
    expect(midnight.name).toBe("Default Black");

    applyMealMateThemeToDom("classic-light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "oklch(0.992 0.003 95)",
    );
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("oklch(0.12 0 0)");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#fcfcfb",
    );
    expect(
      document
        .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        ?.getAttribute("content"),
    ).toBe("default");

    applyMealMateThemeToDom("midnight-black");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("oklch(0.08 0 0)");
    expect(document.documentElement.style.getPropertyValue("--card")).toBe("oklch(0.14 0 0)");
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("oklch(0.98 0 0)");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#0a0a0a",
    );
    expect(
      document
        .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
        ?.getAttribute("content"),
    ).toBe("black-translucent");
  });

  it("switches quickly between Default White and Default Black themes in ThemePicker", () => {
    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    const midnightBtn = screen.getByRole("button", { name: "Black" });
    const freshBtn = screen.getByRole("button", { name: "White" });

    fireEvent.click(midnightBtn);
    expect(document.documentElement.dataset["appTheme"]).toBe("midnight-black");

    fireEvent.click(freshBtn);
    expect(document.documentElement.dataset["appTheme"]).toBe("classic-light");
  });
});
