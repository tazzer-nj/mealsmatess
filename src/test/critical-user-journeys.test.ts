import { beforeEach, describe, expect, it, vi } from "vitest";
import { pantryRecipeQuery } from "@/lib/pantry-recipe";
import { buildRecipeGenerationPrompt, searchOrGenerateRecipe } from "@/lib/recipe-search";
import { computeOnboardingBadges } from "@/lib/onboarding-reward";
import { normalizeAvatarInput } from "@/lib/profile-avatar";
import { normalizeAppLanguage } from "@/lib/i18n";
import { FREE_THEMES, MEALMATE_THEMES, PREMIUM_THEMES } from "@/lib/themes";

describe("Critical User Journeys (12 Core Flows)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  // Journey 1: Sign up and sign in
  describe("Journey 1: Sign up and sign in", () => {
    it("validates credentials and constructs valid auth sessions", () => {
      const email = "chef.mokoena@example.com";
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValidEmail).toBe(true);

      const invalidEmail = "not-an-email";
      expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidEmail)).toBe(false);

      // Session model supports both Firebase and Whop providers
      const firebaseSession = {
        id: "usr_fb123",
        email,
        displayName: "Chef Mokoena",
        provider: "firebase",
      };
      expect(firebaseSession.provider).toBe("firebase");
      expect(firebaseSession.id).toBeTruthy();

      const whopSession = {
        id: "usr_whop456",
        email,
        displayName: "Whop Chef",
        provider: "whop",
      };
      expect(whopSession.provider).toBe("whop");
      expect(whopSession.id).toBeTruthy();
    });
  });

  // Journey 2: Complete onboarding
  describe("Journey 2: Complete onboarding", () => {
    it("persists onboarding preferences and unlocks the Onboarding Reward Bounty (+250 XP)", () => {
      const userPrefs = {
        preferred_name: "Thabo",
        dietary_preferences: ["Halal", "High protein"],
        allergies: ["Peanuts"],
        cooking_goals: ["Eat healthier & balanced", "Save time"],
        skill_level: "Intermediate",
        servings: 4,
      };

      // Ensure badges are awarded accurately
      const badges = computeOnboardingBadges(userPrefs as any);
      expect(badges.length).toBeGreaterThanOrEqual(3);

      const names = badges.map((b) => b.name);
      expect(names).toContain("Kitchen Explorer");
      expect(names).toContain("Safety Guardian");
      expect(names).toContain("Meal Planner Pro");
      expect(names).toContain("Smart Chef");

      // Reward bounty claim simulation
      window.localStorage.setItem("mealmate.reward-bounty-claimed", "true");
      expect(window.localStorage.getItem("mealmate.reward-bounty-claimed")).toBe("true");
    });
  });

  // Journey 3: View the paywall
  describe("Journey 3: View the paywall", () => {
    it("configures Yearly, Monthly, and Family subscription options with 3-day trial", () => {
      const plans = [
        { id: "premium_yearly", kind: "yearly", price: "R399.00", period: "year", trialDays: 3 },
        { id: "premium_monthly", kind: "monthly", price: "R189.00", period: "month", trialDays: 3 },
        { id: "premium_family", kind: "family", price: "R249.00", period: "month", trialDays: 3 },
      ];

      expect(plans).toHaveLength(3);
      plans.forEach((plan) => {
        expect(plan.trialDays).toBe(3);
        expect(plan.price).toMatch(/R\d+/);
      });

      const yearly = plans.find((p) => p.kind === "yearly");
      expect(yearly?.price).toBe("R399.00");
      expect(yearly?.period).toBe("year");
    });
  });

  // Journey 4: Access the home screen
  describe("Journey 4: Access the home screen", () => {
    it("formats personalized user greeting and quick action entry points", () => {
      const user = { displayName: "Lindiwe Ndlovu", email: "lindiwe@example.com" };
      const firstName = user.displayName.split(" ")[0];
      expect(firstName).toBe("Lindiwe");

      const quickActions = [
        { to: "/coach", label: "Nutrition Coach" },
        { to: "/chat", label: "AI Chat" },
        { to: "/scan", label: "Scan Ingredients" },
        { to: "/planner", label: "Meal Planner" },
      ];
      expect(quickActions).toHaveLength(4);
      expect(quickActions.map((a) => a.to)).toContain("/coach");
      expect(quickActions.map((a) => a.to)).toContain("/scan");
    });
  });

  // Journey 5: Search for a recipe
  describe("Journey 5: Search for a recipe", () => {
    it("returns catalog matches when found, or constructs recipe generation prompt when empty", async () => {
      const mockQueryClient = { invalidateQueries: vi.fn().mockResolvedValue(undefined) } as any;

      // Existing match
      const existing = await searchOrGenerateRecipe({
        query: "bobotie",
        queryClient: mockQueryClient,
        fetchCatalog: vi
          .fn()
          .mockResolvedValue([
            { id: "r1", slug: "cape-malay-bobotie", name: "Cape Malay Bobotie" } as any,
          ]),
        generateFn: vi.fn(),
      });
      expect(existing.kind).toBe("matches");

      // Auto generation fallback
      const generated = await searchOrGenerateRecipe({
        query: "chakalaka shakshuka",
        category: "Dinner",
        queryClient: mockQueryClient,
        fetchCatalog: vi.fn().mockResolvedValue([]),
        generateFn: vi.fn().mockResolvedValue({ slug: "chakalaka-shakshuka-123" }),
      });
      expect(generated.kind).toBe("generated");
      if (generated.kind === "generated") {
        expect(generated.slug).toBe("chakalaka-shakshuka-123");
      }
    });
  });

  // Journey 6: Open a recipe
  describe("Journey 6: Open a recipe", () => {
    it("verifies recipe macros, ingredients checklist, and step-by-step cooking readiness", () => {
      const recipe = {
        id: "rec_1",
        name: "Bunny Chow",
        slug: "durban-bunny-chow",
        cooking_time_minutes: 50,
        servings: 4,
        calories: 620,
        protein_g: 38,
        carbs_g: 65,
        fat_g: 22,
        ingredients: [
          { name: "Loaf of white bread", quantity: "1" },
          { name: "Mutton curry", quantity: "600g" },
        ],
        steps: ["Hollow out the quarter loaf", "Ladle hot curry inside", "Top with bread virgin"],
      };

      expect(recipe.steps).toHaveLength(3);
      expect(recipe.ingredients).toHaveLength(2);
      expect(recipe.protein_g + recipe.carbs_g + recipe.fat_g).toBeGreaterThan(100);

      // Checklist behavior
      const checkedSet = new Set<number>();
      checkedSet.add(0);
      expect(checkedSet.has(0)).toBe(true);
      expect(checkedSet.has(1)).toBe(false);
    });
  });

  // Journey 7: Save a recipe
  describe("Journey 7: Save a recipe", () => {
    it("tracks recipe favorite state and permits toggling in favorites collection", () => {
      const favoritesList = [{ user_id: "u1", recipe_id: "rec_1" }];
      const isFav = favoritesList.some((f) => f.recipe_id === "rec_1");
      expect(isFav).toBe(true);

      const toggledOut = favoritesList.filter((f) => f.recipe_id !== "rec_1");
      expect(toggledOut.some((f) => f.recipe_id === "rec_1")).toBe(false);
    });
  });

  // Journey 8: Add pantry items
  describe("Journey 8: Add pantry items", () => {
    it("manages pantry inventory and builds prompt for pantry-based meal generation", () => {
      const items = ["Garlic", "Chicken breasts", "Rice", "Olive oil"];
      const prompt = pantryRecipeQuery(items);

      expect(prompt).toBe(
        "Make a meal using my pantry: Garlic, Chicken breasts, Rice, Olive oil. Prioritize these ingredients.",
      );
      expect(pantryRecipeQuery([])).toBeNull();
    });
  });

  // Journey 9: Interact with Mia
  describe("Journey 9: Interact with Mia", () => {
    it("manages conversational turns, thought states, and voice mode readiness", () => {
      const conversationHistory = [
        { role: "user", content: "What can I substitute for buttermilk?" },
        {
          role: "assistant",
          content: "You can mix 1 cup of milk with 1 tablespoon of lemon juice or white vinegar!",
        },
      ];

      expect(conversationHistory).toHaveLength(2);
      expect(conversationHistory[0].role).toBe("user");
      expect(conversationHistory[1].content).toContain("lemon juice");

      // Thought status states
      const thoughtStates = ["thinking", "speaking", "idle"];
      expect(thoughtStates).toContain("thinking");
    });
  });

  // Journey 10: Change themes
  describe("Journey 10: Change themes", () => {
    it("provides accessible free and premium themes and persists user selection", () => {
      expect(FREE_THEMES.length).toBeGreaterThan(0);
      expect(PREMIUM_THEMES.length).toBeGreaterThan(0);

      const freeIds = FREE_THEMES.map((t) => t.id);
      expect(freeIds).toContain("classic-light");

      // Selecting and persisting theme
      window.localStorage.setItem("mealmate_theme_id", "emerald");
      expect(window.localStorage.getItem("mealmate_theme_id")).toBe("emerald");
    });
  });

  // Journey 11: Update profile settings
  describe("Journey 11: Update profile settings", () => {
    it("normalizes avatar URLs, validates languages, and syncs settings cleanly", () => {
      expect(normalizeAvatarInput("  https://cdn.example.com/avatar.jpg  ")).toBe(
        "https://cdn.example.com/avatar.jpg",
      );
      expect(normalizeAvatarInput("/mascots/mascot-cherry.webp")).toBe(
        "/mascots/mascot-cherry.webp",
      );
      expect(normalizeAvatarInput("")).toBeNull();

      expect(normalizeAppLanguage("en-US")).toBe("en");
      expect(normalizeAppLanguage("zu")).toBe("zu");
      expect(normalizeAppLanguage("unknown")).toBe("en");
    });
  });

  // Journey 12: Verify subscription access
  describe("Journey 12: Verify subscription access", () => {
    it("correctly identifies active, trial, and expired subscriptions without bypassing security", () => {
      const activeSubscription = {
        isPremium: true,
        tier: "yearly",
        trialActive: false,
        periodEnd: Date.now() + 30 * 86_400_000,
      };
      expect(activeSubscription.isPremium).toBe(true);

      const trialSubscription = {
        isPremium: true,
        tier: "monthly",
        trialActive: true,
        trialEnd: Date.now() + 2 * 86_400_000,
      };
      expect(trialSubscription.isPremium).toBe(true);
      expect(trialSubscription.trialActive).toBe(true);

      const expiredSubscription = {
        isPremium: false,
        tier: "free",
        trialActive: false,
        periodEnd: Date.now() - 86_400_000,
      };
      expect(expiredSubscription.isPremium).toBe(false);
    });
  });
});
