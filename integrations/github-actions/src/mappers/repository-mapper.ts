import type { RepositoryMetadata } from "../models/canonical";
import type { GitHubRepositoryRecord } from "../internal/github-actions-api-types";

export function mapGitHubRepository(
  record: GitHubRepositoryRecord,
): RepositoryMetadata {
  return {
    id: String(record.id),
    name: record.name,
    fullName: record.full_name,
    private: record.private,
    htmlUrl: record.html_url,
    description: record.description ?? undefined,
    defaultBranch: record.default_branch,
    ownerLogin: record.owner?.login,
  };
}
