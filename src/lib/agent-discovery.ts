import { createHash } from "node:crypto";
import { CURATED_RECIPES } from "@/lib/curated-recipes";
import { getWebBotAuthDirectory } from "@/lib/web-bot-auth";

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
- **A2A Agent Card**: \`${origin}/.well-known/agent-card.json\`
- **MCP Server Card**: \`${origin}/.well-known/mcp/server-card.json\`
- **Agent Skills Index**: \`${origin}/.well-known/agent-skills/index.json\`
- **Web Bot Auth Directory**: \`${origin}/.well-known/http-message-signatures-directory\`
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

export function buildA2aAgentCard(origin: string) {
  return {
    name: "MealMate Agent",
    version: "1.0.0",
    description:
      "AI culinary companion for recipe discovery, Mia sous chef coaching, weekly meal planning, and smart pantry management.",
    url: `${origin}/api/a2a`,
    provider: {
      organization: "Taz Technologies",
      url: origin,
    },
    documentationUrl: `${origin}/llms.txt`,
    supportedInterfaces: [
      {
        url: `${origin}/api/a2a`,
        protocolBinding: "JSONRPC",
        transport: "JSONRPC",
      },
      {
        url: `${origin}/mcp`,
        protocolBinding: "HTTP+JSON",
        transport: "streamable-http",
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ["application/json", "text/plain"],
    defaultOutputModes: ["application/json", "text/plain"],
    skills: [
      {
        id: "recipe-discovery",
        name: "Recipe Discovery",
        description:
          "Search curated and personalized MealMate recipes by ingredients, cuisine, cooking time, or dietary preferences.",
        tags: ["recipes", "cooking", "nutrition"],
        examples: ["Find a quick South African chicken dinner", "Show easy vegetarian lunch ideas"],
      },
      {
        id: "mia-sous-chef",
        name: "Mia AI Sous Chef",
        description:
          "Hands-free step-by-step culinary guidance, ingredient substitutions, and pantry meal planning.",
        tags: ["assistant", "pantry", "meal-planning"],
        examples: ["What can I substitute for buttermilk in pancakes?"],
      },
      {
        id: "meal-planner",
        name: "Weekly Meal Planner",
        description:
          "Organize weekly meals and build aisle-sorted grocery shopping lists from selected recipes.",
        tags: ["meal-plan", "grocery"],
        examples: ["Plan a high-protein 5-day dinner menu"],
      },
    ],
  };
}

function buildSkillArtifacts(origin: string) {
  const artifacts: Record<string, { name: string; description: string; content: string }> = {
    "mealmate-recipes": {
      name: "mealmate-recipes",
      description:
        "Discover curated MealMate recipes, nutrition estimates, ingredients, and cooking steps via MCP or HTTP.",
      content: `---
name: mealmate-recipes
description: Discover curated MealMate recipes, ingredients, nutrition estimates, and cooking steps.
---

# MealMate Recipe Discovery Skill

Use MealMate's MCP endpoint (\`${origin}/mcp\`) or web search (\`${origin}/recipes\`) to find curated and personalized recipes.

## Tools

- \`search_recipes\`: Search MealMate's curated recipe catalog by dish name, cuisine, category, or ingredient.
- \`get_mealmate_overview\`: Retrieve MealMate capabilities and public discovery endpoints.

## Example

Call \`tools/call\` on \`${origin}/mcp\` with \`name: "search_recipes"\` and \`arguments: { "query": "bobotie" }\`.
`,
    },
    "mealmate-auth": {
      name: "mealmate-auth",
      description:
        "Authenticate and register agents or users against MealMate using verified email and Bearer ID tokens.",
      content: buildAuthMarkdown(origin),
    },
    "mealmate-mia-chef": {
      name: "mealmate-mia-chef",
      description:
        "Interact with Mia AI Sous Chef for cooking guidance, substitutions, and meal planning.",
      content: `---
name: mealmate-mia-chef
description: Converse with Mia AI Sous Chef for cooking help, pantry matching, and substitutions.
---

# Mia AI Sous Chef Skill

Connect with Mia via \`POST ${origin}/api/mia\` using a valid \`Authorization: Bearer <firebase_id_token>\` credential or via A2A at \`${origin}/api/a2a\`.

## Capabilities

- Recipe suggestions from pantry ingredients
- Step-by-step hands-free cooking guidance
- Ingredient substitutions and nutrition estimates
`,
    },
  };

  return artifacts;
}

