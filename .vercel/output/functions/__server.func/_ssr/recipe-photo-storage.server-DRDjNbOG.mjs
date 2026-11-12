import { n as put, t as del } from "../_libs/@vercel/blob+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-photo-storage.server-DRDjNbOG.js
function assertRecipePhotoStorageConfigured() {
	if (!process.env["BLOB_READ_WRITE_TOKEN"] && !process.env["BLOB_STORE_ID"]) throw new Error("Recipe photo storage is not configured. Connect a public Vercel Blob store.");
}
/** Public recipe photos only. Credentials stay on the server. */
async function uploadRecipePhoto(path, bytes, contentType) {
	assertRecipePhotoStorageConfigured();
	return (await put(`recipe-images/${path}`, Buffer.from(bytes), {
		access: "public",
		contentType,
		addRandomSuffix: true,
		allowOverwrite: false,
		cacheControlMaxAge: 31536e3
	})).url;
}
async function deleteRecipePhoto(url) {
	await del(url);
}
//#endregion
export { deleteRecipePhoto as n, uploadRecipePhoto as r, assertRecipePhotoStorageConfigured as t };
