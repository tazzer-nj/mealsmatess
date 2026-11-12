import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order._id-CwgtNFXU.js
var $$splitComponentImporter = () => import("./order._id-nRCptyds.mjs");
var Route = createFileRoute("/order/$id")({
	head: () => ({ meta: [
		{ title: "Order tracking | MealMate" },
		{
			name: "description",
			content: "Follow your MealMate order from the kitchen to your door with live status updates."
		},
		{
			property: "og:title",
			content: "Order tracking | MealMate"
		},
		{
			property: "og:description",
			content: "Live status updates for your MealMate order."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
