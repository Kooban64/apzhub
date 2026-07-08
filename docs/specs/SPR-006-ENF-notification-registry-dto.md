# SPR-006 — Notification Registry DTO

> **Story:** EN-010  
> **Status:** Implemented  
> **Authority:** [Event Registry DTO](./SPR-006-ENF-event-registry-dto.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define the **NotificationRegistryDto** wire format for server-to-client hydration. Read-only projection — no delivery, mapper execution, or client registration.

---

## Wire format

```typescript
interface NotificationRegistryDto {
  schemaVersion: 1;
  frameworkVersion?: string;
  routes: NotificationRouteDescriptorDto[];
}
```

| Field              | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `schemaVersion`    | DTO format version (`NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION = 1`) |
| `frameworkVersion` | Platform catalogue stamp from bootstrap                             |
| `routes`           | Permission-filtered route descriptors (post-filter on wire)         |

---

## Route descriptor DTO

Each `NotificationRouteDescriptorDto` exposes client-safe metadata:

| Field                                 | Description                             |
| ------------------------------------- | --------------------------------------- |
| `routeId`                             | Stable route identifier                 |
| `eventPattern`                        | Event mapping reference (metadata only) |
| `notificationKind`                    | Presentation kind                       |
| `channel`                             | Delivery channel metadata               |
| `templateRef`                         | Presentation template key               |
| `version` / `schemaVersion`           | Semver metadata                         |
| `visibility` / `stability` / `status` | Route lifecycle metadata                |
| `source`                              | `builtin` · `manifest`                  |
| `permission`                          | Optional visibility gate                |

Template strings (`titleTemplate` / `bodyTemplate`) remain server-side for mapper execution (EN-009).

---

## Server pipeline

```text
NotificationRegistry (bootstrapped)
        ↓ mapNotificationRegistryDto()
NotificationRegistryDto (full)
        ↓ filterNotificationRegistryDto(permissionAdapter)
Permission-filtered DTO
        ↓ validateNotificationRegistryDto() [client boundary]
        ↓ createNotificationRegistryFromDto()
ReadOnlyNotificationRegistry
```

---

## Components

| Component                                  | Path                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| `mapNotificationRegistryDto`               | `src/server/map-notification-registry-dto.ts`               |
| `validateNotificationRegistryDto`          | `src/server/validate-notification-registry-dto.ts`          |
| `filterNotificationRegistryDto`            | `src/server/filter-notification-registry-dto.ts`            |
| `NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION` | `src/server/notification-registry-dto-schema-version.ts`    |
| Hydration diagnostics                      | `src/server/notification-registry-hydration-diagnostics.ts` |

---

## Permission filtering

Delegates to `WorkbenchPermissionAdapter.filter()` — framework never evaluates permissions inline (ADR-0023).

---

## Architectural boundaries

| Rule                         | EN-010 |
| ---------------------------- | ------ |
| DTO is read-only             | ✅     |
| No client registration       | ✅     |
| No mapper execution          | ✅     |
| No notification delivery     | ✅     |
| Server remains authoritative | ✅     |

---

_SPR-006 Notification Registry DTO — EN-010._
