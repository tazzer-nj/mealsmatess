import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-BXwKxpfI.js
var $$splitComponentImporter = () => import("./chat-Boi8jVmx.mjs");
var Route = createFileRoute("/chat")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (search) => typeof search["q"] === "string" ? { q: search["q"].slice(0, 200) } : {},
	head: () => ({ meta: [
		{ title: "AI Food Chat & Visual Mode — MealMate" },
		{
			name: "description",
			content: "Ask MealMate anything about food and get an AI answer plus a narrated, animated visual explanation you can download."
		},
		{
			property: "og:title",
			content: "AI Food Chat & Visual Mode — MealMate"
		},
		{
			property: "og:description",
			content: "AI answers with animated, narrated visual explanations for Premium members."
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
