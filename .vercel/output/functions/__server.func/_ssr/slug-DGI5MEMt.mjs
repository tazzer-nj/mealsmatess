//#region node_modules/.nitro/vite/services/ssr/assets/slug-DGI5MEMt.js
function slugify(input) {
	return input.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
//#endregion
export { slugify as t };
