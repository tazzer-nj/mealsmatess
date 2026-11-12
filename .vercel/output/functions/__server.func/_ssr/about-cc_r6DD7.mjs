import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Pt as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-cc_r6DD7.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/profile",
				className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), "Back to settings"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-4xl",
				children: "About MealMate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-foreground/90",
				children: "MealMate is your kitchen companion — recipes, meal planning, and grocery lists, powered by an AI assistant that helps you decide what to cook next."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-8 divide-y divide-border rounded-2xl border border-border bg-card text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Version"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-medium",
						children: "1.0.0"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Made with"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-medium",
						children: "MealMate"
					})]
				})]
			})
		]
	});
}
//#endregion
export { AboutPage as component };
