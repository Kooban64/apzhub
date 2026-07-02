# APZHUB Design System quick reference

One-page lookup derived from [006](./006-enterprise-design-system-ui-standards.md), [022](./022-presentation-engine-theme-framework-branding-architecture.md), [023](./023-user-preferences-personalisation-workspace-experience-framework.md), and [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md). **006** = components & token rules. **022** = Presentation Engine. **023** = user preferences. **028** = UI Component SDK, `component.yaml`, Storybook.

## Philosophy

Professional · minimal · enterprise · dense-but-readable · productive — **function over decoration**.

Principles: consistency · predictability · efficiency · clarity.

## Tokens only (never hardcode)

Colours · typography · spacing · borders · radius · elevation · opacity · animation · transitions · breakpoints · z-index

Themes replace tokens — not component code. Semantic colours only (no `blue500` in app code).

## Semantic colours

Primary · secondary · success · warning · danger · info · surface · background · border · muted · accent · disabled · focus · hover · selected

## Typography scale

Display · H1–H3 · section title · card title · body · body small · caption · label · code

## Spacing

Predefined scale only — margins, padding, gaps, grid, panels, dialogs, forms.

## Layout

Responsive grid — 1/2/3 column · dashboards · resizable panels · nested layouts. No fixed-width designs.

## Radius tokens

None · small · medium · large · pill — one consistent style per interface.

## Elevation

None · low · medium · high · overlay — minimal shadows.

## Icons

**Lucide only** — consistent size, alignment; never mix libraries.

## Button variants

Primary · secondary · outline · ghost · danger · success · link · icon · split · loading — consistent height, padding, hover, focus, disabled, loading.

## Forms & inputs

Standard labels, validation, help, errors, disabled/read-only, progressive disclosure.

Inputs: text, password, search, textarea, number, currency, date/time, dropdown, combobox, autocomplete, checkbox, radio, toggle, slider, tag picker, multi-select.

## DataTable (TanStack Table)

Sort · filter · search · paginate · column resize/reorder/visibility · bulk select · export · sticky headers · virtual scroll · saved views · performant at scale.

## Cards

Header · actions · content · footer — consistent spacing.

## Panels

Resize · collapse · expand · pin · close · context menu · persistent size (align with DEF 005).

## Navigation components (shared behaviour)

Sidebar · breadcrumbs · tabs · menus · dropdowns · tree · accordion · activity bar · command palette — **content** permission-filtered (005).

## Empty / loading / error

**Empty:** icon + explanation + primary action (if permitted) — never blank screens.

**Loading:** skeletons, progress, optimistic updates, background load — avoid blocking UI.

**Error:** clear message + resolution + retry — no stack traces, no engine errors.

## Notifications

Toast · banner · modal · inline · notification centre — prioritise by importance.

## Dialogs (shared only)

Title · description · primary/secondary/close · keyboard · escape · focus trap — no module custom dialog styles.

## Motion

Fade · slide · expand · collapse · progress · skeleton shimmer — no decorative animation; respect reduced motion.

## Accessibility (mandatory, WCAG AA)

Keyboard · screen readers · ARIA · visible focus · high contrast · reduced motion.

## Responsive

Desktop primary · tablet secondary · mobile supported — adapt gracefully; don't hide functionality without approval.

## Component naming

`PrimaryButton` · `DataTable` · `PageHeader` · `Panel` · `WorkspaceTabs` · `SearchInput` · `CommandPalette` · `NotificationCenter` — not Widget1/Container/Stuff.

## Reusability

Search existing shared library (`/packages`) before creating new components. Extend, don't duplicate.

## Component lifecycle (each reusable component)

Requirements · API · examples · story/demo · unit tests · a11y tests · Playwright (where applicable) · documentation.

## Build order

**Design System before business modules** (with Desktop Framework 005). shadcn/ui + Tailwind + APZHUB tokens.

## Acceptance

All UI from shared components · consistent cross-module behaviour · global theming · a11y met · modules don't redefine UI patterns · unified enterprise appearance.
