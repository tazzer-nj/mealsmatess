import { createHash } from "node:crypto";
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import {
  createGateway,
  generateImage,
  generateSpeech,
  generateText,
  Output,
  zodSchema,
  type ModelMessage,
} from "ai";
import { z } from "zod";

export const DEFAULT_AI_TEXT_MODEL = "google/gemini-2.5-flash";
export const GEMINI_SDK_TEXT_MODEL = "gemini-4-hydrogen";
export const DEFAULT_GEMINI_TEXT_MODEL = GEMINI_SDK_TEXT_MODEL;
export const GEMINI_SDK_IMAGE_MODEL = "gemini-3.1-flash-lite-image";
export const GEMINI_SDK_SPEECH_MODEL = "gemini-3.8-flash-lite-tts";
export const DEFAULT_AI_IMAGE_MODEL = "openai/gpt-image-2";
export const DEFAULT_AI_SPEECH_MODEL = "openai/gpt-4o-mini-tts";

const LOVABLE_AI_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_TEXT_TIMEOUT_MS = 30_000;
const DEFAULT_IMAGE_TIMEOUT_MS = 90_000;
const DEFAULT_SPEECH_TIMEOUT_MS = 45_000;
const inFlightRequests = new Map<string, Promise<unknown>>();

type TextModel = Parameters<typeof generateText>[0]["model"];
type PromptInput =
  { prompt: string; messages?: never } | { messages: ModelMessage[]; prompt?: never };
type AiRequestOptions = {
  feature: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  modelOverride?: TextModel;
  instructions?: string;
} & PromptInput;
type LovableContentPart =
  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type LovableMessage = {
  role: "system" | "user" | "assistant";
  content: string | LovableContentPart[];
};

class AiProviderError extends Error {
  constructor(
    readonly category: string,
    readonly statusCode?: number,
  ) {
    super(category);
    this.name = "AiProviderError";
  }
}

function readLovableKey(): string {
  return (process.env["LOVABLE_API_KEY"] || process.env["LOVABLE_AI_API_KEY"] || "").trim();
}

function readGeminiKey(): string {
  return (
    process.env["GEMINI_API_KEY"] ||
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ||
    ""
  ).trim();
}

function usesLovableGateway() {
  return Boolean(readLovableKey());
}

function usesVercelGateway() {
  return Boolean(
    process.env["AI_GATEWAY_API_KEY"] ||
    process.env["VERCEL_OIDC_TOKEN"] ||
    process.env["VERCEL"] === "1",
  );
}

function usesGeminiSdk() {
  return !usesLovableGateway() && !usesVercelGateway() && Boolean(readGeminiKey());
}

export function getAiProviderConfiguration() {
  const lovable = usesLovableGateway();
  const vercel = !lovable && usesVercelGateway();
  const gemini = !lovable && !vercel && Boolean(readGeminiKey());
  const provider = lovable
    ? "Lovable AI Gateway"
    : vercel
      ? "Vercel AI Gateway"
      : gemini
        ? "Google Gemini API"
        : "Vercel AI Gateway";
  return {
    textProvider: provider,
    textModel: gemini ? GEMINI_SDK_TEXT_MODEL : DEFAULT_AI_TEXT_MODEL,
    imageProvider: provider,
    imageModel: gemini ? GEMINI_SDK_IMAGE_MODEL : DEFAULT_AI_IMAGE_MODEL,
    speechProvider:
      lovable || vercel ? provider : gemini ? "Google Gemini API" : "Vercel AI Gateway",
    speechModel: gemini ? GEMINI_SDK_SPEECH_MODEL : DEFAULT_AI_SPEECH_MODEL,
    authentication: lovable
      ? "Server-only credentials"
      : gemini
        ? "Server-only Gemini API key"
        : "Server API key or Vercel OIDC",
    configured: lovable || vercel || gemini,
  };
}

