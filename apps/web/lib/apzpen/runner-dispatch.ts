/**
 * APZPEN live runner dispatch — invokes host Docker security runners.
 * Never scans outside engagement scope / approved RoE.
 */

import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import type { CatalogueDispatchTool } from "./provider-catalogue";
import { ALL_DISPATCH_TOOLS as CATALOGUE_TOOLS } from "./provider-catalogue";
import type { Engagement, ScopeTarget } from "./types";

/** CE tools that can be dispatched (dry-run always; live when runners are up). */
export type DispatchTool = CatalogueDispatchTool;

export const ALL_DISPATCH_TOOLS: readonly DispatchTool[] = CATALOGUE_TOOLS;

export type DispatchJobStatus =
  "queued" | "running" | "succeeded" | "failed" | "skipped";

export type DispatchJob = {
  readonly jobId: string;
  readonly engagementId: string;
  readonly tenantId: string;
  readonly tool: DispatchTool;
  readonly target: string;
  readonly status: DispatchJobStatus;
  readonly dryRun: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly artefactPath?: string;
  readonly error?: string;
  readonly commandPreview: string;
};

export type ExecResult = {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
};

export type ExecFn = (
  command: string,
  args: readonly string[],
  options?: { readonly timeoutMs?: number },
) => Promise<ExecResult>;

export function resolveApztoolsRoot(): string {
  return process.env.APZTOOLS_ROOT?.trim() || join("/home/ubuntu/apztools");
}

export function securityWorkRoot(): string {
  return join(resolveApztoolsRoot(), "security");
}

export function runnerServiceName(tool: DispatchTool): string {
  switch (tool) {
    case "trivy":
      return "trivy-runner";
    case "zap":
      return "zap-runner";
    case "semgrep":
      return "semgrep-runner";
    case "nuclei":
      return "nuclei-runner";
    case "gitleaks":
      return "gitleaks-runner";
    case "syft":
      return "syft-runner";
    case "grype":
      return "grype-runner";
    case "osv":
      return "osv-runner";
    case "checkov":
      return "checkov-runner";
    case "nmap":
      return "nmap-runner";
    case "testssl":
      return "testssl-runner";
    case "prowler":
      return "prowler-runner";
    case "kubebench":
      return "kubebench-runner";
    case "schemathesis":
      return "schemathesis-runner";
    case "mobsf":
      return "mobsf-runner";
  }
}

const WEB_TOOLS: ReadonlySet<DispatchTool> = new Set([
  "zap",
  "nuclei",
  "nmap",
  "testssl",
  "schemathesis",
]);

const FS_TOOLS: ReadonlySet<DispatchTool> = new Set([
  "trivy",
  "semgrep",
  "gitleaks",
  "syft",
  "grype",
  "osv",
  "checkov",
  "prowler",
  "kubebench",
  "mobsf",
]);

/** Target must match a scope identifier (exact or URL prefix for web/api). */
export function assertTargetInScope(
  target: string,
  scope: readonly ScopeTarget[],
): void {
  const t = target.trim();
  if (!t) {
    throw new Error("Dispatch target is required.");
  }
  const ok = scope.some((s) => {
    const id = s.identifier.trim();
    if (!id) return false;
    if (id === t) return true;
    if (t.startsWith(id) || id.startsWith(t)) return true;
    try {
      const a = new URL(t);
      const b = new URL(id);
      return a.origin === b.origin;
    } catch {
      return false;
    }
  });
  if (!ok) {
    throw new Error(
      "Target is outside engagement scope. Add it to scope or choose an authorised target.",
    );
  }
}

export function pickDefaultTarget(
  tool: DispatchTool,
  scope: readonly ScopeTarget[],
): string | undefined {
  if (tool === "mobsf") {
    const mobile = scope.find((s) => s.kind === "mobile");
    return mobile?.identifier ?? "/work/jobs/mobsf";
  }
  if (FS_TOOLS.has(tool)) {
    const repo = scope.find((s) => s.kind === "repository");
    if (repo) return repo.identifier;
    if (tool === "nmap" || tool === "testssl") {
      const host = scope.find(
        (s) => s.kind === "host" || s.kind === "domain" || s.kind === "web_application",
      );
      return host?.identifier;
    }
    return "/shared/repos";
  }
  const web = scope.find(
    (s) =>
      s.kind === "web_application" ||
      s.kind === "api" ||
      s.kind === "domain" ||
      s.kind === "host",
  );
  return web?.identifier;
}

