import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
import type { AnnouncementInput } from "@/lib/notifications.types";

async function assertAdmin(userId: string) {
  const { firebaseAdmin } = await loadFirebaseAdmin();
  const { data, error } = await firebaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Response("Forbidden", { status: 403 });
}

async function setNotificationReadStatus(userId: string, id: string, read: boolean) {
  const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
  const db = getFirebaseAdminFirestore();
  const notificationRef = db.collection("users").doc(userId).collection("notifications").doc(id);
  await db.runTransaction(async (transaction) => {
    const notification = await transaction.get(notificationRef);
    if (!notification.exists) throw new Response("Notification not found", { status: 404 });
    const wasRead = notification.get("readAt") != null;
    if (wasRead === read) return;
    const announcementId = notification.get("announcementId");
    const announcementRef =
      typeof announcementId === "string"
        ? db.collection("admin_announcements").doc(announcementId)
        : null;
    const announcement = announcementRef ? await transaction.get(announcementRef) : null;
    const currentCount = announcement?.exists
      ? Math.max(0, Number(announcement.get("readCount") ?? 0))
      : 0;
    transaction.update(notificationRef, { readAt: read ? new Date().toISOString() : null });
    if (announcementRef && announcement?.exists) {
      transaction.update(announcementRef, {
        readCount: Math.max(0, currentCount + (read ? 1 : -1)),
      });
    }
  });
  return { ok: true };
}

const firestoreDocId = z.string().trim().min(1).max(128);

const announcementInput = z.object({
  id: firestoreDocId.optional(),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(2000),
  imageUrl: z
    .string()
    .url()
    .max(2048)
    .refine((value) => value.startsWith("https://"), "Image URL must use HTTPS.")
    .optional()
    .default("")
    .transform((value) => value || null),
  category: z.enum(["recipes", "healthy_eating", "dining", "mia", "features", "general"]),
  audience: z.enum(["all_consumers", "healthy_interest"]),
  destination: z.enum(["/", "/recipes", "/restaurants", "/chat", "/planner", "/profile"]),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional().default(null),
  status: z.enum(["draft", "scheduled"]),
});

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const collection = getFirebaseAdminFirestore()
        .collection("users")
        .doc(context.userId)
        .collection("notifications");
      const [items, unread] = await Promise.all([
        collection.orderBy("createdAt", "desc").limit(100).get(),
        collection.where("readAt", "==", null).count().get(),
      ]);
      return {
        items: items.docs.map((document) => ({ id: document.id, ...document.data() })),
        unreadCount: unread.data().count,
      };
    } catch (error) {
      if (error instanceof Error && /Firebase Admin is not configured/i.test(error.message)) {
        return { items: [], unreadCount: 0 };
      }
      throw error;
    }
  });

export const getMyUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const collection = getFirebaseAdminFirestore()
        .collection("users")
        .doc(context.userId)
        .collection("notifications");
      const unread = await collection.where("readAt", "==", null).count().get();
      return { unreadCount: unread.data().count };
    } catch (error) {
      if (error instanceof Error && /Firebase Admin is not configured/i.test(error.message)) {
        return { unreadCount: 0 };
      }
      throw error;
    }
  });

export const setMyNotificationReadStatus = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) => z.object({ id: firestoreDocId, read: z.boolean() }).parse(value))
  .handler(async ({ data, context }) =>
    setNotificationReadStatus(context.userId, data.id, data.read),
  );

export const markAllMyNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const collection = getFirebaseAdminFirestore()
      .collection("users")
      .doc(context.userId)
      .collection("notifications");
    let updated = 0;
    while (true) {
      const unread = await collection.where("readAt", "==", null).limit(100).get();
      if (unread.empty) break;
      for (const notification of unread.docs) {
        await setNotificationReadStatus(context.userId, notification.id, true);
        updated += 1;
      }
    }
    return { updated };
  });