function vercelGateway() {
  if (!usesVercelGateway()) throw new AiProviderError("configuration_missing");
  // The SDK handles Vercel's request-scoped OIDC token and local API keys.
  return createGateway();
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = readGeminiKey();
  if (!apiKey) throw new AiProviderError("configuration_missing");
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

function errorStatus(error: unknown): number | undefined {
  if (error instanceof AiProviderError) return error.statusCode;
  if (typeof error !== "object" || error === null) return undefined;
  const statusCode =
    "statusCode" in error ? error.statusCode : "status" in error ? error.status : undefined;
  return typeof statusCode === "number" ? statusCode : undefined;
}

function errorCategory(error: unknown): string {
  if (error instanceof AiProviderError) return error.category;
  const name = error instanceof Error ? error.name : "UnknownError";
  const message = error instanceof Error ? error.message : "";
  const status = errorStatus(error);
  if (/not configured|LOVABLE_API_KEY|AI_GATEWAY_API_KEY|GEMINI_API_KEY/i.test(message))
    return "configuration_missing";
  if (/timeout|abort/i.test(name) || /timed?\s*out/i.test(message)) return "timeout";
  if (/credit|billing|payment/i.test(message) || status === 402) return "credits_unavailable";
  if (
    status === 401 ||
    status === 403 ||
    /authentication/i.test(name) ||
    /API_KEY_INVALID|PERMISSION_DENIED/i.test(message)
  ) {
    return "authentication";
  }
  if (status === 429 || /rate.?limit/i.test(name) || /RESOURCE_EXHAUSTED/i.test(message)) {
    return "rate_limited";
  }
  if (status === 404 || /NOT_FOUND|model.*not found/i.test(message)) {
    return "model_unavailable";
  }
  if (status === 400 || status === 422 || /INVALID_ARGUMENT/i.test(message)) {
    return "invalid_request";
  }
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|network/i.test(message)) {
    return "network_unavailable";
  }
  if (status && status >= 500) return "provider_unavailable";
  return "request_failed";
}

function publicError(category: string): Error {
  const messages: Record<string, string> = {
    configuration_missing: "MealMate AI is not configured for this server runtime.",
    network_unavailable:
      "Could not reach MealMate AI due to a network connection issue. Please try again.",
    timeout: "MealMate AI took too long to respond. Please try again.",
    credits_unavailable: "MealMate AI has no available credits for this request.",
    authentication: "MealMate AI rejected its server credentials. Please check the provider setup.",
    rate_limited: "MealMate AI is busy right now. Please try again shortly.",
    model_unavailable:
      "The requested MealMate AI model is currently unavailable. Please try again shortly.",
    invalid_request:
      "MealMate AI could not process that request. Try rephrasing or using a smaller photo.",
    provider_unavailable: "MealMate AI is temporarily unavailable. Please try again shortly.",
    request_failed: "MealMate AI could not complete that request. Please try again.",
    empty_response: "MealMate AI returned an empty response. Please try again.",
    invalid_response: "MealMate AI returned a result that did not match the expected format.",
  };
  return new Error(messages[category] ?? messages.request_failed);
}

function logFailure(feature: string, model: string, error: unknown, durationMs: number) {
  console.error("[MealMate AI] request failed", {
    provider: getAiProviderConfiguration().textProvider,
    feature,
    model,
    durationMs,
    category: errorCategory(error),
    errorName: error instanceof Error ? error.name : "UnknownError",
    statusCode: errorStatus(error) ?? null,
  });
}

function apiKey(): string {
  const key = readLovableKey();
  if (!key) throw new AiProviderError("configuration_missing");
  return key;
}

