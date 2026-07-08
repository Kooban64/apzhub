# LAW-001-02 — Component Catalogue

> **Import:** `import { … } from "@/components/ux"`

---

## Layouts

| Component             | Test ID                  | Description           |
| --------------------- | ------------------------ | --------------------- |
| `LawWorkspaceLayout`  | `law-workspace-layout`   | Standard module shell |
| `LawListPageLayout`   | `law-list-page-layout`   | List index page       |
| `LawDetailPageLayout` | `law-detail-page-layout` | Record detail page    |
| `LawFormPageLayout`   | `law-form-page-layout`   | Create/edit form page |

---

## Chrome

| Component             | Test ID           | Description              |
| --------------------- | ----------------- | ------------------------ |
| `LawPageHeader`       | `law-page-header` | Title, subtitle, actions |
| `LawPageHeaderButton` | —                 | Styled action button     |
| `LawBreadcrumbs`      | `law-breadcrumbs` | Navigation trail         |

---

## Data presentation

| Component       | Test ID          | Description          |
| --------------- | ---------------- | -------------------- |
| `LawSearchBar`  | `law-search-bar` | Search container     |
| `LawFilterBar`  | `law-filter-bar` | Filter container     |
| `LawDataTable`  | `law-data-table` | Presentational table |
| `LawPagination` | `law-pagination` | Page controls        |
| `LawTabs`       | `law-tabs`       | Detail tab list      |

---

## Cards

| Component             | Test ID                  | Description         |
| --------------------- | ------------------------ | ------------------- |
| `LawInformationCard`  | `law-information-card`   | General information |
| `LawStatisticsCard`   | `law-statistics-card`    | Metric display      |
| `LawWarningCard`      | `law-warning-card`       | Warning callout     |
| `LawStatusCard`       | `law-status-card`        | Status label/value  |
| `LawQuickActionsCard` | `law-quick-actions-card` | Action button group |

---

## States

| Component                  | Test ID                       | Description        |
| -------------------------- | ----------------------------- | ------------------ |
| `LawEmptyState`            | `law-empty-state-{variant}`   | Empty placeholders |
| `LawEmptyStateAction`      | —                             | Empty state button |
| `LawLoadingSkeleton`       | `law-loading-skeleton`        | Generic skeleton   |
| `LawTableLoadingSkeleton`  | `law-table-loading-skeleton`  | Table loading      |
| `LawDetailLoadingSkeleton` | `law-detail-loading-skeleton` | Detail loading     |
| `LawErrorState`            | `law-error-state`             | Error presentation |

---

## Overlays

| Component               | Test ID                   | Description             |
| ----------------------- | ------------------------- | ----------------------- |
| `LawSidePanel`          | `law-side-panel`          | Right-side panel        |
| `LawConfirmationDialog` | `law-confirmation-dialog` | Confirm action          |
| `LawDeleteDialog`       | `law-delete-dialog`       | Delete confirmation     |
| `LawSuccessDialog`      | `law-success-dialog`      | Success acknowledgement |

---

## Showcase

| Component                | Test ID                     | Description                                   |
| ------------------------ | --------------------------- | --------------------------------------------- |
| `LawUxFoundationGallery` | `law-ux-foundation-gallery` | Interactive catalogue (Administration module) |

---

## Tokens

| Export                 | Description                   |
| ---------------------- | ----------------------------- |
| `lawUxTokens`          | Shared Tailwind class strings |
| `LAW_EMPTY_STATE_COPY` | Default empty state copy      |
| `LawEmptyStateVariant` | Empty state variant union     |

---

_LAW-001-02 Component Catalogue._
