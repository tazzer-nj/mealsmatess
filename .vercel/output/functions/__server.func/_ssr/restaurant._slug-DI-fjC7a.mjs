import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { G as Minus, L as Plus, T as ShoppingBag, Z as MapPin, Zt as Bike, a as Utensils, b as Star, kt as Clock, z as Phone } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useCart } from "./cart-DfJUbDy7.mjs";
import { i as haversineKm, o as money, r as formatDistance, s as useUserLocation, t as OpenBadge } from "./bits-CMPYjCg6.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { a as useRestaurantRealtime } from "./marketplace.realtime-B-w0rbk5.mjs";
import { i as restaurantReviewsQuery, n as restaurantBySlugQuery, r as restaurantMenuQuery, t as Route } from "./restaurant._slug-Cn2uTO-v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurant._slug-DI-fjC7a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RestaurantPage() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const { data: restaurant, isLoading } = useQuery(restaurantBySlugQuery(slug));
	const { data: menu } = useQuery(restaurantMenuQuery(restaurant?.id));
	const { data: reviews } = useQuery(restaurantReviewsQuery(restaurant?.id));
	useRestaurantRealtime(restaurant?.id, slug);
	const { cart, addItem, setQuantity, subtotal, count } = useCart();
	const { coords } = useUserLocation();
	const distance = (0, import_react.useMemo)(() => {
		const loc = restaurant?.restaurant_locations?.[0];
		return coords && loc ? haversineKm(coords, loc) : null;
	}, [coords, restaurant]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const item of menu ?? []) {
			const key = item.category?.trim() || "Menu";
			map.set(key, [...map.get(key) ?? [], item]);
		}
		return [...map.entries()];
	}, [menu]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 pb-28 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 w-full rounded-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-8 w-2/3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-24 w-full rounded-2xl" })
		]
	});
	if (!restaurant) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-20 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Restaurant not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: "mt-4 rounded-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/restaurants",
				children: "Back to restaurants"
			})
		})]
	});
	const cartLine = (id) => cart?.restaurant_id === restaurant.id ? cart.lines.find((l) => l.menu_item_id === id)?.quantity ?? 0 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-enter mx-auto max-w-3xl pb-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-44 w-full overflow-hidden bg-muted sm:rounded-b-3xl",
				children: restaurant.cover_image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: restaurant.cover_image_url,
					alt: `${restaurant.name} cover photo`,
					className: "h-full w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full items-center justify-center text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
						className: "h-12 w-12",
						"aria-hidden": "true"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md3-surface -mt-10 rounded-3xl border border-border/60 bg-card p-4 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [
									restaurant.logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: restaurant.logo_url,
										alt: `${restaurant.name} logo`,
										className: "h-14 w-14 rounded-2xl object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "truncate text-xl font-semibold tracking-tight",
											children: restaurant.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: [restaurant.cuisine, restaurant.price_range].filter(Boolean).join(" · ")
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenBadge, { hours: restaurant.opening_hours })
								]
							}),
							restaurant.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: restaurant.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-amber-400 text-amber-400" }),
											Number(restaurant.avg_rating).toFixed(1),
											" (",
											restaurant.rating_count,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
											restaurant.delivery_estimate_minutes,
											" min"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bike, { className: "h-3.5 w-3.5" }), Number(restaurant.delivery_fee) === 0 ? "Free delivery" : money(restaurant.delivery_fee, restaurant.currency)]
									}),
									distance != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), formatDistance(distance)]
									}),
									restaurant.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `tel:${restaurant.phone}`,
										className: "flex items-center gap-1 underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }), restaurant.phone]
									})
								]
							}),
							Number(restaurant.min_order_amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-muted-foreground",
								children: ["Minimum order ", money(restaurant.min_order_amount, restaurant.currency)]
							}),
							!restaurant.is_accepting_orders && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "mt-3 rounded-full",
								children: "Not accepting orders right now"
							})
						]
					}),
					grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-center text-sm text-muted-foreground",
						children: "This restaurant hasn't published its menu yet."
					}) : grouped.map(([category, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
							children: category
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: (items ?? []).map((item) => {
								const qty = cartLine(item.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "md3-surface flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3",
									children: [
										item.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: item.image_url,
											alt: item.name,
											loading: "lazy",
											className: "h-16 w-16 shrink-0 rounded-xl object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xl",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, {
												className: "h-6 w-6 text-muted-foreground",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-sm font-medium",
													children: item.name
												}),
												item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "line-clamp-2 text-xs text-muted-foreground",
													children: item.description
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-sm font-semibold",
													children: money(item.price, restaurant.currency)
												})
											]
										}),
										!item.is_available ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "rounded-full",
											children: "Sold out"
										}) : qty > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "outline",
													className: "h-8 w-8 rounded-full",
													"aria-label": `Remove one ${item.name}`,
													onClick: () => setQuantity(item.id, qty - 1),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "w-6 text-center text-sm font-semibold",
													children: qty
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													className: "h-8 w-8 rounded-full",
													"aria-label": `Add one ${item.name}`,
													onClick: () => setQuantity(item.id, qty + 1),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
												})
											]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											className: "rounded-full",
											disabled: !restaurant.is_accepting_orders,
											onClick: () => {
												const { replaced } = addItem({
													restaurant_id: restaurant.id,
													restaurant_slug: restaurant.slug,
													restaurant_name: restaurant.name,
													currency: restaurant.currency,
													delivery_fee: Number(restaurant.delivery_fee),
													min_order_amount: Number(restaurant.min_order_amount)
												}, {
													menu_item_id: item.id,
													name: item.name,
													unit_price: Number(item.price),
													image_url: item.image_url
												});
												toast.success(`${item.name} added`, { description: replaced ? "Your previous cart from another restaurant was cleared." : void 0 });
											},
											children: "Add"
										})
									]
								}, item.id);
							})
						})]
					}, category)),
					(reviews?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Reviews"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: (reviews ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "md3-surface rounded-2xl border border-border/60 bg-card p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1 text-amber-500",
									children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-current" }, i))
								}), r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: r.comment
								})]
							}, r.id))
						})]
					})
				]
			}),
			count > 0 && cart?.restaurant_id === restaurant.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-16 z-40 px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mx-auto flex h-12 w-full max-w-md items-center justify-between rounded-full px-5 shadow-lg",
					onClick: () => navigate({ to: "/checkout" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-4 w-4" }),
							count,
							" item",
							count > 1 ? "s" : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [money(subtotal, restaurant.currency), " · Checkout"] })]
				})
			})
		]
	});
}
//#endregion
export { RestaurantPage as component };
