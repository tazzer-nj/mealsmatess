import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Crown, Loader2, Eye, AudioWaveform, Mic, X } from "lucide-react";
import { ChefMascot } from "@/components/chef-mascot";
import { CookingInput } from "@/components/cooking-input";
import { useMia } from "@/hooks/use-mia";
// Heavy media player (images + audio narration) — only loaded when a visual answer exists.
const VisualExplainer = lazy(() =>
  import("@/components/visual-explainer").then((m) => ({ default: m.VisualExplainer })),
);
import { usePremium } from "@/hooks/use-premium";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
  head: () => ({
    meta: [
      { title: "Mia AI Chef & Voice Mode — MealMate" },
      {
        name: "description",
        content:
          "Ask Mia anything about cooking, pantry ingredients, meal plans, and voice-guided recipes.",
      },
      { property: "og:title", content: "Mia AI Chef & Voice Mode — MealMate" },
      {
        property: "og:description",
        content: "Chat with Mia or open hands-free Voice Mode while cooking.",
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

const VOICE_STATE_COPY: Record<string, string> = {
  muted: "Ready for hands-free voice",
  loading: "Preparing voice engine…",
  waiting: "Waiting for “Hey Mia”",
  listening: "Listening…",
  thinking: "Mia is thinking…",
  speaking: "Mia is speaking…",
  paused: "Hands-free paused",
  denied: "Microphone permission needed",
  error: "Voice unavailable right now",
};

function ChatPage() {
  const { isPremium } = usePremium();
  const { q } = Route.useSearch();
  const [question, setQuestion] = useState(q ?? "");
  const endRef = useRef<HTMLDivElement>(null);
  const mia = useMia();
  const { turns, busy, voice } = mia;
  const [visualMode, setVisualMode] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, busy]);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setQuestion("");
    mia.endConversation();
    try {
      await mia.ask(text, { visual: isPremium && visualMode });
    } catch (error) {
      toast.error("Couldn't answer that", {
        description:
          error instanceof Error ? error.message : "Mia is unavailable. Please try again.",
      });
    }
  }

  const voiceActive = ["loading", "waiting", "listening", "thinking", "speaking"].includes(
    voice.state,
  );
  const latestTurn = turns.at(-1);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col bg-background px-4 py-8 text-foreground">
      {turns.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <ChefMascot animate className="h-32 w-32" />
          <h1 className="mt-5 text-3xl font-medium tracking-tight text-foreground">
            Hey, I&apos;m Mia.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">What are we making today?</p>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
              <ChefMascot className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-tight text-foreground">Mia</h1>
              <p className="text-xs text-muted-foreground">Personal culinary assistant</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setVoiceOpen(true)}
          className="h-9 rounded-xl border-border bg-card text-xs font-medium text-foreground hover:bg-secondary"
        >
          <AudioWaveform className="mr-1.5 h-3.5 w-3.5 text-[var(--periwinkle)]" />
          Voice mode
        </Button>

        {isPremium ? (
          <Button
            type="button"
            variant="outline"
            className={`h-9 rounded-xl border text-xs font-medium transition-colors ${
              visualMode
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
            aria-pressed={visualMode}
            onClick={() => setVisualMode((v) => !v)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" /> Visual mode {visualMode ? "on" : "off"}
          </Button>
        ) : (
          <Button
            asChild
            variant="ghost"
            className="h-9 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Link to="/premium">
              <Crown className="mr-1.5 h-3.5 w-3.5 text-[var(--periwinkle)]" /> Premium Visual Mode
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-6 flex-1 space-y-6">
        {turns.length === 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {turns.map((t) => (
          <div key={t.id} className="space-y-3">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              {t.question}
            </div>
            {t.answer && (
              <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-foreground [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                <ReactMarkdown>{t.answer}</ReactMarkdown>
              </div>
            )}
            {t.error && (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <p className="flex-1">{t.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border bg-card text-foreground"
                  onClick={() => void mia.retry(t.id)}
                  disabled={busy}
                >
                  Try again
                </Button>
              </div>
            )}
            {t.visualLoading && (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--periwinkle)]" />
                Directing your animated explainer — illustrations &amp; narration…
              </div>
            )}
            {t.visualError && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                Visual explanation unavailable: {t.visualError}
              </p>
            )}
            {t.visual && (
              <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-secondary" />}>
                <VisualExplainer data={t.visual} />
              </Suspense>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--periwinkle)]" />
            Thinking…
          </div>
        )}
      </div>

      <div ref={endRef} />
      <div className="chat-composer sticky bottom-3 mt-6 bg-background pb-2 pt-2">
        <CookingInput
          value={question}
          onChange={setQuestion}
          onSubmit={() => {
            void ask(question);
          }}
          busy={busy}
        />
      </div>
      <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        AI answers can be wrong — check allergies and food safety.
      </p>

      {/* Full-Screen Voice Mode */}
      {voiceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mia Voice Mode"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-background px-6 py-8 text-foreground"
        >
          <div className="mx-auto flex w-full max-w-md items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Voice Mode
              </p>
              <h2 className="text-lg font-medium tracking-tight text-foreground">Talk with Mia</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Exit voice mode"
              onClick={() => setVoiceOpen(false)}
              className="size-10 rounded-xl border-border bg-card text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
            <div className="relative flex h-44 w-44 items-center justify-center">
              <div
                aria-hidden="true"
                className={`absolute inset-0 rounded-full border transition-transform duration-700 ${
                  voice.state === "speaking" || voice.state === "listening"
                    ? "scale-110 border-[var(--periwinkle)]/50 motion-safe:animate-pulse"
                    : "scale-100 border-border"
                }`}
              />
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full border transition-transform duration-500 ${
                  voice.state === "speaking"
                    ? "scale-105 border-[var(--periwinkle)]/70"
                    : "scale-100 border-border"
                }`}
              />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card">
                <ChefMascot animate={voiceActive} className="h-20 w-20" />
              </div>
            </div>

            <p className="mt-6 text-base font-medium text-foreground" role="status">
              {VOICE_STATE_COPY[voice.state] ?? "Mia Voice"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Say &ldquo;Hey Mia&rdquo; to ask, or &ldquo;Thanks Mia&rdquo; to finish.
            </p>

            {voice.transcript && (
              <p className="mt-5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
                &ldquo;{voice.transcript}&rdquo;
              </p>
            )}
            {latestTurn?.answer && (
              <p className="mt-3 line-clamp-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {latestTurn.answer}
              </p>
            )}
            {voice.error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
              >
                {voice.error}
              </p>
            )}
          </div>

          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            {!voiceActive ? (
              <Button
                type="button"
                size="lg"
                onClick={() => mia.startVoice()}
                className="h-12 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start voice session
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => mia.stopVoice()}
                className="h-12 w-full rounded-xl border-border bg-card text-sm font-medium text-foreground hover:bg-secondary"
              >
                Stop speaking &amp; pause
              </Button>
            )}
            {["listening", "thinking", "speaking"].includes(voice.state) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => mia.endConversation()}
                className="h-10 w-full rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                End conversation
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
