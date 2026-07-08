# Timeline UX (AT-012)

> **Package:** `@apzhub/activity-timeline-framework`  
> **Story:** AT-012

---

## Experience surfaces

| Surface id                    | Component                         | Layout                     |
| ----------------------------- | --------------------------------- | -------------------------- |
| `activity-timeline`           | `ActivityTimelineExperience`      | Inline region              |
| `activity-timeline-panel`     | `ActivityTimelinePanelExperience` | Bordered panel with header |
| `workbench-activity-timeline` | `WorkbenchActivityTimeline`       | Composer entry point       |

---

## List layout

Each date group renders:

1. Group label (`Today`, `Yesterday`, `Earlier`)
2. Activity cards with:
   - Title
   - Description (when present)
   - Relative timestamp (absolute `timestamp` on hover via `title`)
   - Optional **Open action** button when `actionRef` is present

Severity indicated by left border accent (info · warning · critical).

---

## States

| State   | Trigger                            | UI                                               |
| ------- | ---------------------------------- | ------------------------------------------------ |
| Loading | Registry hydration unavailable     | Skeleton (`activity-timeline-loading`)           |
| Empty   | Ready service with zero activities | "No recent activity" (`activity-timeline-empty`) |
| Ready   | One or more view models            | Grouped list                                     |

---

## Action delegation

User clicks **Open action** → `delegateActivityActionRef()` → `useCommandRegistry().execute()`.

Presentation components never execute actions directly.

---

## Empty copy defaults

| Field       | Default                                     |
| ----------- | ------------------------------------------- |
| Title       | No recent activity                          |
| Description | Activity will appear here as actions occur. |

Override via `emptyState` prop on experience components.

---

## Deferred UX (AT-013+)

- Viewed/unread affordances
- Pinning and filtering
- Search
- DesktopShell Context Panel tab registration
- Deep links

---

_Timeline UX — AT-012._
