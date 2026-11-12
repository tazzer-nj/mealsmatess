import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { r as curatedRecipeImageUrl } from "./recipe-image-6RW6Z0iJ.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as enforceRateLimit } from "./security.server-D83_qD0_.mjs";
import { a as generateAiObject } from "./ai-engine.server-BOPxPIhJ.mjs";
import { n as requireAiCredit } from "./ai-credits.server-BOnqFVyn.mjs";
import { t as slugify } from "./slug-DGI5MEMt.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-recipe.functions-Z9swnfEu.js
var RecipeSchema = objectType({
	not_recipe: booleanType().optional(),
	name: stringType().optional(),
	description: stringType().optional(),
	cuisine: stringType().nullable().optional(),
	category: stringType().nullable().optional(),
	country: stringType().nullable().optional(),
	diet_tags: arrayType(stringType()).default([]),
	meal_type: stringType().nullable().optional(),
	cooking_time_minutes: numberType().int().nullable().optional(),
	difficulty: stringType().nullable().optional(),
	servings: numberType().int().nullable().optional(),
	calories: numberType().int().nullable().optional(),
	protein_g: numberType().nullable().optional(),
	carbs_g: numberType().nullable().optional(),
	fat_g: numberType().nullable().optional(),
	ingredients: arrayType(objectType({
		name: stringType(),
		quantity: stringType().optional()
	})).default([]),
	steps: arrayType(stringType()).default([]),
	fun_fact: stringType().nullable().optional(),
	image_prompt: stringType().nullable().optional()
});
var SYSTEM = `You are MealMate's video-to-recipe assistant. You receive a URL to a short cooking video from TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, or similar. Any scraped caption/title/description text is included.

Rules:
1. If the link clearly refers to a cooking / food-preparation video (based on URL, platform, caption text), infer the recipe. Use your knowledge of common recipes matching the title, creator, or caption. If the caption names the dish, use that dish's authentic recipe. Include realistic ingredients, steps, prep/cook time, servings, difficulty, and nutrition estimates.
2. If the content is clearly NOT a cooking or recipe video, or you cannot reasonably infer a dish, respond with exactly: {"not_recipe": true}

Return ONLY valid JSON (no code fences) matching:
{
  "name": string,
  "description": string (1-2 sentences),
  "cuisine": string,
  "category": "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Snacks" | "Drinks",
  "country": string,
  "diet_tags": string[],
  "meal_type": string,
  "cooking_time_minutes": number,
  "difficulty": "Easy" | "Medium" | "Hard",
  "servings": number,
  "calories": number,
  "protein_g": number, "carbs_g": number, "fat_g": number,
  "ingredients": [{ "name": string, "quantity": string }],
  "steps": string[],
  "fun_fact": string,
  "image_prompt": string
}`;
var ALLOWED_VIDEO_DOMAINS = [
	"tiktok.com",
	"instagram.com",
	"youtube.com",
	"youtu.be",
	"facebook.com",
	"fb.watch"
];
function isAllowedVideoUrl(value) {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && !url.username && !url.password && ALLOWED_VIDEO_DOMAINS.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
	} catch {
		return false;
	}
}
async function scrapeMeta(url) {
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; MealMateBot/1.0; +https://mealmate.app)",
				Accept: "text/html,application/xhtml+xml"
			},
			redirect: "manual",
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok || res.status >= 300 && res.status < 400) return "";
		const html = await res.text();
		const pick = (re) => html.match(re)?.[1]?.trim() ?? "";
		return [
			pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
			pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
			pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
			pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
			pick(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i),
			pick(/<title>([^<]+)<\/title>/i)
		].filter(Boolean).join("\n").slice(0, 2e3);
	} catch {
		return "";
	}
}
function imageUrlFor(name) {
	return curatedRecipeImageUrl({
		slug: slugify(name),
		name
	}, "hero") ?? null;
}
var importRecipeFromUrl_createServerFn_handler = createServerRpc({
	id: "ed3c258f467bb732c85368d694140f10cd06167c124f6b4bcd2c61385a904b39",
	name: "importRecipeFromUrl",
	filename: "src/lib/import-recipe.functions.ts"
}, (opts) => importRecipeFromUrl.__executeServer(opts));
var importRecipeFromUrl = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ url: stringType().url().max(1e3).refine(isAllowedVideoUrl, "Use an HTTPS video URL from TikTok, Instagram, YouTube, or Facebook.") }).parse(v)).handler(importRecipeFromUrl_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_recipe_import", context.userId, 10);
	const meta = await scrapeMeta(data.url);
	const userMsg = `URL: ${data.url}\n\nScraped page metadata (may be empty or blocked by the platform):\n${meta || "(none)"}\n\nInfer the recipe if this is cooking content, otherwise return {"not_recipe": true}.`;
	const parsed = await generateAiObject({
		feature: "recipe.import",
		instructions: SYSTEM,
		prompt: userMsg,
		schema: RecipeSchema
	});
	if (parsed.not_recipe || !parsed.name || parsed.ingredients.length === 0 || parsed.steps.length < 4) throw new Error("No recipe could be detected from this video.");
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const userId = context.userId;
	const row = {
		slug: `${slugify(parsed.name)}-${Math.random().toString(36).slice(2, 7)}`,
		name: parsed.name,
		description: parsed.description ?? null,
		image_url: imageUrlFor(parsed.name),
		cuisine: parsed.cuisine ?? null,
		category: parsed.category ?? null,
		country: parsed.country ?? null,
		diet_tags: parsed.diet_tags ?? [],
		meal_type: parsed.meal_type ?? null,
		cooking_time_minutes: parsed.cooking_time_minutes ?? null,
		difficulty: parsed.difficulty ?? null,
		servings: parsed.servings ?? 2,
		calories: parsed.calories ?? null,
		protein_g: parsed.protein_g ?? null,
		carbs_g: parsed.carbs_g ?? null,
		fat_g: parsed.fat_g ?? null,
		ingredients: parsed.ingredients ?? [],
		steps: parsed.steps ?? [],
		fun_fact: parsed.fun_fact ?? null,
		created_by: userId
	};
	const { data: inserted, error } = await firebaseAdmin.from("recipes").insert(row).select("id,slug").single();
	if (error) throw new Error(error.message);
	await firebaseAdmin.from("favorites").insert({
		user_id: userId,
		recipe_id: inserted.id
	}).then(() => null, () => null);
	return {
		slug: inserted.slug,
		id: inserted.id
	};
});
var updateRecipeBasics_createServerFn_handler = createServerRpc({
	id: "ca48beb31f23e13ede761dc160f99c0da2b946cd71ccd0be4fb329d0d0480d81",
	name: "updateRecipeBasics",
	filename: "src/lib/import-recipe.functions.ts"
}, (opts) => updateRecipeBasics.__executeServer(opts));
var updateRecipeBasics = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	id: stringType().uuid(),
	name: stringType().min(1).max(200),
	description: stringType().max(1e3).optional(),
	cooking_time_minutes: numberType().int().nullable().optional(),
	servings: numberType().int().nullable().optional()
}).parse(v)).handler(updateRecipeBasics_createServerFn_handler, async ({ data, context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { error } = await firebaseAdmin.from("recipes").update({
		name: data.name,
		description: data.description ?? null,
		cooking_time_minutes: data.cooking_time_minutes ?? null,
		servings: data.servings ?? null
	}).eq("id", data.id).eq("created_by", context.userId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var deleteImportedRecipe_createServerFn_handler = createServerRpc({
	id: "9097e8e2f5867b697561ac30eaa45f1bff9917b7d22291ddd15f282381dca537",
	name: "deleteImportedRecipe",
	filename: "src/lib/import-recipe.functions.ts"
}, (opts) => deleteImportedRecipe.__executeServer(opts));
var deleteImportedRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ id: stringType().uuid() }).parse(v)).handler(deleteImportedRecipe_createServerFn_handler, async ({ data, context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	await firebaseAdmin.from("favorites").delete().eq("user_id", context.userId).eq("recipe_id", data.id);
	await firebaseAdmin.from("recipes").delete().eq("id", data.id).eq("created_by", context.userId);
	return { ok: true };
});
//#endregion
export { deleteImportedRecipe_createServerFn_handler, importRecipeFromUrl_createServerFn_handler, updateRecipeBasics_createServerFn_handler };
