/**
 * SMTP email delivery channel — uses @apzhub/platform-email (nodemailer stays out of this file).
 */

import type {
  NotificationDeliveryRecord,
  NotificationFailureClass,
  NotificationIntent,
  NotificationReceiptLevel,
} from "@apzhub/notification-contracts";
import { isSmtpConfigured, sendPlatformEmail } from "@apzhub/platform-email";

import {
  isNotificationEmailEnabled,
  type NotificationDeliveryEnv,
} from "./delivery-env";

export type EmailChannelDispatchResult = {
  readonly ok: boolean;
  readonly receiptLevel: NotificationReceiptLevel;
  readonly failureClass?: NotificationFailureClass;
  readonly failureCode?: string;
  readonly messageId?: string;
};

export async function dispatchEmailChannel(input: {
  readonly delivery: NotificationDeliveryRecord;
  readonly intent: NotificationIntent;
  readonly to: string;
  readonly env?: NotificationDeliveryEnv;
}): Promise<EmailChannelDispatchResult> {
  const env = input.env ?? process.env;
  if (!isNotificationEmailEnabled(env)) {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "configuration",
      failureCode: "EMAIL_CHANNEL_DISABLED",
    };
  }
  if (!isSmtpConfigured(env)) {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "configuration",
      failureCode: "SMTP_UNCONFIGURED",
    };
  }
  const to = input.to.trim();
  if (!to || !to.includes("@")) {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "permanent_provider",
      failureCode: "INVALID_EMAIL_ENDPOINT",
    };
  }

  const text =
    typeof input.intent.payload.body === "string"
      ? input.intent.payload.body
      : (input.intent.summary ?? input.intent.subject);
  const html = `<p>${escapeHtml(input.intent.subject)}</p>${
    input.intent.summary ? `<p>${escapeHtml(input.intent.summary)}</p>` : ""
  }<pre>${escapeHtml(text)}</pre>`;

  try {
    const result = await sendPlatformEmail({
      to,
      subject: `[APZHUB] ${input.intent.subject}`,
      text,
      html,
      headers: {
        "X-APZHUB-Delivery-Id": input.delivery.id,
        "X-APZHUB-Intent-Id": input.intent.id,
        "X-APZHUB-Correlation-Id": input.delivery.correlationId,
      },
    });
    return {
      ok: true,
      receiptLevel: "delivered",
      messageId: result.messageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP_SEND_FAILED";
    const transient = /timeout|ECONN|ETIMEDOUT|421|450|451|452/i.test(message);
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: transient ? "transient_provider" : "permanent_provider",
      failureCode: "SMTP_SEND_FAILED",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
