import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getControlPlane } from "../../../app/api/platform/v1/operations/control-plane/route";

const mockRequirePlatformAdminRoute = vi.fn();
const mockLoadConsolidatedOperationalDiagnostics = vi.fn();
const mockEnsurePlatformRuntimeReady = vi.fn();
const mockBuildOperationsControlPlaneSnapshot = vi.fn();

vi.mock("@apzhub/config", () => ({
  getEnv: () => ({
    PLATFORM_VERSION: "0.1.0-foundation",
    BUILD_NUMBER: "local",
    NODE_ENV: "test",
  }),
}));

vi.mock("@/lib/api/platform/platform-route-guard", () => ({
  requirePlatformAdminRoute: (...args: unknown[]) =>
    mockRequirePlatformAdminRoute(...args),
}));

vi.mock("@/lib/operational-diagnostics", () => ({
  loadConsolidatedOperationalDiagnostics: (...args: unknown[]) =>
    mockLoadConsolidatedOperationalDiagnostics(...args),
}));

vi.mock("@/lib/runtime-init", () => ({
  ensurePlatformRuntimeReady: (...args: unknown[]) =>
    mockEnsurePlatformRuntimeReady(...args),
}));

vi.mock("@apzhub/platform-operations/server", () => ({
  buildOperationsControlPlaneSnapshot: (...args: unknown[]) =>
    mockBuildOperationsControlPlaneSnapshot(...args),
}));

describe("GET /api/platform/v1/operations/control-plane", () => {
  beforeEach(() => {
    mockRequirePlatformAdminRoute.mockReset();
    mockLoadConsolidatedOperationalDiagnostics.mockReset();
    mockEnsurePlatformRuntimeReady.mockReset();
    mockBuildOperationsControlPlaneSnapshot.mockReset();
  });

  it("returns 401 when admin guard fails", async () => {
    mockRequirePlatformAdminRoute.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: { code: "UNAUTHORIZED" } }), {
        status: 401,
      }),
    });

    const response = await getControlPlane();
    expect(response.status).toBe(401);
  });

  it("returns canonical control plane snapshot without secrets", async () => {
    mockRequirePlatformAdminRoute.mockResolvedValue({
      ok: true,
      session: {
        user: { id: "admin-1" },
        tenantId: "t0000001-0000-4000-8000-000000000001",
      },
    });
    mockEnsurePlatformRuntimeReady.mockResolvedValue({ success: true });
    mockLoadConsolidatedOperationalDiagnostics.mockResolvedValue({
      generatedAt: "2026-07-09T08:00:00.000Z",
      lawPlatform: { product: "law-platform" },
      trustAccounting: { capability: "trust" },
      resilience: { health: { status: "healthy", dependencies: [] } },
    });
    mockBuildOperationsControlPlaneSnapshot.mockReturnValue({
      generatedAt: "2026-07-09T08:00:00.000Z",
      overview: { productionReadiness: "READY", readinessScore: 100 },
      capabilities: [
        { capabilityId: "platform.operations", name: "Operations Control Plane" },
      ],
      productionVerification: { verdict: "READY" },
    });

    const response = await getControlPlane();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.overview.productionReadiness).toBe("READY");
    expect(JSON.stringify(body)).not.toMatch(/secret|password|DATABASE_URL/i);
  });
});
