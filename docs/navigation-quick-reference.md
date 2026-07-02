# APZHUB Navigation Framework quick reference

Derived lookup for [017](./017-navigation-framework-workspace-navigation-architecture.md).

> **Document Version:** 1.0 · **Platform Specification · Foundation Standard**  
> Shell regions: [016](./016-desktop-shell-architecture-user-experience-framework.md). DEF & permissions: [005](./005-desktop-experience-workspace-framework.md). Module registration: [008](./008-module-plugin-connector-architecture.md). Session persistence: [018](./018-workspace-sessions-window-management-state-persistence-framework.md). Command palette: [019](./019-universal-command-palette-action-framework.md). Unified search: [020](./020-unified-search-knowledge-discovery-framework.md). Notifications: [021](./021-notification-activity-attention-management-framework.md).

## Core rule

**Navigation is a platform capability.** Modules contribute metadata; Desktop Shell renders. Users never navigate backend systems.

## Philosophy (three questions)

Where am I? · What can I do? · Where can I go next?

## Principles

Consistent · predictable · minimal · fast · discoverable · **permission aware** · keyboard friendly · extensible · context sensitive

## Four-level hierarchy

| Level | Region               | Purpose                                                         |
| ----- | -------------------- | --------------------------------------------------------------- |
| 1     | Activity Bar         | Select platform workspace                                       |
| 2     | Workspace Sidebar    | Nav within selected workspace                                   |
| 3     | Workspace Navigation | Tabs, lists, trees, breadcrumbs, filters, views, saved searches |
| 4     | Context Navigation   | Actions for active record (Context Panel)                       |

## Activity Bar workspaces (examples)

Home · Projects · Support · Documents · Testing · Automation · Analytics · Compliance · Security · Administration — **registered dynamically, never hardcoded**

## Workspace Sidebar

Changes only when workspace changes — e.g. Projects: Dashboard, Projects, Boards, Tasks, Calendar, Reports, Templates, Settings

## Context navigation (examples)

Properties · history · comments · attachments · workflow · audit · related items · AI insights (future)

## Module registration (required)

Workspace · sidebar items · commands · routes · permissions · icons · badges · shortcuts · search providers → shell builds nav dynamically (008, 011)

## Navigation metadata fields

ID · display name · description · icon · permission · order · badge · visibility rules · workspace — **platform-owned**; user-facing names per 002

## Permission awareness (mandatory)

Show only authorised items · hidden = undiscoverable · evaluate **before** render · server authoritative (PermissionService, 005, 007) · re-validate on deep link & restore

## Persisted state

Expanded/collapsed sections · selected workspace/view · sidebar width · pinned items · recent locations — **permission-checked on restore**

## Breadcrumbs

Always reflect current context — e.g. Projects → Project Alpha → Sprint 12 → Task 458

## Favourites & recent

Platform-managed favourites (projects, documents, tickets, dashboards, reports, workflows, people, saved searches) and recently visited — **permission-filtered on display**

## Badges

Unread · assigned · pending approval · failed jobs · alerts · warnings — dynamic; modules via platform services (009), not shell mutation

## Search integration

Global · workspace · command palette · quick open — **must not duplicate navigation**; results permission-filtered

## Keyboard

Arrows · Tab · Shift+Tab · Enter · Escape · quick open · workspace switch · command palette — full functionality (006, 016)

## Context menus

Pin · rename · open in new workspace · copy link · favourite · recent · admin actions — consistent; admin actions permission-gated

## Drag & drop (future)

Reorder favourites/workspaces · pin sections · dock · custom layouts — architecture must accommodate

## Responsive

Desktop: permanent sidebar · tablet: collapsible · mobile: overlay — **no loss of permitted functionality** due to screen size

## Deep linking

Stable APZHUB routes (not engine URLs) — bookmark · share · restore · resume — auth + authz on arrival (010)

## Extensibility

Modules contribute workspaces, sidebar sections, commands, badges, search, status, nav groups — **cannot modify navigation framework**; declare permissions (008)

## Performance

Instant load · cache metadata · lazy modules · minimal refresh · thousands of items (004, 016)

## Accessibility (mandatory)

Keyboard · screen readers · ARIA · focus · high contrast · reduced motion — WCAG AA (006)

## Testing (015)

Unit · integration · **permission** · Playwright navigation · a11y · regression — verify hidden items not reachable via URL/search/commands

## Build rules

Metadata-driven · no hardcoded workspaces · permissions before render · engine-independent · keyboard-first · persist state

## Acceptance highlights

Dynamic workspace registration · permission-aware · persistent state · modules plug in without shell changes · full keyboard · deep links restore context · consistent across modules · scales to dozens of workspaces · **no permission leakage**
