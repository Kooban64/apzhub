# APZHUB Platform Execution Layer Specification

**Milestone:** OSS-110-04 / OSS-110-06  
**Package:** `@apzhub/platform-services`  
**Status:** Canonical contracts and behaviour for the platform request pipeline

---

## Purpose

Specify the reusable execution infrastructure between `PlatformServiceGateway` and platform service implementations: request pipeline, authorization, policy framework, service middleware, request-context enhancements, and authz audit.

---

## Request pipeline

### Contract

`RequestPipeline.execute(input)` runs a single service operation.

### Guarantees

| Concern | Behaviour |
|---------|-----------|
| Validation | Requires `tenantId`, `userId`, `correlationId` |
| Context propagation | Enriched context passed as first invoke argument |
| Correlation ID | Preserved from caller; never rewritten |
| Request ID | Generated when absent; mirrored into `execution.requestId` |
| Timing | Duration recorded on success and failure metrics |
| Logging | Structured start/success/failure events via `PipelineLogger` |
| Metrics | `PipelineMetrics` hooks for duration and outcome |
| Authorization | Operation map → provider decision; deny before service invoke |
| Audit | `authorization.evaluated` via `AuthorizationAuditSink` |
| Errors | Typed authz/policy codes; `PlatformServiceError` passthrough; unknown → `INTERNAL_ERROR` |

### Construction options

```typescript
new RequestPipeline({
  logger,
  metrics,
  authorization,      // production | allow-all | deny-all
  policies,
  middlewares,
  auditSink,
  enforceAuthorization, // default: true
});
```

---

## Authorization

| Type | Role |
|------|------|
| `AuthorizationProvider` | `authorize(request) → AuthorizationDecision` |
| `AuthorizationDecision` | `effect: "allow" \| "deny"` plus optional reason/code |
| `PermissionKey` | Catalogue key `{capability}.{action}` |
| `AuthorizationResource` | Typed resource reference |
| `ProductionAuthorizationProvider` | Production deny-by-default evaluator |
| `AllowAllAuthorizationProvider` | Explicit development/test mode only |
| `DenyAllAuthorizationProvider` | Explicit test mode |
| `OPERATION_AUTHORIZATION_MAPPINGS` | Explicit service/operation → permission |

See [ADR-0050](../adr/ADR-0050-production-authorisation-policy-enforcement.md) and [Permission Catalogue](./APZHUB-Platform-Permission-Catalogue.md).

### Bootstrap

| Env | Values |
|-----|--------|
| `AUTHORIZATION_PROVIDER_MODE` | `production` \| `allow-all` \| `deny-all` |
| `AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION` | Explicit escape hatch only |

---

## Policy pipeline

`Policy` interface with `kind`, `priority`, and `evaluate(ctx) → PolicyDecision`.

Production kinds in use:

- `authorization` — authenticated actor, active account, tenant membership, impersonation
- `validation` — organisation scope, mapping tenant isolation
- `maintenance_mode` — contract hook

Framework-ready kinds (not fully productised): `rate_limiting`, `feature_flags`, `licensing`.

`PolicyPipeline` evaluates by ascending priority; first `deny` short-circuits as `POLICY_DENIED`.

Policies handle preconditions; the provider handles permission decisions — do not duplicate.

---

## Service middleware

```typescript
interface ServiceMiddleware {
  readonly name: string;
  readonly priority?: number;
  before?(ctx: ServiceMiddlewareContext): Promise<ServiceMiddlewareResult | void>;
  after?(ctx: ServiceMiddlewareContext, result: unknown, error?: unknown): Promise<void>;
}
```

Before hooks run ascending priority; after hooks run reverse. Suitable for logging, metrics, validation, and policy evaluation wrappers.

---

## Request context extensions

Additive optional fields on `ServiceRequestContext`:

- `organisationId`
- `requestId`
- `featureFlags`
- `impersonation` (`actorUserId`, optional `reason`)
- `execution` (`requestId`, `startedAt`, `source`, `clientVersion`, `extras`)

Required fields unchanged for backwards compatibility.

---

## Gateway wiring

`createPlatformServices` builds a shared `RequestPipeline` (via `createAuthorizationRuntime` unless overridden), wraps each service API with `wrapServiceWithPipeline`, and injects wrapped surfaces into `PlatformServiceGateway`. Public gateway accessors remain identical to OSS-110-03.

---

## Non-goals (deferred)

No HTTP routes, no TaskServiceImpl, no external policy engines, no identity admin UI, no caching/background jobs.

---

## Related

- [Architecture: Platform Execution Layer](../architecture/APZHUB-Platform-Execution-Layer.md)
- [Platform Service Authorization](../architecture/APZHUB-Platform-Service-Authorization.md)
- [Platform Service Gateway](./APZHUB-Platform-Service-Gateway.md)
- [OSS-110-06 Completion Report](../sprint/OSS-110-06-completion-report.md)
- [OSS-110-04 Completion Report](../sprint/OSS-110-04-completion-report.md)
