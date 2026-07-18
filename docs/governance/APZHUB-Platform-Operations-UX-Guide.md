# APZHUB Platform Operations — UX Guide

> **Audience:** Designers and frontend engineers  
> **Milestone:** M8-03

---

## Principles

1. **Platform-owned** — Operations UX lives in `apps/web`, not in products.
2. **Workbench-native** — Use `DesktopShell`, sidebar navigation, existing Card/table patterns from `@apzhub/ui`.
3. **Read-first** — M8-03 is observability and light management; destructive actions deferred.
4. **Diagnostics reuse** — Show JSON diagnostics panels where detailed inspection is needed.

---

## Layout

- **Activity Bar:** Platform Operations (shield icon)
- **Sidebar:** 14 sections (Dashboard through Feature Flags)
- **Workspace:** `OpsPageShell` header + content (stat cards, tables, JSON panels)

Shared components: `apps/web/components/platform-operations/ops-ui.tsx`

| Component        | Use                                   |
| ---------------- | ------------------------------------- |
| `OpsPageShell`   | Page title and description            |
| `OpsStatCard`    | Dashboard metrics                     |
| `OpsTable`       | Tabular lists (users, roles, modules) |
| `OpsStatusBadge` | Health status chips                   |
| `OpsJsonPanel`   | Raw diagnostics                       |

---

## States

- **Loading:** `OpsLoadingState`
- **Error:** `OpsErrorState` with message
- **Empty:** Table empty row message

---

## Feature Flags placeholder

The Feature Flags section displays a card explaining governance-phase deferral — do not implement flag UI until M8-05.

---

## Tokens

Use semantic CSS variables only (`--color-foreground`, `--color-muted-foreground`, `--color-border`, `--color-surface`). No hardcoded palette values.
