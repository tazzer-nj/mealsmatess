import { describe, expect, it } from "vitest";
import {
  buildApiCatalog,
  buildApiDocsMarkdown,
  buildAuthMd,
  buildHomepageLinkHeaders,
  buildOAuthAuthorizationServerMetadata,
  buildOAuthProtectedResourceMetadata,
  buildOpenApiSpec,
  resolvePublicOrigin,
} from "@/lib/discovery";
import { renderErrorPage } from "@/lib/error-page";

describe("agent discovery & RFC 9727 helpers", () => {
  it("resolves canonical public origin for mealsmates.site", () => {
    expect(resolvePublicOrigin("https://www.mealsmates.site/")).toBe("https://mealsmates.site");
    expect(resolvePublicOrigin("https://mealsmates.site/.well-known/api-catalog")).toBe(
      "https://mealsmates.site",
    );
  });

  it("builds valid RFC 9727 api-catalog linkset entries", () => {
    const catalog = buildApiCatalog("https://mealsmates.site");
    expect(Array.isArray(catalog.linkset)).toBe(true);
    expect(catalog.linkset.length).toBeGreaterThan(0);

    const entry = catalog.linkset[0]!;
    expect(entry.anchor).toBe("https://mealsmates.site/api");
    expect(entry["service-desc"][0]?.href).toBe("https://mealsmates.site/openapi.json");
    expect(entry["service-doc"][0]?.href).toBe("https://mealsmates.site/api/docs");
    expect(entry["status"][0]?.href).toBe("https://mealsmates.site/api/health");
  });

  it("builds valid OpenAPI spec & Markdown docs", () => {
    const spec = buildOpenApiSpec("https://mealsmates.site");
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/health"]).toBeDefined();
    expect(spec.paths["/api/mia"]).toBeDefined();

    const docs = buildApiDocsMarkdown("https://mealsmates.site");
    expect(docs).toContain("https://mealsmates.site/.well-known/api-catalog");
  });

  it("builds RFC 8288 homepage Link headers with required relations", () => {
    const headers = buildHomepageLinkHeaders();
    const joined = headers.join(", ");
    expect(joined).toContain('rel="api-catalog"');
    expect(joined).toContain('rel="service-desc"');
    expect(joined).toContain('rel="service-doc"');
    expect(joined).toContain('rel="describedby"');
  });

  it("builds auth.md and OAuth PRM / AS metadata", () => {
    const authMd = buildAuthMd("https://mealsmates.site");
    expect(authMd).toMatch(/^#\s+auth\.md/m);
    expect(authMd).toContain("https://mealsmates.site/.well-known/oauth-protected-resource");

    const prm = buildOAuthProtectedResourceMetadata("https://mealsmates.site");
    expect(prm.resource).toBe("https://mealsmates.site");
    expect(prm.bearer_methods_supported).toContain("header");
    expect(prm.authorization_servers).toContain("https://mealsmates.site");

    const asMeta = buildOAuthAuthorizationServerMetadata("https://mealsmates.site");
    expect(asMeta.issuer).toBe("https://mealsmates.site");
    expect(asMeta.agent_auth.registration_methods_supported).toContain("dcr");
  });

  it("renders a branded, self-contained HTML error page without leaking stack traces", () => {
    const html = renderErrorPage({ status: 503 });
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("MealMate is taking a quick breather");
    expect(html).toContain("Status 503");
    expect(html).not.toContain("Error:");
  });
});
