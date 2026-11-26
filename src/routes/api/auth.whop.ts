import { createFileRoute } from "@tanstack/react-router";
import { buildWhopOAuthStart } from "@/server/whop-session";
import { isWhopOAuthConfigured } from "@/server/whop";

export const Route = createFileRoute("/api/auth/whop")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isWhopOAuthConfigured()) {
          return Response.json(
            {
              error:
                "Whop Sign-In is not configured yet. Set WHOP_CLIENT_ID in your server environment.",
            },
            { status: 503 },
          );
        }

        const reqUrl = new URL(request.url);
        const wantsJson =
          reqUrl.searchParams.get("mode") === "json" ||
          (request.headers.get("accept") ?? "").includes("application/json");
        const popup = reqUrl.searchParams.get("popup") === "1" || wantsJson;
        const returnTo = reqUrl.searchParams.get("returnTo");

        try {
          const { url, pkceCookie } = buildWhopOAuthStart({
            request,
            popup,
            returnTo,
          });

          if (wantsJson) {
            return new Response(JSON.stringify({ url }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
                "Set-Cookie": pkceCookie,
              },
            });
          }

          return new Response(null, {
            status: 302,
            headers: {
              Location: url,
              "Cache-Control": "no-store",
              "Set-Cookie": pkceCookie,
            },
          });
        } catch (error) {
          return Response.json(
            {
              error: error instanceof Error ? error.message : "Could not start Whop OAuth flow.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
