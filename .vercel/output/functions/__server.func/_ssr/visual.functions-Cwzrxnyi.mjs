import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as enforceRateLimit, r as trackEvent } from "./security.server-D83_qD0_.mjs";
import { a as generateAiObject, i as generateAiImage, o as generateAiSpeech } from "./ai-engine.server-BOPxPIhJ.mjs";
import { n as requireAiCredit } from "./ai-credits.server-BOnqFVyn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visual.functions-Cwzrxnyi.js
var VisualInput = objectType({
	prompt: stringType().min(3).max(600),
	scenes: numberType().int().min(3).max(6).default(4),
	narration: booleanType().default(true)
});
var ScriptSchema = objectType({
	title: stringType().trim().min(1).max(160),
	kind: enumType([
		"educational",
		"business",
		"creative"
	]).default("educational"),
	summary: stringType().trim().min(1).max(500),
	style_note: stringType().max(300).default(""),
	scenes: arrayType(objectType({
		heading: stringType().trim().min(1).max(80),
		narration: stringType().trim().min(1).max(600),
		subtitle: stringType().max(180).default(""),
		image_prompt: stringType().trim().min(1).max(500)
	})).min(1).max(6)
});
async function b64Image(prompt) {
	try {
		const image = await generateAiImage(prompt, {
			feature: "visual.image",
			size: "1024x1024",
			timeoutMs: 9e4
		});
		return `data:${image.mediaType};base64,${Buffer.from(image.bytes).toString("base64")}`;
	} catch {
		return null;
	}
}
async function b64Speech(text) {
	try {
		const audio = await generateAiSpeech(text, { feature: "visual.narration" });
		return `data:${audio.mediaType};base64,${Buffer.from(audio.bytes).toString("base64")}`;
	} catch {
		return null;
	}
}
/**
* Premium AI Visual Mode — turns any prompt into an animated, narrated
* visual explanation (scene script + AI illustrations + voice narration).
*/
var generateVisualExplanation_createServerFn_handler = createServerRpc({
	id: "10efa679dca1e1bca48216ea3d9924dafb2f865f3fa643397fcfa7394c96acb5",
	name: "generateVisualExplanation",
	filename: "src/lib/visual.functions.ts"
}, (opts) => generateVisualExplanation.__executeServer(opts));
var generateVisualExplanation = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => VisualInput.parse(v)).handler(generateVisualExplanation_createServerFn_handler, async ({ data, context }) => {
	await requireAiCredit(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: sub } = await firebaseAdmin.from("subscriptions").select("tier,status,period_end").eq("user_id", context.userId).in("status", [
		"trialing",
		"active",
		"in_grace"
	]).order("period_end", {
		ascending: false,
		nullsFirst: false
	}).limit(1).maybeSingle();
	if (!(!!sub && (sub.tier === "lifetime" || !sub.period_end || new Date(sub.period_end).getTime() > Date.now()))) throw new Error("Visual Mode is a Premium feature");
	await enforceRateLimit("ai_visual", context.userId, 15);
	const t0 = Date.now();
	try {
		const script = await generateAiObject({
			feature: "visual.script",
			instructions: `You are a motion-design director and explainer scriptwriter. Classify the prompt as educational, business, or creative, then write a concise, accurate animated explanation. Return exactly ${data.scenes} distinct scenes. Each scene has a short heading, one or two spoken sentences, a concise subtitle, and detailed art direction for an image with no text.`,
			prompt: data.prompt,
			schema: ScriptSchema.extend({ scenes: ScriptSchema.shape.scenes.length(data.scenes) })
		});
		const styleSuffix = script.kind === "business" ? "clean corporate infographic illustration, flat vector, generous negative space, muted professional palette" : script.kind === "creative" ? "cinematic concept art, dramatic lighting, rich colour grading, film still" : "friendly educational diagram illustration, clear labelled shapes, bright cohesive palette, flat vector";
		const scenes = await Promise.all(script.scenes.slice(0, data.scenes).map(async (s) => {
			const [imageUrl, audioUrl] = await Promise.all([b64Image(`${s.image_prompt}. ${styleSuffix}. No words or lettering in the image.`), data.narration ? b64Speech(s.narration) : Promise.resolve(null)]);
			return {
				heading: s.heading,
				narration: s.narration,
				subtitle: s.subtitle || s.narration,
				imageUrl,
				audioUrl,
				durationMs: Math.max(4e3, Math.min(9e3, s.narration.split(/\s+/).length * 380))
			};
		}));
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.visual_explanation",
			latency_ms: Date.now() - t0,
			success: true,
			metadata: {
				scenes: scenes.length,
				kind: script.kind
			}
		});
		return {
			title: script.title,
			kind: script.kind,
			summary: script.summary,
			styleNote: script.style_note,
			scenes
		};
	} catch (err) {
		trackEvent({
			user_id: context.userId,
			kind: "ai",
			name: "ai.visual_explanation",
			latency_ms: Date.now() - t0,
			success: false,
			error: err instanceof Error ? err.message.slice(0, 500) : String(err)
		});
		throw err;
	}
});
//#endregion
export { generateVisualExplanation_createServerFn_handler };
