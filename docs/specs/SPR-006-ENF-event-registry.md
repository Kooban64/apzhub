# SPR-006 — Event Registry Specification

> **Story:** EN-003  
> **Package:** `@apzhub/event-notification-framework`  
> **Status:** Implemented — registration layer complete  
> **Authority:** [Registry Pattern](../architecture/APZHUB-Registry-Pattern.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md) · [Event Framework](../architecture/event-framework.md)

---

## Purpose

The **Event Registry** is the authoritative in-memory index of **platform event definitions**. It validates descriptors, detects duplicates, supports atomic batch registration, and exposes diagnostics and metadata.

The registry **must not** publish events, subscribe to events, deliver notifications, execute handlers, or persist event instances.

---

## Responsibilities

| Responsibility       | Implementation                                                    |
| -------------------- | ----------------------------------------------------------------- |
| Register events      | `register`, `registerMany`, `registerManyAtomic`                  |
| Validate descriptors | `validateEventDescriptor`                                         |
| Duplicate detection  | Throws `EventRegistryDuplicateError`; atomic batch returns issues |
| Replace definition   | `replace`                                                         |
| Registry metadata    | `getMetadata`, `listMetadata`, `getRegistryMetadata`              |
| Diagnostics          | `getDiagnostics`                                                  |
| Bootstrap context    | `recordFrameworkVersion`, `recordManifestCapabilities`            |

---

## Interface

```typescript
interface EventRegistry {
  register(descriptor: EventDescriptor): void;
  registerMany(descriptors: readonly EventDescriptor[]): void;
  registerManyAtomic(
    descriptors: readonly EventDescriptor[],
  ): EventBatchRegistrationResult;
  replace(descriptor: EventDescriptor): void;
  has(eventId: string): boolean;
  get(eventId: string): EventDescriptor | undefined;
  getMetadata(eventId: string): EventMetadata | undefined;
  list(): readonly EventDescriptor[];
  listMetadata(): readonly EventMetadata[];
  getRegistryMetadata(): EventRegistryMetadata;
  getDiagnostics(): EventRegistryDiagnostics;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  recordFrameworkVersion(version: string): void;
  clear(): void;
}
```

Implementation: `DefaultEventRegistry` in `packages/event-notification-framework/src/event/default-event-registry.ts`.

---

## Validation rules

| Field              | Rule                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| `eventId`          | Required; lowercase dot notation `/^[a-z][a-z0-9.-]*$/`                          |
| `version`          | Required semver                                                                  |
| `category`         | Valid `EventCategory` — canonical: `system`, `user`, `capability`, `integration` |
| `publisher`        | Required non-empty (source capability)                                           |
| `sourceCapability` | Optional; defaults to `publisher` in metadata                                    |
| `schemaVersion`    | Optional semver; defaults to `version` in metadata                               |
| `visibility`       | `public` · `internal` · `restricted` (default `public`)                          |
| `stability`        | `stable` · `experimental` · `deprecated` (default `stable`)                      |
| `status`           | `active` · `planned` · `deprecated` (default `active`)                           |
| `tags`             | Optional string array; non-empty strings when present                            |
| `subscribers`      | Optional string array; documentation + future validation                         |

---

## Duplicate policy

| Operation            | Behaviour                                             |
| -------------------- | ----------------------------------------------------- |
| `register`           | Fail fast — throws `EventRegistryDuplicateError`      |
| `registerMany`       | Fail fast on first duplicate in batch or registry     |
| `registerManyAtomic` | Returns `{ ok: false }` — **no partial registration** |

---

## Immutability

Descriptors are deep-frozen at registration. `get()` and `list()` return defensive frozen copies.

---

## Dependency injection

`createEventNotificationContext()` defaults to `createDefaultEventRegistry()` (EN-003) and `createInProcessEventBus({ registry })` (EN-004) sharing the registry reference.

---

## Related documents

| Document                                                                 | Topic          |
| ------------------------------------------------------------------------ | -------------- |
| [SPR-006-ENF-event-metadata.md](./SPR-006-ENF-event-metadata.md)         | Metadata model |
| [SPR-006-ENF-event-architecture.md](./SPR-006-ENF-event-architecture.md) | Event taxonomy |

---

_SPR-006 Event Registry Specification — EN-003._
