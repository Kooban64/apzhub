import type {
  CanonicalPipelineResult,
  PipelineEnvironment,
  PipelineJob,
  PipelineResultAdapter,
  PipelineSummary,
} from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

import { mapGitHubActionsStatus } from "./mappers/status-mapper";

const ADAPTER_VERSION = "0.1.0";

function asObject(input: unknown): Record<string, unknown> {
  if (typeof input === "string") {
    const parsed: unknown = JSON.parse(input);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("GitHub Actions payload must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  }
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  throw new Error("GitHub Actions payload must be a JSON object");
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

function looksLikeGitHubWorkflowRun(obj: Record<string, unknown>): boolean {
  const provider = readString(obj, "provider", "providerKind", "kind");
  if (provider && provider !== "github_actions" && provider !== "github-actions") {
    return false;
  }
  if (provider === "github_actions" || provider === "github-actions") return true;

  // Native GitHub workflow_run shape
  if (
    typeof obj.workflow_id === "number" ||
    typeof obj.workflow_id === "string" ||
    Array.isArray(obj.workflow_runs)
  ) {
    return true;
  }

  // Nested under workflow_run
  if (
    obj.workflow_run &&
    typeof obj.workflow_run === "object" &&
    !Array.isArray(obj.workflow_run)
  ) {
    return true;
  }

  return (
    typeof obj.head_sha === "string" &&
    (typeof obj.status === "string" || typeof obj.conclusion === "string") &&
    (typeof obj.id === "number" || typeof obj.id === "string")
  );
}

function parseJobs(raw: unknown): PipelineJob[] {
  if (!Array.isArray(raw)) return [];
  const jobs: PipelineJob[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const name = readString(obj, "name");
    if (!name) continue;
    const status = mapGitHubActionsStatus(
      readString(obj, "status"),
      readString(obj, "conclusion"),
    );
    jobs.push({
      key: obj.id !== undefined ? String(obj.id) : readString(obj, "key"),
      name,
      status,
      durationMs: readNumber(obj, "durationMs"),
      startedAt: readString(obj, "started_at", "startedAt"),
      completedAt: readString(obj, "completed_at", "completedAt"),
      runnerLabel: readString(obj, "runner_name", "runnerLabel"),
      steps: Array.isArray(obj.steps)
        ? obj.steps
            .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
            .map((s) => ({
              key:
                s.number !== undefined ? String(s.number) : readString(s, "key", "id"),
              name: readString(s, "name") ?? "step",
              status: mapGitHubActionsStatus(
                readString(s, "status"),
                readString(s, "conclusion"),
              ),
              startedAt: readString(s, "started_at", "startedAt"),
              completedAt: readString(s, "completed_at", "completedAt"),
            }))
        : undefined,
    });
  }
  return jobs;
}

/**
 * Parse-only PipelineResultAdapter for GitHub-shaped workflow run payloads.
 * Does not perform network I/O.
 */
export function createGitHubActionsPipelineResultAdapter(): PipelineResultAdapter {
  return {
    kind: "github_actions",
    version: ADAPTER_VERSION,
    canParse(input: unknown): boolean {
      try {
        const root = asObject(input);
        if (Array.isArray(root.workflow_runs)) {
          const first = root.workflow_runs[0];
          if (first && typeof first === "object") {
            return looksLikeGitHubWorkflowRun(first as Record<string, unknown>);
          }
        }
        const obj =
          root.workflow_run && typeof root.workflow_run === "object"
            ? (root.workflow_run as Record<string, unknown>)
            : root;
        return looksLikeGitHubWorkflowRun(obj);
      } catch {
        return false;
      }
    },
    parse(input: unknown): CanonicalPipelineResult {
      if (!this.canParse(input)) {
        throw new Error(
          "GitHub Actions pipeline result adapter requires a GitHub workflow run shaped payload",
        );
      }
      const root = asObject(input);
      const obj =
        root.workflow_run && typeof root.workflow_run === "object"
          ? (root.workflow_run as Record<string, unknown>)
          : Array.isArray(root.workflow_runs) &&
              root.workflow_runs[0] &&
              typeof root.workflow_runs[0] === "object"
            ? (root.workflow_runs[0] as Record<string, unknown>)
            : root;

      const jobs = parseJobs(root.jobs ?? obj.jobs);
      const status = mapGitHubActionsStatus(
        readString(obj, "status"),
        readString(obj, "conclusion"),
      );
      const overall = isPipelineRunStatus(status) ? status : ("unknown" as const);

      const environment: PipelineEnvironment = {
        branch: readString(obj, "head_branch", "branch"),
        commit: readString(obj, "head_sha", "commit"),
        buildNumber:
          obj.run_number !== undefined
            ? String(obj.run_number)
            : readString(obj, "buildNumber"),
        name: readString(obj, "environment"),
      };

      const summary: PipelineSummary = {
        headline:
          readString(obj, "display_title", "name") ??
          `Workflow run ${readString(obj, "id") ?? "unknown"}`,
        overallStatus: overall,
        passed: jobs.filter((j) => j.status === "passed").length,
        failed: jobs.filter((j) => j.status === "failed").length,
        skipped: jobs.filter((j) => j.status === "skipped").length,
        cancelled: jobs.filter((j) => j.status === "cancelled").length,
        notes: readString(obj, "html_url"),
      };

      const externalRunRef =
        obj.id !== undefined
          ? String(obj.id)
          : (readString(obj, "externalRunRef", "id") ?? `github-actions-${Date.now()}`);

      const startedAt = readString(obj, "run_started_at", "created_at", "startedAt");
      const completedAt =
        readString(obj, "status") === "completed"
          ? readString(obj, "updated_at", "completedAt")
          : readString(obj, "completedAt");

      return {
        providerKind: "github_actions",
        externalRunRef,
        externalPipelineRef:
          obj.workflow_id !== undefined
            ? String(obj.workflow_id)
            : readString(obj, "externalPipelineRef", "workflow_id"),
        pipelineKey:
          obj.workflow_id !== undefined
            ? String(obj.workflow_id)
            : readString(obj, "pipelineKey"),
        pipelineName: readString(obj, "name", "display_title", "pipelineName"),
        status: overall,
        stages:
          jobs.length > 0
            ? [
                {
                  name: "jobs",
                  status: overall,
                  jobs,
                },
              ]
            : [],
        jobs,
        artifacts: Array.isArray(root.artifacts)
          ? (root.artifacts as CanonicalPipelineResult["artifacts"])
          : [],
        environment,
        approvals: Array.isArray(root.approvals)
          ? (root.approvals as CanonicalPipelineResult["approvals"])
          : [],
        events: [],
        summary,
        metrics: {
          jobCount: jobs.length,
          stageCount: jobs.length > 0 ? 1 : 0,
          passedJobs: jobs.filter((j) => j.status === "passed").length,
          failedJobs: jobs.filter((j) => j.status === "failed").length,
        },
        logs: Array.isArray(root.logs)
          ? (root.logs as CanonicalPipelineResult["logs"])
          : [],
        variables: [],
        secretRefs: [],
        trigger: readString(obj, "event")
          ? {
              kind: readString(obj, "event")!,
              actorRef:
                typeof obj.actor === "object" && obj.actor
                  ? readString(obj.actor as Record<string, unknown>, "login")
                  : undefined,
            }
          : undefined,
        source: {
          repository:
            typeof obj.repository === "object" && obj.repository
              ? readString(obj.repository as Record<string, unknown>, "full_name")
              : undefined,
          branch: environment.branch,
          commit: environment.commit,
        },
        startedAt,
        completedAt,
        correlationId: readString(root, "correlationId"),
        metadata: {
          path: readString(obj, "path"),
          htmlUrl: readString(obj, "html_url"),
        },
      };
    },
  };
}
