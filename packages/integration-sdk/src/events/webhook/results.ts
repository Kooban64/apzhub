import type { EventError } from "../errors";
import type { IntegrationSourceEvent } from "../source-event";
import type { WebhookVerificationResult } from "./verification";
import type { ReplayCheckResult } from "./replay";

export type WebhookProcessingOutcome =
  | "accepted"
  | "ignored"
  | "duplicate"
  | "verification_failed"
  | "replay_rejected"
  | "translation_failed"
  | "error";

export interface WebhookProcessingResult {
  readonly outcome: WebhookProcessingOutcome;
  readonly ok: boolean;
  readonly event?: IntegrationSourceEvent;
  readonly events?: readonly IntegrationSourceEvent[];
  readonly verification?: WebhookVerificationResult;
  readonly replay?: ReplayCheckResult;
  readonly ignoredReason?: string;
  readonly error?: EventError;
  readonly durationMs: number;
  readonly stages: readonly string[];
}

export function webhookAccepted(
  event: IntegrationSourceEvent,
  durationMs: number,
  stages: readonly string[],
  extras: Partial<WebhookProcessingResult> = {},
): WebhookProcessingResult {
  return {
    outcome: "accepted",
    ok: true,
    event,
    events: [event],
    durationMs,
    stages,
    ...extras,
  };
}

export function webhookIgnored(
  reason: string,
  durationMs: number,
  stages: readonly string[],
  extras: Partial<WebhookProcessingResult> = {},
): WebhookProcessingResult {
  return {
    outcome: "ignored",
    ok: true,
    ignoredReason: reason,
    durationMs,
    stages,
    ...extras,
  };
}

export function webhookFailed(
  outcome: Exclude<WebhookProcessingOutcome, "accepted" | "ignored">,
  error: EventError,
  durationMs: number,
  stages: readonly string[],
  extras: Partial<WebhookProcessingResult> = {},
): WebhookProcessingResult {
  return {
    outcome,
    ok: false,
    error,
    durationMs,
    stages,
    ...extras,
  };
}
