import { describe, expect, it, beforeEach } from "vitest";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import {
  DEFAULT_SECURITY_DISPATCH_DOMAINS,
  F11_ASSIST_ORIGIN,
  isSecurityDispatchEnabled,
  resolveSecurityDispatchDomains,
  triggerSecurityDispatchForPersistedChanges,
} from "./security-dispatch-on-change";
import {
  listVerificationDispatches,
  resetVerificationDispatchStoreForTests,
} from "./verification-dispatch-store";
import { triggerVerificationDispatchForPersistedChanges } from "./verification-dispatch-on-change";

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

describe("F11 security-dispatch-on-change", () => {
  beforeEach(() => {
    resetVerificationDispatchStoreForTests();
  });

  it("defaults include trivy/semgrep/nuclei/zap and not greenbone", () => {
    expect(isSecurityDispatchEnabled({})).toBe(false);
    const domains = resolveSecurityDispatchDomains({});
    expect(domains).toEqual([...DEFAULT_SECURITY_DISPATCH_DOMAINS]);
    expect(domains).not.toContain("greenbone");
  });

  it("can co-exist with F10 pack on the same change", async () => {
    const event = change({ changeEventId: "chg-f11-1", kind: "commit" });
    await triggerVerificationDispatchForPersistedChanges({
      tenantId: "tenant-1",
      correlationId: "corr-1",
      source: "webhook",
      events: [event],
      env: {
        APZHUB_VERIFICATION_DISPATCH: "true",
        APZHUB_VERIFICATION_DISPATCH_MODE: "record_only",
        APZHUB_VERIFICATION_DISPATCH_OWNER: "apzor",
        APZHUB_VERIFICATION_DISPATCH_REPO: "demo",
        APZHUB_VERIFICATION_DISPATCH_WORKFLOW: "verify.yml",
      },
    });
    await triggerSecurityDispatchForPersistedChanges({
      tenantId: "tenant-1",
      correlationId: "corr-1",
      source: "webhook",
      events: [event],
      env: {
        APZHUB_SECURITY_DISPATCH: "true",
        APZHUB_SECURITY_DISPATCH_MODE: "record_only",
        APZHUB_SECURITY_DISPATCH_OWNER: "apzor",
        APZHUB_SECURITY_DISPATCH_REPO: "demo",
        APZHUB_SECURITY_DISPATCH_WORKFLOW: "security.yml",
      },
    });
    const rows = listVerificationDispatches({ changeEventId: "chg-f11-1" });
    expect(rows).toHaveLength(2);
    expect(rows.some((row) => row.assistOrigin === F11_ASSIST_ORIGIN)).toBe(true);
    expect(rows.some((row) => row.pack === "security")).toBe(true);
    expect(rows.some((row) => row.pack === "quality")).toBe(true);
  });

  it("source policy: must not call certification mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/security-dispatch-on-change.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).not.toMatch(/enqueueAndRun/);
    expect(source).toMatch(/APZHUB_SECURITY_DISPATCH/);
    expect(source).toMatch(/nuclei/);
  });

  it("force=true allows re-dispatch after already_dispatched", async () => {
    const event = change({ changeEventId: "chg-f11-force", kind: "commit" });
    const env = {
      APZHUB_SECURITY_DISPATCH: "true",
      APZHUB_SECURITY_DISPATCH_MODE: "record_only",
      APZHUB_SECURITY_DISPATCH_OWNER: "apzor",
      APZHUB_SECURITY_DISPATCH_REPO: "demo",
      APZHUB_SECURITY_DISPATCH_WORKFLOW: "security.yml",
    };
    await triggerSecurityDispatchForPersistedChanges({
      tenantId: "tenant-1",
      correlationId: "corr-1",
      source: "webhook",
      events: [event],
      env,
    });
    const second = await triggerSecurityDispatchForPersistedChanges({
      tenantId: "tenant-1",
      correlationId: "corr-2",
      source: "manual",
      events: [event],
      env,
      force: true,
    });
    expect(second.some((row) => row.status === "dispatched")).toBe(true);
    expect(second.every((row) => row.detail !== "already_dispatched")).toBe(true);
    const rows = listVerificationDispatches({
      changeEventId: "chg-f11-force",
    });
    expect(rows.filter((r) => r.status === "dispatched").length).toBeGreaterThanOrEqual(
      2,
    );
  });
});
