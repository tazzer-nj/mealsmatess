import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { r as curatedRecipeImageUrl } from "./recipe-image-6RW6Z0iJ.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as enforceRateLimit, r as trackEvent, t as auditLog } from "./security.server-D83_qD0_.mjs";
import { a as generateAiObject, l as imageInputFromDataUrl, r as deduplicateAiRequest, s as generateAiText, t as aiRequestFingerprint } from "./ai-engine.server-BOPxPIhJ.mjs";
import { s as preferenceSummary } from "./preferences-CRPr2kaW.mjs";
import { t as aiProfile } from "./ai-profile-BwyyKmAQ.mjs";
import { n as requireAiCredit } from "./ai-credits.server-BOnqFVyn.mjs";
import { t as slugify } from "./slug-DGI5MEMt.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-BlrJIEq_.js
var RecipeSchema = objectType({
	name: stringType().trim().min(2).max(120),
	description: stringType().trim().min(1).max(600),
	cuisine: stringType().nullable().optional(),
	category: enumType([
		"Breakfast",
		"Lunch",
		"Dinner",
		"Dessert",
		"Snacks",
		"Drinks"
	]).nullable().optional(),
	country: stringType().nullable().optional(),
	diet_tags: arrayType(stringType()).default([]),
	meal_type: stringType().nullable().optional(),
	cooking_time_minutes: numberType().int().min(1).max(720).nullable().optional(),
	difficulty: enumType([
		"Easy",
		"Medium",
		"Hard"
	]).nullable().optional(),
	servings: numberType().int().min(1).max(24).nullable().optional(),
	calories: numberType().int().min(0).max(1e4).nullable().optional(),
	protein_g: numberType().min(0).max(1e3).nullable().optional(),
	carbs_g: numberType().min(0).max(1e3).nullable().optional(),
	fat_g: numberType().min(0).max(1e3).nullable().optional(),
	ingredients: arrayType(objectType({
		name: stringType().trim().min(1).max(180),
		quantity: stringType().trim().min(1).max(80)
	})).min(2).max(40),
	steps: arrayType(stringType().trim().min(1).max(700)).min(4).max(12),
	fun_fact: stringType().nullable().optional(),
	image_prompt: stringType().nullable().optional()
});
var SYSTEM = `You are MealMate, an expert global chef and food writer with deep knowledge of South African cuisine (Pap, Chakalaka, Bunny Chow, Kota, Boerewors, Vetkoek, Mogodu, Samp and Beans, Malva Pudding, Bobotie, Umngqusho) as well as world cuisines.

Return ONLY valid JSON matching this shape (no code fences, no commentary). Avoid claiming precision for nutrition: provide conservative rounded estimates per serving; the app labels these values as estimates. Always honor stated allergies and dietary restrictions, and never include an allergen even as a garnish or optional ingredient:
{
  "name": string,
  "description": string (1-2 sentences),
  "cuisine": string,
  "category": one of "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Snacks" | "Drinks",
  "country": string,
  "diet_tags": string[] (subset of ["Vegan","Vegetarian","High Protein","Low Carb","Gluten Free","Healthy","Quick"]),
  "meal_type": string,
  "cooking_time_minutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "servings": number,
  "calories": number (rough estimate per serving),
  "protein_g": number, "carbs_g": number, "fat_g": number (rough estimates per serving),
  "ingredients": [{ "name": string, "quantity": string }],
  "steps": string[] (5-10 clear steps),
  "fun_fact": string,
  "image_prompt": string (concise, food-photography style)
}`;
async function callModel(prompt) {
	return generateAiObject({
		feature: "recipe.generate",
		instructions: SYSTEM,
		prompt,
		schema: RecipeSchema
	});
}
function imageUrlFor(r) {
	return curatedRecipeImageUrl({
		slug: slugify(r.name),
		name: r.name
	}, "hero") ?? null;
}
function toDbRecipe(r, userId) {
	return {
		slug: `${slugify(r.name)}-${Math.random().toString(36).slice(2, 7)}`,
		name: r.name,
		description: r.description,
		image_url: imageUrlFor(r),
		cuisine: r.cuisine ?? null,
		category: r.category ?? null,
		country: r.country ?? null,
		diet_tags: r.diet_tags ?? [],
		meal_type: r.meal_type ?? null,
		cooking_time_minutes: r.cooking_time_minutes ?? null,
		difficulty: r.difficulty ?? null,
		servings: r.servings ?? 2,
		calories: r.calories ?? null,
		protein_g: r.protein_g ?? null,
		carbs_g: r.carbs_g ?? null,
		fat_g: r.fat_g ?? null,
		ingredients: r.ingredients ?? [],
		steps: r.steps ?? [],
		fun_fact: r.fun_fact ?? null,
		created_by: userId
	};
}
var surpriseMe_createServerFn_handler = createServerRpc({
	id: "1f00c01a15e8a042024d250fd957f161dfbec48b227c7e628132ccbdcfbc89ac",
	name: "surpriseMe",
	filename: "src/lib/ai.functions.ts"
}, (opts) => surpriseMe.__executeServer(opts));
var surpriseMe = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(surpriseMe_createServerFn_handler, async ({ context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_generate", context.userId, 10);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: savedProfile } = await firebaseAdmin.from("profiles").select("allergies,dietary_preferences,preferences").eq("id", context.userId).maybeSingle();
	const profile = aiProfile(savedProfile);
	const themes = [
		"a comforting South African classic",
		"a bold weeknight dinner from anywhere in the world",
		"a fast healthy lunch",
		"a celebratory Sunday dish",
		"a street food favorite",
		"an African diaspora dish"
	];
	const theme = themes[Math.floor(Math.random() * themes.length)];
	const t0 = Date.now();
	try {
		const recipe = await callModel(`Surprise the user with ${theme}. Pick something delightful and specific — not generic. Include one fun fact. Saved preferences: ${profile ? preferenceSummary(profile.preferences) : "none specified"}. Dietary preferences: ${(profile?.dietary_preferences ?? []).join(", ") || "none specified"}. Allergies that must be excluded: ${(profile?.allergies ?? []).join(", ") || "none specified"}.`);
		const row = toDbRecipe(recipe, context.userId);
		const { data, error } = await firebaseAdmin.from("recipes").insert(row).select("id,slug").single();
		if (error) throw new Error(error.message);
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.surprise_me",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				theme,
				name: recipe.name
			}
		});
		return { slug: data.slug };
	} catch (e) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.surprise_me",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e)
		});
		throw e;
	}
});
var generateRecipe_createServerFn_handler = createServerRpc({
	id: "ecbb7b869e5e27b8dd2d746ea6dc3738b9c882b21562ae206ef823a3806541e3",
	name: "generateRecipe",
	filename: "src/lib/ai.functions.ts"
}, (opts) => generateRecipe.__executeServer(opts));
var generateRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ query: stringType().trim().min(1).max(200) }).parse(v)).handler(generateRecipe_createServerFn_handler, async ({ data, context }) => {
	const requestKey = aiRequestFingerprint(context.userId, "recipe.generate", data.query.toLowerCase());
	return deduplicateAiRequest(requestKey, async () => {
		await enforceRateLimit("ai_generate", context.userId, 10);
		const { firebaseAdmin } = await loadFirebaseAdmin();
		const t0 = Date.now();
		try {
			const { data: exact } = await firebaseAdmin.from("recipes").select("id,slug,name").ilike("name", data.query).limit(1);
			if (exact && exact.length > 0) {
				trackEvent({
					user_id: context.userId,
					kind: "ai",
					name: "ai.generate_recipe",
					latency_ms: Date.now() - t0,
					success: true,
					metadata: {
						query: data.query,
						cached: true
					}
				});
				return {
					slug: exact[0]?.slug ?? "",
					id: exact[0]?.id ?? null,
					cached: true
				};
			}
			const { data: fuzzy } = await firebaseAdmin.from("recipes").select("id,slug,name").ilike("name", `%${data.query}%`).limit(1);
			if (fuzzy && fuzzy.length > 0) {
				trackEvent({
					user_id: context.userId,
					kind: "ai",
					name: "ai.generate_recipe",
					latency_ms: Date.now() - t0,
					success: true,
					metadata: {
						query: data.query,
						cached: true
					}
				});
				return {
					slug: fuzzy[0]?.slug ?? "",
					id: fuzzy[0]?.id ?? null,
					cached: true
				};
			}
			await requireAiCredit(context.userId);
			const { data: savedProfile } = await firebaseAdmin.from("profiles").select("allergies,dietary_preferences,preferences").eq("id", context.userId).maybeSingle();
			const profile = aiProfile(savedProfile);
			const allergies = profile?.allergies ?? [];
			const dietaryPreferences = profile?.dietary_preferences ?? [];
			const recipe = await callModel([
				`Create a real, authentic recipe for: "${data.query}". If the dish exists in any culture, use the traditional version. Be specific and accurate.`,
				`Saved preferences: ${profile ? preferenceSummary(profile.preferences) : "none specified"}.`,
				`Dietary preferences: ${dietaryPreferences.join(", ") || "none specified"}.`,
				`Allergies that must be completely excluded: ${allergies.join(", ") || "none specified"}.`,
				"Use requested ingredients where possible, include practical quantities and at least four actionable steps."
			].join("\n"));
			const ingredientTokens = new Set(recipe.ingredients.flatMap((ingredient) => ingredient.name.toLowerCase().split(/[^a-z0-9]+/)).filter(Boolean).map((word) => word.replace(/s$/, "")));
			if (allergies.some((allergy) => allergy.trim().toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2).some((word) => ingredientTokens.has(word.replace(/s$/, ""))))) throw new Error("The generated recipe conflicted with a saved allergy. Please try again.");
			const row = toDbRecipe(recipe, context.userId);
			const { data: inserted, error } = await firebaseAdmin.from("recipes").insert(row).select("id,slug").single();
			if (error) throw new Error(error.message);
			await auditLog({
				actor_id: context.userId,
				action: "recipe.generated",
				target_table: "recipes",
				target_id: inserted.slug,
				metadata: {
					query: data.query,
					name: recipe.name
				}
			});
			trackEvent({
				user_id: context.userId,
				kind: "ai",
				name: "ai.generate_recipe",
				latency_ms: Date.now() - t0,
				success: true,
				metadata: {
					query: data.query,
					cached: false,
					name: recipe.name
				}
			});
			return {
				slug: inserted.slug,
				id: inserted.id,
				cached: false
			};
		} catch (e) {
			trackEvent({
				user_id: context.userId,
				kind: "ai",
				name: "ai.generate_recipe",
				latency_ms: Date.now() - t0,
				success: false,
				error: e instanceof Error ? e.message.slice(0, 500) : String(e),
				metadata: { query: data.query }
			});
			throw e;
		}
	});
});
var scanKitchen_createServerFn_handler = createServerRpc({
	id: "0c92cfbebf2cf3795d10c73f062871dce38d862cdf63d354a13a469cc6cfb806",
	name: "scanKitchen",
	filename: "src/lib/ai.functions.ts"
}, (opts) => scanKitchen.__executeServer(opts));
var scanKitchen = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ imageDataUrl: stringType().startsWith("data:image/").max(112e5) }).parse(v)).handler(scanKitchen_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_vision", context.userId, 10);
	const t0 = Date.now();
	try {
		const { bytes, mediaType } = imageInputFromDataUrl(data.imageDataUrl);
		const items = (await generateAiObject({
			feature: "scan.kitchen",
			instructions: "Identify only visible food ingredients. Use lowercase ingredient names and never infer items that are not visible.",
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: "Identify every distinct food ingredient visible. Return items with name, quantity, and category. Use lowercase names."
				}, {
					type: "image",
					image: bytes,
					mediaType
				}]
			}],
			schema: objectType({ items: arrayType(objectType({
				name: stringType().trim().min(1).max(80),
				quantity: stringType().max(80).optional(),
				category: stringType().max(60).optional()
			})).max(40) })
		})).items;
		trackEvent({
			user_id: context.userId,
			kind: "scan",
			name: "scan.kitchen",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: { item_count: items.length }
		});
		return items;
	} catch (e) {
		trackEvent({
			user_id: context.userId,
			kind: "scan",
			name: "scan.kitchen",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e)
		});
		throw e;
	}
});
var DishSchema = objectType({
	is_food: booleanType().default(true),
	name: stringType().min(1),
	description: stringType().nullable().optional(),
	cuisine: stringType().nullable().optional(),
	meal_type: stringType().nullable().optional(),
	confidence: numberType().min(0).max(1).default(.7),
	portion: stringType().nullable().optional(),
	calories: numberType().nullable().optional(),
	protein_g: numberType().nullable().optional(),
	carbs_g: numberType().nullable().optional(),
	fat_g: numberType().nullable().optional(),
	fiber_g: numberType().nullable().optional(),
	ingredients: arrayType(stringType()).default([]),
	health_note: stringType().nullable().optional()
});
var scanDish_createServerFn_handler = createServerRpc({
	id: "5a106af67d75a9c8aee1989ca0f4c435fc18f71029b8cd8a812dfdbaa121bf1b",
	name: "scanDish",
	filename: "src/lib/ai.functions.ts"
}, (opts) => scanDish.__executeServer(opts));
var scanDish = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ imageDataUrl: stringType().startsWith("data:image/").max(112e5) }).parse(v)).handler(scanDish_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_vision", context.userId, 10);
	const t0 = Date.now();
	try {
		const { bytes, mediaType } = imageInputFromDataUrl(data.imageDataUrl);
		const dish = await generateAiObject({
			feature: "scan.dish",
			instructions: "You are a food identification assistant. Nutritional values must be clearly treated as approximate estimates, not precise medical advice.",
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: `Identify the dish shown and give rough rounded nutrition estimates for the visible portion. Return is_food, name, description, cuisine, meal_type, confidence from 0 to 1, portion, calories, protein_g, carbs_g, fat_g, fiber_g, ingredients, and a short health_note. If it is not food, set is_food false and name "Not food".`
				}, {
					type: "image",
					image: bytes,
					mediaType
				}]
			}],
			schema: DishSchema
		});
		trackEvent({
			user_id: context.userId,
			kind: "scan",
			name: "scan.dish",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				name: dish.name,
				confidence: dish.confidence,
				is_food: dish.is_food
			}
		});
		return dish;
	} catch (e) {
		trackEvent({
			user_id: context.userId,
			kind: "scan",
			name: "scan.dish",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e)
		});
		throw e;
	}
});
var askFoodQuestion_createServerFn_handler = createServerRpc({
	id: "f93759fb29dc9b8b3247cc3d4deae07fd003af95521cbd7146e81ba13f4db7b1",
	name: "askFoodQuestion",
	filename: "src/lib/ai.functions.ts"
}, (opts) => askFoodQuestion.__executeServer(opts));
var askFoodQuestion = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ question: stringType().trim().min(1).max(500) }).parse(v)).handler(askFoodQuestion_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_chat", context.userId, 20);
	const t0 = Date.now();
	try {
		const answer = await generateAiText({
			feature: "chat.food_question",
			instructions: "You are MealMate's kitchen assistant. Answer food, cooking, nutrition, and ingredient-substitution questions clearly and concisely, in 2-4 short paragraphs or a short list. Treat nutrition as estimates, not precise values. Plain text only, no markdown headers.",
			prompt: data.question
		});
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.chat_question",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				q_len: data.question.length,
				a_len: answer.length
			}
		});
		return { answer };
	} catch (e) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.chat_question",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e)
		});
		throw e;
	}
});
var regenerateRecipeImage_createServerFn_handler = createServerRpc({
	id: "33c8b25718a2a43fb174ed9d5a156b10ac1153d9a127bdb129e2ec65b8376814",
	name: "regenerateRecipeImage",
	filename: "src/lib/ai.functions.ts"
}, (opts) => regenerateRecipeImage.__executeServer(opts));
var regenerateRecipeImage = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ slug: stringType().min(1) }).parse(v)).handler(regenerateRecipeImage_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: sub } = await firebaseAdmin.from("subscriptions").select("status,period_end,tier").eq("user_id", context.userId).in("status", [
		"trialing",
		"active",
		"in_grace"
	]).order("period_end", {
		ascending: false,
		nullsFirst: false
	}).limit(1).maybeSingle();
	const now = Date.now();
	if (!(!!sub && (sub.tier === "lifetime" || !sub.period_end || new Date(sub.period_end).getTime() > now))) throw new Error("Premium required to regenerate images");
	await enforceRateLimit("ai_image", context.userId, 5);
	const { data: recipe, error: rErr } = await firebaseAdmin.from("recipes").select("id, slug, name, cuisine, country, ingredients, steps").eq("slug", data.slug).single();
	if (rErr || !recipe) throw new Error("Recipe not found");
	const t0 = Date.now();
	try {
		const imageService = await import("./recipe-images.server-BiL7FiRA.mjs").then((n) => n.o).then((n) => n.o);
		const signature = imageService.recipeSignature(recipe);
		const imageUrl = await deduplicateAiRequest(aiRequestFingerprint(context.userId, "image.regenerate", recipe.id), () => imageService.generateAndSaveAiImage(recipe, signature));
		if (!imageUrl) throw new Error("No image was generated for this recipe.");
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.regen_image",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: { slug: recipe.slug }
		});
		return { image_url: imageUrl };
	} catch (e) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.regen_image",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e),
			metadata: { slug: recipe.slug }
		});
		throw e;
	}
});
//#endregion
export { askFoodQuestion_createServerFn_handler, generateRecipe_createServerFn_handler, regenerateRecipeImage_createServerFn_handler, scanDish_createServerFn_handler, scanKitchen_createServerFn_handler, surpriseMe_createServerFn_handler };
