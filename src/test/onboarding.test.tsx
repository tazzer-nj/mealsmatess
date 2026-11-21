import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentType } from "react";
import i18n from "@/lib/i18n";
import { EMPTY_PREFERENCES } from "@/lib/preferences";
import { readOnboardingDraft, saveOnboardingDraft } from "@/lib/onboarding-progress";
import { Route } from "@/routes/onboarding";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  save: vi.fn(),
  navigate: vi.fn(),
  verifyPremium: vi.fn(),
  getIntroCompletion: vi.fn(),
  dispatchAnalyticsEvent: vi.fn(),
  saveStructuredState: vi.fn(),
  saveStructuredFallback: vi.fn(),
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

vi.mock("@/lib/billing.functions", () => ({
  verifyMyPremium: mocks.verifyPremium,
  getIntroCompletion: mocks.getIntroCompletion,
}));

vi.mock("@/lib/analytics-events", () => ({
  captureInitialAttribution: () => null,
  detectClientCountry: () => "ZA",
  detectClientPlatform: () => "web",
  dispatchAnalyticsEvent: mocks.dispatchAnalyticsEvent,
  saveStructuredOnboardingClientFallback: mocks.saveStructuredFallback,
}));

vi.mock("@/lib/analytics-events.functions", () => ({
  saveStructuredOnboardingState: mocks.saveStructuredState,
}));

