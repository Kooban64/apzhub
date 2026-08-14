import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  addScopeTarget,
  approveRulesOfEngagement,
  certifyEngagement,
  createEngagement,
  createFinding,
  listCertificationLedger,
  rebuildSecurityGraphForEngagement,
  getSecurityGraphSummary,
  runScheduleTick,
  startEngagementTesting,
  updateEngagementSchedule,
  updateFindingStatus,
  uploadFindingEvidenceFile,
  downloadVaultEvidence,
} from "@/lib/apzpen/service";
import { planScheduleTick, isEngagementDue } from "@/lib/apzpen/schedule-worker";
import { resolveApzpenStoreMode } from "@/lib/apzpen/postgres-store";
import { resetAllApzpenStoresForTests } from "@/lib/apzpen/follow-on-service";
import { resetProjectSourceBindingsForTests } from "@/lib/commercial/project-source-bindings";
import { createGitLabProvider } from "@apzhub/platform-scm";
import { securityWorkRoot } from "@/lib/apzpen/runner-dispatch";

describe("SPR-APZPEN-014 deferred closeout", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  const prevVault = process.env.APZPEN_VAULT_DIR;
  const root = join(tmpdir(), `apzpen-014-${Date.now()}`);
  const vault = join(root, "vault");

  beforeEach(() => {
    resetAllApzpenStoresForTests();
    resetProjectSourceBindingsForTests();
    process.env.APZTOOLS_ROOT = root;
    process.env.APZPEN_VAULT_DIR = vault;
    mkdirSync(join(securityWorkRoot(), "jobs"), { recursive: true });
    mkdirSync(vault, { recursive: true });
  });

  afterEach(() => {
    if (prevRoot === undefined) delete process.env.APZTOOLS_ROOT;
    else process.env.APZTOOLS_ROOT = prevRoot;
    if (prevVault === undefined) delete process.env.APZPEN_VAULT_DIR;
    else process.env.APZPEN_VAULT_DIR = prevVault;
    rmSync(root, { recursive: true, force: true });
  });

  it("plans due schedules and advances nextRunAt via tick", async () => {
    const eng = createEngagement({
      tenantId: "t-014",
      customerName: "Acme",
      applicationName: "App",
      title: "Schedule",
      environment: "staging",
      createdBy: "op@apzor.com",
      scheduleMode: "frequent",
    });
    addScopeTarget("t-014", eng.engagementId, {
      kind: "web_application",
      label: "Web",
      identifier: "https://app.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-014", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-014", eng.engagementId);
    const past = new Date(Date.now() - 60_000).toISOString();
    updateEngagementSchedule("t-014", eng.engagementId, "frequent", past);

    const dueEng = {
      ...eng,
      scheduleMode: "frequent" as const,
      nextRunAt: past,
      roe: { ...eng.roe, status: "approved" as const },
      scope: [
        {
          targetId: "t1",
          kind: "web_application" as const,
          label: "Web",
          identifier: "https://app.acme.test",
          environment: "staging",
        },
      ],
      status: "in_progress" as const,
    };
    expect(isEngagementDue(dueEng)).toBe(true);
    expect(planScheduleTick({ engagements: [dueEng] }).due).toHaveLength(1);

    const tick = await runScheduleTick({
      tenantId: "t-014",
      createdBy: "op@apzor.com",
      dryRun: true,
      execFn: async () => ({ code: 0, stdout: "", stderr: "" }),
    });
    expect(tick.dueCount).toBe(1);
    expect(tick.dispatched.length).toBeGreaterThan(0);
  });

  it("appends immutable certification ledger and vault evidence", () => {
    const eng = createEngagement({
      tenantId: "t-014b",
      customerName: "Acme",
      applicationName: "App",
      title: "Ledger",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-014b", eng.engagementId, {
      kind: "api",
      label: "API",
      identifier: "https://api.acme.test",
      environment: "staging",
    });
    approveRulesOfEngagement("t-014b", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-014b", eng.engagementId);
    const finding = createFinding({
      tenantId: "t-014b",
      engagementId: eng.engagementId,
      title: "Low issue",
      description: "info",
      severity: "low",
      createdBy: "op@apzor.com",
    });
    updateFindingStatus("t-014b", finding.findingId, "closed");

    const certified = certifyEngagement(
      "t-014b",
      eng.engagementId,
      "certifier@apzor.com",
    );
    expect(certified.status).toBe("certified");
    const ledger = listCertificationLedger("t-014b", eng.engagementId);
    expect(ledger).toHaveLength(1);
    expect(ledger[0]?.certifiedBy).toBe("certifier@apzor.com");
    expect(ledger[0]?.snapshotHash).toHaveLength(64);

    const uploaded = uploadFindingEvidenceFile({
      tenantId: "t-014b",
      findingId: finding.findingId,
      createdBy: "op@apzor.com",
      originalName: "proof.txt",
      contentType: "text/plain",
      bytes: "remediation proof",
      label: "Proof note",
    });
    expect(uploaded.object.vaultUri.startsWith("vault://")).toBe(true);
    expect(uploaded.finding.evidence.some((e) => e.ref.startsWith("vault://"))).toBe(
      true,
    );
    const downloaded = downloadVaultEvidence("t-014b", uploaded.object.vaultUri);
    expect(downloaded.bytes.toString("utf8")).toBe("remediation proof");
  });

  it("rebuilds thin security graph and exposes postgres store mode helper", () => {
    const eng = createEngagement({
      tenantId: "t-014c",
      customerName: "Acme",
      applicationName: "App",
      title: "Graph",
      environment: "staging",
      createdBy: "op@apzor.com",
    });
    addScopeTarget("t-014c", eng.engagementId, {
      kind: "repository",
      label: "repo",
      identifier: "acme/app",
      environment: "staging",
    });
    approveRulesOfEngagement("t-014c", eng.engagementId, "op@apzor.com");
    startEngagementTesting("t-014c", eng.engagementId);
    createFinding({
      tenantId: "t-014c",
      engagementId: eng.engagementId,
      title: "Graph finding",
      description: "d",
      severity: "medium",
      createdBy: "op@apzor.com",
      assetLabel: "repo",
    });
    rebuildSecurityGraphForEngagement("t-014c", eng.engagementId);
    const summary = getSecurityGraphSummary("t-014c");
    expect(summary.nodeCounts.engagement).toBeGreaterThanOrEqual(1);
    expect(summary.nodeCounts.asset).toBeGreaterThanOrEqual(1);
    expect(summary.nodeCounts.finding).toBeGreaterThanOrEqual(1);
    expect(summary.edgeCount).toBeGreaterThanOrEqual(2);
    expect(resolveApzpenStoreMode()).toBe("memory");
  });

  it("registers active GitLab SCM provider offline", async () => {
    const gitlab = createGitLabProvider({ forceOffline: true });
    expect(gitlab.descriptor.providerId).toBe("gitlab");
    expect(gitlab.descriptor.status).toBe("active");
    const health = await gitlab.health({
      tenantId: "t",
      correlationId: "c",
    });
    expect(health.ok).toBe(true);
    const repos = await gitlab.listRepositories({
      tenantId: "t",
      correlationId: "c",
    });
    expect(repos.length).toBeGreaterThan(0);
  });
});
