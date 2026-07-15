# APZ TCMS — Testing UX Guide

**Product:** APZ TCMS  
**Module:** Testing (`testing`)  
**Milestone:** APZTCMS-010  
**Authority:** [006](../006-design-system-ui-component-architecture.md) · [016](../016-desktop-shell-architecture-user-experience-framework.md) · [UI Architecture](./APZHUB-APZ-TCMS-UI-Architecture.md)

---

## Design principles

| Principle | APZTCMS-010 implementation |
| --------- | -------------------------- |
| Presentation only | Views render view models; no domain logic |
| Tokens only | CSS variables (`--color-*`) — no hardcoded colours |
| Shared primitives | `testing-ui.tsx` — no one-off TCMS visual language |
| Lucide icons | Manifest references `flask-conical`, etc. via shell |
| Empty / loading / error | Consistent `EmptyState`, `LoadingState`, `ErrorState` |
| Permission-driven | Controls hidden when permission missing |
| Server authoritative | UI gating is UX only — not security |

---

## Layout and panels

All views use `PageShell` inside the DEF **Workspace** region:

```text
┌─────────────────────────────────────────┐
│ Testing (label) · Breadcrumbs           │
│ H1 Title                    [Actions]   │
│ Description                             │
├─────────────────────────────────────────┤
│ FilterBar (search) — list views         │
├─────────────────────────────────────────┤
│ TestingTable / stat cards / Panels      │
└─────────────────────────────────────────┘
```

### Panel usage

| View | Panels |
| ---- | ------ |
| Certification detail | State, Recommendation, Gates, Approval history, Audit history, Commands |
| Release readiness | One `Panel` per release with dimension table |
| Execution detail | State, Steps, Evidence, Commands |

`Panel` uses `aria-label` matching the panel title for screen-reader context.

---

## Filters

List views with search use `FilterBar` (`role="search"`):

- Requirements, Plans, Suites, Cases, Executions, Automation, Evidence, Defects, Certification
- Debounced via React state → TanStack Query `TestingListParams.search`
- Grid layout: responsive `md:grid-cols-2 lg:grid-cols-4`

---

## Tables and navigation

`TestingTable` provides:

- Semantic `<table>` with `<caption>` (sr-only where set)
- Column headers with `scope="col"`
- Keyboard-accessible row navigation (`tabIndex={0}`, Enter/Space activates)
- `data-testid` hooks for E2E (`testing-row-{id}`)

Row click navigates to detail routes for plans, executions, and certifications.

---

## Themes

Testing views inherit platform theme tokens (dark/light) via the shell. No module-specific theme overrides. `StatusBadge` and `TestingStatCard` use semantic border/foreground tokens with optional `data-tone` on stat cards.

---

## Accessibility (WCAG AA target)

| Area | Implementation |
| ---- | -------------- |
| Headings | Single H1 per view via `PageShell` |
| Loading | `role="status"` on `LoadingState` |
| Errors | `role="alert"` on `ErrorState` and command errors |
| Tables | Captions, scoped headers, keyboard row activation |
| Breadcrumbs | `<nav aria-label="Breadcrumb">` on detail views |
| Axe | Playwright spec asserts no critical/serious violations on dashboard |
| Viewports | E2E validates desktop (1440×900) and mobile (390×844) |

Permission gating behaviour is validated in **Vitest** component tests; Playwright asserts shell load, navigation, and axe on representative routes.

---

## Evidence — metadata only

The Evidence view and execution detail evidence lists show:

- Title, kind, content type, formatted size (`formatBytes`), status, timestamps

**Excluded in APZTCMS-010:**

- File picker / drag-and-drop upload
- Binary download or inline preview
- Object storage integration

`submit_evidence` command registers metadata (title + execution link) in the mock client only.

---

## Certification — advisory display

Certification detail renders recommendations with explicit advisory labelling:

1. Recommendation badge in dedicated **Recommendation** panel
2. When `recommendationAdvisoryOnly` is true, displays: *“Advisory only — does not override gate evaluation or approval workflow.”*
3. Approve / reject buttons require `certification.approve` / `certification.reject` — never triggered automatically
4. Gate table shows evaluator, reason, and timestamp for explainability

No AI-generated suggestions in APZTCMS-010 (deferred to APZTCMS-011).

---

## Commands panel UX

`TestingCommandsPanel` variants:

| Variant | Context required | Extra inputs |
| ------- | ---------------- | ------------ |
| `execution` | `executionId` optional (start uses case ID) | Case ID, evidence title |
| `certification` | `certificationId` | Optional comment |

Buttons use `data-testid` hooks (`testing-command-approve`, etc.). Errors display inline with `role="alert"`.

---

## Responsive behaviour

- Stat cards: `sm:grid-cols-2 lg:grid-cols-4`
- Certification detail: `lg:grid-cols-2` for state/recommendation panels
- Tables: horizontal scroll wrapper (`overflow-x-auto`)
- E2E confirms dashboard usability on mobile viewport

---

## Related

- [Testing View Catalogue](./APZHUB-APZ-TCMS-Testing-View-Catalogue.md)
- [Testing Workbench Architecture](./APZHUB-APZ-TCMS-Testing-Workbench-Architecture.md)
- [Recommendation Model](./APZHUB-APZ-TCMS-Recommendation-Model.md)
- [Evidence Lifecycle](./APZHUB-APZ-TCMS-Evidence-Lifecycle.md)
