import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Pt as ChevronLeft, Z as Mail } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-RgeOjKjZ.js
var import_jsx_runtime = require_jsx_runtime();
var FAQ = [
	{
		q: "How do I save a recipe?",
		a: "Open any recipe and tap the heart. Saved recipes appear in your Cookbook."
	},
	{
		q: "How does the AI Recipe Generator work?",
		a: "Describe a dish, cuisine, or what you have on hand and MealMate builds a full recipe with ingredients, steps, and an image."
	},
	{
		q: "How does the AI Food Scanner work?",
		a: "Open Scan, point your camera at ingredients or a fridge shelf, and MealMate suggests recipes you can make."
	},
	{
		q: "How do referrals work?",
		a: "Share your unique link from Premium → Referrals. When a friend upgrades to paid Premium, you both earn rewards."
	},
	{
		q: "How do promo codes work?",
		a: "Enter the code on the Premium page. Valid codes add Premium days to your account instantly."
	},
	{
		q: "How do I upgrade to Premium?",
		a: "Visit the Premium page to see available plans and pricing. Trial eligibility and terms are confirmed at checkout."
	},
	{
		q: "How do I cancel Premium?",
		a: "Manage your subscription in the App Store or Play Store where you purchased it. Access continues until the end of the paid period."
	},
	{
		q: "How do I delete my account?",
		a: "Email support@mealmate.app from your account email and we'll delete your data within 7 days."
	},
	{
		q: "Can I use MealMate offline?",
		a: "You need a connection for AI features. Saved recipes are cached and readable offline."
	}
];
function SupportPage() {
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
				children: "Help Center"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Answers to common questions. Still stuck? Reach out below."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-3",
				children: FAQ.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "group rounded-2xl border border-border bg-card px-4 py-3 open:pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer list-none text-sm font-medium",
						children: item.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: item.a
					})]
				}, item.q))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "mailto:support@mealmate.app",
				className: "mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), "Contact support"]
			})
		]
	});
}
//#endregion
export { SupportPage as component };