function fsPath(target: string): string {
  return target.startsWith("/") ? target : `/shared/repos/${target}`;
}

function composeBase(composeFile: string, service: string): string[] {
  return ["compose", "-f", composeFile, "-p", "apzqep-pentest", "exec", "-T", service];
}

export function buildDockerExecArgs(input: {
  readonly tool: DispatchTool;
  readonly target: string;
  readonly jobId: string;
  readonly composeFile: string;
}): { readonly args: string[]; readonly artefactRel: string } {
  const service = runnerServiceName(input.tool);
  const base = composeBase(input.composeFile, service);
  const path = fsPath(input.target);

  switch (input.tool) {
    case "zap": {
      const artefactRel = `out/zap/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "/zap/zap-baseline.py",
          "-t",
          input.target,
          "-J",
          `/zap/wrk/${input.jobId}.json`,
        ],
      };
    }
    case "trivy": {
      const artefactRel = `out/trivy/${input.jobId}.sarif`;
      return {
        artefactRel,
        args: [
          ...base,
          "trivy",
          "fs",
          "--format",
          "sarif",
          "--output",
          `/work/${artefactRel}`,
          path,
        ],
      };
    }
    case "semgrep": {
      const artefactRel = `out/semgrep/${input.jobId}.sarif`;
      return {
        artefactRel,
        args: [
          ...base,
          "semgrep",
          "scan",
          "--config",
          "auto",
          "--sarif",
          "--output",
          `/work/${artefactRel}`,
          path,
        ],
      };
    }
    case "nuclei": {
      const artefactRel = `out/nuclei/${input.jobId}.jsonl`;
      return {
        artefactRel,
        args: [
          ...base,
          "nuclei",
          "-u",
          input.target,
          "-silent",
          "-jsonl",
          "-o",
          `/work/${artefactRel}`,
        ],
      };
    }
    case "gitleaks": {
      const artefactRel = `out/gitleaks/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "gitleaks",
          "detect",
          "--source",
          path,
          "--report-format",
          "json",
          "--report-path",
          `/work/${artefactRel}`,
          "--no-git",
        ],
      };
    }
    case "syft": {
      const artefactRel = `out/syft/${input.jobId}.json`;
      return {
        artefactRel,
        args: [...base, "/syft", path, "-o", `json=/work/${artefactRel}`],
      };
    }
    case "grype": {
      const artefactRel = `out/grype/${input.jobId}.json`;
      return {
        artefactRel,
        args: [...base, "/grype", path, "-o", "json", `--file=/work/${artefactRel}`],
      };
    }
    case "osv": {
      const artefactRel = `out/osv/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "osv-scanner",
          "--format",
          "json",
          "--output",
          `/work/${artefactRel}`,
          path,
        ],
      };
    }
    case "checkov": {
      const artefactRel = `out/checkov/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "checkov",
          "-d",
          path,
          "-o",
          "json",
          "--output-file-path",
          `/work/${artefactRel}`,
          "--soft-fail",
        ],
      };
    }
    case "nmap": {
      const artefactRel = `out/nmap/${input.jobId}.xml`;
      let host = input.target;
      try {
        host = new URL(input.target).hostname;
      } catch {
        /* host/ip as-is */
      }
      return {
        artefactRel,
        args: [...base, "nmap", "-sV", "-oX", `/work/${artefactRel}`, host],
      };
    }
    case "testssl": {
      const artefactRel = `out/testssl/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "testssl.sh",
          "--jsonfile",
          `/work/${artefactRel}`,
          "--quiet",
          input.target,
        ],
      };
    }
    case "prowler": {
      const artefactRel = `out/prowler/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "prowler",
          "aws",
          "-M",
          "json-ocsf",
          "-o",
          `/work/${artefactRel}`,
        ],
      };
    }
    case "kubebench": {
      const artefactRel = `out/kubebench/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "kube-bench",
          "run",
          "--json",
          `--outputfile=/work/${artefactRel}`,
        ],
      };
    }
    case "schemathesis": {
      const artefactRel = `out/schemathesis/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "schemathesis",
          "run",
          input.target,
          "--report",
          "junit",
          `--report-junit-path=/work/${artefactRel}`,
        ],
      };
    }
    case "mobsf": {
      // MobSF is a long-lived API/UI (:8000). Dispatch validates runner health
      // and writes a job marker; operators upload APK/IPA then ingest JSON.
      const artefactRel = `out/mobsf/${input.jobId}.json`;
      return {
        artefactRel,
        args: [
          ...base,
          "curl",
          "-sf",
          "http://127.0.0.1:8000/",
          "-o",
          "/dev/null",
          "-w",
          "mobsf-ok",
        ],
      };
    }
  }
}

