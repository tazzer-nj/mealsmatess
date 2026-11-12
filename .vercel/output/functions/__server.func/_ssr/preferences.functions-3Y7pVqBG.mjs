import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, n as booleanType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { a as normalizePreferences } from "./preferences-CRPr2kaW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preferences.functions-3Y7pVqBG.js
var prefsSchema = objectType({
	goal: stringType().max(60).nullable().default(null),
	favorite_foods: arrayType(stringType().max(60)).max(30).default([]),
	allergies: arrayType(stringType().max(60)).max(40).default([]),
	dietary_restrictions: arrayType(stringType().max(60)).max(30).default([]),
	disliked_foods: arrayType(stringType().max(60)).max(40).default([]),
	meals_per_day: stringType().max(40).nullable().default(null),
	cooking_level: stringType().max(40).nullable().default(null),
	cooking_time: stringType().max(40).nullable().default(null),
	food_budget: stringType().max(40).nullable().default(null),
	preferred_features: arrayType(stringType().max(40)).max(20).default([]),
	onboarding_completed: booleanType().default(false)
});
var getMyPreferences_createServerFn_handler = createServerRpc({
	id: "f163c0a65651487ff42f17de76cdaec1c1f92394e66b58f1b1a9f9c497a9aa0e",
	name: "getMyPreferences",
	filename: "src/lib/preferences.functions.ts"
}, (opts) => getMyPreferences.__executeServer(opts));
var getMyPreferences = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyPreferences_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.firebase.from("profiles").select("preferences, onboarding_completed").eq("id", context.userId).maybeSingle();
	if (error) throw new Error(error.message);
	if (!data) return null;
	return {
		...normalizePreferences(data.preferences),
		onboarding_completed: Boolean(data.onboarding_completed)
	};
});
var saveMyPreferences_createServerFn_handler = createServerRpc({
	id: "c720a5e78b7be2622985591050f94c353d7730914356dfa0d4a8220627f61560",
	name: "saveMyPreferences",
	filename: "src/lib/preferences.functions.ts"
}, (opts) => saveMyPreferences.__executeServer(opts));
var saveMyPreferences = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => prefsSchema.parse(v)).handler(saveMyPreferences_createServerFn_handler, async ({ data, context }) => {
	const payload = {
		...data,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	const { error } = await context.firebase.from("profiles").upsert({
		id: context.userId,
		preferences: payload,
		onboarding_completed: data.onboarding_completed
	}, { onConflict: "id" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { getMyPreferences_createServerFn_handler, saveMyPreferences_createServerFn_handler };