export function buildAgentSkillsIndex(origin: string) {
  const artifacts = buildSkillArtifacts(origin);
  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: Object.values(artifacts).map((skill) => {
      const hex = createHash("sha256").update(skill.content, "utf8").digest("hex");
      return {
        name: skill.name,
        type: "skill-md" as const,
        description: skill.description,
        url: `${origin}/skills/${skill.name}/SKILL.md`,
        digest: `sha256:${hex}`,
      };
    }),
  };
}

export function buildMcpServerCard(origin: string) {
  return {
    serverInfo: {
      name: "MealMate",
      version: "1.0.0",
    },
    endpoint: `${origin}/mcp`,
    transport: {
      type: "streamable-http",
      endpoint: `${origin}/mcp`,
    },
    documentationUrl: `${origin}/llms.txt`,
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false },
    },
    tools: [
      {
        name: "search_recipes",
        description: "Search MealMate's curated recipe catalog by name, cuisine, or category.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search term, cuisine, or dish name" },
            limit: { type: "number", description: "Max number of recipes to return (1-10)" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_mealmate_overview",
        description: "Get MealMate platform overview, core capabilities, and discovery URLs.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "check_service_health",
        description: "Check MealMate API availability and runtime status.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
    resources: [
      {
        uri: "mealmate://overview",
        name: "MealMate Platform Overview",
        mimeType: "text/markdown",
      },
      {
        uri: "mealmate://openapi",
        name: "MealMate OpenAPI Specification",
        mimeType: "application/openapi+json",
      },
    ],
    prompts: [
      {
        name: "plan_weekly_meals",
        description: "Generate a balanced 5-day dinner plan using MealMate recipes.",
      },
      {
        name: "cook_with_pantry",
        description: "Suggest recipes based on ingredients currently on hand.",
      },
    ],
  };
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
      "/mcp": {
        post: {
          summary: "MealMate Model Context Protocol (MCP) Streamable HTTP endpoint",
          security: [],
          responses: {
            "200": { description: "JSON-RPC 2.0 MCP response" },
          },
        },
      },
      "/api/a2a": {
        post: {
          summary: "MealMate Agent-to-Agent (A2A) JSON-RPC endpoint",
          security: [],
          responses: {
            "200": { description: "JSON-RPC 2.0 A2A response" },
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
          responses: { "200": { description: "API Catalog linkset document" } },
        },
      },
      "/.well-known/agent-card.json": {
        get: {
          summary: "A2A Agent Card",
          security: [],
          responses: { "200": { description: "A2A Agent Card JSON" } },
        },
      },
      "/.well-known/agent-skills/index.json": {
        get: {
          summary: "Agent Skills Discovery Index v0.2.0",
          security: [],
          responses: { "200": { description: "Agent Skills Discovery JSON" } },
        },
      },
      "/.well-known/mcp/server-card.json": {
        get: {
          summary: "MCP Server Card (SEP-1649)",
          security: [],
          responses: { "200": { description: "MCP Server Card JSON" } },
        },
      },
      "/.well-known/http-message-signatures-directory": {
        get: {
          summary: "Web Bot Auth JWKS directory",
          security: [],
          responses: { "200": { description: "JWK Set for HTTP message signature verification" } },
        },
      },
      "/.well-known/oauth-protected-resource": {
        get: {
          summary: "RFC 9728 OAuth Protected Resource Metadata",
          security: [],
          responses: { "200": { description: "Protected resource metadata" } },
        },
      },
      "/.well-known/oauth-authorization-server": {
        get: {
          summary: "RFC 8414 OAuth Authorization Server & Agent Auth Metadata",
          security: [],
          responses: { "200": { description: "Authorization server metadata" } },
        },
      },
      "/auth.md": {
        get: {
          summary: "Agent authentication and registration documentation",
          security: [],
          responses: { "200": { description: "Markdown auth discovery document" } },
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

function searchCuratedRecipesForAgent(query: string, limit = 5) {
  const term = query.trim().toLowerCase();
  const capped = Math.min(Math.max(1, limit || 5), 10);
  const matches = term
    ? CURATED_RECIPES.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.cuisine.toLowerCase().includes(term) ||
          r.category.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(term)),
      )
    : CURATED_RECIPES;

  return matches.slice(0, capped).map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    cuisine: r.cuisine,
    category: r.category,
    cookingTimeMinutes: r.cooking_time_minutes,
    calories: r.calories,
    difficulty: r.difficulty,
  }));
}