export const defaultExecFn: ExecFn = (command, args, options) =>
  new Promise((resolve) => {
    const child = spawn(command, [...args], {
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    const timer =
      options?.timeoutMs && options.timeoutMs > 0
        ? setTimeout(() => {
            child.kill("SIGKILL");
            stderr += "\n[timeout]";
          }, options.timeoutMs)
        : undefined;
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString("utf8");
    });
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });

export function prepareDispatchJob(input: {
  readonly jobId: string;
  readonly engagement: Engagement;
  readonly tool: DispatchTool;
  readonly target: string;
  readonly dryRun: boolean;
  readonly composeFile?: string;
}): {
  readonly job: DispatchJob;
  readonly dockerArgs: string[];
  readonly artefactAbs: string;
} {
  if (input.engagement.roe.status !== "approved") {
    throw new Error("Rules of Engagement must be approved before dispatch.");
  }
  if (input.engagement.scope.length < 1) {
    throw new Error("Engagement scope is empty.");
  }

  if (WEB_TOOLS.has(input.tool)) {
    assertTargetInScope(input.target, input.engagement.scope);
  }
  if (input.tool === "mobsf") {
    const hasMobile = input.engagement.scope.some((s) => s.kind === "mobile");
    if (!hasMobile && !input.target.includes("mobsf")) {
      const mobileLike =
        input.target.endsWith(".apk") ||
        input.target.endsWith(".ipa") ||
        input.target.endsWith(".zip");
      if (!mobileLike) {
        throw new Error(
          "MobSF requires a mobile scope target (APK/IPA path) or .apk/.ipa/.zip target.",
        );
      }
      assertTargetInScope(input.target, input.engagement.scope);
    }
  }

  const composeFile =
    input.composeFile ??
    join(
      process.cwd().includes("apps/web")
        ? join(process.cwd(), "../../infrastructure/docker/clusters")
        : join(process.cwd(), "infrastructure/docker/clusters"),
      "docker-compose.pentest-cluster.yml",
    );

  const built = buildDockerExecArgs({
    tool: input.tool,
    target: input.target,
    jobId: input.jobId,
    composeFile,
  });

  const artefactAbs = join(securityWorkRoot(), built.artefactRel);
  const ts = new Date().toISOString();
  const job: DispatchJob = {
    jobId: input.jobId,
    engagementId: input.engagement.engagementId,
    tenantId: input.engagement.tenantId,
    tool: input.tool,
    target: input.target,
    status: input.dryRun ? "skipped" : "queued",
    dryRun: input.dryRun,
    createdAt: ts,
    updatedAt: ts,
    artefactPath: artefactAbs,
    commandPreview: `docker ${built.args.join(" ")}`,
  };

  const jobsDir = join(securityWorkRoot(), "jobs");
  mkdirSync(jobsDir, { recursive: true });
  mkdirSync(join(securityWorkRoot(), "out", input.tool), { recursive: true });
  writeFileSync(
    join(jobsDir, `${input.jobId}.json`),
    JSON.stringify(job, null, 2),
    "utf8",
  );

  // MobSF: write operator instructions alongside the job
  if (input.tool === "mobsf") {
    writeFileSync(
      join(securityWorkRoot(), "out", "mobsf", `${input.jobId}.instructions.md`),
      [
        `# MobSF job ${input.jobId}`,
        ``,
        `1. Open http://127.0.0.1:8000 (MobSF CE)`,
        `2. Upload authorised APK/IPA from scope: \`${input.target}\``,
        `3. Export JSON report → \`security/out/mobsf/${input.jobId}.json\``,
        `4. Ingest via APZPEN provider ingest (format: mobsf)`,
        ``,
      ].join("\n"),
      "utf8",
    );
  }

  return { job, dockerArgs: built.args, artefactAbs };
}

