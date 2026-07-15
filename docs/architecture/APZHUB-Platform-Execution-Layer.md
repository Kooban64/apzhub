# APZHUB Platform Execution Layer

**Milestone:** OSS-110-04 / OSS-110-06  
**Status:** Canonical — vendor-neutral request execution between modules and platform services  
**Package:** `@apzhub/platform-services` v0.5.0  
**Authority:** [009 — Platform Service Layer](../009-platform-service-layer-integration-framework.md) · [010 — API Gateway & Communication](../010-api-gateway-integration-communication-standards.md) · [013 — Zero Trust](../013-security-architecture-zero-trust-framework.md) · [014 — Observability](../014-observability-monitoring-operations-framework.md) · [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md)

---

## Purpose

Define the reusable execution pipeline that sits between application consumers and platform service implementations. Every gateway-exposed service operation runs through this layer for validation, context enrichment, policy hooks, authorization, middleware, timing, logging, metrics, and structured authz audit.

This layer is **vendor-neutral**. It contains no Plane-specific behaviour and no HTTP routes.

---

## Position in the stack

```text
Modules / future API handlers
        ↓
PlatformServiceGateway  (public accessors unchanged)
        ↓
RequestPipeline  ←── middleware · policies · AuthorizationProvider · logger · metrics · audit
        ↓
Mapping-aware *ServiceImpl
        ↓
MappingOrchestrator → ProviderResolver → Capability Provider → Adapter → Engine
```

**Invariant:** Modules call gateway contracts only. Service implementations remain free of pipeline concerns; wrapping happens at construction time via `wrapServiceWithPipeline`.

---

## Pipeline order

1. Request context validation (`tenantId`, `userId`, `correlationId`)
2. Context enrichment (`requestId`, `execution` metadata)
3. Before middleware (ascending priority)
4. Policy pipeline (first deny wins → `POLICY_DENIED`)
5. Authorization provider (operation map → permission decision)
6. Authorization audit event
7. Invoke service operation (enriched context as first argument) — **only on allow**
8. After middleware (reverse priority)
9. Structured logging + metrics hooks

Authorization denials map to typed codes (`PERMISSION_DENIED`, `AUTHENTICATION_REQUIRED`, etc.). Unknown errors map to `INTERNAL_ERROR`. Existing `PlatformServiceError` instances propagate unchanged.

---

## Components

| Component | Responsibility |
|-----------|----------------|
| `RequestPipeline` | Orchestrates the full execution path |
| `wrapServiceWithPipeline` | Proxy that routes contract methods through the pipeline |
| `AuthorizationProvider` | Pluggable authz; production / allow-all / deny-all |
| `Policy` / `PolicyPipeline` | Preconditions and governance rules |
| `ServiceMiddleware` / `MiddlewareRegistry` | Before/after hooks |
| `PipelineLogger` / `PipelineMetrics` | Observability hooks |
| `AuthorizationAuditSink` | Structured authz audit events |

---

## Authorisation (OSS-110-06)

- Production provider evaluates platform identity/RBAC via `AuthorizationAccessResolver`
- Explicit operation → permission mapping (no reflection-only authz)
- Deny-by-default precedence — see [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
- Bootstrap: `AUTHORIZATION_PROVIDER_MODE` — production never silently allow-all

---

## Request context (additive)

`ServiceRequestContext` retains required fields from OSS-110-01 and adds optional:

- `organisationId`
- `requestId`
- `featureFlags`
- `impersonation`
- `execution` (`ServiceExecutionMetadata`)

Backwards compatible — existing callers need not change.

---

## Gateway integration

`PlatformServiceGateway` public accessors (`workspaces`, `projects`, `teams`, `users`, `search`) return pipeline-wrapped contract surfaces. Accessor names and TypeScript shapes are unchanged from OSS-110-03. `gateway.pipeline` exposes the shared `RequestPipeline` for registration of middleware/policies in composition roots.

---

## Explicit non-goals (still deferred)

- HTTP routes / API Gateway handlers
- TaskServiceImpl / Plane task CRUD
- External policy engines (OPA/Casbin)
- Caching / background jobs
- Identity administration UI

---

## Related

- [Platform Service Authorization](./APZHUB-Platform-Service-Authorization.md)
- [Platform Service Gateway](../specs/APZHUB-Platform-Service-Gateway.md)
- [Platform Execution Layer Specification](../specs/APZHUB-Platform-Execution-Layer.md)
- [Permission Catalogue](../specs/APZHUB-Platform-Permission-Catalogue.md)
- [OSS-110-06 Completion Report](../sprint/OSS-110-06-completion-report.md)
- [OSS-110-04 Completion Report](../sprint/OSS-110-04-completion-report.md)
