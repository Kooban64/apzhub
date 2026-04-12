import { afterEach, describe, expect, it, vi } from "vitest";

import { mergeAdapterHealthIntoStrip } from "@/lib/adapters/health/merge-adapter-health-strip";
import type { AdminHealthStrip } from "@/lib/admin/contracts/health";

vi.mock("@/lib/adapters/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/adapters/env")>();
  return {
    ...actual,
    getProvisioningSource: () => "real" as const,
  };
});

vi.mock("@/lib/provisioning/service/provisioning-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/provisioning/service/provisioning-service")>();
  return {
    ...actual,
    isProvisioningEngineConfigured: () => true,
  };
});

describe("mergeAdapterHealthIntoStrip", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("adds per-connector rows when provisioning is real and DB is configured", () => {
    vi.stubEnv("APZHUB_PROVISIONING_CONNECTOR_PROFILE", "mock");
    const base: AdminHealthStrip = {
      overall: "ok",
      headline: "Test",
      subsystems: [{ id: "core", name: "Core", status: "ok", detail: "ok" }],
    };
    const merged = mergeAdapterHealthIntoStrip(base);
    expect(merged.subsystems.some((s) => s.id === "adapter_launch_persistence")).toBe(true);
    const conn = merged.subsystems.filter((s) => s.id.startsWith("adapter_conn_"));
    expect(conn.length).toBeGreaterThanOrEqual(3);
    expect(conn.some((c) => c.name.includes("Mail"))).toBe(true);
    expect(conn.some((c) => c.detail.includes("caps="))).toBe(true);
  });
});
