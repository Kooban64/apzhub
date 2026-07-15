# APZHUB

Working name for a unified internal productivity platform — one desktop-style application over backend engines (Plane, Kimai, Zammad, etc.), not a link portal.

## Current phase

Foundation documentation (**000**, **001–029**) is complete.

**BUILD-001**, **SPR-001** through **SPR-007** are **complete** — formally reviewed and accepted for release.

**Platform Version 5.0** — [release document](./docs/releases/APZHUB-Platform-v5.0.md) · Milestone 8 planning gate next

**Document Platform:** **APZDOCS-006 COMPLETE** — **PRODUCTION_READY_WITH_LIMITATIONS**.

**Search Platform:** **APZSEARCH-013 COMPLETE** — `@apzhub/search-testing` **0.1.0** (APZ TCMS publication adapter, metadata-only). Stop — await owner approval before **APZSEARCH-014** (Reporting). See [docs/foundation/CURRENT-MILESTONE.md](./docs/foundation/CURRENT-MILESTONE.md).

| Milestone                | Sprint  | Release                                | Status                                   |
| ------------------------ | ------- | -------------------------------------- | ---------------------------------------- |
| M1 Foundation            | SPR-001 | `v0.1.0-foundation`                    | Complete (tag pending owner instruction) |
| M2 Platform Runtime      | SPR-002 | `v0.2.0-platform-runtime`              | Complete (tag pending owner instruction) |
| M3 Workbench Framework   | SPR-003 | `v0.3.0-workbench-framework`           | Complete (tag pending owner instruction) |
| M4 Action Framework      | SPR-004 | `v0.4.0-action-framework`              | Complete (tag pending owner instruction) |
| M5 Knowledge & Discovery | SPR-005 | `v0.5.0-knowledge-discovery-framework` | Complete (tag pending owner instruction) |
| M6 Event & Notification  | SPR-006 | `v0.6.0-event-notification-framework`  | Complete (tag pending owner instruction) |
| M7 Activity & Timeline   | SPR-007 | `v0.7.0-activity-timeline-framework`   | Complete (tag pending owner instruction) |

**Platform Version 4.0** — [release document](./docs/releases/APZHUB-Platform-v4.0.md) (superseded by Platform 5.0)

| Baseline                   | Document                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Architecture Baseline v1.0 | [docs/architecture/APZHUB-Architecture-Baseline-v1.0.md](./docs/architecture/APZHUB-Architecture-Baseline-v1.0.md) |
| Engineering Handbook       | [docs/governance/APZHUB-Engineering-Handbook.md](./docs/governance/APZHUB-Engineering-Handbook.md)                 |

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

See [docs/developer/getting-started.md](./docs/developer/getting-started.md).

## Documentation

