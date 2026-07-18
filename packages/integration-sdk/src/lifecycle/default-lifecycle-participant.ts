import type { HealthProvider } from "../health/types";
import type { IntegrationLifecycleState } from "./types";
import type {
  IntegrationLifecycleContext,
  IntegrationLifecycleParticipant,
  IntegrationLifecycleResult,
} from "./participant-types";
import { IntegrationAdapterLifecycleService } from "./integration-lifecycle-service";

export interface DefaultLifecycleParticipantOptions {
  readonly integrationId: string;
  readonly initialState?: IntegrationLifecycleState;
  readonly lifecycleService?: IntegrationAdapterLifecycleService;
  readonly healthProvider?: HealthProvider;
}

export class DefaultLifecycleParticipant implements IntegrationLifecycleParticipant {
  readonly integrationId: string;
  lifecycleState: IntegrationLifecycleState;

  private readonly lifecycleService: IntegrationAdapterLifecycleService;
  private readonly healthProvider?: HealthProvider;

  constructor(options: DefaultLifecycleParticipantOptions) {
    this.integrationId = options.integrationId;
    this.lifecycleState = options.initialState ?? "registered";
    this.lifecycleService =
      options.lifecycleService ?? new IntegrationAdapterLifecycleService();
    this.healthProvider = options.healthProvider;
  }

  async onEnable(
    context: IntegrationLifecycleContext,
  ): Promise<IntegrationLifecycleResult> {
    const previousState = this.lifecycleState;
    const enableTarget = this.lifecycleService.resolveEnableTarget(previousState);
    const enableTransition = this.lifecycleService.transition({
      integrationId: this.integrationId,
      from: previousState,
      to: enableTarget,
      correlationId: context.correlationId,
      reason: context.reason,
    });

    if (!enableTransition.ok) {
      return {
        ok: false,
        previousState,
        currentState: previousState,
        message: enableTransition.error.message,
      };
    }

    this.lifecycleState = enableTransition.value;

    let degraded = false;
    if (this.healthProvider && context.tenantId) {
      const health = await this.healthProvider.check({
        context: {
          correlationId: context.correlationId,
          tenantId: context.tenantId,
        },
        integrationId: this.integrationId,
        capabilityId: context.capabilityId,
      });
      degraded = health.status === "degraded" || health.status === "unavailable";
    }

    const readyTarget = this.lifecycleService.resolveReadyTarget(
      this.lifecycleState,
      degraded,
    );
    const readyTransition = this.lifecycleService.transition({
      integrationId: this.integrationId,
      from: this.lifecycleState,
      to: readyTarget,
      correlationId: context.correlationId,
      reason: context.reason,
    });

    if (!readyTransition.ok) {
      return {
        ok: false,
        previousState,
        currentState: this.lifecycleState,
        message: readyTransition.error.message,
      };
    }

    this.lifecycleState = readyTransition.value;

    return {
      ok: true,
      previousState,
      currentState: this.lifecycleState,
      message:
        this.lifecycleState === "degraded"
          ? "Integration enabled in degraded state"
          : "Integration enabled",
      warnings: degraded ? ["Health checks reported degraded status"] : undefined,
    };
  }

  async onDisable(
    context: IntegrationLifecycleContext,
  ): Promise<IntegrationLifecycleResult> {
    const previousState = this.lifecycleState;
    const disableTarget = this.lifecycleService.resolveDisableTarget();
    const transition = this.lifecycleService.transition({
      integrationId: this.integrationId,
      from: previousState,
      to: disableTarget,
      correlationId: context.correlationId,
      reason: context.reason,
    });

    if (!transition.ok) {
      return {
        ok: false,
        previousState,
        currentState: previousState,
        message: transition.error.message,
      };
    }

    this.lifecycleState = transition.value;

    return {
      ok: true,
      previousState,
      currentState: this.lifecycleState,
      message: "Integration disabled",
    };
  }

  async onShutdown(
    context: IntegrationLifecycleContext,
  ): Promise<IntegrationLifecycleResult> {
    const previousState = this.lifecycleState;
    const shutdownTarget = this.lifecycleService.resolveShutdownTarget(previousState);
    const firstTransition = this.lifecycleService.transition({
      integrationId: this.integrationId,
      from: previousState,
      to: shutdownTarget,
      correlationId: context.correlationId,
      reason: context.reason,
    });

    if (!firstTransition.ok) {
      return {
        ok: false,
        previousState,
        currentState: previousState,
        message: firstTransition.error.message,
      };
    }

    this.lifecycleState = firstTransition.value;

    if (this.lifecycleState === "shutting_down") {
      const completeTarget = this.lifecycleService.resolveShutdownCompleteTarget();
      const completeTransition = this.lifecycleService.transition({
        integrationId: this.integrationId,
        from: this.lifecycleState,
        to: completeTarget,
        correlationId: context.correlationId,
        reason: context.reason,
      });

      if (!completeTransition.ok) {
        return {
          ok: false,
          previousState,
          currentState: this.lifecycleState,
          message: completeTransition.error.message,
        };
      }

      this.lifecycleState = completeTransition.value;
    }

    return {
      ok: true,
      previousState,
      currentState: this.lifecycleState,
      message: "Integration shutdown complete",
    };
  }
}

export function createDefaultLifecycleParticipant(
  options: DefaultLifecycleParticipantOptions,
): IntegrationLifecycleParticipant {
  return new DefaultLifecycleParticipant(options);
}
