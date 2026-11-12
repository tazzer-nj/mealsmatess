import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xp.functions-gGsCzNZL.js
/**
* Client-facing XP surface. xp.server.ts owns the service-role client
* (xp_events is write-locked for end users by RLS, so XP writes must
* go through the server).
*/
var getGamification_createServerFn_handler = createServerRpc({
	id: "52db1c62c839b4abf03e9e013162d6753a96d7debc39b5eb4d300eab7a4c744f",
	name: "getGamification",
	filename: "src/lib/xp.functions.ts"
}, (opts) => getGamification.__executeServer(opts));
var getGamification = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getGamification_createServerFn_handler, async ({ context }) => {
	const { fetchGamification } = await import("./xp.server-CgMG5d4k.mjs");
	return fetchGamification(context.userId);
});
/**
* Actions a client is allowed to self-report. premium_purchase is only
* awarded by the billing webhook, never from the browser. refKey scopes
* each award to a day (or the entity) so it can't be farmed by spamming.
*/
var CLIENT_ACTIONS = [
	"recipe_cooked",
	"planned_meal_completed",
	"grocery_list_completed",
	"weekly_plan_completed"
];
var awardXp_createServerFn_handler = createServerRpc({
	id: "f624b3f779c8c4ff43e0fa52d4106f4111408483065235940c4c52f6da26ba26",
	name: "awardXp",
	filename: "src/lib/xp.functions.ts"
}, (opts) => awardXp.__executeServer(opts));
var awardXp = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	action: enumType(CLIENT_ACTIONS),
	entityId: stringType().max(120).optional()
}).parse(v)).handler(awardXp_createServerFn_handler, async ({ data, context }) => {
	const { awardXpFor, dayKey } = await import("./xp.server-CgMG5d4k.mjs");
	const refKey = data.entityId ? `${data.entityId}:${dayKey()}` : `${context.userId}:${dayKey()}`;
	return awardXpFor(firebaseUserId(context.userId), data.action, refKey);
});
function firebaseUserId(userId) {
	return userId;
}
var claimElite_createServerFn_handler = createServerRpc({
	id: "e987e8c41e14b1056e500ad18c086da2d2ad3e85503e6ccadb858cab91d1bf4c",
	name: "claimElite",
	filename: "src/lib/xp.functions.ts"
}, (opts) => claimElite.__executeServer(opts));
var claimElite = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(claimElite_createServerFn_handler, async ({ context }) => {
	const { claimEliteRewardFor } = await import("./xp.server-CgMG5d4k.mjs");
	return claimEliteRewardFor(context.userId);
});
//#endregion
export { awardXp_createServerFn_handler, claimElite_createServerFn_handler, getGamification_createServerFn_handler };
