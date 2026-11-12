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
  Loader2,
} from "lucide-react";
import { RecipeImage } from "@/components/recipe-image";
import { completeIntro } from "@/lib/billing.functions";
import { useSession } from "@/hooks/use-session";
import { markTourSeen } from "@/lib/preferences";
import { useQueryClient } from "@tanstack/react-query";
import { MealMateLogo } from "@/components/mealmate-logo";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to MealMate" }] }),
  component: WelcomeTourPage,
});

const TOUR_SECTIONS = [
  {
    key: "welcome",
    eyebrow: "Welcome",
    title: "A quieter way to cook well.",
    description:
      "MealMate brings recipes, planning and a food companion together — from South African favourites to everything else you love.",
    icon: Sparkles,
    dish: "Creamy chicken alfredo",
    note: "Discover. Plan. Eat. Enjoy.",
  },
  {
    key: "home",
    eyebrow: "Discover",
    title: "Recipes that fit your day.",
    description:
      "A home feed shaped by your taste, with categories, favourites and a Surprise Me button for when you can't decide.",
    icon: Home,
    dish: "Rainbow buddha bowl",
    note: "Personalised discovery, every day.",
  },
  {
    key: "dining",
    eyebrow: "Dining",
    title: "Find somewhere worth eating.",
    description:
      "Browse local restaurants and their menus, with real photography, ratings and delivery details.",
    icon: Store,
    dish: "West African jollof rice",
    note: "Dining that matches the rest of MealMate.",
  },
  {
    key: "mia",
    eyebrow: "Mia",
    title: "Meet Mia, your food companion.",
    description:
      "Ask questions, get substitutions, or cook hands-free with voice guidance while your hands are busy.",
    icon: Bot,
    dish: "Chakalaka with pap",
    note: "Voice and chat, whenever you need it.",
  },
  {
    key: "pantry",
    eyebrow: "Pantry",
    title: "Cook from what you already have.",
    description:
      "Track ingredients, scan your kitchen, and turn what's on the shelf into something delicious.",
    icon: Refrigerator,
    dish: "Smoky beef tacos",
    note: "Less waste, better meals.",
  },
  {
    key: "personalization",
    eyebrow: "Preferences",
    title: "Make it feel like yours.",
    description:
      "Your dietary needs, household size and appearance live in Settings, ready to change whenever you are.",
    icon: Sliders,
    dish: "Classic american apple pie",
    note: "Everything adjustable, nothing cluttered.",
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
      await navigate({ to: "/", replace: true });
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (isLast) {
      void handleComplete();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    try {
      localStorage.setItem("mealmate.tour-step.v3", String(nextStep));
    } catch {
      /* optional */
    }
  }

  function back() {
    if (step === 0) return;
    const prevStep = step - 1;
    setStep(prevStep);
    try {
      localStorage.setItem("mealmate.tour-step.v3", String(prevStep));
    } catch {
      /* optional */
    }
  }

  return (
    <main className="onboarding-shell">
      <div className="onboarding-frame">
        <header className="onboarding-header">
          <div className="onboarding-brand-row">
            {step > 0 ? (
              <button
                type="button"
                className="onboarding-back"
                onClick={back}
                disabled={busy}
                aria-label="Previous step"
              >
                <ArrowLeft size={17} strokeWidth={1.7} />
              </button>
            ) : (
              <MealMateLogo imageClassName="size-8 rounded-lg object-contain" />
            )}
            <span className="onboarding-step">
              {step + 1} / {TOUR_SECTIONS.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Tour progress"
            aria-valuemin={1}
            aria-valuemax={TOUR_SECTIONS.length}
            aria-valuenow={step + 1}
            className="onboarding-progress"
          >
            {TOUR_SECTIONS.map((_, i) => (
              <span key={i} data-active={i <= step} />
            ))}
          </div>
        </header>

        <div className="onboarding-content" key={step}>
          <div className="onboarding-visual-banner" aria-hidden="true">
            <RecipeImage recipe={{ name: current.dish }} size="hero" priority />
            <div className="onboarding-visual-overlay">
              <span className="onboarding-pill">
                <current.icon size={11} strokeWidth={1.8} />
                {current.eyebrow}
              </span>
            </div>
          </div>

          <div className="onboarding-text-header mt-6">
            <h1 className="onboarding-title">{current.title}</h1>
            <p className="onboarding-description">{current.description}</p>
          </div>

          <p className="mm-meta">{current.note}</p>
        </div>

        <footer className="onboarding-actions">
          <button type="button" className="onboarding-primary-btn" onClick={next} disabled={busy}>
            {busy ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>{isLast ? "Get Started" : "Next"}</span>
                <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            <Link to="/legal/terms" className="underline underline-offset-2">
              Terms
            </Link>
            <span className="mx-2">·</span>
            <Link to="/legal/privacy" className="underline underline-offset-2">
              Privacy
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
