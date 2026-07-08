# LAW-013 — Accessibility Review

**Date:** 2026-07-06  
**Scope:** LAW-013 UX changes (dashboard, tables, forms, search, feeds)

---

## Improvements Delivered

| Area           | Change                                                                    |
| -------------- | ------------------------------------------------------------------------- |
| Forms          | `LawFormValidationSummary` uses `role="alert"` and `aria-live="polite"`   |
| Forms          | Validation links anchor to `#field-{name}` for keyboard navigation        |
| Search         | `LawSearchBar` wrapped in `<form>` with submit; configurable `ariaLabel`  |
| Link lists     | Focus-visible outline on `LawLinkList` items                              |
| Dashboard      | Landmark sections with `aria-label` (Welcome, Global search, Key metrics) |
| Activity feeds | `role="list"` on feed lists                                               |

---

## Observations (not blocking LAW-013)

| Issue                              | Severity | Notes                                                                           |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------- |
| Table row selection via click only | Medium   | No keyboard row selection on list tables                                        |
| Tab panels                         | Low      | `LawTabs` should be audited for `aria-selected` and panel `id` wiring           |
| Colour contrast on status badges   | Low      | Warning/success tokens rely on CSS variables; formal contrast audit recommended |
| Skip links                         | Low      | No skip-to-content link in workbench shell                                      |
| Modal focus trap                   | Low      | Dialog components inherited from `@apzhub/ui`; not re-audited in LAW-013        |

---

## WCAG Target

LAW-013 addressed obvious gaps in new components. Full WCAG 2.1 AA certification was out of scope; recommend dedicated accessibility sprint before commercial GA.

---

## Verdict

**IMPROVED WITH OBSERVATIONS** — no regressions identified; foundational patterns support continued accessibility hardening.
