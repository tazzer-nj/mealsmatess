import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as StatusTracker, o as money } from "./bits-CMPYjCg6.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { t as Route } from "./order._id-CwgtNFXU.mjs";
import { r as useOrderRealtime } from "./marketplace.realtime-B-w0rbk5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order._id-nRCptyds.js
var import_jsx_runtime = require_jsx_runtime();
function OrderPage() {
	const { id } = Route.useParams();
	const { user } = useSession();
	useOrderRealtime(id);
	const { data, isLoading } = useQuery({
		queryKey: [
			"order",
			id,
			user?.id
		],
		enabled: Boolean(user),
		refetchInterval: 15e3,
		queryFn: async () => {
			if (!user) return null;
			const { data, error } = await firebaseData.from("restaurant_orders").select("id,status,subtotal,delivery_fee,total,currency,placed_at,delivery_address,contact_phone,notes,restaurants(name,slug),order_items(id,name,quantity,unit_price)").eq("id", id).eq("customer_id", user.id).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-2xl space-y-3 px-4 py-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-3xl" })]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl",
			children: "Order not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: "rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/orders",
				children: "My orders"
			})
		})]
	});
	const restaurant = data.restaurants;
	const items = data.order_items ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-enter mx-auto w-full max-w-2xl space-y-6 px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: restaurant?.name ?? "Your order"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: ["Placed ", new Date(data.placed_at).toLocaleString()]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "md3-surface rounded-3xl border border-border/60 bg-card p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusTracker, { status: data.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md3-surface rounded-3xl border border-border/60 bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 truncate",
								children: [
									it.quantity,
									" × ",
									it.name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(it.unit_price * it.quantity, data.currency) })]
						}, it.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-1 border-t border-border/60 pt-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Subtotal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: money(data.subtotal, data.currency) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted-foreground",
									children: "Delivery"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: money(data.delivery_fee, data.currency) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: money(data.total, data.currency) })]
							})
						]
					})
				]
			}),
			(data.delivery_address || data.contact_phone) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md3-surface rounded-3xl border border-border/60 bg-card p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Delivery"
					}),
					data.delivery_address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: data.delivery_address
					}),
					data.contact_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: data.contact_phone
					}),
					data.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted-foreground",
						children: ["Notes: ", data.notes]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/orders",
						children: "All orders"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: "rounded-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/restaurants",
						children: "Order again"
					})
				})]
			})
		]
	});
}
//#endregion
export { OrderPage as component };
