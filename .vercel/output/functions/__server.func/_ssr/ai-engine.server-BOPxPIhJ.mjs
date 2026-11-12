import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { i as output_exports, n as generateSpeech, r as generateText, t as generateImage } from "../_libs/ai+zod.mjs";
import { r as createGateway, rt as zodSchema } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-engine.server-BOPxPIhJ.js
var ai_engine_server_BOPxPIhJ_exports = /* @__PURE__ */ __exportAll({
	a: () => generateAiObject,
	c: () => getAiProviderConfiguration,
	i: () => generateAiImage,
	l: () => imageInputFromDataUrl,
	n: () => ai_engine_server_exports,
	o: () => generateAiSpeech,
	r: () => deduplicateAiRequest,
	s: () => generateAiText,
	t: () => aiRequestFingerprint
});
var ai_engine_server_exports = /* @__PURE__ */ __exportAll$1({
	DEFAULT_AI_IMAGE_MODEL: () => DEFAULT_AI_IMAGE_MODEL,
	DEFAULT_AI_SPEECH_MODEL: () => DEFAULT_AI_SPEECH_MODEL,
	DEFAULT_AI_TEXT_MODEL: () => DEFAULT_AI_TEXT_MODEL,
	aiRequestFingerprint: () => aiRequestFingerprint,
	deduplicateAiRequest: () => deduplicateAiRequest,
	generateAiImage: () => generateAiImage,
	generateAiObject: () => generateAiObject,
	generateAiSpeech: () => generateAiSpeech,
	generateAiText: () => generateAiText,
	getAiProviderConfiguration: () => getAiProviderConfiguration,
	imageInputFromDataUrl: () => imageInputFromDataUrl
});
var DEFAULT_AI_TEXT_MODEL = "google/gemini-2.5-flash";
var DEFAULT_AI_IMAGE_MODEL = "openai/gpt-image-2";
var DEFAULT_AI_SPEECH_MODEL = "openai/gpt-4o-mini-tts";
var LOVABLE_AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
var DEFAULT_TEXT_TIMEOUT_MS = 3e4;
var DEFAULT_IMAGE_TIMEOUT_MS = 9e4;
var DEFAULT_SPEECH_TIMEOUT_MS = 45e3;
var inFlightRequests = /* @__PURE__ */ new Map();
var AiProviderError = class extends Error {
	category;
	statusCode;
	constructor(category, statusCode) {
		super(category);
		this.category = category;
		this.statusCode = statusCode;
		this.name = "AiProviderError";
	}
};
function usesLovableGateway() {
	return Boolean(process.env["LOVABLE_API_KEY"]);
}
function getAiProviderConfiguration() {
	const lovable = usesLovableGateway();
	const provider = lovable ? "Lovable AI Gateway" : "Vercel AI Gateway";
	return {
		textProvider: provider,
		textModel: DEFAULT_AI_TEXT_MODEL,
		imageProvider: provider,
		imageModel: DEFAULT_AI_IMAGE_MODEL,
		speechProvider: provider,
		speechModel: DEFAULT_AI_SPEECH_MODEL,
		authentication: lovable ? "Server-only credentials" : "Server API key or Vercel OIDC",
		configured: lovable || Boolean(process.env["AI_GATEWAY_API_KEY"] || process.env["VERCEL_OIDC_TOKEN"] || process.env["VERCEL"] === "1")
	};
}
function vercelGateway() {
	if (!getAiProviderConfiguration().configured) throw new AiProviderError("configuration_missing");
	return createGateway();
}
function errorStatus(error) {
	if (error instanceof AiProviderError) return error.statusCode;
	if (typeof error !== "object" || error === null) return void 0;
	const statusCode = "statusCode" in error ? error.statusCode : "status" in error ? error.status : void 0;
	return typeof statusCode === "number" ? statusCode : void 0;
}
function errorCategory(error) {
	if (error instanceof AiProviderError) return error.category;
	const name = error instanceof Error ? error.name : "UnknownError";
	const message = error instanceof Error ? error.message : "";
	const status = errorStatus(error);
	if (/not configured|LOVABLE_API_KEY|AI_GATEWAY_API_KEY/i.test(message)) return "configuration_missing";
	if (/timeout|abort/i.test(name)) return "timeout";
	if (/credit|billing|payment/i.test(message) || status === 402) return "credits_unavailable";
	if (status === 401 || status === 403 || /authentication/i.test(name)) return "authentication";
	if (status === 429 || /rate.?limit/i.test(name)) return "rate_limited";
	if (status && status >= 500) return "provider_unavailable";
	return "request_failed";
}
function publicError(category) {
	const messages = {
		configuration_missing: "MealMate AI is not configured for this server runtime.",
		timeout: "MealMate AI took too long to respond. Please try again.",
		credits_unavailable: "MealMate AI has no available credits for this request.",
		authentication: "MealMate AI rejected its server credentials. Please check the provider setup.",
		rate_limited: "MealMate AI is busy right now. Please try again shortly.",
		provider_unavailable: "MealMate AI is temporarily unavailable. Please try again shortly.",
		request_failed: "MealMate AI could not complete that request. Please try again.",
		empty_response: "MealMate AI returned an empty response. Please try again.",
		invalid_response: "MealMate AI returned a result that did not match the expected format."
	};
	return new Error(messages[category] ?? messages.request_failed);
}
function logFailure(feature, model, error, durationMs) {
	console.error("[MealMate AI] request failed", {
		provider: getAiProviderConfiguration().textProvider,
		feature,
		model,
		durationMs,
		category: errorCategory(error),
		errorName: error instanceof Error ? error.name : "UnknownError",
		statusCode: errorStatus(error) ?? null
	});
}
function apiKey() {
	const key = process.env["LOVABLE_API_KEY"];
	if (!key) throw new AiProviderError("configuration_missing");
	return key;
}
async function lovableRequest(path, body, timeoutMs) {
	const key = apiKey();
	const response = await fetch(`${LOVABLE_AI_BASE_URL}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
			"Lovable-API-Key": key,
			"X-Lovable-AIG-SDK": "fetch"
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!response.ok) throw new AiProviderError(categoryForStatus(response.status), response.status);
	return response;
}
function categoryForStatus(status) {
	if (status === 402) return "credits_unavailable";
	if (status === 401 || status === 403) return "authentication";
	if (status === 429) return "rate_limited";
	if (status >= 500) return "provider_unavailable";
	return "request_failed";
}
function imageDataUrl(image, mediaType) {
	if (image instanceof URL) return image.toString();
	if (typeof image === "string") return image.startsWith("data:") ? image : `data:${mediaType ?? "image/png"};base64,${image}`;
	if (image instanceof Uint8Array) return `data:${mediaType ?? "image/png"};base64,${Buffer.from(image).toString("base64")}`;
	if (image instanceof ArrayBuffer) return `data:${mediaType ?? "image/png"};base64,${Buffer.from(image).toString("base64")}`;
	throw new AiProviderError("invalid_response");
}
function messagesFor(options) {
	const messages = [];
	if (options.instructions) messages.push({
		role: "system",
		content: options.instructions
	});
	if (options.messages) for (const message of options.messages) {
		const role = message.role === "system" || message.role === "assistant" ? message.role : "user";
		if (typeof message.content === "string") {
			messages.push({
				role,
				content: message.content
			});
			continue;
		}
		const content = message.content.map((part) => {
			if (part.type === "text") return {
				type: "text",
				text: part.text
			};
			if (part.type === "image") return {
				type: "image_url",
				image_url: { url: imageDataUrl(part.image, part.mediaType) }
			};
			throw new AiProviderError("invalid_response");
		});
		messages.push({
			role,
			content
		});
	}
	else messages.push({
		role: "user",
		content: options.prompt
	});
	return messages;
}
async function lovableChat(options, jsonMode = false) {
	const response = await lovableRequest("/chat/completions", {
		model: options.model ?? "google/gemini-2.5-flash",
		messages: messagesFor(options),
		max_tokens: 8192,
		...jsonMode ? { response_format: { type: "json_object" } } : {}
	}, options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS);
	let result;
	try {
		result = await response.json();
	} catch {
		throw new AiProviderError("invalid_response");
	}
	const content = result?.choices?.[0]?.message?.content;
	const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part) => typeof part === "object" && part !== null && "text" in part ? String(part.text) : "").join("") : "";
	if (!text.trim()) throw new AiProviderError("empty_response");
	return text.trim();
}
async function sdkTextRequest(options, generate) {
	const modelId = options.model ?? "google/gemini-2.5-flash";
	return generate(options.modelOverride ?? vercelGateway().languageModel(modelId), {
		maxRetries: options.maxRetries ?? 1,
		timeout: options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS
	});
}
function promptFields(options) {
	return {
		...options.instructions ? { instructions: options.instructions } : {},
		...options.messages ? { messages: options.messages } : { prompt: options.prompt }
	};
}
async function generateAiText(options) {
	const startedAt = Date.now();
	try {
		let text;
		if (options.modelOverride || !usesLovableGateway()) text = (await sdkTextRequest(options, (model, settings) => generateText({
			model,
			...promptFields(options),
			...settings
		}))).text.trim();
		else text = await lovableChat(options);
		if (!text) throw new AiProviderError("empty_response");
		console.info("[MealMate AI] request completed", {
			provider: getAiProviderConfiguration().textProvider,
			feature: options.feature,
			model: options.model ?? "google/gemini-2.5-flash",
			durationMs: Date.now() - startedAt
		});
		return text;
	} catch (error) {
		logFailure(options.feature, options.model ?? "google/gemini-2.5-flash", error, Date.now() - startedAt);
		throw publicError(errorCategory(error));
	}
}
function parseJsonObject(text) {
	const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");
	if (start < 0 || end < start) throw new AiProviderError("invalid_response");
	try {
		return JSON.parse(cleaned.slice(start, end + 1));
	} catch {
		throw new AiProviderError("invalid_response");
	}
}
async function generateAiObject(options) {
	const startedAt = Date.now();
	try {
		let output;
		if (options.modelOverride || !usesLovableGateway()) output = (await sdkTextRequest(options, (model, settings) => generateText({
			model,
			...promptFields(options),
			output: output_exports.object({ schema: options.schema }),
			...settings
		}))).output;
		else {
			const schema = await zodSchema(options.schema).jsonSchema;
			output = parseJsonObject(await lovableChat({
				...options,
				instructions: `${options.instructions ?? ""}\nReturn only a JSON object matching this JSON Schema:\n${JSON.stringify(schema)}`
			}, true));
		}
		try {
			return options.schema.parse(output);
		} catch {
			throw new AiProviderError("invalid_response");
		}
	} catch (error) {
		logFailure(options.feature, options.model ?? "google/gemini-2.5-flash", error, Date.now() - startedAt);
		throw publicError(errorCategory(error));
	}
}
function imageInputFromDataUrl(value) {
	const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(value);
	if (!match || !match[1] || !match[2]) throw new Error("A valid base64 image is required.");
	const bytes = Buffer.from(match[2], "base64");
	if (bytes.byteLength === 0 || bytes.byteLength > 8388608) throw new Error("Image must be smaller than 8 MB.");
	return {
		bytes: new Uint8Array(bytes),
		mediaType: match[1].toLowerCase()
	};
}
async function generateAiImage(prompt, options) {
	const model = DEFAULT_AI_IMAGE_MODEL;
	const startedAt = Date.now();
	try {
		let bytes;
		let mediaType;
		if (usesLovableGateway()) {
			const response = await lovableRequest("/images/generations", {
				model,
				prompt,
				size: options.size ?? "1536x1024",
				quality: "medium"
			}, options.timeoutMs ?? DEFAULT_IMAGE_TIMEOUT_MS);
			let result;
			try {
				result = await response.json();
			} catch {
				throw new AiProviderError("invalid_response");
			}
			const image = result.data?.[0];
			const base64 = image?.b64_json;
			if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new AiProviderError("invalid_response");
			bytes = new Uint8Array(Buffer.from(base64, "base64"));
			mediaType = image?.mime_type ?? image?.media_type ?? "image/png";
		} else {
			const result = await generateImage({
				model: vercelGateway().imageModel(model),
				prompt,
				size: options.size ?? "1536x1024",
				maxRetries: 0,
				abortSignal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_IMAGE_TIMEOUT_MS)
			});
			bytes = result.image.uint8Array;
			mediaType = result.image.mediaType;
		}
		if (bytes.byteLength === 0 || bytes.byteLength > 20971520) throw new AiProviderError("invalid_response");
		if (!/^image\/(png|jpeg|webp)$/i.test(mediaType)) throw new AiProviderError("invalid_response");
		console.info("[MealMate AI] image completed", {
			provider: getAiProviderConfiguration().textProvider,
			feature: options.feature,
			model,
			durationMs: Date.now() - startedAt,
			byteLength: bytes.byteLength
		});
		return {
			bytes,
			mediaType,
			model
		};
	} catch (error) {
		logFailure(options.feature, model, error, Date.now() - startedAt);
		throw publicError(errorCategory(error));
	}
}
async function generateAiSpeech(text, options) {
	const model = DEFAULT_AI_SPEECH_MODEL;
	const startedAt = Date.now();
	try {
		let bytes;
		let mediaType = "audio/mpeg";
		if (usesLovableGateway()) {
			const response = await lovableRequest("/audio/speech", {
				model,
				input: text,
				voice: options.voice ?? "alloy",
				response_format: "mp3",
				instructions: "Warm, clear, documentary narrator pace."
			}, options.timeoutMs ?? DEFAULT_SPEECH_TIMEOUT_MS);
			bytes = new Uint8Array(await response.arrayBuffer());
		} else {
			const result = await generateSpeech({
				model: vercelGateway().speechModel(model),
				text,
				voice: options.voice ?? "alloy",
				outputFormat: "mp3",
				instructions: "Warm, clear, documentary narrator pace.",
				maxRetries: 0,
				abortSignal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_SPEECH_TIMEOUT_MS)
			});
			bytes = result.audio.uint8Array;
			mediaType = result.audio.mediaType;
		}
		if (bytes.byteLength === 0 || bytes.byteLength > 20971520) throw new AiProviderError("invalid_response");
		console.info("[MealMate AI] speech completed", {
			provider: getAiProviderConfiguration().textProvider,
			feature: options.feature,
			model,
			durationMs: Date.now() - startedAt,
			byteLength: bytes.byteLength
		});
		return {
			bytes,
			mediaType,
			model
		};
	} catch (error) {
		logFailure(options.feature, model, error, Date.now() - startedAt);
		throw publicError(errorCategory(error));
	}
}
function aiRequestFingerprint(userId, feature, input) {
	return createHash("sha256").update(JSON.stringify({
		userId,
		feature,
		input
	})).digest("hex");
}
function deduplicateAiRequest(key, run) {
	const existing = inFlightRequests.get(key);
	if (existing) return existing;
	const request = run().finally(() => {
		if (inFlightRequests.get(key) === request) inFlightRequests.delete(key);
	});
	inFlightRequests.set(key, request);
	return request;
}
//#endregion
export { generateAiObject as a, getAiProviderConfiguration as c, generateAiImage as i, imageInputFromDataUrl as l, ai_engine_server_BOPxPIhJ_exports as n, generateAiSpeech as o, deduplicateAiRequest as r, generateAiText as s, aiRequestFingerprint as t };
