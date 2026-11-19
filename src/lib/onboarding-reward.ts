import { Compass, CalendarCheck, ChefHat, ShieldCheck, type LucideIcon } from "lucide-react";
import type { FoodPreferences } from "@/lib/preferences";

export type EarnedBadge = {
  id: string;
  name: string;
  category: string;
  description: string;
  reason: string;
  icon: LucideIcon;
};

export function computeOnboardingBadges(prefs: FoodPreferences | null): EarnedBadge[] {
  const badges: EarnedBadge[] = [];

  // Badge 1: Kitchen Explorer
  const cuisines = prefs?.favorite_foods ?? [];
  const cuisineSample = cuisines.length > 0 ? cuisines.slice(0, 2).join(" & ") : "Global Cuisine";
  badges.push({
    id: "kitchen-explorer",
    name: "Kitchen Explorer",
    category: "Culinary Discovery",
    description: "Configured personalized regional and global flavour preferences.",
    reason: `Unlocked for exploring ${cuisineSample}`,
    icon: Compass,
  });

  // Badge 2: Meal Planner Pro
  const household = prefs?.household_size ?? prefs?.meals_per_day ?? "2 people (couple)";
  const goal = prefs?.goal ?? "Eat healthier & balanced";
  badges.push({
    id: "meal-planner-pro",
    name: "Meal Planner Pro",
    category: "Routine & Strategy",
    description: "Calibrated weekly meal schedule and portion scaling.",
    reason: `Configured for ${household} · Goal: ${goal}`,
    icon: CalendarCheck,
  });

  // Badge 3: Smart Chef
  const skill = prefs?.cooking_level ?? "Beginner";
  const time = prefs?.cooking_time ?? "20 to 35 mins";
  badges.push({
    id: "smart-chef",
    name: "Smart Chef",
    category: "Kitchen Mastery",
    description: "Hands-free voice coaching and custom prep velocity active.",
    reason: `Calibrated for ${skill} level · ${time} pace`,
    icon: ChefHat,
  });

  // Badge 4: Safety Guardian
  const diets = prefs?.dietary_restrictions ?? [];
  const allergies = prefs?.allergies ?? [];
  const safetyCount = diets.length + allergies.length;
  badges.push({
    id: "safety-guardian",
    name: "Safety Guardian",
    category: "Diet & Wellness",
    description: "Automated ingredient screening for zero allergen surprises.",
    reason:
      safetyCount > 0
        ? `${safetyCount} dietary safeguards active`
        : "Full culinary safety screening activated",
    icon: ShieldCheck,
  });

  return badges;
}