export const getMyNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    const defaults = {
      productUpdatesEnabled: true,
      pushEnabled: false,
      mealReminders: true,
      recipeAlerts: true,
      planningReminders: true,
      promoAlerts: false,
      pantryExpiryReminders: true,
      weeklyInspiration: true,
      mealPlanSummaries: true,
      challengeReminders: false,
      frequency: "weekly" as const,
      analyticsConsent: true,
    };
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const ref = getFirebaseAdminFirestore()
        .collection("users")
        .doc(context.userId)
        .collection("notification_settings")
        .doc("preferences");
      const snapshot = await ref.get();
      const data = snapshot.data() ?? {};
      const freq =
        data["frequency"] === "daily" ||
        data["frequency"] === "weekly" ||
        data["frequency"] === "essential_only"
          ? data["frequency"]
          : ("weekly" as const);
      return {
        productUpdatesEnabled: data["productUpdatesEnabled"] !== false,
        pushEnabled: data["pushEnabled"] === true,
        mealReminders: data["mealReminders"] !== false,
        recipeAlerts: data["recipeAlerts"] !== false,
        planningReminders: data["planningReminders"] !== false,
        promoAlerts: data["promoAlerts"] === true,
        pantryExpiryReminders: data["pantryExpiryReminders"] !== false,
        weeklyInspiration: data["weeklyInspiration"] !== false,
        mealPlanSummaries: data["mealPlanSummaries"] !== false,
        challengeReminders: data["challengeReminders"] === true,
        frequency: freq,
        analyticsConsent: data["analyticsConsent"] !== false,
      };
    } catch (error) {
      if (error instanceof Error && /Firebase Admin is not configured/i.test(error.message)) {
        return defaults;
      }
      throw error;
    }
  });

export const saveMyNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        productUpdatesEnabled: z.boolean(),
        pushEnabled: z.boolean(),
        mealReminders: z.boolean().optional(),
        recipeAlerts: z.boolean().optional(),
        planningReminders: z.boolean().optional(),
        promoAlerts: z.boolean().optional(),
        pantryExpiryReminders: z.boolean().optional(),
        weeklyInspiration: z.boolean().optional(),
        mealPlanSummaries: z.boolean().optional(),
        challengeReminders: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly", "essential_only"]).optional(),
        analyticsConsent: z.boolean().optional(),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    if (data.pushEnabled && !data.productUpdatesEnabled) {
      throw new Error("Enable MealMate updates before opting into push notifications.");
    }
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const settings = db
      .collection("users")
      .doc(context.userId)
      .collection("notification_settings")
      .doc("preferences");
    const previous = await settings.get();
    const previousPushEnabled = previous.get("pushEnabled") === true;
    const pushEnabled = data.productUpdatesEnabled && data.pushEnabled;
    const consentChange =
      pushEnabled === previousPushEnabled
        ? {}
        : pushEnabled
          ? { pushConsentAt: new Date().toISOString() }
          : { pushConsentRevokedAt: new Date().toISOString() };
    await settings.set(
      {
        productUpdatesEnabled: data.productUpdatesEnabled,
        pushEnabled,
        ...(typeof data.mealReminders === "boolean" ? { mealReminders: data.mealReminders } : {}),
        ...(typeof data.recipeAlerts === "boolean" ? { recipeAlerts: data.recipeAlerts } : {}),
        ...(typeof data.planningReminders === "boolean"
          ? { planningReminders: data.planningReminders }
          : {}),
        ...(typeof data.promoAlerts === "boolean" ? { promoAlerts: data.promoAlerts } : {}),
        ...(typeof data.pantryExpiryReminders === "boolean"
          ? { pantryExpiryReminders: data.pantryExpiryReminders }
          : {}),
        ...(typeof data.weeklyInspiration === "boolean"
          ? { weeklyInspiration: data.weeklyInspiration }
          : {}),
        ...(typeof data.mealPlanSummaries === "boolean"
          ? { mealPlanSummaries: data.mealPlanSummaries }
          : {}),
        ...(typeof data.challengeReminders === "boolean"
          ? { challengeReminders: data.challengeReminders }
          : {}),
        ...(data.frequency ? { frequency: data.frequency } : {}),
        ...(typeof data.analyticsConsent === "boolean"
          ? { analyticsConsent: data.analyticsConsent }
          : {}),
        updatedAt: new Date().toISOString(),
        ...consentChange,
      },
      { merge: true },
    );
    if (!data.productUpdatesEnabled || !pushEnabled) {
      const tokens = await db
        .collection("users")
        .doc(context.userId)
        .collection("push_tokens")
        .get();
      for (let offset = 0; offset < tokens.docs.length; offset += 400) {
        const batch = db.batch();
        tokens.docs.slice(offset, offset + 400).forEach((token) => batch.delete(token.ref));
        await batch.commit();
      }
    }
    return {
      productUpdatesEnabled: data.productUpdatesEnabled,
      pushEnabled,
      mealReminders: data.mealReminders ?? true,
      recipeAlerts: data.recipeAlerts ?? true,
      planningReminders: data.planningReminders ?? true,
      promoAlerts: data.promoAlerts ?? false,
      pantryExpiryReminders: data.pantryExpiryReminders ?? true,
      weeklyInspiration: data.weeklyInspiration ?? true,
      mealPlanSummaries: data.mealPlanSummaries ?? true,
      challengeReminders: data.challengeReminders ?? false,
      frequency: data.frequency ?? "weekly",
      analyticsConsent: data.analyticsConsent ?? true,
    };
  });

