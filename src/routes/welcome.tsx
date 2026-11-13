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
  head: () => ({ meta: [{ title: "Welcome to MealMate — App Tour" }] }),
  component: WelcomeTourPage,
});

const TOUR_SECTIONS = [
  {
    key: "welcome",
    eyebrow: "MealMate Consumer · Taz Technologies",
    title: "Discover. Plan. Eat. Enjoy.",
    description: "Your personal companion for better meals and easier dining every day.",
    icon: Sparkles,
    dish: "Creamy chicken alfredo",
    previewTitle: "Welcome to MealMate",
    previewSubtitle: "Everything you need to discover, plan, and cook with confidence.",
  },
  {
    key: "home",
    eyebrow: "Home",
    title: "Your daily culinary feed",
    description:
      "Browse personalised recipes, explore cuisines, try Surprise Me, and pick up active cooking sessions right where you left off.",
    icon: Home,
    dish: "Rainbow buddha bowl",
    previewTitle: "Personalised Recipe Discovery",
    previewSubtitle: "Curated daily meals matched to your dietary preferences and pace.",
  },
  {
    key: "dining",
    eyebrow: "Dining",
    title: "Explore restaurants & menus",
    description:
      "Discover curated local restaurants, browse chef menus, view photography, and save standout spots for your next night out.",
    icon: Store,
    dish: "West African jollof rice",
    previewTitle: "Dining Discovery",
    previewSubtitle: "Trusted venues, vibrant menus, and seamless local exploration.",
  },
  {
    key: "mia",
    eyebrow: "Mia AI Assistant",
    title: "Cook hands-free with Mia",
    description:
      "Ask Mia for recipe ideas, ingredient substitutions, cooking timers, and voice guidance—all without touching your screen.",
    icon: Bot,
    dish: "Chakalaka with pap",
    previewTitle: "Voice & Conversational AI",
    previewSubtitle: "Real-time kitchen help in chat or hands-free Voice Mode.",
  },
  {
    key: "pantry",
    eyebrow: "Pantry & Scanning",
    title: "Cook with what you already have",
    description:
      "Manage your kitchen inventory and scan ingredients with your camera to generate tailored recipes and cut down on food waste.",
    icon: Refrigerator,
    dish: "Smoky beef tacos",
    previewTitle: "Smart Pantry & Camera Scan",
    previewSubtitle: "Turn ingredients on hand into balanced meals in seconds.",
  },
  {
    key: "settings",
    eyebrow: "Settings & Personalisation",
    title: "Built around your preferences",
    description:
      "Adjust Light or Dark appearance, update allergies and dietary goals, manage your subscription, and tune Mia's voice anytime in Settings.",
    icon: Sliders,
    dish: "Classic american apple pie",
    previewTitle: "Full Account Control",
    previewSubtitle: "Dietary filters, appearance, units, and notifications in one place.",
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
            <span className="tour-brand-name">MealMate</span>
          )}

          <div className="flex items-center gap-3">
            <span className="tour-step-counter">
              {step + 1} / {TOUR_SECTIONS.length}
            </span>
            {!isLast && (
              <button
                type="button"
                className="tour-skip-btn"
                onClick={() => void handleComplete()}
                disabled={busy}
              >
                Skip
              </button>
            )}
          </div>
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
            <Icon size={14} className="text-[#A5B4FC]" aria-hidden="true" />
            <span>{current.previewTitle}</span>
          </div>
        </div>

        <div className="tour-copy-body">
          <p className="tour-eyebrow">{current.eyebrow}</p>
          <h1 className="tour-heading">{current.title}</h1>
          <p className="tour-description">{current.description}</p>

          <div className="tour-ui-highlight">
            <CheckCircle2 size={16} className="shrink-0 text-[var(--periwinkle)]" />
            <span className="text-xs font-medium text-foreground">{current.previewSubtitle}</span>
          </div>
        </div>
      </section>

      <footer className="tour-footer">
        <button type="button" className="tour-primary-btn" onClick={next} disabled={busy}>
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <span>{isLast ? "Get Started" : "Next"}</span>
              <ArrowRight size={17} aria-hidden="true" />
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
