import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";
import { CONNECTOR_ERROR_CODES } from "@/lib/provisioning/connectors/errors";
import {
  simulatedGetRole,
  simulatedSetRole,
} from "@/lib/provisioning/connectors/simulated-store";
import type {
  ConnectorExecuteResult,
  ConnectorHealthResult,
  ConnectorCapabilities,
  ServiceProvisioningConnector,
} from "@/lib/provisioning/connectors/types";

const MAIL_CONNECTOR_ID = "mail.simulated.v1";

const MAIL_ROLES = new Set(["r-mail-admin", "r-mail-std", "r-mail-view"]);

const CAPABILITIES: ConnectorCapabilities = {
  supportsGrant: true,
  supportsRevoke: true,
  supportsRepair: true,
  supportsReconcile: true,
  supportsReadback: true,
  simulated: true,
  idempotentWrites: true,
};

function verificationReadback(input: {
  job: ProvisioningJobRow;
  previousRole: string | null;
  observedRole: string | null;
}): Record<string, unknown> {
  return {
    connectorId: MAIL_CONNECTOR_ID,
    serviceId: input.job.serviceId,
    userId: input.job.userId,
    jobType: input.job.jobType,
    previousRole: input.previousRole,
    observedRole: input.observedRole,
    timestamp: new Date().toISOString(),
  };
}

export function createMailSimulatedConnector(): ServiceProvisioningConnector {
  return {
    connectorId: MAIL_CONNECTOR_ID,
    displayName: "Mail (simulated entitlement)",
    serviceIds: ["mail"] as const,
    capabilities: CAPABILITIES,
    getHealth(): ConnectorHealthResult {
      return { signal: "healthy", detail: "Simulated mail connector (in-memory ACL)." };
    },
    async execute(job: ProvisioningJobRow): Promise<ConnectorExecuteResult> {
      const p = job.payloadJson && typeof job.payloadJson === "object" && !Array.isArray(job.payloadJson)
        ? (job.payloadJson as { forceOutcome?: string })
        : {};
      if (p.forceOutcome === "transient") {
        return {
          outcome: "transient_failure",
          errorCode: CONNECTOR_ERROR_CODES.MOCK_TRANSIENT,
          errorMessage: "Simulated transient failure.",
        };
      }
      if (p.forceOutcome === "terminal") {
        return {
          outcome: "terminal_failure",
          errorCode: CONNECTOR_ERROR_CODES.MOCK_TERMINAL,
          errorMessage: "Simulated terminal failure.",
        };
      }
      if (p.forceOutcome === "manual") {
        return {
          outcome: "manual_action",
          errorCode: CONNECTOR_ERROR_CODES.MOCK_MANUAL,
          errorMessage: "Simulated manual action gate.",
        };
      }

      const previous = simulatedGetRole(job.userId, job.serviceId);

      if (job.jobType === "revoke") {
        simulatedSetRole(job.userId, job.serviceId, null);
        return {
          outcome: "success",
          verificationPayload: verificationReadback({ job, previousRole: previous, observedRole: null }),
        };
      }

      const desired = job.desiredEffectiveRole?.trim() ?? null;
      if (!desired || !MAIL_ROLES.has(desired)) {
        return {
          outcome: "terminal_failure",
          errorCode: CONNECTOR_ERROR_CODES.UNKNOWN_ROLE,
          errorMessage: `Unknown or empty mail role: ${desired ?? "(null)"}`,
        };
      }

      simulatedSetRole(job.userId, job.serviceId, desired);
      return {
        outcome: "success",
        verificationPayload: verificationReadback({ job, previousRole: previous, observedRole: desired }),
      };
    },
  };
}
