import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { o as UtensilsCrossed } from "../_libs/lucide-react.mjs";
import { i as recipePhotoSources, t as IMAGE_DIMENSIONS } from "./recipe-image-6RW6Z0iJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe-image-KYtS0QAS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Rendering is network-cost free: stored photo, exact curated dish, branded fallback. */
function RecipeImage(props) {
	const { recipe, size = "card" } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipePhoto, { ...props }, `${recipe.id}:${recipe.slug}:${recipe.name}:${recipe.image_source}:${recipe.image_url}:${size}`);
}
function RecipePhoto({ recipe, size = "card", className, priority = false, alt, generating = false, sizes }) {
	const [useCurated, setUseCurated] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(null);
	const { src, srcSet } = recipePhotoSources(recipe, size, useCurated);
	const unavailable = failed || src === "/recipe-placeholder.svg";
	const creating = generating && unavailable;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `relative isolate overflow-hidden bg-muted ${className ?? ""}`,
		style: { aspectRatio: "1 / 1" },
		children: unavailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "img",
			"aria-label": creating ? `Creating a photo of ${recipe.name}` : `Photo not available for ${recipe.name}`,
			className: "flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `flex h-10 w-10 items-center justify-center rounded-full border border-current/20 ${creating ? "motion-safe:animate-pulse" : ""}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtensilsCrossed, {
						className: "h-5 w-5",
						strokeWidth: 1.25
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[9px] font-semibold uppercase tracking-[0.2em]",
					children: "MealMate"
				}),
				creating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "Plating your photo…"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [loaded !== src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "absolute inset-0 bg-foreground/5 motion-safe:animate-pulse"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			srcSet,
			sizes: sizes ?? (size === "thumb" ? "96px" : size === "hero" ? "(max-width: 768px) 100vw, 768px" : "(max-width: 640px) 50vw, 320px"),
			alt: alt ?? recipe.name,
			width: IMAGE_DIMENSIONS[size].width,
			height: IMAGE_DIMENSIONS[size].height,
			loading: priority ? "eager" : "lazy",
			fetchPriority: priority ? "high" : "auto",
			decoding: "async",
			ref: (img) => {
				if (img?.complete && img.naturalWidth > 0) setLoaded(src);
			},
			onLoad: () => setLoaded(src),
			onError: () => {
				const curated = recipePhotoSources(recipe, size, true);
				if (!useCurated && curated.src !== src && curated.src !== "/recipe-placeholder.svg") setUseCurated(true);
				else setFailed(true);
			},
			className: `h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${loaded === src ? "opacity-100" : "opacity-0"}`
		}, src)] })
	});
}
//#endregion
export { RecipeImage as t };
