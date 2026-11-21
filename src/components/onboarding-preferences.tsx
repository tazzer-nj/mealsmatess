import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FoodPreferences } from "@/lib/preferences";
import {
  AGE_BRACKETS,
  HOUSEHOLD_SIZE_OPTIONS,
  PAGE_1_FOOD_GOALS,
  PAGE_2_CHALLENGES,
  PAGE_3_HEALTH_GOALS,
  PAGE_4_BIGGEST_CHALLENGES,
  PAGE_4_COOKING_FREQUENCIES,
  PAGE_4_EATING_HABITS,
  PAGE_5_ALLERGIES,
  PAGE_5_COMMON_DISLIKES,
  PAGE_5_DIETARY_RESTRICTIONS,
  PAGE_5_MEAL_ENJOYMENTS,
  PAGE_6_BUDGET_ZAR,
  PAGE_6_COOKING_SKILLS,
  PAGE_6_COOKING_TIMES,
  PAGE_7_DISCOVERY_SOURCES,
  buildDynamicOnboardingSummary,
  getRelevantOnboardingBenefits,
  isBalancedNutritionSafeguardRequired,
} from "@/lib/personalisation";
import { captureInitialAttribution } from "@/lib/analytics-events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Compass,
  HeartPulse,
  Loader2,
  Salad,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";

export type OnboardingWizardProps = {
  step: number;
  preferences: FoodPreferences;
  preferredName: string;
  onPreferredNameChange: (name: string) => void;
  householdSize: string;
  onHouseholdSizeChange: (size: string) => void;
  onChange: (p: FoodPreferences) => void;
  onSkipStep?: () => void;
  disabled?: boolean;
};

