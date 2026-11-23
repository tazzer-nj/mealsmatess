import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const WHOP_OAUTH_BASE = "https://api.whop.com/oauth";
export const WHOP_SESSION_COOKIE = "mealmate_whop_session";
export const WHOP_PKCE_COOKIE = "mealmate_whop_pkce";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const PKCE_TTL_SECONDS = 10 * 60;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60_000;

let ephemeralSecret: Buffer | null = null;

function getCookieKey(): Buffer {
  const raw =
    (process.env["WHOP_SESSION_SECRET"] ?? "").trim() ||
    (process.env["WHOP_CLIENT_SECRET"] ?? "").trim() ||
    (process.env["WHOP_API_KEY"] ?? "").trim();
  if (raw) {
    return createHash("sha256").update(`mealmate-whop:${raw}`).digest();
  }
  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(32);
  }
  return ephemeralSecret;
}

function sealJson(payload: unknown): string {
  const key = getCookieKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function unsealJson<T>(sealed: string): T | null {
  try {
    const parts = sealed.split(".");
    if (parts.length !== 4 || parts[0] !== "v1") return null;
    const iv = Buffer.from(parts[1]!, "base64url");
    const tag = Buffer.from(parts[2]!, "base64url");
    const ciphertext = Buffer.from(parts[3]!, "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", getCookieKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function isWhopOAuthConfigured(): boolean {
  return Boolean(
    (process.env["WHOP_CLIENT_ID"] ?? "").trim() &&
    (process.env["WHOP_CLIENT_SECRET"] ?? "").trim(),
  );
}

export function parseCookieHeader(header: string | null | undefined): Record<string, string> {
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx <= 0) continue;
    const name = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (!name) continue;
    try {
      result[name] = decodeURIComponent(val);
    } catch {
      result[name] = val;
    }
  }
  return result;
}

export function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto) return forwardedProto === "https";
  return request.url.startsWith("https:");
}

export function resolveRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.split(",")[0]?.trim();
  if (host && !/[\s/\\]/.test(host)) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i.test(host);
    const proto = isHttpsRequest(request) ? "https" : isLocal ? "http" : "https";
    return `${proto}://${host}`;
  }
  const configured = (process.env["MEALMATE_APP_URL"] ?? "").trim().replace(/\/+$/, "");
  if (configured && /^https?:\/\//.test(configured)) {
    return configured;
  }
  return url.origin;
}

