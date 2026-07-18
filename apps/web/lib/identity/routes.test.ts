import { describe, expect, it } from "vitest";

import {
  IDENTITY_API_BASE,
  IDENTITY_FORBIDDEN_HTTP_SEGMENTS,
  IDENTITY_WORKSPACE_BASE,
  assertIdentityApiPath,
  identitySectionPath,
  isIdentityApiPath,
  isIdentityRoute,
  resolveIdentitySection,
} from "./routes";

describe("identity routes", () => {
  it("detects identity API paths", () => {
    expect(isIdentityApiPath(IDENTITY_API_BASE)).toBe(true);
    expect(isIdentityApiPath(`${IDENTITY_API_BASE}/users`)).toBe(true);
    expect(isIdentityApiPath("/api/v1/administration")).toBe(false);
  });

  it("rejects paths outside base", () => {
    expect(() => assertIdentityApiPath("/api/v1/other")).toThrow(/may only call/);
  });

  it("rejects auth/provisioning forbidden segments", () => {
    expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/login`)).toThrow(
      /Forbidden/,
    );
    for (const segment of IDENTITY_FORBIDDEN_HTTP_SEGMENTS) {
      expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/${segment}`)).toThrow(
        /Forbidden identity HTTP segment/,
      );
    }
  });

  it("allows identity metadata segments (users/roles/tenants are NOT forbidden)", () => {
    expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/users`)).not.toThrow();
    expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/roles`)).not.toThrow();
    expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/tenants`)).not.toThrow();
    expect(() =>
      assertIdentityApiPath(`${IDENTITY_API_BASE}/organisations`),
    ).not.toThrow();
    expect(() => assertIdentityApiPath(`${IDENTITY_API_BASE}/groups`)).not.toThrow();
    expect(() =>
      assertIdentityApiPath(`${IDENTITY_API_BASE}/service-assignments`),
    ).not.toThrow();
  });

  it("detects identity workspace routes", () => {
    expect(isIdentityRoute(IDENTITY_WORKSPACE_BASE)).toBe(true);
    expect(isIdentityRoute(`${IDENTITY_WORKSPACE_BASE}/users`)).toBe(true);
    expect(isIdentityRoute(`${IDENTITY_WORKSPACE_BASE}/users/`)).toBe(true);
    expect(isIdentityRoute("/workspace/administration")).toBe(false);
  });

  it("resolves workspace sections", () => {
    expect(resolveIdentitySection(IDENTITY_WORKSPACE_BASE)).toBe("overview");
    expect(resolveIdentitySection(`${IDENTITY_WORKSPACE_BASE}/users`)).toBe("users");
    expect(
      resolveIdentitySection(`${IDENTITY_WORKSPACE_BASE}/service-assignments`),
    ).toBe("service-assignments");
    expect(resolveIdentitySection(`${IDENTITY_WORKSPACE_BASE}/unknown`)).toBe(
      "overview",
    );
  });

  it("builds workspace section paths", () => {
    expect(identitySectionPath()).toBe(`${IDENTITY_WORKSPACE_BASE}/overview`);
    expect(identitySectionPath("overview")).toBe(`${IDENTITY_WORKSPACE_BASE}/overview`);
    expect(identitySectionPath("diagnostics")).toBe(
      `${IDENTITY_WORKSPACE_BASE}/diagnostics`,
    );
    expect(identitySectionPath("service-assignments")).toBe(
      `${IDENTITY_WORKSPACE_BASE}/service-assignments`,
    );
  });
});