async function handleMcpPost(request: Request, origin: string): Promise<Response> {
  let payload: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 },
    );
  }

  const id = payload.id ?? null;
  const card = buildMcpServerCard(origin);

  switch (payload.method) {
    case "initialize":
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-03-26",
          serverInfo: card.serverInfo,
          capabilities: card.capabilities,
        },
      });

    case "notifications/initialized":
      return new Response(null, { status: 204 });

    case "ping":
      return Response.json({ jsonrpc: "2.0", id, result: {} });

    case "tools/list":
      return Response.json({ jsonrpc: "2.0", id, result: { tools: card.tools } });

    case "resources/list":
      return Response.json({ jsonrpc: "2.0", id, result: { resources: card.resources } });

    case "resources/read": {
      const uri = String(payload.params?.["uri"] ?? "");
      if (uri === "mealmate://openapi") {
        return Response.json({
          jsonrpc: "2.0",
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: "application/openapi+json",
                text: JSON.stringify(buildOpenApiSpec(origin), null, 2),
              },
            ],
          },
        });
      }
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          contents: [
            {
              uri: "mealmate://overview",
              mimeType: "text/markdown",
              text: buildAuthMarkdown(origin),
            },
          ],
        },
      });
    }

    case "prompts/list":
      return Response.json({ jsonrpc: "2.0", id, result: { prompts: card.prompts } });

    case "tools/call": {
      const name = String(payload.params?.["name"] ?? "");
      const args = (payload.params?.["arguments"] as Record<string, unknown> | undefined) ?? {};
      if (name === "search_recipes") {
        const results = searchCuratedRecipesForAgent(
          String(args["query"] ?? ""),
          typeof args["limit"] === "number" ? args["limit"] : 5,
        );
        return Response.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ recipes: results }, null, 2) }],
          },
        });
      }
      if (name === "check_service_health") {
        return Response.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(buildHealthPayload(), null, 2) }],
          },
        });
      }
      return Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  name: "MealMate",
                  origin,
                  endpoints: {
                    apiCatalog: `${origin}/.well-known/api-catalog`,
                    agentCard: `${origin}/.well-known/agent-card.json`,
                    mcpServerCard: `${origin}/.well-known/mcp/server-card.json`,
                    agentSkills: `${origin}/.well-known/agent-skills/index.json`,
                    authMd: `${origin}/auth.md`,
                  },
                },
                null,
                2,
              ),
            },
          ],
        },
      });
    }

    default:
      return Response.json(
        { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } },
        { status: 404 },
      );
  }
}

async function handleA2aPost(request: Request, origin: string): Promise<Response> {
  let payload: { id?: unknown; method?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 },
    );
  }

  return Response.json({
    jsonrpc: "2.0",
    id: payload.id ?? null,
    result: {
      agent: buildA2aAgentCard(origin),
      status: "ready",
      message: "Discover MealMate recipes via MCP (/mcp) or authenticate via /auth.md.",
    },
  });
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

export async function handleAgentDiscoveryRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const origin = resolveRequestOrigin(request);

  if (request.method === "POST") {
    if (url.pathname === "/mcp") return handleMcpPost(request, origin);
    if (url.pathname === "/api/a2a") return handleA2aPost(request, origin);
    return null;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }

  const skillMatch = /^\/skills\/([a-z0-9-]+)\/SKILL\.md$/.exec(url.pathname);
  if (skillMatch?.[1]) {
    const artifacts = buildSkillArtifacts(origin);
    const artifact = artifacts[skillMatch[1]];
    if (artifact) {
      return respond(request, artifact.content, "text/markdown; charset=utf-8");
    }
  }

  switch (url.pathname) {
    case "/.well-known/api-catalog":
      return respond(
        request,
        JSON.stringify(buildApiCatalog(origin), null, 2),
        "application/linkset+json; charset=utf-8",
      );

    case "/.well-known/agent-card.json":
      return respond(
        request,
        JSON.stringify(buildA2aAgentCard(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/.well-known/agent-skills/index.json":
      return respond(
        request,
        JSON.stringify(buildAgentSkillsIndex(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/.well-known/mcp/server-card.json":
      return respond(
        request,
        JSON.stringify(buildMcpServerCard(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/.well-known/http-message-signatures-directory":
      return respond(
        request,
        JSON.stringify(getWebBotAuthDirectory(), null, 2),
        "application/json; charset=utf-8",
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

    case "/mcp":
      return respond(
        request,
        JSON.stringify(buildMcpServerCard(origin), null, 2),
        "application/json; charset=utf-8",
      );

    case "/api/a2a":
      return respond(
        request,
        JSON.stringify(buildA2aAgentCard(origin), null, 2),
        "application/json; charset=utf-8",
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
