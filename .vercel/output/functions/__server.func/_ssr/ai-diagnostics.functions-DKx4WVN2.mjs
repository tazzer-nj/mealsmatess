import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { n as deleteRecipePhoto, r as uploadRecipePhoto } from "./recipe-photo-storage.server-DRDjNbOG.mjs";
import { n as enforceRateLimit } from "./security.server-D83_qD0_.mjs";
import { a as generateAiObject, c as getAiProviderConfiguration, i as generateAiImage, s as generateAiText } from "./ai-engine.server-BOPxPIhJ.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-diagnostics.functions-DKx4WVN2.js
var DiagnosticSchema = objectType({ test: enumType([
	"backend",
	"recipe",
	"mia",
	"gateway",
	"image",
	"database",
	"storage",
	"security"
]) });
function safeFailure(error) {
	if (error instanceof Response && error.status === 429) return "Rate limiting rejected the repeated request as expected.";
	const message = error instanceof Error ? error.message : "";
	if (/Blob|photo storage/i.test(message)) return "Vercel Blob storage is unavailable. Check the connected public store and deployment configuration.";
	if (/FIREBASE_SERVICE_ACCOUNT_JSON|Firebase Admin is not configured/i.test(message)) return "Firebase Admin is not configured for this server runtime.";
	if (/credit|billing|payment/i.test(message)) return "The AI provider needs active billing or credits before it can process this test.";
	if (/LOVABLE_API_KEY|AI_GATEWAY_API_KEY|not configured/i.test(message)) return "The AI Gateway is not available in this server environment.";
	if (/authentication|unauthorized|rejected.*key/i.test(message)) return "AI Gateway authentication failed. Check the server-side provider credentials.";
	if (/timeout|timed out/i.test(message)) return "The test timed out before the service responded.";
	return "The server-side diagnostic failed. Check server logs for the test name and failure category.";
}
async function checkDatabase(userId) {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const id = `ai-diagnostic-${randomUUID()}`;
	const { error: insertError } = await firebaseAdmin.from("grocery_items").insert({
		id,
		user_id: userId,
		name: id,
		quantity: "1",
		category: "Other",
		checked: true
	});
	if (insertError) throw insertError;
	let readFailed = false;
	let readFailure;
	try {
		const { data, error } = await firebaseAdmin.from("grocery_items").select("id,user_id,name").eq("id", id).eq("user_id", userId).maybeSingle();
		if (error) throw error;
		if (!data || data.user_id !== userId) throw new Error("Scoped database read-after-write failed.");
	} catch (error) {
		readFailed = true;
		readFailure = error;
	}
	const { error: cleanupError } = await firebaseAdmin.from("grocery_items").delete().eq("id", id).eq("user_id", userId);
	if (cleanupError) throw cleanupError;
	if (readFailed) throw readFailure;
	return "User-scoped database insert, read, and cleanup succeeded.";
}
async function checkStorage() {
	const path = `diagnostics/${randomUUID()}.png`;
	const bytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=", "base64");
	let imageUrl;
	let verificationFailed = false;
	let verificationFailure;
	try {
		imageUrl = await uploadRecipePhoto(path, bytes, "image/png");
		const response = await fetch(imageUrl, { signal: AbortSignal.timeout(8e3) });
		if (!response.ok || !Buffer.from(await response.arrayBuffer()).equals(bytes)) throw new Error("Stored image could not be retrieved correctly.");
	} catch (error) {
		verificationFailed = true;
		verificationFailure = error;
	}
	let cleanupError = null;
	if (imageUrl) try {
		await deleteRecipePhoto(imageUrl);
	} catch (error) {
		cleanupError = error instanceof Error ? error : new Error(String(error));
	}
	if (verificationFailed && cleanupError) throw new AggregateError([verificationFailure, cleanupError], "Storage verification and cleanup failed.");
	if (cleanupError) throw cleanupError;
	if (verificationFailed) throw verificationFailure;
	return "Vercel Blob upload, public image retrieval, and cleanup succeeded.";
}
var runAiDiagnostics_createServerFn_handler = createServerRpc({
	id: "9d5e9f5ee81062614332b581a5d6fe6f3f78a0175deb109531e05bd7c06546f1",
	name: "runAiDiagnostics",
	filename: "src/lib/ai-diagnostics.functions.ts"
}, (opts) => runAiDiagnostics.__executeServer(opts));
var runAiDiagnostics = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => DiagnosticSchema.parse(value)).handler(runAiDiagnostics_createServerFn_handler, async ({ data, context }) => {
	const { isAdmin } = await import("./marketplace.server-D_s5ZHPi.mjs");
	if (!await isAdmin(context.userId)) throw new Error("Admin access required.");
	const config = getAiProviderConfiguration();
	try {
		switch (data.test) {
			case "backend": return {
				test: data.test,
				ok: config.configured,
				detail: config.configured ? "Authenticated admin endpoint and AI Gateway configuration are available." : "Authenticated admin endpoint is available, but AI Gateway credentials are not loaded in this server runtime.",
				...config
			};
			case "recipe": {
				const recipe = await generateAiObject({
					feature: "diagnostics.recipe",
					instructions: "Return an original breakfast recipe. Nutrition is approximate.",
					prompt: "Create a simple breakfast using eggs, tomatoes, and bread. Include quantities and four steps.",
					schema: objectType({
						name: stringType().min(2),
						ingredients: arrayType(objectType({
							name: stringType().min(1),
							quantity: stringType().min(1)
						})).min(3),
						steps: arrayType(stringType().min(1)).min(4)
					})
				});
				return {
					test: data.test,
					ok: true,
					model: config.textModel,
					detail: `Validated ${recipe.name} (${recipe.ingredients.length} ingredients, ${recipe.steps.length} steps).`
				};
			}
			case "mia": {
				const answer = await generateAiText({
					feature: "diagnostics.mia",
					instructions: "You are MealMate's kitchen assistant. Answer accurately and concisely.",
					prompt: "What is one practical non-dairy substitute for buttermilk in pancakes?"
				});
				return {
					test: data.test,
					ok: answer.length > 0,
					model: config.textModel,
					detail: answer.slice(0, 240)
				};
			}
			case "gateway": {
				const answer = await generateAiText({
					feature: "diagnostics.gateway",
					prompt: "Reply with exactly: MealMate AI is connected."
				});
				return {
					test: data.test,
					ok: answer.length > 0,
					provider: config.textProvider,
					model: config.textModel,
					detail: answer.slice(0, 160)
				};
			}
			case "image": {
				const image = await generateAiImage("Photorealistic tomato and herb omelet with golden toast, natural light, no text or people.", {
					feature: "diagnostics.image",
					size: "1024x1024"
				});
				return {
					test: data.test,
					ok: image.bytes.byteLength > 0,
					model: image.model,
					detail: `Generated ${image.mediaType} (${image.bytes.byteLength} bytes).`
				};
			}
			case "database": return {
				test: data.test,
				ok: true,
				detail: await checkDatabase(context.userId)
			};
			case "storage": return {
				test: data.test,
				ok: true,
				detail: await checkStorage()
			};
			case "security": {
				const id = `diagnostics:${context.userId}:${randomUUID()}`;
				await enforceRateLimit("ai_diagnostics", id, 1);
				let blocked = false;
				try {
					await enforceRateLimit("ai_diagnostics", id, 1);
				} catch (error) {
					blocked = error instanceof Response && error.status === 429;
				}
				if (!blocked) throw new Error("Rate limiter did not reject the repeated request.");
				return {
					test: data.test,
					ok: true,
					detail: "Firebase authentication and admin authorization passed; repeat requests are rate-limited."
				};
			}
		}
	} catch (error) {
		console.error("[MealMate diagnostics] test failed", {
			test: data.test,
			errorName: error instanceof Error ? error.name : "UnknownError"
		});
		return {
			test: data.test,
			ok: false,
			detail: safeFailure(error)
		};
	}
});
//#endregion
export { runAiDiagnostics_createServerFn_handler };
