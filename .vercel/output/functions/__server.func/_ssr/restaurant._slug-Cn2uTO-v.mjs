import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as waitForFirebaseAuth } from "./hub-surface-DqCmg7ui.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { a as listRestaurantReviews } from "./restaurants.functions-B6Ld_8Bw.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurant._slug-Cn2uTO-v.js
var RESTAURANT_PUBLIC_COLUMNS = "id,slug,name,description,cuisine,logo_url,cover_image_url,food_photos,opening_hours,price_range,delivery_fee,delivery_radius_km,min_order_amount,delivery_estimate_minutes,currency,avg_rating,rating_count,is_verified,is_demo,is_accepting_orders,supports_pickup,supports_delivery,address,phone,whatsapp,restaurant_locations(latitude,longitude,label,is_active)";
function mapRestaurant(row) {
	return {
		...row,
		delivery_fee: Number(row.delivery_fee ?? 0),
		delivery_radius_km: Number(row.delivery_radius_km ?? 0),
		min_order_amount: Number(row.min_order_amount ?? 0),
		delivery_estimate_minutes: Number(row.delivery_estimate_minutes ?? 30),
		avg_rating: Number(row.avg_rating ?? 0),
		rating_count: Number(row.rating_count ?? 0),
		restaurant_locations: (row.restaurant_locations ?? []).filter((l) => l.is_active !== false).map((l) => ({
			latitude: Number(l.latitude),
			longitude: Number(l.longitude),
			label: l.label ?? null
		}))
	};
}
var restaurantBySlugQuery = (slug) => queryOptions({
	queryKey: ["restaurant", slug],
	queryFn: async () => {
		const { data, error } = await firebaseData.from("restaurants").select(RESTAURANT_PUBLIC_COLUMNS).eq("slug", slug).eq("approval_status", "approved").eq("is_demo", false).maybeSingle();
		if (error) throw error;
		return data ? mapRestaurant(data) : null;
	}
});
var restaurantMenuQuery = (restaurantId) => queryOptions({
	queryKey: ["restaurant-menu", restaurantId ?? "none"],
	queryFn: async () => {
		if (!restaurantId) return [];
		const { data, error } = await firebaseData.from("menu_items").select("id,restaurant_id,name,description,image_url,price,is_available,category,sort_order").eq("restaurant_id", restaurantId).eq("is_available", true).eq("is_hidden", false).order("sort_order").order("name");
		if (error) throw error;
		return (data ?? []).map((item) => ({
			...item,
			price: Number(item.price ?? 0)
		}));
	}
});
var restaurantReviewsQuery = (restaurantId) => queryOptions({
	queryKey: ["restaurant-reviews", restaurantId ?? "none"],
	queryFn: async () => {
		if (!restaurantId) return [];
		return listRestaurantReviews({ data: { restaurantId } });
	}
});
var $$splitComponentImporter = () => import("./restaurant._slug-DI-fjC7a.mjs");
var $$splitNotFoundComponentImporter = () => import("./restaurant._slug-DJz1on0N.mjs");
var $$splitErrorComponentImporter = () => import("./restaurant._slug-CJbzYfi_.mjs");
var Route = createFileRoute("/restaurant/$slug")({
	ssr: false,
	loader: async ({ context, params }) => {
		if (!await waitForFirebaseAuth()) return null;
		return context.queryClient.ensureQueryData(restaurantBySlugQuery(params.slug));
	},
	head: ({ params }) => ({ meta: [
		{ title: `${params.slug.replace(/-/g, " ")} | MealMate Restaurants` },
		{
			name: "description",
			content: `Browse the menu, delivery details and reviews for this MealMate partner restaurant, then order in a few taps.`
		},
		{
			property: "og:title",
			content: `${params.slug.replace(/-/g, " ")} | MealMate`
		},
		{
			property: "og:description",
			content: "Menu, delivery info and live order tracking on MealMate."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { restaurantReviewsQuery as i, restaurantBySlugQuery as n, restaurantMenuQuery as r, Route as t };
