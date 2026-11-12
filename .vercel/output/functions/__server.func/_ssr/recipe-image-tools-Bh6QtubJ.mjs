import "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import "../_libs/sonner.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
/** Small credit line required by Unsplash/Pexels licensing. */
function ImageCredit({ source, attribution }) {
	const a = attribution;
	if (!source || !a?.photographer) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 text-xs text-muted-foreground",
		children: [
			"Photo by",
			" ",
			a.photographerUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: a.photographerUrl,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "underline",
				children: a.photographer
			}) : a.photographer,
			" ",
			"on",
			" ",
			a.pageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: a.pageUrl,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "underline",
				children: source
			}) : source
		]
	});
}
/** Bulk image work disabled: image discovery happens only on a user search. */
function RecipeImageBackfillCard() {
	return null;
}
//#endregion
export { RecipeImageBackfillCard as n, ImageCredit as t };
