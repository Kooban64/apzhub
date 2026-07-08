# SPR-006 — Event Manifest Bootstrap

> **Story:** EN-005  
> **Status:** Implemented  
> **Authority:** [Event manifest schema](./SPR-006-ENF-event-manifest.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## Purpose

Define **manifest-driven Event Registry bootstrap** — register platform event definitions from the built-in catalogue and capability manifests. Definitions only — no publish, subscribe, notifications, or persistence.

---

## Bootstrap sequence

```text
1. registerPlatformEventCatalogue()   — atomic
2. extractEventDescriptorsFromCapabilities()
3. registerManyAtomic()               — atomic
4. recordManifestCapabilities()
5. buildEventRegistryHydrationDiagnostics()
```

`bootstrapEventRegistry()` orchestrates both phases. Capability registration is skipped when platform registration fails. Manifest registration is atomic — failures leave prior platform registrations intact.

---

## Components

| Component                                 | Path                                        | Role                         |
| ----------------------------------------- | ------------------------------------------- | ---------------------------- |
| `bootstrapEventRegistry`                  | `src/catalogue/bootstrap-event-registry.ts` | Composition root             |
| `registerPlatformEventCatalogue`          | `src/catalogue/register-platform-events.ts` | Built-in catalogue           |
| `extractEventDescriptorsFromCapabilities` | `src/extraction/extract-events.ts`          | Manifest extraction          |
| `populateRegistryFromCapabilities`        | `src/extraction/populate-registry.ts`       | Atomic manifest registration |
| `parseEventManifestEntry`                 | `src/extraction/event-manifest-schema.ts`   | Manifest validation          |
| `mapPlatformCapabilitiesToEventRecords`   | `src/server/map-capability-records.ts`      | Runtime snapshot adapter     |

---

## Manifest extraction

Supports:

| Form                     | Example                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| Inline `events[]` block  | `manifest.events: [{ id, version, category, publisher, payload }]` |
| Standalone `event` block | `manifest.event: { id, version, ... }`                             |

Worker-style `events: { subscribes: [...] }` blocks are **ignored** — they declare subscriptions, not publishable event definitions.

Extraction is **atomic**: validation errors or duplicate ids across capabilities produce zero extracted descriptors.

---

## Duplicate policy

Fail-fast (ADR-0013 spirit):

| Conflict                                                         | Result                                   |
| ---------------------------------------------------------------- | ---------------------------------------- |
| Duplicate id within extraction batch                             | Extraction fails                         |
| Duplicate id vs existing registry (including platform catalogue) | `registerManyAtomic` fails               |
| Invalid manifest entry                                           | Extraction fails with `VALIDATION` issue |

---

## Event source metadata

Each registered descriptor carries `source`:

| Value      | Origin                         |
| ---------- | ------------------------------ |
| `builtin`  | Platform Event Catalogue       |
| `manifest` | Capability manifest extraction |

`EventMetadata.source` exposes the origin for diagnostics and future DTO filtering (EN-006).

---

## Bootstrap result

```typescript
interface BootstrapEventRegistryResult {
  readonly ok: boolean;
  readonly registry: EventRegistry;
  readonly diagnostics: EventRegistryHydrationDiagnostics;
  readonly platform: PlatformEventRegistrationResult;
  readonly capabilities: ManifestEventRegistryPopulationResult;
  readonly errors: readonly EventRegistrationIssue[];
}
```

---

## Boundaries (must not)

| Rule                   | EN-005 |
| ---------------------- | ------ |
| Publish events         | ❌     |
| Subscribe to Event Bus | ❌     |
| Create notifications   | ❌     |
| Wire Action audit hook | ❌     |
| Persist events         | ❌     |

---

## Related

- [Platform event catalogue](./SPR-006-ENF-platform-event-catalogue.md)
- [Event manifest schema](./SPR-006-ENF-event-manifest.md)
- [Event registry](./SPR-006-ENF-event-registry.md)

---

_SPR-006 Event Manifest Bootstrap — EN-005._
