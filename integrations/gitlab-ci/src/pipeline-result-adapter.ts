import type {
  CanonicalPipelineResult,
  PipelineEnvironment,
  PipelineJob,
  PipelineResultAdapter,
  PipelineSummary,
} from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

import { mapGitLabCiStatus } from "./mappers/status-mapper";

const ADAPTER_VERSION = "0.1.0";

function asObject(input: unknown): Record<string, unknown> {
  if (typeof input === "string") {
    const parsed: unknown = JSON.parse(input);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("GitLab CI payload must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  }
  if (input && typeof input === "object" && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }
  throw new Error("GitLab CI payload must be a JSON object");
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

function looksLikeGitLabPipeline(obj: Record<string, unknown>): boolean {
  const provider = readString(obj, "provider", "providerKind", "kind");
  if (provider && provider !== "gitlab_ci" && provider !== "gitlab-ci") {
    return false;
  }
  if (provider === "gitlab_ci" || provider === "gitlab-ci") return true;

  // Native GitLab pipeline shape
  if (
    (typeof obj.id === "number" || typeof obj.id === "string") &&
    typeof obj.status === "string" &&
    (typeof obj.sha === "string" ||
      typeof obj.ref === "string" ||
      typeof obj.web_url === "string" ||
      typeof obj.project_id === "number" ||
      typeof obj.project_id === "string")
  ) {
    return true;
  }

  if (
    obj.pipeline &&
    typeof obj.pipeline === "object" &&
    !Array.isArray(obj.pipeline)
  ) {
    return looksLikeGitLabPipeline(obj.pipeline as Record<string, unknown>);
  }

  return false;
}

function parseJobs(raw: unknown): PipelineJob[] {
  if (!Array.isArray(raw)) return [];
  const jobs: PipelineJob[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const name = readString(obj, "name");
    if (!name) continue;
    const status = mapGitLabCiStatus(readString(obj, "status"));
    jobs.push({
      key: obj.id !== undefined ? String(obj.id) : readString(obj, "key"),
      name,
      status,
      durationMs: readNumber(obj, "duration", "durationMs"),
      startedAt: readString(obj, "started_at", "startedAt"),
      completedAt: readString(obj, "finished_at", "completedAt"),
      runnerLabel: readString(obj, "runner", "runnerLabel", "tag_list"),
      steps: Array.isArray(obj.steps)
        ? obj.steps
            .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
            .map((s) => ({
              key: s.id !== undefined ? String(s.id) : readString(s, "key", "name"),
              name: readString(s, "name") ?? "step",
              status: mapGitLabCiStatus(readString(s, "status")),
              startedAt: readString(s, "started_at", "startedAt"),
              completedAt: readString(s, "finished_at", "completedAt"),
            }))
        : undefined,
    });
  }
  return jobs;
}

/**
 * Parse-only PipelineResultAdapter for GitLab-shaped pipeline payloads.
 * Does not perform network I/O.
 */
export function createGitLabCiPipelineResultAdapter(): PipelineResultAdapter {
  return {
    kind: "gitlab_ci",
    version: ADAPTER_VERSION,
    canParse(input: unknown): boolean {
      try {
        const root = asObject(input);
        if (Array.isArray(root.pipelines)) {
          const first = root.pipelines[0];
          if (first && typeof first === "object") {
            return looksLikeGitLabPipeline(first as Record<string, unknown>);
          }
        }
        const obj =
          root.pipeline && typeof root.pipeline === "object"
            ? (root.pipeline as Record<string, unknown>)
            : root;
        return looksLikeGitLabPipeline(obj);
      } catch {
        return false;
      }
    },
    parse(input: unknown): CanonicalPipelineResult {
      if (!this.canParse(input)) {
        throw new Error(
          "GitLab CI pipeline result adapter requires a GitLab pipeline shaped payload",
        );
      }
      const root = asObject(input);
      const obj =
        root.pipeline && typeof root.pipeline === "object"
          ? (root.pipeline as Record<string, unknown>)
          : Array.isArray(root.pipelines) &&
              root.pipelines[0] &&
              typeof root.pipelines[0] === "object"
            ? (root.pipelines[0] as Record<string, unknown>)
            : root;

      const jobs = parseJobs(root.jobs ?? obj.jobs);
      const status = mapGitLabCiStatus(readString(obj, "status"));
      const overall = isPipelineRunStatus(status) ? status : ("unknown" as const);

      const environment: PipelineEnvironment = {
        branch: readString(obj, "ref", "branch"),
        commit: readString(obj, "sha", "commit"),
        buildNumber:
          obj.iid !== undefined ? String(obj.iid) : readString(obj, "buildNumber"),
        name: readString(obj, "environment", "name"),
      };

      const summary: PipelineSummary = {
        headline:
          readString(obj, "name", "source") ??
          `Pipeline ${readString(obj, "id") ?? "unknown"}`,
        overallStatus: overall,
        passed: jobs.filter((j) => j.status === "passed").length,
        failed: jobs.filter((j) => j.status === "failed").length,
        skipped: jobs.filter((j) => j.status === "skipped").length,
        cancelled: jobs.filter((j) => j.status === "cancelled").length,
        notes: readString(obj, "web_url", "html_url"),
      };

      const externalRunRef =
        obj.id !== undefined
          ? String(obj.id)
          : (readString(obj, "externalRunRef", "id") ?? `gitlab-ci-${Date.now()}`);

      return {
        providerKind: "gitlab_ci",
        externalRunRef,
        externalPipelineRef:
          obj.project_id !== undefined
            ? String(obj.project_id)
            : readString(obj, "externalPipelineRef", "project_id"),
        pipelineKey:
          obj.project_id !== undefined
            ? String(obj.project_id)
            : readString(obj, "pipelineKey"),
        pipelineName: readString(obj, "name", "source", "pipelineName"),
        status: overall,
        stages:
          jobs.length > 0
            ? [
                {
                  name: readString(obj, "stage") ?? "jobs",
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
        trigger: readString(obj, "source")
          ? {
              kind: readString(obj, "source")!,
              actorRef:
                typeof obj.user === "object" && obj.user
                  ? readString(obj.user as Record<string, unknown>, "username", "name")
                  : undefined,
            }
          : undefined,
        source: {
          repository:
            typeof obj.project === "object" && obj.project
              ? readString(
                  obj.project as Record<string, unknown>,
                  "path_with_namespace",
                  "name",
                )
              : undefined,
          branch: environment.branch,
          commit: environment.commit,
        },
        startedAt: readString(obj, "created_at", "started_at", "startedAt"),
        completedAt: readString(obj, "updated_at", "finished_at", "completedAt"),
        correlationId: readString(root, "correlationId"),
        metadata: {
          webUrl: readString(obj, "web_url"),
          tag: obj.tag !== undefined ? String(obj.tag) : undefined,
        },
      };
    },
  };
}
