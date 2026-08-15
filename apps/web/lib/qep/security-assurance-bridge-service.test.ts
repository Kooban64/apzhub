import { beforeEach, describe, expect, it, vi } from "vitest";

const hasProductAccess = vi.fn();
const tenantHasProductSubscriptions = vi.fn();
const listTenantEngagements = vi.fn();
const getEngagementPosture = vi.fn();
const listProjectSourceBindings = vi.fn();
const appendQepAuditEvent = vi.fn();
const listChangeEvents = vi.fn();
const getRepository = vi.fn();
const getGreenboneFreshness = vi.fn();

vi.mock("@/lib/commercial/product-access", () => ({
  hasProductAccess: (...args: unknown[]) => hasProductAccess(...args),
}));

vi.mock("@/lib/commercial/resolve-entitlements", () => ({
  tenantHasProductSubscriptions: (...args: unknown[]) =>
    tenantHasProductSubscriptions(...args),
}));

vi.mock("@/lib/apzpen/service", () => ({
  listTenantEngagements: (...args: unknown[]) => listTenantEngagements(...args),
  getEngagementPosture: (...args: unknown[]) => getEngagementPosture(...args),
}));

vi.mock("@/lib/apzpen/greenbone-freshness", () => ({
  getGreenboneFreshness: (...args: unknown[]) => getGreenboneFreshness(...args),
}));

vi.mock("@/lib/commercial/project-source-bindings", () => ({
  listProjectSourceBindings: (...args: unknown[]) => listProjectSourceBindings(...args),
}));

vi.mock("@/lib/qep/qep-audit-store", () => ({
  appendQepAuditEvent: (...args: unknown[]) => appendQepAuditEvent(...args),
}));

vi.mock("@/lib/qep/scm-runtime", () => ({
  getQepScmRuntime: () => ({
    listChangeEvents: (...args: unknown[]) => listChangeEvents(...args),
    getRepository: (...args: unknown[]) => getRepository(...args),
  }),
}));

import { getSecurityAssuranceSummary } from "./security-assurance-bridge-service";

describe("getSecurityAssuranceSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listTenantEngagements.mockReturnValue([]);
    listProjectSourceBindings.mockReturnValue([]);
    listChangeEvents.mockResolvedValue([]);
    getGreenboneFreshness.mockResolvedValue({
      toolId: "greenbone",
      probedAt: "2026-08-15T07:00:00.000Z",
      status: "ok",
      detail: "Reachable at http://127.0.0.1:9392 (HTTP 200)",
    });
  });

  it("returns not_entitled when org has subscriptions but pentest is missing", async () => {
    tenantHasProductSubscriptions.mockReturnValue(true);
    hasProductAccess.mockImplementation(
      (input: { productKey: string }) => input.productKey === "qep",
    );

    const result = await getSecurityAssuranceSummary({
      tenantId: "tenant-1",
      organisationId: "org-1",
      userId: "user-1",
      correlationId: "corr-1",
    });

    expect(result.summary.status).toBe("not_entitled");
    expect(result.summary.entitled).toBe(false);
    expect(result.summary.href).toBe("");
    expect(result.summary.detail).toMatch(
      /APZPEN \(Security Assurance\) is not entitled/i,
    );
    expect(result.summary.vaFreshness?.toolId).toBe("greenbone");
    expect(result.bridge.qepEntitled).toBe(true);
    expect(result.bridge.penEntitled).toBe(false);
    expect(result.engagementCount).toBe(0);
    expect(listTenantEngagements).not.toHaveBeenCalled();
    expect(appendQepAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "bridge.security_assurance.read",
        actor: "user-1",
        correlationId: "corr-1",
        detail: "not_entitled:none",
      }),
    );
  });

  it("stays open when org has no commercial subscriptions (local CE)", async () => {
    tenantHasProductSubscriptions.mockReturnValue(false);
    hasProductAccess.mockReturnValue(false);

    const result = await getSecurityAssuranceSummary({
      tenantId: "tenant-1",
      organisationId: "org-1",
      userId: "user-1",
    });

    expect(result.summary.status).toBe("unavailable");
    expect(result.summary.entitled).toBe(true);
    expect(result.summary.vaFreshness?.status).toBe("ok");
    expect(result.bridge.qepEntitled).toBe(false);
    expect(result.bridge.penEntitled).toBe(false);
    expect(listTenantEngagements).toHaveBeenCalledWith("tenant-1");
    expect(getGreenboneFreshness).toHaveBeenCalled();
  });
});
