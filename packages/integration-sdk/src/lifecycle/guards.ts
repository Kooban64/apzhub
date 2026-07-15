import {
  ACTIVE_INTEGRATION_LIFECYCLE_STATES,
  INTEGRATION_LIFECYCLE_STATES,
  TERMINAL_INTEGRATION_LIFECYCLE_STATES,
  type IntegrationLifecycleState,
} from "./types";

const lifecycleStateSet = new Set<string>(INTEGRATION_LIFECYCLE_STATES);
const terminalStateSet = new Set<string>(TERMINAL_INTEGRATION_LIFECYCLE_STATES);
const activeStateSet = new Set<string>(ACTIVE_INTEGRATION_LIFECYCLE_STATES);

export function isIntegrationLifecycleState(
  value: unknown,
): value is IntegrationLifecycleState {
  return typeof value === "string" && lifecycleStateSet.has(value);
}

export function isTerminalIntegrationLifecycleState(
  value: IntegrationLifecycleState,
): boolean {
  return terminalStateSet.has(value);
}

export function isActiveIntegrationLifecycleState(
  value: IntegrationLifecycleState,
): boolean {
  return activeStateSet.has(value);
}

export function canAcceptIntegrationRequests(
  state: IntegrationLifecycleState,
): boolean {
  return isActiveIntegrationLifecycleState(state);
}
