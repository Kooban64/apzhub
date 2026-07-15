import { invalidLifecycleTransitionError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";
import {
  canTransitionConnectionLifecycle,
} from "./lifecycle-transitions";
import type { ConnectionLifecycleState, ConnectionRecord } from "./types";

export interface LifecycleTransitionInput {
  readonly connection: ConnectionRecord;
  readonly to: ConnectionLifecycleState;
  readonly correlationId: string;
  readonly reason?: string;
}

export class ConnectionLifecycleService {
  private readonly clock: Clock;

  constructor(clock: Clock = systemClock) {
    this.clock = clock;
  }

  transition(input: LifecycleTransitionInput): SdkResult<ConnectionRecord> {
    const { connection, to, correlationId } = input;

    if (!canTransitionConnectionLifecycle(connection.lifecycleState, to)) {
      return sdkErr(
        invalidLifecycleTransitionError(
          { correlationId, details: { connectionId: connection.connectionId } },
          connection.lifecycleState,
          to,
        ),
      );
    }

    const now = this.clock.now();
    const next: ConnectionRecord = {
      ...connection,
      lifecycleState: to,
      configuredAt:
        to === "configured" && !connection.configuredAt ? now : connection.configuredAt,
      connectedAt: to === "connected" ? now : connection.connectedAt,
      disconnectedAt:
        to === "disconnected" || to === "disabled" ? now : connection.disconnectedAt,
      lastValidatedAt:
        to === "connected" || to === "configured" ? now : connection.lastValidatedAt,
    };

    return sdkOk(next);
  }
}
