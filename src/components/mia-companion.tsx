import { Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { ChefMascot } from "@/components/chef-mascot";
import { Button } from "@/components/ui/button";
import { useOptionalMia } from "@/hooks/use-mia";
import type { MiaMood } from "@/lib/mia-companion";

const MOOD_TITLES: Record<MiaMood, string> = {
  happy: "Ready to cook",
  excited: "Excited for this dish",
  thinking: "Thinking up ideas",
  listening: "Listening closely",
  speaking: "Sharing a tip",
  confused: "Double-checking",
  concerned: "Looking out for your pantry",
  celebrating: "Celebrating your win",
  calm: "Calm kitchen rhythm",
};

export function MiaCompanionPanel({
  mood: explicitMood,
  headline,
  message,
  primaryAction,
  secondaryAction,
}: {
  mood?: MiaMood;
  headline?: string;
  message: string;
  primaryAction?: { label: string; to?: string; onClick?: () => void };
  secondaryAction?: { label: string; to?: string; onClick?: () => void };
}) {
  const mia = useOptionalMia();
  const mood = explicitMood ?? mia?.mood ?? "happy";

  return (
    <section
      aria-label="Mia kitchen companion"
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/80 p-1.5">
          <ChefMascot mood={mood} interactive className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            Mia &middot; {MOOD_TITLES[mood]}
          </p>
          {headline && (
            <h2 className="mt-0.5 font-display text-lg leading-snug text-foreground">{headline}</h2>
          )}
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{message}</p>
          {(primaryAction || secondaryAction) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {primaryAction?.to ? (
                <Button asChild size="sm" className="min-h-10 rounded-xl px-4">
                  <Link to={primaryAction.to}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    {primaryAction.label}
                  </Link>
                </Button>
              ) : primaryAction?.onClick ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={primaryAction.onClick}
                  className="min-h-10 rounded-xl px-4"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {primaryAction.label}
                </Button>
              ) : null}
              {secondaryAction?.to ? (
                <Button asChild size="sm" variant="outline" className="min-h-10 rounded-xl px-4">
                  <Link to={secondaryAction.to}>
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    {secondaryAction.label}
                  </Link>
                </Button>
              ) : secondaryAction?.onClick ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  className="min-h-10 rounded-xl px-4"
                >
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function MiaReactionToast() {
  const mia = useOptionalMia();
  const reaction = mia?.companionReaction;
  if (!reaction) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-md transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary/80 p-1">
          <ChefMascot mood={reaction.mood} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{reaction.message}</p>
          {reaction.subtitle && (
            <p className="truncate text-xs text-muted-foreground">{reaction.subtitle}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss Mia message"
          onClick={() => mia.clearCompanionReaction()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
