import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipes-BbjkL63E.js
var $$splitComponentImporter = () => import("./recipes-C9zDqSkN.mjs");
var Route = createFileRoute("/recipes")({
	head: () => ({ meta: [
		{ title: "Discover recipes | MealMate" },
		{
			name: "description",
			content: "Browse South African favourites, global classics, and personalised recipe ideas."
		},
		{
			property: "og:title",
			content: "Discover recipes | MealMate"
		},
		{
			property: "og:description",
			content: "Browse South African favourites, global classics, and personalised recipe ideas."
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
	validateSearch: (search) => ({
		...typeof search["c"] === "string" ? { c: search["c"] } : {},
		...typeof search["q"] === "string" ? { q: search["q"] } : {}
	}),
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
