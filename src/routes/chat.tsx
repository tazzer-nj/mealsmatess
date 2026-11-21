import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  AudioWaveform,
  Crown,
  History,
  Loader2,
  MessageSquarePlus,
  Mic,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { ChefMascot } from "@/components/chef-mascot";
import { CookingInput } from "@/components/cooking-input";
import { MiaThoughtBubble } from "@/components/mia-thought-bubble";
import { useMia } from "@/hooks/use-mia";
import { usePremium } from "@/hooks/use-premium";
import { FREE_MIA_SEARCH_LIMIT, MIA_FREE_LIMIT_ERROR_CODE } from "@/lib/freemium";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Defer heavy markdown & visual explainer bundles until a reply renders.
const ReactMarkdown = lazy(() => import("react-markdown"));
const VisualExplainer = lazy(() =>
  import("@/components/visual-explainer").then((m) => ({ default: m.VisualExplainer })),
);

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
  head: () => ({
    meta: [
      { title: "Mia AI Chef & Voice Mode | MealMate" },
      {
        name: "description",
        content:
          "Ask Mia anything about cooking, pantry ingredients, meal plans, and voice-guided recipes.",
      },
      { property: "og:title", content: "Mia AI Chef & Voice Mode | MealMate" },
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
  "What can I cook with my pantry?",
  "Help me plan tonight's dinner.",
  "Find a quick 20-minute recipe.",
  "Check allergies & safe substitutions.",
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
  const {
    turns,
    busy,
    voice,
    quota,
    conversations,
    activeConversationId,
    historyLoading,
    refreshHistory,
    openConversation,
    newConversation,
    removeConversation,
  } = mia;
  const [visualMode, setVisualMode] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, busy]);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    const draft = text;
    setQuestion("");
    try {
      await mia.ask(draft, { visual: isPremium && visualMode });
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      const name = error instanceof Error ? error.name : "";
      if (code === MIA_FREE_LIMIT_ERROR_CODE || name === "MiaFreeLimitError") {
        setQuestion(draft);
        return;
      }
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
  const waitingForFirstToken = busy && (!latestTurn || !latestTurn.answer);

  const freeRemaining = quota?.freeRemaining ?? FREE_MIA_SEARCH_LIMIT;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-x-hidden px-4 py-8 text-foreground">
      {!isPremium && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs"
        >
          <span className="font-medium text-foreground tabular-nums">
            {freeRemaining} free {freeRemaining === 1 ? "search" : "searches"} left
          </span>
          <Link
            to="/premium"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
            {freeRemaining <= 0 ? "Start 3-day free trial" : "Unlock unlimited Mia"}
          </Link>
        </div>
      )}

      {turns.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <ChefMascot animate className="h-44 w-44" />
          <h1 className="mt-5 font-display text-3xl">Your little kitchen companion.</h1>
          <p className="mt-2 text-sm text-muted-foreground">What&apos;s cooking, Chef?</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ChefMascot className="h-9 w-9" />
            <h1 className="font-display text-2xl">MealMate Chef</h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => newConversation()}
            disabled={busy}
            className="h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageSquarePlus className="mr-1.5 h-4 w-4" />
            New chat
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setHistoryOpen(true);
            void refreshHistory();
          }}
          className="h-10 rounded-full"
        >
          <History className="h-4 w-4 text-muted-foreground" />
          History {conversations.length > 0 ? `(${conversations.length})` : ""}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setVoiceOpen(true)}
          className="h-10 rounded-full"
        >
          <AudioWaveform className="h-4 w-4 text-primary" />
          Voice mode
        </Button>

        {isPremium ? (
          <Button
            type="button"
            variant={visualMode ? "default" : "outline"}
            className="h-10 rounded-full"
            aria-pressed={visualMode}
            onClick={() => setVisualMode((v) => !v)}
          >
            <Wand2 className="h-4 w-4" /> Visual {visualMode ? "on" : "off"}
          </Button>
        ) : (
          <Button asChild variant="ghost" className="h-10 rounded-full text-muted-foreground">
            <Link to="/premium">
              <Crown className="h-4 w-4" /> Premium Visual Mode
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-7 flex-1 space-y-6">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button
                variant="outline"
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="h-auto rounded-full border border-border bg-card px-4 py-2 text-left text-sm whitespace-normal transition-colors hover:bg-muted"
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        {turns.map((t) => (
          <div key={t.id} className="space-y-3">
            <p className="ml-auto max-w-[85%] break-words rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {t.question}
            </p>
            {t.answer && (
              <div className="mr-auto max-w-[85%] overflow-x-hidden break-words rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm leading-relaxed [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_pre]:overflow-x-auto [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                <Suspense fallback={<p className="whitespace-pre-wrap">{t.answer}</p>}>
                  <ReactMarkdown>{t.answer}</ReactMarkdown>
                </Suspense>
              </div>
            )}
            {t.error && (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <p className="flex-1">{t.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => void mia.retry(t.id)}
                  disabled={busy}
                >
                  Try again
                </Button>
              </div>
            )}
            {t.visualLoading && (
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Directing your animated explainer with illustrations + narration…
              </div>
            )}
            {t.visualError && (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-muted-foreground">
                Visual explanation unavailable: {t.visualError}
              </p>
            )}
            {t.visual && (
              <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}>
                <VisualExplainer data={t.visual} />
              </Suspense>
            )}
          </div>
        ))}

        {waitingForFirstToken && (
          <div className="flex items-end gap-2.5">
            <ChefMascot animate className="h-10 w-10 shrink-0" />
            <MiaThoughtBubble
              variant="thinking"
              tone="surface"
              tailPosition="left"
              thinkingLabel="Mia is thinking..."
              role="status"
              ariaLive="polite"
              className="max-w-xs"
            />
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
        <Sparkles className="h-3 w-3" /> AI answers can be wrong. Always verify allergens before
        cooking.
      </p>

      {/* Conversation History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[82dvh] overflow-y-auto rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Saved Mia Conversations</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Resume a previous kitchen chat or start a fresh thread.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                newConversation();
                setHistoryOpen(false);
              }}
              className="w-full justify-start rounded-xl border-border"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4 text-primary" />
              Start a new conversation
            </Button>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No previous conversations saved yet. Your chats automatically save to your account.
              </p>
            ) : (
              conversations.map((conv) => {
                const isCurrent = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                      isCurrent ? "border-primary bg-primary/5" : "border-border bg-secondary/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        void openConversation(conv.id);
                        setHistoryOpen(false);
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium text-foreground">{conv.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                        {conv.turns.length} turn{conv.turns.length === 1 ? "" : "s"} ·{" "}
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete conversation ${conv.title}`}
                      disabled={deletingId === conv.id}
                      onClick={async () => {
                        setDeletingId(conv.id);
                        try {
                          await removeConversation(conv.id);
                          toast.success("Conversation deleted");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      {deletingId === conv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Voice Mode */}
      {voiceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mia Voice Mode"
          className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-foreground"
        >
          <div className="mx-auto flex w-full max-w-md items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Voice Mode
              </p>
              <h2 className="font-display text-2xl text-foreground">Talk with Mia</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Exit voice mode"
              onClick={() => setVoiceOpen(false)}
              className="size-10 rounded-full"
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
                    ? "scale-110 border-primary/50 motion-safe:animate-pulse"
                    : "scale-100 border-border"
                }`}
              />
              <div
                aria-hidden="true"
                className={`absolute inset-4 rounded-full border transition-transform duration-500 ${
                  voice.state === "speaking"
                    ? "scale-105 border-primary/70"
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
              <p className="mt-5 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
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
                className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive"
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
                className="h-12 w-full rounded-full"
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
                className="h-12 w-full rounded-full"
              >
                Stop speaking &amp; pause
              </Button>
            )}
            {["listening", "thinking", "speaking"].includes(voice.state) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => mia.endConversation()}
                className="h-10 w-full rounded-full text-xs text-muted-foreground hover:text-foreground"
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
