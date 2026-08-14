import { describe, expect, it } from "vitest";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import {
  alreadyTriggeredForChange,
  F9_ASSIST_ORIGIN,
  isAutomationOnChangeEnabled,
  selectChangesForAutoVerification,
} from "./automation-on-change";

function change(
  overrides: Partial<ScmChangeEvent> & Pick<ScmChangeEvent, "changeEventId" | "kind">,
): ScmChangeEvent {
  return {
    tenantId: "tenant-1",
    providerId: "github",
    externalKey: overrides.sha ?? overrides.changeEventId,
    occurredAt: "2026-08-09T00:00:00.000Z",
    correlationId: "corr-1",
    source: "webhook",
    summary: "demo",
    ...overrides,
  };
}

describe("F9 automation-on-change", () => {
  it("selects commit/PR changes and caps batch size", () => {
    const events = [
      change({ changeEventId: "c1", kind: "commit" }),
      change({ changeEventId: "p1", kind: "push" }),
      change({ changeEventId: "pr1", kind: "pull_request" }),
      change({ changeEventId: "c2", kind: "commit" }),
      change({ changeEventId: "c3", kind: "commit" }),
    ];
    const selected = selectChangesForAutoVerification(events, 2);
    expect(selected.map((event) => event.changeEventId)).toEqual(["c1", "pr1"]);
  });

  it("detects prior F9 trigger via metadata", () => {
    expect(
      alreadyTriggeredForChange(
        [
          {
            target: {
              metadata: {
                changeEventId: "chg-1",
                assistOrigin: F9_ASSIST_ORIGIN,
              },
            },
          },
        ],
        "chg-1",
      ),
    ).toBe(true);
    expect(
      alreadyTriggeredForChange(
        [{ target: { metadata: { changeEventId: "chg-1" } } }],
        "chg-1",
      ),
    ).toBe(false);
  });

  it("env gate defaults off", () => {
    expect(isAutomationOnChangeEnabled({})).toBe(false);
    expect(isAutomationOnChangeEnabled({ APZHUB_AUTOMATION_ON_CHANGE: "true" })).toBe(
      true,
    );
  });

  it("source policy: must not call certification mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/automation-on-change.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).not.toMatch(/acceptTestDesignProposal/);
    expect(source).toMatch(/APZHUB_AUTOMATION_ON_CHANGE/);
  });
});
