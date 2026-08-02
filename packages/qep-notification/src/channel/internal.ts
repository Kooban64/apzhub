import type { InternalInboxMessage } from "../domain/types";
import type { ChannelProvider } from "./port";
import { CHANNEL_IDS } from "./port";

export type InternalInbox = {
  list(input: {
    readonly tenantId: string;
    readonly recipientSubjectId: string;
  }): readonly InternalInboxMessage[];
  markRead(messageId: string): void;
  all(): readonly InternalInboxMessage[];
};

/** Preferred factory: inbox + provider sharing the same mutable store. */
export function createInternalNotificationChannel(): {
  readonly inbox: InternalInbox;
  readonly provider: ChannelProvider;
} {
  const messages: InternalInboxMessage[] = [];
  const inbox: InternalInbox = {
    list(input) {
      return messages.filter(
        (m) =>
          m.tenantId === input.tenantId &&
          m.recipientSubjectId === input.recipientSubjectId,
      );
    },
    markRead(messageId) {
      const idx = messages.findIndex((m) => m.messageId === messageId);
      if (idx >= 0) {
        messages[idx] = { ...messages[idx]!, read: true };
      }
    },
    all() {
      return [...messages];
    },
  };

  const provider: ChannelProvider = {
    channelId: CHANNEL_IDS.internal,
    displayName: "Internal Notification Channel",
    implemented: true,
    async deliver(input) {
      const message: InternalInboxMessage = {
        messageId: `inbox-${input.deliveryId}`,
        tenantId: input.tenantId,
        recipientSubjectId: input.recipientSubjectId,
        notificationId: input.notificationId,
        title: input.rendered.title,
        body: input.rendered.body,
        classification: input.classification,
        createdAt: input.now,
        read: false,
      };
      messages.push(message);
      return { ok: true, externalRef: message.messageId };
    },
  };

  return { inbox, provider };
}
