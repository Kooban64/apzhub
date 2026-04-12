/**
 * Stable connector-facing error codes for audit and UI (do not rename lightly).
 * Worker maps connector `outcome` to job status; these codes explain *why* within that class.
 */
export const CONNECTOR_ERROR_CODES = {
  UNKNOWN_ROLE: "UNKNOWN_ROLE",
  POLICY_REQUIRES_MANUAL: "POLICY_REQUIRES_MANUAL",
  SIMULATED_CONFLICT: "SIMULATED_CONFLICT",
  MOCK_TRANSIENT: "MOCK_TRANSIENT",
  MOCK_TERMINAL: "MOCK_TERMINAL",
  MOCK_MANUAL: "MOCK_MANUAL",
  RETRY_EXHAUSTED: "RETRY_EXHAUSTED",
} as const;

export type ConnectorErrorCode = (typeof CONNECTOR_ERROR_CODES)[keyof typeof CONNECTOR_ERROR_CODES];
