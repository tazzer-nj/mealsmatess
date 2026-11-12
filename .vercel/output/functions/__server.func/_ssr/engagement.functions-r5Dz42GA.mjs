import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engagement.functions-r5Dz42GA.js
var trackRecipeView_createServerFn_handler = createServerRpc({
	id: "f98806f9a0359d0b72668e24bf9c48e4bfcbccca1d66ea84d832c835e14773a3",
	name: "trackRecipeView",
	filename: "src/lib/engagement.functions.ts"
}, (opts) => trackRecipeView.__executeServer(opts));
var trackRecipeView = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ recipeId: stringType().uuid() }).parse(v)).handler(trackRecipeView_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.firebase.from("recently_viewed").upsert({
		user_id: context.userId,
		recipe_id: data.recipeId,
		viewed_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,recipe_id" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listRecentlyViewed_createServerFn_handler = createServerRpc({
	id: "cd1a020dcc20add8842771171fbfddbe1fd2bbb11fe15e63d82cfec2bce5b6db",
	name: "listRecentlyViewed",
	filename: "src/lib/engagement.functions.ts"
}, (opts) => listRecentlyViewed.__executeServer(opts));
var listRecentlyViewed = createServerFn({ method: "GET" }).middleware([requirePremium]).handler(listRecentlyViewed_createServerFn_handler, async ({ context }) => {
	const { data: views, error } = await context.firebase.from("recently_viewed").select("recipe_id").eq("user_id", context.userId).order("viewed_at", { ascending: false }).limit(12);
	if (error) throw new Error(error.message);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	return (await Promise.all((views ?? []).map(async (view) => {
		const { data: recipe } = await firebaseAdmin.from("recipes").select("id, slug, name, image_url, image_source, cooking_time_minutes, calories").eq("id", view.recipe_id).maybeSingle();
		return recipe;
	}))).filter((recipe) => !!recipe);
});
var rateRecipe_createServerFn_handler = createServerRpc({
	id: "1bd377cc6c24febb0f51eb70a42c465ea1e50ea476f8a7239943fde8c590faa9",
	name: "rateRecipe",
	filename: "src/lib/engagement.functions.ts"
}, (opts) => rateRecipe.__executeServer(opts));
var rateRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	recipeId: stringType().uuid(),
	rating: numberType().int().min(1).max(5),
	review: stringType().max(1e3).optional()
}).parse(v)).handler(rateRecipe_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.firebase.from("recipe_ratings").upsert({
		user_id: context.userId,
		recipe_id: data.recipeId,
		rating: data.rating,
		review: data.review ?? null,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "user_id,recipe_id" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listRecipeRatings_createServerFn_handler = createServerRpc({
	id: "0c61881df2fc0aefd7172ca427405d56225a8226e6a7b8120228612cf8825501",
	name: "listRecipeRatings",
	filename: "src/lib/engagement.functions.ts"
}, (opts) => listRecipeRatings.__executeServer(opts));
var listRecipeRatings = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ recipeId: stringType().uuid() }).parse(v)).handler(listRecipeRatings_createServerFn_handler, async ({ data, context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: rows, error } = await firebaseAdmin.from("recipe_ratings").select("id, user_id, rating, review, created_at").eq("recipe_id", data.recipeId).order("created_at", { ascending: false }).limit(50);
	if (error) throw new Error(error.message);
	return (rows ?? []).map((row) => {
		const { user_id, ...review } = row;
		return {
			...review,
			isMine: user_id === context.userId
		};
	});
});
//#endregion
export { listRecentlyViewed_createServerFn_handler, listRecipeRatings_createServerFn_handler, rateRecipe_createServerFn_handler, trackRecipeView_createServerFn_handler };
