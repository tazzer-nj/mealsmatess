import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, n as booleanType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.functions-CXMcFu6Q.js
async function assertAdmin(userId) {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data, error } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	if (error || !data) throw new Response("Forbidden", { status: 403 });
}
async function setNotificationReadStatus(userId, id, read) {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const db = getFirebaseAdminFirestore();
	const notificationRef = db.collection("users").doc(userId).collection("notifications").doc(id);
	await db.runTransaction(async (transaction) => {
		const notification = await transaction.get(notificationRef);
		if (!notification.exists) throw new Response("Notification not found", { status: 404 });
		if (notification.get("readAt") != null === read) return;
		const announcementId = notification.get("announcementId");
		const announcementRef = typeof announcementId === "string" ? db.collection("admin_announcements").doc(announcementId) : null;
		const announcement = announcementRef ? await transaction.get(announcementRef) : null;
		const currentCount = announcement?.exists ? Math.max(0, Number(announcement.get("readCount") ?? 0)) : 0;
		transaction.update(notificationRef, { readAt: read ? (/* @__PURE__ */ new Date()).toISOString() : null });
		if (announcementRef && announcement?.exists) transaction.update(announcementRef, { readCount: Math.max(0, currentCount + (read ? 1 : -1)) });
	});
	return { ok: true };
}
var announcementInput = objectType({
	id: stringType().uuid().optional(),
	title: stringType().trim().min(2).max(120),
	body: stringType().trim().min(2).max(2e3),
	imageUrl: stringType().url().max(2048).refine((value) => value.startsWith("https://"), "Image URL must use HTTPS.").optional().default("").transform((value) => value || null),
	category: enumType([
		"recipes",
		"healthy_eating",
		"dining",
		"mia",
		"features",
		"general"
	]),
	audience: enumType(["all_consumers", "healthy_interest"]),
	destination: enumType([
		"/",
		"/recipes",
		"/restaurants",
		"/chat",
		"/planner",
		"/profile"
	]),
	scheduledAt: stringType().datetime({ offset: true }).nullable().optional().default(null),
	status: enumType(["draft", "scheduled"])
});
var listMyNotifications_createServerFn_handler = createServerRpc({
	id: "acdc1590236f0839542f983a97a7193af437f8125c921a77e6feea3b73ccec73",
	name: "listMyNotifications",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => listMyNotifications.__executeServer(opts));
var listMyNotifications = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(listMyNotifications_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const collection = getFirebaseAdminFirestore().collection("users").doc(context.userId).collection("notifications");
	const [items, unread] = await Promise.all([collection.orderBy("createdAt", "desc").limit(100).get(), collection.where("readAt", "==", null).count().get()]);
	return {
		items: items.docs.map((document) => ({
			id: document.id,
			...document.data()
		})),
		unreadCount: unread.data().count
	};
});
var getMyUnreadNotificationCount_createServerFn_handler = createServerRpc({
	id: "b98e74aee1dd58ba31c8b83983a48bd598dc27e2a2003027fb24c73ad27e2175",
	name: "getMyUnreadNotificationCount",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => getMyUnreadNotificationCount.__executeServer(opts));
var getMyUnreadNotificationCount = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyUnreadNotificationCount_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	return { unreadCount: (await getFirebaseAdminFirestore().collection("users").doc(context.userId).collection("notifications").where("readAt", "==", null).count().get()).data().count };
});
var setMyNotificationReadStatus_createServerFn_handler = createServerRpc({
	id: "9e59dc65f44f65df9e5b83bca2bdde4a2f78697fe32e3e62493dcb745e47cfd9",
	name: "setMyNotificationReadStatus",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => setMyNotificationReadStatus.__executeServer(opts));
var setMyNotificationReadStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({
	id: stringType().uuid(),
	read: booleanType()
}).parse(value)).handler(setMyNotificationReadStatus_createServerFn_handler, async ({ data, context }) => setNotificationReadStatus(context.userId, data.id, data.read));
var markAllMyNotificationsRead_createServerFn_handler = createServerRpc({
	id: "3f147242b86d83f91deccdd2a565940173497f2281e6e143c7a4b2ba437dcd01",
	name: "markAllMyNotificationsRead",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => markAllMyNotificationsRead.__executeServer(opts));
var markAllMyNotificationsRead = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(markAllMyNotificationsRead_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const collection = getFirebaseAdminFirestore().collection("users").doc(context.userId).collection("notifications");
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
var getMyNotificationPreferences_createServerFn_handler = createServerRpc({
	id: "bb23b49c00fd28f3992417a3ef8cacbe388fe736d4e9fe21b7351a7205343c94",
	name: "getMyNotificationPreferences",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => getMyNotificationPreferences.__executeServer(opts));
var getMyNotificationPreferences = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyNotificationPreferences_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const data = (await getFirebaseAdminFirestore().collection("users").doc(context.userId).collection("notification_settings").doc("preferences").get()).data() ?? {};
	return {
		productUpdatesEnabled: data["productUpdatesEnabled"] !== false,
		pushEnabled: data["pushEnabled"] === true
	};
});
var saveMyNotificationPreferences_createServerFn_handler = createServerRpc({
	id: "4e8fda09e056970b58fe8f3fbe4f908e328fa448cd2b772f5b326b6ceed9534e",
	name: "saveMyNotificationPreferences",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => saveMyNotificationPreferences.__executeServer(opts));
var saveMyNotificationPreferences = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({
	productUpdatesEnabled: booleanType(),
	pushEnabled: booleanType()
}).parse(value)).handler(saveMyNotificationPreferences_createServerFn_handler, async ({ data, context }) => {
	if (data.pushEnabled && !data.productUpdatesEnabled) throw new Error("Enable MealMate updates before opting into push notifications.");
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const db = getFirebaseAdminFirestore();
	const settings = db.collection("users").doc(context.userId).collection("notification_settings").doc("preferences");
	const previousPushEnabled = (await settings.get()).get("pushEnabled") === true;
	const pushEnabled = data.productUpdatesEnabled && data.pushEnabled;
	const consentChange = pushEnabled === previousPushEnabled ? {} : pushEnabled ? { pushConsentAt: (/* @__PURE__ */ new Date()).toISOString() } : { pushConsentRevokedAt: (/* @__PURE__ */ new Date()).toISOString() };
	await settings.set({
		productUpdatesEnabled: data.productUpdatesEnabled,
		pushEnabled,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		...consentChange
	}, { merge: true });
	if (!data.productUpdatesEnabled || !pushEnabled) {
		const tokens = await db.collection("users").doc(context.userId).collection("push_tokens").get();
		for (let offset = 0; offset < tokens.docs.length; offset += 400) {
			const batch = db.batch();
			tokens.docs.slice(offset, offset + 400).forEach((token) => batch.delete(token.ref));
			await batch.commit();
		}
	}
	return {
		productUpdatesEnabled: data.productUpdatesEnabled,
		pushEnabled
	};
});
var registerMyPushToken_createServerFn_handler = createServerRpc({
	id: "0b7c9b09b63946933065eeba53a5673780ca7fc7ee300506e2230534d1c2e57c",
	name: "registerMyPushToken",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => registerMyPushToken.__executeServer(opts));
var registerMyPushToken = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ token: stringType().min(40).max(4096) }).parse(value)).handler(registerMyPushToken_createServerFn_handler, async ({ data, context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	const userRef = getFirebaseAdminFirestore().collection("users").doc(context.userId);
	const settings = await userRef.collection("notification_settings").doc("preferences").get();
	if (settings.get("pushEnabled") !== true || settings.get("productUpdatesEnabled") === false) throw new Response("Push consent is required before registering a device.", { status: 403 });
	const { pushTokenId } = await import("./notification-delivery-RCzH-WCl.mjs");
	const tokenRef = userRef.collection("push_tokens").doc(pushTokenId(data.token));
	const existingTokens = await userRef.collection("push_tokens").get();
	if (existingTokens.size >= 5 && !existingTokens.docs.some((document) => document.id === tokenRef.id)) throw new Response("This account already has the maximum number of registered devices.", { status: 429 });
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await tokenRef.set({
		token: data.token,
		enabled: true,
		createdAt: now,
		updatedAt: now
	}, { merge: true });
	return { registered: true };
});
var previewAnnouncementAudience_createServerFn_handler = createServerRpc({
	id: "83207fcac4dad8db78750b8772851057c4f9127fac17c4e08f228a1408322702",
	name: "previewAnnouncementAudience",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => previewAnnouncementAudience.__executeServer(opts));
var previewAnnouncementAudience = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ audience: enumType(["all_consumers", "healthy_interest"]) }).parse(value)).handler(previewAnnouncementAudience_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { previewAudience } = await import("./notification-delivery-RCzH-WCl.mjs");
	return previewAudience(data.audience);
});
var listAdminAnnouncements_createServerFn_handler = createServerRpc({
	id: "d91a939ef75ed76f211c7601084041a0e58250a521ab640fd9a758825c5e6a97",
	name: "listAdminAnnouncements",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => listAdminAnnouncements.__executeServer(opts));
var listAdminAnnouncements = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(listAdminAnnouncements_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.userId);
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	return (await getFirebaseAdminFirestore().collection("admin_announcements").orderBy("createdAt", "desc").limit(100).get()).docs.map((document) => ({
		id: document.id,
		...document.data()
	}));
});
var saveAdminAnnouncement_createServerFn_handler = createServerRpc({
	id: "3bc186123a1ef99913165374796fca340d0de8dfb2d24fe5910ed5c2b6f6c94f",
	name: "saveAdminAnnouncement",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => saveAdminAnnouncement.__executeServer(opts));
var saveAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => announcementInput.parse(value)).handler(saveAdminAnnouncement_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { saveAnnouncement } = await import("./notification-delivery-RCzH-WCl.mjs");
	return saveAnnouncement(data, context.userId);
});
var publishAdminAnnouncement_createServerFn_handler = createServerRpc({
	id: "c6b23755310203a6cc89a2aadebf52d3b4fba4cdbcee99b07e3f7d77b70d349d",
	name: "publishAdminAnnouncement",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => publishAdminAnnouncement.__executeServer(opts));
var publishAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ id: stringType().uuid() }).parse(value)).handler(publishAdminAnnouncement_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { processAnnouncementBatch } = await import("./notification-delivery-RCzH-WCl.mjs");
	return processAnnouncementBatch(data.id, { allowImmediate: true });
});
var cancelAdminAnnouncement_createServerFn_handler = createServerRpc({
	id: "045ffdd69521ea6f4842e2ed2b63e1d5a18032bf45cd37ebe92fd95c52436ff9",
	name: "cancelAdminAnnouncement",
	filename: "src/lib/notifications.functions.ts"
}, (opts) => cancelAdminAnnouncement.__executeServer(opts));
var cancelAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ id: stringType().uuid() }).parse(value)).handler(cancelAdminAnnouncement_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { cancelScheduledAnnouncement } = await import("./notification-delivery-RCzH-WCl.mjs");
	return cancelScheduledAnnouncement(data.id);
});
//#endregion
export { cancelAdminAnnouncement_createServerFn_handler, getMyNotificationPreferences_createServerFn_handler, getMyUnreadNotificationCount_createServerFn_handler, listAdminAnnouncements_createServerFn_handler, listMyNotifications_createServerFn_handler, markAllMyNotificationsRead_createServerFn_handler, previewAnnouncementAudience_createServerFn_handler, publishAdminAnnouncement_createServerFn_handler, registerMyPushToken_createServerFn_handler, saveAdminAnnouncement_createServerFn_handler, saveMyNotificationPreferences_createServerFn_handler, setMyNotificationReadStatus_createServerFn_handler };
