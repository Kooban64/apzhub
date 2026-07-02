import type { SupportedInvocationSourceId } from "../invocation";
import type { GatewayRouteOutcome } from "./types";

export function buildStubGatewayOutcome(
  source: SupportedInvocationSourceId,
  actionId: string,
): GatewayRouteOutcome {
  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: `${source} gateway stub — "${actionId}" is not implemented`,
  };
}
