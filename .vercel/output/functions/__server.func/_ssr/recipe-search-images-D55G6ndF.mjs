import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, i as numberType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { r as curatedRecipeImageUrl } from "./recipe-image-6RW6Z0iJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
import { t as RecipeIdSchema } from "./recipe-image-request.server-C5YvOgXA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-search-images-D55G6ndF.js
var IdSchema = objectType({ recipeId: RecipeIdSchema });
/**
* Explicit user search only. Never call from page loaders or image rendering.
* Uses a cached verified photo, otherwise finds and stores a matching photo.
*/
var ensureRecipeImage = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => IdSchema.parse(v)).handler(createSsrRpc("506b4b99cd2f21212c49c88f894e015a3e4045aa1231d7670ca4cd2226c05268"));
createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => IdSchema.parse(v)).handler(createSsrRpc("81f835356ce4ec5c5b7db6c6312b8a593b2c385857c2ddf0ddcbb697a9533d66"));
var ChooseSchema = objectType({
	recipeId: RecipeIdSchema,
	provider: enumType([
		"Unsplash",
		"Pexels",
		"Bing"
	]),
	id: stringType().min(1).max(300)
});
createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => ChooseSchema.parse(v)).handler(createSsrRpc("4827f6c73781ce3a3ded9f791e450e4cca06936c2bcc473f02aa165f99ad1f79"));
createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ batchSize: numberType().int().min(1).max(10).default(5) }).parse(v ?? {})).handler(createSsrRpc("dac8c6e8354a77c02a57a51e32b31d51b78fa2cf3f243cd4174380b45f509dff"));
createServerFn({ method: "GET" }).handler(createSsrRpc("c95dcf10af0a202047587dc5b20fed1e09213c3b7b716217e0253c74d82d47aa"));
/** Explicit search submissions only: reuse existing photos, then fill missing ones. */
async function loadRecipeSearchImages(recipes, queryClient) {
	for (const recipe of recipes.slice(0, 6)) {
		if (recipe.image_source && recipe.image_url || curatedRecipeImageUrl(recipe)) continue;
		const result = await ensureRecipeImage({ data: { recipeId: recipe.id } }).catch(() => {
			toast.error("Couldn't create a recipe photo", { description: "Please try again from the recipe page." });
			return null;
		});
		if (!result) break;
		if (result.imageUrl) await Promise.all([queryClient.invalidateQueries({ queryKey: ["recipes"] }), queryClient.invalidateQueries({ queryKey: ["recipe", recipe.slug] })]);
		if (result.reason === "limit") {
			toast.message("Daily photo allowance reached", { description: "Try creating more recipe photos tomorrow. Premium includes more." });
			break;
		}
		if (result.reason === "rate_limited") break;
	}
}
//#endregion
export { loadRecipeSearchImages as t };
