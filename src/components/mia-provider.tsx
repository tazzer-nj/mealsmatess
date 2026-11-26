import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  MiaContext,
  type MiaConversationSummary,
  type MiaRecipe,
  type MiaTurn,
} from "@/hooks/use-mia";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useOptionalUpgradeModal } from "@/components/upgrade-modal";
import { postAuthenticatedAi } from "@/lib/ai-api";
import {
  FREE_MIA_SEARCH_LIMIT,
  getClientDeviceFingerprint,
  MIA_FREE_LIMIT_ERROR_CODE,
  MIA_FREE_LIMIT_MESSAGE,
  type MiaQuotaSnapshot,
} from "@/lib/freemium";
import { MiaVoiceSession, type MiaVoiceSnapshot } from "@/lib/mia/voice-session";
import { openMiaMicrophone } from "@/lib/mia/microphone";
import { speakMia } from "@/lib/mia/speech";

function isFreeLimitErr(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; name?: unknown };
  return e.code === MIA_FREE_LIMIT_ERROR_CODE || e.name === "MiaFreeLimitError";
}

function makeFreeLimitError(quota?: MiaQuotaSnapshot) {
  return Object.assign(new Error(MIA_FREE_LIMIT_MESSAGE), {
    name: "MiaFreeLimitError",
    code: MIA_FREE_LIMIT_ERROR_CODE,
    quota,
  });
}

function lastConversationStorageKey(uid: string) {
  return `mealmate.mia.lastConversationId.${uid}`;
}

function safeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mia_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Shared across Consumer routes; navigation and refreshes preserve conversation history. */
export function MiaProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { isPremium } = usePremium();
  const upgradeModal = useOptionalUpgradeModal();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const allowed =
    !!user && !/^\/(auth|welcome|premium|onboarding|admin|legal|reset-password)(\/|$)/.test(path);

  const [turns, setTurns] = useState<MiaTurn[]>([]);
  const turnsRef = useRef<MiaTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const activeCreatedAtRef = useRef<string | undefined>(undefined);
  const [conversations, setConversations] = useState<MiaConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [quota, setQuota] = useState<MiaQuotaSnapshot | null>(null);
  const quotaRef = useRef<MiaQuotaSnapshot | null>(null);
  quotaRef.current = quota;
  const isPremiumRef = useRef(isPremium);
  isPremiumRef.current = isPremium;

  const requestRef = useRef<AbortController | null>(null);
  const recipe = useRef<MiaRecipe | null>(null);
  const recipeStepper = useRef<((step: number) => void) | undefined>(undefined);
  const setRecipe = useCallback((value: MiaRecipe | null, onStep?: (step: number) => void) => {
    recipe.current = value;
    recipeStepper.current = onStep;
  }, []);
  const [voice, setVoice] = useState<MiaVoiceSnapshot>({
    state: "muted",
    transcript: "",
    error: "",
  });
  const session = useRef<MiaVoiceSession | null>(null);
  const nativeLifecycleReady = useRef(!Capacitor.isNativePlatform());
  const allowedRef = useRef(allowed);
  allowedRef.current = allowed;

  const updateTurns = useCallback((update: (items: MiaTurn[]) => MiaTurn[]) => {
    turnsRef.current = update(turnsRef.current);
    setTurns(turnsRef.current);
  }, []);
  const patch = useCallback(
    (id: string, next: Partial<MiaTurn>) => {
      updateTurns((items) => items.map((turn) => (turn.id === id ? { ...turn, ...next } : turn)));
    },
    [updateTurns],
  );

  const persistCurrentConversation = useCallback(
    async (uid: string | undefined, items: MiaTurn[]) => {
      if (!uid || items.length === 0 || typeof window === "undefined") return;
      if (import.meta.env?.MODE === "test") return;
      const convId = activeIdRef.current ?? safeUuid();
      if (!activeIdRef.current) {
        activeIdRef.current = convId;
        activeCreatedAtRef.current = new Date().toISOString();
        setActiveConversationId(convId);
      }
      try {
        window.localStorage.setItem(lastConversationStorageKey(uid), convId);
        const { saveMiaConversation } = await import("@/lib/mia-conversations");
        const saved = await saveMiaConversation({
          userId: uid,
          conversationId: convId,
          turns: items,
          recipeContext: recipe.current,
          createdAt: activeCreatedAtRef.current,
        });
        setConversations((prev) => {
          const rest = prev.filter((c) => c.id !== saved.id);
          return [saved, ...rest].slice(0, 30);
        });
      } catch {
        /* best-effort persistence */
      }
    },
    [],
  );

  const refreshHistory = useCallback(async () => {
    const uid = user?.id;
    if (!uid || !allowedRef.current || import.meta.env?.MODE === "test") return;
    setHistoryLoading(true);
    try {
      const { listMiaConversations } = await import("@/lib/mia-conversations");
      const items = await listMiaConversations(uid);
      setConversations(items);
    } catch {
      /* ignore */
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  const openConversation = useCallback(
    async (id: string) => {
      const uid = user?.id;
      if (!uid) return;
      requestRef.current?.abort();
      const cached = conversations.find((c) => c.id === id);
      if (cached) {
        activeIdRef.current = cached.id;
        activeCreatedAtRef.current = cached.updated_at;
        setActiveConversationId(cached.id);
        updateTurns(() => cached.turns ?? []);
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(lastConversationStorageKey(uid), cached.id);
          } catch {
            // Ignore storage errors
          }
        }
        return;
      }
      const { loadMiaConversation } = await import("@/lib/mia-conversations");
      const loaded = await loadMiaConversation(uid, id);
      if (!loaded) return;
      activeIdRef.current = loaded.id;
      activeCreatedAtRef.current = loaded.created_at;
      setActiveConversationId(loaded.id);
      updateTurns(() => loaded.turns ?? []);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(lastConversationStorageKey(uid), loaded.id);
        } catch {
          // Ignore storage errors
        }
      }
    },
    [conversations, updateTurns, user?.id],
  );

  const newConversation = useCallback(() => {
    requestRef.current?.abort();
    activeIdRef.current = null;
    activeCreatedAtRef.current = undefined;
    setActiveConversationId(null);
    updateTurns(() => []);
    if (user?.id && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(lastConversationStorageKey(user.id));
      } catch {
        // Ignore storage errors
      }
    }
  }, [updateTurns, user?.id]);

  const removeConversation = useCallback(
    async (id: string) => {
      const uid = user?.id;
      if (!uid) return;
      const { deleteMiaConversation } = await import("@/lib/mia-conversations");
      await deleteMiaConversation(uid, id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeIdRef.current === id) {
        newConversation();
      }
    },
    [newConversation, user?.id],
  );

  const refreshQuota = useCallback(async () => {
    if (!user?.id || isPremiumRef.current) {
      setQuota(null);
      return;
    }
    if (import.meta.env?.MODE === "test") return;
    try {
      const { getMyMiaQuota } = await import("@/lib/premium.functions");
      const snapshot = await getMyMiaQuota({
        data: { deviceFingerprint: getClientDeviceFingerprint() },
      });
      setQuota(snapshot);
    } catch {
      /* keep current local snapshot if unavailable */
    }
  }, [user?.id]);

  const answer = useCallback(
    async (
      turnId: string,
      text: string,
      history: MiaTurn[],
      signal: AbortSignal,
      voiceMode: boolean,
    ) => {
      const messages = history
        .filter((turn) => turn.answer.trim() && !turn.error)
        .slice(-10)
        .flatMap((turn) => [
          { role: "user" as const, content: turn.question.slice(0, 4000) },
          { role: "assistant" as const, content: turn.answer.slice(0, 4000) },
        ]);
      messages.push({ role: "user", content: text.slice(0, 4000) });
      while (
        messages.length > 1 &&
        messages.reduce((total, item) => total + item.content.length, 0) > 16000
      )
        messages.splice(0, 2);

      let quotaReceivedFromServer = false;
      const { reply } = await postAuthenticatedAi<{ reply: string }>(
        "/api/mia",
        {
          messages,
          voice: voiceMode,
          ...(!voiceMode ? { stream: true } : {}),
          ...(recipe.current ? { recipe: recipe.current } : {}),
        },
        {
          signal,
          onDelta: voiceMode ? undefined : (partial) => patch(turnId, { answer: partial }),
          onQuota: (nextQuota) => {
            quotaReceivedFromServer = true;
            setQuota(nextQuota);
          },
        },
      );
      if (!reply?.trim()) throw new Error("Mia returned an empty response. Please try again.");
      if (!isPremiumRef.current && !quotaReceivedFromServer) {
        setQuota((prev) => {
          const prevUsed = prev?.freeUsed ?? 0;
          const freeLimit = prev?.freeLimit ?? FREE_MIA_SEARCH_LIMIT;
          const freeUsed = Math.min(freeLimit, prevUsed + 1);
          return {
            isPremium: false,
            trialActive: false,
            freeUsed,
            freeLimit,
            freeRemaining: Math.max(0, freeLimit - freeUsed),
          };
        });
      }
      return reply;
    },
    [patch],
  );

  const ask = useCallback(
    async (
      question: string,
      options: { visual?: boolean; voice?: boolean; signal?: AbortSignal } = {},
    ) => {
      const text = question.trim().slice(0, 4000);
      if (!allowedRef.current) throw new Error("Sign in to use Mia.");
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("You're offline. Check your internet connection and try again.");
      }
      if (!isPremiumRef.current && quotaRef.current && quotaRef.current.freeRemaining <= 0) {
        upgradeModal?.open(MIA_FREE_LIMIT_MESSAGE);
        throw makeFreeLimitError(quotaRef.current);
      }
      if (!text || requestRef.current)
        throw new Error("Mia is still answering. Please wait a moment.");
      const request = new AbortController();
      const abort = () => request.abort();
      options.signal?.addEventListener("abort", abort, { once: true });
      if (options.signal?.aborted) request.abort();
      requestRef.current = request;
      setBusy(true);
      const previous = turnsRef.current;
      const id = safeUuid();
      const visualRequested = Boolean(options.visual && isPremiumRef.current);
      const voiceRequested = Boolean(options.voice);
      updateTurns((items) =>
        [
          ...items,
          {
            id,
            question: text,
            answer: "",
            visualLoading: visualRequested,
            visualRequested,
            voiceRequested,
          },
        ].slice(-50),
      );
      if (visualRequested) {
        void import("@/lib/visual.functions")
          .then(({ generateVisualExplanation }) =>
            generateVisualExplanation({ data: { prompt: text, scenes: 4, narration: true } }),
          )
          .then((visual) => patch(id, { visual, visualLoading: false }))
          .catch((error: unknown) =>
            patch(id, {
              visualLoading: false,
              visualError: error instanceof Error ? error.message : "Visual generation failed",
            }),
          );
      }
      try {
        const reply = await answer(id, text, previous, request.signal, !!options.voice);
        request.signal.throwIfAborted();
        patch(id, { answer: reply });
        void persistCurrentConversation(user?.id, turnsRef.current);
        return reply;
      } catch (error) {
        if (isFreeLimitErr(error)) {
          updateTurns((items) => items.filter((turn) => turn.id !== id));
          const exhausted: MiaQuotaSnapshot = {
            isPremium: false,
            trialActive: false,
            freeUsed: FREE_MIA_SEARCH_LIMIT,
            freeLimit: FREE_MIA_SEARCH_LIMIT,
            freeRemaining: 0,
          };
          setQuota(exhausted);
          upgradeModal?.open(MIA_FREE_LIMIT_MESSAGE);
          throw error;
        }
        patch(id, {
          error: request.signal.aborted
            ? "Response interrupted."
            : error instanceof Error
              ? error.message
              : "Mia is unavailable. Please try again.",
        });
        throw error;
      } finally {
        options.signal?.removeEventListener("abort", abort);
        if (requestRef.current === request) {
          requestRef.current = null;
          setBusy(false);
        }
      }
    },
    [answer, patch, persistCurrentConversation, updateTurns, upgradeModal, user?.id],
  );
  const askRef = useRef(ask);
  askRef.current = ask;

  const retry = useCallback(
    async (id: string) => {
      if (!allowedRef.current || requestRef.current) return;
      const index = turnsRef.current.findIndex((turn) => turn.id === id);
      const turn = turnsRef.current[index];
      if (!turn) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        patch(id, { error: "You're offline. Check your internet connection and try again." });
        return;
      }
      if (!isPremiumRef.current && quotaRef.current && quotaRef.current.freeRemaining <= 0) {
        upgradeModal?.open(MIA_FREE_LIMIT_MESSAGE);
        return;
      }
      const request = new AbortController();
      requestRef.current = request;
      setBusy(true);
      const shouldRetryVisual = Boolean(
        turn.visualRequested && isPremiumRef.current && !turn.visual,
      );
      patch(id, {
        answer: "",
        error: undefined,
        ...(shouldRetryVisual ? { visualLoading: true, visualError: undefined } : {}),
      });
      if (shouldRetryVisual) {
        void import("@/lib/visual.functions")
          .then(({ generateVisualExplanation }) =>
            generateVisualExplanation({
              data: { prompt: turn.question, scenes: 4, narration: true },
            }),
          )
          .then((visual) => patch(id, { visual, visualLoading: false }))
          .catch((error: unknown) =>
            patch(id, {
              visualLoading: false,
              visualError: error instanceof Error ? error.message : "Visual generation failed",
            }),
          );
      }
      try {
        const reply = await answer(
          id,
          turn.question,
          turnsRef.current.slice(0, index),
          request.signal,
          Boolean(turn.voiceRequested),
        );
        patch(id, { answer: reply });
        void persistCurrentConversation(user?.id, turnsRef.current);
      } catch (error) {
        if (isFreeLimitErr(error)) {
          upgradeModal?.open(MIA_FREE_LIMIT_MESSAGE);
          patch(id, { error: MIA_FREE_LIMIT_MESSAGE });
        } else {
          patch(id, {
            error:
              error instanceof Error ? error.message : "Mia could not respond. Please try again.",
          });
        }
      } finally {
        if (requestRef.current === request) {
          requestRef.current = null;
          setBusy(false);
        }
      }
    },
    [answer, patch, persistCurrentConversation, upgradeModal, user?.id],
  );

  const voiceRespond = useRef<(text: string, signal: AbortSignal) => Promise<string>>(
    async () => "",
  );
  voiceRespond.current = async (text, signal) => {
    const current = recipe.current;
    if (
      current &&
      /^(next(?: step)?|previous(?: step)?|repeat(?: (?:the )?step)?|what(?: is|'s) (?:the )?(?:current )?step)[.!]?$/i.test(
        text,
      )
    ) {
      const next = /^next/i.test(text)
        ? Math.min(current.steps.length - 1, current.step + 1)
        : /^previous/i.test(text)
          ? Math.max(0, current.step - 1)
          : current.step;
      recipeStepper.current?.(next);
      recipe.current = { ...current, step: next };
      const reply = `Step ${next + 1} of ${current.steps.length}. ${current.steps[next]}`;
      updateTurns((items) =>
        [...items, { id: safeUuid(), question: text, answer: reply }].slice(-50),
      );
      return reply;
    }
    return askRef.current(text, { voice: true, signal });
  };

  useEffect(() => {
    const instance = new MiaVoiceSession({
      microphone: openMiaMicrophone,
      speak: speakMia,
      changed: setVoice,
      respond: (text, signal) => voiceRespond.current(text, signal),
    });
    session.current = instance;
    const pause = () => instance.stop("paused");
    let disposed = false;
    let removeNativeListener: (() => Promise<void>) | undefined;
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("App")) {
      void import("@capacitor/app")
        .then(({ App }) =>
          App.addListener("appStateChange", ({ isActive }) => {
            if (!isActive) pause();
          }),
        )
        .then((listener) => {
          if (disposed) void listener.remove();
          else {
            nativeLifecycleReady.current = true;
            removeNativeListener = () => listener.remove();
          }
        })
        .catch(() =>
          instance.stop("error", "Couldn't monitor app activity. Enable hands-free again."),
        );
    }
    const visibility = () => {
      if (document.visibilityState !== "visible") pause();
    };
    const offline = () =>
      instance.stop("paused", "You're offline. Reconnect and resume hands-free.");
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pause);
    window.addEventListener("offline", offline);
    return () => {
      disposed = true;
      nativeLifecycleReady.current = !Capacitor.isNativePlatform();
      void removeNativeListener?.();
      instance.stop();
      requestRef.current?.abort();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pause);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    if (!allowed) {
      session.current?.stop();
      requestRef.current?.abort();
    }
  }, [allowed]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota, isPremium]);

  // Clear state cleanly on user change and restore saved active conversation for the signed-in user.
  useEffect(() => {
    session.current?.stop();
    requestRef.current?.abort();
    activeIdRef.current = null;
    activeCreatedAtRef.current = undefined;
    setActiveConversationId(null);
    setConversations([]);
    updateTurns(() => []);
    recipe.current = null;

    const uid = user?.id;
    if (!uid || !allowed || import.meta.env?.MODE === "test") return;

    let cancelled = false;
    (async () => {
      try {
        const { listMiaConversations, loadMiaConversation } =
          await import("@/lib/mia-conversations");
        let lastId: string | null = null;
        if (typeof window !== "undefined") {
          try {
            lastId = window.localStorage.getItem(lastConversationStorageKey(uid));
          } catch {
            lastId = null;
          }
        }
        if (lastId) {
          const loaded = await loadMiaConversation(uid, lastId);
          if (!cancelled && loaded && turnsRef.current.length === 0) {
            activeIdRef.current = loaded.id;
            activeCreatedAtRef.current = loaded.created_at;
            setActiveConversationId(loaded.id);
            updateTurns(() => loaded.turns ?? []);
          }
        }
        const list = await listMiaConversations(uid);
        if (!cancelled) setConversations(list);
      } catch {
        /* non-blocking */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, allowed, updateTurns]);

  return (
    <MiaContext.Provider
      value={{
        turns,
        busy,
        activeConversationId,
        conversations,
        historyLoading,
        quota: isPremium
          ? null
          : (quota ?? {
              isPremium: false,
              trialActive: false,
              freeUsed: 0,
              freeLimit: FREE_MIA_SEARCH_LIMIT,
              freeRemaining: FREE_MIA_SEARCH_LIMIT,
            }),
        refreshQuota,
        ask,
        retry,
        refreshHistory,
        openConversation,
        newConversation,
        removeConversation,
        voice,
        startVoice: () => {
          if (!allowedRef.current) return;
          if (!isPremiumRef.current && quotaRef.current && quotaRef.current.freeRemaining <= 0) {
            upgradeModal?.open(MIA_FREE_LIMIT_MESSAGE);
            return;
          }
          if (!nativeLifecycleReady.current) {
            session.current?.stop(
              "error",
              "Update or reopen MealMate to enable safe foreground listening.",
            );
            return;
          }
          if (!navigator.onLine || document.visibilityState !== "visible") {
            session.current?.stop(
              "paused",
              "Keep MealMate active and connect to resume hands-free.",
            );
            return;
          }
          void session.current?.start();
        },
        stopVoice: () => session.current?.stop(),
        endConversation: () => session.current?.endConversation(),
        setRecipe,
      }}
    >
      {children}
    </MiaContext.Provider>
  );
}
