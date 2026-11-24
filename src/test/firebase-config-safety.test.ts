import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const PREVIEW_DB = "ai-studio-mealsmatess-ce52aaad-6e1c-4c5f-88a6-79cdcaf3f2f9";

describe("Production Firebase database config safety", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("firebase-admin/app", () => ({
      cert: vi.fn(),
      getApps: () => [],
      initializeApp: () => ({}),
    }));
    vi.doMock("firebase-admin/auth", () => ({
      getAuth: () => ({ verifyIdToken: vi.fn() }),
    }));
    vi.doMock("firebase-admin/firestore", () => ({
      getFirestore: vi.fn(() => ({})),
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

  it("refuses to silently fall back to the AI Studio preview database in Vercel production", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("FIREBASE_FIRESTORE_DATABASE_ID", "");
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", "");
    vi.stubEnv(
      "FIREBASE_SERVICE_ACCOUNT_JSON",
      JSON.stringify({
        project_id: "mealmate-prod",
        client_email: "svc@example.test",
        private_key: "key",
      }),
    );

    const { getFirebaseAdminConfigStatus } = await import("@/server/firebase-admin");
    const status = getFirebaseAdminConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.usesPreviewDatabaseFallback).toBe(false);
    expect(status.error).toContain("FIREBASE_FIRESTORE_DATABASE_ID");
    expect(status.error).toContain("VITE_FIREBASE_FIRESTORE_DATABASE_ID");
  });

  it("rejects using the AI Studio preview database ID in Vercel production", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("FIREBASE_FIRESTORE_DATABASE_ID", PREVIEW_DB);
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", PREVIEW_DB);

    const { getFirebaseAdminConfigStatus } = await import("@/server/firebase-admin");
    const status = getFirebaseAdminConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.error).toMatch(/cannot use the AI Studio preview database/i);
  });

  it("refuses preview DB fallback when targeting a non-preview project even outside Vercel", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("FIREBASE_FIRESTORE_DATABASE_ID", "");
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", "");

    const { getFirebaseAdminConfigStatus } = await import("@/server/firebase-admin");
    const status = getFirebaseAdminConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.error).toContain("FIREBASE_FIRESTORE_DATABASE_ID");
  });

  it("accepts explicit production database configuration such as (default)", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("FIREBASE_FIRESTORE_DATABASE_ID", "(default)");
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", "(default)");
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "{}");

    const { getFirebaseAdminConfigStatus } = await import("@/server/firebase-admin");
    const status = getFirebaseAdminConfigStatus();

    expect(status.configured).toBe(true);
    expect(status.databaseIdSource).toBe("env");
    expect(status.usesPreviewDatabaseFallback).toBe(false);
    expect(status.error).toBeNull();
  });

  it("fails safely on the client when VITE_FIREBASE_FIRESTORE_DATABASE_ID is missing in Vercel production", async () => {
    vi.stubEnv("VITE_VERCEL_ENV", "production");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", "");

    const { firebaseConfigError, getFirebaseClientConfigStatus, signInWithEmail } =
      await import("@/lib/firebase");
    const status = getFirebaseClientConfigStatus();

    expect(status.configured).toBe(false);
    expect(status.databaseId).not.toBe(PREVIEW_DB);
    expect(firebaseConfigError).toContain("VITE_FIREBASE_FIRESTORE_DATABASE_ID");
    await expect(signInWithEmail("user@example.com", "secret")).rejects.toThrow(
      /VITE_FIREBASE_FIRESTORE_DATABASE_ID/,
    );
  });

  it("rejects the AI Studio preview database ID on the client in Vercel production", async () => {
    vi.stubEnv("VITE_VERCEL_ENV", "production");
    vi.stubEnv("VITE_FIREBASE_API_KEY", "prod-api-key");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "mealmate-prod.firebaseapp.com");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "mealmate-prod");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "1:999:web:prod");
    vi.stubEnv("VITE_FIREBASE_FIRESTORE_DATABASE_ID", PREVIEW_DB);

    const { firebaseConfigError, getFirebaseClientConfigStatus } = await import("@/lib/firebase");
    const status = getFirebaseClientConfigStatus();

    expect(status.configured).toBe(false);
    expect(firebaseConfigError).toMatch(/cannot use the AI Studio preview database/i);
  });
});
