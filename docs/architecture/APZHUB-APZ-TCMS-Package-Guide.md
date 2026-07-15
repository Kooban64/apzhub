# APZ TCMS — Package Guide

**Milestone:** APZTCMS-002 (contracts/foundation) · **APZTCMS-003** (persistence) · **APZTCMS-004** (manual domain services)  
**Status:** Active for foundation + persistence + manual services packages

---

## Justified packages

| Package | Path | Version | Role |
|---------|------|---------|------|
| `@apzhub/testing-contracts` | `packages/testing-contracts/` | `0.2.0` | Enums, domain models, service interfaces, events, permissions, config types |
| `@apzhub/testing-foundation` | `packages/testing-foundation/` | `0.1.0` | In-memory registries + validation helpers |
| `@apzhub/testing-persistence` | `packages/testing-persistence/` | `0.2.0` | Repositories (in-memory + Postgres), authz asserts, persistence validation, row mappers |
| `@apzhub/testing-services` | `packages/testing-services/` | `0.1.0` | Manual testing domain services (business logic only) |

**Schema:** `packages/config/src/db/testing-schema.ts` (not a separate package) — SoR tables + migrations `0016`–`0019`.

**Do not create** unused extras such as `testing-domain`, `testing-types`, or `testing-common` unless a later milestone justifies them.

---

## Dependencies

```text
@apzhub/testing-services
        ├── @apzhub/testing-contracts
        ├── @apzhub/testing-foundation
        ├── @apzhub/testing-persistence
        └── @apzhub/platform-service-contracts

@apzhub/testing-persistence
        ├── @apzhub/testing-contracts
        ├── @apzhub/platform-authorization
        ├── @apzhub/config
        └── drizzle-orm

@apzhub/testing-foundation
        └── @apzhub/testing-contracts
                    └── @apzhub/platform-service-contracts  (ServiceRequestContext only)
```

`testing-foundation` also depends on `zod` for input schemas.

Forbidden in TCMS packages (production source):

- `playwright`, `vitest` (except `*.test.ts`), `junit`, `allure`, `puppeteer`, `cypress`
- Workbench UI / HTTP frameworks
- Event Bus publish (collector only in services)
- Binary upload pipelines

---

## Technical debt (APZTCMS-004)

`createPostgresTestingPersistence` still falls back to an **in-memory facade** for aggregates without first-class SQL (including new manual-execution / case-version paths where Postgres mappers are incomplete). Expand table coverage incrementally — prefer completing manual-execution Postgres repos in **APZTCMS-005**. Prefer in-memory factories for unit tests.

---

## Related

- [Manual Testing Domain](./APZHUB-APZ-TCMS-Manual-Testing-Domain.md)
- [Service Architecture](./APZHUB-APZ-TCMS-Service-Architecture.md)
- [Developer Guide](./APZHUB-APZ-TCMS-Developer-Guide.md)
- [APZTCMS-004 Completion Report](../sprint/APZTCMS-004-completion-report.md)