export function OnboardingStepContent({
  step,
  preferences,
  preferredName,
  onPreferredNameChange,
  householdSize,
  onHouseholdSizeChange,
  onChange,
  disabled = false,
}: OnboardingWizardProps) {
  const { t } = useTranslation();
  const [customDislike, setCustomDislike] = useState("");
  const safeguard = isBalancedNutritionSafeguardRequired(preferences);

  function getOptionMap(key: string): Record<string, string> {
    const value = t(`onboarding.options.${key}`, { returnObjects: true });
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  }

  function translateOption(group: string, canonical: string): string {
    return getOptionMap(group)[canonical] ?? canonical;
  }

  function toggleMulti(
    field:
      | "goals"
      | "challenges"
      | "health_goals"
      | "meal_enjoyments"
      | "allergies"
      | "dietary_restrictions"
      | "disliked_foods",
    option: string,
  ) {
    if (option === "None") {
      onChange({ ...preferences, [field]: [] });
      return;
    }
    const current = preferences[field] ?? [];
    const filtered = current.filter((x) => x !== "None");
    const next = filtered.includes(option)
      ? filtered.filter((v) => v !== option)
      : [...filtered, option];

    if (field === "goals") {
      onChange({
        ...preferences,
        goals: next,
        goal: next[0] ?? null,
      });
      return;
    }
    if (field === "meal_enjoyments") {
      onChange({
        ...preferences,
        meal_enjoyments: next,
        favorite_foods: Array.from(new Set([...next, ...(preferences.preferred_cuisines ?? [])])),
      });
      return;
    }
    onChange({
      ...preferences,
      [field]: next,
    });
  }

  // Page 1: Welcome & Food Goals
  if (step === 0) {
    const selectedGoals = preferences.goals?.length
      ? preferences.goals
      : preferences.goal
        ? [preferences.goal]
        : [];
    return (
      <div className="onboarding-step-body space-y-6">
        <div className="onboarding-field-group">
          <Label
            htmlFor="preferred-name"
            className="flex items-center gap-2 text-[13px] font-medium text-foreground"
          >
            <Users size={15} className="text-[var(--periwinkle)]" />{" "}
            {t("onboarding.fields.preferredNameLabel")}
          </Label>
          <Input
            id="preferred-name"
            placeholder={t("onboarding.fields.preferredNamePlaceholder")}
            value={preferredName}
            onChange={(e) => onPreferredNameChange(e.target.value)}
            disabled={disabled}
            className="mt-2 h-11 rounded-xl border-border bg-secondary px-4 text-sm text-foreground focus-visible:border-[var(--periwinkle)]"
            maxLength={40}
          />
        </div>

        <div className="onboarding-field-group">
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Users size={15} className="text-[var(--periwinkle)]" />{" "}
            {t("onboarding.fields.householdLabel")}
          </Label>
          <div className="onboarding-chips">
            {HOUSEHOLD_SIZE_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                disabled={disabled}
                aria-pressed={householdSize === s}
                onClick={() => onHouseholdSizeChange(s)}
              >
                {translateOption("household", s)}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding-field-group">
          <Label className="mb-1 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Target size={15} className="text-[var(--periwinkle)]" /> What would you like MealMate to
            help you with?
          </Label>
          <p className="mb-3 text-xs text-muted-foreground">Select all goals that apply.</p>
          <div className="onboarding-chips">
            {PAGE_1_FOOD_GOALS.map((goal) => (
              <button
                type="button"
                key={goal}
                disabled={disabled}
                aria-pressed={selectedGoals.includes(goal)}
                onClick={() => toggleMulti("goals", goal)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Page 2: Understanding Their Problems
  if (step === 1) {
    const challenges = preferences.challenges ?? [];
    return (
      <div className="onboarding-step-body">
        <Label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Sparkles size={15} className="text-[var(--periwinkle)]" /> Select your everyday food
          challenges
        </Label>
        <p className="mb-4 text-xs text-muted-foreground">
          MealMate uses your answers to personalise recipes, pantry ideas, and Mia&apos;s advice.
        </p>
        <div className="onboarding-chips">
          {PAGE_2_CHALLENGES.map((challenge) => (
            <button
              type="button"
              key={challenge}
              disabled={disabled}
              aria-pressed={challenges.includes(challenge)}
              onClick={() => toggleMulti("challenges", challenge)}
            >
              {challenge}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Page 3: Health & Fitness Goals
  if (step === 2) {
    const healthGoals = preferences.health_goals ?? [];
    return (
      <div className="onboarding-step-body space-y-6">
        <div>
          <Label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <HeartPulse size={15} className="text-[var(--periwinkle)]" /> Select your health &amp;
            fitness focus
          </Label>
          <p className="mb-3 text-xs text-muted-foreground">Choose one or more priorities.</p>
          <div className="onboarding-chips">
            {PAGE_3_HEALTH_GOALS.map((goal) => (
              <button
                type="button"
                key={goal}
                disabled={disabled}
                aria-pressed={healthGoals.includes(goal)}
                onClick={() => toggleMulti("health_goals", goal)}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <ShieldCheck size={15} className="text-[var(--periwinkle)]" /> Age group (optional)
          </Label>
          <p className="mb-3 text-xs text-muted-foreground">
            Optional — helps MealMate keep nutrition guidance age-appropriate.
          </p>
          <div className="onboarding-chips">
            {AGE_BRACKETS.map((bracket) => (
              <button
                type="button"
                key={bracket.id}
                disabled={disabled}
                aria-pressed={preferences.age_bracket === bracket.id}
                onClick={() =>
                  onChange({
                    ...preferences,
                    age_bracket: preferences.age_bracket === bracket.id ? null : bracket.id,
                    balanced_nutrition_safeguard: bracket.id === "under_18",
                  })
                }
              >
                {bracket.label}
              </button>
            ))}
          </div>
          {safeguard && (
            <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
              <strong className="font-semibold text-foreground">Balanced nutrition active:</strong>{" "}
              Recommendations and Mia focus on nourishing meals, steady energy, and home cooking —
              never calorie-deficit or restrictive diet targets.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Page 4: Current Eating Habits
  if (step === 3) {
    return (
      <div className="onboarding-step-body space-y-6">
        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Clock size={15} className="text-[var(--periwinkle)]" /> How would you describe your
            eating habits?
          </Label>
          <div className="onboarding-chips">
            {PAGE_4_EATING_HABITS.map((habit) => (
              <button
                type="button"
                key={habit}
                disabled={disabled}
                aria-pressed={preferences.eating_habits === habit}
                onClick={() =>
                  onChange({
                    ...preferences,
                    eating_habits: preferences.eating_habits === habit ? null : habit,
                  })
                }
              >
                {habit}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <ChefHat size={15} className="text-[var(--periwinkle)]" /> How often do you cook?
          </Label>
          <div className="onboarding-chips">
            {PAGE_4_COOKING_FREQUENCIES.map((freq) => (
              <button
                type="button"
                key={freq}
                disabled={disabled}
                aria-pressed={preferences.cooking_frequency === freq}
                onClick={() =>
                  onChange({
                    ...preferences,
                    cooking_frequency: preferences.cooking_frequency === freq ? null : freq,
                  })
                }
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Target size={15} className="text-[var(--periwinkle)]" /> What is your biggest eating
            challenge?
          </Label>
          <div className="onboarding-chips">
            {PAGE_4_BIGGEST_CHALLENGES.map((item) => (
              <button
                type="button"
                key={item}
                disabled={disabled}
                aria-pressed={preferences.primary_challenge === item}
                onClick={() =>
                  onChange({
                    ...preferences,
                    primary_challenge: preferences.primary_challenge === item ? null : item,
                  })
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Page 5: Food Preferences, Allergies, Dietary Restrictions & Disliked Ingredients
  if (step === 4) {
    const enjoyments = preferences.meal_enjoyments ?? [];
    return (
      <div className="onboarding-step-body space-y-6">
        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Salad size={15} className="text-[var(--periwinkle)]" /> Flavours &amp; meal styles you
            enjoy
          </Label>
          <div className="onboarding-chips">
            {PAGE_5_MEAL_ENJOYMENTS.map((item) => (
              <button
                type="button"
                key={item}
                disabled={disabled}
                aria-pressed={enjoyments.includes(item)}
                onClick={() => toggleMulti("meal_enjoyments", item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-1 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <AlertTriangle size={15} className="text-[var(--periwinkle)]" /> Food allergies
          </Label>
          <p className="mb-2.5 text-xs text-muted-foreground">
            Stored strictly as safety exclusions — never treated as food preferences.
          </p>
          <div className="onboarding-chips">
            {PAGE_5_ALLERGIES.map((allergen) => {
              const isSelected =
                allergen === "None"
                  ? preferences.allergies.length === 0
                  : preferences.allergies.includes(allergen);
              return (
                <button
                  type="button"
                  key={allergen}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  onClick={() => toggleMulti("allergies", allergen)}
                >
                  {translateOption("allergies", allergen)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <ShieldCheck size={15} className="text-[var(--periwinkle)]" /> Dietary restrictions
          </Label>
          <div className="onboarding-chips">
            {PAGE_5_DIETARY_RESTRICTIONS.map((diet) => {
              const isSelected =
                diet === "None"
                  ? preferences.dietary_restrictions.length === 0
                  : preferences.dietary_restrictions.includes(diet);
              return (
                <button
                  type="button"
                  key={diet}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  onClick={() => toggleMulti("dietary_restrictions", diet)}
                >
                  {translateOption("diet", diet)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            Disliked ingredients (optional)
          </Label>
          <div className="onboarding-chips">
            {Array.from(
              new Set([...PAGE_5_COMMON_DISLIKES, ...(preferences.disliked_foods ?? [])]),
            ).map((food) => (
              <button
                type="button"
                key={food}
                disabled={disabled}
                aria-pressed={preferences.disliked_foods.includes(food)}
                onClick={() => toggleMulti("disliked_foods", food)}
              >
                {food}
              </button>
            ))}
          </div>
          <div className="mt-2.5 flex gap-2">
            <Input
              value={customDislike}
              onChange={(e) => setCustomDislike(e.target.value)}
              placeholder="Add ingredient to avoid..."
              maxLength={40}
              disabled={disabled}
              className="h-10 rounded-xl border-border bg-secondary text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customDislike.trim()) {
                  e.preventDefault();
                  const val = customDislike.trim();
                  if (!preferences.disliked_foods.includes(val)) {
                    onChange({
                      ...preferences,
                      disliked_foods: [...preferences.disliked_foods, val],
                    });
                  }
                  setCustomDislike("");
                }
              }}
            />
            <button
              type="button"
              disabled={disabled || !customDislike.trim()}
              onClick={() => {
                const val = customDislike.trim();
                if (!val) return;
                if (!preferences.disliked_foods.includes(val)) {
                  onChange({
                    ...preferences,
                    disliked_foods: [...preferences.disliked_foods, val],
                  });
                }
                setCustomDislike("");
              }}
              className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-[var(--periwinkle)] disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page 6: Cooking Lifestyle
  if (step === 5) {
    return (
      <div className="onboarding-step-body space-y-6">
        <div>
          <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Clock size={15} className="text-[var(--periwinkle)]" /> How much time can you usually
            spend cooking?
          </Label>
          <div className="onboarding-chips">
            {PAGE_6_COOKING_TIMES.map((time) => (
              <button
                type="button"
                key={time}
                disabled={disabled}
                aria-pressed={preferences.cooking_time === time}
                onClick={() => onChange({ ...preferences, cooking_time: time })}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <ChefHat size={15} className="text-[var(--periwinkle)]" /> Cooking skills
          </Label>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PAGE_6_COOKING_SKILLS.map((item) => {
              const active = preferences.cooking_level === item.level;
              return (
                <button
                  type="button"
                  key={item.level}
                  disabled={disabled}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-secondary text-foreground hover:border-[var(--periwinkle)]"
                  }`}
                  onClick={() => onChange({ ...preferences, cooking_level: item.level })}
                >
                  <div className="text-sm font-medium">{item.level}</div>
                  <div
                    className={`mt-1 text-xs leading-relaxed ${
                      active ? "text-background/75" : "text-muted-foreground"
                    }`}
                  >
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Wallet size={15} className="text-[var(--periwinkle)]" /> Typical monthly food budget in
            ZAR (optional)
          </Label>
          <div className="onboarding-chips">
            {PAGE_6_BUDGET_ZAR.map((range) => (
              <button
                type="button"
                key={range}
                disabled={disabled}
                aria-pressed={preferences.budget_range_zar === range}
                onClick={() =>
                  onChange({
                    ...preferences,
                    budget_range_zar: preferences.budget_range_zar === range ? null : range,
                    food_budget:
                      preferences.budget_range_zar === range
                        ? null
                        : /(under r1,000|r1,000[–-]r2,500)/i.test(range)
                          ? "Budget friendly"
                          : range,
                  })
                }
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Page 7: How Did You Discover MealMate?
  if (step === 6) {
    const selectedSource = preferences.acquisition?.self_reported_source ?? null;
    const otherDetail = preferences.acquisition?.other_detail ?? "";
    const utm = captureInitialAttribution();

    function selectSource(source: string) {
      const existingAcq = preferences.acquisition;
      onChange({
        ...preferences,
        acquisition: {
          self_reported_source: source,
          other_detail: source === "Other" ? otherDetail : null,
          utm_source: existingAcq?.utm_source ?? utm?.utm_source ?? null,
          utm_medium: existingAcq?.utm_medium ?? utm?.utm_medium ?? null,
          utm_campaign: existingAcq?.utm_campaign ?? utm?.utm_campaign ?? null,
          referrer: existingAcq?.referrer ?? utm?.referrer ?? null,
          captured_at: existingAcq?.captured_at ?? utm?.captured_at ?? new Date().toISOString(),
        },
      });
    }

    return (
      <div className="onboarding-step-body space-y-5">
        <div>
          <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Compass size={15} className="text-[var(--periwinkle)]" /> Where did you first find
            MealMate?
          </Label>
          <div className="onboarding-chips">
            {PAGE_7_DISCOVERY_SOURCES.map((source) => (
              <button
                type="button"
                key={source}
                disabled={disabled}
                aria-pressed={selectedSource === source}
                onClick={() => selectSource(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        {selectedSource === "Other" && (
          <div>
            <Label htmlFor="discovery-other-detail" className="text-xs font-medium text-foreground">
              Tell us where you heard about MealMate (optional)
            </Label>
            <Input
              id="discovery-other-detail"
              value={otherDetail}
              disabled={disabled}
              maxLength={140}
              placeholder="e.g. Newsletter, culinary blog, community group..."
              onChange={(e) => {
                const detail = e.target.value;
                const existingAcq = preferences.acquisition;
                onChange({
                  ...preferences,
                  acquisition: {
                    self_reported_source: selectedSource ?? "Other",
                    other_detail: detail || null,
                    utm_source: existingAcq?.utm_source ?? utm?.utm_source ?? null,
                    utm_medium: existingAcq?.utm_medium ?? utm?.utm_medium ?? null,
                    utm_campaign: existingAcq?.utm_campaign ?? utm?.utm_campaign ?? null,
                    referrer: existingAcq?.referrer ?? utm?.referrer ?? null,
                    captured_at:
                      existingAcq?.captured_at ?? utm?.captured_at ?? new Date().toISOString(),
                  },
                });
              }}
              className="mt-2 h-11 rounded-xl border-border bg-secondary text-sm"
            />
          </div>
        )}
      </div>
    );
  }

  // Page 8: Personalise Your Experience Summary
  if (step === 7) {
    const summaryText = buildDynamicOnboardingSummary(preferences);
    const benefits = getRelevantOnboardingBenefits(preferences);

    return (
      <div className="onboarding-step-body space-y-5">
        <div className="rounded-xl border border-border bg-secondary/50 p-4">
          <p className="text-sm font-medium leading-relaxed text-foreground">{summaryText}</p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What MealMate is setting up for you
          </p>
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground"
              >
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--periwinkle)]" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return null;
}

export type ProcessingStepItem = {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
};

export function OnboardingProcessingView({
  steps,
  error,
  onRetry,
}: {
  steps: ProcessingStepItem[];
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="onboarding-step-body space-y-4">
      <ul className="space-y-2.5" aria-label="Personalisation progress steps">
        {steps.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm"
          >
            <span
              className={
                item.status === "done"
                  ? "font-medium text-foreground"
                  : item.status === "active"
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
              }
            >
              {item.label}
            </span>
            {item.status === "done" ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                <Check size={13} />
              </span>
            ) : item.status === "active" ? (
              <Loader2 size={16} className="animate-spin text-[var(--periwinkle)]" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            )}
          </li>
        ))}
      </ul>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive"
        >
          <p>{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 font-semibold underline hover:opacity-80"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OnboardingResultsView({
  preferences,
}: {
  preferences: FoodPreferences;
}) {
  const summary = buildDynamicOnboardingSummary(preferences);
  const benefits = getRelevantOnboardingBenefits(preferences);
  const exclusions = [
    ...(preferences.allergies ?? []),
    ...(preferences.dietary_restrictions ?? []),
  ];

  return (
    <div className="onboarding-step-body space-y-4">
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--periwinkle)]">
          Ready for your kitchen
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{summary}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">Recommended Focus</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {preferences.personalisation_profile?.recommended_categories.slice(0, 2).join(" · ") ||
              "South African & Balanced"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[11px] font-medium text-muted-foreground">Active Safety Exclusions</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {exclusions.length > 0 ? exclusions.join(", ") : "None specified"}
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--periwinkle)]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
