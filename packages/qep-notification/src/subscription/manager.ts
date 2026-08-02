import type { NotificationClassification } from "../domain/classification";
import type { SubscriptionDefinition, SubscriptionScope } from "../domain/types";
import type { SubscriptionRegistry } from "./registry";

export type SubscriptionManager = {
  create(input: {
    readonly subscriptionId: string;
    readonly name: string;
    readonly eventTypes: readonly string[];
    readonly scope: SubscriptionScope;
    readonly channels: readonly string[];
    readonly templateId: string;
    readonly classificationDefaults: Omit<
      NotificationClassification,
      "correlationId" | "expiry"
    > & { readonly expiry?: string };
    readonly enabled?: boolean;
    readonly now: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
  }): SubscriptionDefinition;
  enable(subscriptionId: string, now: string): void;
  disable(subscriptionId: string, now: string): void;
  updateChannels(
    subscriptionId: string,
    channels: readonly string[],
    now: string,
  ): void;
};

export function createSubscriptionManager(
  registry: SubscriptionRegistry,
): SubscriptionManager {
  return {
    create(input) {
      if (input.eventTypes.length === 0) {
        throw new Error("subscription.eventTypes must not be empty");
      }
      if (input.channels.length === 0) {
        throw new Error("subscription.channels must not be empty");
      }
      const definition: SubscriptionDefinition = {
        subscriptionId: input.subscriptionId,
        name: input.name,
        eventTypes: input.eventTypes,
        scope: input.scope,
        channels: input.channels,
        templateId: input.templateId,
        enabled: input.enabled ?? true,
        classificationDefaults: input.classificationDefaults,
        createdAt: input.now,
        updatedAt: input.now,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      };
      registry.register(definition);
      return definition;
    },
    enable(subscriptionId, now) {
      const existing = registry.get(subscriptionId);
      if (!existing) throw new Error(`subscription.not_found:${subscriptionId}`);
      registry.register({ ...existing, enabled: true, updatedAt: now });
    },
    disable(subscriptionId, now) {
      const existing = registry.get(subscriptionId);
      if (!existing) throw new Error(`subscription.not_found:${subscriptionId}`);
      registry.register({ ...existing, enabled: false, updatedAt: now });
    },
    updateChannels(subscriptionId, channels, now) {
      const existing = registry.get(subscriptionId);
      if (!existing) throw new Error(`subscription.not_found:${subscriptionId}`);
      if (channels.length === 0) {
        throw new Error("subscription.channels must not be empty");
      }
      registry.register({ ...existing, channels, updatedAt: now });
    },
  };
}
