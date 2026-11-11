import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { RecipeImage } from "@/components/recipe-image";

const STEP_DATA = [
  {
    stepName: "Welcome",
    title: "Personalize your kitchen",
    desc: "Let's tailor MealMate to your household, taste, and cooking habits.",
    dish: "Creamy chicken alfredo",
  },
  {
    stepName: "Goals",
    title: "Set your cooking goals",
    desc: "We will adapt recipe discovery and recommendations to what you want to achieve.",
    dish: "Rainbow buddha bowl",
  },
  {
    stepName: "Diet",
    title: "Dietary preferences",
    desc: "From plant-based to gluten-free, personalize your daily recipe feed.",
    dish: "Greek chicken salad",
  },
  {
    stepName: "Allergies",
    title: "Allergies & intolerances",
    desc: "Keep your kitchen safe. We'll automatically filter out unsafe ingredients.",
    dish: "West African jollof rice",
  },
  {
    stepName: "Cuisines",
    title: "Favourite flavours",
    desc: "Explore authentic South African favourites and world-renowned classics.",
    dish: "Cape malay bobotie",
  },
  {
    stepName: "Skill & Pace",
    title: "Skill level & pace",
    desc: "We'll suggest meals that match your kitchen comfort and available time.",
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
            {onBack ? (
              <button
                type="button"
                className="onboarding-back"
                onClick={onBack}
                disabled={busy}
                aria-label="Previous step"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <MealMateLogo imageClassName="size-8 rounded-xl" className="text-white" />
            )}
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

        {/* Visual Hero Header */}
        <div className="onboarding-visual-banner" aria-hidden="true">
          <RecipeImage recipe={{ name: current.dish }} size="hero" priority />
          <div className="onboarding-visual-overlay">
            <span className="onboarding-pill">
              <Sparkles size={12} className="text-periwinkle" />
              <span>{current.stepName}</span>
            </span>
          </div>
        </div>

        <div className="onboarding-content" ref={content}>
          <div className="onboarding-text-header">
            <h1 className="onboarding-title">{current.title}</h1>
            <p className="onboarding-description">{current.desc}</p>
          </div>
          {children}
        </div>

        <footer className="onboarding-actions">{footer}</footer>
      </div>
    </main>
  );
}
