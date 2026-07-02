# Document 006 — Enterprise Design System & UI Standards

> **Status:** Active — Design System standard (permanent foundation)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [005](./005-desktop-experience-workspace-framework.md)  
> **Relationship:** [022 — Presentation Engine](./022-presentation-engine-theme-framework-branding-architecture.md) defines themes, branding, white-label, Branding Service, and Theme Registry. [028 — UI Component SDK](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md) defines `component.yaml`, Component Registry, Storybook standards, and component development workflow implementing this document. [023 — User Preferences](./023-user-preferences-personalisation-workspace-experience-framework.md) defines appearance and accessibility preference categories.

## 1. Purpose

This document defines the official APZHUB Design System.

Every visual component, interaction, layout, animation and future module must conform to this standard.

The objective is to make the entire platform appear as though it was built by a single team at one point in time.

No component should appear to come from a different application.

---

## 2. Design Philosophy

The APZHUB interface should be:

- Professional
- Modern
- Minimal
- Enterprise
- Consistent
- Dense but readable
- Fast
- Accessible
- Productive

The design should favour productivity over decoration.

Every visual element should have a purpose.

---

## 3. Design Principles

The UI should follow these principles:

- Consistency over creativity.
- Function over decoration.
- Predictability over novelty.
- Efficiency over animation.
- Clarity over complexity.

Users should immediately recognise how components behave regardless of which module they are using.

Navigation and action components must still respect permission-driven visibility defined in [005](./005-desktop-experience-workspace-framework.md) — the Design System defines appearance and behaviour, not what is shown without authorisation.

---

## 4. Design Tokens

All styling must use design tokens.

Never hardcode values.

Tokens include:

- Colours
- Typography
- Spacing
- Borders
- Radius
- Elevation
- Opacity
- Animation
- Transitions
- Breakpoints
- Z-Index

Future themes must be able to replace tokens without changing component code.

---

## 5. Colour System

Use semantic colours rather than fixed colours.

Examples:

- Primary
- Secondary
- Success
- Warning
- Danger
- Info
- Surface
- Background
- Border
- Muted
- Accent
- Disabled
- Focus
- Hover
- Selected

Never reference colours by their actual names (e.g., `blue500`) in application code.

---

## 6. Typography

Use a consistent typography scale.

Levels include:

- Display
- Heading 1
- Heading 2
- Heading 3
- Section Title
- Card Title
- Body
- Body Small
- Caption
- Label
- Code

Typography should establish clear visual hierarchy.

---

## 7. Spacing

All spacing should use a predefined scale.

Never use arbitrary pixel values.

Spacing should apply consistently to:

- Margins
- Padding
- Component gaps
- Grid spacing
- Panel spacing
- Dialog spacing
- Form spacing

---

## 8. Grid System

Use a responsive grid.

Layouts should adapt smoothly.

Avoid fixed-width designs.

Support:

- Single column
- Two column
- Three column
- Dashboard layouts
- Resizable panels
- Nested layouts

---

## 9. Border Radius

Use consistent radius tokens.

Examples:

- None
- Small
- Medium
- Large
- Pill

Avoid mixing multiple corner styles within the same interface.

---

## 10. Elevation

Shadows should communicate hierarchy.

Levels include:

- None
- Low
- Medium
- High
- Overlay

Avoid excessive shadow effects.

---

## 11. Icons

Use a single icon library across the platform (**Lucide**, per Document 004).

Icons should:

- Be simple.
- Be recognisable.
- Have consistent sizing.
- Align properly with text.

Never mix icon styles.

---

## 12. Buttons

Every button belongs to one category.

- Primary
- Secondary
- Outline
- Ghost
- Danger
- Success
- Link
- Icon Button
- Split Button
- Loading Button

Buttons should have consistent:

- Height
- Padding
- Typography
- Hover behaviour
- Focus behaviour
- Disabled state
- Loading state

Permission-gated actions use the same button variants — unauthorised actions are not rendered (per 005), not styled differently as a substitute for authorisation.

---

## 13. Forms

All forms should behave consistently.

Includes:

- Labels
- Required indicators
- Descriptions
- Validation
- Inline help
- Error messages
- Success messages
- Disabled fields
- Read-only fields
- Progressive disclosure

Validation should occur as early as practical.

---

## 14. Input Controls

Standardise:

- Text
- Password
- Search
- Textarea
- Number
- Currency
- Date
- Time
- Dropdown
- Combobox
- Autocomplete
- Checkbox
- Radio
- Toggle
- Slider
- Tag Picker
- Multi-select

No custom behaviour unless justified.

---

## 15. Tables

