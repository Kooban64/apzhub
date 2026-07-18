import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";
import { invalidIntegrationLifecycleTransitionError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { IntegrationLifecycleState } from "./types";
import {
  canTransitionIntegrationLifecycle,
  getAllowedIntegrationLifecycleTransitions,
} from "./integration-transitions";

export interface IntegrationLifecycleTransitionInput {
  readonly integrationId: string;
  readonly from: IntegrationLifecycleState;
  readonly to: IntegrationLifecycleState;
  readonly correlationId: string;
  readonly reason?: string;
}

export class IntegrationAdapterLifecycleService {
  private readonly clock: Clock;

  constructor(clock: Clock = systemClock) {
    this.clock = clock;
  }

  transition(
    input: IntegrationLifecycleTransitionInput,
  ): SdkResult<IntegrationLifecycleState> {
    if (!canTransitionIntegrationLifecycle(input.from, input.to)) {
      return sdkErr(
        invalidIntegrationLifecycleTransitionError(
          { correlationId: input.correlationId },
          input.from,
          input.to,
        ),
      );
    }

    return sdkOk(input.to);
  }

  resolveEnableTarget(current: IntegrationLifecycleState): IntegrationLifecycleState {
    if (current === "registered" || current === "disabled" || current === "failed") {
      return "initialising";
    }
    return current;
  }

  resolveReadyTarget(
    current: IntegrationLifecycleState,
    degraded: boolean,
  ): IntegrationLifecycleState {
    if (current === "initialising") {
      return degraded ? "degraded" : "ready";
    }
    return current;
  }

  resolveDisableTarget(): IntegrationLifecycleState {
    return "disabled";
  }

  resolveShutdownTarget(current: IntegrationLifecycleState): IntegrationLifecycleState {
    if (current === "shutdown") {
      return "shutdown";
    }
    return "shutting_down";
  }

  resolveShutdownCompleteTarget(): IntegrationLifecycleState {
    return "shutdown";
  }

  getAllowedTransitions(
    from: IntegrationLifecycleState,
  ): readonly IntegrationLifecycleState[] {
    return getAllowedIntegrationLifecycleTransitions(from);
  }

  now(): string {
    return this.clock.now();
  }
}
