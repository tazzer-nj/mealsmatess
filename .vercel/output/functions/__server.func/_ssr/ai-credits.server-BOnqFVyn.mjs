//#region node_modules/.nitro/vite/services/ssr/assets/ai-credits.server-BOnqFVyn.js
var AiLimitError = class extends Error {
	reason;
	resetsAt;
	constructor(reason, resetsAt) {
		const when = resetsAt ? new Date(resetsAt).toLocaleString("en-ZA", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: "UTC"
		}) + " UTC" : "soon";
		super(reason === "daily" ? `MEALMATE_LIMIT_AI_DAILY: You've used today's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.` : `MEALMATE_LIMIT_AI_MONTHLY: You've used this month's Mia AI allowance. It resets ${when}. Upgrade to MealMate Premium for more.`);
		this.reason = reason;
		this.resetsAt = resetsAt;
	}
};
async function requireAiCredit(userId) {
	const { requireActivePremium } = await import("./revenuecat-C1ChHDlc.mjs");
	await requireActivePremium(userId);
	const { firebaseAdmin } = await import("./firebase-admin-ChN7VIWw.mjs").then((n) => n.n).then((n) => n.n);
	const { data, error } = await firebaseAdmin.rpc("consume_ai_credit", { _user_id: userId });
	if (error) throw new Error(`Could not check your Mia AI allowance: ${error.message}`);
	const r = data;
	if (!r?.allowed) throw new AiLimitError(r?.reason ?? "daily", r?.resets_at ?? null);
}
//#endregion
export { requireAiCredit as n, AiLimitError as t };
