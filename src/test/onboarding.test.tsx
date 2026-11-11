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
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
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

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }));
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
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }));
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
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }));
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
