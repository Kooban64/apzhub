import type { EventDeduplicationStore } from "../deduplication";
import {
  eventDuplicateError,
  eventValidationError,
  isEventError,
  type EventError,
  webhookReplayRejectedError,
  webhookVerificationFailedError,
} from "../errors";
import type { IntegrationSourceEvent } from "../source-event";
import type { EventMetrics } from "../metrics";
import type { ReplayProtection } from "./replay";
import {
  webhookAccepted,
  webhookFailed,
  webhookIgnored,
  type WebhookProcessingResult,
} from "./results";
import type {
  WebhookVerificationRequest,
  WebhookVerificationResult,
  WebhookVerifier,
} from "./verification";

export interface WebhookDecodeResult {
  readonly ok: boolean;
  readonly payload?: unknown;
  readonly rawBody?: string | Uint8Array;
  readonly headers?: Readonly<Record<string, string>>;
  readonly deliveryId?: string;
  readonly timestamp?: string | number;
  readonly reason?: string;
  readonly error?: EventError;
}

export interface WebhookTranslateResult {
  readonly ok: boolean;
  readonly ignored?: boolean;
  readonly reason?: string;
  readonly event?: IntegrationSourceEvent;
  readonly events?: readonly IntegrationSourceEvent[];
  readonly error?: EventError;
}

export interface WebhookDecoder {
  decode(
    input: WebhookPipelineInput,
  ): Promise<WebhookDecodeResult> | WebhookDecodeResult;
}

export interface WebhookTranslator {
  translate(
    payload: unknown,
    context: WebhookPipelineContext,
  ): Promise<WebhookTranslateResult> | WebhookTranslateResult;
}

export interface WebhookPipelineContext {
  readonly correlationId: string;
  readonly tenantId: string;
  readonly integrationId: string;
  readonly providerId: string;
  readonly deliveryId?: string;
}

export interface WebhookPipelineInput {
  readonly rawBody: string | Uint8Array;
  readonly headers: Readonly<Record<string, string>>;
  readonly context: WebhookPipelineContext;
  readonly verification?: Omit<
    WebhookVerificationRequest,
    "rawBody" | "headers" | "correlationId" | "tenantId"
  > &
    Partial<Pick<WebhookVerificationRequest, "rawBody" | "headers">>;
  readonly skipVerification?: boolean;
  readonly skipReplayProtection?: boolean;
  readonly skipDeduplication?: boolean;
}

export interface WebhookProcessingPipelineOptions {
  readonly decoder: WebhookDecoder;
  readonly translator: WebhookTranslator;
  readonly verifier?: WebhookVerifier;
  readonly replayProtection?: ReplayProtection;
  readonly deduplicationStore?: EventDeduplicationStore;
  readonly metrics?: EventMetrics;
  readonly now?: () => number;
}

export interface WebhookProcessingPipeline {
  process(input: WebhookPipelineInput): Promise<WebhookProcessingResult>;
}

/**
 * Orchestrates webhook decode → verify → replay → translate → dedup.
 * Never publishes to the Event Bus — returns structured results only.
 */
export class DefaultWebhookProcessingPipeline implements WebhookProcessingPipeline {
  private readonly decoder: WebhookDecoder;
  private readonly translator: WebhookTranslator;
  private readonly verifier?: WebhookVerifier;
  private readonly replayProtection?: ReplayProtection;
  private readonly deduplicationStore?: EventDeduplicationStore;
  private readonly metrics?: EventMetrics;
  private readonly now: () => number;

  constructor(options: WebhookProcessingPipelineOptions) {
    this.decoder = options.decoder;
    this.translator = options.translator;
    this.verifier = options.verifier;
    this.replayProtection = options.replayProtection;
    this.deduplicationStore = options.deduplicationStore;
    this.metrics = options.metrics;
    this.now = options.now ?? (() => Date.now());
  }

