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
    themeId: "midnight-black",
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
  it("renders default black and white themes alongside the 6 logo themes and their 6 MealMate logos", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    expect(FREE_THEMES).toHaveLength(2);
    expect(PREMIUM_THEMES).toHaveLength(6);

    for (const theme of [...FREE_THEMES, ...PREMIUM_THEMES]) {
      expect(screen.getByText(theme.name)).toBeInTheDocument();
      const logoImg = screen.getByRole("img", { name: `${theme.name} logo` });
      expect(logoImg).toHaveAttribute("src", theme.mascotImage);
    }
    expect(screen.getByText("Default Kitchen Themes")).toBeInTheDocument();
    expect(screen.getByText("Logo Themes")).toBeInTheDocument();
  });

  it("shows live preview immediately and commits when Apply Theme is clicked", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    const midnightKitchenCard = screen.getByRole("radio", { name: /Midnight Kitchen theme/i });
    fireEvent.click(midnightKitchenCard);

    expect(screen.getByText("Previewing Midnight Kitchen")).toBeInTheDocument();
    expect(document.documentElement.dataset["appTheme"]).toBe("midnight-black");
    expect(mockSaveMyTheme).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Theme/i }));
    });

    expect(mockSaveMyTheme).toHaveBeenCalledWith({ data: { themeId: "midnight-black" } });
    await waitFor(() =>
      expect(screen.getByText("Active theme: Midnight Kitchen")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Previewing Midnight Kitchen")).not.toBeInTheDocument();
  });

  it("distinguishes locked logo themes and allows unlocking when unsubscribed", async () => {
    render(
      <ThemeProvider>
        <ThemeGallery />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalled());

    const matchaCard = screen.getByRole("radio", { name: /Matcha theme \(Premium\)/i });
    fireEvent.click(matchaCard);

    expect(screen.getByText("Previewing Matcha")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Apply Theme/i })).not.toBeInTheDocument();

    const unlockButton = screen.getByRole("button", { name: /Unlock Premium/i });
    fireEvent.click(unlockButton);
    expect(mockOpenUpgrade).toHaveBeenCalled();

    // Cancel reverts preview back to Default White
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(document.documentElement.dataset["appTheme"]).toBe("classic-light");
  });

  it("lets subscribed users apply logo themes cleanly", async () => {
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

    const matchaCard = screen.getByRole("radio", { name: /Matcha theme/i });
    fireEvent.click(matchaCard);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Theme/i }));
    });

    expect(mockSaveMyTheme).toHaveBeenCalledWith({ data: { themeId: "aurora" } });
    await waitFor(() => expect(screen.getByText("Active theme: Matcha")).toBeInTheDocument());
  });
});
