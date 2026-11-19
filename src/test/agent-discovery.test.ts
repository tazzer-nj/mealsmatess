import { describe, expect, it } from "vitest";
import serverEntry from "@/server";
import {
  buildApiCatalog,
  buildAuthMarkdown,
  buildHomepageLinkHeaderValue,
  buildOAuthAuthorizationServerMetadata,
  buildOAuthProtectedResourceMetadata,
  handleAgentDiscoveryRequest,
} from "@/lib/agent-discovery";
import { renderErrorResponse } from "@/lib/error-page";

describe("RFC 9727 API Catalog, RFC 8288 Link Headers, and Auth.md Discovery", () => {
  it("serves /.well-known/api-catalog with application/linkset+json and RFC 9727 linkset entries", async () => {
    const res = await serverEntry.fetch(
      new Request("https://mealsmates.site/.well-known/api-catalog"),
      {},
      {},
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/linkset+json");

    const body = (await res.json()) as ReturnType<typeof buildApiCatalog>;
    expect(Array.isArray(body.linkset)).toBe(true);
    expect(body.linkset.length).toBeGreaterThanOrEqual(1);

    const primary = body.linkset[0];
    expect(primary.anchor).toBe("https://mealsmates.site/api");
    expect(primary["service-desc"]?.[0]?.href).toBe("https://mealsmates.site/openapi.json");
    expect(primary["service-doc"]?.[0]?.href).toBe("https://mealsmates.site/llms.txt");
    expect(primary.status?.[0]?.href).toBe("https://mealsmates.site/api/health");
  });

  it("provides RFC 8288 / RFC 9727 Link headers for the homepage", () => {
    const linkHeader = buildHomepageLinkHeaderValue();
    expect(linkHeader).toContain('</.well-known/api-catalog>; rel="api-catalog"');
    expect(linkHeader).toContain('</openapi.json>; rel="service-desc"');
    expect(linkHeader).toContain('</llms.txt>; rel="service-doc"');
    expect(linkHeader).toContain('</auth.md>; rel="describedby"');
  });

  it("serves /auth.md as Markdown with an H1 containing auth.md", async () => {
    const res = await serverEntry.fetch(new Request("https://mealsmates.site/auth.md"), {}, {});

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");

    const text = await res.text();
    const firstLine = text.split("\n")[0];
    expect(firstLine).toMatch(/^#\s+.*auth\.md/i);
    expect(text).toContain("https://mealsmates.site/.well-known/oauth-protected-resource");
    expect(text).toContain("https://mealsmates.site/.well-known/oauth-authorization-server");
    expect(text).toContain("Authorization: Bearer");
    expect(buildAuthMarkdown("https://mealsmates.site")).toBe(text);
  });

  it("serves OAuth Protected Resource Metadata at /.well-known/oauth-protected-resource", async () => {
    const res = await serverEntry.fetch(
      new Request("https://mealsmates.site/.well-known/oauth-protected-resource"),
      {},
      {},
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");

    const prm = (await res.json()) as ReturnType<typeof buildOAuthProtectedResourceMetadata>;
    expect(prm.resource).toBe("https://mealsmates.site");
    expect(prm.authorization_servers).toEqual(["https://mealsmates.site"]);
    expect(prm.scopes_supported.length).toBeGreaterThan(0);
    expect(prm.bearer_methods_supported).toContain("header");
  });

  it("serves OAuth Authorization Server Metadata with matching issuer and agent_auth block", async () => {
    const prmRes = await serverEntry.fetch(
      new Request("https://mealsmates.site/.well-known/oauth-protected-resource"),
      {},
      {},
    );
    const prm = (await prmRes.json()) as ReturnType<typeof buildOAuthProtectedResourceMetadata>;

    const asRes = await serverEntry.fetch(
      new Request("https://mealsmates.site/.well-known/oauth-authorization-server"),
      {},
      {},
    );

    expect(asRes.status).toBe(200);
    expect(asRes.headers.get("content-type")).toContain("application/json");

    const asMeta = (await asRes.json()) as ReturnType<typeof buildOAuthAuthorizationServerMetadata>;
    expect(asMeta.issuer).toBe(prm.authorization_servers[0]);
    expect(asMeta.agent_auth.skill).toBe("https://mealsmates.site/auth.md");
    expect(asMeta.agent_auth.register_uri).toBe("https://mealsmates.site/auth?mode=signup");
    expect(asMeta.agent_auth.identity_types_supported).toContain("identity_assertion");
    expect(asMeta.agent_auth.identity_assertion.assertion_types_supported).toContain(
      "verified_email",
    );
    expect(asMeta.agent_auth.identity_assertion.credential_types_supported).toContain(
      "bearer_token",
    );
    expect(asMeta.agent_auth.identity_assertion.claim_uri).toBe("https://mealsmates.site/auth");
  });

  it("serves /openapi.json and /api/health with HTTP 200 and supports HEAD requests", async () => {
    const openapiRes = handleAgentDiscoveryRequest(
      new Request("https://mealsmates.site/openapi.json"),
    );
    expect(openapiRes?.status).toBe(200);
    expect(openapiRes?.headers.get("content-type")).toContain("application/openapi+json");
    const spec = (await openapiRes?.json()) as { openapi: string; paths: Record<string, unknown> };
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/mia"]).toBeDefined();

    const healthRes = handleAgentDiscoveryRequest(
      new Request("https://mealsmates.site/api/health"),
    );
    expect(healthRes?.status).toBe(200);
    const health = (await healthRes?.json()) as { status: string };
    expect(health.status).toBe("pass");

    const headRes = handleAgentDiscoveryRequest(
      new Request("https://mealsmates.site/.well-known/api-catalog", { method: "HEAD" }),
    );
    expect(headRes?.status).toBe(200);
    expect(headRes?.headers.get("content-type")).toContain("application/linkset+json");
    expect(await headRes?.text()).toBe("");
  });

  it("supports branded HTML, JSON, XML, and plain text error content negotiation", async () => {
    const options = {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      title: "Kitchen temporarily unavailable",
      message: "Please try again shortly.",
    };

    const htmlRes = renderErrorResponse(
      new Request("https://mealsmates.site/", { headers: { accept: "text/html" } }),
      options,
    );
    expect(htmlRes.status).toBe(503);
    expect(htmlRes.headers.get("content-type")).toContain("text/html");
    expect(await htmlRes.text()).toContain("MealMate");

    const jsonRes = renderErrorResponse(
      new Request("https://mealsmates.site/api/mia", {
        headers: { accept: "application/json" },
      }),
      options,
    );
    expect(jsonRes.status).toBe(503);
    expect(jsonRes.headers.get("content-type")).toContain("application/json");
    await expect(jsonRes.json()).resolves.toMatchObject({
      error: "SERVICE_UNAVAILABLE",
      status: 503,
    });

    const xmlRes = renderErrorResponse(
      new Request("https://mealsmates.site/api/mia", {
        headers: { accept: "application/xml" },
      }),
      options,
    );
    expect(xmlRes.status).toBe(503);
    expect(xmlRes.headers.get("content-type")).toContain("application/xml");
    expect(await xmlRes.text()).toContain("<code>SERVICE_UNAVAILABLE</code>");

    const textRes = renderErrorResponse(
      new Request("https://mealsmates.site/api/mia", {
        headers: { accept: "text/plain" },
      }),
      options,
    );
    expect(textRes.status).toBe(503);
    expect(textRes.headers.get("content-type")).toContain("text/plain");
    expect(await textRes.text()).toContain("MealMate Error (503 SERVICE_UNAVAILABLE)");
  });
});
