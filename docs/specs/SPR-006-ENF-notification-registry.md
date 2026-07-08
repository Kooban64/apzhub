# SPR-006 — Notification Registry

> **Story:** EN-007  
> **Status:** Implemented  
> **Authority:** [Notification architecture](./SPR-006-ENF-notification-architecture.md) · [ADR-0032](../adr/ADR-0032-notification-routing-model.md)

---

## Purpose

Define the **DefaultNotificationRegistry** — authoritative in-memory metadata registry for notification route definitions. Registration and validation only; no delivery, Event Bus subscription, mappers, or persistence.

---

## Components

| Component                         | Path                                                   | Role                            |
| --------------------------------- | ------------------------------------------------------ | ------------------------------- |
| `DefaultNotificationRegistry`     | `src/notification/default-notification-registry.ts`    | Register, validate, diagnostics |
| `validateNotificationDescriptor`  | `src/notification/validate-notification-descriptor.ts` | Descriptor validation           |
| `buildNotificationMetadata`       | `src/notification/build-notification-metadata.ts`      | Metadata projection             |
| `PlaceholderNotificationRegistry` | `src/notification/placeholders.ts`                     | Test injection only             |

---

## NotificationRegistry contract

```typescript
interface NotificationRegistry {
  register(descriptor: NotificationDescriptor): void;
  registerMany(descriptors: readonly NotificationDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly NotificationDescriptor[],
  ): NotificationBatchRegistrationResult;
  replace(descriptor: NotificationDescriptor): void;
  has(routeId: string): boolean;
  get(routeId: string): NotificationDescriptor | undefined;
  getMetadata(routeId: string): NotificationMetadata | undefined;
  list(): readonly NotificationDescriptor[];
  listMetadata(): readonly NotificationMetadata[];
  getRegistryMetadata(): NotificationRegistryMetadata;
  getDiagnostics(): NotificationRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordPlatformCatalogue(version: string): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
}
```

---

## NotificationDescriptor

| Field              | Required | Description                                                  |
| ------------------ | -------- | ------------------------------------------------------------ |
| `routeId`          | ✅       | Stable route id (lowercase dot notation)                     |
| `eventPattern`     | ✅       | Event id or prefix pattern (metadata only — no subscription) |
| `notificationKind` | ✅       | EN-001 taxonomy kind                                         |
| `channel`          | ✅       | Delivery channel                                             |
| `templateRef`      | ✅       | Presentation template key                                    |
| `version`          | ✅       | Route definition semver                                      |
| `priority`         | Optional | Attention scaffold priority                                  |
| `permission`       | Optional | RBAC gate for future client filter                           |
| `status`           | Optional | `active` · `planned` · `disabled`                            |
| `label`            | Optional | Display name                                                 |
| `sourceCapability` | Optional | Declaring capability                                         |
| `schemaVersion`    | Optional | Defaults to `version`                                        |
| `visibility`       | Optional | `public` · `internal` · `restricted`                         |
| `stability`        | Optional | `stable` · `experimental` · `deprecated`                     |
| `description`      | Optional | Human-readable summary                                       |
| `tags`             | Optional | Classification tags                                          |
| `source`           | Optional | `builtin` · `manifest`                                       |

---

## Notification kinds (EN-001)

`toast` · `banner` · `inbox` · `in-app` · `email` · `sms` · `push` · `webhook`

---

## Delivery channels

`in-app` · `email` · `sms` · `push` · `webhook`

---

## Registration semantics

- Single `register()` throws on duplicate or validation failure
- `registerMany()` validates all then registers — throws on first duplicate
- `registerManyAtomic()` — all-or-nothing; registry unchanged on failure
- `replace()` updates existing route by `routeId`
- Retrieval APIs return frozen defensive copies

---

## Dependency injection

`createEventNotificationContext()` defaults to `createDefaultNotificationRegistry()`.

Mapper and service remain placeholders until EN-009 / EN-011.

---

## Boundaries (must not)

| Rule                   | EN-007 |
| ---------------------- | ------ |
| Deliver notifications  | ❌     |
| Subscribe to Event Bus | ❌     |
| Publish events         | ❌     |
| Execute mappers        | ❌     |
| Persist notifications  | ❌     |

---

## Related

- [Notification metadata](./SPR-006-ENF-notification-metadata.md)

---

_SPR-006 Notification Registry — EN-007._
