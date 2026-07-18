# APZHUB — Testing Platform Service Architecture

**Milestone:** APZTCMS-011 — Testing Platform Services & Gateway Integration  
**Packages:** `@apzhub/platform-service-contracts` **0.8.0** · `@apzhub/platform-services` **0.8.0**  
**Domain packages (unchanged):** `@apzhub/testing-contracts` **0.6.0** · `@apzhub/testing-persistence` **0.7.0** · `@apzhub/testing-services` **0.5.0**  
**Status:** Implemented — platform layer ready; HTTP ingress deferred to APZTCMS-012

---

## Purpose

Define how APZ TCMS domain capabilities are exposed through APZHUB Platform Services and the shared `PlatformServiceGateway`, without duplicating business logic or bypassing the execution pipeline.

---

## Layered request path

```text
[Future] HTTP /api/v1/testing-*  (APZTCMS-012)
        ↓
PlatformServiceGateway.testing.*  (nested gateway surface)
        ↓
RequestPipeline  (context → authz → policies → audit → metrics)
        ↓
Testing*ServiceImpl  (@apzhub/platform-services)
        ↓
TestingDomainServices  (@apzhub/testing-services)
        ↓
TestingPersistence / repositories  (@apzhub/testing-persistence)
        ↓
Platform PostgreSQL  (testing_* tables)
```

| Layer                         | Owns                                                                        | Does not own                            |
| ----------------------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| **Presentation** (`apps/web`) | View models, permission-gated UI, typed client transport                    | Business rules, DB, gateway             |
| **Platform contracts**        | Vendor-neutral service interfaces, `ServiceRequestContext`                  | Implementations                         |
| **Platform implementations**  | Context assertion, error translation, pipeline wiring, orchestration façade | Domain state machines, repository SQL   |
| **Domain services**           | Lifecycle, validation, traceability, certification gates, audit semantics   | HTTP, UI, platform permission catalogue |
| **Persistence**               | Repositories, RLS, tenant scoping, permission asserts at repo boundary      | Platform pipeline, OpenAPI              |

---

## Domain vs platform responsibilities

### Domain (`@apzhub/testing-services`)

- Business rules and state machines (plans, executions, certification, evidence metadata, automation ingestion, quality intelligence)
- `createTestingDomainServices` factory — single domain composition root
- `DomainRuleError` with stable classification codes
- No knowledge of `PlatformServiceError`, HTTP, or gateway naming

### Platform (`@apzhub/platform-services`)

- Seventeen `Testing*ServiceImpl` classes delegating to domain services
- `assertTestingContext` on every operation (tenant, user, correlation ID)
- `mapTestingDomainError` → `PlatformServiceError` (user-safe, correlation-aware)
- `wrapTestingPlatformGatewayWithPipeline` — authz via explicit operation map
- Bootstrap factories: `createTestingPlatformServices`, `ForProduction`, `ForTest`
- Readiness indicators (`testing-readiness.ts`) — honest capability reporting

### Contracts (`@apzhub/platform-service-contracts`)

- `TestingPlatformGateway` nested surface (`plans`, `suites`, … `reporting`)
- Per-capability service interfaces aligned with domain contracts but using `ServiceRequestContext`
- Stable boundary for future HTTP handlers and typed clients

---

## Gateway integration

Testing is registered on the root gateway as **`gateway.testing.*`** (not top-level `gateway.plans` etc.).

```typescript
const testing = createTestingPlatformServicesForProduction({ postgresDb });
const { gateway } = createPlatformServices({
  testing,
  accessResolver,
  authorizationMode: "production",
});

await gateway.testing.plans.list(ctx);
```

When testing is not wired, `gateway.testing` throws `PlatformServiceError` with code `PROVIDER_CAPABILITY_UNSUPPORTED` and message **"Testing service is not enabled"**.

---

## Explicit exclusions (APZTCMS-011)

| Excluded                                     | Notes                                                  |
| -------------------------------------------- | ------------------------------------------------------ |
| HTTP route handlers                          | APZTCMS-012                                            |
| OpenAPI / generated typed HTTP client        | APZTCMS-012                                            |
| Workbench transport swap                     | Mock client unchanged in `apps/web/lib/testing`        |
| Event Bus / notifications / search indexing  | Not wired; readiness reports `eventBus: "not-wired"`   |
| AI assist / suggestions                      | Deferred after APZTCMS-012 (former 011 AI scope)       |
| Binary evidence storage / object storage SDK | Metadata-only; `binaryEvidenceStorage: "out-of-scope"` |
| Test runners / CI workers                    | Domain ingestion only; no execution engines            |
| Silent in-memory production fallback         | Production factory requires Postgres                   |
| Silent allow-all authz in production         | Same rules as OSS-110-06                               |

---

## Architecture boundaries (enforced by tests)

- Workbench code (`apps/web/lib/testing`, `apps/web/components/testing`) must **not** import `@apzhub/platform-services`
- `@apzhub/testing-services` and `@apzhub/testing-persistence` must **not** import `@apzhub/platform-services`
- Gateway must **not** import testing repositories directly
- No `apps/web/app/api/v1/testing-*` routes in this milestone

See `testing-architecture-boundary.test.ts`.

---

## Related

- [Testing Platform Service Contracts](./APZHUB-Testing-Platform-Service-Contracts.md)
- [Testing Gateway Reference](./APZHUB-Testing-Gateway-Reference.md)
- [Testing Bootstrap Configuration Guide](./APZHUB-Testing-Bootstrap-Configuration-Guide.md)
- [Testing Domain-Platform Boundary Guide](./APZHUB-Testing-Domain-Platform-Boundary-Guide.md)
- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [APZTCMS-011 Completion Report](../sprint/APZTCMS-011-completion-report.md)
