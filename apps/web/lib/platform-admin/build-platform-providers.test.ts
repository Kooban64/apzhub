import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/platform-admin/integration-manifests", () => ({
  listIntegrationManifestsFromDisk: vi.fn(() => [
    {
      id: "plane",
      name: "Plane Engine Integration",
      version: "0.6.0",
      description: "Projects adapter",
      tags: ["plane", "projects", "adapter"],
      capabilities: ["health"],
      healthEnabled: true,
      path: "/tmp/plane.yaml",
    },
    {
      id: "zammad",
      name: "Zammad Engine Integration",
      version: "0.8.0",
      description: "Support adapter",
      tags: ["zammad", "support", "adapter"],
      capabilities: ["health"],
      healthEnabled: true,
      path: "/tmp/zammad.yaml",
    },
  ]),
  capabilityFromTags: (tags: string[]) =>
    tags.includes("support")
      ? "Support"
      : tags.includes("projects")
        ? "Projects"
        : "Platform",
  providerConnectionPosture: vi.fn((id: string) =>
    id === "zammad"
      ? { connectionConfigured: true, authConfigured: true }
      : { connectionConfigured: false, authConfigured: false },
  ),
}));

describe("build-platform-providers", () => {
  it("loads providers from manifests and never invents Healthy", async () => {
    const { buildPlatformAdminProviders, buildPlatformAdminProviderDetail } =
      await import("@/lib/platform-admin/build-platform-providers");
    const list = await buildPlatformAdminProviders();
    expect(list.providers.map((p) => p.providerId)).toEqual(["plane", "zammad"]);
    const plane = list.providers.find((p) => p.providerId === "plane")!;
    expect(plane.capability).toBe("Projects");
    expect(plane.statusLabel).toBe("Not configured");
    expect(plane.health.label).not.toMatch(/Healthy/i);

    const zammad = await buildPlatformAdminProviderDetail("zammad");
    expect(zammad?.statusLabel).toBe("Configured");
    expect(zammad?.health.label).toBe("Health unavailable");
    expect(zammad?.capability).toBe("Support");
  });
});
