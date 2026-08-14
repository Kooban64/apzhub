import { describe, expect, it, beforeEach } from "vitest";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import {
  buildDispatchPayload,
  F10_ASSIST_ORIGIN,
  isVerificationDispatchEnabled,
  resolveDispatchConfig,
  resolveDispatchDomains,
  triggerVerificationDispatchForPersistedChanges,
} from "./verification-dispatch-on-change";
import {
  listVerificationDispatches,
  resetVerificationDispatchStoreForTests,
} from "./verification-dispatch-store";

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
    repositoryId: "repo-1",
    sha: "abc123",
    ...overrides,
  };
}

describe("F10 verification-dispatch-on-change", () => {
  beforeEach(() => {
    resetVerificationDispatchStoreForTests();
  });

  it("env gate defaults off", () => {
    expect(isVerificationDispatchEnabled({})).toBe(false);
    expect(
      isVerificationDispatchEnabled({ APZHUB_VERIFICATION_DISPATCH: "true" }),
    ).toBe(true);
  });

  it("resolves default domains and builds payload", () => {
    const domains = resolveDispatchDomains({});
    expect(domains).toContain("vitest");
    expect(domains).toContain("security");
    const payload = buildDispatchPayload({
      change: change({ changeEventId: "chg-1", kind: "commit" }),
      domains,
      repositoryFullName: "apzor/demo",
    });
    expect(payload.changeEventId).toBe("chg-1");
    expect(payload.assistOrigin).toBe(F10_ASSIST_ORIGIN);
    expect(payload.domains).toContain("vitest");
  });

  it("record_only mode writes dispatched ledger rows", async () => {
    const env = {
      APZHUB_VERIFICATION_DISPATCH: "true",
      APZHUB_VERIFICATION_DISPATCH_MODE: "record_only",
      APZHUB_VERIFICATION_DISPATCH_OWNER: "apzor",
      APZHUB_VERIFICATION_DISPATCH_REPO: "demo",
      APZHUB_VERIFICATION_DISPATCH_WORKFLOW: "verify.yml",
      APZHUB_VERIFICATION_DISPATCH_DOMAINS: "vitest,accessibility",
    };
    expect(resolveDispatchConfig(env).recordOnly).toBe(true);
    const rows = await triggerVerificationDispatchForPersistedChanges({
      tenantId: "tenant-1",
      correlationId: "corr-1",
      source: "webhook",
      events: [change({ changeEventId: "chg-f10-1", kind: "commit" })],
      env,
      resolveRepositoryFullName: async () => "apzor/demo",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("dispatched");
    expect(rows[0]?.domains).toEqual(["vitest", "accessibility"]);
    expect(listVerificationDispatches({ changeEventId: "chg-f10-1" })).toHaveLength(1);
  });

  it("source policy: must not call certification mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/verification-dispatch-on-change.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).not.toMatch(/enqueueAndRun/);
    expect(source).toMatch(/APZHUB_VERIFICATION_DISPATCH/);
  });
});
