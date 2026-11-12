import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-DjfdeTka.js
var $$splitComponentImporter = () => import("./scan-CXFN1WU7.mjs");
var Route = createFileRoute("/scan")({
	validateSearch: (search) => ({ mode: search["mode"] === "ingredients" ? "ingredients" : "dish" }),
	head: () => ({ meta: [
		{ title: "Food Scanner – MealMate" },
		{
			name: "description",
			content: "Point your camera at a dish to identify it, get nutrition facts, and add it to your meal planner."
		},
		{
			property: "og:title",
			content: "Food Scanner – MealMate"
		},
		{
			property: "og:description",
			content: "Identify any dish, see its nutrition, and save it to your planner."
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
