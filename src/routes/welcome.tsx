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
  Check,
  Loader2,
} from "lucide-react";
import { RecipeImage } from "@/components/recipe-image";
import { completeIntro } from "@/lib/billing.functions";
import { useSession } from "@/hooks/use-session";
import { markTourSeen } from "@/lib/preferences";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome to MealMate" }] }),
  component: WelcomeTourPage,
});

const TOUR_SECTIONS = [
  {
    key: "welcome",
    eyebrow: "Welcome",
    title: "Discover. Plan. Eat. Enjoy.",
    description:
      "Your personal companion for better meals and easier dining. From South African favourites to global cuisine, everything starts here.",
    icon: Sparkles,
    dish: "Creamy chicken alfredo",
    previewTitle: "A kitchen that knows you",
    previewSubtitle: "Personalised recipes from the first day.",
  },
  {
    key: "home",
    eyebrow: "Discovery",
    title: "Find something worth cooking",
    description:
      "Browse recipes that match your taste, explore categories, and let Surprise Me choose when you can't decide.",
    icon: Home,
    dish: "Rainbow buddha bowl",
    previewTitle: "Daily inspiration",
    previewSubtitle: "Breakfast, dinner and South African classics.",
  },
  {
    key: "dining",
    eyebrow: "Dining",
    title: "Eat out, beautifully",
    description:
      "Explore partner restaurants, browse their menus and find your next table without leaving MealMate.",
    icon: Store,
    dish: "West African jollof rice",
    previewTitle: "Restaurants and menus",
    previewSubtitle: "Curated places, honest details.",
  },
  {
    key: "mia",
    eyebrow: "Mia",
    title: "Meet Mia, your food companion",
    description:
      "Ask for substitutions, plan a week of dinners, or cook hands-free with a voice conversation while your hands are busy.",
    icon: Bot,
    dish: "Chakalaka with pap",
    previewTitle: "Chat and voice",
    previewSubtitle: "Talk it through, then start cooking.",
  },
  {
    key: "pantry",
    eyebrow: "Pantry",
    title: "Cook with what you have",
    description:
      "Keep track of your ingredients, scan your kitchen with the camera, and turn what's left into dinner.",
    icon: Refrigerator,
    dish: "Smoky beef tacos",
    previewTitle: "Less waste, better meals",
    previewSubtitle: "Recipes from your own ingredients.",
  },
  {
    key: "personalization",
    eyebrow: "Preferences",
    title: "Made to fit your household",
    description:
      "Set your dietary needs, allergies and serving sizes once — MealMate remembers for every recipe and every conversation.",
    icon: Sliders,
    dish: "Classic american apple pie",
    previewTitle: "Your settings, respected",
    previewSubtitle: "Change them any time in Settings.",
  },
];

const STEP_KEY = "mealmate.tour-step.v3";

function WelcomeTourPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STEP_KEY));
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

  function persist(nextStep: number) {
    try {
      localStorage.setItem(STEP_KEY, String(nextStep));
    } catch {
      /* optional */
    }
  }

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
        localStorage.removeItem(STEP_KEY);
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
    persist(nextStep);
  }

  function back() {
    if (step === 0) return;
    const prevStep = step - 1;
    setStep(prevStep);
    persist(prevStep);
  }

  return (
    <main className="premium-flow">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={busy}
              aria-label="Previous step"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white disabled:opacity-40"
            >
              <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          ) : (
            <span className="text-[13px] font-medium text-[#A1A1AA]">
              MealMate<span className="text-white">.</span>
            </span>
          )}
          <span className="text-[11.5px] tabular-nums text-[#71717A]">
            {step + 1} / {TOUR_SECTIONS.length}
          </span>
        </header>

        <div
          role="progressbar"
          aria-label="Introduction progress"
          aria-valuemin={1}
          aria-valuemax={TOUR_SECTIONS.length}
          aria-valuenow={step + 1}
          className="mt-4 flex gap-1.5"
        >
          {TOUR_SECTIONS.map((s, i) => (
            <span
              key={s.key}
              className={
                "h-[3px] flex-1 rounded-full transition-colors duration-200 " +
                (i <= step ? "bg-white" : "bg-[#262626]")
              }
            />
          ))}
        </div>

        <section key={step} className="mm-fade-in mt-6 flex-1">
          <div className="overflow-hidden rounded-[20px] border border-[#1E1E1E]">
            <div className="relative aspect-[16/11] w-full">
              <RecipeImage recipe={{ name: current.dish }} size="hero" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {current.previewTitle}
              </span>
            </div>
          </div>

          <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
            {current.eyebrow}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-white">
            {current.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#A1A1AA]">{current.description}</p>

          <p className="mt-5 flex items-center gap-2 text-[12.5px] text-[#71717A]">
            <Check className="h-4 w-4 shrink-0 text-white" strokeWidth={2} aria-hidden />
            {current.previewSubtitle}
          </p>
        </section>

        <footer className="mt-8">
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="mm-btn mm-btn-primary mm-btn-block"
          >
            {busy ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <>
                <span>{isLast ? "Start cooking" : "Continue"}</span>
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
              </>
            )}
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={busy}
              className="mx-auto mt-3 block text-[12.5px] text-[#71717A] transition-colors hover:text-white"
            >
              Skip introduction
            </button>
          )}

          <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#52525B]">
            <Link to="/legal/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <span>·</span>
            <Link to="/legal/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
