import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-Bw3hN1UL.js
var $$splitComponentImporter = () => import("./chat-BE3-Nrbj.mjs");
var Route = createFileRoute("/chat")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
	head: () => ({ meta: [
		{ title: "Mia — Your AI Food Companion · MealMate" },
		{
			name: "description",
			content: "Ask Mia anything about food: recipes, substitutions, meal ideas and what you can cook with what you already have."
		},
		{
			property: "og:title",
			content: "Mia — Your AI Food Companion · MealMate"
		},
		{
			property: "og:description",
			content: "Recipes, planning and cooking help from Mia, your personal food companion."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] })
});
//#endregion
export { Route as t };
