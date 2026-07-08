# SPR-006 — Notification Client Hydration

> **Story:** EN-010  
> **Status:** Implemented  
> **Authority:** [Notification Registry DTO](./SPR-006-ENF-notification-registry-dto.md) · [KDF client hydration](../../packages/knowledge-discovery-framework) (DF-010 pattern)

---

## Purpose

Define **client-side Notification Registry hydration** from a permission-filtered server DTO. Read-only index — no registration, mappers, delivery, or Event Bus interaction.

---

## Hydration pipeline

```text
Server bootstrap → NotificationRegistryDto
        ↓ filterNotificationRegistryDto()
Permission-filtered DTO
        ↓ createNotificationRegistryFromDto()
ClientNotificationRegistry (ReadOnlyNotificationRegistry)
        ↓ NotificationRegistryProvider
useNotificationRegistry()
```

Synchronisation mode: `CLIENT_REGISTRY_HYDRATION_SYNC_STATE.mode = "hydration"`.

---

## Client registry

| API                                         | Role                                   |
| ------------------------------------------- | -------------------------------------- |
| `createNotificationRegistryFromDto()`       | Hydration entry point                  |
| `ReadOnlyNotificationRegistry`              | `has`, `get`, `list`, `getDiagnostics` |
| `ClientNotificationRegistry`                | Default implementation                 |
| `createEmptyClientNotificationRegistry()`   | Empty shell                            |
| `createInvalidClientNotificationRegistry()` | Invalid DTO shell                      |

Client registries **must not** expose `register`, `registerMany`, or `clear`.

---

## Diagnostics

`ClientNotificationRegistryDiagnostics` reports:

| Field                                         | Description                      |
| --------------------------------------------- | -------------------------------- |
| `status`                                      | `empty` · `hydrated` · `invalid` |
| `schemaVersion`                               | DTO schema version               |
| `frameworkVersion`                            | Platform version stamp           |
| `routeCount` / `activeRouteCount`             | Route totals                     |
| `platformRouteCount` / `capabilityRouteCount` | Source split                     |
| `hydratedAt`                                  | ISO hydration timestamp          |
| `source`                                      | Always `"server-dto"`            |
| `synchronisation`                             | Hydration sync metadata          |

Server-side `NotificationRegistryHydrationDiagnostics` tracks registered vs filtered counts for health endpoints.

---

## Invalid DTO handling

Validation failures produce:

- `ok: false`
- Empty invalid client registry
- Structured `NotificationRegistrationIssue[]`
- No partial hydration

---

## Code reference

```typescript
import {
  createNotificationRegistryFromDto,
  NotificationRegistryProvider,
  useNotificationRegistry,
} from "@apzhub/event-notification-framework/react";
```

---

_SPR-006 Notification Client Hydration — EN-010._