vi.mock("@/lib/queries", () => ({
  trendingRecipesQuery: () => ({ queryKey: ["trending"], queryFn: async () => [] }),
  southAfricanFavoritesQuery: () => ({ queryKey: ["sa-favs"], queryFn: async () => [] }),
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

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("en");
  mocks.get.mockResolvedValue(null);
  mocks.save.mockResolvedValue({ ok: true });
  mocks.navigate.mockResolvedValue(undefined);
  mocks.verifyPremium.mockResolvedValue({ isPremium: false });
  mocks.getIntroCompletion.mockResolvedValue(false);
  mocks.dispatchAnalyticsEvent.mockResolvedValue(undefined);
  mocks.saveStructuredState.mockResolvedValue({ ok: true });
  mocks.saveStructuredFallback.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
});

describe("onboarding 8-page flow", () => {
  it("walks through all 8 pages, shows real processing + results screen, and completes to /premium for free users", async () => {
    renderWithQuery(<Page />);

    // Page 1: Welcome & Food Goals
    await screen.findByRole("heading", { name: "Let's make eating better easier." });
    fireEvent.click(screen.getByRole("button", { name: "Eat healthier." }));
    fireEvent.click(screen.getByRole("button", { name: "Save money on food." }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 2: Understanding Their Problems
    await screen.findByRole("heading", { name: "What's making eating well difficult?" });
    fireEvent.click(screen.getByRole("button", { name: "I never know what to cook." }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 3: Health & Fitness Goals
    await screen.findByRole("heading", { name: "What are you working towards?" });
    fireEvent.click(screen.getByRole("button", { name: "Build healthier eating habits." }));
    fireEvent.click(screen.getByRole("button", { name: "Under 18" }));
    await screen.findByText(/Balanced nutrition active:/i);
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 4: Current Eating Habits
    await screen.findByRole("heading", { name: "Let's understand your routine." });
    fireEvent.click(screen.getByRole("button", { name: "I have a consistent routine" }));
    fireEvent.click(screen.getByRole("button", { name: "Every day" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 5: Preferences, Allergies & Restrictions
    await screen.findByRole("heading", { name: "What do you enjoy eating?" });
    fireEvent.click(screen.getByRole("button", { name: "South African food" }));
    fireEvent.click(screen.getByRole("button", { name: "Peanuts" }));
    fireEvent.click(screen.getByRole("button", { name: "Halal" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 6: Cooking Lifestyle & ZAR budget
    await screen.findByRole("heading", { name: "Let's make cooking fit your life." });
    fireEvent.click(screen.getByRole("button", { name: "15–30 minutes" }));
    fireEvent.click(screen.getByText("Beginner"));
    fireEvent.click(screen.getByRole("button", { name: "R1,000–R2,500 / month" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 7: How Did You Discover MealMate?
    await screen.findByRole("heading", { name: "How did you hear about us?" });
    fireEvent.click(screen.getByRole("button", { name: "TikTok" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Page 8: Summary & Build My MealMate Experience CTA
    await screen.findByRole("heading", { name: "Your MealMate journey starts here." });
    const buildBtn = screen.getByRole("button", { name: /Build My MealMate Experience/i });
    fireEvent.click(buildBtn);

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        data: expect.objectContaining({
          goals: ["Eat healthier.", "Save money on food."],
          challenges: ["I never know what to cook."],
          balanced_nutrition_safeguard: true,
          dietary_restrictions: ["Halal"],
          allergies: ["Peanuts"],
          budget_range_zar: "R1,000–R2,500 / month",
          acquisition: expect.objectContaining({ self_reported_source: "TikTok" }),
          onboarding_completed: true,
        }),
      }),
    );

    // Personalised Results screen appears after processing steps finish
    await screen.findByRole("heading", { name: "Your MealMate experience is ready." });
    expect(readOnboardingDraft("account-a")).toBeNull();

    // Continue from Results checks entitlement and navigates to /premium
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
  });

  it("skips paywall (/premium) and routes active premium users straight to /welcome", async () => {
    mocks.verifyPremium.mockResolvedValue({ isPremium: true });
    mocks.getIntroCompletion.mockResolvedValue(false);
    mocks.get.mockResolvedValue({ ...EMPTY_PREFERENCES, onboarding_completed: true });

    renderWithQuery(<Page />);

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/welcome", replace: true }),
    );
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("keeps failed completion retryable on the Processing screen and prevents duplicate submissions", async () => {
    saveOnboardingDraft("account-a", 7, EMPTY_PREFERENCES);
    mocks.save.mockRejectedValueOnce(new Error("Connection interrupted"));
    renderWithQuery(<Page />);

    const finish = await screen.findByRole("button", { name: /Build My MealMate Experience/i });
    fireEvent.click(finish);
    fireEvent.click(finish);

    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    await screen.findByRole("alert");
    expect(mocks.navigate).not.toHaveBeenCalled();

    mocks.save.mockResolvedValueOnce({ ok: true });
    const retryBtn = screen.getAllByRole("button", { name: /Try again/i })[0]!;
    fireEvent.click(retryBtn);

    await screen.findByRole("heading", { name: "Your MealMate experience is ready." });
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/premium", replace: true }),
    );
  });

  it("resumes only the current account's draft", async () => {
    saveOnboardingDraft("account-b", 4, { ...EMPTY_PREFERENCES, allergies: ["Milk"] });
    renderWithQuery(<Page />);
    await screen.findByRole("heading", { name: "Let's make eating better easier." });
    expect(readOnboardingDraft("account-b")?.preferences.allergies).toEqual(["Milk"]);
  });

  it("auto-saves partially filled answers on page close and restores step and selections", async () => {
    renderWithQuery(<Page />);

    await screen.findByRole("heading", { name: "Let's make eating better easier." });
    const nameInput = screen.getByLabelText(/What should MealMate call you\?/i);
    fireEvent.change(nameInput, { target: { value: "Thabo M." } });
    fireEvent.click(screen.getByRole("button", { name: "5+ people (large feast)" }));

    fireEvent(window, new Event("pagehide"));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        data: expect.objectContaining({
          preferred_name: "Thabo M.",
          household_size: "5+ people (large feast)",
          onboarding_step: 0,
          onboarding_completed: false,
        }),
      }),
    );

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
      goals: ["Plan my meals."],
      challenges: ["I waste groceries."],
      onboarding_step: 1,
      onboarding_completed: false,
      updated_at: "2026-11-13T18:50:00.000Z",
    });

    renderWithQuery(<Page />);

    await screen.findByRole("heading", { name: "What's making eating well difficult?" });
    expect(
      screen.getByRole("button", { name: "I waste groceries." }).getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    await screen.findByRole("heading", { name: "Let's make eating better easier." });
    expect(
      (screen.getByLabelText(/What should MealMate call you\?/i) as HTMLInputElement).value,
    ).toBe("Thabo M.");
    expect(
      screen.getByRole("button", { name: "5+ people (large feast)" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("switches onboarding page headings across EN, ZU, and AF while saving canonical English values", async () => {
    const { container } = renderWithQuery(<Page />);

    await screen.findByRole("heading", { name: "Let's make eating better easier." });

    const footer = container.querySelector("footer.onboarding-actions");
    expect(footer).not.toBeNull();

    const languageSelect = within(footer as HTMLElement).getByRole("combobox", {
      name: /Language/i,
    }) as HTMLSelectElement;
    expect(languageSelect.value).toBe("en");
    expect(languageSelect.options.length).toBe(11);

    // Switch to isiZulu
    fireEvent.change(languageSelect, { target: { value: "zu" } });

    await screen.findByRole("heading", { name: "Masenze ukudla kahle kube lula." });
    expect(localStorage.getItem("mealmate-lang")).toBe("zu");
    expect(screen.getByRole("button", { name: /Qhubeka/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Abantu abayi-3 to 4 (umndeni)" }));
    fireEvent.click(screen.getByRole("button", { name: /Qhubeka/i }));

    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        data: expect.objectContaining({
          household_size: "3 to 4 people (family)",
          onboarding_step: 1,
        }),
      }),
    );

    await screen.findByRole("heading", { name: "Yini eyenza ukudla kahle kube nzima?" });

    // Switch to Afrikaans
    const zuSelect = within(footer as HTMLElement).getByRole("combobox", { name: /Ulimi/i });
    fireEvent.change(zuSelect, { target: { value: "af" } });

    await screen.findByRole("heading", { name: "Wat maak gesonde eet moeilik?" });
    expect(localStorage.getItem("mealmate-lang")).toBe("af");
    expect(screen.getByRole("button", { name: /Gaan voort/i })).toBeTruthy();

    // Switch back to English
    const afSelect = within(footer as HTMLElement).getByRole("combobox", { name: /Taal/i });
    fireEvent.change(afSelect, { target: { value: "en" } });

    await screen.findByRole("heading", { name: "What's making eating well difficult?" });
    expect(localStorage.getItem("mealmate-lang")).toBe("en");
  });
});
