import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";

const updateAccountSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
  photoURL: z.string().max(450_000).nullable().optional(),
  locale: z.string().min(2).max(12).optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
});

export type AccountSettingsPayload = {
  displayName: string | null;
  photoURL: string | null;
  locale: string | null;
  currency: string | null;
};

export const getMyAccountSettings = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<AccountSettingsPayload | null> => {
    const { data, error } = await context.firebase
      .from("profiles")
      .select("displayName, photoURL, locale, currency")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as {
      displayName?: string | null;
      photoURL?: string | null;
      locale?: string | null;
      currency?: string | null;
    };
    return {
      displayName: row.displayName ?? null,
      photoURL: row.photoURL ?? null,
      locale: row.locale ?? null,
      currency: row.currency ?? null,
    };
  });

export const saveMyAccountSettings = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((v: unknown) => updateAccountSchema.parse(v))
  .handler(async ({ data, context }) => {
    const nowIso = new Date().toISOString();
    const patch: Record<string, unknown> = {
      id: context.userId,
      updatedAt: nowIso,
      updated_at: nowIso,
    };
    if (data.displayName !== undefined) {
      const cleanName = data.displayName?.trim() || "";
      patch["displayName"] = cleanName;
      patch["display_name"] = cleanName;
      patch["name"] = cleanName;
    }
    if (data.photoURL !== undefined) {
      patch["photoURL"] = data.photoURL ?? "";
    }
    if (data.locale !== undefined) {
      patch["locale"] = data.locale;
    }
    if (data.currency !== undefined) {
      patch["currency"] = data.currency;
    }

    const { error } = await context.firebase.from("profiles").upsert(patch, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
