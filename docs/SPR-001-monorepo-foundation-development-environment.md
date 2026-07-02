# SPR-001 — Monorepo Foundation & Development Environment Implementation Guide

> **Sprint:** 001  
> **Epic:** Foundation Platform  
> **Status:** Approved for Implementation  
> **Priority:** Critical (P0)  
> **Depends On:** [Document 000 — Engineering Constitution](./000-apzhub-engineering-constitution.md) · [Documents 001–029](./001-project-vision-and-guiding-principles.md)  
> **Prerequisite:** [BUILD-001 — Repository Bootstrap](./build/BUILD-001-repository-bootstrap-guide.md) must complete before this sprint  
> **Estimated Duration:** 1–2 weeks  
> **Classification:** Implementation Sprint Guide

## 1. Sprint Objective

Establish the complete APZHUB development foundation.

This sprint delivers **no business functionality**.

Its sole purpose is to establish a stable, repeatable and enterprise-grade development platform upon which all future work will be built.

At the conclusion of this sprint, developers should be able to clone the repository, start the platform, run tests, and see the Desktop Shell running with authentication.

Implements stack and environment standards per [004 — Technology Stack](./004-technology-stack-repository-standards-development-environment.md). Shell scope per [016 — Desktop Shell](./016-desktop-shell-architecture-user-experience-framework.md) (minimal regions only). Auth scaffold per [007 — IAM](./007-identity-authentication-authorisation-rbac-architecture.md). Quality gates per [015 — Quality & Release](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 2. Sprint Scope

**Included:**

- Repository creation
- Monorepo
- Package management
- TypeScript
- Next.js
- Better Auth
- PostgreSQL
- Redis
- Docker Compose
- Caddy
- Storybook
- Vitest
- Playwright
- Shared Packages
- Build Pipeline
- Development Environment
- CI Pipeline
- Initial Desktop Shell
- Health Endpoint

**Excluded:**

- Projects
- Documents
- Support
- Analytics
- Paperless
- Plane
- Kimai
- Zammad
- Metabase
- n8n
- Kiwi TCMS

No business modules are developed during Sprint 001.

No `module.yaml`, `integration.yaml`, or business `service.yaml` implementations beyond platform scaffolding ([025](./025-module-sdk-module-manifest-module-development-standard.md), [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md), [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)).

---

## 3. Technology Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- TanStack Table
- React Hook Form
- Zod

Per [004](./004-technology-stack-repository-standards-development-environment.md) and [006](./006-enterprise-design-system-ui-standards.md).

---

### Backend

- Next.js API Routes (initially)
- Better Auth
- PostgreSQL
- Redis

Future extraction into Platform Services is anticipated without requiring architectural redesign ([009](./009-platform-service-layer-integration-framework.md), [027](./027-platform-service-sdk-business-service-framework-service-manifest-specification.md)).

---

### Infrastructure

- Docker Compose
- Caddy
- PostgreSQL
- Redis

**Future:**

- MinIO
- OpenSearch
- Prometheus
- Grafana
- Loki

Self-hosted OSS first ([008](./008-module-plugin-connector-architecture.md)). Coexist with legacy `apz-stack` on host — see [ENVIRONMENT.md](../ENVIRONMENT.md).

---

## 4. Repository Structure

Cursor shall create:

```text
apzhub/

docs/
apps/
packages/
services/
integrations/
events/
infrastructure/
testing/
scripts/
.github/
```

The structure shall comply with Documents [024](./024-apzhub-platform-sdk-development-framework.md)–[029](./029-platform-event-sdk-event-bus-event-manifest-specification.md).

**Note:** [004](./004-technology-stack-repository-standards-development-environment.md) references `/adapters`; [026](./026-integration-sdk-adapter-framework-integration-manifest-specification.md) uses `integrations/` — reconcile to one canonical path during Sprint 001 setup and document the choice.

Optional Sprint 001 placeholders: empty `services/`, `integrations/`, `events/` with README pointers to SDK manifests — no implementations.

---

## 5. Package Structure

Create shared packages:

```text
packages/

ui/

sdk/

types/

auth/

theme/

workspace/

events/

search/

notifications/

shared/

config/
```

Each package shall be independently buildable.

`packages/ui` per [028 — UI Component SDK](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md). `packages/theme` per [022 — Presentation Engine](./022-presentation-engine-theme-framework-branding-architecture.md).

---

## 6. Development Standards

Enable:

- Strict TypeScript
- ESLint
- Prettier
- EditorConfig
- Husky
- lint-staged
- Commitlint

No warnings permitted during CI.

Per [004](./004-technology-stack-repository-standards-development-environment.md) and [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 7. Authentication

Install Better Auth.

**Requirements:**

- Email/password
- Session cookies
- PostgreSQL adapter
- Email verification scaffold
- Password reset scaffold
- Role support
- Session management

No OAuth providers in Sprint 001.

Better Auth = authentication only; APZHUB owns RBAC per [007](./007-identity-authentication-authorisation-rbac-architecture.md). Full SSO and per-engine config deferred to later sprints.

---

## 8. Database

Provision PostgreSQL.

**Create:**

- Platform database
- Migration framework
- Seed framework
- Development user
- Test database

No business tables yet.

Platform metadata only per [011](./011-platform-data-architecture-database-design-principles.md) — auth, sessions, migrations scaffolding; no engine business data.

---

## 9. Redis

Provision Redis.

Initially used for:

- Sessions
- Rate limiting
- Cache
- Future queues

Future job/queue integration per [012](./012-event-driven-architecture-background-processing-workflow-framework.md) — not implemented in Sprint 001.

---

## 10. Reverse Proxy

Provision Caddy.

**Support:**

- HTTPS
- Local certificates
- Compression
- Static assets
- API routing
- Future WebSockets

Per [004](./004-technology-stack-repository-standards-development-environment.md) and [010](./010-api-gateway-integration-communication-standards.md).

---

## 11. Desktop Shell

Implement only:

- Header
- Activity Bar
- Sidebar
- Workspace
- Status Bar
- Blank Home Workspace

No business functionality.

Minimal shell per [016](./016-desktop-shell-architecture-user-experience-framework.md). **Excluded in Sprint 001:** Context Panel, Command Palette ([019](./019-universal-command-palette-action-framework.md)), Global Search ([020](./020-unified-search-knowledge-discovery-framework.md)), Notification Centre ([021](./021-notification-activity-attention-management-framework.md)), multi-tab/session restore ([018](./018-workspace-sessions-window-management-state-persistence-framework.md)) — deferred to later sprints.

Static Home workspace only — no dynamic module registry yet ([025](./025-module-sdk-module-manifest-module-development-standard.md)).

---

## 12. Theme Engine

Implement:

- Dark Theme
- Light Theme
- Design Tokens
- Theme Switching
- Persistence

No branding customisation yet.

Per [022](./022-presentation-engine-theme-framework-branding-architecture.md) and [023](./023-user-preferences-personalisation-workspace-experience-framework.md) (theme preference storage).

---

## 13. Storybook

Configure Storybook.

Create stories for:

- Button
- Input
- Card
- Sidebar
- Header
- Status Bar
- Layout

Per [028](./028-ui-component-sdk-design-system-sdk-component-manifest-specification.md) — `component.yaml` for each shared primitive/composite added.

---

## 14. Testing

Configure:

- Vitest
- React Testing Library
- Playwright
- Accessibility testing
- Coverage reporting

Create sample tests.

Full test pyramid per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md). Playwright acceptance tests per Section 19.

---

## 15. Health Endpoint

Create:

```text
GET /api/health
```

**Returns:**

- Platform Version
- Database
- Redis
- Environment
- Build Number
- Health Status

Per [014](./014-observability-monitoring-telemetry-health-framework.md) health hierarchy (platform level).

---

## 16. Environment Variables

Create:

`.env.example`

Include placeholders only.

No secrets committed.

Per [013](./013-security-architecture-zero-trust-framework.md) — never commit secrets.

---

## 17. Docker

Create:

- Development compose
- Production compose scaffold
- Named volumes
- Persistent database
- Persistent Redis
- Persistent Caddy configuration

Use non-conflicting ports with legacy `apz-stack` on same host ([ENVIRONMENT.md](../ENVIRONMENT.md)).

---

## 18. GitHub

Configure:

- Issue Templates
- PR Template
- CODEOWNERS
- Dependabot
- GitHub Actions
- Branch Protection documentation

CI must pass before merge per [015](./015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## 19. Acceptance Tests

Playwright shall verify:

- Application loads
- Login page renders
- Desktop Shell renders
- Theme switching
- Authentication flow scaffold
- Health endpoint
- No console errors

---

## 20. Deliverables

At sprint completion:

- ✅ Repository created
- ✅ Docker running
- ✅ PostgreSQL running
- ✅ Redis running
- ✅ Better Auth operational
- ✅ Desktop Shell operational
- ✅ Storybook operational
- ✅ Tests operational
- ✅ CI operational

No business functionality.

---

## 21. Out of Scope

No modules.

No integrations.

No provisioning.

No search.

No command palette.

No dashboards.

No notifications.

No AI.

No Platform Event Bus implementation beyond package scaffolding ([029](./029-platform-event-sdk-event-bus-event-manifest-specification.md)).

---

## 22. Cursor Instructions

Cursor shall execute this sprint sequentially.

Each task must:

- Compile
- Pass linting
- Pass tests
- Update documentation
- Update changelog

Cursor shall stop after completing Sprint 001.

No future sprint work may be implemented.

Read [024](./024-apzhub-platform-sdk-development-framework.md)–[029](./029-platform-event-sdk-event-bus-event-manifest-specification.md) before scaffolding. Do not contradict foundation documents 001–029.

---

## 23. Definition of Done

Sprint 001 is complete only when:

- The platform builds successfully.
- All automated tests pass.
- Storybook launches successfully.
- Docker starts without errors.
- Better Auth authenticates users.
- PostgreSQL and Redis are healthy.
- Desktop Shell renders correctly.
- CI pipeline passes.
- Documentation is updated.
- No critical defects remain.

Sprint 001 establishes the engineering foundation for every future APZHUB capability.
