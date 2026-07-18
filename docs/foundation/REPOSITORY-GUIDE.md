# APZHUB Repository Guide

> **Purpose:** Explain monorepo structure, conventions, and where things live  
> **Audience:** Engineers, AI agents  
> **Authoritative references:** [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [BUILD-001](../build/BUILD-001-repository-bootstrap-guide.md)  
> **Related documents:** [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md) · [ENGINEERING-HANDBOOK](./ENGINEERING-HANDBOOK.md)  
> **Reading order:** Early onboarding  
> **Last updated:** 2026-07-10  
> **Current status:** Active

---

## Top-level structure

```text
apz-portal/
├── apps/                    Applications (Next.js)
├── packages/                Shared libraries and frameworks
├── services/                Platform service manifests
├── integrations/            Integration adapter manifests
├── modules/                 Business module manifests
├── events/                  Platform event manifests
├── docs/                    All documentation
├── testing/                 Playwright E2E, fixtures
├── infrastructure/          Docker, Caddy configs
├── scripts/                 Tooling scripts
├── tooling/                 Shared tooling configs
├── libs/                    Additional libraries (reserved)
├── adapters/                Adapter implementations (reserved)
├── docker/                  Docker-related assets
├── CHANGELOG.md             Release history
├── ENVIRONMENT.md           Host coexistence inventory
├── package.json             Root workspace config
├── pnpm-workspace.yaml      Workspace definition
├── tsconfig.base.json       Shared TypeScript config
└── vitest.config.ts         Test runner config
```

---

## Applications (`apps/`)

| App                  | Package                | Purpose                                             |
| -------------------- | ---------------------- | --------------------------------------------------- |
| `apps/web/`          | `@apzhub/web`          | Primary platform application — shell, platform APIs |
| `apps/law-platform/` | `@apzhub/law-platform` | Law Platform product application                    |

Both apps:

- Next.js App Router
- Share Platform Core bootstrap via `@apzhub/platform-bootstrap`
- Use `@apzhub/workbench-framework` and `@apzhub/workspace`
- Have independent dev scripts: `pnpm dev`, `pnpm dev:law`

---

## Packages (`packages/`)

See [PACKAGE-CATALOGUE](./PACKAGE-CATALOGUE.md) for full inventory.

### Layer grouping

```text
Platform Core:     platform-runtime, platform-bootstrap, platform-identity,
                   platform-authorization, platform-operations, platform-personalisation,
                   platform-governance, platform-security, platform-lifecycle

Frameworks:        workbench-framework, command-framework,
                   knowledge-discovery-framework, event-notification-framework,
                   activity-timeline-framework

Integration:       integration-sdk, sdk

UI & Shell:          ui, workspace, theme

Infrastructure:      auth, config, shared, types

Product:             legal-business-core
```

---

## Capabilities (manifest directories)

| Directory            | Manifest           | Purpose                                  |
| -------------------- | ------------------ | ---------------------------------------- |
| `services/{id}/`     | `service.yaml`     | Platform Services — business logic layer |
| `integrations/{id}/` | `integration.yaml` | OSS adapter connectors                   |
| `modules/{id}/`      | `module.yaml`      | Business modules — presentation layer    |
| `events/{id}/`       | `event.yaml`       | Platform event definitions               |

Discovery: `@apzhub/platform-runtime` scans these at bootstrap.

---

## Documentation (`docs/`)

| Directory            | Contents                                  |
| -------------------- | ----------------------------------------- |
| `docs/foundation/`   | **Knowledge Foundation (APZHUB-000)**     |
| `docs/` (root)       | Foundation docs 000–029, quick references |
| `docs/architecture/` | Architecture documents                    |
| `docs/adr/`          | Architecture Decision Records             |
| `docs/strategy/`     | Master strategy and roadmaps              |
| `docs/specs/`        | Technical specifications                  |
| `docs/backlog/`      | Engineering backlogs                      |
| `docs/sprint/`       | Sprint guides and completion reports      |
| `docs/reviews/`      | Architecture and readiness reviews        |
| `docs/governance/`   | Engineering and operational guides        |
| `docs/developer/`    | Developer onboarding guides               |
| `docs/security/`     | Security audits and compliance            |
| `docs/releases/`     | Release notes                             |
| `docs/roadmap/`      | Roadmaps                                  |
| `docs/build/`        | Build guides                              |
| `docs/operator/`     | Operator guides                           |

Navigation: [PROJECT-INDEX](./PROJECT-INDEX.md) · [DOCUMENT-MAP](./DOCUMENT-MAP.md)

---

## Testing (`testing/`)

| Path                  | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `testing/playwright/` | E2E configs for web and law-platform              |
| Package `*.test.ts`   | Unit and integration tests co-located with source |
| `vitest.config.ts`    | Root test runner with path aliases                |

Commands:

```bash
pnpm test              # All Vitest tests
pnpm test:coverage     # With coverage
pnpm test:e2e          # Playwright (web)
pnpm test:e2e:law      # Playwright (law)
```

---

## Infrastructure (`infrastructure/`)

| Path                     | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `infrastructure/docker/` | Docker Compose for dev (PostgreSQL, Redis, Caddy) |

Commands:

```bash
pnpm docker:up
pnpm docker:down
```

---

## Scripts (`scripts/`)

Database migration, seeding, OpenAPI collection generation. Root `package.json` scripts delegate here.

---

## Configuration files

| File                  | Purpose                                 |
| --------------------- | --------------------------------------- |
| `tsconfig.base.json`  | Shared TS paths and strict settings     |
| `eslint.config.js`    | ESLint flat config                      |
| `.prettierrc`         | Formatting                              |
| `pnpm-workspace.yaml` | Workspace package globs                 |
| `.cursor/rules/`      | Cursor AI rules (apzhub-foundation.mdc) |

---

## Conventions

| Convention         | Rule                                                  |
| ------------------ | ----------------------------------------------------- |
| Package naming     | `@apzhub/{kebab-case}`                                |
| File naming        | kebab-case for files; PascalCase for React components |
| Test files         | `*.test.ts` / `*.test.tsx` co-located                 |
| Manifest first     | YAML in capability directory before TypeScript        |
| Imports            | Use path aliases from `tsconfig.base.json`            |
| No secrets in repo | Environment variables via `@apzhub/config`            |

---

## Host coexistence

The workspace coexists with legacy `apz-stack` on the same server. See [ENVIRONMENT.md](../../ENVIRONMENT.md) for ports and services. Do not disrupt running legacy services without approval.

---

## Getting started

```bash
git clone <repo>
cd apz-portal
pnpm install
pnpm docker:up          # Optional: local DB/Redis
pnpm dev                # Start web app
pnpm test               # Verify setup
```

Read [ENGINEERING-HANDBOOK](./ENGINEERING-HANDBOOK.md) and [AI-CONTEXT](./AI-CONTEXT.md) before contributing.
