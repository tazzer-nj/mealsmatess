export const IDENTITY_HABITS = [
  "I'm becoming more organised with my meals.",
  "I enjoy discovering new recipes.",
  "I plan my meals ahead.",
  "I am learning to cook.",
] as const;

export type IdentityHabit = (typeof IDENTITY_HABITS)[number];

export type EndowedProgressStep = {
  id: string;
  label: string;
  completed: boolean;
  actionTo: string;
};

export type EndowedProgressResult = {
  completed: number;
  total: number;
  percentage: number;
  steps: EndowedProgressStep[];
};

export function computeEndowedProgress(input: {
  onboardingCompleted: boolean;
  savedRecipesCount: number;
  plannedMealsCount: number;
  completedMealsCount: number;
  pantryItemsCount: number;
}): EndowedProgressResult {
  const steps: EndowedProgressStep[] = [
    {
      id: "onboarding",
      label: "Set your tastes & dietary profile",
      completed: Boolean(input.onboardingCompleted),
      actionTo: "/settings",
    },
    {
      id: "first_recipe",
      label: "Save your first recipe",
      completed: input.savedRecipesCount > 0,
      actionTo: "/recipes",
    },
    {
      id: "first_plan",
      label: "Schedule a meal on your weekly plan",
      completed: input.plannedMealsCount > 0,
      actionTo: "/planner",
    },
    {
      id: "first_cook",
      label: "Complete your first cooking session",
      completed: input.completedMealsCount > 0,
      actionTo: "/recipes",
    },
    {
      id: "stock_pantry",
      label: "Add an ingredient to your pantry",
      completed: input.pantryItemsCount > 0,
      actionTo: "/pantry",
    },
  ];

  const completed = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage, steps };
}

export type RecipeCollection = {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  recipe_ids: string[];
  created_at: string;
  updated_at: string;
};

export type WeeklyGoalState = {
  id: string;
  week_key: string;
  user_id: string;
  target_meals: number;
  completed_meals: number;
  identity_habit?: string | null;
  updated_at: string;
};

export function getCurrentWeekKey(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export type WeeklyCookingChallenge = {
  id: string;
  title: string;
  description: string;
  categoryFilter?: string;
  maxTimeMinutes?: number;
  targetMeals: number;
};

export const WEEKLY_COOKING_CHALLENGES: WeeklyCookingChallenge[] = [
  {
    id: "challenge-25-min-weeknights",
    title: "25-Minute Weeknight Hero",
    description: "Cook 3 quick meals under 25 minutes this week to save time after work.",
    categoryFilter: "Quick",
    maxTimeMinutes: 25,
    targetMeals: 3,
  },
  {
    id: "challenge-sa-classics",
    title: "Local Flavour Week",
    description: "Try a South African favourite and save your top recipe rating.",
    categoryFilter: "South African",
    targetMeals: 2,
  },
  {
    id: "challenge-pantry-rescue",
    title: "Zero-Waste Pantry Rescue",
    description: "Cook 2 meals using ingredients already stocked in your pantry.",
    targetMeals: 2,
  },
  {
    id: "challenge-fresh-prep",
    title: "Ahead-of-Schedule Planner",
    description: "Plan 5 meals for the week and tick off at least 3 home-cooked dishes.",
    targetMeals: 3,
  },
];

export function getActiveWeeklyChallenge(d: Date = new Date()): WeeklyCookingChallenge {
  const key = getCurrentWeekKey(d);
  const weekNum = Number(key.split("-W")[1] ?? "1") || 1;
  return WEEKLY_COOKING_CHALLENGES[weekNum % WEEKLY_COOKING_CHALLENGES.length]!;
}

export const STATUS_ACHIEVEMENT_DEFS = [
  {
    code: "kitchen_explorer",
    title: "Kitchen Explorer",
    description: "Explore recipes across cuisines and ingredients",
  },
  {
    code: "recipe_collector",
    title: "Recipe Collector",
    description: "Save recipes or create your own cookbook collection",
  },
  {
    code: "plan_1",
    title: "Meal Planner",
    description: "Build a personalised weekly meal plan",
  },
  {
    code: "cook_5",
    title: "Cooking Enthusiast",
    description: "Complete 5 cooking sessions with MealMate",
  },
  {
    code: "cook_10",
    title: "Consistent Cook",
    description: "Complete 10 home-cooked meals",
  },
] as const;
