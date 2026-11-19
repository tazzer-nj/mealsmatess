export type LinksetTarget = {
  href: string;
  type?: string;
};

export type ApiCatalogEntry = {
  anchor: string;
  "service-desc": LinksetTarget[];
  "service-doc": LinksetTarget[];
  status?: LinksetTarget[];
};

const SUPPORTED_SCOPES = [
  "recipes:read",
  "pantry:read",
  "pantry:write",
  "planner:read",
  "planner:write",
  "mia:chat",
  "images:generate",
] as const;

export function resolveRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const proto = forwardedProto || url.protocol.replace(/:$/, "") || "https";
    return `${proto}://${forwardedHost}`;
  }
  return url.origin;
}

export function buildHomepageLinkHeaderValue(): string {
  return [
    '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
    '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
    '</llms.txt>; rel="service-doc"; type="text/markdown"',
    '</auth.md>; rel="describedby"; type="text/markdown"',
  ].join(", ");
}

export function applyHomepageLinkHeaders(response: Response, pathname: string): Response {
  if (pathname !== "/") return response;
  const headers = new Headers(response.headers);
  headers.set("Link", buildHomepageLinkHeaderValue());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function buildApiCatalog(origin: string): { linkset: ApiCatalogEntry[] } {
  return {
    linkset: [
      {
        anchor: `${origin}/api`,
        "service-desc": [
          {
            href: `${origin}/openapi.json`,
            type: "application/openapi+json",
          },
        ],
        "service-doc": [
          {
            href: `${origin}/llms.txt`,
            type: "text/markdown",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
            type: "application/health+json",
          },
        ],
      },
    ],
  };
}

export function buildOAuthProtectedResourceMetadata(origin: string) {
  return {
    resource: origin,
    authorization_servers: [origin],
    scopes_supported: [...SUPPORTED_SCOPES],
    bearer_methods_supported: ["header"],
    resource_documentation: `${origin}/auth.md`,
  };
}

export function buildOAuthAuthorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/auth`,
    token_endpoint: "https://securetoken.googleapis.com/v1/token",
    registration_endpoint: `${origin}/auth?mode=signup`,
    scopes_supported: [...SUPPORTED_SCOPES],
    response_types_supported: ["code", "token"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
    service_documentation: `${origin}/auth.md`,
    agent_auth: {
      skill: `${origin}/auth.md`,
      register_uri: `${origin}/auth?mode=signup`,
      identity_types_supported: ["identity_assertion"],
      identity_assertion: {
        assertion_types_supported: ["verified_email"],
        credential_types_supported: ["bearer_token"],
        claim_uri: `${origin}/auth`,
      },
    },
  };
}

export function buildAuthMarkdown(origin: string): string {
  return `# MealMate auth.md

Agent authentication and registration discovery guide for **MealMate** (\`${origin}\`).

## Audience

This document is intended for automated agents, MCP/tool integrations, and API clients interacting with MealMate's culinary, pantry, meal-planning, and Mia AI endpoints.

## Discovery Endpoints

- **OAuth Protected Resource Metadata (RFC 9728)**: \`${origin}/.well-known/oauth-protected-resource\`
- **OAuth Authorization Server Metadata (RFC 8414)**: \`${origin}/.well-known/oauth-authorization-server\`
- **API Catalog (RFC 9727)**: \`${origin}/.well-known/api-catalog\`
- **OpenAPI Specification**: \`${origin}/openapi.json\`
- **Health Status**: \`${origin}/api/health\`

## Registration & Account Provisioning

MealMate uses Firebase Authentication backed by verified email or Google Sign-In.

- **Registration URI**: \`${origin}/auth?mode=signup\`
- **Sign-In / Claim URI**: \`${origin}/auth\`
- **Password Reset**: \`${origin}/reset-password\`

### Supported Registration & Identity Assertion Methods

- **Identity Type**: \`identity_assertion\`
- **Assertion Type**: \`verified_email\` — users register with an email address and confirm ownership via the verification link before API access is enabled.
- **Credential Type**: \`bearer_token\` (Firebase ID Token JWT issued after sign-in).

## Using Credentials

Include the issued Firebase ID token as an HTTP Bearer token in the \`Authorization\` header on every protected API call:

\`\`\`http
Authorization: Bearer <firebase_id_token>
\`\`\`

## Supported Scopes

- \`recipes:read\` — Discover curated and personalized recipes
- \`pantry:read\` — Read pantry inventory items
- \`pantry:write\` — Add, update, or remove pantry items
- \`planner:read\` — Read weekly meal plans and grocery lists
- \`planner:write\` — Update weekly meal plans and grocery lists
- \`mia:chat\` — Converse with Mia AI sous chef (\`POST /api/mia\`)
- \`images:generate\` — Request verified recipe photography (\`POST /api/recipe-image\`)

## Error Responses

- \`401 Unauthorized\` — Missing or invalid \`Authorization: Bearer\` token
- \`402 Payment Required\` — Active MealMate Premium subscription required for the requested AI capability
- \`429 Too Many Requests\` — Per-minute rate limit or AI credit quota reached
`;
}

export function buildOpenApiSpec(origin: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "MealMate API",
      version: "1.0.0",
      description:
        "AI-powered culinary companion, Mia voice/chat sous chef, recipe imagery, meal planning, and smart pantry APIs.",
      contact: {
        name: "MealMate Support",
        url: `${origin}/support`,
        email: "support@mealsmates.site",
      },
    },
    servers: [{ url: origin, description: "Primary MealMate origin" }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Firebase ID Token passed via Authorization: Bearer <token>",
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          summary: "Service health status",
          security: [],
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/health+json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "pass" },
                      service: { type: "string", example: "MealMate" },
                      version: { type: "string", example: "1.0.0" },
                      timestamp: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/mia": {
        post: {
          summary: "Chat with Mia AI sous chef",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    voice: { type: "boolean" },
                    messages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          role: { type: "string", enum: ["user", "assistant"] },
                          content: { type: "string" },
                        },
                        required: ["role", "content"],
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Mia AI assistant reply" },
            "401": { description: "Authentication required" },
            "402": { description: "Active Premium subscription required" },
            "429": { description: "Rate limit exceeded" },
          },
        },
      },
      "/api/recipe-image": {
        post: {
          summary: "Resolve or generate verified recipe photography",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["recipeId"],
                  properties: {
                    recipeId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Verified recipe image metadata" },
            "401": { description: "Authentication required" },
            "404": { description: "Recipe not found" },
          },
        },
      },
      "/api/email": {
        post: {
          summary: "Send transactional email",
          responses: {
            "200": { description: "Email dispatched" },
            "400": { description: "Invalid payload" },
          },
        },
      },
      "/.well-known/api-catalog": {
        get: {
          summary: "RFC 9727 API Catalog",
          security: [],
          responses: {
            "200": { description: "API Catalog linkset document" },
          },
        },
      },
      "/.well-known/oauth-protected-resource": {
        get: {
          summary: "RFC 9728 OAuth Protected Resource Metadata",
          security: [],
          responses: {
            "200": { description: "Protected resource metadata" },
          },
        },
      },
      "/.well-known/oauth-authorization-server": {
        get: {
          summary: "RFC 8414 OAuth Authorization Server & Agent Auth Metadata",
          security: [],
          responses: {
            "200": { description: "Authorization server metadata" },
          },
        },
      },
      "/auth.md": {
        get: {
          summary: "Agent authentication and registration documentation",
          security: [],
          responses: {
            "200": { description: "Markdown auth discovery document" },
          },
        },
      },
    },
  };
}

