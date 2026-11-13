import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { RecipeImage } from "@/components/recipe-image";

const STEP_DATA = [
  {
    stepName: "Welcome",
    title: "Personalize your kitchen",
    desc: "Let's make mealtime better. Tailor MealMate to your household, tastes, and rhythm.",
    dish: "Creamy chicken alfredo",
  },
  {
    stepName: "Goals",
    title: "Set your cooking goals",
    desc: "Tell us what matters most so every recipe and weekly plan fits your life.",
    dish: "Rainbow buddha bowl",
  },
  {
    stepName: "Dietary preferences",
    title: "Dietary preferences",
    desc: "From plant-based to halal or keto, keep your daily recipe feed aligned with how you eat.",
    dish: "Greek chicken salad",
  },
  {
    stepName: "Allergies",
    title: "Allergies & intolerances",
    desc: "Keep your kitchen safe. MealMate filters out unsafe ingredients automatically.",
    dish: "West African jollof rice",
  },
  {
    stepName: "Flavours",
    title: "Favourite flavours",
    desc: "Choose the cuisines you crave most—from South African staples to world classics.",
    dish: "Cape malay bobotie",
  },
  {
    stepName: "Cooking style",
    title: "Skill level & pace",
    desc: "We'll recommend meals matched to your comfort in the kitchen and available time.",
    dish: "Classic american apple pie",
  },
];

export function OnboardingLayout({
  step,
  total = 6,
  children,
  footer,
  onBack,
  busy = false,
}: {
  step: number;
  total?: number;
  children?: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
  busy?: boolean;
}) {
  const content = useRef<HTMLDivElement>(null);
  const current = STEP_DATA[step] || STEP_DATA[0];

  useEffect(() => {
    content.current?.scrollTo?.(0, 0);
  }, [step]);

  return (
    <main className="onboarding-shell" aria-busy={busy}>
      <div className="onboarding-frame">
        <header className="onboarding-header">
          <div className="onboarding-brand-row">
            <div className="flex items-center gap-3">
              {onBack ? (
                <button
                  type="button"
                  className="onboarding-back"
                  onClick={onBack}
                  disabled={busy}
                  aria-label="Previous step"
                >
                  <ArrowLeft size={16} />
                </button>
              ) : (
                <MealMateLogo
                  imageClassName="size-8 rounded-xl border border-border"
                  className="text-foreground"
                  showName
                />
              )}
            </div>
            <span className="onboarding-step">
              Step {step + 1} of {total}
            </span>
          </div>

          <div
            className="onboarding-progress"
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step + 1}
          >
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} data-active={i <= step} />
            ))}
          </div>
        </header>

        <div className="onboarding-surface">
          <div className="onboarding-visual-banner" aria-hidden="true">
            <RecipeImage recipe={{ name: current.dish }} size="hero" priority />
            <div className="onboarding-visual-overlay">
              <span className="onboarding-pill">
                <Sparkles size={11} className="text-[#A5B4FC]" />
                <span>{current.stepName}</span>
              </span>
            </div>
          </div>

          <div key={step} className="onboarding-content onboarding-step-enter" ref={content}>
            <div className="onboarding-text-header">
              <h1 className="onboarding-title">{current.title}</h1>
              <p className="onboarding-description">{current.desc}</p>
            </div>
            {children}
          </div>
        </div>

        <footer className="onboarding-actions">{footer}</footer>
      </div>
    </main>
  );
}
