# Test Suite UX — APZQEP-140-A

## Product-first principles

1. Workspace and domain designed together
2. Lifecycle actions visible and permission-gated via API errors
3. Tree / list / card parity for the same suite set
4. Activity timeline as governance surface
5. Accessible filters, keyboard-focusable links, status badges

## Views

- **List** — dense operational table
- **Tree** — hierarchy / folders / parent–child
- **Card** — scanning and selection
- **Detail** — authoritative suite workspace pane

## Accessibility

WCAG AA target via shared `@apzhub/ui` controls, semantic headings, `aria-label` on filters, `role="alert"` on errors, `sr-only` table captions.
