import type { SubscriptionDefinition } from "../domain/types";
import type { SubscriptionRegistry } from "./registry";

export type ResolvedSubscription = {
  readonly subscription: SubscriptionDefinition;
  readonly matchReason: "exact" | "wildcard";
};

export type SubscriptionResolver = {
  resolve(input: {
    readonly eventType: string;
    readonly tenantId: string;
    readonly projectId?: string;
  }): readonly ResolvedSubscription[];
};

export function createSubscriptionResolver(
  registry: SubscriptionRegistry,
): SubscriptionResolver {
  return {
    resolve(input) {
      const candidates = registry.listByEventType(input.eventType);
      const resolved: ResolvedSubscription[] = [];

      for (const subscription of candidates) {
        const { scope } = subscription;
        if (scope.tenantId && scope.tenantId !== input.tenantId) continue;
        if (
          scope.kind === "project" &&
          scope.projectId &&
          input.projectId &&
          scope.projectId !== input.projectId
        ) {
          continue;
        }
        if (scope.kind === "tenant" && scope.tenantId !== input.tenantId) {
          continue;
        }

        resolved.push({
          subscription,
          matchReason: subscription.eventTypes.includes("*") ? "wildcard" : "exact",
        });
      }

      return resolved;
    },
  };
}
