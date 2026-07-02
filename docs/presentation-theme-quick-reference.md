# APZHUB Presentation Engine quick reference

Derived lookup for [022](./022-presentation-engine-theme-framework-branding-architecture.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> Component standards: [006](./006-enterprise-design-system-ui-standards.md). Shell application: [016](./016-desktop-shell-architecture-user-experience-framework.md). Stack: [004](./004-technology-stack-repository-standards-development-environment.md). User preferences: [023](./023-user-preferences-personalisation-workspace-experience-framework.md). Component SDK: [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md).

## What it is

**Presentation Engine** — token-driven visual identity: themes, branding, typography, spacing, icons, motion. **How** the platform looks; modules define **what** it does.

## Vision

Multiple visual identities **without code changes** — corporate branding · white-label · a11y themes · dark/light/high contrast · future customer branding

## Philosophy — separate layers

Presentation → interaction → business logic → data — **no styling in business modules** (003, 008)

## Presentation stack

Design Tokens → Theme → Brand → Component Library → Desktop Shell → Modules (006 components)

## Design tokens (mandatory, no hardcoding)

Colours · spacing · typography · borders · radius · elevation · animation · transitions · opacity · breakpoints · z-index

## Brand definition

Logo · app name · colour palette · typography · icons · illustrations · splash/login · email templates · loading · favicons — independent of functionality; display name per 002

## Themes (via Theme Registry)

Light · dark · high contrast · blue · green · executive · developer — **no code changes for new themes**

## Theme behaviour

Immediate · persistent · accessible · system-aware (optional) · minimal animation — user pref metadata (011); header selector (016)

## Layout tokens

Margins · padding · panel spacing · toolbar/header/sidebar/tab/status bar dimensions — aligns with shell (005, 016)

## Typography tokens

Display · heading · section · body · caption · label · code (006)

## Semantic colours (never hardcoded names)

Primary · secondary · surface · background · success · warning · danger · info · muted · accent · border · selection · focus

## Icon system

One family — consistent · accessible · scalable · theme-aware — **Lucide only** (004, 006)

## Illustrations

Empty states · onboarding · errors · maintenance · learning · success — follow active brand (006 shared states)

## Motion

Loading · expand/collapse · progress · notifications · navigation — subtle; reduced motion in a11y themes

## Component styling

Reusable components consume tokens only — **shadcn/ui + Tailwind** shared library; no module one-off UI (004, 006)

## Responsive

Desktop · tablet · mobile · large displays · future desktop client — no permitted functionality loss (005, 016)

## White-label (config only)

App name · logo · primary colours · typography · icons · login · email branding · help links — Branding Service runtime config (011)

## Accessibility themes (platform-wide)

High contrast · large text · reduced motion · colour-blind friendly · keyboard focus — WCAG AA (006, 016)

## Workspace identity (future)

Subtle per-workspace accent tokens (e.g. Projects blue, Support orange) — shell stays consistent; token overrides not module CSS (008)

## Branding Service (platform-owned)

Load brand · theme · tokens · apply assets · manage config — Platform Service (009); self-hosted assets (024)

## Theme Registry

Name · ID · supported tokens · a11y rating · dark/light · version · compatibility — shell auto-discovers (like 017/019 registration)

## Component library requirements

All shared components consume typography · spacing · colour · radius · elevation · animation tokens — theme-independent (006)

## Performance

Fast load · no layout shift · cache assets · instant switch · lazy assets (004, 016)

## Self-hosted first (024)

Fonts · icons · illustrations · logos · theme definitions — **no external CDN for visual identity** (008)

## Testing (015)

Unit · theme · a11y · component visual · Playwright theme · regression

## Build rules

Tokens only · no hardcoded colours/spacing · theme-independent components · branding = configuration · white-label ready · a11y across themes · consistency across modules — **build with 006 + shell before modules** (005)

## Acceptance highlights

Theme switch without code · configurable branding · token-only components · white-label via config · a11y themes · visual consistency · Theme Registry extensibility · **no module hardcoded styling** · **self-hosted assets only**
