import type { NotificationClassification } from "../domain/classification";
import type { SubscriptionDefinition } from "../domain/types";

export type NotificationPolicyDecision =
  { readonly allow: true } | { readonly allow: false; readonly reason: string };

export type NotificationPolicy = {
  evaluate(input: {
    readonly subscription: SubscriptionDefinition;
    readonly classification: NotificationClassification;
    readonly now: string;
  }): NotificationPolicyDecision;
};

/** Default policy: honour expiry; otherwise allow. */
export function createDefaultNotificationPolicy(): NotificationPolicy {
  return {
    evaluate(input) {
      if (!input.subscription.enabled) {
        return { allow: false, reason: "policy.subscription_disabled" };
      }
      const expiry =
        input.classification.expiry ?? input.subscription.classificationDefaults.expiry;
      if (expiry && Date.parse(expiry) <= Date.parse(input.now)) {
        return { allow: false, reason: "policy.expired" };
      }
      return { allow: true };
    },
  };
}
