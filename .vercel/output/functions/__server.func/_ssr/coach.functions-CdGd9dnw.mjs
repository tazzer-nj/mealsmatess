import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { a as objectType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as enforceRateLimit, r as trackEvent } from "./security.server-D83_qD0_.mjs";
import { s as generateAiText } from "./ai-engine.server-BOPxPIhJ.mjs";
import { s as preferenceSummary } from "./preferences-CRPr2kaW.mjs";
import { t as aiProfile } from "./ai-profile-BwyyKmAQ.mjs";
import { n as requireAiCredit } from "./ai-credits.server-BOnqFVyn.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coach.functions-CdGd9dnw.js
var MessageSchema = objectType({
	role: enumType(["user", "assistant"]),
	content: stringType().min(1).max(2e3)
});
var InputSchema = objectType({ messages: arrayType(MessageSchema).min(1).max(30) });
function profileSummary(p) {
	if (!p) return "No profile on file yet — ask the user for their goal, allergies, and any dietary preferences before giving specific numbers.";
	const bits = [];
	if (p.display_name) bits.push(`Name: ${p.display_name}`);
	if (p.age) bits.push(`Age: ${p.age}`);
	if (p.weight_kg) bits.push(`Weight: ${p.weight_kg} kg`);
	if (p.height_cm) bits.push(`Height: ${p.height_cm} cm`);
	if (p.goal) bits.push(`Goal: ${p.goal}`);
	if (p.activity_level) bits.push(`Activity: ${p.activity_level}`);
	if (p.family_size && p.family_size > 1) bits.push(`Cooks for: ${p.family_size} people`);
	if (p.budget_per_day) bits.push(`Daily food budget: ${p.budget_per_day} ${p.currency ?? "USD"}`);
	if (p.dietary_preferences?.length) bits.push(`Diet: ${p.dietary_preferences.join(", ")}`);
	if (p.allergies?.length) bits.push(`Allergies / avoid: ${p.allergies.join(", ")}`);
	return bits.length ? bits.join("\n") : "Profile exists but has no health details filled in.";
}
var SYSTEM = (summary) => `You are MealMate's AI Nutrition Coach — a warm, evidence-based coach (think dietitian, not a doctor). You give personalized, practical advice tailored to the user's profile below.

USER PROFILE:
${summary}

RULES:
- Personalize every answer to THIS user's profile. Reference their goal, allergies, and constraints explicitly.
- Never suggest anything on their allergy or avoid list. Offer clear substitutions instead.
- If they ask for calorie/macro targets and their weight/height/age/activity are known, estimate TDEE using Mifflin-St Jeor and adjust for their goal (-500 kcal for fat loss, +250-500 for muscle gain, maintenance otherwise). Show your math briefly.
- If profile data is missing for a specific calculation, ask ONE targeted question first.
- Be concrete: give foods, portion sizes, timing, budget-friendly swaps. Prefer whole foods.
- Keep answers scannable — short paragraphs and bullet lists. No medical claims. No "consult a doctor" disclaimers unless the topic is truly medical (medication, disease, pregnancy).
- Plain markdown only. No headings above H3.`;
async function callChat(messages) {
	const [systemMessage, ...conversation] = messages;
	return generateAiText({
		feature: "nutrition.coach",
		...systemMessage?.role === "system" ? { instructions: systemMessage.content } : {},
		messages: conversation.map((message) => ({
			role: message.role,
			content: message.content
		}))
	});
}
var nutritionCoach_createServerFn_handler = createServerRpc({
	id: "2ac9957454b923e50fa7cbe98089c71666c4035f6878a51a5be78be56a719534",
	name: "nutritionCoach",
	filename: "src/lib/coach.functions.ts"
}, (opts) => nutritionCoach.__executeServer(opts));
var nutritionCoach = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => InputSchema.parse(v)).handler(nutritionCoach_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	await enforceRateLimit("ai_chat", context.userId, 20);
	const { firebase, userId } = context;
	const { data: savedProfile } = await firebase.from("profiles").select("display_name,dietary_preferences,goal,activity_level,allergies,budget_per_day,age,weight_kg,height_cm,family_size,currency,preferences").eq("id", userId).maybeSingle();
	const profile = aiProfile(savedProfile);
	const summary = [profileSummary(profile), profile ? preferenceSummary(profile.preferences) : ""].filter(Boolean).join("\n");
	const t0 = Date.now();
	try {
		const answer = await callChat([{
			role: "system",
			content: SYSTEM(summary)
		}, ...data.messages]);
		trackEvent({
			user_id: userId,
			kind: "ai",
			name: "ai.nutrition_coach",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				turns: data.messages.length,
				a_len: answer.length
			}
		});
		return { answer };
	} catch (e) {
		trackEvent({
			user_id: userId,
			kind: "ai",
			name: "ai.nutrition_coach",
			latency_ms: Date.now() - t0,
			success: false,
			error: e instanceof Error ? e.message.slice(0, 500) : String(e)
		});
		throw e;
	}
});
var getCoachContext_createServerFn_handler = createServerRpc({
	id: "5da961d855c6b80baf00c15d9c08942fa13be55dd33b9ff909bd1d284ea2f9b8",
	name: "getCoachContext",
	filename: "src/lib/coach.functions.ts"
}, (opts) => getCoachContext.__executeServer(opts));
var getCoachContext = createServerFn({ method: "GET" }).middleware([requirePremium]).handler(getCoachContext_createServerFn_handler, async ({ context }) => {
	const { data: savedProfile } = await context.firebase.from("profiles").select("display_name,goal,activity_level,allergies,dietary_preferences,budget_per_day,age,weight_kg,height_cm,family_size,currency,preferences").eq("id", context.userId).maybeSingle();
	const p = aiProfile(savedProfile) ?? null;
	const missing = [];
	if (!p?.goal) missing.push("goal");
	if (!p?.weight_kg) missing.push("weight");
	if (!p?.height_cm) missing.push("height");
	if (!p?.age) missing.push("age");
	if (!p?.activity_level) missing.push("activity level");
	return {
		profile: p,
		missing
	};
});
//#endregion
export { getCoachContext_createServerFn_handler, nutritionCoach_createServerFn_handler };
