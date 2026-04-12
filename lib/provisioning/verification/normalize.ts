import type { ConnectorExecuteResult } from "@/lib/provisioning/connectors/types";
import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";

const READBACK_SNIPPET_MAX = 400;

/** Compact JSON for inspector / queue (job `verification_json`). */
export function verificationJsonSnippet(verificationJson: unknown, max = 220): string | undefined {
  if (verificationJson === null || verificationJson === undefined) {
    return undefined;
  }
  try {
    const s = JSON.stringify(verificationJson);
    if (s.length <= max) {
      return s;
    }
    return `${s.slice(0, max)}…`;
  } catch {
    return undefined;
  }
}

/** Compact JSON for attempt `log_context_json` (bounded). */
export function readbackSnippetFromResult(result: ConnectorExecuteResult): string | null {
  if (!result.verificationPayload) {
    return null;
  }
  try {
    const s = JSON.stringify(result.verificationPayload);
    if (s.length <= READBACK_SNIPPET_MAX) {
      return s;
    }
    return `${s.slice(0, READBACK_SNIPPET_MAX)}…`;
  } catch {
    return null;
  }
}

/**
 * Stable verification document for `provisioning_jobs.verification_json`.
 * Prefer connector-supplied `verificationPayload` (includes readback: connectorId, userId, serviceId, observedRole, …).
 */
export function verificationJsonFromResult(
  result: ConnectorExecuteResult,
  job?: Pick<ProvisioningJobRow, "serviceId" | "userId" | "jobType">,
): Record<string, unknown> | null {
  const fromPayload = result.verificationPayload ? { ...result.verificationPayload } : {};
  if (job) {
    if (fromPayload.serviceId === undefined) {
      fromPayload.serviceId = job.serviceId;
    }
    if (fromPayload.userId === undefined) {
      fromPayload.userId = job.userId;
    }
    if (fromPayload.jobType === undefined) {
      fromPayload.jobType = job.jobType;
    }
  }
  if (Object.keys(fromPayload).length === 0) {
    return null;
  }
  return { ...fromPayload, outcome: result.outcome };
}
