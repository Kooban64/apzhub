import type { WorkflowMetadata } from "../models/canonical";
import type { GitHubWorkflowRecord } from "../internal/github-actions-api-types";

export function mapGitHubWorkflow(record: GitHubWorkflowRecord): WorkflowMetadata {
  return {
    id: String(record.id),
    name: record.name,
    path: record.path,
    state: record.state,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    htmlUrl: record.html_url,
  };
}
