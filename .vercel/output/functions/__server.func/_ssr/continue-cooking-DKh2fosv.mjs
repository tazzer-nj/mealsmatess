//#region node_modules/.nitro/vite/services/ssr/assets/continue-cooking-DKh2fosv.js
var KEY = "mealmate-continue-cooking";
function getContinueCooking() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setContinueCooking(entry) {
	if (typeof window === "undefined") return;
	const existing = getContinueCooking();
	const progress = existing?.slug === entry.slug ? Math.min(90, existing.progress + 15) : 20;
	const next = {
		...entry,
		progress,
		updatedAt: Date.now()
	};
	window.localStorage.setItem(KEY, JSON.stringify(next));
}
//#endregion
export { setContinueCooking as n, getContinueCooking as t };
