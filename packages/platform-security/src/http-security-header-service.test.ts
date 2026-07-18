import { describe, expect, it } from "vitest";

import {
  HttpSecurityHeaderService,
  PLATFORM_HTTP_ENDPOINT_SAMPLES,
  withPlatformSecurityHeaders,
} from "./http-security-header-service";
import { HTTP_SECURITY_HEADER_NAMES } from "./http-security-header-types";

describe("HttpSecurityHeaderService", () => {
  const service = new HttpSecurityHeaderService();

  it("emits canonical security headers for page surfaces", () => {
    const headers = service.buildHeadersRecord({
      app: "web",
      isProduction: false,
      surface: "page",
    });

    expect(headers[HTTP_SECURITY_HEADER_NAMES.xFrameOptions]).toBe("DENY");
    expect(headers[HTTP_SECURITY_HEADER_NAMES.xContentTypeOptions]).toBe("nosniff");
    expect(headers[HTTP_SECURITY_HEADER_NAMES.referrerPolicy]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers[HTTP_SECURITY_HEADER_NAMES.permissionsPolicy]).toContain(
      "camera=()",
    );
    expect(headers[HTTP_SECURITY_HEADER_NAMES.crossOriginOpenerPolicy]).toBe(
      "same-origin-allow-popups",
    );
    expect(headers[HTTP_SECURITY_HEADER_NAMES.crossOriginResourcePolicy]).toBe(
      "same-site",
    );
    expect(headers[HTTP_SECURITY_HEADER_NAMES.crossOriginEmbedderPolicy]).toBe(
      "unsafe-none",
    );
    expect(headers[HTTP_SECURITY_HEADER_NAMES.originAgentCluster]).toBe("?1");
    expect(
      headers[HTTP_SECURITY_HEADER_NAMES.contentSecurityPolicyReportOnly],
    ).toBeDefined();
    expect(headers[HTTP_SECURITY_HEADER_NAMES.cacheControl]).toBeUndefined();
  });

  it("adds HSTS in production", () => {
    const prod = service.buildHeadersRecord({
      app: "web",
      isProduction: true,
      surface: "page",
    });
    const dev = service.buildHeadersRecord({
      app: "web",
      isProduction: false,
      surface: "page",
    });

    expect(prod[HTTP_SECURITY_HEADER_NAMES.strictTransportSecurity]).toContain(
      "max-age=",
    );
    expect(dev[HTTP_SECURITY_HEADER_NAMES.strictTransportSecurity]).toBeUndefined();
    expect(prod[HTTP_SECURITY_HEADER_NAMES.contentSecurityPolicy]).toBeDefined();
    expect(
      dev[HTTP_SECURITY_HEADER_NAMES.contentSecurityPolicyReportOnly],
    ).toBeDefined();
  });

  it("adds Cache-Control on API, health, and diagnostics surfaces", () => {
    for (const surface of ["api", "health", "diagnostics"] as const) {
      const headers = service.buildHeadersRecord({
        app: "web",
        isProduction: false,
        surface,
      });
      expect(headers[HTTP_SECURITY_HEADER_NAMES.cacheControl]).toBe(
        "no-store, no-cache, must-revalidate, private",
      );
    }
  });

  it("builds a compliant report for required headers", () => {
    const report = service.buildComplianceReport({
      app: "law-platform",
      isProduction: true,
      surface: "api",
    });

    expect(report.compliant).toBe(true);
    expect(report.missing).toHaveLength(0);
    expect(report.poweredBySuppressed).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.environmentDifferences.length).toBeGreaterThan(0);
  });

  it("validates all platform endpoint samples for web and law-platform", () => {
    for (const app of ["web", "law-platform"] as const) {
      const validation = service.validateEndpointSamples(app);
      expect(validation.compliant).toBe(true);
      expect(validation.results.length).toBeGreaterThan(0);
    }
  });

  it("applies headers to an existing Response", () => {
    const response = service.applyToResponse(new Response("ok"), {
      app: "web",
      isProduction: false,
      surface: "health",
    });

    expect(response.headers.get(HTTP_SECURITY_HEADER_NAMES.xContentTypeOptions)).toBe(
      "nosniff",
    );
    expect(response.headers.get(HTTP_SECURITY_HEADER_NAMES.cacheControl)).toContain(
      "no-store",
    );
  });
});

describe("withPlatformSecurityHeaders", () => {
  it("disables X-Powered-By and registers page and API header rules", async () => {
    const wrapped = withPlatformSecurityHeaders({}, { app: "web" });
    expect(wrapped.poweredByHeader).toBe(false);

    const rules = await wrapped.headers();
    expect(
      rules.some((rule: { source: string }) => rule.source === "/api/:path*"),
    ).toBe(true);
    expect(rules.some((rule: { source: string }) => rule.source === "/(.*)")).toBe(
      true,
    );
  });
});

describe("PLATFORM_HTTP_ENDPOINT_SAMPLES", () => {
  it("covers health, diagnostics, swagger, api, and page surfaces", () => {
    const surfaces = new Set(
      PLATFORM_HTTP_ENDPOINT_SAMPLES.map((sample) => sample.surface),
    );
    expect(surfaces.has("health")).toBe(true);
    expect(surfaces.has("diagnostics")).toBe(true);
    expect(surfaces.has("swagger")).toBe(true);
    expect(surfaces.has("api")).toBe(true);
    expect(surfaces.has("page")).toBe(true);
  });
});
