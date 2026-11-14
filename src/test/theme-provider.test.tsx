import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

function Harness() {
  const { mode, resolved, setMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolved}</span>
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
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset["theme"];
  document.head.innerHTML = '<meta name="theme-color" content="#fafafa" />';
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

describe("Global theme provider", () => {
  it("switches immediately and persists Light, Dark, and Dark Premium themes", () => {
    const view = render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dark Premium" }));
    expect(screen.getByTestId("mode")).toHaveTextContent("dark-premium");
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark-premium");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(true);
    expect(document.documentElement.dataset["theme"]).toBe("dark-premium");
    expect(localStorage.getItem("mealmate-theme")).toBe("dark-premium");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#050814",
    );

    // Persists cleanly after remounting the app
    view.unmount();
    render(
      <ThemeProvider>
        <Harness />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("dark-premium");
    expect(document.documentElement.classList.contains("dark-premium")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(false);
    expect(document.documentElement.dataset["theme"]).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("dark-premium")).toBe(false);
    expect(document.documentElement.dataset["theme"]).toBe("light");
  });
});
