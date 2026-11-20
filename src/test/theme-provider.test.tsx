import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FREE_THEMES,
  MEALMATE_THEMES,
  PREMIUM_THEMES,
  THEME_BOOT_SCRIPT,
  THEME_POLARITY_STORAGE_KEY,
  THEME_V2_STORAGE_KEY,
} from "@/lib/themes";

const mockGetMyTheme = vi.fn();
const mockSaveMyTheme = vi.fn();
const mockUseSession = vi.fn();

vi.mock("@/lib/preferences.functions", () => ({
  getMyTheme: (...args: unknown[]) => mockGetMyTheme(...args),
  saveMyTheme: (...args: unknown[]) => mockSaveMyTheme(...args),
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => mockUseSession(),
}));

import { ThemeProvider, useTheme } from "@/components/theme-provider";

function Harness() {
  const {
    mode,
    resolved,
    setMode,
    activeThemeId,
    displayThemeId,
    previewThemeId,
    saveStatus,
    saveError,
    pendingThemeId,
    previewTheme,
    cancelPreview,
    applyTheme,
    retrySave,
  } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolved}</span>
      <span data-testid="active-id">{activeThemeId}</span>
      <span data-testid="display-id">{displayThemeId}</span>
      <span data-testid="preview-id">{previewThemeId ?? "none"}</span>
      <span data-testid="save-status">{saveStatus}</span>
      <span data-testid="save-error">{saveError ?? ""}</span>
      <span data-testid="pending-id">{pendingThemeId ?? ""}</span>

      <button type="button" onClick={() => setMode("light")}>
        Light
      </button>
      <button type="button" onClick={() => setMode("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setMode("dark-premium")}>
        Dark Premium
      </button>
      <button type="button" onClick={() => setMode("system")}>
        System
      </button>

      <button type="button" onClick={() => previewTheme("ocean-blue")}>
        Preview Ocean
      </button>
      <button type="button" onClick={() => previewTheme("aurora")}>
        Preview Aurora
      </button>
      <button type="button" onClick={() => cancelPreview()}>
        Cancel Preview
      </button>
      <button type="button" onClick={() => void applyTheme("midnight-black")}>
        Apply Black
      </button>
      <button type="button" onClick={() => void applyTheme("aurora")}>
        Apply Aurora
      </button>
      <button type="button" onClick={() => void applyTheme("midnight-pro")}>
        Apply Midnight
      </button>
      <button type="button" onClick={() => void retrySave()}>
        Retry Save
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.style.cssText = "";
  delete document.documentElement.dataset["theme"];
  delete document.documentElement.dataset["appTheme"];
  delete document.documentElement.dataset["mascot"];
  document.head.innerHTML = '<meta name="theme-color" content="#fafafa" />';

  mockGetMyTheme.mockReset();
  mockSaveMyTheme.mockReset();
  mockUseSession.mockReset();
  mockUseSession.mockReturnValue({ user: null, loading: false, firebaseUser: null });
  mockGetMyTheme.mockResolvedValue({ themeId: null, updatedAt: null });
  mockSaveMyTheme.mockResolvedValue({
    ok: true,
    themeId: "midnight-black",
    updatedAt: "2026-01-01",
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

describe("Theme registry & global ThemeProvider", () => {
  it("defines default black and white themes plus 6 logo-matched themes with complete tokens", () => {
    expect(FREE_THEMES.map((t) => t.id)).toEqual(["classic-light", "midnight-black"]);
    expect(PREMIUM_THEMES.map((t) => t.id)).toEqual([
      "classic-green",
      "sunset",
      "midnight-pro",
      "ocean-blue",
      "aurora",
      "obsidian",
    ]);
    expect(MEALMATE_THEMES).toHaveLength(8);

    for (const theme of MEALMATE_THEMES) {
      expect(theme.tokens.background).toBeTruthy();
      expect(theme.tokens.foreground).toBeTruthy();
      expect(theme.tokens.card).toBeTruthy();
      expect(theme.tokens.primary).toBeTruthy();
      expect(theme.tokens.navBackground).toBeTruthy();
      expect(theme.tokens.headerBackground).toBeTruthy();
      expect(theme.tokens.themeColor).toMatch(/^#/);
    }
  });

  it("switches immediately and preserves Default White, Default Black, and Dark Premium compatibility", () => {
    const view = render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dark Premium" }));
    expect(screen.getByTestId("mode")).toHaveTextContent("dark-premium");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark-premium");
    expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-pro");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(true);
    expect(document.documentElement.dataset["theme"]).toBe("dark-premium");
    expect(document.documentElement.dataset["appTheme"]).toBe("midnight-pro");
    expect(localStorage.getItem("mealmate-theme")).toBe("dark-premium");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#0d1126",
    );

    view.unmount();
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("dark-premium");
    expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-pro");
    expect(document.documentElement.classList.contains("dark-premium")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(false);
    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(document.documentElement.dataset["appTheme"]).toBe("midnight-black");

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(false);
    expect(document.documentElement.dataset["theme"]).toBe("light");
    expect(document.documentElement.dataset["appTheme"]).toBe("classic-light");
  });

  it("applies every theme token and returns all 6 logo artworks across the 6 logo themes", async () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-1", email: "chef@mealmate.app", displayName: "Chef" },
      loading: false,
      firebaseUser: null,
    });
    mockSaveMyTheme.mockImplementation(async ({ data }: { data: { themeId: string } }) => ({
      ok: true,
      themeId: data.themeId,
      updatedAt: "2026-01-01T00:00:00.000Z",
    }));

    function AllThemeTester() {
      const { applyTheme, activeThemeId } = useTheme();
      return (
        <div>
          <span data-testid="current">{activeThemeId}</span>
          {MEALMATE_THEMES.map((t) => (
            <button key={t.id} type="button" onClick={() => void applyTheme(t.id)}>
              {t.id}
            </button>
          ))}
        </div>
      );
    }

    render(
      <ThemeProvider>
        <AllThemeTester />
      </ThemeProvider>,
    );

    for (const theme of MEALMATE_THEMES) {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: theme.id }));
      });
      await waitFor(() => expect(screen.getByTestId("current")).toHaveTextContent(theme.id));
      expect(document.documentElement.dataset["appTheme"]).toBe(theme.id);
      expect(document.documentElement.style.getPropertyValue("--background")).toBe(
        theme.tokens.background,
      );
      expect(document.documentElement.style.getPropertyValue("--card")).toBe(theme.tokens.card);
      expect(document.documentElement.style.getPropertyValue("--periwinkle")).toBe(
        theme.tokens.periwinkle,
      );
      expect(document.documentElement.classList.contains("dark")).toBe(
        theme.colorScheme === "dark",
      );
      expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
        theme.tokens.themeColor,
      );
    }

    const classicGreen = MEALMATE_THEMES.find((t) => t.id === "classic-green")!;
    const midnight = MEALMATE_THEMES.find((t) => t.id === "midnight-pro")!;
    const obsidian = MEALMATE_THEMES.find((t) => t.id === "obsidian")!;
    const logoSet = new Set(PREMIUM_THEMES.map((t) => t.mascotImage));
    expect(logoSet).toEqual(
      new Set([
        "/mascots/mascot-classic.png",
        "/mascots/mascot-midnight.webp",
        "/mascots/mascot-ocean.webp",
        "/mascots/mascot-matcha.webp",
        "/mascots/mascot-sunset.webp",
        "/mascots/mascot-cherry.webp",
      ]),
    );
    expect(classicGreen.tokens.primary).toBe("oklch(0.61 0.16 139)");
    expect(classicGreen.tokens.periwinkle).toBe("oklch(0.61 0.16 139)");
    expect(midnight.mascotImage).toBe("/mascots/mascot-midnight.webp");
    expect(midnight.tokens.periwinkle).toBe("oklch(0.7 0.15 275)");
    expect(obsidian.mascotImage).toBe("/mascots/mascot-cherry.webp");
    expect(obsidian.tokens.periwinkle).toBe("oklch(0.7 0.17 12)");
  });

  it("restores saved account theme automatically across devices and avoids flash via THEME_BOOT_SCRIPT", async () => {
    localStorage.setItem(THEME_V2_STORAGE_KEY, "ocean-blue");
    window.eval(THEME_BOOT_SCRIPT);
    expect(document.documentElement.dataset["appTheme"]).toBe("ocean-blue");
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "oklch(0.97 0.02 225)",
    );
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#eff6fc",
    );

    mockUseSession.mockReturnValue({
      user: { id: "user-42", email: "tina@example.com", displayName: "Tina" },
      loading: false,
      firebaseUser: null,
    });
    mockGetMyTheme.mockResolvedValue({
      themeId: "midnight-pro",
      updatedAt: "2026-02-01T10:00:00.000Z",
    });

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-pro"));
    expect(localStorage.getItem(THEME_V2_STORAGE_KEY)).toBe("midnight-pro");
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "oklch(0.13 0.04 275)",
    );
  });

  it("explains why unauthenticated users cannot save themes to an account", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: false, firebaseUser: null });

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Black" }));
    });
    expect(mockSaveMyTheme).not.toHaveBeenCalled();
    expect(screen.getByTestId("save-status")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Sign in to save/i);
    expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-black");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Aurora" }));
    });
    expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-black");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Premium account/i);
  });

  it("surfaces error and allows retry without silently reverting to default when account save fails", async () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-9", email: "alex@example.com", displayName: "Alex" },
      loading: false,
      firebaseUser: null,
    });
    mockGetMyTheme.mockResolvedValue({ themeId: "midnight-black", updatedAt: null });
    mockSaveMyTheme.mockRejectedValueOnce(new Error("Connection timeout"));

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-black"),
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Aurora" }));
    });

    expect(screen.getByTestId("save-status")).toHaveTextContent("error");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Connection issue|timeout/i);
    expect(screen.getByTestId("pending-id")).toHaveTextContent("aurora");
    expect(screen.getByTestId("display-id")).toHaveTextContent("aurora");
    expect(screen.getByTestId("active-id")).toHaveTextContent("midnight-black");

    mockSaveMyTheme.mockResolvedValueOnce({
      ok: true,
      themeId: "aurora",
      updatedAt: "2026-02-02T00:00:00.000Z",
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Retry Save" }));
    });

    await waitFor(() => expect(screen.getByTestId("save-status")).toHaveTextContent("saved"));
    expect(screen.getByTestId("active-id")).toHaveTextContent("aurora");
    expect(screen.getByTestId("preview-id")).toHaveTextContent("none");
  });

  it("switches a premium theme between its light and dark variants without resetting to default black/white", async () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-12", email: "ocean@example.com", displayName: "Ocean" },
      loading: false,
      firebaseUser: null,
    });
    mockGetMyTheme.mockResolvedValue({ themeId: "ocean-blue", updatedAt: null });

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue"));
    const ocean = MEALMATE_THEMES.find((t) => t.id === "ocean-blue")!;
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      ocean.tokens.background,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue");
    expect(document.documentElement.dataset["appTheme"]).toBe("ocean-blue");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      ocean.altTokens?.background,
    );
    expect(localStorage.getItem(THEME_POLARITY_STORAGE_KEY)).toBe("dark");

    // Verify THEME_BOOT_SCRIPT restores the dark variant of ocean-blue at frame 0.
    document.documentElement.className = "";
    document.documentElement.style.cssText = "";
    window.eval(THEME_BOOT_SCRIPT);
    expect(document.documentElement.dataset["appTheme"]).toBe("ocean-blue");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      ocean.altTokens?.background,
    );

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      ocean.tokens.background,
    );
    expect(localStorage.getItem(THEME_POLARITY_STORAGE_KEY)).toBeNull();
  });
});
