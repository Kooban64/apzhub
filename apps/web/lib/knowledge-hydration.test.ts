import { describe, expect, it } from "vitest";

import { buildKnowledgeServiceHealthSummary } from "@apzhub/knowledge-discovery-framework";

describe("buildKnowledgeServiceHealthSummary", () => {
  it("maps registry and service diagnostics to platform health shape", () => {
    const summary = buildKnowledgeServiceHealthSummary({
      frameworkStatus: "service",
      serviceDiagnostics: {
        frameworkStatus: "service",
        serviceStatus: "ready",
        registryReady: true,
        queryAvailable: true,
        queryClient: { kind: "orchestrator", ready: true },
      },
      registeredCount: 4,
      filteredCount: 3,
      activeSourceCount: 3,
      registeredProviderCount: 2,
    });

    expect(summary).toMatchObject({
      status: "healthy",
      frameworkStatus: "service",
      serviceStatus: "ready",
      queryAvailable: true,
      registeredCount: 4,
      filteredCount: 3,
    });
  });
});
