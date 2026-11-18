import { useEffect, useRef, useState } from "react";
import { Sparkles, Lightbulb, RefreshCw, Crown } from "lucide-react";
import { ChefMascot } from "@/components/chef-mascot";
import { MealMateLogo } from "@/components/mealmate-logo";

const AUTH_MIA_FACTS = [
  {
    title: "Cape Malay Bobotie's golden secret",
    body: "Soaking bread in milk before folding into spiced mince keeps every slice tender while the bay leaf egg custard bakes to a golden finish.",
    tag: "Culinary Secret",
  },
  {
    title: "The 10-minute pancake rest",
    body: "Letting batter rest for 10 minutes lets starch granules absorb liquid, yielding twice as much rise and an ultra-fluffy center.",
    tag: "Kitchen Science",
  },
  {
    title: "Why Rooibos stays silky smooth",
    body: "Indigenous to the Cederberg mountains, rooibos has no tannins or caffeine, so it never turns bitter no matter how long it steeps.",
    tag: "South African Heritage",
  },
  {
    title: "Save ~R1,800/mo by cooking smart",
    body: "Scanning fridge items and cooking expiring ingredients first cuts domestic food waste by up to 34% every single month.",
    tag: "Smart Kitchen",
  },
  {
    title: "Sear like a five-star chef",
    body: "Patting steaks and veggies bone-dry before they hit hot olive oil prevents steam pockets, producing that deep, crunchy crust instantly.",
    tag: "Chef Technique",
  },
] as const;

type MiaMotionState = "dancing" | "thinking" | "popped";

export function AuthMiaStage() {
  const [motion, setMotion] = useState<MiaMotionState>("dancing");
  const [factIndex, setFactIndex] = useState(0);
  const [hopKey, setHopKey] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentFact = AUTH_MIA_FACTS[factIndex] ?? AUTH_MIA_FACTS[0];

  function triggerSequence(nextIndex?: number) {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setHopKey((k) => k + 1);
    setMotion("dancing");

    // 1. Dance / Hop for 1.2s
    autoTimerRef.current = setTimeout(() => {
      setMotion("thinking");

      // 2. Think for 1.1s with little thought bubbles rising
      autoTimerRef.current = setTimeout(() => {
        setMotion("popped");
        if (typeof nextIndex === "number") {
          setFactIndex(nextIndex);
        } else {
          setFactIndex((prev) => (prev + 1) % AUTH_MIA_FACTS.length);
        }

        // 3. Keep popped for 6.5s then restart sequence
        autoTimerRef.current = setTimeout(() => {
          triggerSequence();
        }, 6500);
      }, 1100);
    }, 1200);
  }

  useEffect(() => {
    // Initial start with gentle delay
    autoTimerRef.current = setTimeout(() => {
      triggerSequence(0);
    }, 800);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  function handleUserTap() {
    triggerSequence();
  }

  return (
    <section className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-[#0b0f19] p-4 lg:col-span-6 lg:border-b-0 lg:border-r lg:p-10">
      {/* Scenic radial glow backdrops */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-background/10 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-[var(--periwinkle)]/15 blur-3xl"
      />

      {/* Top Brand & Trial Strip */}
      <div className="relative z-10 flex items-center justify-between">
        <MealMateLogo
          className="text-white"
          imageClassName="size-8 rounded-xl border border-white/15"
          showName
        />
        <span className="text-[10px] font-medium tracking-wider text-white/75 uppercase">
          Taz Technologies
        </span>
      </div>

      {/* Main Animated Stage: Mia Dancing / Thinking + Thought Bubble */}
      <div className="relative z-10 my-2 flex flex-col items-center justify-center py-2">
        {/* Thought Bubble / Fun Fact Callout */}
        <div className="relative mb-2 flex min-h-[110px] w-full max-w-[320px] flex-col items-center justify-end sm:min-h-[140px]">
          {motion === "thinking" && (
            <div
              className="flex flex-col items-center gap-1 transition-opacity duration-300"
              aria-label="Mia is thinking of a cooking tip"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-md animate-pulse">
                <Lightbulb className="size-3 text-amber-300 animate-spin" />
                <span>Mia is thinking...</span>
              </div>
              {/* Rising mini thought dots */}
              <div className="flex flex-col items-center gap-0.5 pt-0.5">
                <span className="size-1.5 rounded-full bg-white/70 animate-bounce" />
                <span className="size-1 rounded-full bg-white/40" />
              </div>
            </div>
          )}

          {motion === "popped" && (
            <div
              onClick={handleUserTap}
              className="group relative w-full cursor-pointer rounded-xl border border-white/20 bg-white/95 p-3 text-slate-900 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] animate-in fade-in zoom-in-95"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--periwinkle)]">
                  <Sparkles className="size-2.5 text-[var(--periwinkle)]" />
                  Mia Fun Fact
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                  <RefreshCw className="size-2.5 transition-transform duration-300 group-hover:rotate-180" />
                  Tap
                </span>
              </div>

              <h3 className="mt-1.5 text-xs font-bold leading-snug text-slate-900 sm:text-sm">
                {currentFact.title}
              </h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 sm:text-xs">
                {currentFact.body}
              </p>

              {/* Speech bubble pointer notch pointing down to Mia */}
              <div
                aria-hidden="true"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-x-6 border-t-6 border-x-transparent border-t-white/95 filter drop-shadow-sm"
              />
            </div>
          )}

          {motion === "dancing" && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm animate-in fade-in">
              <Sparkles className="size-3 text-[var(--periwinkle)] animate-spin" />
              <span>Chef Mia is getting ready...</span>
            </div>
          )}
        </div>

        {/* Dancing / Jumping Mia Mascot */}
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={handleUserTap}
            aria-label="Tap Mia to see her dance and pop a culinary secret"
            className="group flex flex-col items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f19]"
          >
            <div
              key={hopKey}
              className={`transition-transform duration-300 ${
                motion === "dancing"
                  ? "animate-[bounce_0.8s_ease-in-out_infinite]"
                  : motion === "thinking"
                    ? "rotate-2 scale-105 transition-transform duration-500"
                    : "hover:scale-105 active:scale-95"
              }`}
            >
              <ChefMascot
                animate={motion === "dancing"}
                interactive
                className="h-24 w-24 drop-shadow-2xl sm:h-32 sm:w-32 lg:h-52 lg:w-52"
              />
            </div>

            {/* Dynamic Ground Shadow */}
            <span
              aria-hidden="true"
              className={`-mt-1 block h-2 w-20 rounded-full bg-black/60 blur-md transition-all duration-300 ${
                motion === "dancing" ? "scale-x-75 opacity-40" : "scale-x-100 opacity-70"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bottom Hero Pitch & Mia Assistant Notice */}
      <div className="relative z-10 hidden lg:block">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#A5B4FC]">
          <span className="size-1.5 rounded-full bg-[#7C8CFF]" aria-hidden="true" />
          Discover. Plan. Cook. Enjoy.
        </p>
        <h2 className="mt-1 text-balance text-lg font-bold leading-tight text-white lg:text-2xl">
          Your personal companion for better meals.
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-300">
          Explore tailored recipes, scan ingredients with your camera, plan weekly meals, and cook
          effortlessly with Mia.
        </p>
      </div>
    </section>
  );
}
