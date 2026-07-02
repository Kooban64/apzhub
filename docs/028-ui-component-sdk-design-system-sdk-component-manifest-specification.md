# Document 028 — UI Component SDK, Design System SDK & Component Manifest Specification

> **Document Version:** 1.0  
> **Classification:** Developer Specification  
> **Status:** Mandatory  
> **Applies To:** Desktop Shell · Every Shared Component · Every Module Component · Every Future Plugin · Storybook · Cursor · AI Development Agents  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)  
> **Relationship:** Implements the **Component SDK** category of [024 — APZHUB Platform SDK](./024-apzhub-platform-sdk-development-framework.md). Expands [006 — Enterprise Design System & UI Standards](./006-enterprise-design-system-ui-standards.md) with `component.yaml`, Component Registry, Storybook, and development workflow. Tokens and theming per [022 — Presentation Engine](./022-presentation-engine-theme-framework-branding-architecture.md). Shell integration per [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md). Modules compose shared components per [025](./025-module-sdk-module-manifest-module-development-standard.md) — no one-off module UI.

## 1. Purpose

The UI Component SDK defines the development standards, lifecycle, registration, testing and documentation requirements for every visual component within APZHUB.

Every visual element must be treated as a reusable platform asset.

Components are not module-specific unless there is a compelling architectural reason.

---

## 2. Core Philosophy

Every component should be:

- Reusable
- Theme-aware
- Accessible
- Independently testable
- Independently documented
- Versioned
- Discoverable
- Stateless where practical
- Platform-owned

A component should never belong to a business module unless it represents a truly unique business interaction.

---

## 3. Component Hierarchy

The UI Platform consists of:

Design Tokens

↓

Primitive Components

↓

Composite Components

↓

Workspace Components

↓

Business Components

↓

Module Views

Every layer builds upon the previous one.

Aligns with presentation layers in [022](./022-presentation-engine-theme-framework-branding-architecture.md).

---

## 4. Component Categories

### Primitive Components

**Examples:**

- Button
- Icon
- Typography
- Badge
- Divider
- Avatar
- Spinner
- Tooltip

---

### Composite Components

**Examples:**

- Search Bar
- Data Table
- Command Palette
- Form
- Modal
- Sidebar
- Navigation Tree
- Tabs
- Card

Shared library per [006](./006-enterprise-design-system-ui-standards.md) — shadcn/ui + Tailwind, TanStack Table for DataTable.

---

### Workspace Components

**Examples:**

- Workspace Header
- Activity Feed
- Dashboard Grid
- Split View
- Property Panel
- Inspector

Shell regions per [016](./016-desktop-shell-architecture-user-experience-framework.md).

---

### Business Components

**Examples:**

- Project Board
- Ticket Timeline
- Workflow Builder
- Analytics Dashboard

Business Components should reuse Composite Components wherever possible.

Business actions delegate to Platform Services via module views — not inside components ([027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)).

---

## 5. Component Manifest

Every reusable component begins with:

```text
component.yaml
```

The manifest defines the component contract.

Manifest-first per [024](./024-apzhub-platform-sdk-development-framework.md) Section 8.

---

## 6. Example Component Manifest

```yaml
component:
  id: data-table
  name: Data Table
  version: 1.0.0

metadata:
  category: composite

props:
  pagination:
    type: boolean

  sorting:
    type: boolean

  filtering:
    type: boolean

events:
  emits:
    - rowSelected
    - rowDoubleClicked

theme:
  supportsDarkMode: true

storybook:
  enabled: true

tests:
  unit: true
  accessibility: true
```

---

## 7. Component Registration

Every component registers:

- Identifier
- Name
- Version
- Category
- Props
- Events
- Slots (where applicable)
- Storybook entry
- Tests
- Documentation

Registration allows automatic discovery.

Component catalogue in shared `/packages/ui` per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 8. Component Responsibilities

Every component should:

- Render UI
- Manage local presentation state
- Raise events
- Consume design tokens
- Support accessibility
- Support themes

Components should never contain business rules.

No auth, permission enforcement, or integration calls in components (Section 19).

---

## 9. Design Token Consumption

Every component consumes:

- Colour Tokens
- Typography Tokens
- Radius Tokens
- Elevation Tokens
- Motion Tokens
- Spacing Tokens
- Icon Tokens

Hardcoded styling is prohibited.

Mandatory per [006](./006-enterprise-design-system-ui-standards.md) and [022](./022-presentation-engine-theme-framework-branding-architecture.md). Lucide icons only ([004](./004-technology-stack-repository-standards-development-environment.md)).

---

## 10. Component Events

