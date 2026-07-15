# Webhook Processing Pipeline (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`

---

## Purpose

Orchestrates inbound webhook **payload processing** after an HTTP layer (future platform ingress) hands off raw body + headers. Returns a structured `WebhookProcessingResult` — **never** publishes to an Event Bus.

```text
decode → verify → replay check → translate → deduplicate → complete
                                                         ↓
                                              commit replay (on accept)
```

---

## Stages

| Stage         | Injected                                 | Skip flag              |
| ------------- | ---------------------------------------- | ---------------------- |
| `decode`      | `WebhookDecoder` (required)              | —                      |
| `verify`      | `WebhookVerifier` + `input.verification` | `skipVerification`     |
| `replay`      | `ReplayProtection` + delivery id         | `skipReplayProtection` |
| `translate`   | `WebhookTranslator` (required)           | —                      |
| `deduplicate` | `EventDeduplicationStore`                | `skipDeduplication`    |
| `complete`    | —                                        | —                      |

```typescript
import { createWebhookProcessingPipeline } from "@apzhub/integration-sdk/events";

const pipeline = createWebhookProcessingPipeline({
  decoder,
  translator,
  verifier,
  replayProtection,
  deduplicationStore,
  metrics,
});

const result = await pipeline.process({
  rawBody,
  headers,
  context: {
    correlationId,
    tenantId,
    integrationId,
    providerId,
    deliveryId,
  },
  verification: { secretRef: { credentialRef: "cred/webhook" } },
});
```

---

## Outcomes

| Outcome               | `ok`  | Meaning                               |
| --------------------- | ----- | ------------------------------------- |
| `accepted`            | true  | One or more `IntegrationSourceEvent`s |
| `ignored`             | true  | Translator intentionally skipped      |
| `duplicate`           | false | Dedup store hit                       |
| `verification_failed` | false | Signature/secret failure              |
| `replay_rejected`     | false | Duplicate delivery or skew            |
| `translation_failed`  | false | No usable event                       |
| `error`               | false | Decode/unexpected failure             |

Result includes `stages`, `durationMs`, optional `verification` / `replay` snapshots, and `events`.

Helpers: `webhookAccepted`, `webhookIgnored`, `webhookFailed`.

---

## Translator / decoder contracts

```typescript
interface WebhookDecoder {
  decode(
    input: WebhookPipelineInput,
  ): Promise<WebhookDecodeResult> | WebhookDecodeResult;
}

interface WebhookTranslator {
  translate(
    payload: unknown,
    context: WebhookPipelineContext,
  ): Promise<WebhookTranslateResult> | WebhookTranslateResult;
}
```

Translator may return a single `event`, an `events` array, or `ignored: true`.  
Mocks: `createMockJsonWebhookDecoder`, `createMockWebhookTranslator`.

---

## Replay commit

On successful accept, if `deliveryId` and replay protection are present, the pipeline calls `replayProtection.commit(deliveryId)`. Failed/ignored paths do not commit.

---

## Metrics

`EventMetrics.recordWebhookProcessing({ outcome, success, durationMs })` when injected.  
Standard names: `integration.events.webhook.*` (`STANDARD_EVENT_METRIC_NAMES`).

---

## Diagnostics & redaction

- Prefer `buildSafeEventLogFields` — correlation, outcome, `sourceEventId`, never raw body
- Attach only redacted metadata on `IntegrationSourceEvent`
- Diagnostics collector: `recordWebhook(outcome)` → snapshot with verification/replay counters

---

## Explicit absences

No HTTP server, no route handlers, no Event Bus publish, no durable stores.

---

## Related

- [WEBHOOK-VERIFICATION.md](./WEBHOOK-VERIFICATION.md)
- [EVENT-DEDUPLICATION.md](./EVENT-DEDUPLICATION.md)
- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)
