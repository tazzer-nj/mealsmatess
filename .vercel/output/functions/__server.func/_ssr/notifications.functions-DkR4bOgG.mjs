import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, n as booleanType, r as enumType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications.functions-DkR4bOgG.js
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
var listMyNotifications = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("acdc1590236f0839542f983a97a7193af437f8125c921a77e6feea3b73ccec73"));
var getMyUnreadNotificationCount = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("b98e74aee1dd58ba31c8b83983a48bd598dc27e2a2003027fb24c73ad27e2175"));
var setMyNotificationReadStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({
	id: stringType().uuid(),
	read: booleanType()
}).parse(value)).handler(createSsrRpc("9e59dc65f44f65df9e5b83bca2bdde4a2f78697fe32e3e62493dcb745e47cfd9"));
var markAllMyNotificationsRead = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("3f147242b86d83f91deccdd2a565940173497f2281e6e143c7a4b2ba437dcd01"));
var getMyNotificationPreferences = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("bb23b49c00fd28f3992417a3ef8cacbe388fe736d4e9fe21b7351a7205343c94"));
var saveMyNotificationPreferences = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({
	productUpdatesEnabled: booleanType(),
	pushEnabled: booleanType()
}).parse(value)).handler(createSsrRpc("4e8fda09e056970b58fe8f3fbe4f908e328fa448cd2b772f5b326b6ceed9534e"));
var registerMyPushToken = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ token: stringType().min(40).max(4096) }).parse(value)).handler(createSsrRpc("0b7c9b09b63946933065eeba53a5673780ca7fc7ee300506e2230534d1c2e57c"));
var previewAnnouncementAudience = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ audience: enumType(["all_consumers", "healthy_interest"]) }).parse(value)).handler(createSsrRpc("83207fcac4dad8db78750b8772851057c4f9127fac17c4e08f228a1408322702"));
var listAdminAnnouncements = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("d91a939ef75ed76f211c7601084041a0e58250a521ab640fd9a758825c5e6a97"));
var saveAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => announcementInput.parse(value)).handler(createSsrRpc("3bc186123a1ef99913165374796fca340d0de8dfb2d24fe5910ed5c2b6f6c94f"));
var publishAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ id: stringType().uuid() }).parse(value)).handler(createSsrRpc("c6b23755310203a6cc89a2aadebf52d3b4fba4cdbcee99b07e3f7d77b70d349d"));
var cancelAdminAnnouncement = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ id: stringType().uuid() }).parse(value)).handler(createSsrRpc("045ffdd69521ea6f4842e2ed2b63e1d5a18032bf45cd37ebe92fd95c52436ff9"));
//#endregion
export { listMyNotifications as a, publishAdminAnnouncement as c, saveMyNotificationPreferences as d, setMyNotificationReadStatus as f, listAdminAnnouncements as i, registerMyPushToken as l, getMyNotificationPreferences as n, markAllMyNotificationsRead as o, getMyUnreadNotificationCount as r, previewAnnouncementAudience as s, cancelAdminAnnouncement as t, saveAdminAnnouncement as u };
