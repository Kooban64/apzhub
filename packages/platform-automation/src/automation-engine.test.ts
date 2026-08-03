import { describe, expect, it } from "vitest";

import { AUTOMATION_EVENT_TYPES } from "./contracts/events";
import { canTransition } from "./lifecycle/transitions";
import { createPlatformAutomation } from "./sdk/create-automation";

describe("APZQEP-161 platform-automation", () => {
  it("registers Playwright as active and others as placeholders", () => {
    const { registry } = createPlatformAutomation({ playwrightDryRun: true });
    const list = registry.list();
    expect(list.find((p) => p.providerId === "playwright")?.status).toBe("active");
    expect(list.filter((p) => p.status === "placeholder").length).toBe(7);
  });

  it("runs Playwright dry-run through full lifecycle with evidence", async () => {
    const events: string[] = [];
    const { engine } = createPlatformAutomation({
      playwrightDryRun: true,
      publishEvent: (e) => {
        events.push(e.type);
      },
    });

    const result = await engine.enqueueAndRun({
      tenantId: "t0000001-0000-4000-8000-000000000001",
      providerId: "playwright",
      correlationId: "corr-1",
      requestedBy: "user-1",
      target: { kind: "url", name: "smoke", baseUrl: "about:blank" },
      options: { dryRun: true, retries: 0 },
    });

    expect(result.state).toBe("completed");
    expect(result.artifacts.length).toBeGreaterThan(0);
    expect(result.evidenceRefs.length).toBeGreaterThan(0);
    expect(events).toContain(AUTOMATION_EVENT_TYPES.executionQueued);
    expect(events).toContain(AUTOMATION_EVENT_TYPES.executionCompleted);
    expect(events).toContain(AUTOMATION_EVENT_TYPES.evidencePublished);
  });

  it("rejects placeholder provider execution", async () => {
    const { engine } = createPlatformAutomation({ playwrightDryRun: true });
    await expect(
      engine.enqueue({
        tenantId: "t1",
        providerId: "k6",
        correlationId: "c",
        requestedBy: "u",
        target: { kind: "custom", name: "load" },
      }),
    ).rejects.toThrow(/placeholder/i);
  });

  it("retries then fails when provider keeps failing", async () => {
    const { engine, registry } = createPlatformAutomation({
      playwrightDryRun: true,
      includePlaceholders: false,
    });
    const provider = registry.require("playwright");
    provider.execute = async () => ({
      ok: false,
      summary: "forced fail",
      artifacts: [],
      errorMessage: "FAIL",
    });

    const result = await engine.enqueueAndRun({
      tenantId: "t1",
      providerId: "playwright",
      correlationId: "c",
      requestedBy: "u",
      target: { kind: "spec", name: "x" },
      options: { dryRun: true, retries: 1 },
    });

    expect(result.state).toBe("failed");
    expect(result.attempt).toBe(2);
  });

  it("enforces lifecycle transition rules", () => {
    expect(canTransition("queued", "preparing")).toBe(true);
    expect(canTransition("completed", "running")).toBe(false);
  });

  it("never exposes playwright types on public record", async () => {
    const { engine } = createPlatformAutomation({ playwrightDryRun: true });
    const result = await engine.enqueueAndRun({
      tenantId: "t1",
      providerId: "playwright",
      correlationId: "c",
      requestedBy: "u",
      target: { kind: "url", name: "home", baseUrl: "about:blank" },
      options: { dryRun: true },
    });
    const json = JSON.stringify(result);
    expect(json.toLowerCase()).not.toContain("browsercontext");
    expect(json.toLowerCase()).not.toContain("chromium");
  });
});
