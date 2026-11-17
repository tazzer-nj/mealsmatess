import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_THEMES, PREMIUM_THEMES } from "@/lib/themes";

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

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeGallery } from "@/components/theme-gallery";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.cssText = "";
  document.head.innerHTML = '<meta name="theme-color" content="#fafafa" />';

  mockGetMyTheme.mockReset();
  mockSaveMyTheme.mockReset();
  mockUseSession.mockReset();
  mockUsePremium.mockReset();
  mockOpenUpgrade.mockReset();

  mockGetMyTheme.mockResolvedValue({ themeId: "classic-light", updatedAt: null });
  mockSaveMyTheme.mockResolvedValue({
    ok: true,
    themeId: "ocean-blue",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  mockUseSession.mockReturnValue({
    user: { id: "user-1", email: "user@mealmate.app", displayName: "User" },
    loading: false,
    firebaseUser: null,
  });
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

describe("ThemeGallery UI & live preview", () => {
  it("renders all 4 free themes, 8 premium themes, and their 6 MealMate logos", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    for (const theme of [...FREE_THEMES, ...PREMIUM_THEMES]) {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
      const logoImg = screen.getByRole("img", { name: `${theme.name} logo` });
      expect(logoImg).toHaveAttribute("src", theme.mascotImage);
    }
    expect(screen.getByText("Free Themes")).toBeInTheDocument();
    expect(screen.getByText("Premium Themes")).toBeInTheDocument();
  });

  it("shows live preview immediately and commits when Apply Theme is clicked", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    const oceanCard = screen.getByRole("radio", { name: /Ocean Blue theme/i });
    fireEvent.click(oceanCard);

    expect(screen.getByText("Previewing Ocean Blue")).toBeInTheDocument();
    expect(document.documentElement.dataset["appTheme"]).toBe("ocean-blue");
    expect(mockSaveMyTheme).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Theme/i }));
    });

    expect(mockSaveMyTheme).toHaveBeenCalledWith({ data: { themeId: "ocean-blue" } });
    await waitFor(() => expect(screen.getByText("Active theme: Ocean Blue")).toBeInTheDocument());
    expect(screen.queryByText("Previewing Ocean Blue")).not.toBeInTheDocument();
  });

  it("distinguishes locked premium themes and allows unlocking when unsubscribed", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    const auroraCard = screen.getByRole("radio", { name: /Aurora theme \(Premium\)/i });
    fireEvent.click(auroraCard);

    expect(screen.getByText("Previewing Aurora")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Apply Theme/i })).not.toBeInTheDocument();

    const unlockButton = screen.getByRole("button", { name: /Unlock Premium/i });
    fireEvent.click(unlockButton);
    expect(mockOpenUpgrade).toHaveBeenCalled();

    // Cancel reverts preview back to Classic Light
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(document.documentElement.dataset["appTheme"]).toBe("classic-light");
  });

  it("lets subscribed users apply premium themes cleanly", async () => {
    mockUsePremium.mockReturnValue({
      isPremium: true,
      tier: "yearly",
      trialActive: false,
      entitlement: null,
      isLoading: false,
    });
    mockSaveMyTheme.mockResolvedValue({
      ok: true,
      themeId: "aurora",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    const auroraCard = screen.getByRole("radio", { name: /Aurora theme/i });
    fireEvent.click(auroraCard);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Theme/i }));
    });

    expect(mockSaveMyTheme).toHaveBeenCalledWith({ data: { themeId: "aurora" } });
    await waitFor(() => expect(screen.getByText("Active theme: Aurora")).toBeInTheDocument());
  });
});
