import type { CapabilityLifecycleState } from "../capability/types";
import { invalidTransitionError, lifecycleError } from "./errors";
import { LifecycleStateStore } from "./store";
import { canTransitionBetween, getAllowedTransitions } from "./transitions";
import type {
  LifecycleDiagnostics,
  LifecycleSnapshot,
  LifecycleTransitionContext,
  LifecycleTransitionRecord,
  LifecycleTransitionResult,
} from "./types";

export class CapabilityLifecycleManager {
  private readonly store = new LifecycleStateStore();

  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  reset(capabilityId: string): boolean {
    if (!capabilityId) {
      return false;
    }

    this.store.reset(capabilityId, this.now());
    return true;
  }

  getState(capabilityId: string): CapabilityLifecycleState | undefined {
    return this.store.getState(capabilityId);
  }

  getHistory(capabilityId: string): readonly LifecycleTransitionRecord[] {
    return this.store.getHistory(capabilityId);
  }

  canTransition(capabilityId: string, to: CapabilityLifecycleState): boolean {
    if (!capabilityId || !to) {
      return false;
    }

    const from = this.store.getState(capabilityId);
    if (from === undefined && !this.store.has(capabilityId)) {
      return to === "discovered";
    }

    return canTransitionBetween(from ?? null, to);
  }

  transition(
    capabilityId: string,
    to: CapabilityLifecycleState,
    context: LifecycleTransitionContext = {},
  ): LifecycleTransitionResult {
    if (!capabilityId) {
      return {
        success: false,
        capabilityId,
        from: null,
        to,
        errors: [
          lifecycleError("LIFECYCLE_INVALID_INPUT", "Capability id is required", {
            capabilityId,
            to,
          }),
        ],
      };
    }

    const from = this.store.getState(capabilityId);
    const isTracked = this.store.has(capabilityId);

    if (!isTracked && from === undefined) {
      if (to !== "discovered") {
        return {
          success: false,
          capabilityId,
          from: null,
          to,
          errors: [
            lifecycleError(
              "LIFECYCLE_NOT_TRACKED",
              `Capability "${capabilityId}" is not tracked; call reset() or transition to "discovered" first`,
              { capabilityId, from: null, to },
            ),
          ],
        };
      }
    }

    if (!canTransitionBetween(from ?? null, to)) {
      return {
        success: false,
        capabilityId,
        from: from ?? null,
        to,
        errors: [invalidTransitionError(capabilityId, from ?? null, to)],
      };
    }

    const record = this.store.applyTransition(capabilityId, to, this.now(), context);

    return {
      success: true,
      capabilityId,
      from: record.from,
      to: record.to,
      record,
    };
  }

  markFailed(capabilityId: string, reason?: string): LifecycleTransitionResult {
    return this.transition(capabilityId, "failed", {
      reason: reason ?? "marked failed",
      source: "lifecycle-manager",
    });
  }

  markDisabled(capabilityId: string, reason?: string): LifecycleTransitionResult {
    return this.transition(capabilityId, "disabled", {
      reason: reason ?? "marked disabled",
      source: "lifecycle-manager",
    });
  }

  getDiagnostics(capabilityId: string): LifecycleDiagnostics {
    const currentState = this.store.getState(capabilityId);
    const history = this.store.getHistory(capabilityId);

    return {
      capabilityId,
      currentState,
      allowedTransitions: getAllowedTransitions(currentState ?? null),
      transitionCount: history.length,
      lastTransition: history.at(-1),
    };
  }

  snapshot(): LifecycleSnapshot {
    const timestamp = this.now();
    const capabilities = this.store.getTrackedIds().map((capabilityId) => ({
      capabilityId,
      state: this.store.getState(capabilityId)!,
      transitionCount: this.store.getHistory(capabilityId).length,
      updatedAt: this.store.getUpdatedAt(capabilityId)!,
    }));

    const stateSummary: Partial<Record<CapabilityLifecycleState, number>> = {};
    for (const entry of capabilities) {
      stateSummary[entry.state] = (stateSummary[entry.state] ?? 0) + 1;
    }

    return {
      timestamp,
      capabilityCount: capabilities.length,
      stateSummary,
      capabilities,
    };
  }

  clear(): void {
    this.store.clear();
  }
}

export function createCapabilityLifecycleManager(
  options: { now?: () => string } = {},
): CapabilityLifecycleManager {
  return new CapabilityLifecycleManager(options);
}
