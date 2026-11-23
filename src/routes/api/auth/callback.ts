import { createFileRoute } from "@tanstack/react-router";
import {
  buildWhopUserId,
  clearSessionCookieHeader,
  exchangeWhopCode,
  fetchWhopUserInfo,
  isHttpsRequest,
  resolveRequestOrigin,
  sealWhopSessionCookie,
  verifyPkceCookie,
  WHOP_PKCE_COOKIE,
} from "@/server/whop-auth";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function callbackHtmlResponse(
  options: { ok: boolean; redirectTo: string; errorMessage?: string },
  headers: HeadersInit,
) {
  const payload = JSON.stringify({
    type: "MEALMATE_WHOP_AUTH",
    ok: options.ok,
    error: options.errorMessage ?? null,
    redirectTo: options.redirectTo,
  });
  const safeRedirect = escapeHtml(options.redirectTo);
  const safeTitle = options.ok ? "Sign-in complete" : "Sign-in could not be completed";
  const safeBody = options.ok
    ? "Signing you into MealMate…"
    : escapeHtml(options.errorMessage || "Authentication failed. Please try again.");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle} | MealMate</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #0b0b0f; color: #f5f5f7; text-align: center; padding: 24px; }
      a { color: #a5b4fc; text-decoration: underline; }
    </style>
  </head>
  <body>
    <main>
      <p>${safeBody}</p>
      <p><a href="${safeRedirect}">Continue to MealMate</a></p>
    </main>
    <script>
      (function () {
        var msg = ${payload};
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(msg, window.location.origin);
            window.close();
            return;
          }
        } catch (e) {}
        window.location.replace(${JSON.stringify(options.redirectTo)});
      })();
    </script>
  </body>
</html>`;

  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("Content-Type", "text/html; charset=utf-8");
  mergedHeaders.set("Cache-Control", "no-store");

  return new Response(html, {
    status: options.ok ? 200 : 400,
    headers: mergedHeaders,
  });
}

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const https = isHttpsRequest(request);
        const clearPkce = clearSessionCookieHeader(WHOP_PKCE_COOKIE, https);
        const origin = resolveRequestOrigin(request);

        const oauthError =
          url.searchParams.get("error_description") ?? url.searchParams.get("error");
        if (oauthError) {
          return callbackHtmlResponse(
            {
              ok: false,
              redirectTo: `${origin}/auth`,
              errorMessage: "Whop sign-in was cancelled or denied.",
            },
            { "Set-Cookie": clearPkce },
          );
        }

        const code = url.searchParams.get("code")?.trim() ?? "";
        const state = url.searchParams.get("state")?.trim() ?? "";
        if (!code || !state) {
          return callbackHtmlResponse(
            {
              ok: false,
              redirectTo: `${origin}/auth`,
              errorMessage: "Missing authorization code or state parameter.",
            },
            { "Set-Cookie": clearPkce },
          );
        }

        const pkce = verifyPkceCookie(request, state);
        if (!pkce) {
          return callbackHtmlResponse(
            {
              ok: false,
              redirectTo: `${origin}/auth`,
              errorMessage: "Your sign-in session expired. Please try again.",
            },
            { "Set-Cookie": clearPkce },
          );
        }

        try {
          const tokens = await exchangeWhopCode({
            code,
            codeVerifier: pkce.codeVerifier,
            redirectUri: pkce.redirectUri,
          });
          const userInfo = await fetchWhopUserInfo(tokens.access_token);
          const whopUserId = String(userInfo.sub);
          let userId = buildWhopUserId(whopUserId);
          const email = userInfo.email?.trim().toLowerCase() || null;
          const displayName =
            userInfo.name?.trim() ||
            userInfo.preferred_username?.trim() ||
            (email ? email.split("@")[0] : null) ||
            "Chef";
          const photoURL = userInfo.picture?.trim() || null;

          // Persist/lookup MealMate profile in Firestore when Admin SDK is configured.
          try {
            const { getFirebaseAdminFirestore } = await import("@/server/firebase-admin");
            const db = getFirebaseAdminFirestore();
            const mapRef = db.collection("whop_users").doc(whopUserId);
            const existingMap = await mapRef.get();
            const mappedId = existingMap.data()?.["userId"];
            if (typeof mappedId === "string" && mappedId.trim()) {
              userId = mappedId.trim();
            }

            await mapRef.set(
              {
                userId,
                whopUserId,
                email,
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );

            const userRef = db.collection("users").doc(userId);
            const existingUser = await userRef.get();
            const existingData = (existingUser.data() ?? {}) as Record<string, unknown>;
            await userRef.set(
              {
                id: userId,
                whop_user_id: whopUserId,
                provider: "whop",
                ...(email && !existingData["email"] ? { email } : {}),
                ...(!existingData["displayName"] ? { displayName } : {}),
                ...(!existingData["photoURL"] && photoURL ? { photoURL } : {}),
                ...(!existingData["createdAt"] ? { createdAt: new Date().toISOString() } : {}),
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            );
          } catch {
            // Allow sign-in to succeed cleanly even when Firebase Admin credentials are absent locally.
          }

          const expiresInMs = Math.max(60, Number(tokens.expires_in ?? 3600)) * 1000;
          const sessionCookie = sealWhopSessionCookie(
            {
              userId,
              whopUserId,
              email,
              displayName,
              photoURL,
              emailVerified: userInfo.email_verified ?? true,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token ?? null,
              expiresAt: Date.now() + expiresInMs,
            },
            request,
          );

          const headers = new Headers();
          headers.append("Set-Cookie", sessionCookie);
          headers.append("Set-Cookie", clearPkce);

          return callbackHtmlResponse(
            {
              ok: true,
              redirectTo: `${origin}/onboarding`,
            },
            headers,
          );
        } catch (err) {
          console.error("[Whop Auth Callback] Error:", err instanceof Error ? err.message : err);
          return callbackHtmlResponse(
            {
              ok: false,
              redirectTo: `${origin}/auth`,
              errorMessage: "Could not complete Whop sign-in. Please try again.",
            },
            { "Set-Cookie": clearPkce },
          );
        }
      },
    },
  },
});
