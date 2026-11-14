import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { n as toast } from "./dist-BV242RuG.js";
import { t as Link } from "./link-DqHkHLEB.js";
import { n as useNavigate } from "./useNavigate-BlI0eDHL.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { t as useServerFn } from "./useServerFn-CppVREy0.js";
import { n as useSession } from "./use-session-DrDo_MXn.js";
import { t as LoaderCircle } from "./loader-circle-DQwT8cZ8.js";
import { n as Minus, t as useCart } from "./cart-DyCA-r9x.js";
import { t as Plus } from "./plus-B_wgAisR.js";
import { t as Button } from "./button-yWWHKMUk.js";
import { t as Input } from "./input-Cfa9G600.js";
import { t as Textarea } from "./textarea-DgSuVFm-.js";
import { C as placeOrder, vt as ShoppingBag } from "./index-CfUBRHG1.js";
import { r as money } from "./bits-ClMCMuB_.js";
//#region src/routes/checkout.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CheckoutPage() {
	const { cart, setQuantity, clear, subtotal, deliveryFee, total } = useCart();
	const { user } = useSession();
	const navigate = useNavigate();
	const submit = useServerFn(placeOrder);
	const [address, setAddress] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const currency = cart?.currency ?? "ZAR";
	const belowMin = !!cart && subtotal < Number(cart.min_order_amount ?? 0);
	async function handlePlace() {
		if (!cart) return;
		setBusy(true);
		try {
			const res = await submit({ data: {
				restaurantId: cart.restaurant_id,
				items: cart.lines.map((l) => ({
					menu_item_id: l.menu_item_id,
					quantity: l.quantity
				})),
				delivery_address: address.trim(),
				contact_phone: phone.trim(),
				...notes.trim() ? { notes: notes.trim() } : {}
			} });
			clear();
			toast.success("Order placed");
			navigate({
				to: "/order/$id",
				params: { id: res.orderId }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not place your order");
		} finally {
			setBusy(false);
		}
	}
	if (!cart || cart.lines.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "h-10 w-10 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "Your cart is empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Browse nearby restaurants and add a few dishes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/restaurants",
					children: "Find restaurants"
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex-1 space-y-6 px-4 pb-10 pt-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl leading-tight",
				children: "Checkout"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: ["From ", cart.restaurant_name]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md3-surface space-y-3 rounded-3xl border border-border/60 bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Your items"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: cart.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "line-clamp-1 text-sm font-medium",
									children: line.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: money(line.unit_price, currency)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "secondary",
										className: "h-8 w-8 rounded-full",
										"aria-label": `Decrease ${line.name}`,
										onClick: () => setQuantity(line.menu_item_id, line.quantity - 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-6 text-center text-sm",
										children: line.quantity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon",
										variant: "secondary",
										className: "h-8 w-8 rounded-full",
										"aria-label": `Increase ${line.name}`,
										onClick: () => setQuantity(line.menu_item_id, line.quantity + 1),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-20 text-right text-sm font-medium",
								children: money(line.unit_price * line.quantity, currency)
							})
						]
					}, line.menu_item_id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md3-surface space-y-3 rounded-3xl border border-border/60 bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold",
						children: "Delivery details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Delivery address",
						value: address,
						onChange: (e) => setAddress(e.target.value),
						"aria-label": "Delivery address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Contact phone",
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						"aria-label": "Contact phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "Notes for the restaurant (optional)",
						value: notes,
						onChange: (e) => setNotes(e.target.value),
						"aria-label": "Order notes"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "md3-surface space-y-2 rounded-3xl border border-border/60 bg-card p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Subtotal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(subtotal, currency) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Delivery"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: deliveryFee === 0 ? "Free" : money(deliveryFee, currency) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between border-t border-border/60 pt-2 text-base font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(total, currency) })]
					}),
					belowMin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-destructive",
						children: [
							"Minimum order is ",
							money(cart.min_order_amount, currency),
							"."
						]
					})
				]
			}),
			user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "w-full rounded-full",
				size: "lg",
				disabled: busy || belowMin || address.trim().length < 4 || phone.trim().length < 5,
				onClick: handlePlace,
				children: [
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
					"Place order · ",
					money(total, currency)
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "w-full rounded-full",
				size: "lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					children: "Sign in to place your order"
				})
			})
		]
	});
}
//#endregion
export { CheckoutPage as component };
