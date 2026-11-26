import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OnboardingRewardCard } from "@/components/onboarding-reward-card";
import { computeOnboardingBadges } from "@/lib/onboarding-reward";
import { EMPTY_PREFERENCES, type FoodPreferences } from "@/lib/preferences";

const mocks = vi.hoisted(() => ({
  user: { id: "user-123", displayName: "Chef Sam" },
  getPrefs: vi.fn(),
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => ({ user: mocks.user, loading: false }),
}));

vi.mock("@/lib/preferences.functions", () => ({
  getMyPreferences: () => mocks.getPrefs(),
}));

function renderCard(ui: React.ReactElement) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.getPrefs.mockResolvedValue(null);
});

afterEach(cleanup);

describe("Onboarding Badge System & Reward Card", () => {
  it("computes badges based on customized preferences", () => {
    const customPrefs: FoodPreferences = {
      ...EMPTY_PREFERENCES,
      preferred_name: "Sam",
      household_size: "3 to 4 people (family)",
      meals_per_day: "3 to 4 people (family)",
      goal: "Save time",
      favorite_foods: ["Italian", "South African"],
      dietary_restrictions: ["Vegetarian"],
      allergies: ["Peanuts"],
      disliked_foods: [],
      cooking_level: "Intermediate",
      cooking_time: "20 to 35 mins",
      food_budget: null,
      preferred_features: [],
      onboarding_step: 5,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const badges = computeOnboardingBadges(customPrefs);
    expect(badges.length).toBe(4);

    const badgeNames = badges.map((b) => b.name);
    expect(badgeNames).toContain("Kitchen Explorer");
    expect(badgeNames).toContain("Meal Planner Pro");
    expect(badgeNames).toContain("Smart Chef");
    expect(badgeNames).toContain("Safety Guardian");

    const kitchenExplorer = badges.find((b) => b.name === "Kitchen Explorer");
    expect(kitchenExplorer?.reason).toContain("Italian & South African");

    const mealPlanner = badges.find((b) => b.name === "Meal Planner Pro");
    expect(mealPlanner?.reason).toContain("3 to 4 people (family)");
    expect(mealPlanner?.reason).toContain("Save time");

    const safetyGuard = badges.find((b) => b.name === "Safety Guardian");
    expect(safetyGuard?.reason).toContain("2 dietary safeguards active");
  });

  it("renders the Reward Card with unlocked badges and allows claiming bounty", async () => {
    mocks.getPrefs.mockResolvedValue({
      preferred_name: "Sammy",
      household_size: "2 people (couple)",
      goal: "Eat healthier & balanced",
      favorite_foods: ["Mediterranean"],
      dietary_restrictions: [],
      allergies: [],
      cooking_level: "Beginner",
      cooking_time: "Under 20 mins",
      onboarding_completed: true,
    });

    renderCard(<OnboardingRewardCard />);

    // Header & Greeting
    expect(screen.getByText(/Onboarding Reward Card/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile 100% Completed/i)).toBeInTheDocument();
    await screen.findByText(/Congratulations, Sammy!/i);

    // Badges
    expect(screen.getByText("Kitchen Explorer")).toBeInTheDocument();
    expect(screen.getByText("Meal Planner Pro")).toBeInTheDocument();
    expect(screen.getByText("Smart Chef")).toBeInTheDocument();
    expect(screen.getByText("Safety Guardian")).toBeInTheDocument();

    // Bounty Claim Button
    const claimBtn = screen.getByRole("button", { name: /Claim \+250 XP Reward/i });
    expect(claimBtn).toBeEnabled();

    fireEvent.click(claimBtn);
    expect(screen.getByText(/Bounty Claimed \(\+250 XP\)/i)).toBeInTheDocument();
    expect(localStorage.getItem("mealmate.reward-bounty-claimed")).toBe("true");
  });
});
