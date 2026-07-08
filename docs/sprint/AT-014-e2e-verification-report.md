# AT-014 — E2E Verification Report

> **Story:** AT-014  
> **Spec:** `testing/playwright/e2e/spr-007-activity-timeline-framework.spec.ts`

---

## Environment

| Setting           | Value                                             |
| ----------------- | ------------------------------------------------- |
| Playwright config | `testing/playwright/playwright.config.ts`         |
| E2E hooks         | `NEXT_PUBLIC_E2E_TEST_HOOKS=true` (webServer env) |
| Base URL          | `http://localhost:3300`                           |

---

## Scenario results

### 1. Health endpoint

**Assert:** `GET /api/health` returns `activities` and `timelines` with:

- Bootstrap status `lastBootstrapStatus: "ok"`
- Activity mapper `mapperStatus: "ready"`, `subscriberRegistered: true`
- Timeline hydration `hydrationStatus: "hydrated"`
- Registered counts > 0

### 2. Authenticated shell

**Assert:** After sign-in to `/workspace/home`:

- `workbench-layout-with-context-panel` visible
- `activity-timeline-diagnostics` hidden with registry + hydration attributes
- `activity-timeline-experience-diagnostics` hidden with `data-empty="true"` initially

### 3. Context Panel

**Assert:**

- Activity tab label visible
- Empty state copy before actions
- Toggle hides/shows `activity-timeline-panel-experience`

### 4. Event pipeline + parallel notifications

**Flow:**

```text
executeWorkbenchAction("workbench.view.open")
  → Event Bus publish
  → Activity Mapper + Notification Mapper (parallel)
  → Activity Service + Notification Service
  → refreshActivityTimelinePresentation() [E2E hook]
  → Context Panel list renders activity item
  → Notification badge count > 0
```

**Assert:** Timeline item contains "Action executed"; badge shows unread count.

### 5. Action delegation

**Flow:**

```text
seedActivityActionDelegationFixture() [E2E hook]
  → refreshActivityTimelinePresentation()
  → Click "Open action" on fixture item
  → delegateActivityActionRef → CommandRegistry.execute()
  → Audit event → second activity in store
```

**Assert:** `getActivityCount()` increases after delegation.

### 6. Diagnostics guard

**Assert:** No visible `aside[data-testid$='-diagnostics']` elements.

---

## Hidden test IDs used

| testid                                                | Purpose                          |
| ----------------------------------------------------- | -------------------------------- |
| `activity-timeline-diagnostics`                       | Shell hydration + service counts |
| `activity-timeline-experience-diagnostics`            | Experience render state          |
| `workbench-context-panel`                             | Context Panel region             |
| `context-panel-tab-activity`                          | Activity tab registration        |
| `context-panel-toggle`                                | Panel visibility                 |
| `activity-timeline-panel-experience`                  | Panel experience chrome          |
| `activity-timeline-list` / `activity-timeline-item-*` | Rendered activities              |

---

## Known E2E workaround

Timeline Experiences do not subscribe to Activity Service mutations (deferred capability). E2E calls `refreshActivityTimelinePresentation()` to remount the Context Panel timeline via `activityTimelineRenderKey` — **test infrastructure only**, gated by `NEXT_PUBLIC_E2E_TEST_HOOKS`.

---

_AT-014 E2E Verification Report — SPR-007._
