import { a as normalizePreferences } from "./preferences-CRPr2kaW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-profile-BwyyKmAQ.js
/** Read current onboarding answers, falling back to profiles saved before onboarding. */
function aiProfile(profile) {
	if (!profile) return null;
	const row = profile;
	const saved = row["preferences"];
	const preferences = normalizePreferences({
		goal: row["goal"],
		allergies: row["allergies"],
		dietary_restrictions: row["dietary_preferences"],
		...saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {}
	});
	return {
		...profile,
		goal: preferences.goal,
		allergies: preferences.allergies,
		dietary_preferences: preferences.dietary_restrictions,
		preferences
	};
}
//#endregion
export { aiProfile as t };
