import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/config", () => ({
  checkDatabaseHealth: vi.fn(async () => ({
    ok: true,
    latencyMs: 1,
    message: "ok",
  })),
  getEnv: vi.fn(() => ({
    NODE_ENV: "test",
    PLATFORM_VERSION: "test-1",
    BUILD_NUMBER: "0",
  })),
}));

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: async () => [{ id: "u1" }, { id: "u2" }],
    }),
  })),
  user: { id: "id" },
}));

vi.mock("@apzhub/shared", () => ({
  checkRedisHealth: vi.fn(async () => ({
    ok: true,
    latencyMs: 1,
    message: "ok",
  })),
}));

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    {
      tenantId: "t-apzor",
      name: "APZOR",
      status: "active",
      slug: "apzor",
    },
    {
      tenantId: "t-demo",
      name: "Demo",
      status: "suspended",
      slug: "demo",
    },
  ]),
}));

vi.mock("@/lib/runtime-init", () => ({
  ensurePlatformRuntimeReady: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/activity-timeline-hydration", () => ({
  loadActivityFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
  loadTimelineFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
}));

vi.mock("@/lib/event-notification-hydration", () => ({
  loadEventFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
  loadNotificationFrameworkHealthSummary: vi.fn(async () => ({
    status: "healthy",
  })),
}));

describe("buildPlatformAdminOverview", () => {
  it("returns live tenant/user counts and honest unavailable commercial fields", async () => {
    process.env.DATABASE_URL = "postgres://test";
    const { buildPlatformAdminOverview } =
      await import("@/lib/platform-admin/build-overview");
    const overview = await buildPlatformAdminOverview("24h");

    expect(overview.platformStatus.tenants).toEqual({
      availability: "ok",
      value: 2,
    });
    expect(overview.platformStatus.users).toEqual({
      availability: "ok",
      value: 2,
    });
    expect(overview.tenants.active.value).toBe(1);
    expect(overview.tenants.suspended.value).toBe(1);
    expect(overview.tenants.trial.availability).toBe("unavailable");
    expect(overview.platformStatus.providers.availability).toBe("unavailable");
    expect(overview.billing.availability).toBe("not_configured");
    expect(overview.provisioning.availability).toBe("not_configured");
    expect(overview.attention.availability).toBe("not_configured");
    expect(overview.activity.availability).toBe("not_configured");

    const labels = overview.platformHealth.capabilities.map((c) => c.label);
    expect(labels).toEqual([
      "Identity",
      "Search",
      "Notifications",
      "Activity",
      "Provisioning",
      "Realtime",
    ]);
    // No provider implementation names on Overview.
    const blob = JSON.stringify(overview);
    expect(blob.toLowerCase()).not.toMatch(
      /zammad|plane\.so|\bkimai\b|metabase|paperless/,
    );
  });
});
