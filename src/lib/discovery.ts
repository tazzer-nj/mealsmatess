const DEFAULT_PUBLIC_ORIGIN = "https://mealsmates.site";

export function resolvePublicOrigin(requestUrl: string): string {
  try {
    const parsed = new URL(requestUrl);
    if (parsed.hostname === "mealsmates.site" || parsed.hostname === "www.mealsmates.site") {
      return "https://mealsmates.site";
    }
    return parsed.origin || DEFAULT_PUBLIC_ORIGIN;
  } catch {
    return DEFAULT_PUBLIC_ORIGIN;
  }
}

export function buildApiCatalog(origin: string) {
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
            href: `${origin}/api/docs`,
            type: "text/markdown",
          },
        ],
        status: [
          {
            href: `${origin}/api/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };
}

export function buildOpenApiSpec(origin: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "MealMate Consumer API",
      version: "1.0.0",
      description:
        "API endpoints for MealMate recipe discovery, Mia AI cooking assistant, kitchen scanning, meal planning, and shopping lists.",
      contact: {
        name: "Taz Technologies Support",
        email: "support@mealmate.app",
      },
    },
    servers: [{ url: origin }],
    paths: {
      "/api/health": {
        get: {
          summary: "Service health status",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      service: { type: "string" },
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
          summary: "Converse with Mia AI cooking assistant",
          operationId: "postMia",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
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
                    voice: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Assistant response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reply: { type: "string" },
                    },
                  },
                },
              },
            },
            "401": { description: "Authentication required" },
          },
        },
      },
      "/api/recipe-image": {
        post: {
          summary: "Resolve or generate verified recipe image",
          operationId: "postRecipeImage",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Recipe image metadata" },
            "401": { description: "Authentication required" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };
}

export function buildApiDocsMarkdown(origin: string): string {
  return `# MealMate Consumer API Documentation

Base URL: \`${origin}\`

## Discovery
- API Catalog (RFC 9727): \`${origin}/.well-known/api-catalog\`
- OpenAPI Specification: \`${origin}/openapi.json\`
- Auth & Agent Registration Discovery: \`${origin}/auth.md\`
- Health Status: \`${origin}/api/health\`

## Authentication
Authenticated endpoints require a valid Firebase ID token supplied via the HTTP \`Authorization: Bearer <token>\` header. See [auth.md](${origin}/auth.md) and [OAuth Protected Resource Metadata](${origin}/.well-known/oauth-protected-resource).

## Core Endpoints
- \`GET /api/health\` — Public service health check.
- \`POST /api/mia\` — Context-aware cooking assistant supporting multi-turn conversations, allergy enforcement, and optional voice mode.
- \`POST /api/recipe-image\` — Authenticated verified recipe media lookup.
`;
}

export function buildAuthMd(origin: string): string {
  return `# auth.md

MealMate Consumer authentication and agent registration discovery for automated clients and AI agents.

## Audience
- Authorized API clients and AI agents operating on behalf of authenticated MealMate users.

## OAuth & Resource Discovery
- OAuth Protected Resource Metadata: \`${origin}/.well-known/oauth-protected-resource\`
- OAuth Authorization Server Metadata: \`${origin}/.well-known/oauth-authorization-server\`
- Issuer: \`${origin}\`

## Registration & Claim Endpoints
- Registration endpoint: \`${origin}/agent/register\`
- Verification / Claim URI: \`${origin}/agent/claim\`
- Token endpoint: \`${origin}/api/auth/token\`
- Revocation endpoint: \`${origin}/api/auth/revoke\`

## Supported Authentication & Assertion Methods
- **Bearer Token (Recommended)**: Include \`Authorization: Bearer <token>\` in HTTP request headers (\`bearer_methods_supported: ["header"]\`).
- **Identity Assertion (ID-JAG & Verified Email)**: Supports \`identity_assertion\` with \`urn:ietf:params:oauth:token-type:id-jag\` and \`verified_email\` assertions yielding \`bearer_jwt\` credentials.
- **Interactive User Sign-In**: Users can sign in at \`${origin}/auth\` with email/password or Google sign-in.

## Scopes
\`openid\`, \`profile\`, \`email\`, \`recipes:read\`, \`mia:chat\`, \`planner:write\`, \`grocery:write\`, \`pantry:write\`
`;
}

export function buildOAuthProtectedResourceMetadata(origin: string) {
  return {
    resource: origin,
    authorization_servers: [origin],
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "recipes:read",
      "mia:chat",
      "planner:write",
      "grocery:write",
      "pantry:write",
    ],
    bearer_methods_supported: ["header"],
    resource_documentation: `${origin}/auth.md`,
  };
}

export function buildOAuthAuthorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/auth`,
    token_endpoint: `${origin}/api/auth/token`,
    registration_endpoint: `${origin}/agent/register`,
    revocation_endpoint: `${origin}/api/auth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "urn:ietf:params:oauth:grant-type:jwt-bearer"],
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "recipes:read",
      "mia:chat",
      "planner:write",
      "grocery:write",
      "pantry:write",
    ],
    token_endpoint_auth_methods_supported: ["none", "private_key_jwt"],
    service_documentation: `${origin}/auth.md`,
    agent_auth: {
      skill: `${origin}/auth.md`,
      register_uri: `${origin}/agent/register`,
      claim_uri: `${origin}/agent/claim`,
      revocation_uri: `${origin}/api/auth/revoke`,
      identity_types_supported: ["identity_assertion"],
      identity_assertion: {
        assertion_types_supported: ["urn:ietf:params:oauth:token-type:id-jag", "verified_email"],
        credential_types_supported: ["bearer_jwt"],
      },
      registration_methods_supported: ["dcr", "identity_assertion"],
      events_supported: ["https://schemas.openid.net/secevent/risc/event-type/tokens-revoked"],
    },
  };
}

export function buildHomepageLinkHeaders(): string[] {
  return [
    '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
    '</openapi.json>; rel="service-desc"; type="application/openapi+json"',
    '</api/docs>; rel="service-doc"; type="text/markdown"',
    '</auth.md>; rel="describedby"; type="text/markdown"',
  ];
}
