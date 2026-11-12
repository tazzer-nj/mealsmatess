import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, n as booleanType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preferences.functions-BC8eI4b9.js
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
var getMyPreferences = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("f163c0a65651487ff42f17de76cdaec1c1f92394e66b58f1b1a9f9c497a9aa0e"));
var saveMyPreferences = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => prefsSchema.parse(v)).handler(createSsrRpc("c720a5e78b7be2622985591050f94c353d7730914356dfa0d4a8220627f61560"));
//#endregion
export { saveMyPreferences as n, getMyPreferences as t };