| Resource                                                                                                                                                                                   | Description                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [docs/README.md](./docs/README.md)                                                                                                                                                         | Document registry and conventions                              |
| [docs/000-apzhub-engineering-constitution.md](./docs/000-apzhub-engineering-constitution.md)                                                                                               | Engineering Constitution (supreme authority)                   |
| [docs/build/BUILD-001-repository-bootstrap-guide.md](./docs/build/BUILD-001-repository-bootstrap-guide.md)                                                                                 | BUILD-001 — repo bootstrap (before SPR-001)                    |
| [docs/001-project-vision-and-guiding-principles.md](./docs/001-project-vision-and-guiding-principles.md)                                                                                   | Foundation vision, architecture rules, UX, testing             |
| [docs/002-product-naming-positioning-terminology-standard.md](./docs/002-product-naming-positioning-terminology-standard.md)                                                               | Naming, positioning, UI language, service/adapter conventions  |
| [docs/003-overall-system-architecture-design-principles.md](./docs/003-overall-system-architecture-design-principles.md)                                                                   | Layered architecture, modules, data ownership, security        |
| [docs/004-technology-stack-repository-standards-development-environment.md](./docs/004-technology-stack-repository-standards-development-environment.md)                                   | Stack, monorepo, coding standards, testing, CI                 |
| [docs/005-desktop-experience-workspace-framework.md](./docs/005-desktop-experience-workspace-framework.md)                                                                                 | Desktop shell, workspaces, permission-driven navigation        |
| [docs/006-enterprise-design-system-ui-standards.md](./docs/006-enterprise-design-system-ui-standards.md)                                                                                   | Design tokens, components, UI standards                        |
| [docs/007-identity-authentication-authorisation-rbac-architecture.md](./docs/007-identity-authentication-authorisation-rbac-architecture.md)                                               | IAM, RBAC, SSO, provisioning                                   |
| [docs/008-module-plugin-connector-architecture.md](./docs/008-module-plugin-connector-architecture.md)                                                                                     | Modules, services, connectors                                  |
| [docs/009-platform-service-layer-integration-framework.md](./docs/009-platform-service-layer-integration-framework.md)                                                                     | Platform Service Layer, orchestration                          |
| [docs/010-api-gateway-integration-communication-standards.md](./docs/010-api-gateway-integration-communication-standards.md)                                                               | API Gateway, communication standards                           |
| [docs/011-platform-data-architecture-database-design-principles.md](./docs/011-platform-data-architecture-database-design-principles.md)                                                   | Platform data, PostgreSQL, SoR                                 |
| [docs/012-event-driven-architecture-background-processing-workflow-framework.md](./docs/012-event-driven-architecture-background-processing-workflow-framework.md)                         | EDA, background jobs, workflows                                |
| [docs/013-security-architecture-zero-trust-framework.md](./docs/013-security-architecture-zero-trust-framework.md)                                                                         | Zero Trust security architecture                               |
| [docs/014-observability-monitoring-telemetry-health-framework.md](./docs/014-observability-monitoring-telemetry-health-framework.md)                                                       | Observability, monitoring, health                              |
| [docs/015-software-quality-testing-qa-cicd-release-management-framework.md](./docs/015-software-quality-testing-qa-cicd-release-management-framework.md)                                   | Quality, testing, CI/CD, releases                              |
| [docs/016-desktop-shell-architecture-user-experience-framework.md](./docs/016-desktop-shell-architecture-user-experience-framework.md)                                                     | Desktop Shell architecture & UX                                |
| [docs/017-navigation-framework-workspace-navigation-architecture.md](./docs/017-navigation-framework-workspace-navigation-architecture.md)                                                 | Navigation framework & workspace nav                           |
| [docs/018-workspace-sessions-window-management-state-persistence-framework.md](./docs/018-workspace-sessions-window-management-state-persistence-framework.md)                             | Workspace sessions & state persistence                         |
| [docs/019-universal-command-palette-action-framework.md](./docs/019-universal-command-palette-action-framework.md)                                                                         | Universal Command Palette & actions                            |
| [docs/020-unified-search-knowledge-discovery-framework.md](./docs/020-unified-search-knowledge-discovery-framework.md)                                                                     | Unified search & discovery                                     |
| [docs/021-notification-activity-attention-management-framework.md](./docs/021-notification-activity-attention-management-framework.md)                                                     | Notifications, activity & attention                            |
| [docs/022-presentation-engine-theme-framework-branding-architecture.md](./docs/022-presentation-engine-theme-framework-branding-architecture.md)                                           | Presentation engine & branding                                 |
| [docs/023-user-preferences-personalisation-workspace-experience-framework.md](./docs/023-user-preferences-personalisation-workspace-experience-framework.md)                               | User preferences & personalisation                             |
| [docs/024-apzhub-platform-sdk-development-framework.md](./docs/024-apzhub-platform-sdk-development-framework.md)                                                                           | Platform SDK & development framework                           |
| [docs/025-module-sdk-module-manifest-module-development-standard.md](./docs/025-module-sdk-module-manifest-module-development-standard.md)                                                 | Module SDK & manifest standard                                 |
| [docs/026-integration-sdk-adapter-framework-integration-manifest-specification.md](./docs/026-integration-sdk-adapter-framework-integration-manifest-specification.md)                     | Integration SDK & adapter framework                            |
| [docs/027-platform-service-sdk-business-service-framework-service-manifest-specification.md](./docs/027-platform-service-sdk-business-service-framework-service-manifest-specification.md) | Platform Service SDK & manifests                               |
| [docs/028-ui-component-sdk-design-system-sdk-component-manifest-specification.md](./docs/028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)                       | UI Component SDK & manifests                                   |
| [docs/029-platform-event-sdk-event-bus-event-manifest-specification.md](./docs/029-platform-event-sdk-event-bus-event-manifest-specification.md)                                           | Platform Event SDK & Event Bus                                 |
| [docs/terminology-quick-reference.md](./docs/terminology-quick-reference.md)                                                                                                               | One-page lookup (001 + 002)                                    |
| [docs/architecture-quick-reference.md](./docs/architecture-quick-reference.md)                                                                                                             | One-page lookup (003)                                          |
| [docs/technology-stack-quick-reference.md](./docs/technology-stack-quick-reference.md)                                                                                                     | One-page lookup (004)                                          |
| [docs/desktop-framework-quick-reference.md](./docs/desktop-framework-quick-reference.md)                                                                                                   | One-page lookup (005)                                          |
| [docs/design-system-quick-reference.md](./docs/design-system-quick-reference.md)                                                                                                           | One-page lookup (006)                                          |
| [docs/iam-quick-reference.md](./docs/iam-quick-reference.md)                                                                                                                               | One-page lookup (007)                                          |
| [docs/module-connector-quick-reference.md](./docs/module-connector-quick-reference.md)                                                                                                     | One-page lookup (008)                                          |
| [docs/platform-services-quick-reference.md](./docs/platform-services-quick-reference.md)                                                                                                   | One-page lookup (009)                                          |
| [docs/api-communication-quick-reference.md](./docs/api-communication-quick-reference.md)                                                                                                   | One-page lookup (010)                                          |
| [docs/platform-data-quick-reference.md](./docs/platform-data-quick-reference.md)                                                                                                           | One-page lookup (011)                                          |
| [docs/events-background-quick-reference.md](./docs/events-background-quick-reference.md)                                                                                                   | One-page lookup (012)                                          |
| [docs/security-quick-reference.md](./docs/security-quick-reference.md)                                                                                                                     | One-page lookup (013)                                          |
| [docs/observability-quick-reference.md](./docs/observability-quick-reference.md)                                                                                                           | One-page lookup (014)                                          |
| [docs/quality-release-quick-reference.md](./docs/quality-release-quick-reference.md)                                                                                                       | One-page lookup (015)                                          |
| [docs/desktop-shell-quick-reference.md](./docs/desktop-shell-quick-reference.md)                                                                                                           | One-page lookup (016)                                          |
| [docs/navigation-quick-reference.md](./docs/navigation-quick-reference.md)                                                                                                                 | One-page lookup (017)                                          |
| [docs/workspace-sessions-quick-reference.md](./docs/workspace-sessions-quick-reference.md)                                                                                                 | One-page lookup (018)                                          |
| [docs/command-palette-quick-reference.md](./docs/command-palette-quick-reference.md)                                                                                                       | One-page lookup (019) — Action Framework implemented (SPR-004) |
| [docs/architecture/command-framework.md](./docs/architecture/command-framework.md)                                                                                                         | Action Framework architecture (M4)                             |
| [docs/developer/action-framework-onboarding.md](./docs/developer/action-framework-onboarding.md)                                                                                           | How to add platform and capability actions                     |
| [docs/architecture/knowledge-discovery-framework.md](./docs/architecture/knowledge-discovery-framework.md)                                                                                 | Knowledge & Discovery Framework architecture (M5)              |
| [docs/architecture/event-notification-framework.md](./docs/architecture/event-notification-framework.md)                                                                                   | Event & Notification Framework architecture (M6)               |
| [docs/releases/APZHUB-Platform-v4.0.md](./docs/releases/APZHUB-Platform-v4.0.md)                                                                                                           | Platform Version 4.0 — permanent baseline                      |
| [docs/architecture/APZHUB-Platform-Reference-Patterns.md](./docs/architecture/APZHUB-Platform-Reference-Patterns.md)                                                                       | Authoritative platform patterns (v4.0)                         |
| [docs/developer/event-notification-onboarding.md](./docs/developer/event-notification-onboarding.md)                                                                                       | How to add events, routes, and Notification Experiences        |
| [docs/releases/v0.4.0-action-framework.md](./docs/releases/v0.4.0-action-framework.md)                                                                                                     | Milestone 4 release notes (tag pending)                        |
| [docs/releases/v0.5.0-knowledge-discovery-framework.md](./docs/releases/v0.5.0-knowledge-discovery-framework.md)                                                                           | Milestone 5 release notes (tag pending)                        |
| [docs/releases/v0.6.0-event-notification-framework.md](./docs/releases/v0.6.0-event-notification-framework.md)                                                                             | Milestone 6 release notes (tag pending)                        |
| [docs/architecture/activity-timeline-framework.md](./docs/architecture/activity-timeline-framework.md)                                                                                     | Activity & Timeline Framework architecture (M7)                |
| [docs/developer/activity-timeline-onboarding.md](./docs/developer/activity-timeline-onboarding.md)                                                                                         | How to add activity types, timelines, and Context Panel        |
| [docs/releases/v0.7.0-activity-timeline-framework.md](./docs/releases/v0.7.0-activity-timeline-framework.md)                                                                               | Milestone 7 release notes (tag pending)                        |
| [docs/releases/APZHUB-Platform-v5.0.md](./docs/releases/APZHUB-Platform-v5.0.md)                                                                                                           | Platform Version 5.0 — permanent baseline                      |
| [docs/architecture/APZHUB-Platform-Capability-Matrix.md](./docs/architecture/APZHUB-Platform-Capability-Matrix.md)                                                                         | Cross-framework pattern matrix (v5.0)                          |
| [docs/strategy/APZHUB-Product-Validation-Strategy.md](./docs/strategy/APZHUB-Product-Validation-Strategy.md)                                                                               | Product validation planning (Law Firm Platform)                |
| [docs/reviews/APZHUB-v5.0-Platform-Review.md](./docs/reviews/APZHUB-v5.0-Platform-Review.md)                                                                                               | Platform 5.0 review — APPROVED FOR PRODUCT VALIDATION          |
| [docs/unified-search-quick-reference.md](./docs/unified-search-quick-reference.md)                                                                                                         | One-page lookup (020)                                          |
| [docs/notifications-activity-quick-reference.md](./docs/notifications-activity-quick-reference.md)                                                                                         | One-page lookup (021)                                          |
| [docs/presentation-theme-quick-reference.md](./docs/presentation-theme-quick-reference.md)                                                                                                 | One-page lookup (022)                                          |
| [docs/user-preferences-quick-reference.md](./docs/user-preferences-quick-reference.md)                                                                                                     | One-page lookup (023)                                          |
| [docs/platform-sdk-quick-reference.md](./docs/platform-sdk-quick-reference.md)                                                                                                             | One-page lookup (024)                                          |
| [docs/module-sdk-quick-reference.md](./docs/module-sdk-quick-reference.md)                                                                                                                 | One-page lookup (025)                                          |
| [docs/integration-sdk-quick-reference.md](./docs/integration-sdk-quick-reference.md)                                                                                                       | One-page lookup (026)                                          |
| [docs/platform-service-sdk-quick-reference.md](./docs/platform-service-sdk-quick-reference.md)                                                                                             | One-page lookup (027)                                          |
| [docs/ui-component-sdk-quick-reference.md](./docs/ui-component-sdk-quick-reference.md)                                                                                                     | One-page lookup (028)                                          |
| [docs/platform-event-sdk-quick-reference.md](./docs/platform-event-sdk-quick-reference.md)                                                                                                 | One-page lookup (029)                                          |
| [docs/SPR-001-monorepo-foundation-development-environment.md](./docs/SPR-001-monorepo-foundation-development-environment.md)                                                               | Sprint 001 — monorepo & dev environment (P0)                   |
| [docs/reviews/SPR-001-architecture-review.md](./docs/reviews/SPR-001-architecture-review.md)                                                                                               | SPR-001 formal review (PASS WITH OBSERVATIONS)                 |
| [docs/reviews/SPR-001-closeout.md](./docs/reviews/SPR-001-closeout.md)                                                                                                                     | SPR-001 closeout report                                        |
| [docs/adr/README.md](./docs/adr/README.md)                                                                                                                                                 | Architecture Decision Record index                             |
| [docs/build-001-quick-reference.md](./docs/build-001-quick-reference.md)                                                                                                                   | One-page lookup (BUILD-001)                                    |
| [docs/sprint-001-quick-reference.md](./docs/sprint-001-quick-reference.md)                                                                                                                 | One-page lookup (SPR-001)                                      |
| [ENVIRONMENT.md](./ENVIRONMENT.md)                                                                                                                                                         | Live server inventory (legacy `apz-stack` coexistence)         |

## Workspace

This repository (`apz-portal`) is the intended home for APZHUB. The host already runs a legacy Docker stack from `/home/ubuntu/apzportal`; see `ENVIRONMENT.md` before any deploy or infra changes.

### Monorepo layout (BUILD-001)

```
apps/web          — Next.js application (App Router)
packages/*        — Shared libraries (shells until SPR-001+)
services/         — Platform services (future)
integrations/     — Integration adapters (canonical; see integrations/README.md)
events/           — Platform events (future)
infrastructure/   — Docker, Caddy, PostgreSQL, Redis (folders only until SPR-001)
testing/          — Playwright, fixtures, a11y, performance (folders only until SPR-001)
docs/             — Foundation documents, build guides, sprint guides
```

**Repository path note:** Document 004 references `/adapters`; BUILD-001 and the Integration SDK use `integrations/` as the canonical folder.

### Development

```bash
pnpm install
pnpm dev      # Next.js dev server (@apzhub/web)
pnpm build
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build-storybook
```