  async process(input: WebhookPipelineInput): Promise<WebhookProcessingResult> {
    const started = this.now();
    const stages: string[] = [];
    const correlationId = input.context.correlationId;

    try {
      stages.push("decode");
      const decoded = await this.decoder.decode(input);
      if (!decoded.ok) {
        const error =
          decoded.error ??
          eventValidationError(
            { correlationId },
            decoded.reason ?? "Webhook payload decode failed",
          );
        return this.finish(
          webhookFailed("error", error, this.now() - started, stages),
          false,
        );
      }

      let verification: WebhookVerificationResult | undefined;
      if (!input.skipVerification && this.verifier && input.verification) {
        stages.push("verify");
        verification = await this.verifier.verify({
          rawBody: input.verification.rawBody ?? decoded.rawBody ?? input.rawBody,
          headers: input.verification.headers ?? decoded.headers ?? input.headers,
          signatureHeader: input.verification.signatureHeader,
          timestampHeader: input.verification.timestampHeader,
          secretRef: input.verification.secretRef,
          correlationId,
          tenantId: input.context.tenantId,
          algorithm: input.verification.algorithm,
        });
        if (!verification.ok) {
          return this.finish(
            webhookFailed(
              "verification_failed",
              verification.error ?? webhookVerificationFailedError({ correlationId }),
              this.now() - started,
              stages,
              { verification },
            ),
            false,
          );
        }
      }

      const deliveryId = input.context.deliveryId ?? decoded.deliveryId;

      let replay;
      if (!input.skipReplayProtection && this.replayProtection && deliveryId) {
        stages.push("replay");
        replay = await this.replayProtection.check({
          deliveryId,
          timestamp: decoded.timestamp,
          correlationId,
        });
        if (!replay.ok) {
          return this.finish(
            webhookFailed(
              "replay_rejected",
              webhookReplayRejectedError({
                correlationId,
                details: { reason: replay.reason ?? "replay" },
              }),
              this.now() - started,
              stages,
              { verification, replay },
            ),
            false,
          );
        }
      }

      stages.push("translate");
      const translated = await this.translator.translate(decoded.payload, {
        ...input.context,
        deliveryId,
      });

      if (translated.ignored) {
        return this.finish(
          webhookIgnored(translated.reason ?? "ignored", this.now() - started, stages, {
            verification,
            replay,
            event: translated.event,
          }),
          true,
        );
      }

      if (!translated.ok || (!translated.event && !translated.events?.length)) {
        const error =
          translated.error ??
          eventValidationError(
            { correlationId },
            translated.reason ?? "Webhook translation failed",
          );
        return this.finish(
          webhookFailed("translation_failed", error, this.now() - started, stages, {
            verification,
            replay,
          }),
          false,
        );
      }

      const events = translated.events ?? (translated.event ? [translated.event] : []);
      const primary = events[0];
      if (!primary) {
        return this.finish(
          webhookFailed(
            "translation_failed",
            eventValidationError({ correlationId }, "No events produced"),
            this.now() - started,
            stages,
            { verification, replay },
          ),
          false,
        );
      }

      if (!input.skipDeduplication && this.deduplicationStore) {
        stages.push("deduplicate");
        const key = primary.sourceEventId;
        const seen = await this.deduplicationStore.has(key);
        if (seen) {
          return this.finish(
            webhookFailed(
              "duplicate",
              eventDuplicateError({ correlationId }, key),
              this.now() - started,
              stages,
              { verification, replay, event: primary, events },
            ),
            false,
          );
        }
        await this.deduplicationStore.remember(key);
      }

      if (deliveryId && this.replayProtection && !input.skipReplayProtection) {
        await this.replayProtection.commit(deliveryId);
      }

      stages.push("complete");
      return this.finish(
        webhookAccepted(primary, this.now() - started, stages, {
          verification,
          replay,
          events,
        }),
        true,
      );
    } catch (error) {
      const eventError = isEventError(error)
        ? error
        : eventValidationError(
            { correlationId },
            error instanceof Error ? error.message : "Webhook processing failed",
          );
      return this.finish(
        webhookFailed("error", eventError, this.now() - started, stages),
        false,
      );
    }
  }

  private finish(
    result: WebhookProcessingResult,
    success: boolean,
  ): WebhookProcessingResult {
    this.metrics?.recordWebhookProcessing({
      outcome: result.outcome,
      success,
      durationMs: result.durationMs,
    });
    return result;
  }
}

export function createWebhookProcessingPipeline(
  options: WebhookProcessingPipelineOptions,
): DefaultWebhookProcessingPipeline {
  return new DefaultWebhookProcessingPipeline(options);
}
