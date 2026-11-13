import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import { EMPTY_PREFERENCES } from "@/lib/preferences";
import { readOnboardingDraft, saveOnboardingDraft } from "@/lib/onboarding-progress";
import { Route } from "@/routes/onboarding";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  save: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/hooks/use-session", () => ({
  useSession: () => ({ user: { id: "account-a", displayName: "Chef Thabo" }, loading: false }),
}));

vi.mock("@/lib/preferences.functions", () => ({
  getMyPreferences: mocks.get,
  saveMyPreferences: mocks.save,
}));

vi.mock("@/components/mealmate-logo", () => ({ MealMateLogo: () => <span>MealMate</span> }));
vi.mock("@/components/recipe-image", () => ({ RecipeImage: () => <div>Food photograph</div> }));

const Page = Route.options.component as ComponentType;

function renderWithQuery(ui: React.ReactElement) {
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
  mocks.get.mockResolvedValue(null);
  mocks.save.mockResolvedValue({ ok: true });
  mocks.navigate.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("onboarding account flow", () => {
  it("walks through preferred name, household, goals, diet, allergies, cuisines, skill and completes to /premium", async () => {
    renderWithQuery(<Page />);
    // Step 1: Welcome & Name
    await screen.findByRole("heading", { name: "Personalize your kitchen" });
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 2: Goals
    await screen.findByRole("heading", { name: "Set your cooking goals" });
    fireEvent.click(screen.getByRole("button", { name: "Eat healthier & balanced" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 3: Dietary
    await screen.findByRole("heading", { name: "Dietary preferences" });
    fireEvent.click(screen.getByRole("button", { name: "Vegetarian" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 4: Allergies
    await screen.findByRole("heading", { name: "Allergies & intolerances" });
    fireEvent.click(screen.getByRole("button", { name: "Peanuts" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 5: Cuisines
    await screen.findByRole("heading", { name: "Favourite flavours" });
    fireEvent.click(screen.getByRole("button", { name: "South African" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step 6: Skill & pace
    await screen.findByRole("heading", { name: "Skill level & pace" });
    fireEvent.click(screen.getByText("Beginner"));

    // Complete Setup CTA
    const finish = screen.getByRole("button", { name: /Complete Setup/i });
    fireEvent.click(finish);

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        data: expect.objectContaining({
          goal: "Eat healthier & balanced",
          dietary_restrictions: ["Vegetarian"],
          allergies: ["Peanuts"],
          favorite_foods: ["South African"],
          cooking_level: "Beginner",
          onboarding_completed: true,
        }),
      }),
    );

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
    expect(readOnboardingDraft("account-a")).toBeNull();
  });

  it("keeps failed completion retryable and prevents duplicate submissions", async () => {
    saveOnboardingDraft("account-a", 5, EMPTY_PREFERENCES);
    mocks.save.mockRejectedValueOnce(new Error("Connection interrupted"));
    renderWithQuery(<Page />);

    const finish = await screen.findByRole("button", { name: /Complete Setup/i });
    fireEvent.click(finish);
    fireEvent.click(finish);

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    expect(mocks.navigate).not.toHaveBeenCalled();

    mocks.save.mockResolvedValueOnce({ ok: true });
    fireEvent.click(finish);
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
  });

  it("resumes only the current account's draft", async () => {
    saveOnboardingDraft("account-b", 4, { ...EMPTY_PREFERENCES, allergies: ["Milk"] });
    renderWithQuery(<Page />);
    await screen.findByRole("heading", { name: "Personalize your kitchen" });
    expect(readOnboardingDraft("account-b")?.preferences.allergies).toEqual(["Milk"]);
  });

  it("sends completed accounts to /premium without replaying setup", async () => {
    mocks.get.mockResolvedValue({ ...EMPTY_PREFERENCES, onboarding_completed: true });
    renderWithQuery(<Page />);
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("saves household size, goals, and preferences to Firestore at each step and resumes from remote step", async () => {
    renderWithQuery(<Page />);

    // Step 0: Household size + preferred name saved before moving to Step 1
    await screen.findByRole("heading", { name: "Personalize your kitchen" });
    fireEvent.click(screen.getByRole("button", { name: "3–4 people (family)" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          preferred_name: "Chef Thabo",
          household_size: "3–4 people (family)",
          meals_per_day: "3–4 people (family)",
          onboarding_step: 1,
          onboarding_completed: false,
        }),
      }),
    );

    // Step 1: Goal saved before moving to Step 2
    await screen.findByRole("heading", { name: "Set your cooking goals" });
    fireEvent.click(screen.getByRole("button", { name: "Save time" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          goal: "Save time",
          household_size: "3–4 people (family)",
          onboarding_step: 2,
          onboarding_completed: false,
        }),
      }),
    );

    // Step 2: Skip clears dietary_restrictions and persists to Firestore
    await screen.findByRole("heading", { name: "Dietary preferences" });
    fireEvent.click(screen.getByRole("button", { name: "Halal" }));
    fireEvent.click(screen.getByRole("button", { name: /Skip if none/i }));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenNthCalledWith(3, {
        data: expect.objectContaining({
          goal: "Save time",
          household_size: "3–4 people (family)",
          dietary_restrictions: [],
          onboarding_step: 3,
          onboarding_completed: false,
        }),
      }),
    );

    await screen.findByRole("heading", { name: "Allergies & intolerances" });

    // Unmount and simulate returning on a fresh device from saved Firestore state
    cleanup();
    localStorage.clear();
    mocks.save.mockClear();
    mocks.get.mockResolvedValueOnce({
      ...EMPTY_PREFERENCES,
      goal: "Save time",
      household_size: "3–4 people (family)",
      meals_per_day: "3–4 people (family)",
      onboarding_step: 3,
      onboarding_completed: false,
    });

    renderWithQuery(<Page />);
    await screen.findByRole("heading", { name: "Allergies & intolerances" });
  });

  it("auto-saves partially filled answers on page close and restores current step and partial fields upon re-authentication", async () => {
    renderWithQuery(<Page />);

    // Step 0: User edits preferred name and household size, then closes/refreshes before clicking Continue
    await screen.findByRole("heading", { name: "Personalize your kitchen" });
    const nameInput = screen.getByLabelText(/What should MealMate call you\?/i);
    fireEvent.change(nameInput, { target: { value: "Thabo M." } });
    fireEvent.click(screen.getByRole("button", { name: "5+ people (large feast)" }));

    // Simulate closing/backgrounding tab before Continue
    fireEvent(window, new Event("pagehide"));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        data: expect.objectContaining({
          preferred_name: "Thabo M.",
          household_size: "5+ people (large feast)",
          meals_per_day: "5+ people (large feast)",
          onboarding_step: 0,
          onboarding_completed: false,
        }),
      }),
    );

    // Now simulate re-authenticating on a fresh session (localStorage has an older stale step 0 draft,
    // while Firestore holds newer step 2 + preferred_name + household_size + goal + partial Halal selection)
    cleanup();
    mocks.save.mockClear();
    saveOnboardingDraft("account-a", 0, {
      ...EMPTY_PREFERENCES,
      updated_at: "2026-11-13T10:00:00.000Z",
    });
    mocks.get.mockResolvedValueOnce({
      ...EMPTY_PREFERENCES,
      preferred_name: "Thabo M.",
      household_size: "5+ people (large feast)",
      meals_per_day: "5+ people (large feast)",
      goal: "Plan weekly meals",
      dietary_restrictions: ["Halal"],
      onboarding_step: 2,
      onboarding_completed: false,
      updated_at: "2026-11-13T18:50:00.000Z",
    });

    renderWithQuery(<Page />);

    // Restores exact Firestore step 2 (Dietary preferences) and partial Halal selection
    await screen.findByRole("heading", { name: "Dietary preferences" });
    expect(screen.getByRole("button", { name: "Halal" }).getAttribute("aria-pressed")).toBe("true");

    // Stepping back confirms Step 0 & Step 1 answers were also restored from Firestore
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    await screen.findByRole("heading", { name: "Set your cooking goals" });
    expect(
      screen.getByRole("button", { name: "Plan weekly meals" }).getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    await screen.findByRole("heading", { name: "Personalize your kitchen" });
    expect(
      (screen.getByLabelText(/What should MealMate call you\?/i) as HTMLInputElement).value,
    ).toBe("Thabo M.");
    expect(
      screen.getByRole("button", { name: "5+ people (large feast)" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
