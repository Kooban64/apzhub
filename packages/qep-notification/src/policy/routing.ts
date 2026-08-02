import type { SubscriptionDefinition } from "../domain/types";
import type { ChannelRegistry } from "../channel/registry";

export type RoutePlan = {
  readonly channelIds: readonly string[];
};

export type NotificationRouter = {
  route(input: { readonly subscription: SubscriptionDefinition }): RoutePlan;
};

export function createNotificationRouter(
  channels: ChannelRegistry,
): NotificationRouter {
  return {
    route(input) {
      const channelIds = input.subscription.channels.filter((id) => channels.has(id));
      return { channelIds };
    },
  };
}
