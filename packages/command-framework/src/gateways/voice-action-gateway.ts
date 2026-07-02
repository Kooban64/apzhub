import type { ActionContext, ActionExecutionRequest } from "../types";
import { buildStubGatewayOutcome } from "./build-gateway-outcome";
import type {
  ActorInvocationGateway,
  GatewayRouteOutcome,
  InvocationGatewayDependencies,
  InvocationGatewayDiagnostics,
} from "./types";

/** ADR-0026 — speech pipeline action invocation. */
export interface VoiceActionGateway extends ActorInvocationGateway {
  readonly source: "voice";
  executeUtterance(utterance: string, context: ActionContext): GatewayRouteOutcome;
}

export function createStubVoiceActionGateway(
  _dependencies: InvocationGatewayDependencies = {},
): VoiceActionGateway {
  let invocationCount = 0;
  let lastInvocationAt: string | undefined;
  let lastActionId: string | undefined;

  const gateway: VoiceActionGateway = {
    source: "voice",

    execute(request: ActionExecutionRequest): GatewayRouteOutcome {
      invocationCount += 1;
      lastInvocationAt = new Date().toISOString();
      lastActionId = request.actionId;
      return buildStubGatewayOutcome("voice", request.actionId);
    },

    executeUtterance(utterance: string, context: ActionContext): GatewayRouteOutcome {
      return gateway.execute({
        actionId: "voice.utterance",
        context: {
          ...context,
          actor: "voice",
          args: { ...(context.args ?? {}), utterance },
        },
      });
    },

    getDiagnostics(): InvocationGatewayDiagnostics {
      return {
        source: "voice",
        status: "stub",
        invocationCount,
        lastInvocationAt,
        lastActionId,
      };
    },
  };

  return gateway;
}
