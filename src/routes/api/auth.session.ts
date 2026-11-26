import { createFileRoute } from "@tanstack/react-router";
import {
  clearCookieHeader,
  getWhopSessionFromRequest,
  toPublicSessionUser,
  WHOP_PKCE_COOKIE,
  WHOP_SESSION_COOKIE,
} from "@/server/whop-session";
import { isWhopOAuthConfigured } from "@/server/whop";
import { assertBillingOrigin } from "@/server/revenuecat";

export const Route = createFileRoute("/api/auth/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { session, refreshedSetCookie } = await getWhopSessionFromRequest(request);
        const headers = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        if (refreshedSetCookie) {
          headers.append("Set-Cookie", refreshedSetCookie);
        }

        return new Response(
          JSON.stringify({
            user: session ? toPublicSessionUser(session) : null,
            whopOAuthConfigured: isWhopOAuthConfigured(),
          }),
          { status: 200, headers },
        );
      },
      DELETE: async ({ request }) => {
        try {
          assertBillingOrigin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }
        const headers = new Headers({
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        headers.append("Set-Cookie", clearCookieHeader(WHOP_SESSION_COOKIE, request));
        headers.append("Set-Cookie", clearCookieHeader(WHOP_PKCE_COOKIE, request));
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
      },
    },
  },
});
