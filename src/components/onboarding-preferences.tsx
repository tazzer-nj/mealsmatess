import { useTranslation } from "react-i18next";
import type { FoodPreferences } from "@/lib/preferences";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Target,
  Salad,
  AlertTriangle,
  Globe,
  ChefHat,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
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

const HOUSEHOLD_OPTIONS = [
  "1 person (solo)",
  "2 people (couple)",
  "3 to 4 people (family)",
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

const COOKING_TIMES = ["Under 20 mins", "20 to 35 mins", "35 to 50 mins", "Weekend slow cooking"];

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

        {/* Dynamic Household Benefit & Community Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              48,200+ cooks active
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {householdSize.includes("1 person")
              ? "Solo Cooking Advantage: Single-portion scaling saves ~R1,200/mo on excess groceries and reduces cleanup to one pan."
              : householdSize.includes("2 people")
                ? "Couple Advantage: Ends the nightly 'What should we eat?' debate in under 60 seconds with shared taste matching."
                : householdSize.includes("3 to 4")
                  ? "Family Advantage: Families save an average of 5.5 hours weekly and R2,400 monthly on family grocery hauls."
                  : "Large Feast Advantage: Automated bulk ingredient scaling and batch prep guides eliminate cooking stress."}
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>84% of members cut grocery waste in their very first week</span>
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

        {/* Dynamic Goal Benefit & Community Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              84% reach primary goal
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {preferences.goal === "Eat healthier & balanced"
              ? "Nutritional Advantage: 89% of members hit balanced macros in 2 weeks with wholesome vegetable-rich recipes."
              : preferences.goal === "Discover new recipes"
                ? "Culinary Advantage: Access 1,200+ authentic chef-curated meals with personalized flavor pairing."
                : preferences.goal === "Save time"
                  ? "Time Advantage: Save ~5.2 hours every week with 15-minute express meals and fast prep steps."
                  : preferences.goal === "Save money"
                    ? "Financial Advantage: Average monthly savings of R1,850 ($120) by minimizing food waste and takeout."
                    : preferences.goal === "Plan weekly meals"
                      ? "Planning Advantage: 1-click weekly schedules with synced grocery lists sorted by supermarket aisle."
                      : preferences.goal === "Reduce food waste"
                        ? "Pantry Advantage: 94% of perishable items used before expiring with smart fridge scanning."
                        : preferences.goal === "High protein & fitness"
                          ? "Fitness Advantage: Protein-forward recipes designed to hit workout recovery and muscle targets."
                          : preferences.goal === "Family-friendly cooking"
                            ? "Family Advantage: Tested wholesome recipes loved by both adults and picky young eaters."
                            : "Choose your primary mealtime goal above to calibrate your custom kitchen strategy."}
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <CheckCircle2 size={12} className="text-primary" />
            <span>Members cook 4x more diverse meals in their first month</span>
          </div>
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

        {/* Step 2 Benefit & Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              35,000+ verified recipes
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dietary Advantage: 100% verified dietary compatibility. Mia automatically screens, tags,
            and adapts dishes so you never accidentally prepare incompatible ingredients.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>Over 18,000 plant-based and special-diet cooks served daily</span>
          </div>
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

        {/* Step 3 Benefit & Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Zero-Allergen AI Guard
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Safety Advantage: Over 22,000 safe kitchen sessions logged. Mia screens every single
            recipe, dining menu, and ingredient swap to prevent accidental cross-contamination.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <CheckCircle2 size={12} className="text-primary" />
            <span>Automatic substitution alerts for all common household allergens</span>
          </div>
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

        {/* Step 4 Benefit & Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              1,200+ authentic dishes
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Flavour Advantage: 96% of members discover at least 3 new go-to meals within their first
            7 days. Your culinary engine calibrates regional seasoning and spice depth to your
            personal taste.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>Rated 4.8★ across South African and international cuisines</span>
          </div>
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

        {/* Step 5 Benefit & Stats */}
        <div className="mt-6 rounded-xl border border-border/80 bg-secondary/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles size={14} className="text-[var(--periwinkle)]" />
              What you'll benefit
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              94% feel more confident
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Confidence Advantage: Hands-free voice coaching talks you through timing, heat, and prep
            step-by-step so you never overcook or stress over dinner.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <CheckCircle2 size={12} className="text-primary" />
            <span>Earn your Onboarding Reward Card and badges right after completion!</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function FAVOURITE_CUISINS_OPTIONS(custom: string[]) {
  return Array.from(new Set([...FAVOURITE_CUISINES, ...custom]));
}
