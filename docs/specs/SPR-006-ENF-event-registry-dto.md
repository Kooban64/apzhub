# SPR-006 — Event Registry DTO

> **Story:** EN-006  
> **Status:** Implemented  
> **Authority:** [Event registry](./SPR-006-ENF-event-registry.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md) · ADR-0023 permission filter pattern

---

## Purpose

Define the **EventRegistryDto** — a read-only, server-authoritative projection of the Event Registry for permission filtering and future client hydration. Mirrors Action and Knowledge registry DTO patterns.

---

## DTO schema

```typescript
interface EventRegistryDto {
  readonly schemaVersion: 1;
  readonly frameworkVersion?: string;
  readonly events: readonly EventDescriptorDto[];
}

interface EventDescriptorDto {
  readonly eventId: string;
  readonly category: EventCategory;
  readonly version: string;
  readonly sourceCapability: string;
  readonly schemaVersion: string;
  readonly visibility: EventVisibility;
  readonly stability: EventStability;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly status: EventDescriptorStatus;
  readonly label?: string;
  readonly permission?: string;
  readonly subscribers: readonly string[];
  readonly source: "builtin" | "manifest";
}
```

---

## Versioning

| Field                              | Meaning                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `schemaVersion`                    | DTO wire format version (`EVENT_REGISTRY_DTO_SCHEMA_VERSION = 1`)             |
| `frameworkVersion`                 | Platform release stamped at bootstrap (`EVENT_NOTIFICATION_PLATFORM_VERSION`) |
| `EventDescriptorDto.schemaVersion` | Per-event payload schema version from registry metadata                       |
| `EventDescriptorDto.version`       | Event definition semver                                                       |

Both `schemaVersion` and `frameworkVersion` are required from day one on mapped DTOs.

---

## Mapping

`mapEventRegistryDto(registry)` produces an **unfiltered** DTO from in-memory registry metadata:

- Events sorted by `eventId`
- Frozen arrays — immutable projection
- No publish, subscribe, or handler references

Apply `filterEventRegistryDto()` before client hydration.

---

## Validation

`validateEventRegistryDto(unknown)` validates wire payloads before client hydration:

1. Object shape and `schemaVersion`
2. `events` array presence
3. Per-event descriptor validation (reuses registry validation rules)
4. Duplicate `eventId` detection
5. Non-empty `frameworkVersion` when provided

Returns structured `EventRegistryDtoValidationResult` — does not throw.

---

## Permission filtering

`filterEventRegistryDto(dto, permissionAdapter)` delegates to `WorkbenchPermissionAdapter.filter()`:

- Event Framework does **not** evaluate permissions inline
- Events without `permission` remain visible per adapter rules (ADR-0023)
- Preserves `schemaVersion` and `frameworkVersion`

---

## Hydration diagnostics

`buildEventRegistryHydrationDiagnostics(registry, visibleDto?)` reports:

| Field                                                         | Meaning                                |
| ------------------------------------------------------------- | -------------------------------------- |
| `registeredCount`                                             | Total registered events                |
| `filteredCount`                                               | Events visible after permission filter |
| `platformEventCount` / `capabilityEventCount`                 | Registered by source                   |
| `filteredPlatformEventCount` / `filteredCapabilityEventCount` | Visible by source                      |
| `platformVersion`                                             | Bootstrap framework version            |
| `manifestCapabilities`                                        | Manifest capability ids from bootstrap |

---

## Server exports

Available from `@apzhub/event-notification-framework/server/event`:

- `mapEventRegistryDto`
- `filterEventRegistryDto`
- `validateEventRegistryDto`
- `EVENT_REGISTRY_DTO_SCHEMA_VERSION`
- `buildEventRegistryHydrationDiagnostics`

---

## Boundaries (must not)

| Rule                   | EN-006      |
| ---------------------- | ----------- |
| Publish events         | ❌          |
| Subscribe to Event Bus | ❌          |
| Deliver notifications  | ❌          |
| Persist event data     | ❌          |
| Execute handlers       | ❌          |
| Client hydration       | ❌ (EN-010) |

---

_SPR-006 Event Registry DTO — EN-006._
