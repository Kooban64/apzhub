import type { SubscriptionDefinition } from "../domain/types";

export type SubscriptionRegistry = {
  register(definition: SubscriptionDefinition): void;
  unregister(subscriptionId: string): void;
  get(subscriptionId: string): SubscriptionDefinition | undefined;
  list(): readonly SubscriptionDefinition[];
  listEnabled(): readonly SubscriptionDefinition[];
  listByEventType(eventType: string): readonly SubscriptionDefinition[];
};

export function createSubscriptionRegistry(
  initial: readonly SubscriptionDefinition[] = [],
): SubscriptionRegistry {
  const byId = new Map<string, SubscriptionDefinition>();
  for (const def of initial) {
    byId.set(def.subscriptionId, def);
  }

  return {
    register(definition) {
      byId.set(definition.subscriptionId, definition);
    },
    unregister(subscriptionId) {
      byId.delete(subscriptionId);
    },
    get(subscriptionId) {
      return byId.get(subscriptionId);
    },
    list() {
      return [...byId.values()];
    },
    listEnabled() {
      return [...byId.values()].filter((d) => d.enabled);
    },
    listByEventType(eventType) {
      return [...byId.values()].filter(
        (d) =>
          d.enabled && (d.eventTypes.includes(eventType) || d.eventTypes.includes("*")),
      );
    },
  };
}