Enterprise tables should support:

- Sorting
- Filtering
- Searching
- Pagination
- Column resize
- Column reorder
- Column visibility
- Bulk selection
- Export
- Sticky headers
- Virtual scrolling
- Saved views

Tables should remain performant with large datasets.

Use **TanStack Table** (per Document 004) within shared `DataTable` patterns.

---

## 16. Cards

Cards should follow a common structure.

- Header
- Actions
- Content
- Footer

Cards should never contain inconsistent spacing or typography.

---

## 17. Panels

Panels are primary layout containers.

Support:

- Resize
- Collapse
- Expand
- Pin
- Close
- Context menus
- Persistent size

Align with Desktop Framework panel behaviour in [005](./005-desktop-experience-workspace-framework.md).

---

## 18. Navigation Components

Standardise:

- Sidebar
- Breadcrumbs
- Tabs
- Menus
- Dropdowns
- Tree Views
- Accordions
- Activity Bar
- Command Palette

Navigation behaviour must remain identical throughout the platform.

Navigation **content** is permission-filtered; navigation **components** are shared and consistent.

---

## 19. Empty States

Every empty state should contain:

- Meaningful illustration or icon
- Explanation
- Primary action (if permitted)
- Optional secondary action

Never display blank screens.

---

## 20. Loading States

Avoid blocking the interface.

Use:

- Skeleton loaders
- Progress indicators
- Optimistic updates
- Background loading

Loading should feel responsive.

---

## 21. Error States

Error messages should include:

- Clear explanation
- Suggested resolution
- Retry option where appropriate
- Support reference if needed

Never expose stack traces.

Never expose backend engine errors directly.

---

## 22. Notifications

Support:

- Toast
- Banner
- Modal
- Inline
- Persistent notification centre

Notifications should prioritise importance.

---

## 23. Dialog Standards

Every dialog should contain:

- Title
- Description
- Primary action
- Secondary action
- Close action
- Keyboard support
- Escape handling
- Focus management

All modules use shared dialog components — no module-specific dialog styling (per 005).

---

## 24. Motion

Animations should communicate state.

Allowed:

- Fade
- Slide
- Expand
- Collapse
- Progress
- Skeleton shimmer

Avoid decorative animation.

Respect **reduced motion** preferences.

---

## 25. Accessibility

Every component must support:

- Keyboard navigation
- Screen readers
- ARIA attributes
- Visible focus
- High contrast
- Reduced motion

Accessibility is mandatory.

Target WCAG AA (per Document 004).

---

## 26. Responsive Behaviour

Desktop is primary.

Tablet is secondary.

Mobile is supported.

Components must gracefully adapt.

Never hide functionality without explicit approval.

Permission-gated functionality may be hidden per role — that is authorisation, not responsive removal.

---

## 27. Component Lifecycle

Every reusable component must include:

- Requirements
- API definition
- Examples
- Story/demo
- Unit tests
- Accessibility tests
- Playwright coverage where applicable
- Documentation

---

## 28. Component Naming

Use consistent names.

Examples:

- PrimaryButton
- DataTable
- PageHeader
- Panel
- WorkspaceTabs
- SearchInput
- CommandPalette
- NotificationCenter

Avoid vague names such as:

- Widget1
- Panel2
- Container
- Stuff

---

## 29. Reusability

Before creating a component:

- Search for an existing one.
- If a component can be reused, extend it rather than duplicate it.

Every reusable component belongs in the shared UI library (`/packages` per Document 004).

---

## 30. Design Reviews

No new UI component should be introduced without considering:

- Can an existing component be reused?
- Does it match the design language?
- Is it accessible?
- Is it testable?
- Is it documented?
- Does it support theming?

---

## 31. Build Order

The Design System must be built **before** business modules (alongside or immediately after the Desktop Framework shell from 005).

Implementation stack: **shadcn/ui** + **Tailwind CSS** + tokens (per Document 004), extended for APZHUB patterns — not one-off module styles.

---

## 32. Cursor Instructions

Cursor must build the Design System before building business modules.

Every new UI component must be added to the shared component library.

Avoid one-off implementations.

Optimise for consistency across the entire platform.

When uncertain, extend the Design System rather than inventing a new pattern.

---

## 33. Acceptance Criteria

The Design System is considered complete when:

- Every visible UI element is derived from shared components.
- Components behave consistently across modules.
- Themes can be applied globally via tokens.
- Accessibility standards are met.
- New modules can be developed without redefining UI behaviour.
- The platform presents a unified, polished, enterprise-grade appearance.

The Design System is a permanent foundation and must evolve carefully to maintain consistency across APZHUB.