async function lovableRequest(
  path: "/chat/completions" | "/images/generations" | "/audio/speech",
  body: unknown,
  timeoutMs: number,
): Promise<Response> {
  const key = apiKey();
  const response = await fetch(`${LOVABLE_AI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    console.warn("[MealMate AI] gateway upstream status", { path, status: response.status });
    throw new AiProviderError(categoryForStatus(response.status), response.status);
  }
  return response;
}

function categoryForStatus(status: number): string {
  if (status === 402) return "credits_unavailable";
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limited";
  if (status === 404) return "model_unavailable";
  if (status === 400 || status === 422) return "invalid_request";
  if (status >= 500) return "provider_unavailable";
  return "request_failed";
}

function imageDataUrl(image: unknown, mediaType?: string): string {
  if (image instanceof URL) return image.toString();
  if (typeof image === "string") {
    return image.startsWith("data:") ? image : `data:${mediaType ?? "image/png"};base64,${image}`;
  }
  if (image instanceof Uint8Array) {
    return `data:${mediaType ?? "image/png"};base64,${Buffer.from(image).toString("base64")}`;
  }
  if (image instanceof ArrayBuffer) {
    return `data:${mediaType ?? "image/png"};base64,${Buffer.from(image).toString("base64")}`;
  }
  throw new AiProviderError("invalid_response");
}

function messagesFor(options: AiRequestOptions): LovableMessage[] {
  const messages: LovableMessage[] = [];
  if (options.instructions) messages.push({ role: "system", content: options.instructions });

  if (options.messages) {
    for (const message of options.messages) {
      const role =
        message.role === "system" || message.role === "assistant" ? message.role : "user";
      if (typeof message.content === "string") {
        messages.push({ role, content: message.content });
        continue;
      }
      const content = message.content.map((part) => {
        if (part.type === "text") return { type: "text" as const, text: part.text };
        if (part.type === "image") {
          return {
            type: "image_url" as const,
            image_url: { url: imageDataUrl(part.image, part.mediaType) },
          };
        }
        throw new AiProviderError("invalid_response");
      });
      messages.push({ role, content });
    }
  } else {
    messages.push({ role: "user", content: options.prompt });
  }
  return messages;
}

async function lovableChat(options: AiRequestOptions, jsonMode = false): Promise<string> {
  const send = (withJsonFormat: boolean) =>
    lovableRequest(
      "/chat/completions",
      {
        model: options.model ?? DEFAULT_AI_TEXT_MODEL,
        messages: messagesFor(options),
        max_tokens: 8192,
        ...(withJsonFormat ? { response_format: { type: "json_object" } } : {}),
      },
      options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS,
    );

  let response: Response;
  try {
    response = await send(jsonMode);
  } catch (err) {
    if (
      jsonMode &&
      err instanceof AiProviderError &&
      (err.statusCode === 400 || err.statusCode === 422)
    ) {
      response = await send(false);
    } else {
      throw err;
    }
  }
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new AiProviderError("invalid_response");
  }
  const content = (result as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]
    ?.message?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) =>
              typeof part === "object" && part !== null && "text" in part ? String(part.text) : "",
            )
            .join("")
        : "";
  if (!text.trim()) throw new AiProviderError("empty_response");
  return text.trim();
}

async function sdkTextRequest<T>(
  options: AiRequestOptions,
  generate: (model: TextModel, settings: { maxRetries: number; timeout: number }) => Promise<T>,
): Promise<T> {
  const modelId = options.model ?? DEFAULT_AI_TEXT_MODEL;
  return generate(options.modelOverride ?? vercelGateway().languageModel(modelId), {
    maxRetries: options.maxRetries ?? 1,
    timeout: options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS,
  });
}

function promptFields(options: AiRequestOptions) {
  return {
    ...(options.instructions ? { instructions: options.instructions } : {}),
    ...(options.messages ? { messages: options.messages } : { prompt: options.prompt }),
  };
}

function base64FromImageInput(
  image: unknown,
  fallbackMimeType = "image/png",
): {
  data: string;
  mimeType: string;
} {
  if (typeof image === "string") {
    const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(image.trim());
    if (match?.[1] && match?.[2]) {
      return { mimeType: match[1].toLowerCase(), data: match[2].replace(/\s+/g, "") };
    }
    return { mimeType: fallbackMimeType, data: image.replace(/\s+/g, "") };
  }
  if (image instanceof Uint8Array) {
    return { mimeType: fallbackMimeType, data: Buffer.from(image).toString("base64") };
  }
  if (image instanceof ArrayBuffer) {
    return { mimeType: fallbackMimeType, data: Buffer.from(image).toString("base64") };
  }
  throw new AiProviderError("invalid_response");
}

function geminiContentsFor(options: AiRequestOptions): {
  contents: Content[];
  systemInstruction?: string;
} {
  const systemParts: string[] = [];
  if (options.instructions) systemParts.push(options.instructions);

  const contents: Content[] = [];
  if (options.messages) {
    for (const message of options.messages) {
      if (message.role === "system") {
        if (typeof message.content === "string") {
          systemParts.push(message.content);
        }
        continue;
      }
      const role = message.role === "assistant" ? "model" : "user";
      if (typeof message.content === "string") {
        contents.push({ role, parts: [{ text: message.content }] });
        continue;
      }
      const parts: Part[] = message.content.map((part) => {
        if (part.type === "text") return { text: part.text };
        if (part.type === "image") {
          const inline = base64FromImageInput(part.image, part.mediaType ?? "image/png");
          return { inlineData: inline };
        }
        throw new AiProviderError("invalid_response");
      });
      contents.push({ role, parts });
    }
  } else {
    contents.push({ role: "user", parts: [{ text: options.prompt }] });
  }

  return {
    contents,
    ...(systemParts.length > 0 ? { systemInstruction: systemParts.join("\n\n") } : {}),
  };
}

async function geminiChat(options: AiRequestOptions, jsonMode = false): Promise<string> {
  const ai = createGeminiClient();
  const { contents, systemInstruction } = geminiContentsFor(options);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS;
  const response = await ai.models.generateContent({
    model: GEMINI_SDK_TEXT_MODEL,
    contents,
    config: {
      ...(systemInstruction ? { systemInstruction } : {}),
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      maxOutputTokens: 8192,
      abortSignal: AbortSignal.timeout(timeoutMs),
    },
  });
  const text = response.text?.trim() ?? "";
  if (!text) throw new AiProviderError("empty_response");
  return text;
}

export async function generateAiText(options: AiRequestOptions): Promise<string> {
  const startedAt = Date.now();
  const config = getAiProviderConfiguration();
  try {
    let text: string;
    if (options.modelOverride) {
      const result = await sdkTextRequest(options, (model, settings) =>
        generateText({ model, ...promptFields(options), ...settings }),
      );
      text = result.text.trim();
    } else if (usesLovableGateway()) {
      text = await lovableChat(options);
    } else if (usesVercelGateway()) {
      const result = await sdkTextRequest(options, (model, settings) =>
        generateText({ model, ...promptFields(options), ...settings }),
      );
      text = result.text.trim();
    } else if (usesGeminiSdk()) {
      text = await geminiChat(options, false);
    } else {
      throw new AiProviderError("configuration_missing");
    }
    if (!text) throw new AiProviderError("empty_response");
    console.info("[MealMate AI] request completed", {
      provider: config.textProvider,
      feature: options.feature,
      model: options.model ?? config.textModel,
      durationMs: Date.now() - startedAt,
    });
    return text;
  } catch (error) {
    logFailure(options.feature, options.model ?? config.textModel, error, Date.now() - startedAt);
    throw publicError(errorCategory(error));
  }
}

export async function* streamAiText(
  options: AiRequestOptions,
): AsyncGenerator<string, void, unknown> {
  const startedAt = Date.now();
  const config = getAiProviderConfiguration();
  try {
    if (
      usesGeminiSdk() &&
      !options.modelOverride &&
      !usesVercelGateway() &&
      !usesLovableGateway()
    ) {
      const ai = createGeminiClient();
      const { contents, systemInstruction } = geminiContentsFor(options);
      const timeoutMs = options.timeoutMs ?? DEFAULT_TEXT_TIMEOUT_MS;
      const stream = await ai.models.generateContentStream({
        model: GEMINI_SDK_TEXT_MODEL,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          maxOutputTokens: 8192,
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
      let emitted = false;
      for await (const chunk of stream) {
        const piece = chunk.text ?? "";
        if (piece) {
          emitted = true;
          yield piece;
        }
      }
      if (!emitted) throw new AiProviderError("empty_response");
      console.info("[MealMate AI] stream completed", {
        provider: config.textProvider,
        feature: options.feature,
        model: options.model ?? config.textModel,
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    const text = await generateAiText(options);
    if (text) yield text;
  } catch (error) {
    logFailure(options.feature, options.model ?? config.textModel, error, Date.now() - startedAt);
    throw publicError(errorCategory(error));
  }
}

function parseJsonObject(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new AiProviderError("invalid_response");
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AiProviderError("invalid_response");
  }
}

export async function generateAiObject<TSchema extends z.ZodTypeAny>(
  options: AiRequestOptions & { schema: TSchema },
): Promise<z.output<TSchema>> {
  const startedAt = Date.now();
  const config = getAiProviderConfiguration();
  try {
    let output: unknown;
    if (options.modelOverride) {
      const result = await sdkTextRequest(options, (model, settings) =>
        generateText({
          model,
          ...promptFields(options),
          output: Output.object({ schema: options.schema }),
          ...settings,
        }),
      );
      output = result.output;
    } else if (usesLovableGateway()) {
      const schema = await zodSchema(options.schema).jsonSchema;
      output = parseJsonObject(
        await lovableChat(
          {
            ...options,
            instructions: `${options.instructions ?? ""}\nReturn only a JSON object matching this JSON Schema:\n${JSON.stringify(schema)}`,
          },
          true,
        ),
      );
    } else if (usesVercelGateway()) {
      const result = await sdkTextRequest(options, (model, settings) =>
        generateText({
          model,
          ...promptFields(options),
          output: Output.object({ schema: options.schema }),
          ...settings,
        }),
      );
      output = result.output;
    } else if (usesGeminiSdk()) {
      const schema = await zodSchema(options.schema).jsonSchema;
      output = parseJsonObject(
        await geminiChat(
          {
            ...options,
            instructions: `${options.instructions ?? ""}\nReturn only a valid JSON object matching this JSON Schema:\n${JSON.stringify(schema)}`,
          },
          true,
        ),
      );
    } else {
      throw new AiProviderError("configuration_missing");
    }
    try {
      return options.schema.parse(output) as z.output<TSchema>;
    } catch {
      throw new AiProviderError("invalid_response");
    }
  } catch (error) {
    logFailure(options.feature, options.model ?? config.textModel, error, Date.now() - startedAt);
    throw publicError(errorCategory(error));
  }
}

export function imageInputFromDataUrl(value: string) {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(value);
  if (!match || !match[1] || !match[2]) throw new Error("A valid base64 image is required.");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > 8 * 1024 * 1024) {
    throw new Error("Image must be smaller than 8 MB.");
  }
  return { bytes: new Uint8Array(bytes), mediaType: match[1].toLowerCase() };
}

async function decodeImageSource(
  source: { b64_json?: string; url?: string; mime_type?: string; media_type?: string },
  timeoutMs: number,
): Promise<{ bytes: Uint8Array; mediaType: string }> {
  if (source.b64_json && /^[A-Za-z0-9+/=\r\n]+$/.test(source.b64_json)) {
    const clean = source.b64_json.replace(/\s+/g, "");
    return {
      bytes: new Uint8Array(Buffer.from(clean, "base64")),
      mediaType: source.mime_type ?? source.media_type ?? "image/png",
    };
  }
  if (source.url) {
    const dataMatch = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(
      source.url,
    );
    if (dataMatch?.[1] && dataMatch[2]) {
      return {
        bytes: new Uint8Array(Buffer.from(dataMatch[2].replace(/\s+/g, ""), "base64")),
        mediaType: dataMatch[1].toLowerCase(),
      };
    }
    if (/^https?:\/\//i.test(source.url)) {
      const fetched = await fetch(source.url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!fetched.ok) throw new AiProviderError("provider_unavailable", fetched.status);
      const headerType = fetched.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
      return {
        bytes: new Uint8Array(await fetched.arrayBuffer()),
        mediaType:
          headerType && /^image\/(png|jpeg|webp)$/i.test(headerType) ? headerType : "image/png",
      };
    }
  }
  throw new AiProviderError("invalid_response");
}

async function generateLovableGatewayImage(
  prompt: string,
  model: string,
  size: "1024x1024" | "1536x1024" | "1024x1536",
  timeoutMs: number,
): Promise<{ bytes: Uint8Array; mediaType: string; model: string }> {
  try {
    const response = await lovableRequest(
      "/images/generations",
      {
        model,
        prompt,
        size,
        quality: "medium",
      },
      timeoutMs,
    );
    let result: {
      data?: { b64_json?: string; url?: string; mime_type?: string; media_type?: string }[];
    };
    try {
      result = (await response.json()) as typeof result;
    } catch {
      throw new AiProviderError("invalid_response");
    }
    const image = result.data?.[0];
    if (!image) throw new AiProviderError("invalid_response");
    const decoded = await decodeImageSource(image, timeoutMs);
    return { ...decoded, model };
  } catch (err) {
    const status = err instanceof AiProviderError ? err.statusCode : undefined;
    const canFallback =
      status === 400 || status === 404 || status === 405 || status === 422 || status === 501;
    if (!canFallback) throw err;

    const fallbackModel = "google/gemini-2.5-flash-image";
    const chatResponse = await lovableRequest(
      "/chat/completions",
      {
        model: fallbackModel,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      },
      timeoutMs,
    );
    let chatResult: {
      choices?: {
        message?: {
          images?: {
            b64_json?: string;
            image_url?: { url?: string };
            url?: string;
            mime_type?: string;
          }[];
        };
      }[];
    };
    try {
      chatResult = (await chatResponse.json()) as typeof chatResult;
    } catch {
      throw new AiProviderError("invalid_response");
    }
    const img = chatResult.choices?.[0]?.message?.images?.[0];
    if (!img) throw new AiProviderError("invalid_response");
    const decoded = await decodeImageSource(
      {
        b64_json: img.b64_json,
        url: img.image_url?.url ?? img.url,
        mime_type: img.mime_type,
      },
      timeoutMs,
    );
    return { ...decoded, model: fallbackModel };
  }
}

export async function generateAiImage(
  prompt: string,
  options: {
    feature: string;
    size?: "1024x1024" | "1536x1024" | "1024x1536";
    timeoutMs?: number;
  },
) {
  let model = DEFAULT_AI_IMAGE_MODEL;
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_IMAGE_TIMEOUT_MS;
  try {
    let bytes: Uint8Array;
    let mediaType: string;
    if (usesLovableGateway()) {
      const generated = await generateLovableGatewayImage(
        prompt,
        model,
        options.size ?? "1536x1024",
        timeoutMs,
      );
      bytes = generated.bytes;
      mediaType = generated.mediaType;
      model = generated.model;
    } else if (usesVercelGateway()) {
      const result = await generateImage({
        model: vercelGateway().imageModel(model),
        prompt,
        size: options.size ?? "1536x1024",
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(timeoutMs),
      });
      bytes = result.image.uint8Array;
      mediaType = result.image.mediaType;
    } else if (usesGeminiSdk()) {
      model = GEMINI_SDK_IMAGE_MODEL;
      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ["IMAGE"],
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
      const imagePart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data,
      );
      if (!imagePart?.inlineData?.data) throw new AiProviderError("invalid_response");
      bytes = new Uint8Array(Buffer.from(imagePart.inlineData.data, "base64"));
      mediaType = (imagePart.inlineData.mimeType || "image/png").toLowerCase();
    } else {
      throw new AiProviderError("configuration_missing");
    }
    if (bytes.byteLength === 0 || bytes.byteLength > 20 * 1024 * 1024) {
      throw new AiProviderError("invalid_response");
    }
    if (!/^image\/(png|jpeg|webp)$/i.test(mediaType)) throw new AiProviderError("invalid_response");

    console.info("[MealMate AI] image completed", {
      provider: getAiProviderConfiguration().textProvider,
      feature: options.feature,
      model,
      durationMs: Date.now() - startedAt,
      byteLength: bytes.byteLength,
    });
    return { bytes, mediaType, model };
  } catch (error) {
    logFailure(options.feature, model, error, Date.now() - startedAt);
    throw publicError(errorCategory(error));
  }
}

function wrapPcm16ToWav(pcm: Uint8Array, sampleRate = 24_000, channels = 1): Uint8Array {
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.byteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.byteLength, 40);
  const out = new Uint8Array(44 + pcm.byteLength);
  out.set(header, 0);
  out.set(pcm, 44);
  return out;
}

function geminiVoiceName(voice?: string): string {
  const map: Record<string, string> = {
    alloy: "Kore",
    echo: "Puck",
    fable: "Aoede",
    nova: "Kore",
    shimmer: "Zephyr",
  };
  return (voice && map[voice.toLowerCase()]) || "Kore";
}

export async function generateAiSpeech(
  text: string,
  options: { feature: string; voice?: string; timeoutMs?: number },
) {
  let model = DEFAULT_AI_SPEECH_MODEL;
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_SPEECH_TIMEOUT_MS;
  try {
    let bytes: Uint8Array;
    let mediaType = "audio/mpeg";
    if (usesLovableGateway()) {
      const response = await lovableRequest(
        "/audio/speech",
        {
          model,
          input: text,
          voice: options.voice ?? "alloy",
          response_format: "mp3",
          instructions: "Warm, clear, documentary narrator pace.",
        },
        timeoutMs,
      );
      bytes = new Uint8Array(await response.arrayBuffer());
    } else if (usesVercelGateway()) {
      const result = await generateSpeech({
        model: vercelGateway().speechModel(model),
        text,
        voice: options.voice ?? "alloy",
        outputFormat: "mp3",
        instructions: "Warm, clear, documentary narrator pace.",
        maxRetries: 0,
        abortSignal: AbortSignal.timeout(timeoutMs),
      });
      bytes = result.audio.uint8Array;
      mediaType = result.audio.mediaType;
    } else if (usesGeminiSdk()) {
      model = GEMINI_SDK_SPEECH_MODEL;
      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model,
        contents: `Speak clearly in a warm, natural kitchen narrator pace: ${text}`,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: geminiVoiceName(options.voice),
              },
            },
          },
          abortSignal: AbortSignal.timeout(timeoutMs),
        },
      });
      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data,
      );
      if (!audioPart?.inlineData?.data) throw new AiProviderError("invalid_response");
      const rawBytes = new Uint8Array(Buffer.from(audioPart.inlineData.data, "base64"));
      const rawMime = (audioPart.inlineData.mimeType ?? "").toLowerCase();
      if (rawMime.includes("wav") || rawMime.includes("mpeg") || rawMime.includes("mp3")) {
        bytes = rawBytes;
        mediaType = rawMime.split(";")[0] || "audio/wav";
      } else {
        bytes = wrapPcm16ToWav(rawBytes, 24_000, 1);
        mediaType = "audio/wav";
      }
    } else {
      throw new AiProviderError("configuration_missing");
    }
    if (bytes.byteLength === 0 || bytes.byteLength > 20 * 1024 * 1024) {
      throw new AiProviderError("invalid_response");
    }
    console.info("[MealMate AI] speech completed", {
      provider: getAiProviderConfiguration().speechProvider,
      feature: options.feature,
      model,
      durationMs: Date.now() - startedAt,
      byteLength: bytes.byteLength,
    });
    return { bytes, mediaType, model };
  } catch (error) {
    logFailure(options.feature, model, error, Date.now() - startedAt);
    throw publicError(errorCategory(error));
  }
}

export function aiRequestFingerprint(userId: string, feature: string, input: unknown): string {
  return createHash("sha256").update(JSON.stringify({ userId, feature, input })).digest("hex");
}

export function deduplicateAiRequest<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const request = run().finally(() => {
    if (inFlightRequests.get(key) === request) inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, request);
  return request;
}
