import { put } from "@vercel/blob";
import { MAX_RESTAURANT_IMAGE_BYTES } from "@/lib/restaurant-media";

export function decodeRestaurantImage(base64: string, contentType: string) {
  const raw = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) throw new Error("Invalid image encoding.");
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length > MAX_RESTAURANT_IMAGE_BYTES)
    throw new Error("Choose an image smaller than 2MB.");
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  const extension =
    contentType === "image/png" && png
      ? "png"
      : contentType === "image/jpeg" && jpeg
        ? "jpg"
        : contentType === "image/webp" && webp
          ? "webp"
          : null;
  if (!extension) throw new Error("Upload a valid JPEG, PNG or WebP image.");
  return { bytes, extension };
}

const memoryRestaurantMedia = new Map<string, string>();
const MAX_INLINE_DATA_URL_BYTES = 650_000;

function hasVercelBlobConfig() {
  return Boolean(process.env["BLOB_READ_WRITE_TOKEN"] || process.env["BLOB_STORE_ID"]);
}

function hasFirebaseStorageConfig() {
  return Boolean(
    process.env["FIREBASE_STORAGE_BUCKET"] ||
    process.env["VITE_FIREBASE_STORAGE_BUCKET"] ||
    process.env["FIREBASE_SERVICE_ACCOUNT_JSON"],
  );
}

/** Only public food/restaurant photos. Membership must be checked before calling. */
export async function storeRestaurantImage(
  restaurantId: string,
  kind: string,
  base64: string,
  contentType: string,
) {
  const { bytes, extension } = decodeRestaurantImage(base64, contentType);
  const objectPath = `${restaurantId}/${kind}-${Date.now()}.${extension}`;
  const pathname = `restaurant-media/${restaurantId}/${kind}.${extension}`;

  if (hasVercelBlobConfig()) {
    try {
      const blob = await put(pathname, bytes, {
        access: "public",
        contentType,
        addRandomSuffix: true,
        allowOverwrite: false,
        cacheControlMaxAge: 31536000,
      });
      return { url: blob.url, path: blob.pathname };
    } catch (blobError) {
      if (!hasFirebaseStorageConfig()) throw blobError;
    }
  }

  if (hasFirebaseStorageConfig()) {
    try {
      const { firebaseAdmin } = await import("@/server/firebase-admin");
      const bucket = firebaseAdmin.storage.from("restaurant-media");
      const { error: uploadError } = await bucket.upload(objectPath, bytes, {
        contentType,
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data, error: urlError } = await bucket.createDownloadUrl(objectPath);
      if (urlError || !data?.downloadUrl) {
        throw urlError ?? new Error("Failed to create restaurant photo download URL.");
      }
      return { url: data.downloadUrl, path: `restaurant-media/${objectPath}` };
    } catch (firebaseError) {
      if (process.env["VITEST"]) throw firebaseError;
    }
  }

  if (process.env["VITEST"]) {
    throw new Error("Restaurant photo storage is not configured.");
  }

  if (bytes.byteLength <= MAX_INLINE_DATA_URL_BYTES) {
    const url = `data:${contentType};base64,${bytes.toString("base64")}`;
    memoryRestaurantMedia.set(pathname, url);
    return { url, path: pathname };
  }

  throw new Error("Restaurant photo storage is not configured.");
}
