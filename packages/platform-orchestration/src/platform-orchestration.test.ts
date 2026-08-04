import { describe, expect, it } from "vitest";

import {
  ORCHESTRATION_KERNEL_EVENT_TYPES,
  ORCHESTRATION_KERNEL_STATES,
  PLATFORM_ORCHESTRATION_KERNEL_SLICE,
  PLATFORM_ORCHESTRATION_LEGACY_SLICE,
  PLATFORM_ORCHESTRATION_PROGRAMME,
  PLATFORM_ORCHESTRATION_SLICE,
  PLATFORM_ORCHESTRATION_VERSION,
  canTransition,
  createExecutionContext,
  createPlatformOrchestration,
  isOrchestrationError,
} from "./index";

describe("APZQEP-165 platform-orchestration kernel (QO-001 foundation)", () => {
  it("exports stable programme and slice identity", () => {
    expect(PLATFORM_ORCHESTRATION_VERSION).toBe("0.1.14");
    expect(PLATFORM_ORCHESTRATION_PROGRAMME).toBe("APZQEP-165");
    expect(PLATFORM_ORCHESTRATION_KERNEL_SLICE).toBe("QO-001");
    expect(PLATFORM_ORCHESTRATION_SLICE).toBe("QO-015");
    expect(PLATFORM_ORCHESTRATION_LEGACY_SLICE).toBe("S15");
  });

  it("initialises kernel lifecycle to ready", async () => {
    const events: string[] = [];
    const platform = await createPlatformOrchestration({
      config: { orchestrationId: "orch_test", name: "test-kernel" },
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    expect(platform.kernel.snapshot().state).toBe("ready");
    expect(platform.kernel.health().status).toBe("healthy");
    expect(platform.kernel.health().ready).toBe(true);
    expect(platform.kernel.readiness().ready).toBe(true);
    expect(platform.kernel.version()).toEqual({
      version: "0.1.14",
      programme: "APZQEP-165",
      slice: "QO-015",
    });
    expect(events).toContain(ORCHESTRATION_KERNEL_EVENT_TYPES.kernelCreated);
    expect(events).toContain(ORCHESTRATION_KERNEL_EVENT_TYPES.kernelReady);
  });

  it("supports pause, resume, and stop transitions", async () => {
    const platform = await createPlatformOrchestration({
      config: { orchestrationId: "orch_lifecycle" },
    });

    expect(platform.kernel.pause().state).toBe("paused");
    expect(platform.kernel.health().status).toBe("degraded");
    expect(platform.kernel.resume().state).toBe("ready");
    expect((await platform.kernel.stop()).state).toBe("stopped");
    expect(platform.kernel.health().ready).toBe(false);
  });

  it("registers kernel and catalogue contracts", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.contracts.get("orchestration.kernel.v1")).toBeDefined();
    expect(
      platform.contracts.get("orchestration.capability-catalogue.v1"),
    ).toBeDefined();
    expect(platform.lifecycles.get("orchestration.kernel.lifecycle")).toBeDefined();
    expect(platform.capabilities.count()).toBe(0);
  });

  it("wires DI container tokens separately from capability catalogue", async () => {
    const platform = await createPlatformOrchestration();
    expect(platform.container.has("orchestration.kernel")).toBe(true);
    expect(platform.container.resolve("orchestration.kernel")).toBe(platform.kernel);
    expect(platform.container.listTokens()).toContain("orchestration.config");
    expect(platform.capabilities.catalogueMode).toBe("catalogue-only");
  });

  it("defines execution context structures without evaluating permissions", () => {
    const ctx = createExecutionContext({
      tenantId: "t1",
      projectId: "p1",
      actorId: "u1",
      permissionIds: ["orchestration.read"],
      correlationId: "c1",
    });
    expect(ctx.tenant.tenantId).toBe("t1");
    expect(ctx.project?.projectId).toBe("p1");
    expect(ctx.permissions?.permissionIds).toEqual(["orchestration.read"]);
    expect(ctx.correlation.correlationId).toBe("c1");
  });

  it("enforces lifecycle transition rules", () => {
    expect(canTransition("created", "initialising")).toBe(true);
    expect(canTransition("ready", "paused")).toBe(true);
    expect(canTransition("stopped", "ready")).toBe(false);
    expect(ORCHESTRATION_KERNEL_STATES).toContain("failed");
  });

  it("rejects registry mutation after stop", async () => {
    const platform = await createPlatformOrchestration();
    await platform.kernel.stop();
    try {
      platform.kernel.registerCapability({
        capabilityId: "x",
        name: "x",
        version: "0",
        provider: "test",
        supportedContractVersions: ["1.0.0"],
        documentationRef: "docs/x.md",
      });
      expect.fail("expected registry mutation to fail");
    } catch (error) {
      expect(isOrchestrationError(error)).toBe(true);
    }
  });

  it("exposes diagnostics without peer integration behaviour", async () => {
    const platform = await createPlatformOrchestration({
      config: { orchestrationId: "orch_diag", name: "diag" },
    });
    const diag = platform.kernel.diagnostics();
    expect(diag.configValid).toBe(true);
    expect(diag.state).toBe("ready");
    expect(diag.capabilityCount).toBe(0);
    expect(diag.contractCount).toBeGreaterThanOrEqual(3);
  });
});
