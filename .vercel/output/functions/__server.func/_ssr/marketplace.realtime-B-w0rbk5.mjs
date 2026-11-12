import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import "../_libs/firebase.mjs";
import { a as onSnapshot, d as collection, f as doc, s as query, u as where } from "../_libs/@firebase/firestore+[...].mjs";
import { a as db, i as auth } from "./hub-surface-DqCmg7ui.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { i as listRestaurantOrders } from "./restaurants.functions-B6Ld_8Bw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/marketplace.realtime-B-w0rbk5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function watchCollection(table, constraints, onChange) {
	const activeQuery = query(collection(db, table), ...constraints);
	return onSnapshot(activeQuery, onChange, (error) => console.error(`[firebase realtime] ${table}`, error));
}
function useRestaurantRealtime(restaurantId, slug) {
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!restaurantId) return;
		const invalidateMenu = () => {
			queryClient.invalidateQueries({ queryKey: ["restaurant-menu", restaurantId] });
			queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
		};
		const unsubscribers = [
			onSnapshot(doc(db, "restaurants", restaurantId), () => {
				if (slug) queryClient.invalidateQueries({ queryKey: ["restaurant", slug] });
				queryClient.invalidateQueries({ queryKey: ["restaurants", "approved"] });
				queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
			}, (error) => console.error("[firebase realtime] restaurant", error)),
			watchCollection("menu_items", [where("restaurant_id", "==", restaurantId), where("is_hidden", "==", false)], invalidateMenu),
			watchCollection("restaurant_promotions", [where("restaurant_id", "==", restaurantId), where("is_active", "==", true)], () => {
				queryClient.invalidateQueries({ queryKey: ["restaurant-promotions", restaurantId] });
				queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
			}),
			watchCollection("restaurant_locations", [where("restaurant_id", "==", restaurantId)], () => {
				queryClient.invalidateQueries({ queryKey: ["restaurant-branches", restaurantId] });
			})
		];
		return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
	}, [
		restaurantId,
		slug,
		queryClient
	]);
}
function useMarketplaceRealtime() {
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		const unsubscribers = [
			watchCollection("restaurants", [where("approval_status", "==", "approved"), where("is_demo", "==", false)], () => {
				queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
				queryClient.invalidateQueries({ queryKey: ["restaurants", "approved"] });
			}),
			watchCollection("menu_items", [where("is_available", "==", true), where("is_hidden", "==", false)], () => {
				queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
			}),
			watchCollection("restaurant_promotions", [where("is_active", "==", true)], () => {
				queryClient.invalidateQueries({ queryKey: ["marketplace-feed"] });
			})
		];
		return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
	}, [queryClient]);
}
function useOrderRealtime(orderId, onChange) {
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!orderId) return;
		return onSnapshot(doc(db, "restaurant_orders", orderId), (snapshot) => {
			if (!snapshot.exists()) return;
			queryClient.invalidateQueries({ queryKey: ["order", orderId] });
			queryClient.invalidateQueries({ queryKey: ["restaurant-order", orderId] });
			queryClient.invalidateQueries({ queryKey: ["my-orders"] });
			const status = snapshot.data().status;
			if (typeof status === "string") onChange?.(status);
		}, (error) => console.error("[firebase realtime] order", error));
	}, [orderId, queryClient]);
}
function usePartnerOrdersRealtime(restaurantId, onNewOrder) {
	const queryClient = useQueryClient();
	const loadOrders = useServerFn(listRestaurantOrders);
	const previousOrderIds = (0, import_react.useRef)(null);
	const { data: orders } = useQuery({
		queryKey: ["partner-orders-live", restaurantId],
		enabled: Boolean(restaurantId && auth.currentUser),
		queryFn: () => loadOrders({ data: {
			restaurantId,
			scope: "active"
		} }),
		refetchInterval: 15e3
	});
	(0, import_react.useEffect)(() => {
		if (!orders || !restaurantId) return;
		const nextIds = new Set(orders.map((order) => order.id));
		const previous = previousOrderIds.current;
		if (previous) {
			if ([...nextIds].some((orderId) => !previous.has(orderId))) onNewOrder?.();
			queryClient.invalidateQueries({ queryKey: [
				"partner",
				"orders",
				restaurantId
			] });
			queryClient.invalidateQueries({ queryKey: [
				"partner",
				"stats",
				restaurantId
			] });
		}
		previousOrderIds.current = nextIds;
	}, [
		orders,
		restaurantId,
		queryClient
	]);
}
function useMyOrdersRealtime(userId) {
	const queryClient = useQueryClient();
	(0, import_react.useEffect)(() => {
		if (!userId || auth.currentUser?.uid !== userId) return;
		return watchCollection("restaurant_orders", [where("customer_id", "==", userId)], () => {
			queryClient.invalidateQueries({ queryKey: ["my-orders"] });
			queryClient.invalidateQueries({ queryKey: ["my-restaurant-orders"] });
		});
	}, [userId, queryClient]);
}
//#endregion
export { useRestaurantRealtime as a, usePartnerOrdersRealtime as i, useMyOrdersRealtime as n, useOrderRealtime as r, useMarketplaceRealtime as t };
