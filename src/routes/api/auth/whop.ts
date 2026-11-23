import { createFileRoute } from "@tanstack/react-router";
import { buildWhopAuthorizeRequest, isWhopOAuthConfigured } from "@/server/whop-auth";

export const Route = createFileRoute("/api/auth/whop")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isWhopOAuthConfigured()) {
          return Response.json(
            {
              error:
                "Sign in with Whop is not configured yet. Set WHOP_CLIENT_ID and WHOP_CLIENT_SECRET.",
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }

        const url = new URL(request.url);
        const mode = url.searchParams.get("mode") === "json" ? "popup" : "redirect";
        const { url: authorizeUrl, pkceCookieHeader } = buildWhopAuthorizeRequest(request, mode);

        if (mode === "popup") {
          return Response.json(
            { url: authorizeUrl },
            {
              status: 200,
              headers: {
                "Set-Cookie": pkceCookieHeader,
                "Cache-Control": "no-store",
              },
            },
          );
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: authorizeUrl,
            "Set-Cookie": pkceCookieHeader,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
