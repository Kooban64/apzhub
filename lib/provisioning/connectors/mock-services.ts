import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";
import { CONNECTOR_ERROR_CODES } from "@/lib/provisioning/connectors/errors";
import type {
  ConnectorExecuteResult,
  ConnectorHealthResult,
  ConnectorCapabilities,
  ServiceProvisioningConnector,
} from "@/lib/provisioning/connectors/types";

type Payload = { forceOutcome?: string };

function readPayload(row: ProvisioningJobRow): Payload {
  const raw = row.payloadJson;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Payload) : {};
}

const MOCK_CAPABILITIES: ConnectorCapabilities = {
  supportsGrant: true,
  supportsRevoke: true,
  supportsRepair: true,
  supportsReconcile: true,
  supportsReadback: false,
  simulated: true,
  idempotentWrites: false,
};

/**
 * Default mock connector: honors `payload_json.forceOutcome` for tests; otherwise succeeds.
 * Readback is off; verification payload is minimal.
 */
export function createDefaultMockConnector(options?: {
  connectorId?: string;
  displayName?: string;
  serviceIds?: readonly string[];
  capabilities?: Partial<ConnectorCapabilities>;
}): ServiceProvisioningConnector {
  const connectorId = options?.connectorId ?? "mock.default.v1";
  const displayName = options?.displayName ?? "Generic mock connector";
  const serviceIds = options?.serviceIds ?? (["*"] as const);
  const capabilities: ConnectorCapabilities = { ...MOCK_CAPABILITIES, ...options?.capabilities };

  return {
    connectorId,
    displayName,
    serviceIds,
    capabilities,
    getHealth(): ConnectorHealthResult {
      return { signal: "healthy", detail: "Mock connector (payload-driven outcomes)." };
    },
    async execute(job: ProvisioningJobRow): Promise<ConnectorExecuteResult> {
      const p = readPayload(job);
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
      return {
        outcome: "success",
        verificationPayload: {
          connectorId,
          serviceId: job.serviceId,
          userId: job.userId,
          jobType: job.jobType,
          observedRole: job.desiredEffectiveRole ?? null,
          previousRole: null,
          timestamp: new Date().toISOString(),
        },
      };
    },
  };
}
