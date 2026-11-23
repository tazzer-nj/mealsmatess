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
  CheckCircle2,
  Compass,
  CalendarDays,
  HeartPulse,
  Bot,
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

const DISCOVERY_SOURCES = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Friend or family",
  "Google search",
  "App Store / Google Play",
  "Local restaurant",
  "Other",
];

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

        <div className="mt-6 space-y-2 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-[var(--periwinkle)]" />
            <span>How MealMate adapts to your table</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {householdSize.includes("1 person")
              ? "Solo Portions: Recipe quantities and weekly grocery lists scale down automatically so ingredients get used up before they spoil."
              : householdSize.includes("2 people")
                ? "Two-Plate Planning: Balanced weeknight recipes and shared grocery lists remove daily decision fatigue."
                : householdSize.includes("3 to 4")
                  ? "Family Workflow: Weekly Meal Planner turns multi-serving recipes into one aisle-sorted shopping list."
                  : "Batch & Feast Prep: Ingredient amounts scale effortlessly for gatherings and batch-cooked lunches."}
          </p>
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

        <div className="mt-6 space-y-2.5 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-[var(--periwinkle)]" />
            <span>Tailored to your goal</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {preferences.goal === "Eat healthier & balanced"
              ? "Eat Better: Every recipe displays clear calories and macros, and the Nutrition Coach tracks your daily balance against your goals."
              : preferences.goal === "Discover new recipes"
                ? "Recipe Discovery: Home surfaces trending and local dishes tailored to your palate, plus AI Chef Mia invents meals around what you crave."
                : preferences.goal === "Save time"
                  ? "Save Time: Filter straight to fast weeknight prep, jump into hands-free Voice Cooking Mode, and auto-generate your grocery list."
                  : preferences.goal === "Save money"
                    ? "Save Money: Scan pantry staples with your camera to cook what you already own before buying extra groceries."
                    : preferences.goal === "Plan weekly meals"
                      ? "Meal Planning: Build your weekly calendar in minutes and convert every planned meal into an aisle-sorted shopping list."
                      : preferences.goal === "Reduce food waste"
                        ? "Zero-Waste Kitchen: Smart Pantry prioritizes expiring ingredients in your recipe suggestions automatically."
                        : preferences.goal === "High protein & fitness"
                          ? "High-Protein Focus: High-protein picks appear first in your feed with clear protein and macro analytics per serving."
                          : preferences.goal === "Family-friendly cooking"
                            ? "Household Ready: Crowd-pleasing recipes scaled cleanly for everyone around your table."
                            : "Select a goal above and MealMate aligns your Home feed, Planner, Nutrition Coach, and AI Chef recommendations."}
          </p>
          <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} className="shrink-0 text-primary" />
              Weekly Planner
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HeartPulse size={12} className="shrink-0 text-primary" />
              Macro Analytics
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot size={12} className="shrink-0 text-primary" />
              Mia AI Chef
            </span>
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
              className="min-h-11 shrink-0 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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

        <div className="mt-6 space-y-2 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-[var(--periwinkle)]" />
            <span>Consistent across every kitchen view</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your dietary choices guide Home discovery, AI Chef Mia generations, and smart ingredient
            substitutions so every suggestion fits how you eat.
          </p>
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
              className="min-h-11 shrink-0 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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

        <div className="mt-6 space-y-2 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CheckCircle2 size={14} className="text-primary" />
            <span>Built-in ingredient guardrails</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Selected allergens are excluded from personalized feeds and flagged in Mia&apos;s AI
            recipe builder, with safe swaps available whenever a dish calls for a substitution.
          </p>
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

        <div className="mt-6 space-y-2 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-[var(--periwinkle)]" />
            <span>Smart flavour ranking</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your favourite cuisines prioritize matching recipes at the top of Home and shape
            &ldquo;Surprise Me&rdquo; ideas without locking you out of discovering new dishes.
          </p>
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
                className={`min-h-[84px] rounded-xl border p-4 text-left transition-all ${
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

        <div className="mt-6 space-y-2 rounded-xl border border-border/80 bg-secondary/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles size={14} className="text-[var(--periwinkle)]" />
            <span>Step-by-step Cooking Mode &amp; timers</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cook hands-free with built-in step timers, ingredient checkoffs, and Mia&apos;s voice
            guidance calibrated to your skill comfort and busy schedule.
          </p>
        </div>
      </div>
    );
  }

  // Step 6: How did you discover MealMate? + Personal Kitchen Blueprint
  if (step === 6) {
    const firstName = preferredName.trim() || "your kitchen";
    return (
      <div className="onboarding-step-body">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <Label className="flex items-center gap-2 text-[13px] font-medium text-foreground">
              <Compass size={15} className="text-[var(--periwinkle)]" />{" "}
              {t("onboarding.fields.discoveryLabel", "Where did you hear about MealMate?")}
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "onboarding.fields.discoveryHint",
                "Your answer helps us improve MealMate for home cooks everywhere.",
              )}
            </p>
          </div>
          {onSkipStep && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange({ ...preferences, discovery_source: null });
                onSkipStep();
              }}
              className="min-h-11 shrink-0 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t("onboarding.skipIfNone", "Skip")}
            </button>
          )}
        </div>

        <div className="onboarding-chips">
          {DISCOVERY_SOURCES.map((source) => (
            <button
              type="button"
              key={source}
              disabled={disabled}
              aria-pressed={preferences.discovery_source === source}
              onClick={() =>
                onChange({
                  ...preferences,
                  discovery_source: preferences.discovery_source === source ? null : source,
                })
              }
            >
              {translateOption("discoverySources", source)}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border/80 bg-secondary/40 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CheckCircle2 size={14} className="text-primary" />
            <span>Ready for {firstName}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-[11px] text-muted-foreground">Primary goal</dt>
              <dd className="font-medium text-foreground">
                {preferences.goal ?? "Balanced discovery"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Serving pace</dt>
              <dd className="font-medium text-foreground">
                {preferences.cooking_time ?? householdSize}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Dietary &amp; filters</dt>
              <dd className="font-medium text-foreground">
                {[...preferences.dietary_restrictions, ...preferences.allergies].length > 0
                  ? [...preferences.dietary_restrictions, ...preferences.allergies]
                      .slice(0, 3)
                      .join(", ")
                  : "No restrictions"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Personal analytics</dt>
              <dd className="font-medium text-foreground">Nutrition Coach + Pantry sync</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return null;
}

function FAVOURITE_CUISINS_OPTIONS(custom: string[]) {
  return Array.from(new Set([...FAVOURITE_CUISINES, ...custom]));
}
