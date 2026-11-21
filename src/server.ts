import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  buildApiCatalog,
  buildApiDocsMarkdown,
  buildAuthMd,
  buildHomepageLinkHeaders,
  buildOAuthAuthorizationServerMetadata,
  buildOAuthProtectedResourceMetadata,
  buildOpenApiSpec,
  resolvePublicOrigin,
} from "./lib/discovery";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;
let adminInitTriggered = false;

function triggerAdminInit() {
  if (adminInitTriggered) return;
  adminInitTriggered = true;
  import("./server/firebase-admin")
    .then((m) => m.ensureAdminsConfiguredInFirestore())
    .catch((err) => {
      console.warn("[Server] Admin init deferred:", err?.message || err);
    });
}

async function getServerEntry(): Promise<ServerEntry> {
  triggerAdminInit();
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
function isHtmlDocumentRequest(request: Request) {
  return (
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").toLowerCase().includes("text/html")
  );
}

export async function normalizeCatastrophicSsrResponse(
  response: Response,
  request: Request,
): Promise<Response> {
  if (!isHtmlDocumentRequest(request) || response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage({ status: response.status || 500 }), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function buildDiscoveryResponse(request: Request, url: URL): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const origin = resolvePublicOrigin(request.url);
  const isHead = request.method === "HEAD";
  const cacheControl = "public, max-age=300";

  switch (url.pathname) {
    case "/googlefa95a1a25b45551e.html":
      return new Response(isHead ? null : "google-site-verification: googlefa95a1a25b45551e.html", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    case "/.well-known/api-catalog":
      return new Response(isHead ? null : JSON.stringify(buildApiCatalog(origin), null, 2), {
        status: 200,
        headers: {
          "content-type": "application/linkset+json; charset=utf-8",
          "cache-control": cacheControl,
        },
      });
    case "/openapi.json":
      return new Response(isHead ? null : JSON.stringify(buildOpenApiSpec(origin), null, 2), {
        status: 200,
        headers: {
          "content-type": "application/openapi+json; charset=utf-8",
          "cache-control": cacheControl,
        },
      });
    case "/api/docs":
      return new Response(isHead ? null : buildApiDocsMarkdown(origin), {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "cache-control": cacheControl,
        },
      });
    case "/api/health":
      return new Response(
        isHead
          ? null
          : JSON.stringify({
              status: "ok",
              service: "mealmate-consumer",
              company: "Taz Technologies",
              timestamp: new Date().toISOString(),
            }),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        },
      );
    case "/auth.md":
      return new Response(isHead ? null : buildAuthMd(origin), {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "cache-control": cacheControl,
        },
      });
    case "/.well-known/oauth-protected-resource":
      return new Response(
        isHead ? null : JSON.stringify(buildOAuthProtectedResourceMetadata(origin), null, 2),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": cacheControl,
          },
        },
      );
    case "/.well-known/oauth-authorization-server":
      return new Response(
        isHead ? null : JSON.stringify(buildOAuthAuthorizationServerMetadata(origin), null, 2),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": cacheControl,
          },
        },
      );
    default:
      return null;
  }
}

export function applyResponseHeaders(response: Response, url: URL): Response {
  const isHomepage = url.pathname === "/" || url.pathname === "/index.html";
  const isAiFounder = url.pathname === "/ai-founder";
  if (!isHomepage && !isAiFounder) return response;

  const headers = new Headers(response.headers);
  if (isHomepage) {
    for (const linkValue of buildHomepageLinkHeaders()) {
      headers.append("Link", linkValue);
    }
  }
  if (isAiFounder) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const discovery = buildDiscoveryResponse(request, url);
      if (discovery) {
        return discovery;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response, request);
      return applyResponseHeaders(normalized, url);
    } catch (error) {
      console.error(error);
      if (!isHtmlDocumentRequest(request)) {
        return Response.json(
          { error: "INTERNAL_SERVER_ERROR", message: "The request could not be completed." },
          { status: 500 },
        );
      }
      return new Response(renderErrorPage({ status: 500 }), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
