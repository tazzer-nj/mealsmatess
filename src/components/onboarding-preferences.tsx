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
            <Users size={15} className="text-[var(--periwinkle)]" /> What should MealMate call you?
          </Label>
          <Input
            id="preferred-name"
            placeholder="e.g. Thabo or Alex"
            value={preferredName}
            onChange={(e) => onPreferredNameChange(e.target.value)}
            disabled={disabled}
            className="mt-2 h-12 rounded-xl border-border bg-secondary px-4 text-sm text-foreground focus-visible:border-[var(--periwinkle)]"
            maxLength={40}
          />
        </div>

        <div className="onboarding-field-group mt-6">
          <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
            <Users size={15} className="text-[var(--periwinkle)]" /> Household or serving size
          </Label>
          <div className="onboarding-chips">
            {[
              "1 person (solo)",
              "2 people (couple)",
              "3–4 people (family)",
              "5+ people (large feast)",
            ].map((s) => (
              <button
                type="button"
                key={s}
                disabled={disabled}
                aria-pressed={householdSize === s}
                onClick={() => onHouseholdSizeChange(s)}
              >
                {s}
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
          <Target size={15} className="text-[var(--periwinkle)]" /> What is your primary meal goal?
        </Label>
        <p className="mb-4 text-xs text-muted-foreground">
          Select what matters most for weeknight dinners and weekly planning.
        </p>
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
              {goal}
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
              <Salad size={15} className="text-[var(--periwinkle)]" /> Do you follow any dietary
              preferences?
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose any eating styles that apply to your household.
            </p>
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
              Skip if none
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
                {diet}
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
              <AlertTriangle size={15} className="text-[var(--periwinkle)]" /> Any food allergies or
              intolerances?
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Excluded automatically from recipe suggestions and weekly plans.
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
              Skip if none
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
                {allergen}
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
          <Globe size={15} className="text-[var(--periwinkle)]" /> What kind of food do you enjoy?
        </Label>
        <p className="mb-4 text-xs text-muted-foreground">
          Select as many cuisines and styles as you like.
        </p>
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
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 5: Cooking Skill & Time
  if (step === 5) {
    return (
      <div className="onboarding-step-body">
        <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <ChefHat size={15} className="text-[var(--periwinkle)]" /> What&apos;s your cooking style?
        </Label>
        <div className="mb-6 grid gap-2.5 sm:grid-cols-3">
          {SKILL_LEVELS.map((item) => {
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

        <Label className="mb-2.5 flex items-center gap-2 text-[13px] font-medium text-foreground">
          <Clock size={15} className="text-[var(--periwinkle)]" /> Preferred cooking time
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
              {time}
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
