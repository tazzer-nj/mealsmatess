import { waitForFirebaseAuth } from "@/lib/firebase";

type ApiResponse = { error?: string } & Record<string, unknown>;

export async function postAuthenticatedAi<T>(
  path: "/api/mia" | "/api/recipe-image",
  body: unknown,
  { timeoutMs = 45_000, signal }: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<T> {
  signal?.throwIfAborted();
  const user = await waitForFirebaseAuth();
  let token: string | null = null;
  if (user) {
    token = await user.getIdToken();
  } else {
    try {
      const sessionRes = await fetch("/api/auth/session", { credentials: "include", signal });
      const sessionData = (await sessionRes.json().catch(() => null)) as { user?: unknown } | null;
      if (!sessionData?.user) {
        throw new Error("Sign in to use MealMate AI.");
      }
    } catch (error) {
      if (signal?.aborted) throw new DOMException("Request interrupted", "AbortError");
      if (error instanceof Error && error.message === "Sign in to use MealMate AI.") throw error;
      throw new Error("Sign in to use MealMate AI.");
    }
  }
  signal?.throwIfAborted();

  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
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

  const data = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "The AI request could not be completed.",
    );
  }
  if (!data) throw new Error("The AI service returned an invalid response. Please try again.");
  return data as T;
}
