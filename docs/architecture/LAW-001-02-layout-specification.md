# LAW-001-02 — Layout Specification

> **Authority:** [UX Foundation Specification](./LAW-001-02-ux-foundation-specification.md)

---

## Workspace layout

**Component:** `LawWorkspaceLayout`  
**File:** `apps/law-platform/components/ux/layouts/workspace-layout.tsx`

```text
┌─────────────────────────────────────────────────────────────┐
│ Header slot (LawPageHeader, breadcrumbs)                    │
├─────────────────────────────────────────────────────────────┤
│ Toolbar slot (optional — workbench toolbar or form actions)  │
├──────────────────────────────────────┬──────────────────────┤
│ Main content                         │ Context panel slot   │
│                                      │ (LawSidePanel)       │
└──────────────────────────────────────┴──────────────────────┘
```

| Slot           | Required    | Content                                    |
| -------------- | ----------- | ------------------------------------------ |
| `header`       | Recommended | `LawPageHeader`, optional `LawBreadcrumbs` |
| `toolbar`      | Optional    | Workbench toolbar content or form actions  |
| `children`     | Required    | Module body                                |
| `contextPanel` | Optional    | `LawSidePanel`                             |

---

## List page layout

**Component:** `LawListPageLayout`

```text
LawWorkspaceLayout
└── section
    ├── searchArea (default: LawSearchBar)
    ├── filtersArea (default: LawFilterBar)
    ├── state (empty / loading / error)
    ├── table (LawDataTable or module table)
    └── pagination (default: LawPagination)
```

| Slot          | Default         | Override when                                |
| ------------- | --------------- | -------------------------------------------- |
| `searchArea`  | `LawSearchBar`  | Module adds trailing actions                 |
| `filtersArea` | `LawFilterBar`  | Module composes filter controls as children  |
| `state`       | none            | Show `LawEmptyState` or `LawLoadingSkeleton` |
| `table`       | required        | Module provides columns via `LawDataTable`   |
| `pagination`  | `LawPagination` | Module wires page handlers later             |

---

## Detail page layout

**Component:** `LawDetailPageLayout`

```text
LawWorkspaceLayout
└── section
    ├── summaryCards (grid 2–4 columns)
    ├── tabs (LawTabs)
    └── grid
        ├── properties + timeline (main)
        └── documents + activity (aside)
```

Placeholder regions use `data-testid`:

- `law-detail-properties`
- `law-detail-timeline`
- `law-detail-documents`
- `law-detail-activity`

---

## Form page layout

**Component:** `LawFormPageLayout`

```text
LawWorkspaceLayout
├── toolbar: Cancel + Save (default) or custom toolbar
└── section
    ├── validationSummary (optional)
    └── sections (module form sections)
```

Default toolbar buttons call optional `onCancel` / `onSave` handlers. Modules replace `toolbar` slot when additional actions are required.

---

## Responsive behaviour

| Breakpoint | Behaviour                                          |
| ---------- | -------------------------------------------------- |
| `< md`     | Summary cards stack single column                  |
| `md+`      | Summary cards 2 columns                            |
| `xl+`      | Detail main/aside split; context panel fixed width |

---

_LAW-001-02 Layout Specification._
