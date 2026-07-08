# LAW-001-02 — UX Foundation Specification

> **Story:** LAW-001-02 — Platform UX Foundation  
> **Application:** `@apzhub/law-platform`  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**

---

## Purpose

Define the reusable UX foundation consumed by every Law Platform module. Modules must compose these layouts and components; they must not invent alternate shells, spacing systems, or presentation primitives.

---

## Architectural rule

| Rule                  | Detail                                                        |
| --------------------- | ------------------------------------------------------------- |
| Consume Platform 5.0  | Use `@apzhub/ui`, `@apzhub/theme`, `@apzhub/workspace`        |
| No platform extension | No changes to framework packages                              |
| Application-owned UX  | All Law UX lives under `apps/law-platform/components/ux/`     |
| Presentation only     | No business logic, APIs, database, or search/filter behaviour |

---

## UX patterns

### Page types

| Pattern               | Layout component      | Use when                                   |
| --------------------- | --------------------- | ------------------------------------------ |
| Standard module shell | `LawWorkspaceLayout`  | Every module view                          |
| List index            | `LawListPageLayout`   | Module lists (clients, matters, documents) |
| Record detail         | `LawDetailPageLayout` | Single entity detail                       |
| Create / edit         | `LawFormPageLayout`   | Forms with sections and actions            |

### State patterns

| Pattern | Component                                                                   | Variants                                                                |
| ------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Empty   | `LawEmptyState`                                                             | `no-clients`, `no-matters`, `no-documents`, `no-results`, `coming-soon` |
| Loading | `LawLoadingSkeleton`, `LawTableLoadingSkeleton`, `LawDetailLoadingSkeleton` | Row count configurable                                                  |
| Error   | `LawErrorState`                                                             | Optional retry action                                                   |

### Interaction shells (no logic)

| Pattern                    | Component                                                      |
| -------------------------- | -------------------------------------------------------------- |
| Search container           | `LawSearchBar`                                                 |
| Filter container           | `LawFilterBar`                                                 |
| Pagination controls        | `LawPagination`                                                |
| Side panel                 | `LawSidePanel`                                                 |
| Confirm / delete / success | `LawConfirmationDialog`, `LawDeleteDialog`, `LawSuccessDialog` |

---

## Spacing

CSS tokens in `apps/law-platform/app/globals.css`:

| Token                    | Value   | Usage           |
| ------------------------ | ------- | --------------- |
| `--law-ux-space-page`    | 1.5rem  | Page padding    |
| `--law-ux-space-section` | 1rem    | Section gaps    |
| `--law-ux-space-stack`   | 0.75rem | Vertical stacks |

Tailwind utility classes via `lawUxTokens` in `components/ux/tokens.ts`.

---

## Typography

| Token                   | Size     | Usage            |
| ----------------------- | -------- | ---------------- |
| `--law-ux-font-display` | 1.5rem   | Page titles      |
| `--law-ux-font-section` | 1.125rem | Section headings |
| `--law-ux-font-body`    | 0.875rem | Body copy        |
| `--law-ux-font-label`   | 0.75rem  | Eyebrow labels   |

Page headers use `LawPageHeader` — do not create ad-hoc `<h1>` styling in modules.

---

## Colour usage

| Role        | Source                              | Usage                                           |
| ----------- | ----------------------------------- | ----------------------------------------------- |
| Primary     | `--law-primary` / `--color-primary` | Primary actions, brand emphasis                 |
| Accent      | `--law-accent`                      | Eyebrows, tab active state, empty state borders |
| Surface     | `--color-surface`                   | Cards, panels, tables                           |
| Muted       | `--color-muted-foreground`          | Subtitles, helper text                          |
| Destructive | `--color-destructive`               | Error states, delete dialog                     |
| Success     | `--color-success`                   | Status cards, success dialog                    |
| Warning     | `--color-warning`                   | Warning cards                                   |

Modules must not introduce new brand colours.

---

## Component hierarchy

```text
DesktopShell (@apzhub/workspace)
└── LawWorkspaceLayout
    ├── LawPageHeader (+ optional LawBreadcrumbs)
    ├── Toolbar slot (Workbench toolbar or form actions)
    ├── Content
    │   ├── LawListPageLayout children
    │   ├── LawDetailPageLayout children
    │   └── LawFormPageLayout children
    └── LawSidePanel (optional context)
```

---

## Future module usage

1. Import from `@/components/ux` (barrel).
2. Choose the layout matching the page type.
3. Pass module content into layout slots — never replace the layout.
4. Use standard cards, empty, loading, and error components for states.
5. Wire business logic in module containers — not in UX components.

Live catalogue: Administration module → **UX Foundation gallery**.

---

## Platform 5.0 frameworks exercised

| Framework                       | Usage                             |
| ------------------------------- | --------------------------------- |
| **@apzhub/ui**                  | Button, Card, Input primitives    |
| **@apzhub/theme**               | CSS variables, light/dark theming |
| **@apzhub/workspace**           | DesktopShell workbench chrome     |
| **@apzhub/workbench-framework** | Toolbar region via existing shell |

---

_LAW-001-02 UX Foundation Specification._
