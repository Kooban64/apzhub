# Webhook Verification (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`  
**Related ADR:** [ADR-0055](../../../docs/adr/ADR-0055-webhook-verification-boundary.md)

---

## Boundary

Verification is an **adapter/SDK contract**, not platform ingress. The SDK provides:

1. `WebhookVerifier` interface
2. Generic HMAC reference implementation (`createMockHmacWebhookVerifier`) for tests and adapter reference
3. Pipeline integration (optional stage)

Provider-specific header conventions (Plane, Zammad, …) stay in adapters. Secrets resolve via `SecretProvider` or a `resolveSecret` hook — **never** embedded in definitions.

---

## Status values

| `WebhookVerificationStatus` | Meaning                      |
| --------------------------- | ---------------------------- |
| `verified`                  | Signature matched            |
| `failed`                    | Signature mismatch           |
| `missing_signature`         | Header absent                |
| `missing_secret`            | Secret could not be resolved |
| `skipped`                   | Reserved / caller skipped    |

`ok: true` only for `verified`.

---

## Request / result

```typescript
interface WebhookVerificationRequest {
  rawBody: string | Uint8Array;
  headers: Readonly<Record<string, string>>;
  signatureHeader?: string;
  timestampHeader?: string;
  secretRef: WebhookSecretRef; // credentialRef only
  correlationId: string;
  tenantId: string;
  algorithm?: string;
}
```

HMAC verifier defaults: header `x-webhook-signature`, algorithm `sha256`, encoding `hex`. Accepts optional `sha256=` prefix. Uses `timingSafeEqual`.

```typescript
import {
  createMockHmacWebhookVerifier,
  computeMockHmacSignature,
} from "@apzhub/integration-sdk/events";

const verifier = createMockHmacWebhookVerifier({ secretProvider });
const sig = computeMockHmacSignature(secret, rawBody);
```

---

## Replay protection (related)

Replay is separate from cryptographic verification:

- `ReplayProtection` / `DefaultReplayProtection` — delivery-id uniqueness + optional clock skew (`maxAgeMs` default **5 min**)
- `commit(deliveryId)` after successful processing (`rememberForMs` default **10 min**)
- `InMemoryReplayStore` — tests only

See [WEBHOOK-PIPELINE.md](./WEBHOOK-PIPELINE.md).

---

## Security

- Secrets by `credentialRef` only; never log secrets or raw signatures
- Fail closed on missing secret / missing signature when verification is enabled
- Redact headers in `webhookMetadata.headersRedacted` if attaching metadata to events
- Errors use category `verification` → IntegrationError `authentication`

| Code                                             | When                                      |
| ------------------------------------------------ | ----------------------------------------- |
| `integration.events.webhook.verification_failed` | Fail / missing secret / missing signature |

---

## Limitations

- No production secret vault in SDK
- Generic HMAC is reference/test — adapters may supply vendor verifiers
- Timestamp skew is enforced by replay protection when a timestamp is present, not by the HMAC helper alone

---

## Related

- [WEBHOOK-CONTRACTS.md](./WEBHOOK-CONTRACTS.md)
- [WEBHOOK-PIPELINE.md](./WEBHOOK-PIPELINE.md)
- [ADR-0055](../../../docs/adr/ADR-0055-webhook-verification-boundary.md)
