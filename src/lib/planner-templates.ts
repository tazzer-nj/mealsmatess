import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PlannerTemplateSlot = {
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  meal_type: string;
  recipe_id: string | null;
  custom_name: string | null;
  servings?: number;
};

export type PlannerTemplate = {
  id: string;
  user_id: string;
  name: string;
  slots: PlannerTemplateSlot[];
  created_at: string;
  updated_at: string;
};

export async function listPlannerTemplates(userId: string): Promise<PlannerTemplate[]> {
  const snap = await getDocs(collection(db, "users", userId, "plannerTemplates"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PlannerTemplate)
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
}

export async function savePlannerTemplate(params: {
  userId: string;
  name: string;
  slots: PlannerTemplateSlot[];
}): Promise<PlannerTemplate> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const payload: PlannerTemplate = {
    id,
    user_id: params.userId,
    name: params.name.trim().slice(0, 120),
    slots: params.slots.slice(0, 40),
    created_at: now,
    updated_at: now,
  };
  await setDoc(doc(db, "users", params.userId, "plannerTemplates", id), payload);
  return payload;
}

export async function deletePlannerTemplate(userId: string, templateId: string) {
  await deleteDoc(doc(db, "users", userId, "plannerTemplates", templateId));
}
