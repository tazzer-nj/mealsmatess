import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-DfJUbDy7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var KEY = "mealmate.cart.v1";
var EVENT = "mealmate:cart";
function readCart() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.restaurant_id || !Array.isArray(parsed.lines)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function write(cart) {
	if (typeof window === "undefined") return;
	if (!cart || cart.lines.length === 0) window.localStorage.removeItem(KEY);
	else window.localStorage.setItem(KEY, JSON.stringify(cart));
	window.dispatchEvent(new Event(EVENT));
}
function clearCart() {
	write(null);
}
function cartTotals(cart) {
	const subtotal = (cart?.lines ?? []).reduce((s, l) => s + l.unit_price * l.quantity, 0);
	const deliveryFee = cart?.delivery_fee ?? 0;
	const count = (cart?.lines ?? []).reduce((s, l) => s + l.quantity, 0);
	return {
		subtotal,
		deliveryFee,
		total: subtotal + deliveryFee,
		count
	};
}
function useCart() {
	const [cart, setCart] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const sync = () => setCart(readCart());
		sync();
		window.addEventListener(EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	const addItem = (0, import_react.useCallback)((restaurant, line, quantity = 1) => {
		const current = readCart();
		const sameRestaurant = current?.restaurant_id === restaurant.restaurant_id;
		const lines = [...(sameRestaurant && current ? current : {
			...restaurant,
			lines: []
		}).lines];
		const idx = lines.findIndex((l) => l.menu_item_id === line.menu_item_id);
		if (idx >= 0) lines[idx] = {
			...lines[idx],
			quantity: lines[idx].quantity + quantity
		};
		else lines.push({
			...line,
			quantity
		});
		write({
			...restaurant,
			lines
		});
		return { replaced: !!current && !sameRestaurant };
	}, []);
	const setQuantity = (0, import_react.useCallback)((menuItemId, quantity) => {
		const current = readCart();
		if (!current) return;
		const lines = current.lines.map((l) => l.menu_item_id === menuItemId ? {
			...l,
			quantity
		} : l).filter((l) => l.quantity > 0);
		write(lines.length ? {
			...current,
			lines
		} : null);
	}, []);
	return {
		cart,
		addItem,
		setQuantity,
		removeItem: (0, import_react.useCallback)((menuItemId) => setQuantity(menuItemId, 0), [setQuantity]),
		clear: clearCart,
		...cartTotals(cart)
	};
}
//#endregion
export { useCart as t };
