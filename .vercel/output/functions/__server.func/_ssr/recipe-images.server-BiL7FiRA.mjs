import { r as __exportAll } from "../_runtime.mjs";
import { a as objectType, i as numberType, t as arrayType } from "../_libs/zod.mjs";
import { n as deleteRecipePhoto, r as uploadRecipePhoto, t as assertRecipePhotoStorageConfigured } from "./recipe-photo-storage.server-DRDjNbOG.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as firebaseAdmin } from "./firebase-admin-ChN7VIWw.mjs";
import { a as generateAiObject, i as generateAiImage } from "./ai-engine.server-BOPxPIhJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-images.server-BiL7FiRA.js
var recipe_images_server_BiL7FiRA_exports = /* @__PURE__ */ __exportAll({
	a: () => recipeSignature,
	i: () => needsSearch,
	n: () => findBestImage,
	o: () => recipe_images_server_exports,
	r: () => generateAndSaveAiImage,
	s: () => saveImage,
	t: () => configuredProviders
});
var recipe_images_server_exports = /* @__PURE__ */ __exportAll$1({
	ACCEPT_THRESHOLD: () => 70,
	aiScore: () => aiScore,
	buildQueries: () => buildQueries,
	configuredProviders: () => configuredProviders,
	findAlternatives: () => findAlternatives,
	findBestImage: () => findBestImage,
	generateAndSaveAiImage: () => generateAndSaveAiImage,
	mainIngredients: () => mainIngredients,
	markChecked: () => markChecked,
	metaScore: () => metaScore,
	needsSearch: () => needsSearch,
	recipeSignature: () => recipeSignature,
	saveImage: () => saveImage,
	searchProvider: () => searchProvider
});
var CACHE_TTL_MS = 6048e5;
var PER_PAGE = 12;
function configuredProviders() {
	const list = [];
	if (process.env["UNSPLASH_ACCESS_KEY"]) list.push("Unsplash");
	if (process.env["PEXELS_API_KEY"]) list.push("Pexels");
	if (process.env["BING_IMAGE_SEARCH_KEY"]) list.push("Bing");
	return list;
}
var STOP = /* @__PURE__ */ new Set([
	"salt",
	"pepper",
	"water",
	"oil",
	"to",
	"taste",
	"and",
	"or",
	"of",
	"the",
	"a",
	"fresh",
	"chopped",
	"sliced",
	"finely",
	"crushed",
	"large",
	"small",
	"tin",
	"g",
	"ml",
	"tbsp",
	"tsp",
	"cup",
	"cups",
	"clove",
	"cloves",
	"sugar",
	"flour",
	"butter",
	"milk",
	"garlic",
	"onion",
	"onions",
	"egg",
	"eggs",
	"with",
	"for",
	"in",
	"boneless",
	"cubed",
	"grated"
]);
function words(s) {
	return s.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
}
function mainIngredients(r, max = 3) {
	const list = Array.isArray(r.ingredients) ? r.ingredients : [];
	const nameWords = new Set(words(r.name));
	const out = [];
	for (const item of list) {
		const phrase = words((typeof item === "string" ? item : item?.name ?? "").split(/[,(]/)[0] ?? "").filter((x) => !nameWords.has(x)).slice(0, 2).join(" ");
		if (phrase && !out.includes(phrase)) out.push(phrase);
		if (out.length >= max) break;
	}
	return out;
}
var DISH_TYPE = [
	[/alfredo|carbonara|bolognese|lasagn|penne|spaghetti|fettuccine|pasta/i, "pasta"],
	[/ramen|noodle|pho|udon|lo mein/i, "noodles"],
	[/curry|bunny chow|tikka|masala|korma/i, "curry"],
	[/burger/i, "burger bun"],
	[/taco|burrito|quesadilla/i, "tortilla"],
	[/pizza/i, "pizza"],
	[/salad/i, "salad bowl"],
	[/soup|stew|potjie/i, "stew bowl"],
	[/rice|jollof|biryani|risotto|paella/i, "rice"],
	[/pancake|waffle/i, "breakfast stack"],
	[/cake|pudding|pie|tart|brownie|cookie/i, "dessert"]
];
function buildQueries(r) {
	const name = r.name.trim();
	const ing = mainIngredients(r);
	const dish = DISH_TYPE.find(([re]) => re.test(name))?.[1];
	const cuisine = r.cuisine && !name.toLowerCase().includes(r.cuisine.toLowerCase()) ? r.cuisine : null;
	const diet = (r.diet_tags ?? []).find((t) => /vegan|vegetarian/i.test(t));
	const join = (...p) => p.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
	const qs = [
		join(name, dish && !name.toLowerCase().includes(dish) ? dish : null, ing[0], "food"),
		join(diet && !name.toLowerCase().includes(diet.toLowerCase()) ? diet.toLowerCase() : null, name, ing.slice(0, 2).join(" "), dish),
		join("authentic", cuisine, name, "dish"),
		join(name, "close up food photography"),
		join(name)
	];
	return [...new Set(qs.filter((q) => q.length > 2))];
}
/** Changes when the parts of a recipe that define the dish change. */
function recipeSignature(r) {
	const base = `${r.name}|${r.cuisine ?? ""}|${mainIngredients(r, 4).join(",")}`.toLowerCase();
	let h = 2166136261;
	for (let i = 0; i < base.length; i++) {
		h ^= base.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(36);
}
async function fetchJson(url, headers) {
	for (let attempt = 0; attempt < 2; attempt++) {
		const res = await fetch(url, { headers });
		if (res.ok) return res.json();
		const body = await res.text().catch(() => "");
		if (res.status === 429 || res.status >= 500) {
			console.warn(`[images] ${new URL(url).host} ${res.status}: ${body.slice(0, 200)}`);
			if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
			continue;
		}
		console.error(`[images] ${new URL(url).host} ${res.status}: ${body.slice(0, 200)}`);
		return null;
	}
	return null;
}
async function searchUnsplash(q) {
	const key = process.env["UNSPLASH_ACCESS_KEY"];
	return ((await fetchJson(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${PER_PAGE}&content_filter=high&orientation=landscape`, {
		Authorization: `Client-ID ${key}`,
		"Accept-Version": "v1"
	}))?.results ?? []).map((p) => ({
		provider: "Unsplash",
		id: String(p.id),
		url: `${p.urls?.raw}&w=1200&q=80&auto=format&fit=crop`,
		thumb: p.urls?.small,
		width: p.width,
		height: p.height,
		title: [
			p.alt_description,
			p.description,
			(p.tags ?? []).map((t) => t.title).join(" ")
		].filter(Boolean).join(" "),
		photographer: p.user?.name,
		photographerUrl: p.user?.links?.html ? `${p.user.links.html}?utm_source=mealmate&utm_medium=referral` : void 0,
		pageUrl: p.links?.html ? `${p.links.html}?utm_source=mealmate&utm_medium=referral` : void 0,
		downloadLocation: p.links?.download_location
	}));
}
async function searchPexels(q) {
	const key = process.env["PEXELS_API_KEY"];
	return ((await fetchJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${PER_PAGE}&orientation=landscape`, { Authorization: key }))?.photos ?? []).map((p) => ({
		provider: "Pexels",
		id: String(p.id),
		url: p.src?.large2x ?? p.src?.large,
		thumb: p.src?.medium,
		width: p.width,
		height: p.height,
		title: p.alt ?? "",
		photographer: p.photographer,
		photographerUrl: p.photographer_url,
		pageUrl: p.url
	}));
}
async function searchBing(q) {
	const key = process.env["BING_IMAGE_SEARCH_KEY"];
	return ((await fetchJson(`https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(q)}&count=${PER_PAGE}&imageType=Photo&aspect=Wide&safeSearch=Strict&license=Public`, { "Ocp-Apim-Subscription-Key": key }))?.value ?? []).map((p) => ({
		provider: "Bing",
		id: String(p.imageId ?? p.contentUrl),
		url: p.contentUrl,
		thumb: p.thumbnailUrl,
		width: p.width,
		height: p.height,
		title: p.name ?? "",
		pageUrl: p.hostPageUrl
	}));
}
var SEARCHERS = {
	Unsplash: searchUnsplash,
	Pexels: searchPexels,
	Bing: searchBing
};
/** Search with a shared database cache so the same query never hits the API twice in a week. */
async function searchProvider(provider, q) {
	const cacheKey = `${provider}:${q.toLowerCase()}`;
	const { data: cached } = await firebaseAdmin.from("image_search_cache").select("results,created_at").eq("cache_key", cacheKey).maybeSingle();
	if (cached && Date.now() - new Date(cached.created_at).getTime() < CACHE_TTL_MS) return cached.results;
	const results = (await SEARCHERS[provider](q)).filter((c) => c.url && c.thumb);
	await firebaseAdmin.from("image_search_cache").upsert({
		cache_key: cacheKey,
		provider,
		query: q,
		results,
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	});
	return results;
}
var CONFLICTS = [
	[/alfredo/i, /bolognese|marinara|tomato sauce|curry|pizza|mac and cheese|macaroni/i],
	[/chicken/i, /\bbeef\b|steak|pork|salmon|shrimp|prawn/i],
	[/beef|steak/i, /chicken|salmon|shrimp|tofu/i],
	[/vegan|vegetarian/i, /chicken|beef|pork|bacon|steak|fish|shrimp/i],
	[/curry/i, /pizza|burger|pasta/i],
	[/pizza/i, /burger|pasta|salad|curry/i],
	[/burger/i, /pizza|pasta|curry/i]
];
var NON_FOOD = /\blogo|screenshot|menu|collage|text|sign|poster|illustration|vector|icon|cartoon|people|woman|man\b/i;
function metaScore(c, r) {
	const hay = c.title.toLowerCase();
	const nameWords = words(r.name);
	const ing = mainIngredients(r);
	let s = 0;
	if (nameWords.length) s += 40 * (nameWords.filter((w) => hay.includes(w)).length / nameWords.length);
	if (ing.length) s += 20 * (ing.filter((w) => hay.includes(w.split(" ")[0])).length / ing.length);
	if (r.cuisine && hay.includes(r.cuisine.toLowerCase())) s += 5;
	if (/food|dish|meal|plate|bowl|cuisine/.test(hay)) s += 5;
	const px = (c.width ?? 0) * (c.height ?? 0);
	s += px >= 2e6 ? 15 : px >= 8e5 ? 8 : 0;
	const ratio = c.width && c.height ? c.width / c.height : 1;
	s += ratio >= .95 && ratio <= 1.9 ? 10 : 0;
	if (c.provider !== "Bing") s += 5;
	for (const [want, conflict] of CONFLICTS) if (want.test(r.name) && conflict.test(hay) && !conflict.test(r.name)) s -= 40;
	if (NON_FOOD.test(hay)) s -= 15;
	return Math.max(0, Math.min(100, Math.round(s)));
}
function recipeSummary(r) {
	return [
		`Name: ${r.name}`,
		r.cuisine ? `Cuisine: ${r.cuisine}` : null,
		r.category || r.meal_type ? `Type: ${r.category ?? r.meal_type}` : null,
		`Main ingredients: ${mainIngredients(r, 6).join(", ") || "unknown"}`,
		r.description ? `Description: ${r.description.slice(0, 300)}` : null
	].filter(Boolean).join("\n");
}
/**
* Scores each candidate 0-100 for "this photo shows this exact dish".
* Returns null if AI is unavailable, so the caller falls back to metadata-only ranking.
*/
async function aiScore(r, cands) {
	if (cands.length === 0) return null;
	try {
		const content = [{
			type: "text",
			text: `You verify food photos for a recipe app. Score how well EACH image shows exactly this dish from 0 to 100.\nRECIPE:\n${recipeSummary(r)}\n\n90+ means exact dish; 70-89 means very likely; 40-69 means similar or unclear; under 40 means a different dish or non-food. Penalize a different main protein, sauce, or dish type heavily. Reject watermarks, visible text, blur, distorted food, illustrations and unappetising lighting with a score below 40. Prefer rich natural colours, fresh textures, clear plating and professional natural light. Return one integer score per image in order.`
		}, ...cands.flatMap((candidate, index) => [{
			type: "text",
			text: `Image ${index + 1} metadata: ${candidate.title.slice(0, 160) || "none"}`
		}, {
			type: "image",
			image: new URL(candidate.thumb)
		}])];
		return (await generateAiObject({
			feature: "image.relevance",
			messages: [{
				role: "user",
				content
			}],
			schema: objectType({ scores: arrayType(numberType().int().min(0).max(100)).length(cands.length) }),
			timeoutMs: 3e4
		})).scores;
	} catch (error) {
		console.warn("[MealMate images] Relevance check unavailable; using metadata ranking.", { errorName: error instanceof Error ? error.name : "UnknownError" });
		return null;
	}
}
function dedupe(cands) {
	const seen = /* @__PURE__ */ new Set();
	return cands.filter((c) => {
		const k = `${c.provider}:${c.id}`;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}
/** Rank candidates for one query: metadata first, then AI on the top few. */
async function rank(r, cands, aiTop = 6) {
	const top = dedupe(cands).map((c) => ({
		...c,
		metaScore: metaScore(c, r)
	})).filter((c) => (c.metaScore ?? 0) >= 15).sort((a, b) => (b.metaScore ?? 0) - (a.metaScore ?? 0)).slice(0, aiTop);
	const ai = await aiScore(r, top);
	return top.map((c, i) => {
		const aiS = ai ? ai[i] : void 0;
		const score = aiS !== void 0 ? Math.round(aiS * .8 + (c.metaScore ?? 0) * .2) : Math.round((c.metaScore ?? 0) * .85);
		return {
			...c,
			aiScore: aiS,
			score
		};
	}).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
/** Progressive search: each query across providers until a confident match is found. */
async function findBestImage(r, maxQueries = 4) {
	const providers = configuredProviders();
	if (providers.length === 0) return {
		best: null,
		query: null,
		tried: [],
		reason: "no_provider"
	};
	const tried = [];
	let bestSoFar = null;
	for (const q of buildQueries(r).slice(0, maxQueries)) {
		tried.push(q);
		for (const p of providers) {
			const top = (await rank(r, await searchProvider(p, q)))[0];
			if (top && (!bestSoFar || (top.score ?? 0) > (bestSoFar.c.score ?? 0))) bestSoFar = {
				c: top,
				q
			};
			if (top && (top.score ?? 0) >= 70) return {
				best: top,
				query: q,
				tried
			};
		}
	}
	return {
		best: null,
		query: bestSoFar?.q ?? null,
		tried,
		reason: "low_confidence"
	};
}
/** Several good alternatives for the "Change image" picker. */
async function findAlternatives(r, limit = 8) {
	const providers = configuredProviders();
	const pool = [];
	for (const q of buildQueries(r).slice(0, 2)) for (const p of providers) pool.push(...await searchProvider(p, q));
	return (await rank(r, pool, 12)).filter((c) => (c.score ?? 0) >= 40).slice(0, limit);
}
async function saveImage(recipeId, c, query, opts) {
	if (c.provider === "Unsplash" && c.downloadLocation && process.env["UNSPLASH_ACCESS_KEY"]) fetch(c.downloadLocation, { headers: { Authorization: `Client-ID ${process.env["UNSPLASH_ACCESS_KEY"]}` } }).catch(() => {});
	const { error } = await firebaseAdmin.from("recipes").update({
		image_url: c.url,
		image_source: c.provider,
		image_query: query,
		image_confidence: c.score ?? null,
		image_attribution: {
			photographer: c.photographer ?? null,
			photographerUrl: c.photographerUrl ?? null,
			pageUrl: c.pageUrl ?? null
		},
		image_checked_at: (/* @__PURE__ */ new Date()).toISOString(),
		image_signature: opts.signature,
		image_locked: opts.locked ?? false
	}).eq("id", recipeId);
	if (error) throw error;
}
async function markChecked(recipeId, signature) {
	await firebaseAdmin.from("recipes").update({
		image_checked_at: (/* @__PURE__ */ new Date()).toISOString(),
		image_signature: signature
	}).eq("id", recipeId);
}
/** True when the stored image is trustworthy and current. */
function needsSearch(row, signature) {
	if (row.image_locked) return false;
	if (!!row.image_source && (row.image_confidence ?? 0) >= 70 && row.image_signature === signature) return false;
	if (row.image_checked_at && row.image_signature === signature && Date.now() - new Date(row.image_checked_at).getTime() < 864e5) return false;
	return true;
}
function stepText(steps, max = 6) {
	if (!Array.isArray(steps)) return "";
	return steps.slice(0, max).map((s, i) => `${i + 1}. ${typeof s === "string" ? s : s?.text ?? s?.instruction ?? s?.step ?? ""}`.slice(0, 160)).join("\n");
}
function ingredientText(ingredients, max = 14) {
	if (!Array.isArray(ingredients)) return "";
	return ingredients.slice(0, max).map((x) => typeof x === "string" ? x : [
		x?.quantity,
		x?.unit,
		x?.name ?? x?.item
	].filter(Boolean).join(" ")).filter(Boolean).join(", ");
}
/** Generates a photo of the finished dish from its ingredients + steps and stores it on the recipe. */
async function generateAndSaveAiImage(r, signature) {
	assertRecipePhotoStorageConfigured();
	const prompt = `Photorealistic food photograph of the finished dish "${r.name}"${r.cuisine ? ` (${r.cuisine} cuisine)` : ""}, exactly as made by this recipe.\nIngredients: ${ingredientText(r.ingredients)}\nMethod:\n${stepText(r.steps)}\nPremium editorial food photography: show the finished dish clearly, close enough to reveal appetising textures while keeping its identity and plating understandable. Choose an overhead angle for flat dishes, salads and bowls; a 45-degree angle for layered dishes and baking; a low close-up for stacked food. Soft natural window light, gentle shadows, realistic depth of field with the main ingredients in focus, rich natural colours, neutral ceramic tableware and a quiet tasteful background. Match the actual method: crisp fresh leaves for salads, natural sauce gloss for pasta, char only for grilled food, delicate steam only for hot food, tender crumb for baking. Only show cheese, herbs, sauces, garnishes and sides present in the recipe. No invented ingredients. Respect the cuisine and dietary requirements. Keep the dish centred with safe space for square and landscape crops. No text, watermark, labels, people or hands. No plastic textures, artificial glow, oversaturation, illustration or distorted food.`;
	const image = await generateAiImage(prompt, {
		feature: "recipe.image",
		size: "1536x1024"
	});
	if (image.bytes.byteLength === 0 || image.bytes.byteLength > 20971520) throw new Error("Generated image was empty or exceeded the storage size limit.");
	if (!image.mediaType.startsWith("image/")) throw new Error("AI Gateway returned a non-image response.");
	const extension = image.mediaType === "image/jpeg" ? "jpg" : image.mediaType === "image/webp" ? "webp" : "png";
	const path = `${r.id}/${signature}.${extension}`;
	const imageUrl = await uploadRecipePhoto(path, image.bytes, image.mediaType);
	try {
		const { error } = await firebaseAdmin.from("recipes").update({
			image_url: imageUrl,
			image_source: "AI",
			image_query: r.name,
			image_confidence: 100,
			image_attribution: {
				generated: true,
				model: image.model
			},
			image_checked_at: (/* @__PURE__ */ new Date()).toISOString(),
			image_signature: signature
		}).eq("id", r.id);
		if (error) throw error;
	} catch (error) {
		try {
			await deleteRecipePhoto(imageUrl);
		} catch (cleanupError) {
			console.error("[MealMate images] Unreferenced photo cleanup failed", { errorName: cleanupError instanceof Error ? cleanupError.name : "UnknownError" });
		}
		throw error;
	}
	return imageUrl;
}
//#endregion
export { recipeSignature as a, needsSearch as i, findBestImage as n, recipe_images_server_BiL7FiRA_exports as o, generateAndSaveAiImage as r, saveImage as s, configuredProviders as t };
