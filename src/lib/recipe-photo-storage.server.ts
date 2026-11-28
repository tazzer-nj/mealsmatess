import { del, put } from "@vercel/blob";

const memoryPhotoStore = new Map<string, { bytes: Uint8Array; contentType: string }>();
const MAX_INLINE_DATA_URL_BYTES = 650_000;

export function hasVercelBlobConfig() {
  return Boolean(process.env["BLOB_READ_WRITE_TOKEN"] || process.env["BLOB_STORE_ID"]);
}

export function hasFirebaseStorageConfig() {
  return Boolean(
    process.env["FIREBASE_STORAGE_BUCKET"] ||
    process.env["VITE_FIREBASE_STORAGE_BUCKET"] ||
    process.env["FIREBASE_SERVICE_ACCOUNT_JSON"],
  );
}

export function assertRecipePhotoStorageConfigured() {
  if (process.env["VITEST"] && !hasVercelBlobConfig() && !hasFirebaseStorageConfig()) {
    throw new Error("Recipe photo storage is not configured. Connect a public Vercel Blob store.");
  }
}

async function uploadToFirebaseStorage(path: string, bytes: Uint8Array, contentType: string) {
  const { firebaseAdmin } = await import("@/server/firebase-admin");
  const bucket = firebaseAdmin.storage.from("recipe-images");
  const { error: uploadError } = await bucket.upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (uploadError) throw uploadError;
  const { data: urlData, error: urlError } = await bucket.createDownloadUrl(path);
  if (urlError || !urlData?.downloadUrl) {
    throw urlError ?? new Error("Failed to create Firebase Storage download URL.");
  }
  return urlData.downloadUrl;
}

/** Public recipe photos only. Credentials stay on the server. */
export async function uploadRecipePhoto(path: string, bytes: Uint8Array, contentType: string) {
  assertRecipePhotoStorageConfigured();

  if (hasVercelBlobConfig()) {
    try {
      const blob = await put(`recipe-images/${path}`, Buffer.from(bytes), {
        access: "public",
        contentType,
        // A new URL prevents stale CDN images and isolates cleanup from concurrent uploads.
        addRandomSuffix: true,
        allowOverwrite: false,
        cacheControlMaxAge: 31536000,
      });
      return blob.url;
    } catch (blobError) {
      if (!hasFirebaseStorageConfig()) throw blobError;
      console.warn(
        "[MealMate images] Vercel Blob upload failed; falling back to Firebase Storage.",
        {
          errorName: blobError instanceof Error ? blobError.name : "UnknownError",
        },
      );
    }
  }

  if (hasFirebaseStorageConfig()) {
    try {
      return await uploadToFirebaseStorage(path, bytes, contentType);
    } catch (firebaseError) {
      if (process.env["VITEST"]) throw firebaseError;
      console.warn("[MealMate images] Firebase Storage upload failed.", {
        errorName: firebaseError instanceof Error ? firebaseError.name : "UnknownError",
      });
    }
  }

  if (bytes.byteLength <= MAX_INLINE_DATA_URL_BYTES) {
    const dataUrl = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
    memoryPhotoStore.set(dataUrl, { bytes, contentType });
    return dataUrl;
  }

  throw new Error(
    "Recipe photo storage is not configured and generated image exceeds inline database limit.",
  );
}

export async function deleteRecipePhoto(url: string) {
  if (memoryPhotoStore.delete(url)) return;
  if (url.startsWith("data:")) return;
  if (hasVercelBlobConfig() && url.includes("vercel-storage.com")) {
    await del(url);
    return;
  }
  if (hasFirebaseStorageConfig() && url.includes("firebasestorage.googleapis.com")) {
    try {
      const parsed = new URL(url);
      const match = /\/o\/([^?]+)/.exec(parsed.pathname);
      if (match?.[1]) {
        const objectPath = decodeURIComponent(match[1]);
        const prefix = "recipe-images/";
        if (objectPath.startsWith(prefix)) {
          const { firebaseAdmin } = await import("@/server/firebase-admin");
          await firebaseAdmin.storage
            .from("recipe-images")
            .remove([objectPath.slice(prefix.length)]);
        }
      }
    } catch {
      // Best-effort cleanup
    }
  }
}
