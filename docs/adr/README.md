# Architecture Decision Records

Canonical ADRs for APZHUB platform engineering decisions.

> **Hierarchy:** [Document 000](../000-apzhub-engineering-constitution.md) → foundation docs → **ADRs** → build guides → sprint guides.

## Index

| ID                                                                | Title                                   | Status                | Date       |
| ----------------------------------------------------------------- | --------------------------------------- | --------------------- | ---------- |
| [ADR-0001](./ADR-0001-monorepo-strategy.md)                       | Monorepo Strategy                       | Accepted              | 2026-06-29 |
| [ADR-0002](./ADR-0002-drizzle-orm-selection.md)                   | Drizzle ORM Selection                   | Accepted              | 2026-06-29 |
| [ADR-0003](./ADR-0003-better-auth-session-validation.md)          | Better Auth Session Validation          | Accepted              | 2026-06-29 |
| [ADR-0004](./ADR-0004-platform-registry-first-architecture.md)    | Platform Registry First Architecture    | Accepted              | 2026-06-29 |
| [ADR-0005](./ADR-0005-integration-sdk-strategy.md)                | Integration SDK Strategy                | Accepted              | 2026-06-29 |
| [ADR-0006](./ADR-0006-platform-service-architecture.md)           | Platform Service Architecture           | Accepted              | 2026-06-29 |
| [ADR-0007](./ADR-0007-event-driven-communication.md)              | Event Driven Communication              | Accepted              | 2026-06-29 |
| [ADR-0008](./ADR-0008-platform-core-package.md)                   | Platform Core Package                   | Superseded → ADR-0018 | 2026-06-30 |
| [ADR-0018](./ADR-0018-platform-runtime-package.md)                | Platform Runtime Package                | Accepted              | 2026-06-30 |
| [ADR-0009](./ADR-0009-registry-hybrid-persistence.md)             | Registry Hybrid Persistence             | Accepted              | 2026-06-30 |
| [ADR-0010](./ADR-0010-registry-internal-typescript-api.md)        | Registry Internal TypeScript API        | Accepted              | 2026-06-30 |
| [ADR-0011](./ADR-0011-unified-manifest-envelope.md)               | Unified Manifest Envelope               | Accepted              | 2026-06-30 |
| [ADR-0012](./ADR-0012-theme-manifest-registration.md)             | Theme Manifest Registration             | Accepted              | 2026-06-30 |
| [ADR-0013](./ADR-0013-registry-fail-fast-policy.md)               | Registry Fail-Fast Policy               | Accepted              | 2026-06-30 |
| [ADR-0014](./ADR-0014-registry-bootstrap-lifecycle.md)            | Registry Bootstrap Lifecycle            | Accepted              | 2026-06-30 |
| [ADR-0015](./ADR-0015-registry-boundaries-and-discovery-scope.md) | Registry Boundaries and Discovery Scope | Accepted              | 2026-06-30 |
| [ADR-0016](./ADR-0016-registry-testing-requirements.md)           | Registry Testing Requirements           | Accepted              | 2026-06-30 |
| [ADR-0017](./ADR-0017-phased-implementation-review-gate.md)       | Phased Implementation Review Gate       | Accepted              | 2026-06-30 |
| [ADR-0019](./ADR-0019-workbench-framework-package.md)             | Workbench Framework Package             | Accepted              | 2026-06-28 |
| [ADR-0020](./ADR-0020-workbench-request-transport.md)             | Workbench Request Transport             | Accepted              | 2026-06-28 |
| [ADR-0021](./ADR-0021-workbench-session-persistence.md)           | Workbench Session Persistence           | Accepted              | 2026-06-28 |
| [ADR-0022](./ADR-0022-navigation-manifest-extension.md)           | Navigation Manifest Extension           | Accepted              | 2026-06-28 |
| [ADR-0023](./ADR-0023-workbench-permission-adapter.md)            | Workbench Permission Adapter            | Accepted              | 2026-06-28 |
| [ADR-0024](./ADR-0024-command-framework-package.md)               | Command Framework Package               | Accepted              | 2026-06-28 |
| [ADR-0025](./ADR-0025-workbench-commands-manifest.md)             | Workbench Commands Manifest Extension   | Accepted              | 2026-06-28 |
| [ADR-0026](./ADR-0026-command-execution-model.md)                 | Command Execution and Actor Model       | Accepted              | 2026-06-28 |
| [ADR-0027](./ADR-0027-knowledge-discovery-framework-package.md)   | Knowledge & Discovery Framework Package | Accepted              | 2026-06-28 |
| [ADR-0028](./ADR-0028-knowledge-source-model.md)                  | Knowledge Source Model and Taxonomy     | Accepted              | 2026-06-28 |
| [ADR-0029](./ADR-0029-knowledge-discovery-execution-routing.md)   | Knowledge Discovery Execution Routing   | Accepted              | 2026-06-28 |

## Legacy decisions (`docs/decisions/`)

Earlier sprint ADRs remain for historical reference:

- [ADR-001](../decisions/ADR-001-integrations-folder-canonical.md) — integrations folder canonical path
- [ADR-002](../decisions/ADR-002-database-migration-framework.md) — Drizzle migration framework

New ADRs use the `docs/adr/ADR-000N` numbering scheme.

## Creating ADRs

1. File as `docs/adr/ADR-00NN-short-title.md`
2. Include: Problem, Decision, Alternatives, Consequences, Status
3. Register in this index and `docs/README.md`
4. Do not override foundation documents without owner approval
