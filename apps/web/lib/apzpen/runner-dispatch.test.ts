import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import {
  assertTargetInScope,
  buildDockerExecArgs,
  pickDefaultTarget,
  prepareDispatchJob,
  runPreparedDispatch,
  type ExecFn,
} from "./runner-dispatch";
import type { Engagement } from "./types";

beforeEach(() => {
  process.env.APZTOOLS_ROOT = mkdtempSync(join(tmpdir(), "apztools-"));
});

function eng(scopeIds: string[]): Engagement {
  return {
    engagementId: "eng_test",
    tenantId: "t1",
    customerName: "Acme",
    applicationName: "Portal",
    title: "Test",
    status: "in_progress",
    environment: "staging",
    methodology: ["OWASP WSTG"],
    scope: scopeIds.map((identifier, i) => ({
      targetId: `t${i}`,
      kind: "web_application" as const,
      label: `T${i}`,
      identifier,
      environment: "staging",
    })),
    roe: {
      roeId: "roe1",
      status: "approved",
      allowedTechniques: [],
      restrictedTechniques: [],
      approvedAt: "2026-08-13T00:00:00.000Z",
      approvedBy: "tester",
    },
    assessmentPosition: "in_progress",
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
    createdBy: "tester",
    scheduleMode: "on_demand",
  };
}

describe("APZPEN runner dispatch", () => {
  it("rejects targets outside scope", () => {
    const scope = eng(["https://staging.acme.test"]).scope;
    expect(() => assertTargetInScope("https://evil.example", scope)).toThrow(
      /outside engagement scope/,
    );
    expect(() =>
      assertTargetInScope("https://staging.acme.test/login", scope),
    ).not.toThrow();
  });

  it("builds docker compose exec for ZAP and Trivy", () => {
    const zap = buildDockerExecArgs({
      tool: "zap",
      target: "https://staging.acme.test",
      jobId: "job1",
      composeFile: "/tmp/docker-compose.pentest-cluster.yml",
    });
    expect(zap.args.join(" ")).toContain("zap-runner");
    expect(zap.args.join(" ")).toContain("zap-baseline.py");
    expect(zap.artefactRel).toContain("out/zap/job1.json");

    const trivy = buildDockerExecArgs({
      tool: "trivy",
      target: "/shared/repos/app",
      jobId: "job2",
      composeFile: "/tmp/docker-compose.pentest-cluster.yml",
    });
    expect(trivy.args.join(" ")).toContain("trivy-runner");
    expect(trivy.args.join(" ")).toContain("sarif");
  });

  it("dry-run prepares job without executing docker", async () => {
    const prepared = prepareDispatchJob({
      jobId: "dry_job_1",
      engagement: eng(["https://staging.acme.test"]),
      tool: "zap",
      target: "https://staging.acme.test",
      dryRun: true,
      composeFile: "/tmp/docker-compose.pentest-cluster.yml",
    });
    expect(prepared.job.status).toBe("skipped");
    expect(prepared.job.commandPreview).toContain("docker");

    const execFn: ExecFn = async () => {
      throw new Error("should not run");
    };
    const ran = await runPreparedDispatch({
      job: prepared.job,
      dockerArgs: prepared.dockerArgs,
      artefactAbs: prepared.artefactAbs,
      execFn,
    });
    expect(ran.status).toBe("skipped");
  });

  it("picks default web target for zap", () => {
    expect(pickDefaultTarget("zap", eng(["https://a.test"]).scope)).toBe(
      "https://a.test",
    );
  });

  it("builds gitleaks and mobsf dispatch commands", () => {
    const gitleaks = buildDockerExecArgs({
      tool: "gitleaks",
      target: "/shared/repos/app",
      jobId: "job_g",
      composeFile: "/tmp/docker-compose.pentest-cluster.yml",
    });
    expect(gitleaks.args.join(" ")).toContain("gitleaks-runner");
    expect(gitleaks.artefactRel).toContain("out/gitleaks/");

    const mobsf = buildDockerExecArgs({
      tool: "mobsf",
      target: "/work/jobs/mobsf/app.apk",
      jobId: "job_m",
      composeFile: "/tmp/docker-compose.pentest-cluster.yml",
    });
    expect(mobsf.args.join(" ")).toContain("mobsf-runner");
    expect(mobsf.args.join(" ")).toContain("8000");
  });
});
