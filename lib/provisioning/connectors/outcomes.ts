import {
  PROVISIONING_ATTEMPT_OUTCOMES,
  type ProvisioningAttemptOutcome,
} from "@/lib/provisioning/contracts/enums";

/**
 * Controlled vocabulary for `ServiceProvisioningConnector.execute()` results.
 * Must stay aligned with `ProvisioningAttemptOutcome` / job attempt `outcome` column.
 */
export const CONNECTOR_OUTCOMES = PROVISIONING_ATTEMPT_OUTCOMES;

export type ConnectorOutcome = ProvisioningAttemptOutcome;

export function isConnectorOutcome(value: string): value is ConnectorOutcome {
  return (CONNECTOR_OUTCOMES as readonly string[]).includes(value);
}