export function formatSessionCookie(
  name: string,
  value: string,
  maxAgeSeconds: number,
  https: boolean,
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (https) {
    parts.push("Secure", "SameSite=None", "Partitioned");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

export function clearSessionCookieHeader(name: string, https: boolean): string {
  const parts = [`${name}=`, "Path=/", "HttpOnly", "Max-Age=0"];
  if (https) {
    parts.push("Secure", "SameSite=None", "Partitioned");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

export function generatePkcePair() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

type PkceCookieState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
  mode: "popup" | "redirect";
  issuedAt: number;
};

export function buildWhopAuthorizeRequest(
  request: Request,
  mode: "popup" | "redirect" = "redirect",
): { url: string; pkceCookieHeader: string } {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  if (!clientId) {
    throw new Error("WHOP_CLIENT_ID is not configured.");
  }
  const origin = resolveRequestOrigin(request);
  const redirectUri = `${origin}/api/auth/callback`;
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");

  const authorizeUrl = new URL(`${WHOP_OAUTH_BASE}/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "openid profile email");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("nonce", nonce);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  const sealed = sealJson({
    state,
    nonce,
    codeVerifier,
    redirectUri,
    mode,
    issuedAt: Date.now(),
  } satisfies PkceCookieState);

  return {
    url: authorizeUrl.toString(),
    pkceCookieHeader: formatSessionCookie(
      WHOP_PKCE_COOKIE,
      sealed,
      PKCE_TTL_SECONDS,
      isHttpsRequest(request),
    ),
  };
}

export function verifyPkceCookie(request: Request, returnedState: string): PkceCookieState | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const raw = cookies[WHOP_PKCE_COOKIE];
  if (!raw) return null;
  const parsed = unsealJson<PkceCookieState>(raw);
  if (!parsed || !parsed.state || !parsed.codeVerifier || !parsed.redirectUri) return null;
  if (Date.now() - Number(parsed.issuedAt ?? 0) > PKCE_TTL_SECONDS * 1000) return null;
  const a = Buffer.from(parsed.state);
  const b = Buffer.from(returnedState);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return parsed;
}

export type WhopTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  id_token?: string;
  scope?: string;
};

export type WhopUserInfo = {
  sub: string;
  email?: string | null;
  email_verified?: boolean;
  name?: string | null;
  preferred_username?: string | null;
  picture?: string | null;
};

export async function exchangeWhopCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<WhopTokenResponse> {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  const clientSecret = (process.env["WHOP_CLIENT_SECRET"] ?? "").trim();
  if (!clientId || !clientSecret) {
    throw new Error("WHOP_CLIENT_ID or WHOP_CLIENT_SECRET is not configured.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: params.codeVerifier,
  });

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
    throw new Error(`Whop token exchange failed (${response.status})`);
  }
  const tokens = (await response.json()) as WhopTokenResponse;
  if (!tokens.access_token) {
    throw new Error("Whop token exchange did not return an access token.");
  }
  return tokens;
}

export async function refreshWhopTokens(refreshToken: string): Promise<WhopTokenResponse> {
  const clientId = (process.env["WHOP_CLIENT_ID"] ?? "").trim();
  const clientSecret = (process.env["WHOP_CLIENT_SECRET"] ?? "").trim();
  if (!clientId || !clientSecret) {
    throw new Error("WHOP_CLIENT_ID or WHOP_CLIENT_SECRET is not configured.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

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
    throw new Error(`Whop token refresh failed (${response.status})`);
  }
  const tokens = (await response.json()) as WhopTokenResponse;
  if (!tokens.access_token) {
    throw new Error("Whop token refresh did not return an access token.");
  }
  return tokens;
}

export async function fetchWhopUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const response = await fetch(`${WHOP_OAUTH_BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Whop userinfo lookup failed (${response.status})`);
  }
  const info = (await response.json()) as WhopUserInfo;
  if (!info.sub) {
    throw new Error("Whop userinfo response is missing subject identifier.");
  }
  return info;
}

export type SealedWhopSession = {
  userId: string;
  whopUserId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  hmac?: string;
};

export type PublicWhopSessionUser = {
  id: string;
  whopUserId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: "whop";
};

function sessionIntegrityMac(payload: Omit<SealedWhopSession, "hmac">): string {
  return createHmac("sha256", getCookieKey())
    .update(`${payload.userId}:${payload.whopUserId}:${payload.expiresAt}`)
    .digest("base64url");
}

export function sealWhopSessionCookie(
  session: Omit<SealedWhopSession, "hmac">,
  request: Request,
): string {
  const full: SealedWhopSession = { ...session, hmac: sessionIntegrityMac(session) };
  return formatSessionCookie(
    WHOP_SESSION_COOKIE,
    sealJson(full),
    SESSION_TTL_SECONDS,
    isHttpsRequest(request),
  );
}

export function buildWhopUserId(whopSub: string): string {
  const cleaned = whopSub.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  return cleaned.startsWith("whop_") ? cleaned : `whop_${cleaned}`;
}

export async function getWhopSessionFromRequest(request: Request): Promise<{
  session: SealedWhopSession | null;
  publicUser: PublicWhopSessionUser | null;
  setCookieHeader: string | null;
}> {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const raw = cookies[WHOP_SESSION_COOKIE];
  if (!raw) {
    return { session: null, publicUser: null, setCookieHeader: null };
  }

  const parsed = unsealJson<SealedWhopSession>(raw);
  if (!parsed || !parsed.userId || !parsed.whopUserId || !parsed.accessToken) {
    return {
      session: null,
      publicUser: null,
      setCookieHeader: clearSessionCookieHeader(WHOP_SESSION_COOKIE, isHttpsRequest(request)),
    };
  }

  const expectedMac = sessionIntegrityMac({
    userId: parsed.userId,
    whopUserId: parsed.whopUserId,
    email: parsed.email,
    displayName: parsed.displayName,
    photoURL: parsed.photoURL,
    emailVerified: parsed.emailVerified,
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
    expiresAt: parsed.expiresAt,
  });
  if (!parsed.hmac || parsed.hmac !== expectedMac) {
    return {
      session: null,
      publicUser: null,
      setCookieHeader: clearSessionCookieHeader(WHOP_SESSION_COOKIE, isHttpsRequest(request)),
    };
  }

  let activeSession = parsed;
  let setCookieHeader: string | null = null;
  const now = Date.now();

  if (now >= parsed.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    if (!parsed.refreshToken) {
      if (now >= parsed.expiresAt) {
        return {
          session: null,
          publicUser: null,
          setCookieHeader: clearSessionCookieHeader(WHOP_SESSION_COOKIE, isHttpsRequest(request)),
        };
      }
    } else {
      try {
        const refreshed = await refreshWhopTokens(parsed.refreshToken);
        const expiresInMs = Math.max(60, Number(refreshed.expires_in ?? 3600)) * 1000;
        let nextEmail = parsed.email;
        let nextName = parsed.displayName;
        let nextPhoto = parsed.photoURL;
        try {
          const freshInfo = await fetchWhopUserInfo(refreshed.access_token);
          nextEmail = freshInfo.email ?? nextEmail;
          nextName = freshInfo.name ?? freshInfo.preferred_username ?? nextName;
          nextPhoto = freshInfo.picture ?? nextPhoto;
        } catch {
          // Keep existing profile details if userinfo refresh fails transiently.
        }
        activeSession = {
          ...parsed,
          email: nextEmail,
          displayName: nextName,
          photoURL: nextPhoto,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? parsed.refreshToken,
          expiresAt: Date.now() + expiresInMs,
        };
        setCookieHeader = sealWhopSessionCookie(activeSession, request);
      } catch {
        if (now >= parsed.expiresAt) {
          return {
            session: null,
            publicUser: null,
            setCookieHeader: clearSessionCookieHeader(WHOP_SESSION_COOKIE, isHttpsRequest(request)),
          };
        }
      }
    }
  }

  return {
    session: activeSession,
    publicUser: {
      id: activeSession.userId,
      whopUserId: activeSession.whopUserId,
      email: activeSession.email,
      displayName: activeSession.displayName,
      photoURL: activeSession.photoURL,
      emailVerified: Boolean(activeSession.emailVerified),
      provider: "whop",
    },
    setCookieHeader,
  };
}

export type ResolvedRequestUser = {
  userId: string;
  provider: "firebase" | "whop";
  claims: {
    email?: string | null;
    admin?: unknown;
    isAdmin?: unknown;
    role?: unknown;
    whopUserId?: string;
    provider?: "firebase" | "whop";
  };
  setCookieHeader: string | null;
};

export async function resolveAuthenticatedRequest(
  request: Request | undefined,
): Promise<ResolvedRequestUser | null> {
  if (!request) return null;

  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (match?.[1]) {
    const { verifyFirebaseIdToken } = await import("@/server/firebase-admin");
    try {
      const verified = await verifyFirebaseIdToken(match[1]);
      if (!verified.uid) return null;
      return {
        userId: verified.uid,
        provider: "firebase",
        claims: {
          ...verified,
          provider: "firebase",
        },
        setCookieHeader: null,
      };
    } catch {
      return null;
    }
  }

  const whopSession = await getWhopSessionFromRequest(request);
  if (!whopSession.session) return null;

  return {
    userId: whopSession.session.userId,
    provider: "whop",
    claims: {
      email: whopSession.session.email,
      whopUserId: whopSession.session.whopUserId,
      provider: "whop",
    },
    setCookieHeader: whopSession.setCookieHeader,
  };
}
