import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as listFeatureFlags } from "./feature-flags.functions-BguzsvVA.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-feature-flag-Dcg0eXe5.js
var MEAL_TYPES = [
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snack"
];
var PlanInput = objectType({
	days: numberType().int().min(1).max(14).default(7),
	meals: arrayType(enumType(MEAL_TYPES)).min(1).max(MEAL_TYPES.length).default([
		"Breakfast",
		"Lunch",
		"Dinner"
	]),
	startDate: stringType().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
}).superRefine(({ startDate }, context) => {
	if (!startDate) return;
	const parsed = /* @__PURE__ */ new Date(`${startDate}T00:00:00.000Z`);
	if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== startDate) context.addIssue({
		code: "custom",
		path: ["startDate"],
		message: "Use a real calendar date."
	});
});
var generatePersonalizedPlan = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => PlanInput.parse(v)).handler(createSsrRpc("cc77a4c4def7f619892da682f5caa522bd3f8db6a00e83f0748575f6ead774fc"));
var buildGroceryFromPlan = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	from: stringType(),
	to: stringType()
}).parse(v)).handler(createSsrRpc("b0537811258d50c85ea100d5b24f30d26e5c6b86fb3510af716e559909542796"));
var PlanAndShopInput = objectType({
	days: numberType().int().min(1).max(7).default(7),
	meals: arrayType(stringType()).default([
		"Breakfast",
		"Lunch",
		"Dinner"
	]),
	startDate: stringType().optional(),
	replaceExisting: booleanType().default(false)
});
var aiPlanAndShop = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => PlanAndShopInput.parse(v)).handler(createSsrRpc("cdf655ec6baf7532fd1845f81a2630787650cf675788cd4293b967cac379694b"));
var suggestSubstitutions = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	ingredient: stringType().min(1).max(120),
	context: stringType().max(300).optional()
}).parse(v)).handler(createSsrRpc("684b10b81331c684e23e7eb702f79bfccc372dafaa028f0b6371c0424bb66dd6"));
function useFeatureFlags() {
	return useQuery({
		queryKey: ["feature-flags"],
		queryFn: () => listFeatureFlags(),
		staleTime: 6e4
	});
}
function useFeatureFlag(key, fallback = false) {
	const { data } = useFeatureFlags();
	const flag = data?.find((f) => f.key === key);
	if (!flag) return fallback;
	return !!flag.enabled;
}
//#endregion
export { useFeatureFlag as a, suggestSubstitutions as i, buildGroceryFromPlan as n, generatePersonalizedPlan as r, aiPlanAndShop as t };
