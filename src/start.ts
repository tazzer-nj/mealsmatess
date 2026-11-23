import { createStart, createMiddleware } from "@tanstack/react-start";
import { contentSecurityPolicy as whopContentSecurityPolicy } from "@whop/elements";
import { isHubSurface } from "@/lib/hub-surface";

import { renderErrorPage } from "./lib/error-page";
import { attachFirebaseAuth } from "@/lib/firebase-auth-attacher";
import firebaseAppletConfig from "../firebase-applet-config.json";

const authDomains = Array.from(
  new Set(
    [
      process.env["VITE_FIREBASE_AUTH_DOMAIN"]?.trim(),
      firebaseAppletConfig.authDomain?.trim(),
      "mealmate-d2e53.firebaseapp.com",
    ].filter((domain): domain is string => Boolean(domain)),
  ),
);
const firebaseFrameSources = authDomains.map((domain) => `https://${domain}`).join(" ");
const whopCsp = whopContentSecurityPolicy({ wallets: true });

function isHtmlDocumentRequest(request: Request) {
  return (
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").toLowerCase().includes("text/html")
  );
}

const errorMiddleware = createMiddleware().server(async ({ next, request, handlerType }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    if (handlerType === "serverFn" || !isHtmlDocumentRequest(request)) throw error;
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Add hardening headers (HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy, CSP)
// to every server response. CSP is intentionally permissive for third-party image hosts
// (Lovable recipe assets, Firebase Storage, Unsplash) and the AI gateway.
const securityHeadersMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const consumerVoice = !isHubSurface(url.hostname, url.pathname);
  const result = await next();
  // `next()` may return a Response OR a framework result object (e.g. { response, context }).
  // Only attach headers when we actually have a Response — never wrap the framework result,
  // which would stringify to "[object Object]".
  const res =
    result instanceof Response
      ? result
      : result &&
          typeof result === "object" &&
          (result as { response?: unknown }).response instanceof Response
        ? (result as { response: Response }).response
        : null;
  if (res) {
    const h = res.headers;
    h.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    h.set(
      "Permissions-Policy",
      `camera=(self), microphone=${consumerVoice ? "(self)" : "()"}, geolocation=(), payment=(self)`,
    );
    const baseCsp = [
      "default-src 'self'",
      ...(consumerVoice ? ["worker-src 'self' blob:"] : []),
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://js.stripe.com https://cdn.paddle.com https://sdk.revenuecat-static.com",
      `frame-src 'self' ${firebaseFrameSources} https://accounts.google.com https://js.stripe.com https://hooks.stripe.com https://*.paddle.com https://*.revenuecat.com https://*.whop.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "connect-src 'self' https: wss:",
      "frame-ancestors *",
      "base-uri 'self'",
      "form-action 'self' https://api.whop.com",
    ].join("; ");
    h.set("Content-Security-Policy", whopCsp.merge(baseCsp));
  }
  return result;
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachFirebaseAuth],
  requestMiddleware: [errorMiddleware, securityHeadersMiddleware],
}));
