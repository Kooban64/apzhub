import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { GitHubActionsFeatureDetectionResult } from "./types";
import type { GitHubActionsRestClient } from "../internal/github-actions-rest-client";

export interface DetectGitHubActionsFeaturesInput {
  readonly client: GitHubActionsRestClient;
  readonly owner: string;
  readonly repo: string;
  readonly sampleRunId?: string | number;
  readonly clockNow: () => string;
}

/**
 * Probe optional endpoints (approvals, environments). Never fails startup.
 */
export async function detectGitHubActionsFeatures(
  context: IntegrationRequestContext,
  input: DetectGitHubActionsFeaturesInput,
): Promise<GitHubActionsFeatureDetectionResult> {
  let approvalsAvailable = false;
  let environmentsAvailable = false;
  const detections: Array<GitHubActionsFeatureDetectionResult["detections"][number]> =
    [];

  try {
    const envs = await input.client.listEnvironments(context, input.owner, input.repo);
    environmentsAvailable = true;
    detections.push({
      capabilityId: "environments",
      endpoint: `/repos/${input.owner}/${input.repo}/environments`,
      available: true,
      optional: true,
      note: `Detected ${envs.length} environment(s)`,
    });
  } catch {
    detections.push({
      capabilityId: "environments",
      endpoint: `/repos/${input.owner}/${input.repo}/environments`,
      available: false,
      optional: true,
      note: "Environments endpoint unavailable — graceful degrade",
    });
  }

  if (input.sampleRunId !== undefined) {
    try {
      const approvals = await input.client.listApprovals(
        context,
        input.owner,
        input.repo,
        input.sampleRunId,
      );
      approvalsAvailable = true;
      detections.push({
        capabilityId: "approvals",
        endpoint: `/repos/${input.owner}/${input.repo}/actions/runs/${input.sampleRunId}/approvals`,
        available: true,
        optional: true,
        note: `Detected ${approvals.length} approval(s)`,
      });
    } catch {
      detections.push({
        capabilityId: "approvals",
        endpoint: `/repos/${input.owner}/${input.repo}/actions/runs/${input.sampleRunId}/approvals`,
        available: false,
        optional: true,
        note: "Approvals endpoint unavailable — graceful degrade",
      });
    }
  } else {
    detections.push({
      capabilityId: "approvals",
      endpoint: "approvals",
      available: false,
      optional: true,
      note: "No sample run id provided — approvals not probed",
    });
  }

  return {
    probedAt: input.clockNow(),
    approvalsAvailable,
    environmentsAvailable,
    detections,
  };
}
