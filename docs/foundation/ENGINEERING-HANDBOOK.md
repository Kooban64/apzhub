# APZHUB Engineering Handbook

> **Purpose:** Onboarding and daily engineering reference for the Knowledge Foundation  
> **Audience:** All engineers and AI agents writing code  
> **Authoritative references:** [000](../000-apzhub-engineering-constitution.md) · [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [015 — Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [Governance Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)  
> **Related documents:** [ARCHITECTURE-HANDBOOK](./ARCHITECTURE-HANDBOOK.md) · [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md) · [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md)  
> **Reading order:** After Constitution and Master Brief  
> **Last updated:** 2026-07-14  
> **Current status:** Active — APZSEARCH-013 APZ TCMS Search Publication Adapter complete; stop before APZSEARCH-014

---

## Overview

This handbook orients engineers to **how APZHUB is built**. Detailed process guides live in [governance/APZHUB-Engineering-Handbook.md](../governance/APZHUB-Engineering-Handbook.md). This document is the Knowledge Foundation entry point.

---

## Monorepo structure

```text
apps/web/                 Primary Next.js application
apps/law-platform/        Law Platform Next.js application
packages/                 Shared libraries and frameworks
services/                 Platform service manifests
integrations/             Integration adapter manifests
modules/                  Business module manifests
events/                   Platform event manifests
docs/                     Foundation, architecture, ADRs, sprints
testing/                  Playwright E2E, fixtures
infrastructure/           Docker, Caddy
scripts/                  Tooling scripts
```

See [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md) · [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md).

**Reporting (APZREPORT-003):** certified **PRODUCTION_READY_WITH_LIMITATIONS** — HTTP `/api/v1/reporting` + workbench `/workspace/reporting` over `@apzhub/reporting-core`. Architecture frozen. See [Vertical Certification](../architecture/APZHUB-Platform-Reporting-Vertical-Certification.md).

**Documents (APZDOCS-006):** certified **PRODUCTION_READY_WITH_LIMITATIONS** — Workbench `/workspace/documents` + HTTP `/api/v1/documents` + typed client over Document Core/persistence/storage. Architecture frozen. See [Vertical Certification](../architecture/APZHUB-Platform-Document-Vertical-Certification.md).

**Search (APZSEARCH-013):** APZ TCMS Search Publication Adapter `@apzhub/search-testing` **0.1.0** (metadata-only). See [APZSEARCH-013 Completion Report](../sprint/APZSEARCH-013-completion-report.md). Stop before APZSEARCH-014.

**Search (APZSEARCH-002):** persistence + provider registry — `@apzhub/search-persistence` **0.1.0**, contracts **0.2.0**, migrations 0041/0042. No HTTP/Workbench/engines/execution. See [Search Persistence Architecture](../architecture/APZHUB-Platform-Search-Persistence-Architecture.md).

**Search (APZSEARCH-001):** Platform Search Foundation — `@apzhub/search-contracts` models and interfaces. See [Platform Search Architecture](../architecture/APZHUB-Platform-Search-Architecture.md).

---

## Build order (non-negotiable)

```text
Design System + Desktop Shell (SPR-001)
    ↓ Platform Runtime (SPR-002)
    ↓ Workbench Framework (SPR-003)
    ↓ Action Framework (SPR-004)
    ↓ Knowledge & Discovery (SPR-005)
    ↓ Event & Notification (SPR-006)
    ↓ Activity & Timeline (SPR-007)
    ↓ Platform Core M8 + PCv2-01
    ↓ Integration SDK (OSS-100)
    ↓ OSS adapters + business modules
```

Never skip layers. Never add business modules before platform infrastructure is ready.

---

## Daily commands

```bash
pnpm install
pnpm dev              # @apzhub/web
pnpm dev:law          # @apzhub/law-platform
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build            # ensure NODE_ENV is unset (see note below)
pnpm storybook
```

**Build note:** If the shell exports `NODE_ENV=development`, Next.js 16 may fail prerendering `/_global-error` (`useContext` null). Use `env -u NODE_ENV pnpm build` (or unset `NODE_ENV`) for production builds.
---

## Development workflow

1. **Confirm milestone approval** — [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)
2. **Read sprint guide / backlog** — scope and stop condition
3. **Read foundation docs** — depends-on list in sprint guide
4. **Manifest first** — YAML before TypeScript where SDK applies
5. **Implement** — match existing conventions in target package
6. **Test** — unit + integration; E2E when UI affected
7. **Document** — completion report, README updates, CHANGELOG if release-worthy
8. **Quality gates** — all must pass before marking complete
9. **Stop** — at sprint boundary; await owner approval

See [AI-WORKFLOW](./AI-WORKFLOW.md).

---

## Coding standards

| Standard           | Reference                                                                      |
| ------------------ | ------------------------------------------------------------------------------ |
| TypeScript strict  | [004](../004-technology-stack-repository-standards-development-environment.md) |
| No `any`           | ESLint enforced                                                                |
| Tokens only in UI  | [006](../006-enterprise-design-system-ui-standards.md)                         |
| Lucide icons only  | Design system                                                                  |
| Structured logging | No secrets in logs                                                             |
| Error envelopes    | [010](../010-api-gateway-integration-communication-standards.md)               |

---

## Testing expectations

| Level       | Tool              | When                  |
| ----------- | ----------------- | --------------------- |
| Unit        | Vitest            | Every package         |
| Component   | Testing Library   | UI packages           |
| Integration | Vitest            | Bootstrap, workflows  |
| E2E         | Playwright        | Shell, critical paths |
| Coverage    | vitest --coverage | Milestone completion  |

See [015](../015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## Capability development

How to build a new capability:

1. [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md)
2. [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
3. Register manifest; bootstrap via `@apzhub/platform-runtime`
4. Wire workbench, commands, events as required

---

## Product development

Law Platform patterns:

- [Law Platform Reference Architecture](../architecture/APZHUB-Law-Platform-Reference-Architecture.md)
- [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md)
- Products consume Platform Core — never duplicate

---

## Integration development

OSS adapter pattern:

1. Integration SDK (`@apzhub/integration-sdk`)
2. `integration.yaml` manifest
3. Platform Service (`service.yaml`)
4. Module (`module.yaml`) — presentation only

See [INTEGRATION-CATALOGUE](./INTEGRATION-CATALOGUE.md) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md).

---

## Security expectations

- Auth on every API route
- Authz via `@apzhub/platform-authorization`
- Tenant context on every request
- No credentials in errors, logs, or diagnostics
- CSP, security headers via `@apzhub/platform-security`

See [013](../013-security-architecture-zero-trust-framework.md).

---

## Documentation expectations

Every milestone produces:

- Architecture or spec updates (if applicable)
- Completion report in `docs/sprint/`
- Backlog status update
- CHANGELOG entry for significant releases
- Index updates in `docs/README.md`

See [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md).

---

## Onboarding checklist

- [ ] Read [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md) and [000](../000-apzhub-engineering-constitution.md)
- [ ] Read [APZHUB-MASTER-BRIEF](./APZHUB-MASTER-BRIEF.md)
- [ ] Read [AI-CONTEXT](./AI-CONTEXT.md)
- [ ] Clone repo; `pnpm install`; `pnpm test`
- [ ] Read [ENVIRONMENT.md](../../ENVIRONMENT.md) for host coexistence
- [ ] Read relevant foundation docs for your area
- [ ] Check [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) before starting work