export function buildHealthPayload() {
  return {
    status: "pass",
    service: "MealMate",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };
}

function respond(
  request: Request,
  body: string,
  contentType: string,
  cacheControl = "public, max-age=300",
): Response {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
  };
  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers,
  });
}

export function handleAgentDiscoveryRequest(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }

  const url = new URL(request.url);
  const origin = resolveRequestOrigin(request);

  switch (url.pathname) {
    case "/.well-known/api-catalog":
      return respond(
        request,
        JSON.stringify(buildApiCatalog(origin), null, 2),
        "application/linkset+json; charset=utf-8",
      );

    case "/.well-known/oauth-protected-resource":
      return respond(
        request,
        JSON.stringify(buildOAuthProtectedResourceMetadata(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/.well-known/oauth-authorization-server":
      return respond(
        request,
        JSON.stringify(buildOAuthAuthorizationServerMetadata(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/auth.md":
      return respond(request, buildAuthMarkdown(origin), "text/markdown; charset=utf-8");

    case "/openapi.json":
      return respond(
        request,
        JSON.stringify(buildOpenApiSpec(origin), null, 2),
        "application/openapi+json; charset=utf-8",
      );

    case "/api/health":
      return respond(
        request,
        JSON.stringify(buildHealthPayload(), null, 2),
        "application/health+json; charset=utf-8",
        "no-store",
      );

    default:
      return null;
  }
}
