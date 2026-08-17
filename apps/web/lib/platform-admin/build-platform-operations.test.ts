import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/config", () => ({
  checkDatabaseHealth: vi.fn(async () => ({ ok: true, latencyMs: 1 })),
  getEnv: vi.fn(() => ({ NODE_ENV: "test" })),
}));

vi.mock("@apzhub/shared", () => ({
  checkRedisHealth: vi.fn(async () => ({ ok: true, latencyMs: 1 })),
}));

vi.mock("@/lib/runtime-init", () => ({
  ensurePlatformRuntimeReady: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/event-notification-hydration", () => ({
  loadNotificationFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
  loadEventFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
}));

vi.mock("@/lib/activity-timeline-hydration", () => ({
  loadActivityFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
  loadTimelineFrameworkHealthSummary: vi.fn(async () => ({ status: "healthy" })),
}));

vi.mock("@/lib/platform-admin/integration-manifests", () => ({
  listIntegrationManifestsFromDisk: vi.fn(() => [
    {
      id: "zammad",
      name: "Zammad",
      version: "0.8.0",
      description: "",
      tags: ["support"],
      capabilities: [],
      healthEnabled: true,
      path: "",
    },
  ]),
  providerConnectionPosture: vi.fn(() => ({
    connectionConfigured: true,
    authConfigured: true,
  })),
}));

describe("build-platform-operations", () => {
  it("uses APZ capability names and locked status vocabulary", async () => {
    const { buildPlatformAdminOperations } =
      await import("@/lib/platform-admin/build-platform-operations");
    const payload = await buildPlatformAdminOperations();
    expect(payload.core.some((c) => c.label === "Identity")).toBe(true);
    expect(payload.products.some((p) => p.label === "Support")).toBe(true);
    expect(JSON.stringify(payload.core).toLowerCase()).not.toMatch(/zammad|plane/);
    expect(payload.products.find((p) => p.id === "support")?.health.label).toBe(
      "Unknown",
    );
    expect(payload.issues.some((i) => /Provisioning telemetry/i.test(i.title))).toBe(
      true,
    );
    const blob = JSON.stringify(payload);
    expect(blob).not.toMatch(/\bOnline\b|\bGood\b|\bOK\b|\bWorking\b|\bGreen\b/);
  });
});
