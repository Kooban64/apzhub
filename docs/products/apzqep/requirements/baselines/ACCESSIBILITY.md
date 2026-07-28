# Accessibility

Baseline surfaces reuse the shared `QepPageShell`/`QepTable`/`QepPanel`
components already validated for the Requirements views, so table semantics
(`<caption>`, `scope="col"`), status regions (`role="status"`/`role="alert"`),
and focusable interactive elements are consistent across the module. Status is
always rendered as text plus a badge, never colour alone. Confirmation panels
use visible text labels rather than icon-only controls, and every form field has
an associated `<label>` via the shared `Input` component. Targets WCAG AA,
consistent with Document 006.
