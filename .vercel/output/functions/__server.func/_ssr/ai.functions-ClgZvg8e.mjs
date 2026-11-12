import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, i as numberType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-ClgZvg8e.js
objectType({
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
var surpriseMe = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(createSsrRpc("1f00c01a15e8a042024d250fd957f161dfbec48b227c7e628132ccbdcfbc89ac"));
var generateRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ query: stringType().trim().min(1).max(200) }).parse(v)).handler(createSsrRpc("ecbb7b869e5e27b8dd2d746ea6dc3738b9c882b21562ae206ef823a3806541e3"));
var scanKitchen = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ imageDataUrl: stringType().startsWith("data:image/").max(112e5) }).parse(v)).handler(createSsrRpc("0c92cfbebf2cf3795d10c73f062871dce38d862cdf63d354a13a469cc6cfb806"));
var scanDish = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ imageDataUrl: stringType().startsWith("data:image/").max(112e5) }).parse(v)).handler(createSsrRpc("5a106af67d75a9c8aee1989ca0f4c435fc18f71029b8cd8a812dfdbaa121bf1b"));
createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ question: stringType().trim().min(1).max(500) }).parse(v)).handler(createSsrRpc("f93759fb29dc9b8b3247cc3d4deae07fd003af95521cbd7146e81ba13f4db7b1"));
var regenerateRecipeImage = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ slug: stringType().min(1) }).parse(v)).handler(createSsrRpc("33c8b25718a2a43fb174ed9d5a156b10ac1153d9a127bdb129e2ec65b8376814"));
//#endregion
export { surpriseMe as a, scanKitchen as i, regenerateRecipeImage as n, scanDish as r, generateRecipe as t };
