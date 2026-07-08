# SPR-006 — Event Manifest Schema

> **Story:** EN-001 · EN-005 (implementation)  
> **Status:** Implemented (bootstrap) · schema authority at EN-001  
> **Authority:** [Document 029 §6–7](../029-platform-event-sdk-event-bus-event-manifest-specification.md) · [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## Purpose

Define manifest schemas for event registration — inline capability block and standalone `event.yaml`.

---

## Inline capability manifest block

```yaml
events:
  - id: capability.example.created
    version: "1.0.0"
    category: capability
    label: Example Record Created
    publisher: example-capability
    subscribers:
      - notifications
      - activity
      - audit
    permission: example.write
    payload:
      exampleId:
        type: string
        required: true
      createdBy:
        type: string
        required: true
```

### Field reference

| Field         | Required | Description                                   |
| ------------- | -------- | --------------------------------------------- |
| `id`          | ✅       | Becomes `eventId` — lowercase dot-notation    |
| `version`     | ✅       | Semver                                        |
| `category`    | ✅       | Event taxonomy value                          |
| `label`       | Optional | Diagnostics display                           |
| `publisher`   | ✅       | Capability or service id                      |
| `subscribers` | Optional | Declared consumer ids                         |
| `permission`  | Optional | Publish or visibility gate                    |
| `payload`     | ✅       | Field name → type map                         |
| `status`      | Optional | `active` (default) · `planned` · `deprecated` |

---

## Standalone event.yaml (Document 029)

```yaml
event:
  id: integration.connector.sync.completed
  version: "1.0.0"
  category: integration
  label: Connector Sync Completed

publisher: plane-connector

subscribers:
  - notifications
  - activity
  - search

payload:
  connectorId: uuid
  recordCount: integer
  durationMs: integer
```

Discovery path: `events/` folder per BUILD-001 layout — same roots as capabilities.

---

## Normalisation

Manifest Engine normalises to internal `RegisteredEvent`:

| Manifest                | Internal                       |
| ----------------------- | ------------------------------ |
| `id` / `event.id`       | `eventId`                      |
| `event.version`         | `version`                      |
| shorthand payload types | Zod schema generation (EN-005) |

---

## Platform catalogue (built-in)

Events not requiring manifest files — registered in `PlatformEventCatalogue`:

| eventId                               | category   | publisher         |
| ------------------------------------- | ---------- | ----------------- |
| `capability.action.executed`          | capability | command-framework |
| `capability.action.failed`            | capability | command-framework |
| `system.platform.bootstrap.completed` | system     | platform-runtime  |
| `user.session.started`                | user       | auth              |

Full catalogue enumerated in EN-005 implementation.

---

## Validation rules

1. Duplicate `eventId` across manifests → bootstrap diagnostic warning; first wins or fail-fast per ADR-0013 policy (EN-005 decision)
2. Unknown `category` → bootstrap error
3. `planned` status → registered but publish rejected until `active`
4. Invalid payload schema → bootstrap error

---

_SPR-006 Event Manifest Schema — EN-001._
