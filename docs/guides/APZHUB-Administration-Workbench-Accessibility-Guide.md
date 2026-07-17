# Administration Workbench Accessibility Guide

**Milestone:** APZADMIN-004

## Patterns

- Page headings (`h1`) per section
- Toolbar with accessible name “Administration commands”
- Tables with captions (sr-only) and keyboard row selection (Enter/Space)
- Status and error regions use `role="status"` / `role="alert"`
- Filter inputs labelled
- WCAG AA target via shared Design System tokens/components

## Notices

Capability banners use `role="status"` so assistive tech announces management-plane limitations.
