import type { PipelineApproval } from "@apzhub/testing-contracts";

import type { GitHubApprovalRecord } from "../internal/github-actions-api-types";

function mapApprovalStatus(state?: string): PipelineApproval["status"] {
  const s = (state ?? "").toLowerCase();
  if (s === "approved" || s === "success") return "approved";
  if (s === "rejected" || s === "denied" || s === "failure") return "rejected";
  if (s === "skipped") return "skipped";
  return "pending";
}

export function mapGitHubApproval(record: GitHubApprovalRecord): PipelineApproval {
  return {
    kind: "operations",
    status: mapApprovalStatus(record.state),
    requestedAt: record.created_at,
    decidedAt:
      record.state && record.state !== "pending" ? record.created_at : undefined,
    actorRef: record.user?.login,
    comments: record.comment,
  };
}
