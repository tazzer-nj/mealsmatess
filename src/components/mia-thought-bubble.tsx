import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MiaThoughtBubbleProps {
  children?: ReactNode;
  variant?: "thinking" | "thought";
  tone?: "light" | "surface";
  tailPosition?: "bottom" | "left";
  thinkingLabel?: string;
  interactive?: boolean;
  onClick?: () => void;
  role?: "status";
  ariaLive?: "polite" | "off";
  ariaLabel?: string;
  className?: string;
  bubbleClassName?: string;
}

/**
 * Animated cloud-style thought bubble for Mia's thoughts, thinking wave, and fun facts.
 */
export function MiaThoughtBubble({
  children,
  variant = "thought",
  tone = "surface",
  tailPosition = "bottom",
  thinkingLabel = "Mia is thinking...",
  interactive = false,
  onClick,
  role,
  ariaLive,
  ariaLabel,
  className,
  bubbleClassName,
}: MiaThoughtBubbleProps) {
  const isLight = tone === "light";
  const isThinking = variant === "thinking";
  const isLeftTail = tailPosition === "left";

  const surfaceTone = isLight
    ? "border-white/70 bg-white/95 text-slate-900 shadow-2xl"
    : "border-border bg-card/95 text-foreground shadow-md";

  const puffTone = isLight ? "border-white/70 bg-white/95" : "border-border bg-card/95";

  const tailDotTone = isLight
    ? "border border-white/75 bg-white/95 shadow-sm"
    : "border border-border bg-card shadow-sm";

  const content = (
    <>
      {/* Subtle overlapping cloud lobes on the top edge for an unmistakable thought-cloud silhouette */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-2 left-6 h-4 w-7 rounded-full border-t border-l border-r",
          puffTone,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-2.5 left-11 h-5 w-8 rounded-full border-t border-l border-r",
          puffTone,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-1.5 right-7 h-3.5 w-6 rounded-full border-t border-l border-r",
          puffTone,
        )}
      />

      <div className="relative z-10">
        {isThinking ? (
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1" aria-hidden="true">
              <span
                className={cn(
                  "mia-thought-dot-1 size-2 rounded-full",
                  isLight ? "bg-[var(--periwinkle)]" : "bg-primary",
                )}
              />
              <span
                className={cn(
                  "mia-thought-dot-2 size-2 rounded-full",
                  isLight ? "bg-[var(--periwinkle)]" : "bg-primary",
                )}
              />
              <span
                className={cn(
                  "mia-thought-dot-3 size-2 rounded-full",
                  isLight ? "bg-[var(--periwinkle)]" : "bg-primary",
                )}
              />
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isLight ? "text-slate-700" : "text-muted-foreground",
              )}
            >
              {thinkingLabel}
            </span>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );

  const bubbleClasses = cn(
    "mia-thought-float relative w-full rounded-[1.75rem] border backdrop-blur-md transition-transform duration-300",
    isThinking ? "px-4 py-2.5" : "p-3.5 sm:p-4",
    interactive && "cursor-pointer hover:scale-[1.015] active:scale-[0.99]",
    surfaceTone,
    bubbleClassName,
  );

  const tailCircles = (
    <div
      aria-hidden="true"
      data-mia-thought-tail={tailPosition}
      className={cn(
        "pointer-events-none flex shrink-0 items-center",
        isLeftTail ? "flex-row-reverse gap-1.5 pt-4" : "flex-col gap-1.5 pt-1.5",
      )}
    >
      <span className={cn("mia-thought-puff-1 size-3.5 rounded-full", tailDotTone)} />
      <span className={cn("mia-thought-puff-2 size-2.5 rounded-full", tailDotTone)} />
      <span className={cn("mia-thought-puff-3 size-1.5 rounded-full", tailDotTone)} />
    </div>
  );

  return (
    <div
      data-mia-thought-bubble="true"
      data-mia-thought-variant={variant}
      className={cn(
        "mia-thought-pop flex",
        isLeftTail ? "flex-row items-start gap-2" : "flex-col items-center",
        className,
      )}
    >
      {isLeftTail && tailCircles}

      {onClick ? (
        <div
          role={role ?? "button"}
          tabIndex={0}
          aria-live={ariaLive}
          aria-label={ariaLabel}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }}
          className={bubbleClasses}
        >
          {content}
        </div>
      ) : (
        <div role={role} aria-live={ariaLive} aria-label={ariaLabel} className={bubbleClasses}>
          {content}
        </div>
      )}

      {!isLeftTail && tailCircles}
    </div>
  );
}
