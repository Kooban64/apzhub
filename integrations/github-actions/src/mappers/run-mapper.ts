import type {
  PipelineEnvironment,
  PipelineSource,
  PipelineTrigger,
} from "@apzhub/testing-contracts";

import type { PipelineRunMetadata } from "../models/canonical";
import type { GitHubWorkflowRunRecord } from "../internal/github-actions-api-types";
import { mapGitHubActionsStatus } from "./status-mapper";

function durationMs(startedAt?: string, completedAt?: string): number | undefined {
  if (!startedAt || !completedAt) return undefined;
  const start = Date.parse(startedAt);
  const end = Date.parse(completedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return undefined;
  return end - start;
}

export function mapGitHubRunEnvironment(
  record: GitHubWorkflowRunRecord,
): PipelineEnvironment {
  return {
    name: record.environment,
    branch: record.head_branch ?? undefined,
    commit: record.head_sha ?? record.head_commit?.id,
    buildNumber:
      record.run_number !== undefined ? String(record.run_number) : undefined,
    extra: record.path ? { workflowPath: record.path } : undefined,
  };
}

export function mapGitHubRunSource(record: GitHubWorkflowRunRecord): PipelineSource {
  return {
    repository: record.repository?.full_name,
    branch: record.head_branch ?? undefined,
    commit: record.head_sha ?? record.head_commit?.id,
  };
}

export function mapGitHubRunTrigger(
  record: GitHubWorkflowRunRecord,
): PipelineTrigger | undefined {
  if (!record.event) return undefined;
  return {
    kind: record.event,
    actorRef: record.actor?.login ?? record.triggering_actor?.login,
  };
}

export function mapGitHubWorkflowRun(
  record: GitHubWorkflowRunRecord,
): PipelineRunMetadata {
  const startedAt = record.run_started_at ?? record.created_at;
  const completedAt = record.status === "completed" ? record.updated_at : undefined;
  return {
    id: String(record.id),
    name: record.name ?? record.display_title ?? undefined,
    status: mapGitHubActionsStatus(record.status, record.conclusion),
    workflowId: String(record.workflow_id),
    runNumber: record.run_number,
    event: record.event,
    htmlUrl: record.html_url,
    startedAt,
    completedAt,
    durationMs: durationMs(startedAt, completedAt),
    branch: record.head_branch ?? undefined,
    commit: record.head_sha ?? record.head_commit?.id,
    actorRef: record.actor?.login ?? record.triggering_actor?.login,
    environment: mapGitHubRunEnvironment(record),
    source: mapGitHubRunSource(record),
    trigger: mapGitHubRunTrigger(record),
  };
}
