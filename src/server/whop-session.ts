import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const WHOP_SESSION_COOKIE = "mealmate_whop_session";
export const WHOP_PKCE_COOKIE = "mealmate_whop_pkce";
const WHOP_OAUTH_BASE = "https://api.whop.com/oauth";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const PKCE_TTL_SECONDS = 10 * 60;
const REFRESH_LEEWAY_MS = 5 * 60 * 1000;

export type WhopSessionPayload = {
  userId: string;
  whopUserId: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  issuedAt: number;
};

export type PublicSessionUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: "whop";
  whopUserId: string;
};

type PkceCookiePayload = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  nonce: string;
  popup: boolean;
  returnTo: string;
  createdAt: number;
};

let ephemeralFallbackSecret: Buffer | null = null;
function getSessionEncryptionKey(): Buffer {
  const secret = (
    process.env["WHOP_SESSION_SECRET"] ||
    process.env["WHOP_CLIENT_SECRET"] ||
    process.env["WHOP_WEBHOOK_SECRET"] ||
    process.env["SESSION_SECRET"] ||
    ""
  ).trim();
  if (secret) {
    return createHash("sha256").update(`mealmate:whop-session:${secret}`).digest();
  }
  if (!ephemeralFallbackSecret) {
    ephemeralFallbackSecret = randomBytes(32);
  }
  return ephemeralFallbackSecret;
}

export function sealSessionValue(payload: unknown): string {
  const key = getSessionEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function unsealSessionValue<T>(sealed: string | undefined | null): T | null {
  if (!sealed || typeof sealed !== "string") return null;
  const parts = sealed.split(".");
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0]!, "base64url");
    const tag = Buffer.from(parts[1]!, "base64url");
    const ciphertext = Buffer.from(parts[2]!, "base64url");
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return null;
    const decipher = createDecipheriv("aes-256-gcm", getSessionEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

export function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto) return forwardedProto === "https";
  return new URL(request.url).protocol === "https:";
}

export function serializeCookie(
  name: string,
  value: string,
  request: Request,
  options: { maxAge: number },
): string {
  const secure = isHttpsRequest(request);
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${Math.max(0, Math.floor(options.maxAge))}`,
  ];
  if (secure) {
    parts.push("Secure", "SameSite=None", "Partitioned");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

export function clearCookieHeader(name: string, request: Request): string {
  return serializeCookie(name, "", request, { maxAge: 0 });
}

export function resolveRequestOrigin(request: Request): string {
  const envUrl = (process.env["MEALMATE_APP_URL"] ?? "").trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.split(",")[0]?.trim();
  if (host && !/[\s/\\]/.test(host)) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host);
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto = forwardedProto || (isLocal ? "http" : "https");
    if (proto === "http" || proto === "https") {
      return `${proto}://${host}`;
    }
  }
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      // Fallback to request URL origin
    }
  }
  return new URL(request.url).origin;
}

export function generatePkcePair() {
  const codeVerifier = randomBytes(48).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  return { codeVerifier, codeChallenge, state, nonce };
}

export function sanitizeReturnTo(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return "/";
  }
  return trimmed;
}

export function buildWhopOAuthStart(params: {
  request: Request;
  popup?: boolean;
  returnTo?: string | null;
}) {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  if (!clientId) {
    throw new Error("WHOP_CLIENT_ID is not configured.");
  }
  const origin = resolveRequestOrigin(params.request);
  const redirectUri = `${origin}/api/auth/callback`;
  const { codeVerifier, codeChallenge, state, nonce } = generatePkcePair();

  const authUrl = new URL(`${WHOP_OAUTH_BASE}/authorize`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const pkcePayload: PkceCookiePayload = {
    state,
    codeVerifier,
    redirectUri,
    nonce,
    popup: Boolean(params.popup),
    returnTo: sanitizeReturnTo(params.returnTo),
    createdAt: Date.now(),
  };

  const pkceCookie = serializeCookie(
    WHOP_PKCE_COOKIE,
    sealSessionValue(pkcePayload),
    params.request,
    { maxAge: PKCE_TTL_SECONDS },
  );

  return { url: authUrl.toString(), pkceCookie, redirectUri, state };
}

export function readPkceCookieFromRequest(request: Request): PkceCookiePayload | null {
  const cookies = parseCookies(request.headers.get("cookie"));
  const data = unsealSessionValue<PkceCookiePayload>(cookies[WHOP_PKCE_COOKIE]);
  if (!data || Date.now() - data.createdAt > PKCE_TTL_SECONDS * 1000) return null;
  return data;
}

type TokenEndpointResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
  token_type?: string;
  scope?: string;
};

