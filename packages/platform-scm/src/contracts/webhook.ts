import type { ScmProviderId } from "./repository";

export type ScmWebhookEventKind =
  "push" | "pull_request" | "create" | "delete" | "release" | "ping" | "other";

export interface ScmWebhookRegistration {
  readonly callbackUrl: string;
  readonly secret: string;
  readonly events: readonly ScmWebhookEventKind[];
}

export interface ScmWebhookDelivery {
  readonly deliveryId: string;
  readonly providerId: ScmProviderId;
  readonly eventKind: ScmWebhookEventKind;
  readonly externalEventName: string;
  readonly repositoryFullName?: string;
  readonly receivedAt: string;
  readonly signatureValid: boolean;
  readonly idempotencyKey: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly summary: string;
}

export type WebhookDeliveryState =
  "received" | "verified" | "rejected" | "processed" | "failed" | "replayed";

export interface WebhookAuditRecord {
  readonly auditId: string;
  readonly tenantId: string;
  readonly providerId: ScmProviderId;
  readonly deliveryId: string;
  readonly state: WebhookDeliveryState;
  readonly eventKind: ScmWebhookEventKind;
  readonly repositoryFullName?: string;
  readonly idempotencyKey: string;
  readonly detail?: string;
  readonly occurredAt: string;
}
