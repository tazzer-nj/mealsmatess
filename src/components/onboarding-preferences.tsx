import { useTranslation } from "react-i18next";
import type { FoodPreferences } from "@/lib/preferences";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Target, Salad, AlertTriangle, Globe, ChefHat, Clock } from "lucide-react";

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

const HOUSEHOLD_OPTIONS = [
  "1 person (solo)",
  "2 people (couple)",
  "3–4 people (family)",
  "5+ people (large feast)",
];

const MEAL_GOALS = [
  "Eat healthier & balanced",
  "Discover new recipes",
  "Save time",
  "Save money",
  "Plan weekly meals",
  "Reduce food waste",
  "High protein & fitness",
  "Family-friendly cooking",
];

const DIETARY_RESTRICTIONS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Dairy-free",
  "Keto / Low-carb",
  "Pescatarian",
];

const FOOD_ALLERGIES = [
  "None",
  "Peanuts",
  "Tree nuts",
  "Milk / Lactose",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
];

const FAVOURITE_CUISINES = [
  "South African",
  "Italian",
  "Mexican",
  "Asian Fusion",
  "Mediterranean",
  "Indian",
  "Healthy meals",
  "High protein",
  "Comfort food",
  "Quick weeknight meals",
  "Anything!",
];

const SKILL_LEVELS = [
  { level: "Beginner", desc: "Simple recipes with clear, step-by-step guidance." },
  { level: "Intermediate", desc: "Comfortable with everyday techniques and flavour building." },
  { level: "Experienced", desc: "Confident in the kitchen and ready for creative dishes." },
];

const COOKING_TIMES = ["Under 20 mins", "20–35 mins", "35–50 mins", "Weekend slow cooking"];

