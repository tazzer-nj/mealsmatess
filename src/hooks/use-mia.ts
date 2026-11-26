import { createContext, useContext } from "react";
import type { VisualExplanation } from "@/lib/visual.functions";
import type { MiaVoiceSnapshot } from "@/lib/mia/voice-session";
import type { MiaQuotaSnapshot } from "@/lib/freemium";
import type { MiaActionEvent, MiaMood, MiaReaction } from "@/lib/mia-companion";

export type MiaRecipe = { name: string; steps: string[]; step: number };
export type MiaTurn = {
  id: string;
  question: string;
  answer: string;
  visual?: VisualExplanation;
  error?: string | undefined;
  visualLoading?: boolean;
  visualError?: string;
  visualRequested?: boolean;
  voiceRequested?: boolean;
};
export type MiaConversationSummary = {
  id: string;
  title: string;
  turns?: MiaTurn[];
  created_at?: string;
  updated_at?: string;
};
export type MiaCompanionToastState = MiaReaction & {
  event: MiaActionEvent;
  timestamp: number;
};
export type MiaContextValue = {
  turns: MiaTurn[];
  busy: boolean;
  mood: MiaMood;
  setMood: (mood: MiaMood) => void;
  companionReaction: MiaCompanionToastState | null;
  reactToAction: (
    event: MiaActionEvent,
    context?: {
      recipeName?: string | null;
      expiringCount?: number;
      pantryCount?: number;
      completedCount?: number;
      goalTarget?: number;
      collectionName?: string | null;
      silent?: boolean;
    },
  ) => void;
  clearCompanionReaction: () => void;
  activeConversationId: string | null;
  conversations: MiaConversationSummary[];
  historyLoading: boolean;
  quota: MiaQuotaSnapshot | null;
  refreshQuota: () => Promise<void>;
  ask: (
    text: string,
    options?: { visual?: boolean; voice?: boolean; signal?: AbortSignal },
  ) => Promise<string>;
  retry: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  newConversation: () => void;
  removeConversation: (id: string) => Promise<void>;
  voice: MiaVoiceSnapshot;
  startVoice: () => void;
  stopVoice: () => void;
  endConversation: () => void;
  setRecipe: (recipe: MiaRecipe | null, onStep?: (step: number) => void) => void;
};
export const MiaContext = createContext<MiaContextValue | null>(null);
export function useMia() {
  const value = useContext(MiaContext);
  if (!value) throw new Error("useMia requires MiaProvider");
  return value;
}
export function useOptionalMia() {
  return useContext(MiaContext);
}
