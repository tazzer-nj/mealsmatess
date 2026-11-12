import { s as stringType } from "../_libs/zod.mjs";
import { r as curatedRecipeImageUrl } from "./recipe-image-6RW6Z0iJ.mjs";
import { t as firebaseAdmin } from "./firebase-admin-ChN7VIWw.mjs";
import { n as enforceRateLimit } from "./security.server-D83_qD0_.mjs";
import { r as deduplicateAiRequest, t as aiRequestFingerprint } from "./ai-engine.server-BOPxPIhJ.mjs";
import { a as recipeSignature, i as needsSearch, n as findBestImage, r as generateAndSaveAiImage, s as saveImage, t as configuredProviders } from "./recipe-images.server-BiL7FiRA.mjs";
import { t as require_dist } from "../_libs/upstash__ratelimit.mjs";
import { t as Redis2 } from "../_libs/uncrypto+upstash__redis.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-image-request.server-C5YvOgXA.js
var import_dist = require_dist();
var RecipeIdSchema = stringType().trim().min(1).max(1500).refine((id) => !id.includes("/") && !Array.from(id).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) && id !== "." && id !== "..", "Invalid recipe ID");
var limiters = /* @__PURE__ */ new Map();
function getLimiter(bucket, limit, url, token) {
	const key = `${bucket}:${limit}`;
	const cached = limiters.get(key);
	if (cached) return cached;
	const limiter = new import_dist.Ratelimit({
		redis: new Redis2({
			url,
			token
		}),
		limiter: import_dist.Ratelimit.slidingWindow(limit, "60s"),
		analytics: false,
		prefix: "mealmate:ai"
	});
	limiters.set(key, limiter);
	return limiter;
}
async function enforceAiRateLimit(bucket, userId, maxPerMinute) {
	const url = process.env["UPSTASH_REDIS_REST_URL"]?.trim() || process.env["KV_REST_API_URL"]?.trim();
	const token = process.env["UPSTASH_REDIS_REST_TOKEN"]?.trim() || process.env["KV_REST_API_TOKEN"]?.trim();
	if (!url || !token) {
		await enforceRateLimit(bucket, userId, maxPerMinute);
		return;
	}
	try {
		const { success } = await getLimiter(bucket, maxPerMinute, url, token).limit(`${bucket}:${userId}`);
		if (!success) throw new Response("Too many requests. Please slow down.", { status: 429 });
	} catch (error) {
		if (error instanceof Response && error.status === 429) throw error;
		console.warn("[AI rate limit] Upstash unavailable; using Firebase fallback.", { name: error instanceof Error ? error.name : "UnknownError" });
		await enforceRateLimit(bucket, userId, maxPerMinute);
	}
}
var RECIPE_COLS = "id,name,cuisine,category,meal_type,description,diet_tags,ingredients,steps,image_url,image_source,image_confidence,image_locked,image_signature,image_checked_at";
/** Call only after checking the caller can read the recipe. */
function requestRecipeImage(userId, recipeId) {
	return deduplicateAiRequest(aiRequestFingerprint("shared", "recipe.image", recipeId), async () => {
		const { data: recipe, error } = await firebaseAdmin.from("recipes").select(RECIPE_COLS).eq("id", recipeId).maybeSingle();
		if (error) throw error;
		if (!recipe) throw new Error("Recipe not found");
		const curated = curatedRecipeImageUrl(recipe, "hero");
		if (curated) return {
			imageUrl: curated,
			source: "Curated",
			confidence: 100,
			searched: false
		};
		const signature = recipeSignature(recipe);
		if (recipe.image_url && !needsSearch(recipe, signature)) return {
			imageUrl: recipe.image_source ? recipe.image_url : null,
			source: recipe.image_source ?? null,
			confidence: recipe.image_confidence ?? null,
			searched: false
		};
		await enforceAiRateLimit("ai_image", userId, 5);
		const { data: credit, error: creditError } = await firebaseAdmin.rpc("consume_image_credit", { _user_id: userId });
		if (creditError) throw creditError;
		if (!credit?.allowed) return {
			imageUrl: null,
			source: null,
			confidence: null,
			searched: false,
			reason: "limit",
			limit: credit?.max ?? null,
			resetsAt: credit?.resets_at ?? null,
			premium: !!credit?.premium
		};
		try {
			const imageUrl = await generateAndSaveAiImage(recipe, signature);
			if (!imageUrl) throw new Error("No image was generated.");
			return {
				imageUrl,
				source: "AI",
				confidence: 100,
				searched: true
			};
		} catch (error) {
			if (configuredProviders().length === 0) throw error;
			const result = await findBestImage(recipe);
			if (!result.best || !result.query) throw error;
			await saveImage(recipeId, result.best, result.query, { signature });
			return {
				imageUrl: result.best.url,
				source: result.best.provider,
				confidence: result.best.score ?? null,
				searched: true
			};
		}
	});
}
//#endregion
export { enforceAiRateLimit as n, requestRecipeImage as r, RecipeIdSchema as t };