Components emit UI events.

**Examples:**

- clicked
- selected
- opened
- closed
- changed
- submitted
- cancelled

Business actions belong to Platform Services.

Commands and actions execute via Platform Services ([019](./019-universal-command-palette-action-framework.md), [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)).

---

## 11. Accessibility

Every component must support:

- Keyboard Navigation
- Screen Readers
- ARIA Labels
- High Contrast
- Focus Indicators
- Reduced Motion
- Accessible Colour Contrast

Accessibility is mandatory.

WCAG AA per [006](./006-enterprise-design-system-ui-standards.md). Shell accessibility before modules ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 12. Storybook

Every reusable component requires Storybook documentation.

Storybook must include:

- Purpose
- Examples
- Props
- Events
- Variants
- Accessibility Notes
- Design Notes
- Usage Guidelines

Storybook becomes the visual component catalogue.

Self-hosted Storybook per [004](./004-technology-stack-repository-standards-development-environment.md) and [008](./008-module-plugin-connector-architecture.md) OSS first.

---

## 13. Component Testing

Every component requires:

- Unit Tests
- Interaction Tests
- Accessibility Tests
- Visual Regression Tests
- Playwright Tests (where appropriate)

No component is complete without automated tests.

Definition of Done per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 14. Component States

Every interactive component documents support for:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Success
- Empty

States should be visually consistent.

Shared empty/loading/error states per [006](./006-enterprise-design-system-ui-standards.md).

---

## 15. Component Versioning

Every component includes:

- Version
- Breaking Changes
- Migration Notes
- Deprecation Status

The UI Platform should support gradual evolution.

Release standards per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 16. Component Composition

Prefer composition over inheritance.

Large components should be assembled from smaller reusable components.

Avoid duplication.

Per [003](./003-overall-system-architecture-design-principles.md) — composition over inheritance.

---

## 17. Workspace Integration

Components may register support for:

- Desktop Shell
- Dashboard
- Sidebar
- Context Panel
- Forms
- Reports

The Desktop Shell determines placement.

Modules register views; shell owns chrome ([016](./016-desktop-shell-architecture-user-experience-framework.md), [025](./025-module-sdk-module-manifest-module-development-standard.md)).

---

## 18. Performance

Components should:

- Minimise re-renders
- Support virtualization where required
- Lazy-load heavy assets
- Remain responsive with large datasets

Performance is a design requirement.

Virtualise large datasets per [016](./016-desktop-shell-architecture-user-experience-framework.md) and [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 19. Security

Components must never:

- Store secrets
- Perform authentication
- Enforce permissions
- Call integrations directly

Components remain presentation-only.

Permission-driven UI is computed before render by the shell using PermissionService — not inside components ([005](./005-desktop-experience-workspace-framework.md), [007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 20. Standard Component Directory

```text
packages/ui/
└── data-table/
    ├── component.yaml
    ├── README.md
    ├── CHANGELOG.md
    ├── src/
    │   ├── DataTable.tsx
    │   ├── DataTable.types.ts
    │   ├── hooks/
    │   ├── utils/
    │   ├── styles/
    │   └── index.ts
    ├── stories/
    │   ├── DataTable.stories.tsx
    │   └── examples/
    ├── tests/
    │   ├── unit/
    │   ├── accessibility/
    │   ├── interaction/
    │   └── visual/
    └── docs/
        ├── usage.md
        ├── accessibility.md
        └── design.md
```

Monorepo `/packages` UI library per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 21. Cursor Instructions

When implementing UI components:

1. Read Documents 006, 016, 022 and 028.
2. Generate `component.yaml`.
3. Define component props.
4. Consume design tokens only.
5. Build Storybook documentation.
6. Write automated tests.
7. Validate accessibility.
8. Register the component.
9. Update the Design System catalogue.

Cursor must never place business logic inside UI components.

**Phase gate:** Do not implement until project owner authorises development ([001](./001-project-vision-and-guiding-principles.md)).

---

## 22. Acceptance Criteria

The UI Component SDK is complete when:

- Every reusable component has a manifest.
- Components consume only design tokens.
- Storybook documentation is generated automatically.
- Accessibility standards are enforced.
- Components remain independent of business logic.
- Components are automatically discoverable.
- Automated tests validate behaviour and accessibility.
- Future themes require no component modifications.
- **No component enforces permissions, stores secrets, or calls integrations.**
- **No module ships duplicate primitives that exist in the shared library without architectural approval.**

The UI Component SDK establishes the permanent development contract for every visual element within APZHUB and ensures a consistent, maintainable and enterprise-grade user experience.
