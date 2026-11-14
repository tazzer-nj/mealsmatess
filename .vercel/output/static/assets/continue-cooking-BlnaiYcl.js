import { t as createLucideIcon } from "./createLucideIcon-5qODTz61.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var MessageCircleQuestionMark = createLucideIcon("message-circle-question-mark", [
	["path", {
		d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
		key: "1sd12s"
	}],
	["path", {
		d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
		key: "1u773s"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]);
//#endregion
//#region src/lib/continue-cooking.ts
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
export { setContinueCooking as n, MessageCircleQuestionMark as r, getContinueCooking as t };
