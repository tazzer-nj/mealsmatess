import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

/** Firebase Auth rejects photoURL strings over ~2048 characters (`auth/invalid-profile-attribute`). */
export const MAX_FIREBASE_AUTH_PHOTO_URL_LENGTH = 1800;

export const PROFILE_UPDATED_EVENT = "mealmate:profile-updated";

export type ProfileOverride = {
  displayName?: string | null;
  photoURL?: string | null;
  updatedAt?: number;
};

function overrideStorageKey(userId: string) {
  return `mealmate:profile-override:${userId}`;
}

export function readProfileOverride(userId: string): ProfileOverride | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(overrideStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileOverride;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeProfileOverride(userId: string, override: ProfileOverride) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(
      overrideStorageKey(userId),
      JSON.stringify({ ...override, updatedAt: Date.now() }),
    );
  } catch {
    // Ignore storage quota or private-browsing errors; Firestore still holds the source of truth.
  }
}

export function notifyProfileUpdated(userId: string, override: ProfileOverride) {
  writeProfileOverride(userId, override);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { userId, override } }));
  }
}

export async function fetchFirestoreProfileOverride(
  userId: string,
): Promise<ProfileOverride | null> {
  if (!userId) return null;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (!snap.exists()) return null;
    const data = snap.data() as { displayName?: unknown; photoURL?: unknown };
    const override: ProfileOverride = {};
    if (typeof data.displayName === "string" || data.displayName === null) {
      override.displayName = data.displayName;
    }
    if (typeof data.photoURL === "string" || data.photoURL === null) {
      override.photoURL = data.photoURL;
    }
    if ("displayName" in override || "photoURL" in override) {
      writeProfileOverride(userId, override);
      return override;
    }
    return null;
  } catch {
    return null;
  }
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and center-crop an image file into a compact square avatar data URL (256x256)
 * so it uploads fast and fits comfortably within Firestore and browser storage.
 */
export async function compressAvatarFile(file: File, maxSize = 256): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image file is too large. Please choose an image under 10MB.");
  }

  if (typeof document === "undefined" || typeof Image === "undefined") {
    return readAsDataUrl(file);
  }

  const rawDataUrl = await readAsDataUrl(file);
  if (file.type === "image/svg+xml") {
    return rawDataUrl;
  }

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = Math.min(
          maxSize,
          Math.max(img.naturalWidth || maxSize, img.naturalHeight || maxSize),
        );
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = Math.max(0, (img.naturalWidth - side) / 2);
        const sy = Math.max(0, (img.naturalHeight - side) / 2);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

        const webp = canvas.toDataURL("image/webp", 0.82);
        if (webp.startsWith("data:image/webp") && webp.length < rawDataUrl.length) {
          resolve(webp);
          return;
        }
        const jpeg = canvas.toDataURL("image/jpeg", 0.82);
        resolve(jpeg.length < rawDataUrl.length ? jpeg : rawDataUrl);
      } catch {
        resolve(rawDataUrl);
      }
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, contentType: match[1] };
}

async function tryUploadAvatarToFirebaseStorage(
  userId: string,
  dataUrl: string,
): Promise<string | null> {
  const parsed = dataUrlToBytes(dataUrl);
  if (!parsed) return null;

  const bucket = storage.app.options.storageBucket;
  const apiKey = storage.app.options.apiKey;
  if (!bucket || !apiKey || apiKey === "test-api-key") {
    return null;
  }

  try {
    const ext = parsed.contentType.includes("webp")
      ? "webp"
      : parsed.contentType.includes("png")
        ? "png"
        : "jpg";
    const avatarRef = ref(storage, `users/${userId}/avatar.${ext}`);
    const uploadTask = uploadBytes(avatarRef, parsed.bytes, {
      contentType: parsed.contentType,
      cacheControl: "public, max-age=31536000",
    }).then(() => getDownloadURL(avatarRef));

    const timeout = new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), 5000);
    });
    return await Promise.race([uploadTask, timeout]);
  } catch {
    return null;
  }
}

export function normalizeAvatarInput(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  throw new Error("Enter a valid image URL (https://...) or choose an image from your device.");
}

/**
 * Persist displayName and photoURL without ever hitting Firebase Auth's 2048-char photoURL limit.
 * Short URLs sync to both Firebase Auth and Firestore; data URLs / long URLs upload to Storage when
 * available or persist cleanly in Firestore + local profile cache and update the active session live.
 */
export async function saveUserProfile(input: {
  userId?: string;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<{ displayName: string | null; photoURL: string | null }> {
  const currentUser = auth.currentUser;
  const targetUserId = currentUser?.uid ?? input.userId;
  if (!targetUserId) {
    throw new Error("You must be signed in to update your profile.");
  }

  const nextDisplayName =
    input.displayName !== undefined
      ? input.displayName?.trim() || null
      : (currentUser?.displayName ?? null);
  let nextPhotoURL =
    input.photoURL !== undefined
      ? normalizeAvatarInput(input.photoURL)
      : (currentUser?.photoURL ?? null);

  if (nextPhotoURL?.startsWith("data:image/")) {
    const uploadedUrl = await tryUploadAvatarToFirebaseStorage(targetUserId, nextPhotoURL);
    if (uploadedUrl) {
      nextPhotoURL = uploadedUrl;
    }
  }

  if (currentUser) {
    const canSyncPhotoToAuth =
      nextPhotoURL === null || nextPhotoURL.length <= MAX_FIREBASE_AUTH_PHOTO_URL_LENGTH;

    try {
      await updateProfile(currentUser, {
        displayName: nextDisplayName,
        ...(canSyncPhotoToAuth ? { photoURL: nextPhotoURL } : {}),
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      // If Firebase Auth still rejects photoURL (e.g. strict edge cases), retry with displayName only.
      if (code === "auth/invalid-profile-attribute") {
        await updateProfile(currentUser, { displayName: nextDisplayName });
      } else {
        throw error;
      }
    }

    const nowIso = new Date().toISOString();
    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        id: currentUser.uid,
        displayName: nextDisplayName ?? "",
        photoURL: nextPhotoURL ?? "",
        updatedAt: nowIso,
      },
      { merge: true },
    );
  } else {
    const { saveMyProfileInfo } = await import("@/lib/preferences.functions");
    await saveMyProfileInfo({
      data: {
        displayName: nextDisplayName,
        photoURL: nextPhotoURL,
      },
    });
  }

  notifyProfileUpdated(targetUserId, {
    displayName: nextDisplayName,
    photoURL: nextPhotoURL,
  });

  return { displayName: nextDisplayName, photoURL: nextPhotoURL };
}
