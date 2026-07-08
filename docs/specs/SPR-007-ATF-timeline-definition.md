# SPR-007 — Timeline Definition

> **Story:** AT-004  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Status:** Implemented — `TimelineDefinition` model  
> **Authority:** [Timeline Registry](./SPR-007-ATF-timeline-registry.md) · [ADR-0034](../adr/ADR-0034-activity-registry-and-timeline-model.md)

---

## 1. Purpose

Define **TimelineDefinition** — immutable metadata describing a timeline scope, behaviour, and presentation.

Timeline definitions are **not** timeline entries. They do not contain activities or historical data.

---

## 2. TimelineDefinition shape

```typescript
interface TimelineDefinition {
  readonly timelineId: string;
  readonly label: string;
  readonly description?: string;
  readonly scope: TimelineScopeId;
  readonly icon?: string;
  readonly order: number;
  readonly version: string;
  readonly visibility?: ActivityVisibility;
  readonly stability?: ActivityStability;
  readonly source?: "builtin" | "manifest";
  readonly supportedActivityCategories?: readonly ActivityCategory[];
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly status?: "active" | "planned" | "inactive";
}
```

---

## 3. Field reference

| Field                         | Required | Description                                                                                           |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `timelineId`                  | ✅       | Stable identifier — platform ids match scope (`timeline.personal`, etc.)                              |
| `label`                       | ✅       | User-facing name                                                                                      |
| `description`                 | Optional | Human-readable summary                                                                                |
| `scope`                       | ✅       | Locked scope id — `timeline.personal` · `timeline.team` · `timeline.organization` · `timeline.system` |
| `icon`                        | Optional | Lucide icon key                                                                                       |
| `order`                       | ✅       | Presentation sort order (lower first)                                                                 |
| `version`                     | ✅       | Definition semver                                                                                     |
| `visibility`                  | Optional | `public` · `internal` · `restricted` — default `public`                                               |
| `stability`                   | Optional | `stable` · `experimental` · `deprecated` — default `stable`                                           |
| `source`                      | Optional | `builtin` · `manifest` — default `manifest`                                                           |
| `supportedActivityCategories` | Optional | Allow-list of activity categories for presentation filtering                                          |
| `metadata`                    | Optional | Opaque presentation metadata (frozen on registration)                                                 |
| `status`                      | Optional | `active` · `planned` · `inactive` — default `active`                                                  |

---

## 4. Scope identifiers (locked)

| Scope id                | Role                                |
| ----------------------- | ----------------------------------- |
| `timeline.personal`     | Default personal timeline           |
| `timeline.team`         | Reserved — team collaboration       |
| `timeline.organization` | Reserved — organization context     |
| `timeline.system`       | Reserved — platform/security events |

---

## 5. Immutability

- Definitions are frozen via `freezeTimelineDefinition()` at registration
- Nested arrays (`supportedActivityCategories`) and `metadata` are deep-frozen
- Registry `get()` / `list()` return new frozen copies

---

## 6. Metadata projection

`buildTimelineMetadata(definition)` produces `TimelineMetadata` with:

- Normalised defaults for visibility, stability, status, source
- `TimelineEntryDiagnostics` with scope/category counts and status messages

See [Timeline Registry spec](./SPR-007-ATF-timeline-registry.md) § metadata.

---

## 7. Platform catalogue

`PLATFORM_TIMELINE_DEFINITIONS` exports four built-in definitions. Registration does **not** populate activities or generate timeline entries.

---

## 8. Related

- [Timeline Registry](./SPR-007-ATF-timeline-registry.md)
- [Activity document model](./SPR-007-ATF-activity-document.md)
- [Timeline model](./SPR-007-ATF-timeline-model.md)

---

_SPR-007 Timeline Definition — AT-004 implemented._
