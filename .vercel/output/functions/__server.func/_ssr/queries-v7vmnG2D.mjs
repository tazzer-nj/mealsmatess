import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import "../_libs/firebase.mjs";
import { d as collection, o as orderBy, r as getDocs, s as query, u as where } from "../_libs/@firebase/firestore+[...].mjs";
import { a as db, i as auth, n as OperationType, o as handleFirestoreError } from "./hub-surface-DqCmg7ui.mjs";
import { a as objectType, i as numberType, s as stringType } from "../_libs/zod.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-v7vmnG2D.js
var listRecipeCatalog = createServerFn({ method: "GET" }).middleware([requirePremium]).validator((input) => objectType({
	category: stringType().trim().max(80).optional(),
	search: stringType().trim().max(200).default(""),
	limit: numberType().int().min(1).max(60).default(60)
}).parse(input)).handler(createSsrRpc("1d96a095b1ef1a866a72268d189c1b8c76b8fab126563222107bda8db358aa8d"));
var getRecipeCatalogEntry = createServerFn({ method: "GET" }).middleware([requirePremium]).validator((input) => objectType({ slug: stringType().trim().min(1).max(300) }).parse(input)).handler(createSsrRpc("d6e10695f79ccd42abf6f4630f2ce7b83374e4af8dd6d610907510f7d59821dd"));
var list = async (collectionName, constraints = []) => {
	try {
		return (await getDocs(query(collection(db, collectionName), ...constraints))).docs.map((item) => ({
			id: item.id,
			...item.data()
		}));
	} catch (error) {
		handleFirestoreError(error, OperationType.LIST, collectionName);
		return [];
	}
};
var trendingRecipesQuery = () => queryOptions({
	queryKey: ["recipes", "trending"],
	queryFn: () => listRecipeCatalog({ data: { limit: 8 } })
});
var southAfricanFavoritesQuery = () => queryOptions({
	queryKey: ["recipes", "south-african"],
	queryFn: () => listRecipeCatalog({ data: {
		category: "South African",
		limit: 8
	} })
});
var recipesByCategoryQuery = (category, search = "") => queryOptions({
	queryKey: [
		"recipes",
		"category",
		category ?? "all",
		search.trim().toLowerCase()
	],
	queryFn: () => listRecipeCatalog({ data: {
		category,
		search
	} })
});
var recipeBySlugQuery = (slug) => queryOptions({
	queryKey: ["recipe", slug],
	queryFn: () => getRecipeCatalogEntry({ data: { slug } })
});
var myFavoritesQuery = () => queryOptions({
	queryKey: ["favorites"],
	queryFn: async () => {
		const user = auth.currentUser;
		if (!user) return [];
		return await list(`users/${user.uid}/favorites`, [orderBy("created_at", "desc")]);
	}
});
var myGroceryQuery = () => queryOptions({
	queryKey: ["grocery"],
	queryFn: async () => auth.currentUser ? await list(`users/${auth.currentUser.uid}/grocery`, [orderBy("checked"), orderBy("created_at", "desc")]) : []
});
var myPantryQuery = () => queryOptions({
	queryKey: ["pantry"],
	queryFn: async () => auth.currentUser ? await list(`users/${auth.currentUser.uid}/pantry`, [orderBy("created_at", "desc")]) : []
});
var myPlannerQuery = (fromISO, toISO) => queryOptions({
	queryKey: [
		"planner",
		fromISO,
		toISO
	],
	queryFn: async () => auth.currentUser ? await list(`users/${auth.currentUser.uid}/mealPlans`, [
		where("plan_date", ">=", fromISO),
		where("plan_date", "<=", toISO),
		orderBy("plan_date")
	]) : []
});
//#endregion
export { recipeBySlugQuery as a, trendingRecipesQuery as c, myPlannerQuery as i, myGroceryQuery as n, recipesByCategoryQuery as o, myPantryQuery as r, southAfricanFavoritesQuery as s, myFavoritesQuery as t };
