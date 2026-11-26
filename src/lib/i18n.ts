import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  APP_LANGUAGES,
  ONBOARDING_EN,
  ONBOARDING_TRANSLATIONS,
  type AppLanguageCode,
} from "@/lib/onboarding-i18n";

export { APP_LANGUAGES, type AppLanguageCode };

export function normalizeAppLanguage(code?: string | null): AppLanguageCode {
  if (!code) return "en";
  const base = code.split("-")[0]?.toLowerCase() ?? "en";
  return APP_LANGUAGES.some((item) => item.code === base) ? (base as AppLanguageCode) : "en";
}

// English is the master dictionary. Every other locale falls back to English
// automatically for any missing key.
export const en = {
  common: {
    appName: "MealMate",
    loading: "Loading…",
    save: "Save",
    saved: "Saved",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    done: "Done",
    retry: "Try again",
    search: "Search",
    signIn: "Sign in",
    signOut: "Sign out",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    error: "Something went wrong",
    empty: "Nothing here yet",
    upgrade: "Upgrade",
    maybeLater: "Maybe later",
    unlock: "Unlock",
    free: "Free",
    premium: "Premium",
    copy: "Copy",
    copied: "Copied",
    share: "Share",
    settings: "Settings",
  },
  nav: {
    home: "Home",
    recipes: "Recipes",
    planner: "Planner",
    grocery: "Grocery",
    cookbook: "Cookbook",
    settings: "Settings",
  },
  home: {
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    whatsCooking: "What's cooking today?",
    trending: "Trending",
    quickActions: "Quick actions",
    aiChef: "AI Chef",
    scan: "Scan food",
    generate: "Generate recipe",
    plan: "Plan meals",
  },
  recipes: {
    title: "Recipes",
    generate: "Generate recipe",
    searchPlaceholder: "Search recipes, ingredients, cuisines…",
    minutes: "min",
    servings: "servings",
    calories: "kcal",
    ingredients: "Ingredients",
    instructions: "Instructions",
    nutrition: "Nutrition",
    save: "Save recipe",
    saved: "Saved",
  },
  planner: {
    title: "Meal Planner",
    thisWeek: "This week",
    addMeal: "Add meal",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  },
  grocery: {
    title: "Grocery list",
    add: "Add item",
    placeholder: "e.g. 2 tomatoes",
    empty: "Your list is empty",
  },
  chat: {
    title: "AI Chef",
    placeholder: "Ask anything about cooking…",
    send: "Send",
    thinking: "Cooking up an answer…",
  },
  scan: {
    title: "Scan food",
    hint: "Point your camera at any dish or ingredient",
    analyzing: "Analyzing…",
  },
  premium: {
    title: "MealMate Premium",
    tagline: "Cook without limits.",
    subtitle: "Unlimited AI chef, personalised recipes, and smarter meal plans.",
    trialCta: "View subscription plans",
    trialFinePrint: "Trial eligibility and terms are confirmed at checkout.",
    plans: { monthly: "Monthly", annual: "Annual" },
    perMonth: "/month",
    perYear: "/year",
    bestValue: "Best value · Save {{pct}}%",
    justPerMonth: "Just {{price}}/mo",
    threeDayTrial: "See available plans and terms",
    youAreMember: "You're Premium",
    benefitsTitle: "What you get",
    benefits: {
      unlimitedChat: "Unlimited AI Chef chats",
      unlimitedRecipes: "Unlimited recipe generation",
      unlimitedPlans: "Unlimited meal plans",
      unlimitedLists: "Unlimited grocery lists",
      exclusive: "Premium-exclusive recipes",
      nutrition: "Advanced nutrition insights",
      priority: "Priority AI responses",
      noAds: "No ads",
      earlyAccess: "Early access to new features",
      badge: "Premium badge on your profile",
    },
    redeem: {
      title: "Redeem promo code",
      subtitle: "Instant Premium days, months, or lifetime for eligible codes.",
      placeholder: "e.g. WELCOME2026",
      cta: "Redeem",
    },
    referral: {
      title: "Referrals",
      subtitle: "Share your code. You both get 14 free days when they subscribe.",
      applyPlaceholder: "Have a friend's code?",
      apply: "Apply",
      stats: "{{count}} invited · {{rewarded}} rewarded",
    },
    faqTitle: "Questions",
    upgradeModal: {
      title: "Unlock MealMate Premium",
      message:
        "MealMate Premium includes recipes, AI meal generation, food scanning, meal planning, grocery lists, nutrition insights, and more.",
      upgradeCta: "Upgrade to Premium",
      later: "Maybe later",
    },
    locked: "Premium feature",
  },
  settings: {
    title: "Settings",
    account: "Account",
    preferences: "Preferences",
    appearance: "Appearance",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    language: "Language",
    currency: "Currency",
    notifications: "Notifications",
    manageAccount: "Manage account",
    resetPassword: "Send password reset email",
    signOut: "Sign out",
    about: "About",
    help: "Help & support",
    privacy: "Privacy policy",
    terms: "Terms of service",
    rate: "Rate MealMate",
    share: "Share MealMate",
    admin: "Admin dashboard",
    adminDesc: "Subscribers, promos, revenue (admin only)",
    premiumEntry: "MealMate Premium",
    premiumEntryDesc: "AI, recipes and meal plans · View subscription plans",
  },
  auth: {
    welcome: "Welcome to MealMate",
    signInSubtitle: "Sign in to sync recipes, plans, and grocery lists.",
    continueGoogle: "Continue with Google",
    continueApple: "Continue with Apple",
    or: "or",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createAccount: "Create account",
    resetPassword: "Reset password",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Network error. Check your connection.",
    unauthorized: "Please sign in to continue.",
    limitReached: "Check your Premium subscription access.",
    required: "This field is required",
    invalidEmail: "Enter a valid email",
    passwordShort: "Password must be at least 6 characters",
  },
  onboarding: ONBOARDING_EN,
} as const;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    af: { translation: { onboarding: ONBOARDING_TRANSLATIONS.af } },
    zu: { translation: { onboarding: ONBOARDING_TRANSLATIONS.zu } },
    xh: { translation: { onboarding: ONBOARDING_TRANSLATIONS.xh } },
    st: { translation: { onboarding: ONBOARDING_TRANSLATIONS.st } },
    tn: { translation: { onboarding: ONBOARDING_TRANSLATIONS.tn } },
    nso: { translation: { onboarding: ONBOARDING_TRANSLATIONS.nso } },
    ve: { translation: { onboarding: ONBOARDING_TRANSLATIONS.ve } },
    ts: { translation: { onboarding: ONBOARDING_TRANSLATIONS.ts } },
    ss: { translation: { onboarding: ONBOARDING_TRANSLATIONS.ss } },
    nr: { translation: { onboarding: ONBOARDING_TRANSLATIONS.nr } },
  },
  lng: (() => {
    if (typeof window === "undefined") return "en";
    try {
      return normalizeAppLanguage(window.localStorage.getItem("mealmate-lang"));
    } catch {
      return "en";
    }
  })(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export default i18n;
