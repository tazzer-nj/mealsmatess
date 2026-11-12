import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
import { r as requestRecipeImage, t as RecipeIdSchema } from "./recipe-image-request.server-C5YvOgXA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-images.functions-DCAE6zAz.js
var RECIPE_COLS = "id,name,cuisine,category,meal_type,description,diet_tags,ingredients,steps,created_by,image_url,image_source,image_confidence,image_locked,image_signature,image_checked_at";
var IdSchema = objectType({ recipeId: RecipeIdSchema });
async function loadRecipe(recipeId) {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data, error } = await firebaseAdmin.from("recipes").select(RECIPE_COLS).eq("id", recipeId).maybeSingle();
	if (error) throw error;
	if (!data) throw new Error("Recipe not found");
	return data;
}
async function assertCanEdit(userId, createdBy) {
	if (createdBy && createdBy === userId) return;
	const { isAdmin } = await import("./marketplace.server-D_s5ZHPi.mjs");
	if (!await isAdmin(userId)) throw new Error("Only the recipe owner or an admin can change this image");
}
/**
* Explicit user search only. Never call from page loaders or image rendering.
* Uses a cached verified photo, otherwise finds and stores a matching photo.
*/
var ensureRecipeImage_createServerFn_handler = createServerRpc({
	id: "506b4b99cd2f21212c49c88f894e015a3e4045aa1231d7670ca4cd2226c05268",
	name: "ensureRecipeImage",
	filename: "src/lib/recipe-images.functions.ts"
}, (opts) => ensureRecipeImage.__executeServer(opts));
var ensureRecipeImage = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => IdSchema.parse(v)).handler(ensureRecipeImage_createServerFn_handler, async ({ data, context }) => {
	const { data: accessible, error } = await context.firebase.from("recipes").select("id").eq("id", data.recipeId).maybeSingle();
	if (error || !accessible) throw new Error("Recipe not found");
	return requestRecipeImage(context.userId, data.recipeId);
});
var getImageAlternatives_createServerFn_handler = createServerRpc({
	id: "81f835356ce4ec5c5b7db6c6312b8a593b2c385857c2ddf0ddcbb697a9533d66",
	name: "getImageAlternatives",
	filename: "src/lib/recipe-images.functions.ts"
}, (opts) => getImageAlternatives.__executeServer(opts));
var getImageAlternatives = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => IdSchema.parse(v)).handler(getImageAlternatives_createServerFn_handler, async ({ data, context }) => {
	const srv = await import("./recipe-images.server-BiL7FiRA.mjs").then((n) => n.o).then((n) => n.o);
	const r = await loadRecipe(data.recipeId);
	await assertCanEdit(context.userId, r.created_by);
	if (srv.configuredProviders().length === 0) return {
		options: [],
		reason: "no_provider"
	};
	return {
		options: (await srv.findAlternatives(r)).map((c) => ({
			provider: c.provider,
			id: c.id,
			url: c.url,
			thumb: c.thumb,
			title: c.title.slice(0, 120),
			photographer: c.photographer ?? null,
			photographerUrl: c.photographerUrl ?? null,
			pageUrl: c.pageUrl ?? null,
			score: c.score ?? 0
		})),
		reason: null
	};
});
var ChooseSchema = objectType({
	recipeId: RecipeIdSchema,
	provider: enumType([
		"Unsplash",
		"Pexels",
		"Bing"
	]),
	id: stringType().min(1).max(300)
});
var chooseRecipeImage_createServerFn_handler = createServerRpc({
	id: "4827f6c73781ce3a3ded9f791e450e4cca06936c2bcc473f02aa165f99ad1f79",
	name: "chooseRecipeImage",
	filename: "src/lib/recipe-images.functions.ts"
}, (opts) => chooseRecipeImage.__executeServer(opts));
var chooseRecipeImage = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => ChooseSchema.parse(v)).handler(chooseRecipeImage_createServerFn_handler, async ({ data, context }) => {
	const srv = await import("./recipe-images.server-BiL7FiRA.mjs").then((n) => n.o).then((n) => n.o);
	const r = await loadRecipe(data.recipeId);
	await assertCanEdit(context.userId, r.created_by);
	const pick = (await srv.findAlternatives(r, 20)).find((c) => c.provider === data.provider && c.id === data.id);
	if (!pick) throw new Error("That image is no longer available. Please pick another.");
	await srv.saveImage(r.id, {
		...pick,
		score: Math.max(pick.score ?? 0, 95)
	}, `manual: ${srv.buildQueries(r)[0]}`, {
		locked: true,
		signature: srv.recipeSignature(r)
	});
	return { imageUrl: pick.url };
});
var backfillRecipeImages_createServerFn_handler = createServerRpc({
	id: "dac8c6e8354a77c02a57a51e32b31d51b78fa2cf3f243cd4174380b45f509dff",
	name: "backfillRecipeImages",
	filename: "src/lib/recipe-images.functions.ts"
}, (opts) => backfillRecipeImages.__executeServer(opts));
var backfillRecipeImages = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ batchSize: numberType().int().min(1).max(10).default(5) }).parse(v ?? {})).handler(backfillRecipeImages_createServerFn_handler, async ({ data, context }) => {
	const { isAdmin } = await import("./marketplace.server-D_s5ZHPi.mjs");
	if (!await isAdmin(context.userId)) throw new Error("Admin access required");
	return {
		processed: 0,
		updated: 0,
		remaining: 0,
		reason: "search_only"
	};
});
var imageProvidersStatus_createServerFn_handler = createServerRpc({
	id: "c95dcf10af0a202047587dc5b20fed1e09213c3b7b716217e0253c74d82d47aa",
	name: "imageProvidersStatus",
	filename: "src/lib/recipe-images.functions.ts"
}, (opts) => imageProvidersStatus.__executeServer(opts));
var imageProvidersStatus = createServerFn({ method: "GET" }).handler(imageProvidersStatus_createServerFn_handler, async () => {
	const [images, ai] = await Promise.all([import("./recipe-images.server-BiL7FiRA.mjs").then((n) => n.o).then((n) => n.o), import("./ai-engine.server-BOPxPIhJ.mjs").then((n) => n.n).then((n) => n.n)]);
	return {
		providers: images.configuredProviders(),
		ai: ai.getAiProviderConfiguration()
	};
});
//#endregion
export { backfillRecipeImages_createServerFn_handler, chooseRecipeImage_createServerFn_handler, ensureRecipeImage_createServerFn_handler, getImageAlternatives_createServerFn_handler, imageProvidersStatus_createServerFn_handler };
