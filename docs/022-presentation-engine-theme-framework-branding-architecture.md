# Document 022 — Presentation Engine, Theme Framework & Branding Architecture

> **Document Version:** 1.0  
> **Classification:** Platform Specification  
> **Status:** Core Platform Standard  
> **Applies To:** Desktop Shell · Every Module · Every Component · Every Future Plugin · Desktop & Mobile Clients  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [021](./021-notification-activity-attention-management-framework.md)  
> **Relationship:** Complements [006 — Enterprise Design System & UI Standards](./006-enterprise-design-system-ui-standards.md). Document 006 defines component library standards, interaction patterns, and mandatory token usage. User appearance and accessibility preferences: [023 — User Preferences](./023-user-preferences-personalisation-workspace-experience-framework.md). Component development standard: [028 — UI Component SDK](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md). Applied through [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md) and shared `/packages` UI library per [004](./004-technology-stack-repository-standards-development-environment.md).

## 1. Purpose

The Presentation Engine defines the visual identity of APZHUB.

It provides a consistent, token-driven system for themes, branding, typography, spacing, icons and visual behaviour.

The Presentation Engine is responsible for how the platform looks.

Business modules are responsible only for what the platform does.

---

## 2. Vision

The platform should support multiple visual identities without modifying application code.

Changing the appearance of APZHUB should require only configuration and design tokens.

The architecture must support:

- Corporate branding
- White-label deployments
- Accessibility themes
- Dark mode
- Light mode
- High contrast mode
- Future customer-specific branding

without affecting functionality.

---

## 3. Core Philosophy

Separate:

Presentation

↓

Interaction

↓

Business Logic

↓

Data

No visual styling should be embedded inside business modules.

Per layered architecture ([003](./003-overall-system-architecture-design-principles.md)) and module rules ([008](./008-module-plugin-connector-architecture.md)).

---

## 4. Presentation Layers

Presentation consists of:

Design Tokens

↓

Theme

↓

Brand

↓

Component Library

↓

Desktop Shell

↓

Modules

Each layer builds upon the previous one.

Component library standards per [006](./006-enterprise-design-system-ui-standards.md).

---

## 5. Design Tokens

All visual properties originate from tokens.

**Examples:**

- Colours
- Spacing
- Typography
- Borders
- Radius
- Elevation
- Animation
- Transitions
- Opacity
- Breakpoints
- Z-Index

No component may hardcode visual values.

Mandatory per [006](./006-enterprise-design-system-ui-standards.md) — semantic tokens only.

---

## 6. Brand Definition

A Brand contains:

- Logo
- Application Name
- Colour Palette
- Typography
- Icons
- Illustrations
- Splash Screen
- Login Screen
- Email Templates
- Loading Screens
- Favicons

Branding should remain independent of platform functionality.

User-facing application name follows [002 — Terminology Standard](./002-product-naming-positioning-terminology-standard.md) — APZHUB by default; white-label may override display name only, not internal architecture naming.

---

## 7. Theme Definition

Themes define appearance.

**Examples:**

- Light
- Dark
- High Contrast
- Blue
- Green
- Executive
- Developer

Future themes should require no code changes.

Registered via Theme Registry (Section 21).

---

## 8. Theme Behaviour

Theme switching should be:

- Immediate
- Persistent
- Accessible
- System-aware (optional)

Animation should be minimal.

Theme preference is platform user metadata ([011](./011-platform-data-architecture-database-design-principles.md)). Header theme selector per [016](./016-desktop-shell-architecture-user-experience-framework.md).

---

## 9. Layout Tokens

Standardise:

- Margins
- Padding
- Panel Spacing
- Toolbar Height
- Header Height
- Sidebar Width
- Tab Height
- Status Bar Height

Layout consistency improves usability.

Shell layout dimensions align with [016](./016-desktop-shell-architecture-user-experience-framework.md) and [005](./005-desktop-experience-workspace-framework.md).

---

## 10. Typography

Typography tokens define:

- Display
- Heading
- Section
- Body
- Caption
- Label
- Code

Typography remains consistent across modules.

Per [006](./006-enterprise-design-system-ui-standards.md).

---

## 11. Colour System

Use semantic colours.

**Examples:**

- Primary
- Secondary
- Surface
- Background
- Success
- Warning
- Danger
- Info
- Muted
- Accent
- Border
- Selection
- Focus

Never use hardcoded colour names.

Semantic colour tokens per [006](./006-enterprise-design-system-ui-standards.md).

---

## 12. Icon System

The platform uses one icon family.

Icons should be:

- Consistent
- Accessible
- Scalable
- Theme-aware

Future branding should not require icon replacement.

**Lucide** icons only per [004](./004-technology-stack-repository-standards-development-environment.md) and [006](./006-enterprise-design-system-ui-standards.md).

---

## 13. Illustrations

Illustrations should support:

- Empty States
- Onboarding
- Errors
- Maintenance
- Learning
- Success

Illustrations should follow the active brand.

Shared empty/loading/error states per [006](./006-enterprise-design-system-ui-standards.md).

---

## 14. Motion

Motion communicates state.

**Examples:**

- Loading
- Expansion
- Collapse
- Progress
- Notifications
- Navigation

