import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { i as useMascotTheme } from "./use-mascot-theme-BE-yJYn6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mealmate-logo-BEBaxM_8.js
var import_jsx_runtime = require_jsx_runtime();
/** The MealMate mascot artwork for the selected theme. */
function MascotMark({ className, alt = "MealMate" }) {
	const { theme } = useMascotTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: theme.image,
		alt,
		width: 80,
		height: 80,
		decoding: "async",
		className: cn("size-10 shrink-0 overflow-hidden rounded-2xl object-cover animate-in fade-in zoom-in-95 duration-300", className)
	}, theme.id);
}
function MealMateLogo({ className, imageClassName, showName = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MascotMark, { className: imageClassName }), showName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-2xl leading-none",
			children: "MealMate"
		})]
	});
}
//#endregion
export { MealMateLogo as t };
