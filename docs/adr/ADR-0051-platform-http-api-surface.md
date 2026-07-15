# ADR-0051: Platform HTTP API Surface (v1)

## Status

Accepted — OSS-110-07

## Context

OSS-110-01–06 delivered platform service contracts, implementations, mapping, execution pipeline, and production authorisation. Application consumers still lacked a production HTTP surface. Document 010 requires a single client API through the platform gateway path. Law API (`/api/law/v1`) demonstrates Next.js App Router patterns but must not be reused as the Projects/platform business API.

## Decision

### 1. API versioning

1. Platform business HTTP API is versioned under **`/api/v1`**.
2. Breaking changes require a new major path (`/api/v2`) — additive fields may land in v1 with documentation.
3. OpenAPI document version is `1.0.0` aligned with this surface.

### 2. HTTP response-envelope standard

Success (single):

```json
{ "data": {}, "meta": { "requestId": "...", "correlationId": "..." } }
```

Success (collection):

```json
{ "data": [], "page": { "cursor": null, "nextCursor": null, "limit": 20, "hasMore": false }, "meta": { ... } }
```

Error:

```json
{ "error": { "code": "...", "message": "...", "details": {} }, "meta": { ... } }
```

No stack traces, SQL, secrets, vendor payloads, or authz evaluation internals in public errors.

### 3. Authentication → ServiceRequestContext boundary

1. Session resolved server-side via Better Auth `getValidatedSession`.
2. `ServiceRequestContext` is built only from trusted session + server-generated tracing IDs.
3. Client may supply a validated correlation ID header; request ID is always server-generated.
4. Client-supplied roles, permissions, actor IDs, tenant IDs, and organisation IDs are **never** trusted.
5. `permissions` on context is empty at the HTTP boundary — `ProductionAuthorizationProvider` resolves grants.

### 4. Route → gateway dependency rule

```text
HTTP route → validate → ServiceRequestContext → PlatformServiceGateway → RequestPipeline → …
```

Routes must not import Plane, other adapters, Drizzle, or role tables. Permission strings are not duplicated in route files; operation→permission mapping remains in `@apzhub/platform-services`.

### 5. OpenAPI ownership

1. Canonical spec: `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml` (OpenAPI 3.1).
2. Served at `GET /api/v1/openapi` (JSON; `?format=yaml` for YAML).
3. Validate with: `pnpm openapi:validate:platform` (swagger-cli).
4. No unauthenticated interactive Swagger UI in production for this milestone.

## Alternatives considered

1. **Nest/Express standalone server** — rejected; violates existing Next.js App Router architecture.
2. **Place under `/api/platform/v1`** — rejected for this milestone; owner scope requires `/api/v1`. Platform ops APIs remain under `/api/platform/v1`.
3. **Reuse Law `ok` envelope** — rejected; milestone specifies `data`/`error`/`meta` without `ok`.
4. **GraphQL** — excluded.

## Consequences

- `apps/web/lib/api/v1` holds the HTTP foundation; routes under `apps/web/app/api/v1`.
- Process-level gateway bootstrap with test override; production forbids silent allow-all / memory mapping.
- Workspaces / Projects / Teams delivered in OSS-110-07; Tasks delivered in OSS-110-09. Users/Search remain omitted (unsupported scaffolds).
- Durable idempotency store deferred (header validated + propagated only).

## Related

- [010 — API Gateway](../010-api-gateway-integration-communication-standards.md)
- [ADR-0050](./ADR-0050-production-authorisation-policy-enforcement.md)
- [Platform HTTP API Architecture](../architecture/APZHUB-Platform-HTTP-API.md)
- [Task HTTP API Architecture](../architecture/APZHUB-Task-HTTP-API.md)
- [OSS-110-07 Completion Report](../sprint/OSS-110-07-completion-report.md)
- [OSS-110-09 Completion Report](../sprint/OSS-110-09-completion-report.md)
