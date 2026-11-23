import { useEffect, useState } from "react";
import { useOptionalMia } from "@/hooks/use-mia";
import { ChevronLeft, ChevronRight, X, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookingMode({
  name,
  steps,
  onClose,
  onComplete,
}: {
  name: string;
  steps: string[];
  onClose: () => void;
  onComplete?: () => void;
}) {
  const mia = useOptionalMia();
  const setRecipe = mia?.setRecipe;
  const [i, setI] = useState(0);
  const [stepDir, setStepDir] = useState<"next" | "prev">("next");
  useEffect(() => {
    setRecipe?.(
      { name, steps: steps.slice(0, 40).map((step) => step.slice(0, 1000)), step: i },
      setI,
    );
    return () => setRecipe?.(null);
  }, [name, steps, i, setRecipe]);
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (seconds === null) return;
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s !== null ? Math.max(0, s - 1) : null)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setStepDir("next");
        setI((v) => Math.min(steps.length - 1, v + 1));
      }
      if (e.key === "ArrowLeft") {
        setStepDir("prev");
        setI((v) => Math.max(0, v - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length, onClose]);

  const step = steps[i] ?? "";
  const pct = steps.length ? ((i + 1) / steps.length) * 100 : 0;
  const mm =
    seconds !== null
      ? Math.floor(seconds / 60)
          .toString()
          .padStart(2, "0")
      : "00";
  const ss = seconds !== null ? (seconds % 60).toString().padStart(2, "0") : "00";

  return (
    <div className="motion-reveal fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Cooking</p>
          <h2 className="truncate font-display text-lg">{name}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close cooking mode"
          className="h-11 w-11 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="h-1.5 w-full bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm tabular-nums text-muted-foreground">
          Step {i + 1} of {steps.length}
        </p>
        <p
          key={i}
          className={`mt-6 max-w-2xl text-2xl leading-relaxed md:text-3xl ${
            stepDir === "next" ? "step-in-right" : "step-in-left"
          }`}
        >
          {step}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg tabular-nums">
              {mm}:{ss}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[1, 3, 5, 10, 15].map((m) => (
              <Button
                key={m}
                size="sm"
                variant="outline"
                className="min-h-11 min-w-11 px-3 tabular-nums"
                onClick={() => setSeconds(m * 60)}
              >
                {m}m
              </Button>
            ))}
            {seconds !== null && (
              <Button
                size="sm"
                variant="ghost"
                className="min-h-11 px-3"
                onClick={() => setSeconds(null)}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          variant="outline"
          className="min-h-11 px-5"
          onClick={() => {
            setStepDir("prev");
            setI((v) => Math.max(0, v - 1));
          }}
          disabled={i === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {i < steps.length - 1 ? (
          <Button
            className="min-h-11 px-5"
            onClick={() => {
              setStepDir("next");
              setI((v) => Math.min(steps.length - 1, v + 1));
            }}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="min-h-11 px-5"
            onClick={() => {
              onComplete?.();
              onClose();
            }}
          >
            Done
          </Button>
        )}
      </footer>
    </div>
  );
}
