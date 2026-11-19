import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebMcpProvider } from "@/components/web-mcp-provider";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({
    navigate: mocks.navigate,
  }),
}));

describe("WebMcpProvider", () => {
  const originalModelContext = navigator.modelContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    if (originalModelContext === undefined) {
      Reflect.deleteProperty(navigator, "modelContext");
    } else {
      Object.defineProperty(navigator, "modelContext", {
        value: originalModelContext,
        configurable: true,
        writable: true,
      });
    }
  });

  it("registers tools with navigator.modelContext and aborts cleanly on unmount", async () => {
    const registered: Array<{
      tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
      };
      signal?: AbortSignal;
    }> = [];

    const registerTool = vi.fn((tool, options) => {
      registered.push({ tool, signal: options?.signal });
    });

    Object.defineProperty(navigator, "modelContext", {
      value: { registerTool },
      configurable: true,
      writable: true,
    });

    const { unmount } = render(<WebMcpProvider />);

    expect(registerTool).toHaveBeenCalledTimes(3);
    expect(registered.map((r) => r.tool.name)).toEqual([
      "search_recipes",
      "navigate_mealmate",
      "get_mealmate_overview",
    ]);

    const signal = registered[0]?.signal;
    expect(signal).toBeDefined();
    expect(signal?.aborted).toBe(false);

    const searchResult = (await registered[0]?.tool.execute({
      query: "bobotie",
      navigate: true,
    })) as { count: number };
    expect(searchResult.count).toBeGreaterThanOrEqual(1);
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/recipes", search: { q: "bobotie" } });

    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
