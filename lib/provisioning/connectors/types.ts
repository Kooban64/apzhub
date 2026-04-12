import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";
import type { ConnectorOutcome } from "@/lib/provisioning/connectors/outcomes";

/**
 * Outcome classification (connector → worker; see `lib/provisioning/worker/runner.ts`):
 *
 * | `ConnectorOutcome` | Job / attempt handling |
 * | ------------------------------ | ---------------------- |
 * | success                        | job `succeeded`, realization success path |
 * | transient_failure              | re-queued with backoff; exhausted → terminal |
 * | terminal_failure               | job `failed`, `provisioning_failed` audit |
 * | manual_action                  | job `awaiting_manual`, `provisioning_manual_action` audit |
 *
 * Stable machine-facing codes for *why* live in `lib/provisioning/connectors/errors.ts`.
 */
export type ConnectorHealthSignal = "healthy" | "degraded" | "misconfigured";

export type ConnectorHealthResult = {
  signal: ConnectorHealthSignal;
  detail: string;
};

export type ConnectorCapabilities = {
  supportsGrant: boolean;
  supportsRevoke: boolean;
  supportsRepair: boolean;
  supportsReconcile: boolean;
  /** When true, success path includes structured readback in verificationPayload. */
  supportsReadback: boolean;
  /** In-process / non-production connector. */
  simulated: boolean;
  /** Best-effort idempotent apply for the same job shape. */
  idempotentWrites: boolean;
};

export type ConnectorExecuteResult = {
  outcome: ConnectorOutcome;
  errorCode?: string;
  errorMessage?: string;
  /** Merged into job.verification_json; prefer stable keys via verificationJsonFromResult. */
  verificationPayload?: Record<string, unknown>;
};

export type ServiceProvisioningConnector = {
  readonly connectorId: string;
  readonly displayName: string;
  /** Services this instance is bound to (may be one). */
  readonly serviceIds: readonly string[];
  readonly capabilities: ConnectorCapabilities;
  getHealth(): ConnectorHealthResult;
  execute(job: ProvisioningJobRow): Promise<ConnectorExecuteResult>;
};

export type ConnectorMetadataView = Pick<
  ServiceProvisioningConnector,
  "connectorId" | "displayName" | "serviceIds" | "capabilities"
>;

export function capabilitySummary(c: ConnectorCapabilities): string {
  const parts: string[] = [];
  if (c.supportsGrant) {
    parts.push("grant");
  }
  if (c.supportsRevoke) {
    parts.push("revoke");
  }
  if (c.supportsRepair) {
    parts.push("repair");
  }
  if (c.supportsReconcile) {
    parts.push("reconcile");
  }
  if (c.supportsReadback) {
    parts.push("readback");
  }
  if (c.simulated) {
    parts.push("simulated");
  }
  return parts.join("+");
}