export function OnboardingStepContent({
  step,
  preferences,
  preferredName,
  onPreferredNameChange,
  householdSize,
  onHouseholdSizeChange,
  onChange,
  onSkipStep,
  disabled = false,
}: OnboardingWizardProps) {
  const { t } = useTranslation();

  function getOptionMap(key: string): Record<string, string> {
    const value = t(`onboarding.options.${key}`, { returnObjects: true });
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  }

  function translateOption(group: string, canonical: string): string {
    return getOptionMap(group)[canonical] ?? canonical;
  }

  function toggleList(
    field: "favorite_foods" | "dietary_restrictions" | "allergies",
    option: string,
  ) {
    if (option === "None") {
      onChange({ ...preferences, [field]: [] });
      return;
    }
    const current = preferences[field];
    const filtered = current.filter((x) => x !== "None");
    onChange({
      ...preferences,
      [field]: filtered.includes(option)
        ? filtered.filter((v) => v !== option)
        : [...filtered, option],
    });
  }

  // Step 0: Preferred name & Household Size
  if (step === 0) {
    return (
      <div className="onboarding-step-body">
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
            className="mt-2 h-12 rounded-xl border-border bg-secondary px-4 text-sm text-foreground focus-visible:border-[var(--periwinkle)]"
            maxLength={40}
          />
        </div>

        <div className="onboarding-field-group mt-6">
          <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Users size={15} className="text-[var(--periwinkle)]" />{" "}
            {t("onboarding.fields.householdLabel")}
          </Label>
          <div className="onboarding-chips">
            {HOUSEHOLD_OPTIONS.map((s) => (
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
      </div>
    );
  }

  // Step 1: Meal goals
  if (step === 1) {
    return (
      <div className="onboarding-step-body">
        <Label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Target size={15} className="text-[var(--periwinkle)]" />{" "}
          {t("onboarding.fields.goalLabel")}
        </Label>
        <p className="mb-4 text-xs text-muted-foreground">{t("onboarding.fields.goalHint")}</p>
        <div className="onboarding-chips">
          {MEAL_GOALS.map((goal) => (
            <button
              type="button"
              key={goal}
              disabled={disabled}
              aria-pressed={preferences.goal === goal}
              onClick={() =>
                onChange({ ...preferences, goal: preferences.goal === goal ? null : goal })
              }
            >
              {translateOption("goals", goal)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Dietary Preferences
  if (step === 2) {
    return (
      <div className="onboarding-step-body">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Salad size={15} className="text-[var(--periwinkle)]" />{" "}
              {t("onboarding.fields.dietLabel")}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">{t("onboarding.fields.dietHint")}</p>
          </div>
          {onSkipStep && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange({ ...preferences, dietary_restrictions: [] });
                onSkipStep();
              }}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("onboarding.skipIfNone")}
            </button>
          )}
        </div>
        <div className="onboarding-chips">
          {DIETARY_RESTRICTIONS.map((diet) => {
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
                onClick={() => toggleList("dietary_restrictions", diet)}
              >
                {translateOption("diet", diet)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 3: Food Allergies
  if (step === 3) {
    return (
      <div className="onboarding-step-body">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <AlertTriangle size={15} className="text-[var(--periwinkle)]" />{" "}
              {t("onboarding.fields.allergiesLabel")}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("onboarding.fields.allergiesHint")}
            </p>
          </div>
          {onSkipStep && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange({ ...preferences, allergies: [] });
                onSkipStep();
              }}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("onboarding.skipIfNone")}
            </button>
          )}
        </div>
        <div className="onboarding-chips">
          {FOOD_ALLERGIES.map((allergen) => {
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
                onClick={() => toggleList("allergies", allergen)}
              >
                {translateOption("allergies", allergen)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 4: Favourite Flavours & Cuisines
  if (step === 4) {
    return (
      <div className="onboarding-step-body">
        <Label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Globe size={15} className="text-[var(--periwinkle)]" />{" "}
          {t("onboarding.fields.flavoursLabel")}
        </Label>
        <p className="mb-4 text-xs text-muted-foreground">{t("onboarding.fields.flavoursHint")}</p>
        <div className="onboarding-chips">
          {FAVOURITE_CUISINS_OPTIONS(preferences.favorite_foods).map((cuisine) => {
            const isSelected = preferences.favorite_foods.includes(cuisine);
            return (
              <button
                type="button"
                key={cuisine}
                disabled={disabled}
                aria-pressed={isSelected}
                onClick={() => toggleList("favorite_foods", cuisine)}
              >
                {translateOption("cuisines", cuisine)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 5: Cooking Skill & Time
  if (step === 5) {
    const skillTranslations = t("onboarding.options.skillLevels", {
      returnObjects: true,
    }) as Record<string, { label?: string; desc?: string }>;

    return (
      <div className="onboarding-step-body">
        <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <ChefHat size={15} className="text-[var(--periwinkle)]" />{" "}
          {t("onboarding.fields.skillLabel")}
        </Label>
        <div className="mb-6 grid gap-2.5 sm:grid-cols-3">
          {SKILL_LEVELS.map((item) => {
            const active = preferences.cooking_level === item.level;
            const translated =
              skillTranslations && typeof skillTranslations === "object"
                ? skillTranslations[item.level]
                : undefined;
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
                <div className="text-sm font-medium">{translated?.label ?? item.level}</div>
                <div
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? "text-background/75" : "text-muted-foreground"
                  }`}
                >
                  {translated?.desc ?? item.desc}
                </div>
              </button>
            );
          })}
        </div>

        <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Clock size={15} className="text-[var(--periwinkle)]" />{" "}
          {t("onboarding.fields.cookingTimeLabel")}
        </Label>
        <div className="onboarding-chips">
          {COOKING_TIMES.map((time) => (
            <button
              type="button"
              key={time}
              disabled={disabled}
              aria-pressed={preferences.cooking_time === time}
              onClick={() => onChange({ ...preferences, cooking_time: time })}
            >
              {translateOption("cookingTimes", time)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function FAVOURITE_CUISINS_OPTIONS(custom: string[]) {
  return Array.from(new Set([...FAVOURITE_CUISINES, ...custom]));
}
