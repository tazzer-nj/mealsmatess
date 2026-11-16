import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FREE_THEMES,
  MEALMATE_THEMES,
  PREMIUM_THEMES,
  THEME_BOOT_SCRIPT,
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
      <button type="button" onClick={() => void applyTheme("ocean-blue")}>
        Apply Ocean
      </button>
      <button type="button" onClick={() => void applyTheme("aurora")}>
        Apply Aurora
      </button>
      <button type="button" onClick={() => void applyTheme("midnight-pro")}>
        Apply Midnight Pro
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
  mockSaveMyTheme.mockResolvedValue({ ok: true, themeId: "ocean-blue", updatedAt: "2026-01-01" });

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
  it("defines exactly 4 free themes and 8 premium themes with complete token sets", () => {
    expect(FREE_THEMES.map((t) => t.id)).toEqual([
      "classic-light",
      "midnight-black",
      "ocean-blue",
      "soft-lavender",
    ]);
    expect(PREMIUM_THEMES.map((t) => t.id)).toEqual([
      "midnight-pro",
      "arctic-blue",
      "graphite",
      "aurora",
      "royal-navy",
      "obsidian",
      "sunset",
      "minimal-white",
    ]);
    expect(MEALMATE_THEMES).toHaveLength(12);

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

  it("switches immediately and preserves Light, Dark, and Dark Premium compatibility", () => {
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
      "#050814",
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

  it("applies every theme token and meta theme-color across all 12 themes cleanly", async () => {
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
  });

  it("restores saved account theme automatically across devices and avoids flash via THEME_BOOT_SCRIPT", async () => {
    localStorage.setItem(THEME_V2_STORAGE_KEY, "ocean-blue");
    // Execute synchronous pre-hydration boot script before mounting
    window.eval(THEME_BOOT_SCRIPT);
    expect(document.documentElement.dataset["appTheme"]).toBe("ocean-blue");
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#f2f7fb");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#f2f7fb",
    );

    mockUseSession.mockReturnValue({
      user: { id: "user-42", email: "tina@example.com", displayName: "Tina" },
      loading: false,
      firebaseUser: null,
    });
    mockGetMyTheme.mockResolvedValue({
      themeId: "royal-navy",
      updatedAt: "2026-02-01T10:00:00.000Z",
    });

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(mockGetMyTheme).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByTestId("active-id")).toHaveTextContent("royal-navy"));
    expect(localStorage.getItem(THEME_V2_STORAGE_KEY)).toBe("royal-navy");
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#091124");
  });

  it("explains why unauthenticated users cannot save themes to an account", async () => {
    mockUseSession.mockReturnValue({ user: null, loading: false, firebaseUser: null });

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Ocean" }));
    });
    expect(mockSaveMyTheme).not.toHaveBeenCalled();
    expect(screen.getByTestId("save-status")).toHaveTextContent("unauthenticated");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Sign in to save/i);
    // Free theme still applies locally
    expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue");

    // Premium theme is blocked when unauthenticated
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Aurora" }));
    });
    expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Premium account/i);
  });

  it("surfaces error and allows retry without silently reverting to default when account save fails", async () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-9", email: "alex@example.com", displayName: "Alex" },
      loading: false,
      firebaseUser: null,
    });
    mockGetMyTheme.mockResolvedValue({ themeId: "ocean-blue", updatedAt: null });
    mockSaveMyTheme.mockRejectedValueOnce(new Error("Connection timeout"));

    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Apply Aurora" }));
    });

    expect(screen.getByTestId("save-status")).toHaveTextContent("error");
    expect(screen.getByTestId("save-error").textContent).toMatch(/Connection issue|timeout/i);
    expect(screen.getByTestId("pending-id")).toHaveTextContent("aurora");
    // Display stays on user's selected theme instead of silently reverting to Classic Light
    expect(screen.getByTestId("display-id")).toHaveTextContent("aurora");
    expect(screen.getByTestId("active-id")).toHaveTextContent("ocean-blue");

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
});
