# LAW-001-02 — UX Usage Guidelines

> **Audience:** Law Platform module authors (LAW-002+)

---

## Mandatory rules

1. **Always start with a layout** — `LawListPageLayout`, `LawDetailPageLayout`, or `LawFormPageLayout`.
2. **Never duplicate page chrome** — use `LawPageHeader` and `LawBreadcrumbs`.
3. **Never embed business logic in UX components** — containers pass handlers and content.
4. **Never add module-specific CSS for spacing or typography** — use `lawUxTokens`.
5. **Never create parallel empty/loading/error UI** — use foundation state components.

---

## Choosing a layout

| Module screen     | Layout                                      |
| ----------------- | ------------------------------------------- |
| Clients list      | `LawListPageLayout`                         |
| Client detail     | `LawDetailPageLayout`                       |
| New client form   | `LawFormPageLayout`                         |
| Dashboard widgets | `LawWorkspaceLayout` + cards                |
| Settings section  | `LawFormPageLayout` or `LawWorkspaceLayout` |

---

## Composing a list page

```tsx
<LawListPageLayout
  header={<LawPageHeader title="Clients" subtitle="Firm client directory" />}
  table={<LawDataTable columns={columns} rowCount={0} />}
  state={<LawEmptyState variant="no-clients" />}
/>
```

Add `filtersArea`, `searchArea`, and `pagination` overrides only when the default shells are insufficient.

---

## Composing a detail page

```tsx
<LawDetailPageLayout
  header={<LawPageHeader title="Client name" />}
  summaryCards={<LawStatisticsCard label="Open matters" value="0" />}
  tabs={<LawTabs items={tabs} activeId={activeId} onChange={setActiveId} />}
  properties={<LawInformationCard title="Details">…</LawInformationCard>}
  timeline={<LawInformationCard title="Timeline">…</LawInformationCard>}
/>
```

---

## Empty states

| Scenario                   | Variant                                       |
| -------------------------- | --------------------------------------------- |
| First use, no records      | `no-clients`, `no-matters`, or `no-documents` |
| Search returned nothing    | `no-results`                                  |
| Module not yet implemented | `coming-soon`                                 |

Override `title` / `description` only when the default copy is inaccurate.

---

## Dialogs

Dialogs are controlled components (`open` prop). Modules own open state:

```tsx
<LawDeleteDialog
  open={open}
  title="Delete client"
  description="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
/>
```

No delete logic exists in the dialog component.

---

## Verification

Before merging a module story:

- [ ] Uses a foundation layout
- [ ] Uses foundation state components
- [ ] No new layout CSS outside `components/ux/`
- [ ] Component tests cover module containers, not duplicated UX tests

Reference implementation: **Administration → UX Foundation gallery**.

---

_LAW-001-02 UX Usage Guidelines._
