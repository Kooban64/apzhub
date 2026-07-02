import type { CapabilityLifecycleState } from "../capability/types";
import type { LifecycleTransitionContext, LifecycleTransitionRecord } from "./types";

interface TrackedCapability {
  state: CapabilityLifecycleState;
  updatedAt: string;
  history: LifecycleTransitionRecord[];
}

export class LifecycleStateStore {
  private readonly capabilities = new Map<string, TrackedCapability>();

  has(capabilityId: string): boolean {
    return this.capabilities.has(capabilityId);
  }

  getState(capabilityId: string): CapabilityLifecycleState | undefined {
    return this.capabilities.get(capabilityId)?.state;
  }

  getUpdatedAt(capabilityId: string): string | undefined {
    return this.capabilities.get(capabilityId)?.updatedAt;
  }

  getHistory(capabilityId: string): readonly LifecycleTransitionRecord[] {
    return this.capabilities.get(capabilityId)?.history ?? [];
  }

  getTrackedIds(): readonly string[] {
    return [...this.capabilities.keys()].sort((a, b) => a.localeCompare(b));
  }

  count(): number {
    return this.capabilities.size;
  }

  reset(capabilityId: string, timestamp: string): LifecycleTransitionRecord {
    const record: LifecycleTransitionRecord = {
      from: this.capabilities.get(capabilityId)?.state ?? null,
      to: "discovered",
      timestamp,
      reason: "reset",
      source: "lifecycle-manager",
    };

    this.capabilities.set(capabilityId, {
      state: "discovered",
      updatedAt: timestamp,
      history: [record],
    });

    return record;
  }

  applyTransition(
    capabilityId: string,
    to: CapabilityLifecycleState,
    timestamp: string,
    context: LifecycleTransitionContext = {},
  ): LifecycleTransitionRecord {
    const existing = this.capabilities.get(capabilityId);
    const from = existing?.state ?? null;

    const record: LifecycleTransitionRecord = {
      from,
      to,
      timestamp,
      reason: context.reason,
      source: context.source,
      auditRef: context.auditRef,
    };

    const history = existing ? [...existing.history, record] : [record];

    this.capabilities.set(capabilityId, {
      state: to,
      updatedAt: timestamp,
      history,
    });

    return record;
  }

  clear(): void {
    this.capabilities.clear();
  }
}
