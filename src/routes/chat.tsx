import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowUp, Camera, Crown, Eye, Loader2, Mic, RotateCcw, Sparkles } from "lucide-react";
import { useMia } from "@/hooks/use-mia";
// Heavy media player (images + audio narration) — only loaded when a visual answer exists.
const VisualExplainer = lazy(() =>
  import("@/components/visual-explainer").then((m) => ({ default: m.VisualExplainer })),
);
import { usePremium } from "@/hooks/use-premium";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
  head: () => ({
    meta: [
      { title: "Mia — your MealMate companion" },
      {
        name: "description",
        content:
          "Ask Mia anything about food and get a thoughtful answer, recipe guidance and hands-free help in the kitchen.",
      },
      { property: "og:title", content: "Mia — your MealMate companion" },
      {
        property: "og:description",
        content: "Ask Mia anything about food, cooking and what to make next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SUGGESTIONS = [
  "What can I cook?",
  "Help me plan dinner.",
  "Find a quick recipe.",
  "What can I make with my ingredients?",
];

function ChatPage() {
  const { isPremium } = usePremium();
  const { q } = Route.useSearch();
  const [question, setQuestion] = useState(q ?? "");
  const endRef = useRef<HTMLDivElement>(null);
  const mia = useMia();
  const { turns, busy, voice } = mia;
  const [visualMode, setVisualMode] = useState(false);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, busy]);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setQuestion("");
    mia.endConversation();
    try {
      await mia.ask(question, { visual: isPremium && visualMode });
    } catch (error) {
      toast.error("Mia couldn't answer that", {
        description:
          error instanceof Error ? error.message : "Mia is unavailable. Please try again.",
      });
    }
  }

  const voiceActive = ["listening", "thinking", "speaking", "waiting", "loading"].includes(
    voice.state,
  );

  return (
    <main className="mia-shell">
      {turns.length === 0 ? (
        <div className="mia-welcome">
          <span className="mia-orb">
            <Sparkles className="size-5" strokeWidth={1.6} />
          </span>
          <h1 className="mm-display">Hey, I'm Mia.</h1>
          <p className="mm-lead mt-1">What are we making today?</p>

          <div className="mt-8 flex w-full flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                disabled={busy}
                className="mia-suggestion"
              >
                {s}
                <ArrowUp className="size-4 rotate-45" strokeWidth={1.7} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-[17px] font-semibold tracking-[-0.02em]">Mia</h1>
            <div className="flex items-center gap-1">
              {isPremium ? (
                <button
                  type="button"
                  aria-pressed={visualMode}
                  onClick={() => setVisualMode((v) => !v)}
                  className="mm-chip"
                  data-active={visualMode}
                >
                  <Eye className="size-3.5" strokeWidth={1.7} />
                  Visual
                </button>
              ) : (
                <Link to="/premium" className="mm-chip">
                  <Crown className="size-3.5" strokeWidth={1.7} />
                  Visual
                </Link>
              )}
            </div>
          </div>

          <div className="mia-thread">
            {turns.map((t) => (
              <div key={t.id} className="mia-turn">
                <p className="mia-ask">{t.question}</p>
                {t.answer ? <p className="mia-answer">{t.answer}</p> : null}
                {!t.answer && !t.error && busy ? (
                  <div className="mia-typing" role="status" aria-label="Mia is thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}
                {t.error ? (
                  <div role="alert" className="mm-error">
                    <p className="mm-body">{t.error}</p>
                    <button
                      type="button"
                      onClick={() => void mia.retry(t.id)}
                      disabled={busy}
                      className="mm-btn mm-btn--secondary mm-btn--sm"
                    >
                      <RotateCcw />
                      Try again
                    </button>
                  </div>
                ) : null}
                {t.visualLoading ? (
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Preparing your visual explanation…
                  </div>
                ) : null}
                {t.visualError ? (
                  <p className="mm-meta">Visual explanation unavailable: {t.visualError}</p>
                ) : null}
                {t.visual ? (
                  <Suspense fallback={<div className="mm-skeleton h-40" />}>
                    <VisualExplainer data={t.visual} />
                  </Suspense>
                ) : null}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </>
      )}

      <div className="mia-composer">
        <div className="mia-input-shell">
          <button
            type="button"
            className="mia-tool-btn"
            aria-label={voiceActive ? "Mia voice is active" : "Start voice conversation"}
            aria-pressed={voiceActive}
            onClick={() => {
              if (voiceActive) mia.stopVoice();
              else mia.startVoice();
            }}
          >
            <Mic className="size-[18px]" strokeWidth={1.7} />
          </button>
          <Link to="/scan" className="mia-tool-btn" aria-label="Scan ingredients">
            <Camera className="size-[18px]" strokeWidth={1.7} />
          </Link>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(question);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Ask Mia anything..."
            aria-label="Message Mia"
          />
          <button
            type="button"
            className="mia-send"
            aria-label="Send message"
            disabled={busy || !question.trim()}
            onClick={() => void ask(question)}
          >
            {busy ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : (
              <ArrowUp className="size-[18px]" strokeWidth={2} />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Mia can be wrong — check allergies and food safety yourself.
        </p>
      </div>
    </main>
  );
}
