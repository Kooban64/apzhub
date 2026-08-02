import type { NotificationClassification } from "../domain/classification";
import type { RenderedNotification } from "../domain/types";

export const CHANNEL_IDS = {
  internal: "internal",
  email: "email",
  sms: "sms",
  push: "push",
  teams: "microsoft_teams",
  slack: "slack",
  webhook: "webhook",
  mobile: "mobile",
} as const;

export type ChannelDeliverInput = {
  readonly deliveryId: string;
  readonly notificationId: string;
  readonly tenantId: string;
  readonly recipientSubjectId: string;
  readonly rendered: RenderedNotification;
  readonly classification: NotificationClassification;
  readonly now: string;
};

export type ChannelDeliverResult =
  | { readonly ok: true; readonly externalRef?: string }
  | {
      readonly ok: false;
      readonly retryable: boolean;
      readonly error: string;
    };

/**
 * Channel provider abstraction.
 * Only Internal is implemented in S12. Future providers implement this port.
 */
export type ChannelProvider = {
  readonly channelId: string;
  readonly displayName: string;
  readonly implemented: boolean;
  deliver(input: ChannelDeliverInput): Promise<ChannelDeliverResult>;
};

/** Stub for future adapters — always fails as not implemented. */
export function createUnimplementedChannelProvider(options: {
  readonly channelId: string;
  readonly displayName: string;
}): ChannelProvider {
  return {
    channelId: options.channelId,
    displayName: options.displayName,
    implemented: false,
    async deliver() {
      return {
        ok: false,
        retryable: false,
        error: `channel.not_implemented:${options.channelId}`,
      };
    },
  };
}
