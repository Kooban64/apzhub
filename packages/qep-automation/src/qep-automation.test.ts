import { describe, expect, it } from "vitest";

import { createQepAutomation } from "./compose";
import { isQepAutomationRoute, QEP_AUTOMATION_ROUTES } from "./presentation/routes";

describe("APZQEP-161 qep-automation", () => {
  it("exposes workspace routes under /workspace/qep/automation", () => {
    expect(isQepAutomationRoute(QEP_AUTOMATION_ROUTES.home)).toBe(true);
    expect(isQepAutomationRoute(QEP_AUTOMATION_ROUTES.queue)).toBe(true);
    expect(isQepAutomationRoute("/workspace/qep/evidence")).toBe(false);
  });

  it("integrates platform automation for Playwright dry-run", async () => {
    const evidenceHooks: string[] = [];
    const automation = createQepAutomation({
      playwrightDryRun: true,
      onEvidencePublished: (record) => {
        evidenceHooks.push(record.executionId);
      },
    });

    const record = await automation.enqueueAndRun({
      tenantId: "t1",
      providerId: "playwright",
      correlationId: "corr",
      requestedBy: "tester",
      target: { kind: "url", name: "blank", baseUrl: "about:blank" },
      options: { dryRun: true },
    });

    expect(record.state).toBe("completed");
    expect(evidenceHooks).toContain(record.executionId);
    expect(automation.listProviders().some((p) => p.providerId === "playwright")).toBe(
      true,
    );
  });
});
