# Webhook Contracts (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`  
**Related ADR:** [ADR-0055](../../../docs/adr/ADR-0055-webhook-verification-boundary.md)

---

## Purpose

Vendor-neutral **webhook lifecycle management** for adapters. Register, update, enable/disable, and validate vendor webhook configurations. Does **not** receive HTTP callbacks — no ingress in the SDK.

```text
Capability / Platform (future)
        ↓
WebhookManager (adapter)
        ↓
Vendor webhook API (Plane / Zammad / …)
```

---

## `WebhookManager`

| Method                  | Role                        |
| ----------------------- | --------------------------- |
| `list` / `get`          | Enumerate registrations     |
| `create` / `update`     | Register or change          |
| `enable` / `disable`    | Lifecycle toggles           |
| `delete`                | Remove                      |
| `validate`              | Preflight URL / event types |
| `supportedOperations()` | Capability discovery        |

Operations enum: `list` | `get` | `create` | `update` | `enable` | `disable` | `delete` | `validate`.

Use `isWebhookOperationSupported` / `assertWebhookOperationSupported` before calling unsupported ops.

---

## Definitions

| Type                                                  | Notes                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------- |
| `WebhookDefinition`                                   | Canonical registration — `secretPresent: boolean`, never raw secrets      |
| `WebhookEndpointDefinition`                           | `callbackUrl`, optional `requireHttps` (default true), `secretRef`        |
| `WebhookSecretRef`                                    | `credentialRef` + optional `algorithm` — secrets by reference only        |
| `WebhookLifecycleStatus`                              | `pending` \| `active` \| `disabled` \| `failed` \| `deleted` \| `unknown` |
| `WebhookRegistrationRequest` / `WebhookUpdateRequest` | Create/update inputs                                                      |

`validateWebhookEndpoint` checks URL presence and HTTPS when required.  
`createWebhookEndpoint` builds a validated `WebhookEndpoint` helper object.

---

## Legacy adapter wrapping

```typescript
import { asWebhookManager } from "@apzhub/integration-sdk/events";

const manager = asWebhookManager(planeWebhookService, {
  integrationId: "plane",
  providerId: "plane",
});
```

Maps legacy `url` / `isActive` / `secretPresent` shapes to `WebhookDefinition` without changing underlying service signatures. `enable`/`disable` added when `update` is supported.

Plane: `asPlaneWebhookManager`. Zammad: `asZammadWebhookManager`.

---

## Capability declaration

```typescript
import { declareWebhookCapability } from "@apzhub/integration-sdk/events";

declareWebhookCapability({
  operations: ["list", "get", "create", "update", "delete", "validate"],
  supportsVerification: true,
  supportsReplayProtection: true,
  supportsManagement: true,
});
```

---

## Explicit absences

| Concern                            | Status                                               |
| ---------------------------------- | ---------------------------------------------------- |
| HTTP ingress / receiver            | **Absent**                                           |
| Event Bus publish                  | **Absent**                                           |
| Platform callback URL provisioning | **Absent** (adapters register vendor-side URLs only) |

---

## Related

- [WEBHOOK-VERIFICATION.md](./WEBHOOK-VERIFICATION.md)
- [WEBHOOK-PIPELINE.md](./WEBHOOK-PIPELINE.md)
- [WEBHOOK-POLLING-MIGRATION.md](./WEBHOOK-POLLING-MIGRATION.md)
- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)
