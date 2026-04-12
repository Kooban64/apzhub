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

const CAL_ROLES = new Set(["r-cal-admin", "r-cal-view"]);

const CAPABILITIES: ConnectorCapabilities = {
  supportsGrant: true,
  supportsRevoke: true,
  supportsRepair: true,
  supportsReconcile: true,
  supportsReadback: true,
  simulated: true,
  idempotentWrites: true,
};

const CAL_CONNECTOR_ID = "calendar.simulated.v1";

function verificationReadback(input: {
  job: ProvisioningJobRow;
  previousRole: string | null;
  observedRole: string | null;
}): Record<string, unknown> {
  return {
    connectorId: CAL_CONNECTOR_ID,
    serviceId: input.job.serviceId,
    userId: input.job.userId,
    jobType: input.job.jobType,
    previousRole: input.previousRole,
    observedRole: input.observedRole,
    timestamp: new Date().toISOString(),
  };
}

export function createCalendarSimulatedConnector(): ServiceProvisioningConnector {
  return {
    connectorId: CAL_CONNECTOR_ID,
    displayName: "Calendar (simulated entitlement)",
    serviceIds: ["calendar"] as const,
    capabilities: CAPABILITIES,
    getHealth(): ConnectorHealthResult {
      return { signal: "healthy", detail: "Simulated calendar connector (in-memory ACL)." };
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
        if (previous === null) {
          return {
            outcome: "manual_action",
            errorCode: CONNECTOR_ERROR_CODES.POLICY_REQUIRES_MANUAL,
            errorMessage: "Calendar policy: revoke with no active entitlement requires human review.",
            verificationPayload: verificationReadback({ job, previousRole: null, observedRole: null }),
          };
        }
        simulatedSetRole(job.userId, job.serviceId, null);
        return {
          outcome: "success",
          verificationPayload: verificationReadback({ job, previousRole: previous, observedRole: null }),
        };
      }

      const desired = job.desiredEffectiveRole?.trim() ?? null;
      if (!desired || !CAL_ROLES.has(desired)) {
        return {
          outcome: "terminal_failure",
          errorCode: CONNECTOR_ERROR_CODES.UNKNOWN_ROLE,
          errorMessage: `Unknown or empty calendar role: ${desired ?? "(null)"}`,
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
