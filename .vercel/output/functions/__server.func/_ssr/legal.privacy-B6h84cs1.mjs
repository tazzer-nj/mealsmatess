import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Pt as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legal.privacy-B6h84cs1.js
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
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
				children: "Privacy Policy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "This page is maintained by the MealMate team to answer common privacy questions about the app."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground/90",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "What we collect"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "When you create an account we store your email, display name, bio, and dietary preferences. When you use the app we store the recipes, meal plans, grocery items, posts, comments, likes and follows you create." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "How we use it"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your data is used to power the features you interact with — showing your saved recipes, your feed, and content from cooks you follow. We do not sell your data." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Deletion"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You can request deletion of your account and associated data at any time by contacting support." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "This is a summary and not a substitute for legal review. Contact the team for full terms."
					})
				]
			})
		]
	});
}
//#endregion
export { PrivacyPage as component };
