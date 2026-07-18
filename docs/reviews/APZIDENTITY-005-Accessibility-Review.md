# APZIDENTITY-005 — Accessibility Review

**Date:** 2026-07-17  
**Result:** PASS (no certification-blocking defects)

## Scope

Identity Administration Workbench (`platform-identity-view`, router, tables, forms, banners, diagnostics).

## Certified against APZHUB standards

| Criterion           | Evidence                                                           |
| ------------------- | ------------------------------------------------------------------ |
| Keyboard navigation | MetaTable rows `tabIndex` + Enter/Space; toolbar buttons focusable |
| Visible focus       | Shared Button/Input focus-visible rings from design system         |
| Accessible labels   | `aria-label` on create/update fields; toolbar `role="toolbar"`     |
| Tables              | `<table>` + `<caption class="sr-only">`; column headers            |
| Forms               | Labelled inputs; required attributes; pending disabled buttons     |
| Status banners      | `role="status"` capability banners                                 |
| Error states        | `role="alert"` ErrorState; non-colour-only text messages           |
| Loading / empty     | `role="status"` loading text; EmptyState titles                    |
| Semantic headings   | Page `h1` per section; detail `h2`/`h3`                            |

## Fixes in this milestone

None required — no certification-blocking a11y defects found. No Workbench redesign.

## Residual

Full automated axe suite across all 16 sections remains available for APZIDENTITY-006 wave closeout if desired; not a production blocker for the metadata plane.
