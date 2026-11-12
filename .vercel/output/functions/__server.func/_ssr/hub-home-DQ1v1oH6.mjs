import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Ut as ChartColumn, a as Utensils, jt as ClipboardList, tn as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hub-home-DQ1v1oH6.js
var import_jsx_runtime = require_jsx_runtime();
var smoky_beef_tacos_default = "/assets/smoky-beef-tacos-DDyBJwfk.webp";
function HubHome() {
	const { user } = useSession();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-5 py-12 sm:px-8 sm:py-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid items-center gap-12 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground",
					children: "For the people behind the food"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-6 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl",
					children: [
						"Your restaurant.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"One connected workspace."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-lg text-base leading-relaxed text-muted-foreground",
					children: "Bring your menu, incoming orders and restaurant details together. Manage the food experience you share with MealMate customers."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						className: "rounded-full px-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: user ? "/partner/dashboard" : "/auth",
							children: [user ? "Open workspace" : "Sign in to Hub", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								className: "ml-3 size-4",
								"aria-hidden": "true"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "outline",
						className: "rounded-full px-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: user ? "/partner" : "/auth",
							search: user ? {} : { mode: "signup" },
							children: "Register your restaurant"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs leading-relaxed text-muted-foreground",
					children: "Use your MealMate account. New restaurants are reviewed before appearing to customers."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
				className: "overflow-hidden rounded-[2rem] border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: smoky_beef_tacos_default,
					alt: "Freshly prepared tacos with herbs, lime and grilled beef",
					width: 1024,
					height: 1024,
					fetchPriority: "high",
					className: "aspect-square w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
					className: "bg-card px-6 py-4 text-sm text-muted-foreground",
					children: "You make the food. Keep the details together with MealMate."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			"aria-label": "Restaurant tools",
			className: "mt-16 grid gap-8 border-t border-border pt-10 sm:grid-cols-3",
			children: [
				{
					icon: Utensils,
					title: "A menu that stays current",
					text: "Add dishes, upload photos, update prices and control availability."
				},
				{
					icon: ClipboardList,
					title: "Keep orders moving",
					text: "Review incoming orders and update their progress from preparation to completion."
				},
				{
					icon: ChartColumn,
					title: "See how you’re doing",
					text: "View your order totals, revenue and average order value from real activity."
				}
			].map(({ icon: Icon, title, text }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "mb-5 size-6",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted-foreground",
					children: text
				})
			] }, title))
		})]
	});
}
//#endregion
export { HubHome as t };
