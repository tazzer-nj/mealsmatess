import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";
import {
  buildSessionCookieHeader,
  clearCookieHeader,
  exchangeWhopCodeForTokens,
  fetchWhopUserInfo,
  readPkceCookieFromRequest,
  resolveRequestOrigin,
  sanitizeReturnTo,
  syncWhopUserToMealMate,
  WHOP_PKCE_COOKIE,
  type WhopSessionPayload,
} from "@/server/whop-session";

function popupCompletionResponse(
  result: { ok: true; returnTo: string } | { ok: false; error: string },
  headers: Headers,
) {
  const safePayload = JSON.stringify({
    type: "mealmate:whop-auth",
    ok: result.ok,
    returnTo: result.ok ? result.returnTo : "/auth",
    error: result.ok ? null : result.error,
  }).replace(/</g, "\\u003c");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Completing Sign In | MealMate</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0b1120;color:#f8fafc;margin:0;padding:24px;text-align:center;">
  <div>
    <p style="font-size:15px;font-weight:500;">${
      result.ok ? "Sign-in complete. Returning to MealMate…" : "Sign-in could not be completed."
    }</p>
    <p style="font-size:13px;color:#94a3b8;margin-top:8px;">You can close this window if it does not close automatically.</p>
  </div>
  <script>
    (function () {
      var payload = ${safePayload};
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, window.location.origin);
          window.close();
          return;
        }
      } catch (e) {}
      window.location.replace(payload.ok ? payload.returnTo : "/auth");
    })();
  </script>
</body>
</html>`;

  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(html, { status: 200, headers });
}

function redirectError(origin: string, message: string, clearCookies: string[]) {
  const target = new URL("/auth", origin);
  target.searchParams.set("whop_error", message);
  const headers = new Headers({
    Location: target.toString(),
    "Cache-Control": "no-store",
  });
  for (const cookie of clearCookies) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(null, { status: 302, headers });
}

function statesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length > 0 && bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = resolveRequestOrigin(request);
        const clearPkce = clearCookieHeader(WHOP_PKCE_COOKIE, request);
        const pkce = readPkceCookieFromRequest(request);
        const isPopup = Boolean(pkce?.popup);

        const oauthError = url.searchParams.get("error");
        const oauthErrorDesc = url.searchParams.get("error_description");
        if (oauthError) {
          const message = oauthErrorDesc || "Whop sign-in was cancelled or denied.";
          if (isPopup) {
            const headers = new Headers();
            headers.append("Set-Cookie", clearPkce);
            return popupCompletionResponse({ ok: false, error: message }, headers);
          }
          return redirectError(origin, message, [clearPkce]);
        }

        const code = url.searchParams.get("code")?.trim() ?? "";
        const state = url.searchParams.get("state")?.trim() ?? "";
        if (!pkce || !code || !state || !statesMatch(pkce.state, state)) {
          const message = "Your sign-in session expired or did not match. Please try again.";
          if (isPopup) {
            const headers = new Headers();
            headers.append("Set-Cookie", clearPkce);
            return popupCompletionResponse({ ok: false, error: message }, headers);
          }
          return redirectError(origin, message, [clearPkce]);
        }

        try {
          const tokens = await exchangeWhopCodeForTokens({
            code,
            codeVerifier: pkce.codeVerifier,
            redirectUri: pkce.redirectUri,
          });
          const userInfo = await fetchWhopUserInfo(tokens.access_token);
          const userId = await syncWhopUserToMealMate(userInfo);
          const normalizedEmail =
            typeof userInfo.email === "string" && userInfo.email.includes("@")
              ? userInfo.email.trim().toLowerCase()
              : null;
          const displayName =
            userInfo.name ||
            userInfo.preferred_username ||
            normalizedEmail?.split("@")[0] ||
            "Chef";

          const sessionPayload: WhopSessionPayload = {
            userId,
            whopUserId: String(userInfo.sub),
            email: normalizedEmail,
            name: displayName,
            picture: userInfo.picture ?? null,
            emailVerified: userInfo.email_verified !== false,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? null,
            expiresAt: Date.now() + Math.max(60, Number(tokens.expires_in ?? 3600)) * 1000,
            issuedAt: Date.now(),
          };

          const sessionCookie = buildSessionCookieHeader(sessionPayload, request);
          const headers = new Headers();
          headers.append("Set-Cookie", sessionCookie);
          headers.append("Set-Cookie", clearPkce);
          headers.set("Cache-Control", "no-store");

          const destination = sanitizeReturnTo(pkce.returnTo);
          if (isPopup) {
            return popupCompletionResponse({ ok: true, returnTo: destination }, headers);
          }

          headers.set("Location", `${origin}${destination}`);
          return new Response(null, { status: 302, headers });
        } catch (error) {
          console.error("[Whop OAuth Callback] Exchange failed:", error);
          const message = "Could not complete Whop sign-in right now. Please try again.";
          if (isPopup) {
            const headers = new Headers();
            headers.append("Set-Cookie", clearPkce);
            return popupCompletionResponse({ ok: false, error: message }, headers);
          }
          return redirectError(origin, message, [clearPkce]);
        }
      },
    },
  },
});
