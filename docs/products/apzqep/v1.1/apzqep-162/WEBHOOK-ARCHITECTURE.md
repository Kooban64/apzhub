# Webhook Architecture — APZQEP-162

## Flow

```text
Provider → POST /api/v1/qep/scm/webhooks/{providerId}
  → verify signature (provider)
  → normalize to ScmWebhookDelivery (provider)
  → idempotency check (engine)
  → audit record
  → publish platform.scm.* domain events
```

## Security controls

| Control                | Implementation                                  |
| ---------------------- | ----------------------------------------------- |
| Signature verification | Provider `verifyWebhook` (GitHub HMAC SHA-256)  |
| Replay / idempotency   | SHA / delivery-key memory in repository store   |
| Delivery audit         | `WebhookAuditRecord` (processed / rejected / …) |
| Failure logging        | `platform.scm.webhook.failed` + audit detail    |
| Auth on ingress API    | Platform API auth wrapper (session / service)   |

## Event kinds (normalized)

`push` · `pull_request` · `create` · `delete` · `release` · `ping` · `other`

Provider-specific header names remain inside the provider adapter.

## Wave 2 note

Remote GitHub webhook _creation_ via API is offline-simulated; live App/PAT registration is an ops path, not CI requirement.
