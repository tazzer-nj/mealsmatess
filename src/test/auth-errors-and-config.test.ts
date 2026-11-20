import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthErrorMessage, getFirebaseErrorCode } from "@/lib/auth-errors";

describe("Firebase Auth error mapping", () => {
  it("extracts codes from structured errors and message strings", () => {
    expect(getFirebaseErrorCode({ code: "auth/operation-not-allowed" })).toBe(
      "auth/operation-not-allowed",
    );
    expect(getFirebaseErrorCode(new Error("Firebase: Error (auth/unauthorized-domain)."))).toBe(
      "auth/unauthorized-domain",
    );
  });

  it("ignores harmless user-cancelled popup actions", () => {
    expect(getAuthErrorMessage({ code: "auth/popup-closed-by-user" }, "google")).toBe("");
    expect(getAuthErrorMessage({ code: "auth/cancelled-popup-request" }, "google")).toBe("");
  });

  it("returns actionable messages for popup block, unenabled providers, and invalid credentials", () => {
    expect(getAuthErrorMessage({ code: "auth/popup-blocked" }, "google")).toMatch(/pop-up/i);
    expect(getAuthErrorMessage({ code: "auth/operation-not-allowed" }, "signin")).toMatch(
      /Continue with Google/i,
    );
    expect(getAuthErrorMessage({ code: "auth/unauthorized-domain" }, "google")).toMatch(
      /Authorized domains/i,
    );
    expect(getAuthErrorMessage({ code: "auth/api-key-not-valid" }, "signin")).toMatch(/API key/i);
    expect(getAuthErrorMessage({ code: "auth/invalid-credential" }, "signin")).toBe(
      "Invalid email or password.",
    );
    expect(getAuthErrorMessage({ code: "auth/user-not-found" }, "reset")).toBe(
      "No account found with that email address.",
    );
    expect(getAuthErrorMessage({ code: "auth/missing-initial-state" }, "google")).toMatch(
      /session storage|pop-ups/i,
    );
    expect(
      getAuthErrorMessage(
        new Error("Unable to process request due to missing initial state."),
        "google",
      ),
    ).toMatch(/session storage|pop-ups/i);
  });

  it("uses signInWithPopup without falling back to signInWithRedirect when popups are blocked", async () => {
    vi.resetModules();
    const signInWithPopupMock = vi.fn().mockRejectedValue({ code: "auth/popup-blocked" });
    const signInWithRedirectMock = vi.fn();

    vi.doMock("firebase/auth", async () => {
      const actual = await vi.importActual<typeof import("firebase/auth")>("firebase/auth");
      return {
        ...actual,
        signInWithPopup: signInWithPopupMock,
        signInWithRedirect: signInWithRedirectMock,
      };
    });

    const { signInWithGoogle } = await import("@/lib/firebase");
    await expect(signInWithGoogle()).rejects.toMatchObject({ code: "auth/popup-blocked" });
    expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    expect(signInWithRedirectMock).not.toHaveBeenCalled();

    vi.doUnmock("firebase/auth");
  });
});

describe("verifyFirebaseIdToken project-only fallback", () => {
  const verifyMock = vi.fn();
  const initMock = vi.fn(() => ({ name: "mock-app" }));

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    verifyMock.mockResolvedValue({ uid: "user-123", email: "user@example.com" });
    vi.doMock("firebase-admin/app", () => ({
      cert: vi.fn(),
      getApps: () => [],
      initializeApp: initMock,
    }));
    vi.doMock("firebase-admin/auth", () => ({
      getAuth: () => ({ verifyIdToken: verifyMock }),
    }));
    vi.doMock("firebase-admin/firestore", () => ({
      getFirestore: () => ({}),
      Timestamp: class Timestamp {},
    }));
    vi.doMock("firebase-admin/messaging", () => ({ getMessaging: () => ({}) }));
    vi.doMock("firebase-admin/storage", () => ({
      getStorage: () => ({ bucket: () => ({}) }),
      getDownloadURL: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("firebase-admin/app");
    vi.doUnmock("firebase-admin/auth");
    vi.doUnmock("firebase-admin/firestore");
    vi.doUnmock("firebase-admin/messaging");
    vi.doUnmock("firebase-admin/storage");
  });

  it("verifies ID tokens without FIREBASE_SERVICE_ACCOUNT_JSON using projectId from firebase-applet-config.json", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "");
    vi.stubEnv("FIREBASE_PROJECT_ID", "");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");

    const { verifyFirebaseIdToken } = await import("@/server/firebase-admin");
    const decoded = await verifyFirebaseIdToken("id-token-abc");

    expect(decoded.uid).toBe("user-123");
    expect(initMock).toHaveBeenCalledWith(
      { projectId: "ai-studio-applet-webapp-85feb" },
      "mealmate-token-verifier",
    );
    expect(verifyMock).toHaveBeenCalledWith("id-token-abc");
  });
});
