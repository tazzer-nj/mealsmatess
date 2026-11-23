import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_FIREBASE_AUTH_PHOTO_URL_LENGTH,
  PROFILE_UPDATED_EVENT,
  normalizeAvatarInput,
  readProfileOverride,
  saveUserProfile,
} from "@/lib/profile-avatar";

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn().mockResolvedValue(undefined),
  setDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ path: `${col}/${id}` })),
  saveMyAccountSettings: vi.fn().mockResolvedValue({ success: true }),
  currentUser: {
    uid: "user-123",
    displayName: "Chef Taz",
    photoURL: null as string | null,
  } as { uid: string; displayName: string | null; photoURL: string | null } | null,
}));

vi.mock("firebase/auth", () => ({
  updateProfile: mocks.updateProfile,
}));

vi.mock("@/lib/account.functions", () => ({
  saveMyAccountSettings: mocks.saveMyAccountSettings,
}));

vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}));

vi.mock("firebase/storage", () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {
    get currentUser() {
      return mocks.currentUser;
    },
  },
  db: {},
  storage: { app: { options: { apiKey: "test-api-key", storageBucket: "" } } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  mocks.currentUser = {
    uid: "user-123",
    displayName: "Chef Taz",
    photoURL: null,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("saveUserProfile & PFP length safety", () => {
  it("saves long data:image PFP URLs without passing >1800-char photoURL to Firebase Auth", async () => {
    const longDataUrl = `data:image/webp;base64,${"A".repeat(4000)}`;
    expect(longDataUrl.length).toBeGreaterThan(MAX_FIREBASE_AUTH_PHOTO_URL_LENGTH);

    const listener = vi.fn();
    window.addEventListener(PROFILE_UPDATED_EVENT, listener);

    const result = await saveUserProfile({
      displayName: "Chef Taz",
      photoURL: longDataUrl,
    });

    expect(result).toEqual({ displayName: "Chef Taz", photoURL: longDataUrl });
    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.currentUser, {
      displayName: "Chef Taz",
    });
    expect(mocks.setDoc).toHaveBeenCalledWith(
      { path: "users/user-123" },
      expect.objectContaining({
        id: "user-123",
        displayName: "Chef Taz",
        photoURL: longDataUrl,
      }),
      { merge: true },
    );
    expect(readProfileOverride("user-123")?.photoURL).toBe(longDataUrl);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(PROFILE_UPDATED_EVENT, listener);
  });

  it("saves long external HTTPS PFP URLs (>2048 chars) gracefully without failing Auth", async () => {
    const veryLongHttpsUrl = `https://cdn.example.com/avatars/photo.jpg?token=${"x".repeat(2500)}`;

    const result = await saveUserProfile({
      displayName: "Chef Taz",
      photoURL: veryLongHttpsUrl,
    });

    expect(result.photoURL).toBe(veryLongHttpsUrl);
    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.currentUser, {
      displayName: "Chef Taz",
    });
    expect(readProfileOverride("user-123")?.photoURL).toBe(veryLongHttpsUrl);
  });

  it("syncs short mascot or HTTPS URLs to both Firebase Auth and Firestore", async () => {
    const mascotUrl = "/mascots/mascot-cherry.webp";

    await saveUserProfile({
      displayName: "Mia Fan",
      photoURL: mascotUrl,
    });

    expect(mocks.updateProfile).toHaveBeenCalledWith(mocks.currentUser, {
      displayName: "Mia Fan",
      photoURL: mascotUrl,
    });
    expect(readProfileOverride("user-123")?.photoURL).toBe(mascotUrl);
  });

  it("saves profile via saveMyAccountSettings when currentUser is null (Whop OAuth user)", async () => {
    mocks.currentUser = null;

    const result = await saveUserProfile({
      userId: "whop-user-456",
      displayName: "Whop Chef",
      photoURL: "https://cdn.example.com/whop.png",
    });

    expect(result).toEqual({
      displayName: "Whop Chef",
      photoURL: "https://cdn.example.com/whop.png",
    });
    expect(mocks.updateProfile).not.toHaveBeenCalled();
    expect(mocks.saveMyAccountSettings).toHaveBeenCalledWith({
      data: {
        displayName: "Whop Chef",
        photoURL: "https://cdn.example.com/whop.png",
      },
    });
    expect(readProfileOverride("whop-user-456")?.displayName).toBe("Whop Chef");
  });

  it("validates avatar URL inputs cleanly", () => {
    expect(normalizeAvatarInput("")).toBeNull();
    expect(normalizeAvatarInput("  https://example.com/a.png  ")).toBe("https://example.com/a.png");
    expect(normalizeAvatarInput("/mascots/mascot-ocean.webp")).toBe("/mascots/mascot-ocean.webp");
    expect(normalizeAvatarInput("data:image/png;base64,abc=")).toBe("data:image/png;base64,abc=");
    expect(() => normalizeAvatarInput("ftp://bad.example.com/a.png")).toThrow(
      /Enter a valid image URL/i,
    );
  });
});
