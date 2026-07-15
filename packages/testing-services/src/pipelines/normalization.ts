import type {
  CanonicalPipelineResult,
  PipelineNormalizationService,
  PipelineRunStatus,
} from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

const STATUS_ALIASES: Record<string, PipelineRunStatus> = {
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
  unknown: "unknown",
};

export function createPipelineNormalizationService(): PipelineNormalizationService {
  return {
    normalizeStatus(raw) {
      if (!raw) return "unknown";
      const key = String(raw).toLowerCase().replace(/\s+/g, "_");
      const mapped = STATUS_ALIASES[key] ?? key;
      return isPipelineRunStatus(mapped) ? mapped : "unknown";
    },
    normalizeResult(partial) {
      const normalize = this.normalizeStatus.bind(this);
      const status = normalize(
        typeof partial.status === "string" ? partial.status : undefined,
      );
      const stages = (partial.stages ?? []).map((stage) => ({
        ...stage,
        status: normalize(stage.status),
        jobs: stage.jobs?.map((job) => ({
          ...job,
          status: normalize(job.status),
          steps: job.steps?.map((step) => ({
            ...step,
            status: normalize(step.status),
          })),
        })),
      }));
      const jobs = (partial.jobs ?? []).map((job) => ({
        ...job,
        status: normalize(job.status),
        steps: job.steps?.map((step) => ({
          ...step,
          status: normalize(step.status),
        })),
      }));
      const overall =
        normalize(partial.summary?.overallStatus) !== "unknown"
          ? normalize(partial.summary?.overallStatus)
          : status;
      const result: CanonicalPipelineResult = {
        ...partial,
        providerKind: partial.providerKind,
        externalRunRef: partial.externalRunRef,
        status: overall,
        stages,
        jobs,
        artifacts: partial.artifacts ?? [],
        environment: partial.environment ?? {},
        approvals: partial.approvals ?? [],
        events: partial.events ?? [],
        summary: {
          headline: partial.summary?.headline,
          overallStatus: overall,
          passed: partial.summary?.passed,
          failed: partial.summary?.failed,
          skipped: partial.summary?.skipped,
          cancelled: partial.summary?.cancelled,
          warnings: partial.summary?.warnings,
          failures: partial.summary?.failures,
          retries: partial.summary?.retries,
          notes: partial.summary?.notes,
        },
        logs: partial.logs ?? [],
        variables: partial.variables ?? [],
        secretRefs: partial.secretRefs ?? [],
      };
      return result;
    },
  };
}
