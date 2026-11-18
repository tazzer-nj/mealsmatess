import { useEffect } from "react";
import { Sparkles, Check } from "lucide-react";

export function SuccessAnimation({ onComplete }: { onComplete?: () => void }) {
  useEffect(() => {
    const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
    const delay = isTest ? 10 : 1800;
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, delay);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      data-testid="success-animation"
    >
      <div className="relative flex flex-col items-center rounded-3xl border border-white/20 bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-w-sm w-full mx-4 text-center">
        {/* Glowing ring and animated checkmark */}
        <div className="relative flex items-center justify-center size-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-pulse">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
          <div className="flex items-center justify-center size-16 rounded-full bg-emerald-500 text-white shadow-lg animate-in zoom-in duration-500">
            <Check
              size={36}
              className="stroke-[3] animate-in slide-in-from-bottom-2 duration-300"
            />
          </div>
          <Sparkles className="absolute -top-2 -right-2 size-6 text-[var(--periwinkle)] animate-bounce" />
        </div>

        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
          Subscription Confirmed!
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Your 3-day free trial is active. Preparing your personalized kitchen...
        </p>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="size-2 rounded-full bg-[var(--periwinkle)] animate-bounce [animation-delay:0ms]" />
          <span className="size-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
