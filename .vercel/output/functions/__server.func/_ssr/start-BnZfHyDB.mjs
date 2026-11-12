import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
import { p as waitForFirebaseAuth, s as isHubSurface } from "./hub-surface-DqCmg7ui.mjs";
import { t as renderErrorPage } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-BnZfHyDB.js
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
var attachFirebaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const token = await (await waitForFirebaseAuth())?.getIdToken();
	return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
function isHtmlDocumentRequest(request) {
	return request.method === "GET" && (request.headers.get("accept") ?? "").toLowerCase().includes("text/html");
}
var errorMiddleware = createMiddleware().server(async ({ next, request, handlerType }) => {
	try {
		return await next();
	} catch (error) {
		if (error != null && typeof error === "object" && "statusCode" in error) throw error;
		console.error(error);
		if (handlerType === "serverFn" || !isHtmlDocumentRequest(request)) throw error;
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
});
var securityHeadersMiddleware = createMiddleware().server(async ({ next, request }) => {
	const url = new URL(request.url);
	const consumerVoice = !isHubSurface(url.hostname, url.pathname);
	const result = await next();
	const res = result instanceof Response ? result : result && typeof result === "object" && result.response instanceof Response ? result.response : null;
	if (res) {
		const h = res.headers;
		h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
		h.set("X-Content-Type-Options", "nosniff");
		h.set("Referrer-Policy", "strict-origin-when-cross-origin");
		h.set("Permissions-Policy", `camera=(self), microphone=${consumerVoice ? "(self)" : "()"}, geolocation=(), payment=(self)`);
		h.set("Content-Security-Policy", [
			"default-src 'self'",
			...consumerVoice ? ["worker-src 'self' blob:"] : [],
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://js.stripe.com https://cdn.paddle.com https://sdk.revenuecat-static.com",
			"frame-src 'self' https://mealmate-d2e53.firebaseapp.com https://accounts.google.com https://js.stripe.com https://hooks.stripe.com https://*.paddle.com https://*.revenuecat.com",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com data:",
			"img-src 'self' data: blob: https:",
			"media-src 'self' data: blob: https:",
			"connect-src 'self' https: wss:",
			"frame-ancestors *",
			"base-uri 'self'",
			"form-action 'self'"
		].join("; "));
	}
	return result;
});
var startInstance = createStart(() => ({
	functionMiddleware: [attachFirebaseAuth],
	requestMiddleware: [errorMiddleware, securityHeadersMiddleware]
}));
//#endregion
export { startInstance };
