import { describe, expect, it } from "vitest";

import {
  getSessionPolicyPostureSummary,
  getSessionSecurityDiagnostics,
} from "./session-diagnostics";
import {
  validateSessionActive,
  validateTenantSessionConsistency,
} from "./session-validation";

describe("session-diagnostics", () => {
  it("reports session policy posture without secrets", () => {
    const posture = getSessionPolicyPostureSummary();
    expect(posture.sessionValidation).toBe("active");
    expect(posture.cookieHttpOnly).toBe(true);
    expect(posture.sessionDiagnostics.recommendations.length).toBeGreaterThan(0);
    expect(JSON.stringify(posture)).not.toMatch(
      /BETTER_AUTH_SECRET|session_token|"password":/i,
    );
  });

  it("reports tenant binding when session is enriched", () => {
    const diagnostics = getSessionSecurityDiagnostics({
      user: {
        id: "user-1",
        email: "a@example.com",
        emailVerified: true,
        name: "A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        expiresAt: new Date(Date.now() + 60_000),
        id: "s1",
        userId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        token: "redacted",
      },
      tenantId: "tenant-1",
      tenantSource: "primary_membership",
    } as Parameters<typeof getSessionSecurityDiagnostics>[0]);

    expect(diagnostics.tenantBinding.bound).toBe(true);
    expect(diagnostics.tenantBinding.source).toBe("primary_membership");
  });
});

describe("session-validation", () => {
  it("rejects expired sessions", () => {
    const result = validateSessionActive({
      session: { expiresAt: new Date(Date.now() - 1_000).toISOString() },
    });
    expect(result.valid).toBe(false);
  });

  it("blocks development tenant fallback in production profile", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const result = validateTenantSessionConsistency({
      userId: "user-1",
      tenantId: "tenant-1",
      tenantSource: "development_fallback",
      requireTenant: true,
    });

    expect(result.valid).toBe(false);
    process.env.NODE_ENV = original;
  });
});