Animations should remain subtle.

Reduced motion support per accessibility themes (Section 18) and [006](./006-enterprise-design-system-ui-standards.md).

---

## 15. Component Styling

Every reusable component consumes design tokens.

Components never define colours internally.

This enables complete theming.

**shadcn/ui + Tailwind** in shared library per [004](./004-technology-stack-repository-standards-development-environment.md). No one-off module UI ([006](./006-enterprise-design-system-ui-standards.md)).

---

## 16. Responsive Design

Presentation adapts to:

- Desktop
- Tablet
- Mobile
- Large Displays
- Future Desktop Client

Presentation remains consistent.

Responsive behaviour per [016](./016-desktop-shell-architecture-user-experience-framework.md) — no loss of permitted functionality due to screen size ([005](./005-desktop-experience-workspace-framework.md)).

---

## 17. White-Label Support

Each deployment may customise:

- Application Name
- Logo
- Primary Colours
- Typography
- Icons
- Login Experience
- Email Branding
- Help Links

Without modifying platform code.

Branding configuration is platform metadata — Branding Service loads at runtime ([011](./011-platform-data-architecture-database-design-principles.md)).

---

## 18. Accessibility Themes

Support:

- High Contrast
- Large Text
- Reduced Motion
- Colour Blind Friendly
- Keyboard Focus

Accessibility themes remain platform-wide.

WCAG AA target per [006](./006-enterprise-design-system-ui-standards.md). Shell accessibility before modules ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 19. Workspace Identity

Future capability.

Different workspaces may optionally expose subtle visual identities while maintaining the overall platform design language.

**Example:**

- Projects — Blue accent
- Support — Orange accent
- Security — Red accent
- Analytics — Purple accent

The shell remains visually consistent.

Workspace accents are token overrides — not module-specific CSS ([008](./008-module-plugin-connector-architecture.md)).

---

## 20. Branding Service

The Presentation Engine includes a Branding Service.

**Responsibilities:**

- Load active brand
- Load theme
- Load design tokens
- Apply assets
- Manage branding configuration

The Branding Service is platform-owned.

Platform Service — not module or connector ([009](./009-platform-service-layer-integration-framework.md)). Branding config stored per [011](./011-platform-data-architecture-database-design-principles.md); assets self-hosted (Section 24).

---

## 21. Theme Registry

Themes register themselves.

Registration includes:

- Name
- Identifier
- Supported Tokens
- Accessibility Rating
- Dark/Light
- Version
- Compatibility

The Desktop Shell discovers themes automatically.

Similar to navigation/command registration pattern ([017](./017-navigation-framework-workspace-navigation-architecture.md), [019](./019-universal-command-palette-action-framework.md)) — dynamic discovery, no hardcoding.

---

## 22. Component Library

Every shared component must consume:

- Typography Tokens
- Spacing Tokens
- Colour Tokens
- Radius Tokens
- Elevation Tokens
- Animation Tokens

Components remain theme-independent.

Full component catalogue and lifecycle per [006](./006-enterprise-design-system-ui-standards.md).

---

## 23. Performance

Themes should:

- Load quickly
- Avoid layout shifts
- Cache assets
- Switch instantly
- Support lazy asset loading

Visual changes should never impact platform responsiveness.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and shell performance targets ([016](./016-desktop-shell-architecture-user-experience-framework.md)).

---

## 24. Self-Hosted First Principle

All branding assets should remain self-hosted.

**Examples:**

- Fonts
- Icons
- Illustrations
- Logos
- Theme Definitions

The platform should not depend on external CDNs for its visual identity.

Aligns with [008](./008-module-plugin-connector-architecture.md) self-hosted OSS first.

---

## 25. Testing

The Presentation Engine requires:

- Unit Tests
- Theme Tests
- Accessibility Tests
- Component Visual Tests
- Playwright Theme Tests
- Regression Tests

Visual consistency is mandatory.

Per [015 — Software Quality Framework](./015-software-quality-testing-qa-cicd-release-management-framework.md). Theme and a11y tests in CI.

---

## 26. Cursor Instructions

When implementing the Presentation Engine:

- Use design tokens exclusively.
- Never hardcode colours or spacing.
- Build components to be theme-independent.
- Treat branding as configuration.
- Design for future white-label deployments.
- Maintain accessibility across all themes.
- Ensure visual consistency across every module.

The Presentation Engine is a foundational platform capability rather than a styling layer.

Build with Design System ([006](./006-enterprise-design-system-ui-standards.md)) and shell ([016](./016-desktop-shell-architecture-user-experience-framework.md)) before business modules ([005](./005-desktop-experience-workspace-framework.md)).

---

## 27. Acceptance Criteria

The Presentation Engine is complete when:

- Themes switch without code changes.
- Branding is configurable.
- Components consume only design tokens.
- White-label deployments require configuration only.
- Accessibility themes are supported.
- Visual consistency is maintained across all modules.
- Future themes integrate through the Theme Registry.
- **No module embeds hardcoded colours, spacing, or brand assets.**
- **All branding assets are self-hosted — no external CDN dependency.**

The Presentation Engine establishes the visual identity of APZHUB and enables long-term flexibility without compromising consistency.
