import { useEffect, useRef, useState } from "react";
import { useOptionalMia } from "@/hooks/use-mia";
import { extractStepTimerSeconds } from "@/lib/mia-companion";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";
import { useSession } from "@/hooks/use-session";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircleQuestion,
  Pause,
  Play,
  Timer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function playGentleChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.62);
  } catch {
    // Ignore audio context restrictions
  }
}

function formatTimerLabel(totalSeconds: number): string {
  if (totalSeconds >= 3600) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.round((totalSeconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (totalSeconds >= 60) {
    return `${Math.round(totalSeconds / 60)}m`;
  }
  return `${totalSeconds}s`;
}

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
  const { user } = useSession();
  const mia = useOptionalMia();
  const setRecipe = mia?.setRecipe;
  const [i, setI] = useState(0);
  const [stepDir, setStepDir] = useState<"next" | "prev">("next");
  const [seconds, setSeconds] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [miaTip, setMiaTip] = useState<string | null>(null);
  const [askingMia, setAskingMia] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    setRecipe?.(
      { name, steps: steps.slice(0, 40).map((step) => step.slice(0, 1000)), step: i },
      setI,
    );
    return () => setRecipe?.(null);
  }, [name, steps, i, setRecipe]);

  useEffect(() => {
    setMiaTip(null);
  }, [i]);

  useEffect(() => {
    if (seconds === null || paused) return;
    if (seconds <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        playGentleChime();
        mia?.reactToAction("timer_finished", { recipeName: name });
      }
      return;
    }
    finishedRef.current = false;
    const t = setInterval(() => setSeconds((s) => (s !== null ? Math.max(0, s - 1) : null)), 1000);
    return () => clearInterval(t);
  }, [seconds, paused, mia, name]);

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
  const detectedSeconds = extractStepTimerSeconds(step);
  const pct = steps.length ? ((i + 1) / steps.length) * 100 : 0;
  const hh = seconds !== null ? Math.floor(seconds / 3600) : 0;
  const mm =
    seconds !== null
      ? Math.floor((seconds % 3600) / 60)
          .toString()
          .padStart(2, "0")
      : "00";
  const ss = seconds !== null ? (seconds % 60).toString().padStart(2, "0") : "00";

  async function askAboutStep() {
    if (!mia || askingMia || !step) return;
    setAskingMia(true);
    try {
      const answer = await mia.ask(
        `I'm making ${name} and I'm on step ${i + 1}: "${step}". Give me one brief practical tip or visual cue to nail this step.`,
      );
      setMiaTip(answer);
    } catch {
      setMiaTip("Keep heat steady and watch texture and aroma rather than rushing the clock.");
    } finally {
      setAskingMia(false);
    }
  }

  return (
    <div className="motion-reveal fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Cooking Mode</p>
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

      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6 text-center">
        <p className="text-sm tabular-nums text-muted-foreground">
          Step {i + 1} of {steps.length}
        </p>
        <p
          key={i}
          className={`mt-5 max-w-2xl text-2xl leading-relaxed md:text-3xl ${
            stepDir === "next" ? "step-in-right" : "step-in-left"
          }`}
        >
          {step}
        </p>

        <div className="mt-7 flex flex-col items-center gap-3">
          {detectedSeconds !== null && (
            <Button
              type="button"
              onClick={() => {
                finishedRef.current = false;
                setPaused(false);
                setSeconds(detectedSeconds);
              }}
              className="min-h-11 rounded-xl px-5"
            >
              <Timer className="mr-2 h-4 w-4" aria-hidden="true" />
              Start {formatTimerLabel(detectedSeconds)} step timer
            </Button>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2 pr-1">
              <Timer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="font-mono text-lg tabular-nums">
                {hh > 0 ? `${String(hh).padStart(2, "0")}:` : ""}
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
                  onClick={() => {
                    finishedRef.current = false;
                    setPaused(false);
                    setSeconds(m * 60);
                  }}
                >
                  {m}m
                </Button>
              ))}
              {seconds !== null && seconds > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 px-3"
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? (
                    <>
                      <Play className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Pause
                    </>
                  )}
                </Button>
              )}
              {seconds !== null && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-11 px-3"
                  onClick={() => {
                    setSeconds(null);
                    setPaused(false);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {mia && (
            <div className="mt-2 max-w-xl">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={askingMia}
                onClick={() => void askAboutStep()}
                className="min-h-10 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                {askingMia ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <MessageCircleQuestion className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                )}
                Ask Mia for a tip on this step
              </Button>
              {miaTip && (
                <p className="mt-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm leading-relaxed text-foreground">
                  {miaTip}
                </p>
              )}
            </div>
          )}
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
              mia?.reactToAction("meal_completed", { recipeName: name });
              if (user?.id) {
                void dispatchAnalyticsEvent({
                  userId: user.id,
                  eventName: "meal_completed",
                  entityId: name.slice(0, 120),
                });
              }
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
