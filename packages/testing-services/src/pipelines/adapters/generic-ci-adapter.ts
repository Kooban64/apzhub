import type {
  CanonicalPipelineResult,
  PipelineEnvironment,
  PipelineJob,
  PipelineResultAdapter,
  PipelineStage,
  PipelineSummary,
} from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";

function asObject(input: unknown): Record<string, unknown> {
  if (typeof input === "string") {
    const parsed: unknown = JSON.parse(input);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new DomainRuleError("INVALID_PAYLOAD", "Generic CI payload must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  }
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  throw new DomainRuleError("INVALID_PAYLOAD", "Generic CI payload must be a JSON object");
}

function readString(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return undefined;
}

function readNumber(
  obj: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function normalizeStatus(raw: string | undefined): CanonicalPipelineResult["status"] {
  if (!raw) return "unknown";
  const lower = raw.toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, CanonicalPipelineResult["status"]> = {
    success: "passed",
    successful: "passed",
    pass: "passed",
    passed: "passed",
    failure: "failed",
    fail: "failed",
    failed: "failed",
    error: "failed",
    errored: "failed",
    canceled: "cancelled",
    cancelled: "cancelled",
    running: "running",
    in_progress: "running",
    queued: "queued",
    pending: "queued",
    skipped: "skipped",
    timed_out: "timed_out",
    timeout: "timed_out",
  };
  const mapped = aliases[lower] ?? lower;
  return isPipelineRunStatus(mapped) ? mapped : "unknown";
}

function parseJobs(raw: unknown): PipelineJob[] {
  if (!Array.isArray(raw)) return [];
  const jobs: PipelineJob[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const name = readString(obj, "name", "title", "key");
    if (!name) continue;
    jobs.push({
      key: readString(obj, "key", "id"),
      name,
      status: normalizeStatus(readString(obj, "status")),
      stageKey: readString(obj, "stageKey", "stage"),
      durationMs: readNumber(obj, "durationMs", "duration"),
      startedAt: readString(obj, "startedAt"),
      completedAt: readString(obj, "completedAt"),
      runnerLabel: readString(obj, "runnerLabel", "runner"),
      message: readString(obj, "message"),
      logRef: readString(obj, "logRef"),
      steps: Array.isArray(obj.steps)
        ? obj.steps
            .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
            .map((s) => ({
              key: readString(s, "key", "id"),
              name: readString(s, "name", "title") ?? "step",
              status: normalizeStatus(readString(s, "status")),
              durationMs: readNumber(s, "durationMs", "duration"),
              startedAt: readString(s, "startedAt"),
              completedAt: readString(s, "completedAt"),
              message: readString(s, "message"),
              logRef: readString(s, "logRef"),
            }))
        : undefined,
    });
  }
  return jobs;
}

function parseStages(raw: unknown, jobs: readonly PipelineJob[]): PipelineStage[] {
  if (Array.isArray(raw)) {
    const stages: PipelineStage[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const name = readString(obj, "name", "title", "key");
      if (!name) continue;
      const stageJobs = Array.isArray(obj.jobs)
        ? parseJobs(obj.jobs)
        : jobs.filter((j) => j.stageKey === readString(obj, "key", "name"));
      stages.push({
        key: readString(obj, "key", "id"),
        name,
        status: normalizeStatus(readString(obj, "status")),
        durationMs: readNumber(obj, "durationMs", "duration"),
        startedAt: readString(obj, "startedAt"),
        completedAt: readString(obj, "completedAt"),
        order: readNumber(obj, "order"),
        jobs: stageJobs,
      });
    }
    return stages;
  }
  if (jobs.length === 0) return [];
  return [
    {
      name: "default",
      status: jobs.every((j) => j.status === "passed")
        ? "passed"
        : jobs.some((j) => j.status === "failed")
          ? "failed"
          : "unknown",
      jobs: [...jobs],
    },
  ];
}

export function createGenericCiAdapter(): PipelineResultAdapter {
  return {
    kind: "generic_ci",
    version: "1.0.0",
    canParse(input: unknown): boolean {
      try {
        const obj = asObject(input);
        const provider = readString(obj, "provider", "providerKind", "kind");
        if (provider && provider !== "generic_ci") return false;
        return (
          typeof obj.externalRunRef === "string" ||
          Array.isArray(obj.stages) ||
          Array.isArray(obj.jobs) ||
          typeof obj.status === "string"
        );
      } catch {
        return false;
      }
    },
    parse(input: unknown): CanonicalPipelineResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Generic CI requires a JSON object with status and/or stages/jobs",
        );
      }
      const obj = asObject(input);
      const jobs = parseJobs(obj.jobs);
      const stages = parseStages(obj.stages, jobs);
      const flatJobs =
        jobs.length > 0
          ? jobs
          : stages.flatMap((s) => s.jobs ?? []);
      const status = normalizeStatus(readString(obj, "status", "overallStatus"));
      const summaryRaw =
        typeof obj.summary === "object" && obj.summary
          ? (obj.summary as Record<string, unknown>)
          : {};
      const summary: PipelineSummary = {
        headline: readString(summaryRaw, "headline"),
        overallStatus: normalizeStatus(
          readString(summaryRaw, "overallStatus", "status") ?? status,
        ),
        passed: readNumber(summaryRaw, "passed"),
        failed: readNumber(summaryRaw, "failed"),
        skipped: readNumber(summaryRaw, "skipped"),
        cancelled: readNumber(summaryRaw, "cancelled"),
        notes: readString(summaryRaw, "notes"),
      };
      const environment: PipelineEnvironment =
        typeof obj.environment === "object" && obj.environment
          ? {
              name: readString(obj.environment as Record<string, unknown>, "name"),
              url: readString(obj.environment as Record<string, unknown>, "url"),
              branch: readString(
                obj.environment as Record<string, unknown>,
                "branch",
              ),
              commit: readString(
                obj.environment as Record<string, unknown>,
                "commit",
              ),
              tag: readString(obj.environment as Record<string, unknown>, "tag"),
              buildNumber: readString(
                obj.environment as Record<string, unknown>,
                "buildNumber",
                "build",
              ),
              region: readString(
                obj.environment as Record<string, unknown>,
                "region",
              ),
              os: readString(obj.environment as Record<string, unknown>, "os"),
              arch: readString(obj.environment as Record<string, unknown>, "arch"),
              nodeVersion: readString(
                obj.environment as Record<string, unknown>,
                "nodeVersion",
              ),
              extra:
                typeof (obj.environment as Record<string, unknown>).extra ===
                "object"
                  ? ((obj.environment as Record<string, unknown>).extra as Record<
                      string,
                      string
                    >)
                  : undefined,
            }
          : {
              branch: readString(obj, "branch"),
              commit: readString(obj, "commit"),
            };

      const externalRunRef =
        readString(obj, "externalRunRef", "runId", "id") ??
        `generic-ci-${Date.now()}`;

      return {
        providerKind: "generic_ci",
        externalRunRef,
        externalPipelineRef: readString(
          obj,
          "externalPipelineRef",
          "pipelineRef",
        ),
        pipelineKey: readString(obj, "pipelineKey", "key"),
        pipelineName: readString(obj, "pipelineName", "name"),
        status,
        stages,
        jobs: flatJobs,
        artifacts: Array.isArray(obj.artifacts)
          ? (obj.artifacts as CanonicalPipelineResult["artifacts"])
          : [],
        environment,
        approvals: Array.isArray(obj.approvals)
          ? (obj.approvals as CanonicalPipelineResult["approvals"])
          : [],
        events: Array.isArray(obj.events)
          ? (obj.events as CanonicalPipelineResult["events"])
          : [],
        summary,
        metrics:
          typeof obj.metrics === "object" && obj.metrics
            ? (obj.metrics as CanonicalPipelineResult["metrics"])
            : {
                jobCount: flatJobs.length,
                stageCount: stages.length,
                passedJobs: flatJobs.filter((j) => j.status === "passed").length,
                failedJobs: flatJobs.filter((j) => j.status === "failed").length,
              },
        logs: Array.isArray(obj.logs)
          ? (obj.logs as CanonicalPipelineResult["logs"])
          : [],
        variables: Array.isArray(obj.variables)
          ? (obj.variables as CanonicalPipelineResult["variables"])
          : [],
        secretRefs: Array.isArray(obj.secretRefs)
          ? (obj.secretRefs as CanonicalPipelineResult["secretRefs"])
          : [],
        trigger:
          typeof obj.trigger === "object" && obj.trigger
            ? (obj.trigger as CanonicalPipelineResult["trigger"])
            : undefined,
        source:
          typeof obj.source === "object" && obj.source
            ? (obj.source as CanonicalPipelineResult["source"])
            : undefined,
        startedAt: readString(obj, "startedAt"),
        completedAt: readString(obj, "completedAt"),
        durationMs: readNumber(obj, "durationMs"),
        correlationId: readString(obj, "correlationId"),
        metadata:
          typeof obj.metadata === "object" && obj.metadata
            ? (obj.metadata as Record<string, unknown>)
            : undefined,
      };
    },
  };
}