export async function runPreparedDispatch(input: {
  readonly job: DispatchJob;
  readonly dockerArgs: string[];
  readonly artefactAbs: string;
  readonly execFn?: ExecFn;
  readonly timeoutMs?: number;
}): Promise<DispatchJob> {
  if (input.job.dryRun) {
    return {
      ...input.job,
      status: "skipped",
      updatedAt: new Date().toISOString(),
    };
  }

  const execFn = input.execFn ?? defaultExecFn;
  const result = await execFn("docker", input.dockerArgs, {
    timeoutMs: input.timeoutMs ?? 180_000,
  });

  // ZAP baseline exits non-zero when findings exist — still ok if artefact exists
  const artefactOk = existsSync(input.artefactAbs);
  const mobsfOk =
    input.job.tool === "mobsf" &&
    (result.code === 0 || result.stdout.includes("mobsf-ok"));
  const succeeded =
    artefactOk || result.code === 0 || input.job.tool === "zap" || mobsfOk;

  const next: DispatchJob = {
    ...input.job,
    status:
      succeeded && (artefactOk || result.code === 0 || mobsfOk)
        ? "succeeded"
        : "failed",
    updatedAt: new Date().toISOString(),
    error: succeeded
      ? undefined
      : (result.stderr || result.stdout || `exit ${result.code}`).slice(0, 2000),
    artefactPath: artefactOk ? input.artefactAbs : input.job.artefactPath,
  };

  writeFileSync(
    join(securityWorkRoot(), "jobs", `${input.job.jobId}.json`),
    JSON.stringify(next, null, 2),
    "utf8",
  );
  return next;
}

export function readArtefactText(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  return readFileSync(path, "utf8");
}

export function isDispatchTool(value: string): value is DispatchTool {
  return (ALL_DISPATCH_TOOLS as readonly string[]).includes(value);
}

export function listDispatchJobs(input?: {
  readonly engagementId?: string;
  readonly tenantId?: string;
  readonly limit?: number;
}): readonly DispatchJob[] {
  const jobsDir = join(securityWorkRoot(), "jobs");
  if (!existsSync(jobsDir)) return [];
  const files = readdirSync(jobsDir).filter((f) => f.endsWith(".json"));
  const jobs: DispatchJob[] = [];
  for (const file of files) {
    try {
      const raw = readFileSync(join(jobsDir, file), "utf8");
      const parsed = JSON.parse(raw) as DispatchJob;
      if (input?.engagementId && parsed.engagementId !== input.engagementId) {
        continue;
      }
      if (input?.tenantId && parsed.tenantId !== input.tenantId) {
        continue;
      }
      jobs.push(parsed);
    } catch {
      // skip corrupt job files
    }
  }
  jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const limit = input?.limit ?? 50;
  return jobs.slice(0, limit);
}

export function getDispatchJob(jobId: string): DispatchJob | undefined {
  const path = join(securityWorkRoot(), "jobs", `${jobId}.json`);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as DispatchJob;
  } catch {
    return undefined;
  }
}

export function formatForDispatchTool(tool: DispatchTool): ProviderIngestFormatHint {
  if (tool === "zap") return "zap";
  if (tool === "trivy" || tool === "semgrep") return "sarif";
  if (tool === "nuclei") return "nuclei_jsonl";
  if (tool === "gitleaks") return "gitleaks";
  if (tool === "mobsf") return "mobsf";
  if (
    tool === "checkov" ||
    tool === "grype" ||
    tool === "osv" ||
    tool === "prowler" ||
    tool === "kubebench"
  ) {
    return "simplified";
  }
  return "auto";
}

/** Avoid circular import with provider-ingest — keep as string union mirror. */
export type ProviderIngestFormatHint =
  "auto" | "zap" | "sarif" | "nuclei_jsonl" | "gitleaks" | "mobsf" | "simplified";
