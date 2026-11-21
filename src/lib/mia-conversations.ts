import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MiaRecipe, MiaTurn } from "@/hooks/use-mia";

export type SavedMiaConversation = {
  id: string;
  user_id: string;
  title: string;
  turns: MiaTurn[];
  recipeContext: MiaRecipe | null;
  created_at: string;
  updated_at: string;
};

function sanitizeTurn(turn: MiaTurn) {
  return {
    id: turn.id,
    question: turn.question.slice(0, 4000),
    answer: turn.answer.slice(0, 8000),
    ...(turn.error ? { error: turn.error.slice(0, 400) } : {}),
  };
}

function deriveTitle(turns: MiaTurn[]): string {
  const firstQuestion = turns.find((t) => t.question.trim())?.question.trim();
  if (!firstQuestion) return "Kitchen chat";
  return firstQuestion.length > 64 ? `${firstQuestion.slice(0, 61)}…` : firstQuestion;
}

export async function listMiaConversations(userId: string): Promise<SavedMiaConversation[]> {
  const snap = await getDocs(collection(db, "users", userId, "conversations"));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SavedMiaConversation);
  return items.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")).slice(0, 30);
}

export async function loadMiaConversation(
  userId: string,
  conversationId: string,
): Promise<SavedMiaConversation | null> {
  const snap = await getDoc(doc(db, "users", userId, "conversations", conversationId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SavedMiaConversation;
}

export async function saveMiaConversation(params: {
  userId: string;
  conversationId: string;
  turns: MiaTurn[];
  recipeContext?: MiaRecipe | null;
  createdAt?: string;
}): Promise<SavedMiaConversation> {
  const now = new Date().toISOString();
  const trimmedTurns = params.turns
    .filter((t) => t.question.trim())
    .slice(-50)
    .map(sanitizeTurn);

  const payload: SavedMiaConversation = {
    id: params.conversationId,
    user_id: params.userId,
    title: deriveTitle(params.turns),
    turns: trimmedTurns,
    recipeContext: params.recipeContext ?? null,
    created_at: params.createdAt ?? now,
    updated_at: now,
  };

  await setDoc(doc(db, "users", params.userId, "conversations", params.conversationId), payload);
  return payload;
}

export async function deleteMiaConversation(userId: string, conversationId: string) {
  await deleteDoc(doc(db, "users", userId, "conversations", conversationId));
}
