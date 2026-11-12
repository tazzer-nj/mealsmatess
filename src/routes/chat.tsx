import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Crown,
  Loader2,
  Eye,
  Mic,
  X,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  Clock,
  RotateCcw,
} from "lucide-react";
import { CookingInput } from "@/components/cooking-input";
import { useMia } from "@/hooks/use-mia";
import { usePremium } from "@/hooks/use-premium";
import { cn } from "@/lib/utils";

// Heavy media player (images + audio narration) — only loaded when a visual answer exists.
const VisualExplainer = lazy(() =>
  import("@/components/visual-explainer").then((m) => ({ default: m.VisualExplainer })),
);

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
  head: () => ({
    meta: [
      { title: "Mia — Your AI Food Companion · MealMate" },
      {
        name: "description",
        content:
          "Ask Mia anything about food: recipes, substitutions, meal ideas and what you can cook with what you already have.",
      },
      { property: "og:title", content: "Mia — Your AI Food Companion · MealMate" },
      {
        property: "og:description",
        content: "Recipes, planning and cooking help from Mia, your personal food companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SUGGESTIONS = [
  { text: "What can I cook?", icon: Sparkles },
  { text: "Help me plan dinner.", icon: Clock },
  { text: "Find a quick recipe.", icon: ChefHat },
  { text: "What can I make with my ingredients?", icon: UtensilsCrossed },
];

function ChatPage() {
  const { isPremium } = usePremium();
  const { q } = Route.useSearch();
  const [question, setQuestion] = useState(q ?? "");
  const [visualMode, setVisualMode] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const mia = useMia();
  const { turns, busy } = mia;

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
      toast.error("Mia couldn't answer that", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
    }
  }

  const empty = turns.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6 pt-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white"
          >
            <Sparkles className="h-[19px] w-[19px]" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.02em]">Mia</h1>
            <p className="text-[12px] text-[#71717A]">Your personal food companion</p>
          </div>
        </div>
        {isPremium ? (
          <button
            type="button"
            aria-pressed={visualMode}
            onClick={() => setVisualMode((v) => !v)}
            className={cn(
              "mm-chip h-9 px-3 text-[13px]",
              visualMode && "border-white bg-white text-[#080808]",
            )}
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} />
            Visual
          </button>
        ) : (
          <Link to="/premium" className="mm-chip h-9 px-3 text-[13px]">
            <Crown className="h-4 w-4" strokeWidth={1.75} />
            Visual
          </Link>
        )}
      </header>

      {/* Conversation */}
      <div className="mt-8 flex-1">
        {empty ? (
          <div className="mm-fade-up">
            <h2 className="mm-display">Hey, I&apos;m Mia.</h2>
            <p className="mt-3 text-[17px] leading-snug text-[#A1A1AA]">
              What are we making today?
            </p>
            <div className="mt-8 grid gap-2">
              {SUGGESTIONS.map(({ text, icon: Icon }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => void ask(text)}
                  className="group flex items-center gap-3 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 text-left transition-colors duration-150 hover:border-[#303030] hover:bg-[#171717]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-[#A1A1AA] transition-colors group-hover:text-white">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="text-[15px] text-[#E4E4E7]">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-7">
            {turns.map((t) => (
              <div key={t.id} className="space-y-3">
                <div className="flex justify-end">
                  <p className="max-w-[86%] rounded-[18px] rounded-br-[6px] bg-[#1F1F1F] px-4 py-2.5 text-[15px] leading-relaxed text-white">
                    {t.question}
                  </p>
                </div>

                {t.answer && (
                  <div className="mm-fade flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#A1A1AA]"
                    >
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <p className="max-w-[88%] whitespace-pre-wrap text-[15px] leading-[1.7] text-[#E4E4E7]">
                      {t.answer}
                    </p>
                  </div>
                )}

                {t.error && (
                  <div role="alert" className="mm-alert">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#FCA5A5]">That didn&apos;t work</p>
                      <p className="mt-0.5 text-[13px] text-[#A1A1AA]">{t.error}</p>
                      <button
                        type="button"
                        onClick={() => void mia.retry(t.id)}
                        disabled={busy}
                        className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-white disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Try again
                      </button>
                    </div>
                  </div>
                )}

                {t.visualLoading && (
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3 text-[13px] text-[#A1A1AA]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing your visual explanation…
                  </div>
                )}
                {t.visualError && (
                  <p className="text-[12px] text-[#71717A]">
                    Visual explanation unavailable right now.
                  </p>
                )}
                {t.visual && (
                  <Suspense fallback={<div className="mm-skeleton h-40 w-full" />}>
                    <VisualExplainer data={t.visual} />
                  </Suspense>
                )}
              </div>
            ))}
          </div>
        )}

        {busy && (
          <div className="mt-5 flex items-center gap-2.5 text-[13px] text-[#71717A]">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#71717A]"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </span>
            Mia is thinking…
          </div>
        )}
      </div>

      <div ref={endRef} />

      {/* Composer */}
      <div className="sticky bottom-3 mt-8 bg-gradient-to-t from-[#080808] via-[#080808] to-transparent pb-1 pt-3">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <CookingInput
              value={question}
              onChange={setQuestion}
              onSubmit={() => void ask(question)}
              busy={busy}
            />
          </div>
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            aria-label="Talk to Mia"
            className="mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1F1F1F] active:scale-95"
          >
            <Mic className="h-[19px] w-[19px]" strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-[#71717A]">
          Mia can be wrong — use judgement for allergies and food safety.
        </p>
      </div>

      {voiceOpen && <VoiceMode onClose={() => setVoiceOpen(false)} />}
    </main>
  );
}

const VOICE_COPY: Record<string, { label: string; hint: string }> = {
  loading: { label: "Waking up…", hint: "Preparing the voice engine" },
  waiting: { label: "Say “Hey Mia”", hint: "I'm listening for you" },
  listening: { label: "Listening…", hint: "Speak naturally" },
  thinking: { label: "Thinking…", hint: "Finding the best answer" },
  speaking: { label: "Speaking…", hint: "Tap end when you're done" },
  paused: { label: "Paused", hint: "Hands-free is paused" },
  denied: { label: "Microphone blocked", hint: "Allow microphone access, then try again" },
  error: { label: "Voice unavailable", hint: "Please try again" },
  muted: { label: "Microphone off", hint: "Voice is not capturing right now" },
};

function VoiceMode({ onClose }: { onClose: () => void }) {
  const mia = useMia();
  const { voice, turns } = mia;
  const lastAnswer = turns.at(-1)?.answer;

  useEffect(() => {
    mia.startVoice();
    return () => mia.stopVoice();
    // Start capture only when the full-screen voice mode is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = VOICE_COPY[voice.state] ?? VOICE_COPY["muted"]!;
  const capturing = voice.state === "listening";
  const speaking = voice.state === "speaking";

  function finish() {
    mia.endConversation();
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation with Mia"
      className="premium-flow fixed inset-0 z-[60] flex flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]"
    >
      <div className="flex items-center justify-between">
        <span className="mm-eyebrow">Voice with Mia</span>
        <button
          type="button"
          onClick={finish}
          aria-label="End voice conversation"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#262626] text-[#A1A1AA] transition-colors hover:text-white"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          {(capturing || speaking) && (
            <>
              <span
                aria-hidden
                className={cn(
                  "absolute h-40 w-40 rounded-full border border-white/10",
                  capturing ? "animate-ping" : "animate-pulse",
                )}
                style={{ animationDuration: capturing ? "2.6s" : "2s" }}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute h-28 w-28 rounded-full border border-white/15",
                  capturing ? "animate-ping" : "animate-pulse",
                )}
                style={{ animationDuration: capturing ? "2.2s" : "1.8s", animationDelay: "220ms" }}
              />
            </>
          )}
          <span
            aria-hidden
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full border transition-colors duration-300",
              capturing || speaking
                ? "border-white bg-white text-[#080808]"
                : "border-[#262626] bg-[#141414] text-[#A1A1AA]",
            )}
          >
            <Mic className="h-8 w-8" strokeWidth={1.6} />
          </span>
        </div>

        <p role="status" className="mt-10 text-[22px] font-medium tracking-[-0.02em]">
          {copy.label}
        </p>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-[#A1A1AA]">{copy.hint}</p>

        {(voice.transcript || lastAnswer) && (
          <div className="mt-8 w-full max-w-md space-y-3 text-left">
            {voice.transcript && (
              <p className="ml-auto w-fit max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[#1F1F1F] px-4 py-2.5 text-[14px] text-white">
                {voice.transcript}
              </p>
            )}
            {speaking && lastAnswer && (
              <p className="text-[14px] leading-relaxed text-[#E4E4E7]">{lastAnswer}</p>
            )}
          </div>
        )}

        {voice.error && (
          <p role="alert" className="mt-6 max-w-sm text-[13px] text-[#FCA5A5]">
            {voice.error}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-center text-[11px] leading-relaxed text-[#71717A]">
          Audio is processed on your device. Turn Mia&apos;s spoken replies off any time in Settings.
        </p>
        <button type="button" onClick={finish} className="mm-btn mm-btn-secondary mm-btn-block">
          End conversation
        </button>
      </div>
    </div>
  );
}