export const getTrialReminderPreference = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      const snap = await getFirebaseAdminFirestore()
        .collection("users")
        .doc(context.userId)
        .collection("notification_settings")
        .doc("trial_reminder")
        .get();
      const data = snap.data() ?? {};
      return {
        enabled: data["enabled"] === true,
        planId: typeof data["planId"] === "string" ? data["planId"] : null,
        remindAt: typeof data["remindAt"] === "string" ? data["remindAt"] : null,
        channel:
          data["channel"] === "push" || data["channel"] === "in_app" || data["channel"] === "none"
            ? (data["channel"] as "push" | "in_app" | "none")
            : null,
      };
    } catch (error) {
      if (error instanceof Error && /Firebase Admin is not configured/i.test(error.message)) {
        return { enabled: false, planId: null, remindAt: null, channel: null };
      }
      throw error;
    }
  });

export const saveTrialReminderPreference = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) =>
    z
      .object({
        enabled: z.boolean(),
        planId: z.string().max(120).nullable().optional(),
        trialDays: z.number().int().min(0).max(90).optional(),
        channel: z.enum(["push", "in_app", "none"]).optional(),
      })
      .parse(value),
  )
  .handler(async ({ data, context }) => {
    const trialDays = data.trialDays ?? 0;
    const remindAt =
      data.enabled && trialDays > 0
        ? new Date(Date.now() + Math.max(1, trialDays - 1) * 24 * 60 * 60 * 1000).toISOString()
        : null;
    const channel = data.enabled ? (data.channel ?? "in_app") : "none";

    try {
      const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
      await getFirebaseAdminFirestore()
        .collection("users")
        .doc(context.userId)
        .collection("notification_settings")
        .doc("trial_reminder")
        .set(
          {
            enabled: data.enabled,
            planId: data.planId ?? null,
            trialDays,
            channel,
            remindAt,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
    } catch (error) {
      if (!(error instanceof Error && /Firebase Admin is not configured/i.test(error.message))) {
        throw error;
      }
    }

    return {
      enabled: data.enabled,
      planId: data.planId ?? null,
      remindAt,
      channel,
    };
  });

export const registerMyPushToken = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) => z.object({ token: z.string().min(40).max(4096) }).parse(value))
  .handler(async ({ data, context }) => {
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const db = getFirebaseAdminFirestore();
    const userRef = db.collection("users").doc(context.userId);
    const settings = await userRef.collection("notification_settings").doc("preferences").get();
    if (settings.get("pushEnabled") !== true || settings.get("productUpdatesEnabled") === false) {
      throw new Response("Push consent is required before registering a device.", { status: 403 });
    }
    const { pushTokenId } = await import("@/server/notification-delivery");
    const tokenRef = userRef.collection("push_tokens").doc(pushTokenId(data.token));
    const existingTokens = await userRef.collection("push_tokens").get();
    if (
      existingTokens.size >= 5 &&
      !existingTokens.docs.some((document) => document.id === tokenRef.id)
    ) {
      throw new Response("This account already has the maximum number of registered devices.", {
        status: 429,
      });
    }
    const now = new Date().toISOString();
    await tokenRef.set(
      { token: data.token, enabled: true, createdAt: now, updatedAt: now },
      { merge: true },
    );
    return { registered: true };
  });

export const previewAnnouncementAudience = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) =>
    z.object({ audience: z.enum(["all_consumers", "healthy_interest"]) }).parse(value),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { previewAudience } = await import("@/server/notification-delivery");
    return previewAudience(data.audience);
  });

export const listAdminAnnouncements = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
    const snapshot = await getFirebaseAdminFirestore()
      .collection("admin_announcements")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
  });

export const saveAdminAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) => announcementInput.parse(value))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { saveAnnouncement } = await import("@/server/notification-delivery");
    return saveAnnouncement(data as AnnouncementInput, context.userId);
  });

export const publishAdminAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) => z.object({ id: firestoreDocId }).parse(value))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { processAnnouncementBatch } = await import("@/server/notification-delivery");
    return processAnnouncementBatch(data.id, { allowImmediate: true });
  });

export const cancelAdminAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireFirebaseAuth])
  .validator((value: unknown) => z.object({ id: firestoreDocId }).parse(value))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { cancelScheduledAnnouncement } = await import("@/server/notification-delivery");
    return cancelScheduledAnnouncement(data.id);
  });
