//#region node_modules/.nitro/vite/services/ssr/assets/preferences-CRPr2kaW.js
var EMPTY_PREFERENCES = {
	goal: null,
	favorite_foods: [],
	allergies: [],
	dietary_restrictions: [],
	disliked_foods: [],
	meals_per_day: null,
	cooking_level: null,
	cooking_time: null,
	food_budget: null,
	preferred_features: [],
	onboarding_completed: false,
	updated_at: null
};
var KEY = "mealmate.preferences.v1";
var SEEN_KEY = "mealmate.onboarding-seen.v1";
var PREFERENCES_EVENT = "mealmate:preferences";
function asStringArray(v) {
	return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}
function asString(v) {
	return typeof v === "string" && v ? v : null;
}
function normalizePreferences(raw) {
	const o = raw ?? {};
	return {
		goal: asString(o["goal"]),
		favorite_foods: asStringArray(o["favorite_foods"]),
		allergies: asStringArray(o["allergies"]),
		dietary_restrictions: asStringArray(o["dietary_restrictions"]),
		disliked_foods: asStringArray(o["disliked_foods"]),
		meals_per_day: asString(o["meals_per_day"]),
		cooking_level: asString(o["cooking_level"]),
		cooking_time: asString(o["cooking_time"]),
		food_budget: asString(o["food_budget"]),
		preferred_features: asStringArray(o["preferred_features"]),
		onboarding_completed: o["onboarding_completed"] === true,
		updated_at: asString(o["updated_at"])
	};
}
function readLocalPreferences() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		return normalizePreferences(JSON.parse(raw));
	} catch {
		return null;
	}
}
function writeLocalPreferences(prefs) {
	if (typeof window === "undefined") return;
	const next = {
		...prefs,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	window.localStorage.setItem(KEY, JSON.stringify(next));
	window.localStorage.setItem(SEEN_KEY, "1");
	window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}
function clearLocalPreferences() {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(KEY);
	window.localStorage.removeItem(SEEN_KEY);
	window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
}
function haystack(...parts) {
	return parts.flatMap((p) => Array.isArray(p) ? p : [p]).filter(Boolean).join(" ").toLowerCase();
}
/** Anything the user must not be served: allergies, restrictions, dislikes. */
function avoidTerms(prefs) {
	return [
		...prefs.allergies,
		...prefs.dietary_restrictions,
		...prefs.disliked_foods
	].map((t) => t.trim().toLowerCase()).filter((t) => t.length > 2);
}
function isAvoided(prefs, ...text) {
	const hay = haystack(...text);
	if (!hay) return false;
	return avoidTerms(prefs).some((term) => hay.includes(term));
}
/** Higher is a better match for this user. */
function preferenceScore(prefs, ...text) {
	const hay = haystack(...text);
	if (!hay) return 0;
	if (isAvoided(prefs, hay)) return -100;
	let score = 0;
	for (const like of prefs.favorite_foods) if (hay.includes(like.toLowerCase())) score += 3;
	if (prefs.goal === "Eat healthier" || prefs.goal === "Lose weight") {
		if (/(healthy|salad|veg|grill|light|bowl)/.test(hay)) score += 2;
	}
	if (prefs.goal === "Build muscle" || prefs.goal === "Gain weight") {
		if (/(protein|chicken|beef|steak|egg|bean)/.test(hay)) score += 2;
	}
	if (prefs.goal === "Save money" || prefs.food_budget === "Budget friendly") {
		if (/(budget|value|affordable|simple|deal)/.test(hay)) score += 1;
	}
	return score;
}
/** Sort a list so better-matching, non-avoided items come first (stable). */
function personalize(prefs, items, textOf) {
	if (!prefs || !prefs.onboarding_completed) return items;
	return items.map((item, i) => ({
		item,
		i,
		score: preferenceScore(prefs, ...textOf(item))
	})).sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.item);
}
/** A short line the AI and UI can use to explain the user's taste. */
function preferenceSummary(prefs) {
	const bits = [];
	if (prefs.goal) bits.push(`Goal: ${prefs.goal}`);
	if (prefs.favorite_foods.length) bits.push(`Enjoys: ${prefs.favorite_foods.join(", ")}`);
	if (prefs.allergies.length) bits.push(`Must avoid: ${prefs.allergies.join(", ")}`);
	if (prefs.dietary_restrictions.length) bits.push(`Diet: ${prefs.dietary_restrictions.join(", ")}`);
	if (prefs.disliked_foods.length) bits.push(`Dislikes: ${prefs.disliked_foods.join(", ")}`);
	if (prefs.cooking_time) bits.push(`Time to cook: ${prefs.cooking_time}`);
	if (prefs.cooking_level) bits.push(`Skill: ${prefs.cooking_level}`);
	if (prefs.food_budget) bits.push(`Budget: ${prefs.food_budget}`);
	return bits.join(" · ");
}
var TOUR_KEY = "mealmate.tour-seen.v1";
function markTourSeen() {
	try {
		window.localStorage.setItem(TOUR_KEY, "1");
	} catch {}
}
//#endregion
export { normalizePreferences as a, readLocalPreferences as c, markTourSeen as i, writeLocalPreferences as l, PREFERENCES_EVENT as n, personalize as o, clearLocalPreferences as r, preferenceSummary as s, EMPTY_PREFERENCES as t };
