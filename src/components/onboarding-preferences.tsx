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
  disabled?: boolean;
};

const MEAL_GOALS = [
  "Eat healthier & balanced",
  "Save money & reduce waste",
  "Quick & easy weeknight meals",
  "Discover new global recipes",
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
  "American",
  "West African",
  "Japanese",
  "Middle Eastern",
];

const SKILL_LEVELS = [
  { level: "Beginner", desc: "Just starting out, prefer simple step-by-step guidance." },
  { level: "Intermediate", desc: "Comfortable with everyday cooking techniques and spices." },
  { level: "Advanced", desc: "Experienced in the kitchen, eager for gourmet experiments." },
];

const COOKING_TIMES = [
  "Under 20 mins",
  "20–35 mins",
  "35–50 mins",
  "Weekend slow cooking",
];

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
  function toggleList(field: "favorite_foods" | "dietary_restrictions" | "allergies", option: string) {
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
          <Label htmlFor="preferred-name" className="text-white font-semibold flex items-center gap-2">
            <Users size={16} className="text-periwinkle" /> What should MealMate call you?
          </Label>
          <Input
            id="preferred-name"
            placeholder="e.g. Thabo or Alex"
            value={preferredName}
            onChange={(e) => onPreferredNameChange(e.target.value)}
            disabled={disabled}
            className="auth-input mt-1.5"
            maxLength={40}
          />
        </div>

        <div className="onboarding-field-group mt-6">
          <Label className="text-white font-semibold flex items-center gap-2 mb-2">
            <Users size={16} className="text-periwinkle" /> Household or serving size
          </Label>
          <div className="onboarding-chips">
            {["1 person (solo)", "2 people (couple)", "3–4 people (family)", "5+ people (large feast)"].map((s) => (
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
        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <Target size={16} className="text-periwinkle" /> What is your primary meal goal?
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Select what matters most for dinner and weekly meal plans.
        </p>
        <div className="onboarding-chips">
          {MEAL_GOALS.map((goal) => (
            <button
              type="button"
              key={goal}
              disabled={disabled}
              aria-pressed={preferences.goal === goal}
              onClick={() => onChange({ ...preferences, goal: preferences.goal === goal ? null : goal })}
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
        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <Salad size={16} className="text-periwinkle" /> Do you have any dietary preferences?
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Choose any diets or eating styles that apply.
        </p>
        <div className="onboarding-chips">
          {DIETARY_RESTRICTIONS.map((diet) => {
            const isSelected = diet === "None"
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
        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-amber-400" /> Any food allergies or intolerances?
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Excluded automatically from recipe recommendations and meal suggestions.
        </p>
        <div className="onboarding-chips">
          {FOOD_ALLERGIES.map((allergen) => {
            const isSelected = allergen === "None"
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

  // Step 4: Favourite Cuisines
  if (step === 4) {
    return (
      <div className="onboarding-step-body">
        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <Globe size={16} className="text-periwinkle" /> Which cuisines do you love the most?
        </Label>
        <p className="text-xs text-muted-foreground mb-3">
          Pick your go-to flavours and cooking traditions.
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
        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <ChefHat size={16} className="text-periwinkle" /> What's your cooking skill level?
        </Label>
        <div className="grid gap-2 mb-5">
          {SKILL_LEVELS.map((item) => (
            <button
              type="button"
              key={item.level}
              disabled={disabled}
              className={`p-3 rounded-xl border text-left transition-all ${
                preferences.cooking_level === item.level
                  ? "border-indigo-400 bg-indigo-500/15 text-white shadow-sm"
                  : "border-border bg-card/60 text-muted-foreground hover:bg-card"
              }`}
              onClick={() => onChange({ ...preferences, cooking_level: item.level })}
            >
              <div className="font-semibold text-sm text-foreground">{item.level}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>

        <Label className="text-white font-semibold flex items-center gap-2 mb-2">
          <Clock size={16} className="text-periwinkle" /> How much time do you like to spend cooking?
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
