import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";

const notificationsPrefsSchema = z
  .object({
    mealReminders: z.boolean().optional(),
    recipeAlerts: z.boolean().optional(),
    planningReminders: z.boolean().optional(),
    promoAlerts: z.boolean().optional(),
  })
  .optional();

const updateAccountSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
  photoURL: z.string().max(450_000).nullable().optional(),
  locale: z.string().min(2).max(12).optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  font: z.enum(["editorial", "jakarta", "outfit", "dm", "fraunces"]).optional(),
  units: z.enum(["metric", "imperial"]).optional(),
  speechSpeed: z.string().max(10).optional(),
  voiceResponses: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  notifications: notificationsPrefsSchema,
});

export type AccountNotificationSettings = {
  mealReminders: boolean;
  recipeAlerts: boolean;
  planningReminders: boolean;
  promoAlerts: boolean;
};

export type AccountSettingsPayload = {
  displayName: string | null;
  photoURL: string | null;
  locale: string | null;
  currency: string | null;
  font: "editorial" | "jakarta" | "outfit" | "dm" | "fraunces" | null;
  units: "metric" | "imperial" | null;
  speechSpeed: string | null;
  voiceResponses: boolean | null;
  isMuted: boolean | null;
  notifications: AccountNotificationSettings | null;
};

export const getMyAccountSettings = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<AccountSettingsPayload | null> => {
    const { data, error } = await context.firebase
      .from("profiles")
      .select(
        "displayName, photoURL, locale, currency, app_font, units, speech_speed, voice_responses, voice_muted, notification_settings",
      )
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as {
      displayName?: string | null;
      photoURL?: string | null;
      locale?: string | null;
      currency?: string | null;
      app_font?: string | null;
      units?: string | null;
      speech_speed?: string | null;
      voice_responses?: boolean | null;
      voice_muted?: boolean | null;
      notification_settings?: Partial<AccountNotificationSettings> | null;
    };
    const font =
      row.app_font === "editorial" ||
      row.app_font === "jakarta" ||
      row.app_font === "outfit" ||
      row.app_font === "dm" ||
      row.app_font === "fraunces"
        ? row.app_font
        : null;
    const units = row.units === "metric" || row.units === "imperial" ? row.units : null;
    const notif =
      row.notification_settings && typeof row.notification_settings === "object"
        ? {
            mealReminders: row.notification_settings.mealReminders !== false,
            recipeAlerts: row.notification_settings.recipeAlerts !== false,
            planningReminders: row.notification_settings.planningReminders !== false,
            promoAlerts: row.notification_settings.promoAlerts === true,
          }
        : null;
    return {
      displayName: row.displayName ?? null,
      photoURL: row.photoURL ?? null,
      locale: row.locale ?? null,
      currency: row.currency ?? null,
      font,
      units,
      speechSpeed: typeof row.speech_speed === "string" ? row.speech_speed : null,
      voiceResponses: typeof row.voice_responses === "boolean" ? row.voice_responses : null,
      isMuted: typeof row.voice_muted === "boolean" ? row.voice_muted : null,
      notifications: notif,
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
    if (data.font !== undefined) {
      patch["app_font"] = data.font;
    }
    if (data.units !== undefined) {
      patch["units"] = data.units;
    }
    if (data.speechSpeed !== undefined) {
      patch["speech_speed"] = data.speechSpeed;
    }
    if (data.voiceResponses !== undefined) {
      patch["voice_responses"] = data.voiceResponses;
    }
    if (data.isMuted !== undefined) {
      patch["voice_muted"] = data.isMuted;
    }
    if (data.notifications !== undefined) {
      const { data: existing } = await context.firebase
        .from("profiles")
        .select("notification_settings")
        .eq("id", context.userId)
        .maybeSingle();
      const prev =
        (existing as { notification_settings?: Record<string, unknown> } | null)
          ?.notification_settings ?? {};
      patch["notification_settings"] = { ...prev, ...data.notifications };
    }

    const { error } = await context.firebase.from("profiles").upsert(patch, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
