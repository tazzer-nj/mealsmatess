import { createFileRoute } from "@tanstack/react-router";
import {
  clearSessionCookieHeader,
  getWhopSessionFromRequest,
  isHttpsRequest,
  isWhopOAuthConfigured,
  WHOP_SESSION_COOKIE,
} from "@/server/whop-auth";
import { assertBillingOrigin } from "@/server/revenuecat";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const result = await getWhopSessionFromRequest(request);
        const headers = new Headers({ "Cache-Control": "no-store" });
        if (result.setCookieHeader) {
          headers.append("Set-Cookie", result.setCookieHeader);
        }
        return Response.json(
          {
            user: result.publicUser,
            whopOAuthConfigured: isWhopOAuthConfigured(),
          },
          { status: 200, headers },
        );
      },
      DELETE: async ({ request }) => {
        assertBillingOrigin(request);
        return Response.json(
          { ok: true },
          {
            status: 200,
            headers: {
              "Set-Cookie": clearSessionCookieHeader(WHOP_SESSION_COOKIE, isHttpsRequest(request)),
              "Cache-Control": "no-store",
            },
          },
        );
      },
    },
  },
});
