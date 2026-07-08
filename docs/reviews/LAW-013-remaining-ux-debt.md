# LAW-013 — Remaining UX Technical Debt

**Date:** 2026-07-06

---

## TD-UX-01 — Form validation summary rollout

`LawFormValidationSummary` wired to client form only. Matter, document, task, calendar, time, and invoice forms should adopt the same pattern.

## TD-UX-02 — CSV export parity

Client list has CSV export. Extend `downloadCsv` to matters, documents, tasks, calendar, time, and billing lists.

## TD-UX-03 — Print-friendly layouts

LAW-013-13 specified print-friendly layouts and PDF placeholders. Only CSV export was implemented; per-module print CSS and PDF placeholder pages remain.

## TD-UX-04 — Reports and Administration placeholders

These modules still show `LawEmptyState` coming-soon variants.

## TD-UX-05 — Table keyboard navigation

List tables support click selection but lack arrow-key row navigation and explicit `aria-sort` for future sortable columns.

## TD-UX-06 — Search recent searches UI polish

Recent searches exist in search context panel; keyboard shortcut documentation could be expanded in knowledge hydration.

## TD-UX-07 — Full accessibility audit

Skip links, tab panel ARIA, contrast certification, and screen reader walkthrough of all primary workflows.

## TD-UX-08 — Virtualised tables

When persistence-backed lists grow beyond demo sizes, adopt windowing for list tables.

## TD-UX-09 — Unsaved-change warnings

Form pages do not yet warn on navigation with dirty state.

## TD-UX-10 — Demo data depth

`demo-reference-data.ts` added; courts/organisations not yet wired into calendar event titles or matter custom fields.

---

## Priority for LAW-014 overlap

Items TD-UX-01, TD-UX-02, and TD-UX-09 can be addressed incrementally during API integration when forms and list endpoints stabilise.
