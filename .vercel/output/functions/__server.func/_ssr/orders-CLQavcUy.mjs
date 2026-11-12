import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { T as ShoppingBag } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { o as ORDER_STATUS_LABEL } from "./restaurants.schemas-DO_5wjxM.mjs";
import { o as money } from "./bits-CMPYjCg6.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { n as useMyOrdersRealtime } from "./marketplace.realtime-B-w0rbk5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-CLQavcUy.js
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const { user } = useSession();
	useMyOrdersRealtime(user?.id);
	const { data, isLoading } = useQuery({
		queryKey: ["my-orders", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await firebaseData.from("restaurant_orders").select("id,status,total,currency,placed_at,restaurants(name,slug)").order("placed_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-enter mx-auto w-full max-w-2xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "My orders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Your restaurant orders and their live status."
			}),
			!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md3-surface mt-6 rounded-3xl border border-dashed border-border p-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: "Sign in to see your orders."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: "mt-4 rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Sign in"
					})
				})]
			}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-3xl" }, i))
			}) : (data?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md3-surface mt-6 rounded-3xl border border-dashed border-border p-8 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm font-medium",
						children: "No orders yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						className: "mt-4 rounded-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/restaurants",
							children: "Browse restaurants"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-3",
				children: (data ?? []).map((o) => {
					const restaurant = o.restaurants;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/order/$id",
						params: { id: o.id },
						className: "md3-surface flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card p-4 transition-shadow hover:shadow-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: restaurant?.name ?? "Restaurant"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: new Date(o.placed_at).toLocaleString()
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "rounded-full",
								children: ORDER_STATUS_LABEL[o.status]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-semibold",
								children: money(o.total, o.currency)
							})]
						})]
					}) }, o.id);
				})
			})
		]
	});
}
//#endregion
export { OrdersPage as component };
