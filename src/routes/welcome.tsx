import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Home,
  Store,
  Bot,
  Refrigerator,
  Sliders,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { RecipeImage } from "@/components/recipe-image";
import { completeIntro } from "@/lib/billing.functions";
import { useSession } from "@/hooks/use-session";
import { markTourSeen } from "@/lib/preferences";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "App Introduction Tour — MealMate" }] }),
  component: WelcomeTourPage,
});

const TOUR_SECTIONS = [
  {
    key: "welcome",
    eyebrow: "App Introduction",
    title: "Welcome to MealMate",
    description:
      "Your intelligent culinary companion. From authentic South African favourites to global cuisine, we help you discover recipes, plan meals, and shop effortlessly.",
    icon: Sparkles,
    dish: "Creamy chicken alfredo",
    previewTitle: "Intelligence in the Kitchen",
    previewSubtitle: "Your personalized cooking ecosystem is active.",
  },
  {
    key: "home",
    eyebrow: "Discovery",
    title: "Home & Recipe Inspiration",
    description:
      "Discover recipes tailored to your taste, explore culinary categories, try the AI Surprise Me generator, and resume your active cooking sessions anytime.",
    icon: Home,
    dish: "Rainbow buddha bowl",
    previewTitle: "Personalized Daily Feed",
    previewSubtitle: "Explore breakfast, dinner, South African favourites & more.",
  },
  {
    key: "dining",
    eyebrow: "Dining Out",
    title: "Dining & Restaurants",
    description:
      "Explore curated partner restaurants, discover chef menus, order food, and view high-resolution food photography from the best local spots.",
    icon: Store,
    dish: "West African jollof rice",
    previewTitle: "Partner Restaurants & Menus",
    previewSubtitle: "Find exceptional dishes and verified food venues.",
  },
  {
    key: "mia",
    eyebrow: "AI Chef",
    title: "Meet Mia, Your AI Cooking Assistant",
    description:
      "Hands-free kitchen companion. Ask Mia for substitution advice, step-by-step guidance, and cooking timers using your voice or interactive chat.",
    icon: Bot,
    dish: "Chakalaka with pap",
    previewTitle: "Hands-Free Voice & Chat",
    previewSubtitle: "Ask Mia anything while your hands are busy cooking.",
  },
  {
    key: "pantry",
    eyebrow: "Smart Kitchen",
    title: "Pantry & Fridge Management",
    description:
      "Keep track of ingredients in your pantry. Use your camera or input items to discover delicious recipes made with what you already have on hand.",
    icon: Refrigerator,
    dish: "Smoky beef tacos",
    previewTitle: "Zero Food Waste",
    previewSubtitle: "Generate gourmet recipes from items in your fridge.",
  },
  {
    key: "personalization",
    eyebrow: "Preferences",
    title: "Personalization & Settings",
    description:
      "Your preferences live in your Profile. Update allergens, dietary guidelines, preferred serving sizes, and themes anytime you need.",
    icon: Sliders,
    dish: "Classic american apple pie",
    previewTitle: "Tailored to Your Household",
    previewSubtitle: "Manage your preferences, meal reminders, and account.",
  },
];

function WelcomeTourPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("mealmate.tour-step.v3"));
      if (Number.isInteger(saved) && saved >= 0 && saved < TOUR_SECTIONS.length) {
        setStep(saved);
      }
    } catch {
      /* optional */
    }
  }, []);

  const current = TOUR_SECTIONS[step]!;
  const Icon = current.icon;
  const isLast = step === TOUR_SECTIONS.length - 1;

  async function handleComplete() {
    if (busy) return;
    setBusy(true);

    try {
      markTourSeen();
      if (user) {
        await completeIntro();
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
        await queryClient.invalidateQueries({ queryKey: ["intro-completion", user.id] });
      }

      try {
        localStorage.removeItem("mealmate.tour-step.v3");
      } catch {
        /* optional */
      }

      await navigate({ to: "/", replace: true });
    } catch (error) {
      console.error("[Tour] completion error:", error);
      // Fallback navigation
      await navigate({ to: "/", replace: true });
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (isLast) {
      void handleComplete();
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      try {
        localStorage.setItem("mealmate.tour-step.v3", String(nextStep));
      } catch {
        /* optional */
      }
    }
  }

  function back() {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      try {
        localStorage.setItem("mealmate.tour-step.v3", String(prevStep));
      } catch {
        /* optional */
      }
    }
  }

  return (
    <main className="premium-flow app-tour-shell">
      <header className="tour-header">
        <div className="tour-header-row">
          {step > 0 ? (
            <button
              type="button"
              className="tour-back-btn"
              onClick={back}
              disabled={busy}
              aria-label="Previous tour step"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <span className="tour-brand-name">
              MealMate<span className="text-periwinkle">.</span>
            </span>
          )}
          <span className="tour-step-counter">
            {step + 1} / {TOUR_SECTIONS.length}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="App tour progress"
          aria-valuemin={1}
          aria-valuemax={TOUR_SECTIONS.length}
          aria-valuenow={step + 1}
          className="tour-progressbar"
        >
          {TOUR_SECTIONS.map((_, i) => (
            <span key={i} className={i <= step ? "complete" : ""} />
          ))}
        </div>
      </header>

      <section key={step} className="tour-step-card">
        <div className="tour-photo-wrapper">
          <RecipeImage recipe={{ name: current.dish }} size="hero" priority />
          <div className="tour-photo-badge">
            <Icon size={14} className="text-periwinkle" aria-hidden="true" />
            <span>{current.previewTitle}</span>
          </div>
        </div>

        <div className="tour-copy-body">
          <p className="tour-eyebrow">{current.eyebrow}</p>
          <h1 className="tour-heading">{current.title}</h1>
          <p className="tour-description">{current.description}</p>

          <div className="tour-ui-highlight">
            <CheckCircle2 size={16} className="text-periwinkle shrink-0" />
            <span className="text-xs text-muted-foreground">{current.previewSubtitle}</span>
          </div>
        </div>
      </section>

      <footer className="tour-footer">
        <button
          type="button"
          className="tour-primary-btn"
          onClick={next}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span>{isLast ? "Get Started" : "Next"}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <p className="tour-legal">
          <Link to="/legal/terms">Terms</Link>
          <span>·</span>
          <Link to="/legal/privacy">Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
