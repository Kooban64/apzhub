import type { ActionExecutionRequest } from "../types";
import { buildStubGatewayOutcome } from "./build-gateway-outcome";
import type {
  GatewayRouteOutcome,
  InvocationGatewayDependencies,
  InvocationGatewayDiagnostics,
} from "./types";

/** ADR-0026 — automation-triggered system command execution. */
export interface AutomationCommandGateway {
  readonly source: "automation";
  executeSystemCommand(request: ActionExecutionRequest): GatewayRouteOutcome;
  getDiagnostics(): InvocationGatewayDiagnostics;
}

export function createStubAutomationCommandGateway(
  _dependencies: InvocationGatewayDependencies = {},
): AutomationCommandGateway {
  let invocationCount = 0;
  let lastInvocationAt: string | undefined;
  let lastActionId: string | undefined;

  return {
    source: "automation",

    executeSystemCommand(request: ActionExecutionRequest): GatewayRouteOutcome {
      invocationCount += 1;
      lastInvocationAt = new Date().toISOString();
      lastActionId = request.actionId;
      return buildStubGatewayOutcome("automation", request.actionId);
    },

    getDiagnostics(): InvocationGatewayDiagnostics {
      return {
        source: "automation",
        status: "stub",
        invocationCount,
        lastInvocationAt,
        lastActionId,
      };
    },
  };
}
