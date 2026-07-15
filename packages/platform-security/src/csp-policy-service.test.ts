import { describe, expect, it, beforeEach } from "vitest";

import { CspPolicyService } from "./csp-policy-service";
import { CspViolationService } from "./csp-violation-service";

describe("CspPolicyService", () => {
  const service = new CspPolicyService();

  it("uses report-only in development", () => {
    const result = service.buildPolicy({
      app: "web",
      isProduction: false,
      reportUri: "/api/platform/v1/security/csp-report",
    });

    expect(result.mode).toBe("report-only");
    expect(result.headerKey).toBe("Content-Security-Policy-Report-Only");
    expect(result.policy).toContain("report-uri /api/platform/v1/security/csp-report");
    expect(result.policy).toContain("object-src 'none'");
    expect(result.policy).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(result.directives["connect-src"]).toContain("ws:");
  });

  it("enforces CSP in production with stable directives", () => {
    const result = service.buildPolicy({
      app: "law-platform",
      isProduction: true,
      reportUri: "/api/platform/v1/security/csp-report",
    });

    expect(result.mode).toBe("enforced");
    expect(result.headerKey).toBe("Content-Security-Policy");
    expect(result.directives["connect-src"]).toBe("'self'");
    expect(result.directives["frame-ancestors"]).toBe("'none'");
  });
});

describe("CspViolationService", () => {
  let service: CspViolationService;

  beforeEach(() => {
    service = new CspViolationService();
  });

  it("accepts valid csp-report payloads", () => {
    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://example.test/workspace/home",
        "violated-directive": "script-src",
        "effective-directive": "script-src",
        "blocked-uri": "inline",
      },
    });

    const result = service.ingestReport("web", body, body.length);
    expect(result.accepted).toBe(true);

    const diagnostics = service.getDiagnostics("/api/platform/v1/security/csp-report", "enforced");
    expect(diagnostics.totalReports).toBe(1);
    expect(diagnostics.byDirective["script-src"]).toBe(1);
  });

  it("rejects oversized payloads", () => {
    const result = service.ingestReport("web", "x".repeat(5000), 5000);
    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("payload_too_large");
  });

  it("strips sensitive keys from stored reports", () => {
    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://example.test/login",
        password: "secret",
        "violated-directive": "connect-src",
      },
    });

    service.ingestReport("web", body, body.length);
    const recent = service.getDiagnostics("/api/platform/v1/security/csp-report", "enforced").recent;
    expect(recent[0]?.violatedDirective).toBe("connect-src");
  });
});
