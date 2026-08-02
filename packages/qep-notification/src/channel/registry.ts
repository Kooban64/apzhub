import type { ChannelProvider } from "./port";
import { CHANNEL_IDS, createUnimplementedChannelProvider } from "./port";
import { createInternalNotificationChannel } from "./internal";

export type ChannelRegistry = {
  register(provider: ChannelProvider): void;
  get(channelId: string): ChannelProvider | undefined;
  has(channelId: string): boolean;
  list(): readonly ChannelProvider[];
  listImplemented(): readonly ChannelProvider[];
};

export function createChannelRegistry(
  providers: readonly ChannelProvider[] = [],
): ChannelRegistry {
  const byId = new Map<string, ChannelProvider>();
  for (const p of providers) {
    byId.set(p.channelId, p);
  }
  return {
    register(provider) {
      byId.set(provider.channelId, provider);
    },
    get(channelId) {
      return byId.get(channelId);
    },
    has(channelId) {
      return byId.has(channelId);
    },
    list() {
      return [...byId.values()];
    },
    listImplemented() {
      return [...byId.values()].filter((p) => p.implemented);
    },
  };
}

/** Default registry: Internal implemented; other channels registered as extension points. */
export function createDefaultChannelRegistry(): {
  readonly registry: ChannelRegistry;
  readonly inbox: ReturnType<typeof createInternalNotificationChannel>["inbox"];
} {
  const { inbox, provider } = createInternalNotificationChannel();
  const registry = createChannelRegistry([
    provider,
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.email,
      displayName: "Email",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.sms,
      displayName: "SMS",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.push,
      displayName: "Push",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.teams,
      displayName: "Microsoft Teams",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.slack,
      displayName: "Slack",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.webhook,
      displayName: "Webhook",
    }),
    createUnimplementedChannelProvider({
      channelId: CHANNEL_IDS.mobile,
      displayName: "Mobile",
    }),
  ]);
  return { registry, inbox };
}
