import type { PipelineEnvironment } from "@apzhub/testing-contracts";

import type { GitHubEnvironmentRecord } from "../internal/github-actions-api-types";

export function mapGitHubEnvironment(
  record: GitHubEnvironmentRecord,
): PipelineEnvironment {
  return {
    name: record.name,
    url: record.url ?? record.html_url,
  };
}
