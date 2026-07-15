# ADR-0055: Webhook Verification Boundary

## Status

Accepted — OSS-100-08

## Context

Signature verification must be consistent across adapters, but HTTP ingress is not authorised in OSS-100-08. Secrets must never appear on webhook definitions or in logs.

## Decision

1. Verification is an **SDK/adapter contract** (`WebhookVerifier`) invoked by the processing pipeline — not a platform HTTP receiver.
2. Secrets resolve by **`credentialRef`** (`WebhookSecretRef`) via `SecretProvider` or a resolve hook — never raw values on `WebhookDefinition` (only `secretPresent`).
3. Ship a generic HMAC verifier for tests/reference; provider header conventions stay adapter-owned.
4. Replay protection (delivery-id + optional skew) is separate from cryptographic verification; commit after successful accept.
5. Fail closed on missing secret or missing signature when verification is enabled.

## Consequences

- Future platform ingress can hand raw body/headers to the same pipeline without redesign.
- Adapters may replace the mock HMAC verifier with vendor-specific implementations.
- No ingress routes or Event Bus publish are introduced by this decision.

## Related

- [WEBHOOK-VERIFICATION.md](../../packages/integration-sdk/docs/WEBHOOK-VERIFICATION.md)
- [WEBHOOK-PIPELINE.md](../../packages/integration-sdk/docs/WEBHOOK-PIPELINE.md)
- [ADR-0052](./ADR-0052-canonical-source-event-envelope.md)
- [OSS-100-08 Completion Report](../sprint/OSS-100-08-completion-report.md)
