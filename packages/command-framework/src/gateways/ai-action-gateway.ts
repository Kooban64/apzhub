import type { ActionContext, ActionExecutionRequest } from "../types";
import { buildStubGatewayOutcome } from "./build-gateway-outcome";
import type {
  ActorInvocationGateway,
  GatewayRouteOutcome,
  InvocationGatewayDependencies,
  InvocationGatewayDiagnostics,
} from "./types";

/** ADR-0026 — AI-mediated action proposals and execution. */
export interface AiActionGateway extends ActorInvocationGateway {
  readonly source: "ai-agent";
  proposeAndExecute(intent: string, context: ActionContext): GatewayRouteOutcome;
}

export function createStubAiActionGateway(
  _dependencies: InvocationGatewayDependencies = {},
): AiActionGateway {
  let invocationCount = 0;
  let lastInvocationAt: string | undefined;
  let lastActionId: string | undefined;

  const gateway: AiActionGateway = {
    source: "ai-agent",

    execute(request: ActionExecutionRequest): GatewayRouteOutcome {
      invocationCount += 1;
      lastInvocationAt = new Date().toISOString();
      lastActionId = request.actionId;
      return buildStubGatewayOutcome("ai-agent", request.actionId);
    },

    proposeAndExecute(intent: string, context: ActionContext): GatewayRouteOutcome {
      return gateway.execute({
        actionId: "ai.intent",
        context: {
          ...context,
          actor: "ai-agent",
          args: { ...(context.args ?? {}), intent },
        },
      });
    },

    getDiagnostics(): InvocationGatewayDiagnostics {
      return {
        source: "ai-agent",
        status: "stub",
        invocationCount,
        lastInvocationAt,
        lastActionId,
      };
    },
  };

  return gateway;
}
