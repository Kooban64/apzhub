# APZHUB UI Component SDK quick reference

Derived lookup for [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md).

> **Document Version:** 1.0 · **Developer Specification · Mandatory**  
> Design System: [006](./006-enterprise-design-system-ui-standards.md). Presentation: [022](./022-presentation-engine-theme-framework-branding-architecture.md). Platform SDK: [024](./024-apzhub-platform-sdk-development-framework.md). Shell: [016](./016-desktop-shell-architecture-user-experience-framework.md).

## Core rule

Every visual element = **reusable platform asset** in shared `/packages/ui` — not module-specific unless truly unique business interaction.

## Philosophy

Reusable · theme-aware · accessible · testable · documented · versioned · discoverable · stateless where practical · platform-owned

## Component hierarchy

Design Tokens → Primitives → Composite → Workspace → Business → Module Views (022)

## Categories

**Primitives:** button · icon · typography · badge · divider · avatar · spinner · tooltip

**Composite:** search bar · data table · command palette · form · modal · sidebar · nav tree · tabs · card (shadcn/Tailwind, TanStack Table)

**Workspace:** header · activity feed · dashboard grid · split view · property panel · inspector (016)

**Business:** project board · ticket timeline · workflow builder · analytics dashboard — reuse composites; actions via Platform Services (027)

## Manifest

`component.yaml` before implementation (024)

## Example manifest fields

`component` (id, name, version) · metadata.category · props · events.emits · theme.supportsDarkMode · storybook.enabled · tests

## Registration (auto-discovery)

ID · name · version · category · props · events · slots · Storybook · tests · docs — `/packages/ui` (004)

## Component responsibilities

Render UI · local presentation state · raise UI events · consume tokens · a11y · themes — **no business rules**

## Design tokens (mandatory, no hardcoding)

Colour · typography · radius · elevation · motion · spacing · icon — Lucide only (006, 022, 004)

## UI events vs business actions

Components emit: clicked · selected · opened · closed · changed · submitted · cancelled — **business actions → Platform Services** (019, 027)

## Accessibility (mandatory)

Keyboard · screen readers · ARIA · high contrast · focus · reduced motion · colour contrast — WCAG AA (006, 016)

## Storybook (required)

Purpose · examples · props · events · variants · a11y notes · design notes · usage — visual catalogue; self-hosted (004, 008)

## Testing (015)

Unit · interaction · a11y · visual regression · Playwright (where appropriate) — incomplete without tests

## Documented states

Default · hover · focus · active · disabled · loading · error · success · empty — consistent with shared empty/loading/error (006)

## Versioning

Version · breaking changes · migration · deprecation (015)

## Composition

Prefer composition over inheritance · assemble from smaller components · avoid duplication (003)

## Workspace integration

Shell · dashboard · sidebar · context panel · forms · reports — **shell determines placement** (016, 025)

## Performance

Minimise re-renders · virtualize large data · lazy assets · responsive at scale (004, 016)

## Security (presentation-only)

Never store secrets · authenticate · enforce permissions · call integrations — permission UI computed by shell/PermissionService (005, 007)

## Directory (`packages/ui/data-table/`)

`component.yaml` · README · CHANGELOG · `src/` · `stories/` · `tests/` (unit, a11y, interaction, visual) · `docs/` (usage, a11y, design)

## Cursor workflow (9 steps)

Read 006, 016, 022, 028 → `component.yaml` → props → tokens only → Storybook → tests → a11y validate → register → update catalogue — **no business logic · phase gate applies**

## Acceptance highlights

Manifest for every reusable component · tokens only · Storybook · a11y enforced · no business logic · auto-discoverable · tested · theme-switch without component changes · **no permission/auth/integration in components** · **no duplicate primitives in modules without approval**
