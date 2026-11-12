import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { a as objectType, i as numberType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-catalog.functions-CHBrEscT.js
function text(value) {
	return typeof value === "string" ? value : null;
}
function number(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function ingredient(value) {
	if (typeof value === "string") return [{
		name: value,
		quantity: ""
	}];
	if (!value || typeof value !== "object") return [];
	const row = value;
	const name = text(row["name"]);
	return name ? [{
		name,
		quantity: text(row["quantity"]) ?? ""
	}] : [];
}
function photoAttribution(value) {
	if (typeof value === "string") return value;
	if (!value || typeof value !== "object") return null;
	const data = value;
	return {
		photographer: text(data["photographer"]),
		photographerUrl: text(data["photographerUrl"]),
		pageUrl: text(data["pageUrl"])
	};
}
/** Only public, serializable catalog fields used by recipe cards and cooking. */
function recipeCatalogRecord(row) {
	const { id, slug, name } = row;
	if (typeof id !== "string" || !id.trim() || typeof slug !== "string" || !slug.trim() || typeof name !== "string" || !name.trim()) return null;
	return {
		id,
		slug,
		name,
		description: text(row["description"]),
		cuisine: text(row["cuisine"]),
		category: text(row["category"]),
		country: text(row["country"]),
		diet_tags: Array.isArray(row["diet_tags"]) ? row["diet_tags"].filter((tag) => typeof tag === "string") : [],
		meal_type: text(row["meal_type"]),
		cooking_time_minutes: number(row["cooking_time_minutes"]),
		difficulty: text(row["difficulty"]),
		servings: number(row["servings"]),
		calories: number(row["calories"]),
		protein_g: number(row["protein_g"]),
		carbs_g: number(row["carbs_g"]),
		fat_g: number(row["fat_g"]),
		ingredients: Array.isArray(row["ingredients"]) ? row["ingredients"].flatMap(ingredient) : [],
		steps: Array.isArray(row["steps"]) ? row["steps"].flatMap((step) => {
			if (typeof step === "string") return [step];
			if (!step || typeof step !== "object") return [];
			const item = step;
			const value = text(item["text"]) ?? text(item["instruction"]) ?? text(item["step"]);
			return value ? [value] : [];
		}) : [],
		fun_fact: text(row["fun_fact"]),
		created_by: text(row["created_by"]),
		image_url: text(row["image_url"]),
		image_source: text(row["image_source"]),
		image_attribution: photoAttribution(row["image_attribution"])
	};
}
function normalize(value) {
	return typeof value === "string" ? value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() : "";
}
function filterRecipeCatalog(recipes, { category, search = "", limit = 60 } = {}) {
	const selected = normalize(category);
	const terms = normalize(search).split(" ").filter(Boolean);
	return recipes.filter((recipe) => {
		const labels = [
			recipe.name,
			recipe.cuisine,
			recipe.category,
			recipe.country,
			...recipe.diet_tags ?? []
		].map(normalize);
		const southAfrican = [
			recipe.cuisine,
			recipe.category,
			recipe.country
		].some((value) => normalize(value).includes("south africa"));
		const categoryMatches = !selected || selected === "all" || ([
			"south african",
			"south african favorites",
			"south african favourites"
		].includes(selected) ? southAfrican : labels.includes(selected === "healthy meals" ? "healthy" : selected));
		const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient) => typeof ingredient === "string" ? ingredient : ingredient?.name) : [];
		const text = [
			...labels,
			normalize(recipe.description),
			...ingredients.map(normalize)
		].join(" ");
		return categoryMatches && terms.every((term) => text.includes(term));
	}).slice(0, limit);
}
var listRecipeCatalog_createServerFn_handler = createServerRpc({
	id: "1d96a095b1ef1a866a72268d189c1b8c76b8fab126563222107bda8db358aa8d",
	name: "listRecipeCatalog",
	filename: "src/lib/recipe-catalog.functions.ts"
}, (opts) => listRecipeCatalog.__executeServer(opts));
var listRecipeCatalog = createServerFn({ method: "GET" }).middleware([requirePremium]).validator((input) => objectType({
	category: stringType().trim().max(80).optional(),
	search: stringType().trim().max(200).default(""),
	limit: numberType().int().min(1).max(60).default(60)
}).parse(input)).handler(listRecipeCatalog_createServerFn_handler, async ({ data, context }) => {
	const { data: rows, error } = await context.firebase.from("recipes").select("*").order("created_at", {
		ascending: false,
		nullsFirst: false
	});
	if (error) throw error;
	return filterRecipeCatalog(rows.map(recipeCatalogRecord).filter((recipe) => recipe !== null), data);
});
var getRecipeCatalogEntry_createServerFn_handler = createServerRpc({
	id: "d6e10695f79ccd42abf6f4630f2ce7b83374e4af8dd6d610907510f7d59821dd",
	name: "getRecipeCatalogEntry",
	filename: "src/lib/recipe-catalog.functions.ts"
}, (opts) => getRecipeCatalogEntry.__executeServer(opts));
var getRecipeCatalogEntry = createServerFn({ method: "GET" }).middleware([requirePremium]).validator((input) => objectType({ slug: stringType().trim().min(1).max(300) }).parse(input)).handler(getRecipeCatalogEntry_createServerFn_handler, async ({ data, context }) => {
	const { data: row, error } = await context.firebase.from("recipes").select("*").eq("slug", data.slug).limit(1).maybeSingle();
	if (error) throw error;
	return row ? recipeCatalogRecord(row) : null;
});
//#endregion
export { getRecipeCatalogEntry_createServerFn_handler, listRecipeCatalog_createServerFn_handler };
