import { del, put } from "@vercel/blob";

const memoryPhotoStore = new Map<string, { bytes: Uint8Array; contentType: string }>();

function hasVercelBlobConfig() {
  return Boolean(process.env["BLOB_READ_WRITE_TOKEN"] || process.env["BLOB_STORE_ID"]);
}

export function assertRecipePhotoStorageConfigured() {
  if (process.env["VITEST"] && !hasVercelBlobConfig()) {
    throw new Error("Recipe photo storage is not configured. Connect a public Vercel Blob store.");
  }
}

/** Public recipe photos only. Credentials stay on the server. */
export async function uploadRecipePhoto(path: string, bytes: Uint8Array, contentType: string) {
  assertRecipePhotoStorageConfigured();
  if (!hasVercelBlobConfig()) {
    const dataUrl = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
    memoryPhotoStore.set(dataUrl, { bytes, contentType });
    return dataUrl;
  }
  const blob = await put(`recipe-images/${path}`, Buffer.from(bytes), {
    access: "public",
    contentType,
    // A new URL prevents stale CDN images and isolates cleanup from concurrent uploads.
    addRandomSuffix: true,
    allowOverwrite: false,
    cacheControlMaxAge: 31536000,
  });
  return blob.url;
}

export async function deleteRecipePhoto(url: string) {
  if (memoryPhotoStore.delete(url)) return;
  if (!hasVercelBlobConfig()) return;
  await del(url);
}
