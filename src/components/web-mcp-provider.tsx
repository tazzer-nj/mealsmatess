import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { CURATED_RECIPES } from "@/lib/curated-recipes";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown;
};

type ModelContextApi = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
};

declare global {
  interface Navigator {
    modelContext?: ModelContextApi;
  }
}

const ALLOWED_ROUTES = new Set([
  "/",
  "/recipes",
  "/restaurants",
  "/planner",
  "/pantry",
  "/chat",
  "/scan",
  "/coach",
  "/profile",
  "/settings",
  "/about",
  "/support",
]);

/**
 * Registers MealMate browser tools with the WebMCP API (`navigator.modelContext.registerTool`)
 * on page load and unregisters them cleanly via AbortController on unmount.
 */
export function WebMcpProvider() {
  const router = useRouter();

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const modelContext = navigator.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") return;

    const controller = new AbortController();
    const registerOptions = { signal: controller.signal };

    const tools: WebMcpTool[] = [
      {
        name: "search_recipes",
        description:
          "Search MealMate recipes by dish name, ingredient, or cuisine and optionally open the results page.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Recipe, ingredient, or cuisine query" },
            navigate: {
              type: "boolean",
              description: "Whether to navigate to /recipes with the query",
            },
          },
          required: ["query"],
        },
        execute: async (args) => {
          const query = String(args["query"] ?? "").trim();
          const shouldNavigate = args["navigate"] !== false;
          const lower = query.toLowerCase();
          const matches = CURATED_RECIPES.filter(
            (r) =>
              !lower ||
              r.name.toLowerCase().includes(lower) ||
              (r.cuisine ?? "").toLowerCase().includes(lower) ||
              (r.category ?? "").toLowerCase().includes(lower) ||
              r.ingredients.some((i) => i.name.toLowerCase().includes(lower)),
          )
            .slice(0, 8)
            .map((r) => ({
              slug: r.slug,
              name: r.name,
              cuisine: r.cuisine,
              category: r.category,
              cookingTimeMinutes: r.cooking_time_minutes,
              calories: r.calories,
            }));

          if (shouldNavigate && query) {
            void router.navigate({ to: "/recipes", search: { q: query } });
          }

          return { query, count: matches.length, recipes: matches };
        },
      },
      {
        name: "navigate_mealmate",
        description:
          "Navigate to a MealMate page such as Home (/), Recipes (/recipes), Dining (/restaurants), Planner (/planner), Pantry (/pantry), or Mia AI Chef (/chat).",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Target route path (e.g. /, /recipes, /restaurants, /planner, /chat)",
            },
          },
          required: ["path"],
        },
        execute: async (args) => {
          const path = String(args["path"] ?? "/").trim();
          if (!ALLOWED_ROUTES.has(path)) {
            return { navigated: false, error: `Unsupported route: ${path}` };
          }
          await router.navigate({ to: path as "/" });
          return { navigated: true, path };
        },
      },
      {
        name: "get_mealmate_overview",
        description:
          "Retrieve MealMate features, active URL, and machine-readable agent discovery endpoints.",
        inputSchema: {
          type: "object",
          properties: {},
        },
        execute: async () => {
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          return {
            name: "MealMate",
            features: [
              "Mia AI Voice Sous Chef",
              "Fridge & Ingredient Photo Scanner",
              "Personalized Recipe Discovery",
              "Smart Pantry Intelligence",
              "Weekly Meal Planner & Grocery Lists",
              "Local Dining Discovery",
            ],
            discovery: {
              apiCatalog: `${origin}/.well-known/api-catalog`,
              agentCard: `${origin}/.well-known/agent-card.json`,
              agentSkills: `${origin}/.well-known/agent-skills/index.json`,
              mcpServerCard: `${origin}/.well-known/mcp/server-card.json`,
              authMd: `${origin}/auth.md`,
            },
          };
        },
      },
    ];

    try {
      for (const tool of tools) {
        modelContext.registerTool(tool, registerOptions);
      }
    } catch {
      // Ignore registration errors on partial or experimental browser WebMCP implementations.
    }

    return () => {
      controller.abort();
    };
  }, [router]);

  return null;
}
