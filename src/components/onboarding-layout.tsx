import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { APP_LANGUAGES, normalizeAppLanguage, type AppLanguageCode } from "@/lib/i18n";
import { MealMateLogo } from "@/components/mealmate-logo";
import { RecipeImage } from "@/components/recipe-image";

import { ONBOARDING_EN } from "@/lib/onboarding-i18n";

const STEP_DISHES = [
  "Creamy chicken alfredo",
  "Rainbow buddha bowl",
  "Greek chicken salad",
  "West African jollof rice",
  "Cape malay bobotie",
  "Classic american apple pie",
  "Chakalaka with pap",
] as const;

type TranslatedStepMeta = {
  stepName: string;
  title: string;
  desc: string;
};

export function OnboardingLayout({
  step,
  total = 7,
  children,
  footer,
  onBack,
  onLanguageChange,
  busy = false,
}: {
  step: number;
  total?: number;
  children?: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
  onLanguageChange?: (lang: AppLanguageCode) => void;
  busy?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const content = useRef<HTMLDivElement>(null);
  const langSelectId = useId();

  const stepIndex = Math.min(Math.max(0, step), STEP_DISHES.length - 1);
  const translatedSteps = t("onboarding.steps", {
    returnObjects: true,
  }) as TranslatedStepMeta[];
  const currentMeta = (Array.isArray(translatedSteps) ? translatedSteps[stepIndex] : undefined) ??
    ONBOARDING_EN.steps[stepIndex] ??
    translatedSteps?.[0] ?? {
      stepName: "Welcome",
      title: "Personalize your kitchen",
      desc: "Let's make mealtime better. Tailor MealMate to your household, tastes, and rhythm.",
    };
  const currentDish = STEP_DISHES[stepIndex] ?? STEP_DISHES[0];
  const activeLang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
  const prevLangRef = useRef<AppLanguageCode>(activeLang);
  const prevStepRef = useRef<number>(step);
  const stepDirection = step < prevStepRef.current ? "backward" : "forward";
  const [langFadeCycle, setLangFadeCycle] = useState<"a" | "b" | null>(null);

  useEffect(() => {
    if (prevLangRef.current !== activeLang) {
      prevLangRef.current = activeLang;
      setLangFadeCycle((prev) => (prev === "a" ? "b" : "a"));
    }
  }, [activeLang]);

  useEffect(() => {
    prevStepRef.current = step;
    content.current?.scrollTo?.(0, 0);
  }, [step]);

  function handleLanguageChange(nextCode: string) {
    const next = normalizeAppLanguage(nextCode);
    void i18n.changeLanguage(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("mealmate-lang", next);
        window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: next }));
      } catch {
        // Ignore storage failures in restricted contexts.
      }
    }
    onLanguageChange?.(next);
  }

  return (
    <main className="onboarding-shell" lang={activeLang} aria-busy={busy}>
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
                  aria-label={t("onboarding.previousStep")}
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
            <span
              className="onboarding-step onboarding-lang-fade"
              data-lang-fade={langFadeCycle ?? undefined}
            >
              {t("onboarding.stepCounter", { current: step + 1, total })}
            </span>
          </div>

          <div
            className="onboarding-progress"
            role="progressbar"
            aria-label={t("onboarding.progressAria")}
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
            <div
              key={currentDish}
              className="h-full w-full motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-[1.03] motion-safe:duration-500 motion-safe:ease-out"
            >
              <RecipeImage recipe={{ name: currentDish }} size="hero" priority />
            </div>
            <div className="onboarding-visual-overlay">
              <span
                key={`pill-${step}`}
                className="onboarding-pill onboarding-lang-fade motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 motion-safe:ease-out"
                data-lang-fade={langFadeCycle ?? undefined}
              >
                <span>{currentMeta.stepName}</span>
              </span>
            </div>
          </div>

          <div
            key={step}
            className={`onboarding-content ${
              stepDirection === "backward" ? "step-in-left" : "step-in-right"
            }`}
            ref={content}
          >
            <div className="onboarding-lang-fade" data-lang-fade={langFadeCycle ?? undefined}>
              <div className="onboarding-text-header">
                <h1 className="onboarding-title">{currentMeta.title}</h1>
                <p className="onboarding-description">{currentMeta.desc}</p>
              </div>
              {children}
            </div>
          </div>
        </div>

        <footer className="onboarding-actions">
          <div className="onboarding-lang-fade w-full" data-lang-fade={langFadeCycle ?? undefined}>
            {footer}
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <label
              htmlFor={langSelectId}
              className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <Globe size={14} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{t("onboarding.languageLabel")}</span>
            </label>
            <div className="relative inline-flex shrink-0 items-center">
              <select
                id={langSelectId}
                aria-label={t("onboarding.languageLabel")}
                value={activeLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={busy}
                className="h-11 min-w-[138px] cursor-pointer appearance-none rounded-xl border border-border bg-card pl-3.5 pr-9 text-xs font-medium text-foreground transition-colors hover:border-[var(--periwinkle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {APP_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-popover text-popover-foreground"
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 text-muted-foreground"
              />
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
