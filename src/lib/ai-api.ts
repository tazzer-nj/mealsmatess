import { waitForFirebaseAuth } from "@/lib/firebase";
import {
  getClientDeviceFingerprint,
  MIA_FREE_LIMIT_ERROR_CODE,
  MIA_FREE_LIMIT_MESSAGE,
  type MiaQuotaSnapshot,
} from "@/lib/freemium";

type ApiResponse = { error?: string; code?: string; quota?: MiaQuotaSnapshot } & Record<
  string,
  unknown
>;

export class MiaFreeLimitError extends Error {
  readonly code = MIA_FREE_LIMIT_ERROR_CODE;
  readonly quota?: MiaQuotaSnapshot;

  constructor(message = MIA_FREE_LIMIT_MESSAGE, quota?: MiaQuotaSnapshot) {
    super(message);
    this.name = "MiaFreeLimitError";
    this.quota = quota;
  }
}

export async function postAuthenticatedAi<T>(
  path: "/api/mia" | "/api/recipe-image",
  body: unknown,
  {
    timeoutMs = 45_000,
    signal,
    onDelta,
    onQuota,
  }: {
    timeoutMs?: number;
    signal?: AbortSignal;
    onDelta?: (accumulated: string) => void;
    onQuota?: (quota: MiaQuotaSnapshot) => void;
  } = {},
): Promise<T> {
  signal?.throwIfAborted();
  const user = await waitForFirebaseAuth();
  if (!user) throw new Error("Sign in to use MealMate AI.");
  const token = await user.getIdToken();
  signal?.throwIfAborted();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (path === "/api/mia") {
    const fp = getClientDeviceFingerprint();
    if (fp) headers["X-Device-Fingerprint"] = fp;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Request interrupted", "AbortError");
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The AI request timed out. Please try again.");
    }
    throw new Error("The AI service is temporarily unavailable. Please try again.");
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (response.ok && contentType.includes("text/event-stream") && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const line = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const jsonText = line.slice(5).trim();
        if (!jsonText) continue;
        try {
          const evt = JSON.parse(jsonText) as {
            delta?: string;
            reply?: string;
            done?: boolean;
            error?: string;
            quota?: MiaQuotaSnapshot;
          };
          if (evt.error) throw new Error(evt.error);
          if (evt.delta) {
            accumulated += evt.delta;
            onDelta?.(accumulated);
          }
          if (evt.quota) {
            onQuota?.(evt.quota);
          }
          if (evt.done && typeof evt.reply === "string" && evt.reply.length >= accumulated.length) {
            accumulated = evt.reply;
          }
        } catch (err) {
          if (err instanceof Error && err.message) throw err;
        }
      }
    }

    return { reply: accumulated } as T;
  }

  const data = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok) {
    if (response.status === 402 || data?.code === MIA_FREE_LIMIT_ERROR_CODE) {
      const freeLimit = typeof data?.freeLimit === "number" ? (data.freeLimit as number) : 2;
      const freeUsed = typeof data?.freeUsed === "number" ? (data.freeUsed as number) : freeLimit;
      const freeRemaining =
        typeof data?.freeRemaining === "number" ? (data.freeRemaining as number) : 0;
      const quotaSnapshot: MiaQuotaSnapshot = data?.quota ?? {
        isPremium: false,
        trialActive: false,
        freeUsed,
        freeLimit,
        freeRemaining,
      };
      onQuota?.(quotaSnapshot);
      throw new MiaFreeLimitError(
        typeof data?.error === "string" ? data.error : MIA_FREE_LIMIT_MESSAGE,
        quotaSnapshot,
      );
    }
    throw new Error(
      typeof data?.error === "string" ? data.error : "The AI request could not be completed.",
    );
  }
  if (!data) throw new Error("The AI service returned an invalid response. Please try again.");
  if (data.quota) {
    onQuota?.(data.quota);
  }
  return data as T;
}