export async function exchangeWhopCodeForTokens(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenEndpointResponse> {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  const clientSecret = (process.env["WHOP_CLIENT_SECRET"] ?? "").trim();
  if (!clientId) throw new Error("WHOP_CLIENT_ID is not configured.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Whop token exchange failed (${response.status}).`);
  }
  const tokens = (await response.json()) as TokenEndpointResponse;
  if (!tokens?.access_token) {
    throw new Error("Whop token exchange did not return an access_token.");
  }
  return tokens;
}

export async function refreshWhopAccessToken(refreshToken: string): Promise<TokenEndpointResponse> {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  const clientSecret = (process.env["WHOP_CLIENT_SECRET"] ?? "").trim();
  if (!clientId) throw new Error("WHOP_CLIENT_ID is not configured.");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Whop token refresh failed (${response.status}).`);
  }
  const tokens = (await response.json()) as TokenEndpointResponse;
  if (!tokens?.access_token) {
    throw new Error("Whop token refresh did not return an access_token.");
  }
  return tokens;
}

export type WhopUserInfo = {
  sub: string;
  email?: string | null;
  email_verified?: boolean;
  name?: string | null;
  preferred_username?: string | null;
  picture?: string | null;
};

export async function fetchWhopUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const response = await fetch(`${WHOP_OAUTH_BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Whop userinfo request failed (${response.status}).`);
  }
  const info = (await response.json()) as WhopUserInfo;
  if (!info?.sub) {
    throw new Error("Whop userinfo did not return a subject identifier.");
  }
  return info;
}

export async function syncWhopUserToMealMate(info: WhopUserInfo): Promise<string> {
  const whopSub = String(info.sub).trim();
  const safeFallbackId = `whop_${whopSub.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const normalizedEmail =
    typeof info.email === "string" && info.email.includes("@")
      ? info.email.trim().toLowerCase()
      : null;
  const displayName = (
    info.name ||
    info.preferred_username ||
    normalizedEmail?.split("@")[0] ||
    "Chef"
  ).trim();

  try {
    const { getFirebaseAdminFirestore, getOrCreateFirebaseUser } =
      await import("@/server/firebase-admin");
    const db = getFirebaseAdminFirestore();
    const nowIso = new Date().toISOString();

    let resolvedUserId: string | null = null;
    const mappingSnap = await db.collection("whop_users").doc(whopSub).get();
    const existingMappingUid = mappingSnap.data()?.["user_id"];
    if (typeof existingMappingUid === "string" && existingMappingUid.trim()) {
      resolvedUserId = existingMappingUid.trim();
    }

    if (!resolvedUserId && normalizedEmail) {
      try {
        const fbResult = await getOrCreateFirebaseUser(normalizedEmail, displayName);
        resolvedUserId = fbResult.user.uid;
      } catch {
        const emailQuery = await db
          .collection("users")
          .where("email", "==", normalizedEmail)
          .limit(1)
          .get();
        if (!emailQuery.empty) {
          resolvedUserId = emailQuery.docs[0].id;
        }
      }
    }

    const userId = resolvedUserId || safeFallbackId;

    await Promise.all([
      db.collection("whop_users").doc(whopSub).set(
        {
          whop_user_id: whopSub,
          user_id: userId,
          email: normalizedEmail,
          updated_at: nowIso,
        },
        { merge: true },
      ),
      db
        .collection("users")
        .doc(userId)
        .set(
          {
            id: userId,
            ...(normalizedEmail ? { email: normalizedEmail } : {}),
            displayName,
            ...(info.picture ? { photoURL: info.picture } : {}),
            whop_user_id: whopSub,
            auth_provider: "whop",
            updatedAt: nowIso,
          },
          { merge: true },
        ),
    ]);

    return userId;
  } catch {
    return safeFallbackId;
  }
}

export function buildSessionCookieHeader(payload: WhopSessionPayload, request: Request): string {
  return serializeCookie(WHOP_SESSION_COOKIE, sealSessionValue(payload), request, {
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getWhopSessionFromRequest(request: Request | null | undefined): Promise<{
  session: WhopSessionPayload | null;
  refreshedSetCookie?: string;
}> {
  if (!request) return { session: null };
  const cookies = parseCookies(request.headers.get("cookie"));
  const raw = cookies[WHOP_SESSION_COOKIE];
  if (!raw) return { session: null };

  const session = unsealSessionValue<WhopSessionPayload>(raw);
  if (!session || !session.userId || !session.whopUserId || !session.accessToken) {
    return { session: null };
  }

  // Refresh proactively if within 5 minutes of expiry or already expired
  if (session.expiresAt - Date.now() <= REFRESH_LEEWAY_MS) {
    if (!session.refreshToken) {
      if (session.expiresAt <= Date.now()) {
        return { session: null };
      }
      return { session };
    }
    try {
      const refreshed = await refreshWhopAccessToken(session.refreshToken);
      const nextPayload: WhopSessionPayload = {
        ...session,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? session.refreshToken,
        expiresAt: Date.now() + Math.max(60, Number(refreshed.expires_in ?? 3600)) * 1000,
      };
      return {
        session: nextPayload,
        refreshedSetCookie: buildSessionCookieHeader(nextPayload, request),
      };
    } catch {
      return { session: session.expiresAt > Date.now() ? session : null };
    }
  }

  return { session };
}

export function toPublicSessionUser(session: WhopSessionPayload): PublicSessionUser {
  return {
    id: session.userId,
    email: session.email,
    displayName: session.name,
    photoURL: session.picture,
    emailVerified: session.emailVerified,
    provider: "whop",
    whopUserId: session.whopUserId,
  };
}
