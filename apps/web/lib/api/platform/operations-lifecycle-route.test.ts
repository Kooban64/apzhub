import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET as getLifecycle, POST as postLifecycle } from "../../../app/api/platform/v1/operations/lifecycle/route";

const mockRequirePlatformAdminRoute = vi.fn();
const mockLoadConsolidatedOperationalDiagnostics = vi.fn();
const mockEnsurePlatformRuntimeReady = vi.fn();
const mockGetSharedPlatformLifecycleManager = vi.fn();

vi.mock("@apzhub/config", () => ({
  getEnv: () => ({
    PLATFORM_VERSION: "0.1.0-foundation",
    BUILD_NUMBER: "local",
    NODE_ENV: "test",
  }),
}));

vi.mock("@/lib/api/platform/platform-route-guard", () => ({
  requirePlatformAdminRoute: (...args: unknown[]) => mockRequirePlatformAdminRoute(...args),
}));

vi.mock("@/lib/operational-diagnostics", () => ({
  loadConsolidatedOperationalDiagnostics: (...args: unknown[]) =>
    mockLoadConsolidatedOperationalDiagnostics(...args),
}));

vi.mock("@/lib/runtime-init", () => ({
  ensurePlatformRuntimeReady: (...args: unknown[]) => mockEnsurePlatformRuntimeReady(...args),
}));

vi.mock("@apzhub/platform-lifecycle/server", () => ({
  getSharedPlatformLifecycleManager: () => mockGetSharedPlatformLifecycleManager(),
}));

describe("Platform lifecycle API", () => {
  const manager = {
    snapshot: vi.fn(),
    applyAction: vi.fn(),
  };

  beforeEach(() => {
    mockRequirePlatformAdminRoute.mockReset();
    mockLoadConsolidatedOperationalDiagnostics.mockReset();
    mockEnsurePlatformRuntimeReady.mockReset();
    manager.snapshot.mockReset();
    manager.applyAction.mockReset();
    mockGetSharedPlatformLifecycleManager.mockReturnValue(manager);
  });

  it("returns 401 when admin guard fails", async () => {
    mockRequirePlatformAdminRoute.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: { code: "UNAUTHORIZED" } }), { status: 401 }),
    });

    const response = await getLifecycle();
    expect(response.status).toBe(401);
  });

  it("returns lifecycle snapshot without secrets", async () => {
    mockRequirePlatformAdminRoute.mockResolvedValue({ ok: true, session: { user: { id: "admin-1" } } });
    mockEnsurePlatformRuntimeReady.mockResolvedValue({ success: true });
    mockLoadConsolidatedOperationalDiagnostics.mockResolvedValue({
      generatedAt: "2026-07-09T08:00:00.000Z",
      lawPlatform: { product: "law-platform" },
      trustAccounting: { capability: "trust" },
      resilience: { health: { status: "healthy", dependencies: [] }, readiness: { status: "healthy" } },
      security: {
        environment: { valid: true, checks: [] },
        session: { sessionDiagnostics: { healthy: true } },
        apiGuard: { permissionEnforcement: true },
        trafficGovernance: { status: { enabled: true } },
      },
    });
    manager.snapshot.mockReturnValue({
      currentState: "operational",
      maintenanceMode: false,
      capabilities: [],
      products: [],
    });

    const response = await getLifecycle();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.currentState).toBe("operational");
    expect(JSON.stringify(body)).not.toMatch(/secret|password|DATABASE_URL/i);
  });

  it("applies maintenance action", async () => {
    mockRequirePlatformAdminRoute.mockResolvedValue({ ok: true, session: { user: { id: "admin-1" } } });
    mockEnsurePlatformRuntimeReady.mockResolvedValue({ success: true });
    mockLoadConsolidatedOperationalDiagnostics.mockResolvedValue({
      generatedAt: "2026-07-09T08:00:00.000Z",
      resilience: { health: { status: "healthy", dependencies: [] }, readiness: { status: "healthy" } },
      security: {
        environment: { valid: true, checks: [] },
        session: { sessionDiagnostics: { healthy: true } },
        apiGuard: { permissionEnforcement: true },
        trafficGovernance: { status: { enabled: true } },
      },
    });
    manager.applyAction.mockReturnValue({
      success: true,
      action: "enter-maintenance",
      previousState: "operational",
      currentState: "maintenance",
      message: "Maintenance mode enabled.",
      timestamp: "2026-07-09T08:00:00.000Z",
    });
    manager.snapshot.mockReturnValue({ currentState: "maintenance", maintenanceMode: true });

    const response = await postLifecycle(
      new Request("http://localhost/api/platform/v1/operations/lifecycle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "enter-maintenance" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.result.currentState).toBe("maintenance");
  });
});
