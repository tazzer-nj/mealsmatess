import { createFileRoute } from "@tanstack/react-router";
import {
  clearSessionCookieHeader,
  isHttpsRequest,
  WHOP_PKCE_COOKIE,
  WHOP_SESSION_COOKIE,
} from "@/server/whop-auth";
import { assertBillingOrigin } from "@/server/revenuecat";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        assertBillingOrigin(request);
        const https = isHttpsRequest(request);
        const headers = new Headers({ "Cache-Control": "no-store" });
        headers.append("Set-Cookie", clearSessionCookieHeader(WHOP_SESSION_COOKIE, https));
        headers.append("Set-Cookie", clearSessionCookieHeader(WHOP_PKCE_COOKIE, https));
        return Response.json({ ok: true }, { status: 200, headers });
      },
    },
  },
});
