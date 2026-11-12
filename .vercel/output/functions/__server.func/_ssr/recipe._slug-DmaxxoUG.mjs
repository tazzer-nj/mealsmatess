import { _ as lazyRouteComponent, qt as notFound, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as waitForFirebaseAuth } from "./hub-surface-DqCmg7ui.mjs";
import { a as recipeBySlugQuery } from "./queries-v7vmnG2D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe._slug-DmaxxoUG.js
async function postAuthenticatedAi(path, body, { timeoutMs = 45e3, signal } = {}) {
	signal?.throwIfAborted();
	const user = await waitForFirebaseAuth();
	if (!user) throw new Error("Sign in to use MealMate AI.");
	const token = await user.getIdToken();
	signal?.throwIfAborted();
	let response;
	try {
		response = await fetch(path, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body),
			signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs)
		});
	} catch (error) {
		if (signal?.aborted) throw new DOMException("Request interrupted", "AbortError");
		if (error instanceof Error && error.name === "TimeoutError") throw new Error("The AI request timed out. Please try again.");
		throw new Error("The AI service is temporarily unavailable. Please try again.");
	}
	const data = await response.json().catch(() => null);
	if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "The AI request could not be completed.");
	if (!data) throw new Error("The AI service returned an invalid response. Please try again.");
	return data;
}
var $$splitComponentImporter = () => import("./recipe._slug-ynshQHHD.mjs");
var Route = createFileRoute("/recipe/$slug")({
	ssr: false,
	loader: async ({ context, params }) => {
		if (!await waitForFirebaseAuth()) return null;
		const recipe = await context.queryClient.ensureQueryData(recipeBySlugQuery(params.slug));
		if (!recipe) throw notFound();
		return recipe;
	},
	head: ({ loaderData }) => loaderData ? { meta: [
		{ title: `${loaderData.name} — MealMate` },
		{
			name: "description",
			content: loaderData.description || `Cook ${loaderData.name} with ingredients and step-by-step instructions from MealMate.`
		},
		{
			property: "og:title",
			content: `${loaderData.name} — MealMate`
		},
		{
			property: "og:description",
			content: loaderData.description || `Cook ${loaderData.name} with ingredients and step-by-step instructions from MealMate.`
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		...loaderData.image_url?.startsWith("https://") ? [{
			property: "og:image",
			content: loaderData.image_url
		}, {
			name: "twitter:image",
			content: loaderData.image_url
		}] : []
	] } : {},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { postAuthenticatedAi as n, Route as t };
