import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as enforceRateLimit, r as trackEvent } from "./security.server-D83_qD0_.mjs";
import { a as generateAiObject } from "./ai-engine.server-BOPxPIhJ.mjs";
import { s as preferenceSummary } from "./preferences-CRPr2kaW.mjs";
import { t as aiProfile } from "./ai-profile-BwyyKmAQ.mjs";
import { n as requireAiCredit } from "./ai-credits.server-BOnqFVyn.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planner.functions-BZIAjY6l.js
var MEAL_TYPES = [
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snack"
];
var PlanInput = objectType({
	days: numberType().int().min(1).max(14).default(7),
	meals: arrayType(enumType(MEAL_TYPES)).min(1).max(MEAL_TYPES.length).default([
		"Breakfast",
		"Lunch",
		"Dinner"
	]),
	startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).superRefine(({ startDate }, context) => {
	if (!startDate) return;
	const parsed = /* @__PURE__ */ new Date(`${startDate}T00:00:00.000Z`);
	if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== startDate) context.addIssue({
		code: "custom",
		path: ["startDate"],
		message: "Use a real calendar date."
	});
});
var generatePersonalizedPlan_createServerFn_handler = createServerRpc({
	id: "cc77a4c4def7f619892da682f5caa522bd3f8db6a00e83f0748575f6ead774fc",
	name: "generatePersonalizedPlan",
	filename: "src/lib/planner.functions.ts"
}, (opts) => generatePersonalizedPlan.__executeServer(opts));
var generatePersonalizedPlan = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => PlanInput.parse(v)).handler(generatePersonalizedPlan_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_planner", context.userId, 5);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: savedProfile } = await firebaseAdmin.from("profiles").select("goal,activity_level,allergies,budget_per_day,dietary_preferences,family_size,weight_kg,height_cm,age,preferences").eq("id", context.userId).maybeSingle();
	const profile = aiProfile(savedProfile);
	const start = data.startDate ? /* @__PURE__ */ new Date(`${data.startDate}T00:00:00.000Z`) : /* @__PURE__ */ new Date();
	start.setUTCHours(0, 0, 0, 0);
	const dates = [];
	for (let i = 0; i < data.days; i++) {
		const date = new Date(start);
		date.setUTCDate(start.getUTCDate() + i);
		dates.push(date.toISOString().slice(0, 10));
	}
	const prompt = `Build a ${data.days}-day meal plan for meals: ${data.meals.join(", ")}.
User profile:
- Saved preferences: ${profile ? preferenceSummary(profile.preferences) : "none specified"}
- Goal: ${profile?.goal ?? "general wellness"}
- Activity: ${profile?.activity_level ?? "moderate"}
- Allergies: ${(profile?.allergies ?? []).join(", ") || "none"}
- Dietary preferences: ${(profile?.dietary_preferences ?? []).join(", ") || "none"}
- Daily budget: ${profile?.budget_per_day ? `$${profile.budget_per_day}` : "flexible"}
- Family size: ${profile?.family_size ?? 1}

Prefer varied, culturally diverse dishes including South African options. Reply ONLY as JSON:
{"plan":[{"day":1,"meal_type":"Breakfast","name":"...","calories":450,"short_reason":"..."}]}
Days: 1..${data.days}. One entry per meal per day.`;
	const t0 = Date.now();
	try {
		const suggestions = (await generateAiObject({
			feature: "planner.generate",
			instructions: "You are a chef and nutrition coach. Return valid, culturally varied meals and clearly estimated calories. Never include a listed allergen or violate a dietary preference.",
			prompt,
			schema: objectType({ plan: arrayType(objectType({
				day: numberType().int().min(1).max(data.days),
				meal_type: enumType(MEAL_TYPES),
				name: stringType().trim().min(1).max(160),
				calories: numberType().int().min(0).max(1e4).default(0),
				short_reason: stringType().max(240).default("")
			})).length(data.days * data.meals.length).superRefine((plan, context) => {
				const seen = /* @__PURE__ */ new Set();
				for (const [index, meal] of plan.entries()) {
					const key = `${meal.day}:${meal.meal_type}`;
					if (!data.meals.includes(meal.meal_type)) context.addIssue({
						code: "custom",
						path: [index, "meal_type"],
						message: "The plan contains a meal type that was not requested."
					});
					if (seen.has(key)) context.addIssue({
						code: "custom",
						path: [index],
						message: "The plan contains a duplicate day and meal type."
					});
					seen.add(key);
				}
			}) })
		})).plan.map((p) => ({
			day: p.day,
			date: dates[Math.max(0, Math.min(p.day - 1, dates.length - 1))] ?? dates[0] ?? "",
			meal_type: p.meal_type,
			name: p.name,
			calories: p.calories ?? 0,
			short_reason: p.short_reason ?? ""
		}));
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.plan_generated",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				days: data.days,
				count: suggestions.length
			}
		});
		return { suggestions };
	} catch (err) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.plan_generated",
			latency_ms: Date.now() - t0,
			success: false,
			error: err instanceof Error ? err.message.slice(0, 500) : String(err)
		});
		throw err;
	}
});
var buildGroceryFromPlan_createServerFn_handler = createServerRpc({
	id: "b0537811258d50c85ea100d5b24f30d26e5c6b86fb3510af716e559909542796",
	name: "buildGroceryFromPlan",
	filename: "src/lib/planner.functions.ts"
}, (opts) => buildGroceryFromPlan.__executeServer(opts));
var buildGroceryFromPlan = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	from: stringType(),
	to: stringType()
}).parse(v)).handler(buildGroceryFromPlan_createServerFn_handler, async ({ data, context }) => {
	const firebase = context.firebase;
	const { data: plans, error } = await firebase.from("meal_plans").select("recipe_id, recipes(ingredients, name)").gte("plan_date", data.from).lte("plan_date", data.to);
	if (error) throw new Error(error.message);
	const map = /* @__PURE__ */ new Map();
	for (const p of plans ?? []) {
		const rec = p.recipes;
		const ings = Array.isArray(rec?.ingredients) ? rec.ingredients : [];
		for (const ing of ings) {
			if (!ing?.name) continue;
			const k = ing.name.trim().toLowerCase();
			const cur = map.get(k) ?? {
				quantity: null,
				sources: /* @__PURE__ */ new Set()
			};
			if (ing.quantity) cur.quantity = cur.quantity ? `${cur.quantity} + ${ing.quantity}` : ing.quantity;
			if (rec?.name) cur.sources.add(rec.name);
			map.set(k, cur);
		}
	}
	const rows = Array.from(map.entries()).map(([name, v]) => ({
		user_id: context.userId,
		name,
		quantity: v.quantity,
		category: Array.from(v.sources).slice(0, 3).join(", ") || null
	}));
	if (rows.length === 0) return { inserted: 0 };
	const { error: insErr } = await firebase.from("grocery_items").insert(rows);
	if (insErr) throw new Error(insErr.message);
	trackEvent({
		user_id: context.userId,
		kind: "planner",
		name: "planner.autogrocery",
		success: true,
		metadata: { inserted: rows.length }
	});
	return { inserted: rows.length };
});
var PlanAndShopInput = objectType({
	days: numberType().int().min(1).max(7).default(7),
	meals: arrayType(stringType()).default([
		"Breakfast",
		"Lunch",
		"Dinner"
	]),
	startDate: stringType().optional(),
	replaceExisting: booleanType().default(false)
});
var aiPlanAndShop_createServerFn_handler = createServerRpc({
	id: "cdf655ec6baf7532fd1845f81a2630787650cf675788cd4293b967cac379694b",
	name: "aiPlanAndShop",
	filename: "src/lib/planner.functions.ts"
}, (opts) => aiPlanAndShop.__executeServer(opts));
var aiPlanAndShop = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => PlanAndShopInput.parse(v)).handler(aiPlanAndShop_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_planner", context.userId, 5);
	const { firebase, userId } = context;
	const { data: savedProfile } = await firebase.from("profiles").select("goal,activity_level,allergies,budget_per_day,dietary_preferences,family_size,weight_kg,height_cm,age,preferences").eq("id", userId).maybeSingle();
	const profile = aiProfile(savedProfile);
	const start = data.startDate ? new Date(data.startDate) : /* @__PURE__ */ new Date();
	const dates = [];
	for (let i = 0; i < data.days; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		dates.push(d.toISOString().slice(0, 10));
	}
	const fromISO = dates[0] ?? data.startDate ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const toISO = dates.at(-1) ?? fromISO;
	const prompt = `Build a ${data.days}-day meal plan with meals: ${data.meals.join(", ")}.
Profile:
- Saved preferences: ${profile ? preferenceSummary(profile.preferences) : "none specified"}
- Goal: ${profile?.goal ?? "general wellness"}
- Activity: ${profile?.activity_level ?? "moderate"}
- Allergies (must avoid): ${(profile?.allergies ?? []).join(", ") || "none"}
- Dietary preferences: ${(profile?.dietary_preferences ?? []).join(", ") || "none"}
- Daily budget: ${profile?.budget_per_day ? `$${profile.budget_per_day}` : "flexible"}
- Family size: ${profile?.family_size ?? 1}

For EACH meal, include a compact ingredient list scaled for the family size.
Use short pantry-friendly names ("chicken breast", "olive oil", "spinach").
Group category as one of: Produce, Meat, Dairy, Pantry, Grains, Frozen, Bakery, Spices, Other.

Reply ONLY as strict JSON with this exact shape:
{"plan":[{"day":1,"meal_type":"Breakfast","name":"...","calories":450,"ingredients":[{"name":"eggs","quantity":"4","category":"Dairy"}]}]}
Days: 1..${data.days}. One entry per meal per day.`;
	const t0 = Date.now();
	let suggestions = [];
	try {
		suggestions = (await generateAiObject({
			feature: "planner.plan_and_shop",
			instructions: "You are a chef and nutrition coach. Return a varied, valid meal plan with estimated calories and practical grocery ingredients. Never include a listed allergen or violate a dietary preference.",
			prompt,
			schema: objectType({ plan: arrayType(objectType({
				day: numberType().int().min(1).max(data.days),
				meal_type: stringType().trim().min(1).max(50),
				name: stringType().trim().min(1).max(160),
				calories: numberType().int().min(0).max(1e4).optional(),
				ingredients: arrayType(objectType({
					name: stringType().trim().min(1).max(120),
					quantity: stringType().max(80).optional(),
					category: enumType([
						"Produce",
						"Meat",
						"Dairy",
						"Pantry",
						"Grains",
						"Frozen",
						"Bakery",
						"Spices",
						"Other"
					]).optional()
				})).min(1).max(40)
			})).min(1).max(data.days * Math.max(data.meals.length, 1)) })
		})).plan;
	} catch (err) {
		trackEvent({
			user_id: userId,
			kind: "ai",
			name: "ai.plan_and_shop",
			latency_ms: Date.now() - t0,
			success: false,
			error: err instanceof Error ? err.message.slice(0, 500) : String(err)
		});
		throw err;
	}
	if (data.replaceExisting) await firebase.from("meal_plans").delete().gte("plan_date", fromISO).lte("plan_date", toISO);
	const planRows = suggestions.map((m) => ({
		user_id: userId,
		plan_date: dates[Math.max(0, Math.min(m.day - 1, dates.length - 1))] ?? fromISO,
		meal_type: m.meal_type,
		custom_name: m.name,
		recipe_id: null
	}));
	if (planRows.length > 0) {
		const { error: pErr } = await firebase.from("meal_plans").insert(planRows);
		if (pErr) throw new Error(pErr.message);
	}
	const map = /* @__PURE__ */ new Map();
	for (const m of suggestions) for (const ing of m.ingredients ?? []) {
		if (!ing?.name) continue;
		const k = ing.name.trim().toLowerCase();
		const cur = map.get(k) ?? {
			name: ing.name.trim(),
			quantity: null,
			category: ing.category ?? null
		};
		if (ing.quantity) cur.quantity = cur.quantity ? `${cur.quantity} + ${ing.quantity}` : ing.quantity;
		if (!cur.category && ing.category) cur.category = ing.category;
		map.set(k, cur);
	}
	const { data: existing } = await firebase.from("grocery_items").select("name").eq("checked", false);
	const have = new Set((existing ?? []).map((r) => r.name.trim().toLowerCase()));
	const rows = Array.from(map.entries()).filter(([k]) => !have.has(k)).map(([, v]) => ({
		user_id: userId,
		name: v.name,
		quantity: v.quantity,
		category: v.category
	}));
	let inserted = 0;
	if (rows.length > 0) {
		const { error: gErr } = await firebase.from("grocery_items").insert(rows);
		if (gErr) throw new Error(gErr.message);
		inserted = rows.length;
	}
	trackEvent({
		user_id: userId,
		kind: "planner",
		name: "ai.plan_and_shop",
		latency_ms: Date.now() - t0,
		success: true,
		metadata: {
			meals: planRows.length,
			groceries: inserted,
			days: data.days
		}
	});
	try {
		const { awardXpFor } = await import("./xp.server-CgMG5d4k.mjs");
		await awardXpFor(userId, "weekly_plan_completed", `${fromISO}:${toISO}`);
	} catch {}
	return {
		meals: planRows.length,
		groceries: inserted,
		skipped: map.size - inserted,
		from: fromISO,
		to: toISO
	};
});
var suggestSubstitutions_createServerFn_handler = createServerRpc({
	id: "684b10b81331c684e23e7eb702f79bfccc372dafaa028f0b6371c0424bb66dd6",
	name: "suggestSubstitutions",
	filename: "src/lib/planner.functions.ts"
}, (opts) => suggestSubstitutions.__executeServer(opts));
var suggestSubstitutions = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	ingredient: stringType().min(1).max(120),
	context: stringType().max(300).optional()
}).parse(v)).handler(suggestSubstitutions_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_substitute", context.userId, 20);
	const t0 = Date.now();
	try {
		const { data: savedProfile } = await context.firebase.from("profiles").select("allergies,dietary_preferences,preferences").eq("id", context.userId).maybeSingle();
		const profile = aiProfile(savedProfile);
		const allergies = profile?.allergies ?? [];
		const dietaryPreferences = profile?.dietary_preferences ?? [];
		const parsed = await generateAiObject({
			feature: "ingredients.substitutions",
			instructions: "You are a culinary substitutions expert. Suggest safe, practical alternatives. Do not suggest any ingredient on the user's allergy list or anything that conflicts with their dietary preferences.",
			prompt: `Give 3 practical substitutes for "${data.ingredient}"${data.context ? ` in the context of ${data.context}` : ""}. Saved preferences: ${profile ? preferenceSummary(profile.preferences) : "none specified"}. Allergies to avoid: ${allergies.join(", ") || "none"}. Dietary preferences: ${dietaryPreferences.join(", ") || "none"}.`,
			schema: objectType({ substitutes: arrayType(objectType({
				name: stringType().trim().min(1).max(100),
				ratio: stringType().max(40).optional(),
				notes: stringType().max(220).optional()
			})).length(3) })
		});
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.substitute",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: { ingredient: data.ingredient }
		});
		return { substitutes: parsed.substitutes ?? [] };
	} catch (err) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.substitute",
			latency_ms: Date.now() - t0,
			success: false,
			error: err instanceof Error ? err.message.slice(0, 500) : String(err)
		});
		throw err;
	}
});
//#endregion
export { aiPlanAndShop_createServerFn_handler, buildGroceryFromPlan_createServerFn_handler, generatePersonalizedPlan_createServerFn_handler, suggestSubstitutions_createServerFn_handler };
