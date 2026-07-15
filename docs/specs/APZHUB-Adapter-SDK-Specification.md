# APZHUB Adapter SDK Specification

**Milestone:** OSS-100  
**Status:** Canonical interface specification — **planning only**  
**Authority:** [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md) · [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [API Gateway Standards 010](../010-api-gateway-integration-communication-standards.md)

---

## Purpose

Define **standard contracts** for the Platform Integration SDK (`@apzhub/integration-sdk`). All vendor adapters (Plane, Kimai, Paperless, Zammad, Metabase, n8n, Grafana, Greenbone, MobSF, Faraday) implement domain methods on top of these interfaces.

**Illustrative TypeScript** — not production code. Final types ship in OSS-100-01+.

---

## 1. Context and envelope

Every SDK operation receives a standard request context propagated from the Capability Service:

```typescript
interface IntegrationRequestContext {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;           // absent for service-account calls
  readonly locale?: string;
  readonly timezone?: string;
  readonly permissionSnapshot?: readonly string[];
}
```

---

## 2. Connection

### `ConnectionManager`

Owns connection lifecycle per tenant and integration instance.

```typescript
interface ConnectionManager {
  acquire(context: IntegrationRequestContext): Promise<ManagedConnection>;
  release(connection: ManagedConnection): Promise<void>;
  invalidate(tenantId: string, reason: ConnectionInvalidationReason): Promise<void>;
  status(tenantId: string): Promise<ConnectionStatus>;
}

interface ManagedConnection {
  readonly connectionId: string;
  readonly tenantId: string;
  readonly integrationId: string;
  readonly state: ConnectionState;
  readonly authenticatedAt: string;
  readonly expiresAt?: string;
}

type ConnectionState =
  | "idle"
  | "connecting"
  | "ready"
  | "degraded"
  | "closed"
  | "failed";
```

See [Connection Lifecycle](./APZHUB-Integration-Connection-Lifecycle.md).

### `Connection` (handle)

```typescript
interface Connection {
  readonly id: string;
  readonly baseUrl: string;
  readonly transport: TransportKind;
  readonly metadata: Readonly<Record<string, string>>;
}

type TransportKind = "rest" | "webhook" | "polling" | "graphql";
```

---

## 3. Authentication

### `AuthenticationProvider`

```typescript
interface AuthenticationProvider {
  authenticate(
    connection: Connection,
    context: IntegrationRequestContext,
  ): Promise<AuthenticationResult>;

  refresh(
    session: AuthenticationSession,
    context: IntegrationRequestContext,
  ): Promise<AuthenticationResult>;

  revoke(tenantId: string): Promise<void>;
}

interface AuthenticationResult {
  readonly ok: boolean;
  readonly session?: AuthenticationSession;
  readonly error?: IntegrationError;
}

interface AuthenticationSession {
  readonly kind: "bearer" | "api-key" | "basic" | "oauth" | "forward-auth";
  readonly credentialRef: string;    // Vault ref — never raw secret in logs
  readonly expiresAt?: string;
  readonly headers: Readonly<Record<string, string>>;
}
```

**Rules:**

- Credentials from `@apzhub/config` or Vault (PCv2-04) via `ConfigurationProvider`
- Never expose session tokens to modules or API responses
- SSO bridge hooks for embedded views (007) — adapter declares support in manifest

---

## 4. Transport — REST

### `IntegrationClient`

Abstract transport facade. Vendor adapters use SDK-provided REST implementation — never raw `fetch` in service layer.

```typescript
interface IntegrationClient {
  request<TResponse>(
    options: IntegrationRequestOptions,
  ): Promise<IntegrationResponse<TResponse>>;
}

interface IntegrationRequestOptions {
  readonly connection: Connection;
  readonly context: IntegrationRequestContext;
  readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | boolean>>;
  readonly body?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly idempotencyKey?: string;
  readonly timeoutMs?: number;
}

interface IntegrationResponse<T> {
  readonly status: number;
  readonly data: T;
  readonly headers: Readonly<Record<string, string>>;
  readonly durationMs: number;
  readonly correlationId: string;
}
```

**Applied automatically by SDK:** retry policy, circuit breaker, rate limit, telemetry, error translation hook.

---

## 5. Transport — GraphQL (future)

```typescript
interface GraphQLIntegrationClient {
  query<TData>(
    options: GraphQLRequestOptions,
  ): Promise<IntegrationResponse<TData>>;

  mutate<TData>(
    options: GraphQLRequestOptions,
  ): Promise<IntegrationResponse<TData>>;
}
```

Reserved in OSS-100 architecture. **No implementation** until a wave requires GraphQL-native engine. REST remains default.

---

## 6. Webhook

```typescript
interface WebhookReceiver {
  verifySignature(
    request: IncomingWebhookRequest,
    secretRef: string,
  ): Promise<WebhookVerificationResult>;

  normalize(
    request: IncomingWebhookRequest,
    mapper: WebhookEventMapper,
  ): Promise<readonly NormalizedVendorEvent[]>;
}

interface NormalizedVendorEvent {
  readonly vendorEventType: string;
  readonly vendorEntityId: string;
  readonly occurredAt: string;
  readonly payload: unknown;       // adapter-internal only
  readonly correlationId: string;
}
```

Webhook handlers run in platform route handlers — never in modules. Normalized events feed Capability Service → platform events (029).

---

## 7. Polling

```typescript
interface PollingScheduler {
  register(config: PollingScheduleConfig): Promise<void>;
  unregister(integrationId: string, tenantId: string): Promise<void>;
}

interface PollingScheduleConfig {
  readonly integrationId: string;
  readonly tenantId: string;
  readonly intervalMs: number;
  readonly cursorKey: string;
  readonly handler: PollingHandler;
}

type PollingHandler = (
  context: IntegrationRequestContext,
  cursor: string | null,
) => Promise<PollingResult>;

interface PollingResult {
  readonly nextCursor: string | null;
  readonly events: readonly NormalizedVendorEvent[];
}
```

Polling uses PCv2-02 workers — never long-running polls in request handlers (012).

---

## 8. Health

### `HealthProvider`

```typescript
interface HealthProvider {
  check(context: IntegrationRequestContext): Promise<IntegrationHealthResult>;
}

interface IntegrationHealthResult {
  readonly status: "healthy" | "degraded" | "unavailable" | "disabled";
  readonly integrationId: string;
  readonly tenantId?: string;
  readonly checks: readonly HealthCheckItem[];
  readonly observedAt: string;
  readonly correlationId: string;
}

interface HealthCheckItem {
  readonly name: string;
  readonly status: "pass" | "warn" | "fail";
  readonly message?: string;
  readonly durationMs?: number;
}
```

Standard checks: connectivity, authentication, required scopes, version compatibility.

---

## 9. Diagnostics

### `DiagnosticsProvider`

```typescript
interface DiagnosticsProvider {
  collect(context: IntegrationRequestContext): Promise<IntegrationDiagnosticsPayload>;
}

interface IntegrationDiagnosticsPayload {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly connectionConfigured: boolean;
  readonly authenticationPresent: boolean;
  readonly engineVersion?: string;
  readonly versionCompatibility: VersionCompatibilityStatus;
  readonly healthStatus: IntegrationHealthResult["status"];
  readonly circuitBreakerState?: CircuitBreakerState;
  readonly lastSuccessfulRequestAt?: string;
  readonly errorRate5m?: number;
  readonly latencyP95Ms?: number;
  readonly syncLagSeconds?: number;
  readonly correlationId: string;
}
```

Registered with bootstrap diagnostics loader extension — same pattern as Plane config diagnostics (OSS-101-02).

---

## 10. Lifecycle

### `LifecycleParticipant`

```typescript
interface LifecycleParticipant {
  onEnable(context: LifecycleContext): Promise<LifecycleResult>;
  onDisable(context: LifecycleContext): Promise<LifecycleResult>;
  onProvision(context: ProvisionContext): Promise<ProvisionResult>;
  onReconcile(context: ReconcileContext): Promise<ReconcileResult>;
  onShutdown(context: LifecycleContext): Promise<void>;
}

interface ProvisionContext extends LifecycleContext {
  readonly provisionSpec: ProvisionSpec;
}

interface ProvisionResult {
  readonly ok: boolean;
  readonly vendorScopeId?: string;
  readonly error?: IntegrationError;
}
```

Integrates with `@apzhub/platform-lifecycle` (PRH-009).

---

## 11. Provisioning

```typescript
interface ProvisionSpec {
  readonly tenantId: string;
  readonly productId: string;
  readonly provisioningKind: string;
  readonly parameters: Readonly<Record<string, string>>;
}

interface ReconcileContext extends LifecycleContext {
  readonly dryRun: boolean;
}
```

Provisioning is **idempotent**. Duplicate calls return existing vendor scope ID.

---

## 12. User mapping

```typescript
interface UserMappingProvider {
  resolvePlatformUser(
    vendorUserId: string,
    tenantId: string,
  ): Promise<string | null>;

  resolveVendorUser(
    platformUserId: string,
    tenantId: string,
  ): Promise<string | null>;

  ensureVendorUser(
    platformUserId: string,
    tenantId: string,
    profile: UserMappingProfile,
  ): Promise<UserMappingRecord>;
}

interface UserMappingRecord {
  readonly platformUserId: string;
  readonly vendorUserId: string;
  readonly tenantId: string;
  readonly status: "active" | "suspended" | "removed";
}
```

Platform identity is SoR — never sync vendor user lists as authoritative.

---

## 13. Permission mapping

```typescript
interface PermissionMappingProvider {
  resolveVendorRoles(
    platformPermissions: readonly string[],
    tenantId: string,
  ): Promise<readonly string[]>;

  applyVendorRoles(
    platformUserId: string,
    platformPermissions: readonly string[],
    tenantId: string,
  ): Promise<void>;
}
```

Engine role names **never** appear in UI or API responses (002, 007).

---

## 14. Entity mapping

```typescript
interface EntityMappingProvider {
  toPlatformId(
    vendorEntityType: string,
    vendorEntityId: string,
    tenantId: string,
  ): Promise<string | null>;

  toVendorId(
    platformEntityType: string,
    platformEntityId: string,
    tenantId: string,
  ): Promise<string | null>;

  bind(
    binding: EntityMappingBinding,
  ): Promise<EntityMappingRecord>;
}

interface EntityMappingBinding {
  readonly tenantId: string;
  readonly platformEntityType: string;
  readonly platformEntityId: string;
  readonly vendorEntityType: string;
  readonly vendorEntityId: string;
}
```

---

## 15. Error translation

### `ErrorTranslator`

```typescript
interface ErrorTranslator {
  translate(
    error: unknown,
    context: ErrorTranslationContext,
  ): IntegrationError;
}

interface IntegrationError {
  readonly category: IntegrationErrorCategory;
  readonly code: string;
  readonly message: string;          // safe for operator logs — not raw vendor body
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly vendorStatusCode?: number;
}

type IntegrationErrorCategory =
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "vendor_unavailable"
  | "timeout"
  | "mapping"
  | "provisioning"
  | "version_incompatible"
  | "internal";
```

See [Error Translation Model](./APZHUB-Integration-Error-Translation-Model.md).

---

## 16. Version compatibility

### `VersionProvider`

```typescript
interface VersionProvider {
  probe(connection: Connection, context: IntegrationRequestContext): Promise<VendorVersionInfo>;

  checkCompatibility(
    detected: VendorVersionInfo,
    declared: VersionRange,
  ): VersionCompatibilityResult;
}

interface VendorVersionInfo {
  readonly version: string;
  readonly build?: string;
  readonly apiVersion?: string;
}

interface VersionRange {
  readonly min: string;
  readonly max?: string;
}

interface VersionCompatibilityResult {
  readonly status: VersionCompatibilityStatus;
  readonly detected?: VendorVersionInfo;
  readonly declared: VersionRange;
  readonly message?: string;
}

type VersionCompatibilityStatus =
  | "compatible"
  | "warning"
  | "incompatible"
  | "not_checked";
```

Declared ranges live in `integration.yaml` `documentation` block (026).

---

## 17. Upgrade compatibility

```typescript
interface UpgradeCompatibilityPolicy {
  evaluate(
    current: VendorVersionInfo,
    target: VendorVersionInfo,
    adapterVersion: string,
  ): UpgradeCompatibilityResult;
}

interface UpgradeCompatibilityResult {
  readonly allowed: boolean;
  readonly order: "adapter_first" | "engine_first" | "coordinated";
  readonly blockers: readonly string[];
  readonly notes: readonly string[];
}
```

Contract tests gate adapter upgrades (015). Documented per integration in deployment notes.

---

## 18. Resilience policies

### `RetryPolicy`

```typescript
interface RetryPolicy {
  shouldRetry(error: IntegrationError, attempt: number): boolean;
  delayMs(attempt: number): number;
  maxAttempts: number;
}
```

Default: retry on `vendor_unavailable`, `timeout`, `rate_limited` (with respect for Retry-After).

### `CircuitBreaker`

```typescript
interface CircuitBreaker {
  readonly state: CircuitBreakerState;
  allowRequest(): boolean;
  recordSuccess(): void;
  recordFailure(error: IntegrationError): void;
}

type CircuitBreakerState = "closed" | "open" | "half_open";
```

### `RateLimitPolicy`

```typescript
interface RateLimitPolicy {
  acquire(key: string): Promise<RateLimitToken>;
  readonly limitPerWindow: number;
  readonly windowMs: number;
}
```

---

## 19. Observability

### `Telemetry`

```typescript
interface Telemetry {
  startSpan(name: string, context: IntegrationRequestContext): IntegrationSpan;
  injectHeaders(span: IntegrationSpan): Readonly<Record<string, string>>;
}

interface IntegrationSpan {
  setAttribute(key: string, value: string | number | boolean): void;
  recordException(error: IntegrationError): void;
  end(): void;
}
```

### `Metrics`

```typescript
interface IntegrationMetrics {
  recordRequest(options: RequestMetricOptions): void;
  recordError(error: IntegrationError): void;
  recordCircuitBreakerTransition(state: CircuitBreakerState): void;
}
```

### `Logging`

```typescript
interface IntegrationLogger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}
```

**Prohibited in logs:** secrets, raw vendor response bodies, PII beyond opaque IDs.

---

## 20. Configuration and feature flags

### `ConfigurationProvider`

```typescript
interface ConfigurationProvider {
  get<T>(key: string, tenantId?: string): T;
  isIntegrationEnabled(integrationId: string, tenantId?: string): boolean;
  onChange(handler: ConfigurationChangeHandler): void;
}
```

Reads from `@apzhub/config` governance registry — never hardcoded env in adapters.

### `FeatureFlagProvider`

```typescript
interface FeatureFlagProvider {
  isEnabled(flagKey: string, context: IntegrationRequestContext): boolean;
}
```

Evaluates governance feature flags (e.g. `capability.projects.enabled`).

---

## 21. Capability registration

### `CapabilityRegistration`

```typescript
interface CapabilityRegistration {
  registerFromManifest(manifestPath: string): Promise<RegistrationResult>;
  integrationId: string;
  declaredCapabilities: readonly string[];
}
```

Bridges `integration.yaml` to Platform Runtime discovery (026, 024). Adapters call at bootstrap — not from modules.

---

## 22. AdapterBase

```typescript
abstract class AdapterBase implements LifecycleParticipant {
  readonly integrationId: string;

  protected constructor(deps: AdapterBaseDependencies) {}

  abstract health(context: IntegrationRequestContext): Promise<IntegrationHealthResult>;
  abstract diagnostics(context: IntegrationRequestContext): Promise<IntegrationDiagnosticsPayload>;

  // LifecycleParticipant — default SDK implementations with vendor hooks
  onEnable(context: LifecycleContext): Promise<LifecycleResult>;
  onDisable(context: LifecycleContext): Promise<LifecycleResult>;
  onProvision(context: ProvisionContext): Promise<ProvisionResult>;
  onReconcile(context: ReconcileContext): Promise<ReconcileResult>;
  onShutdown(context: LifecycleContext): Promise<void>;

  protected get client(): IntegrationClient;
  protected get connectionManager(): ConnectionManager;
  protected get errorTranslator(): ErrorTranslator;
}
```

See [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md).

---

## 23. Vendor adapter extension pattern

Domain adapters (e.g. `PlaneAdapter`) extend `AdapterBase` and add **domain methods only**:

```typescript
interface PlaneAdapter extends AdapterBase {
  listProjects(context: IntegrationRequestContext): Promise<ProjectListResult>;
  createTask(context: IntegrationRequestContext, input: CreateTaskInput): Promise<TaskResult>;
  // … domain methods — APZHUB DTOs only
}
```

`PlaneClient` (internal REST paths) uses `this.client` from SDK — never imported outside `integrations/plane/`.

---

## Related

- [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md)
- [Base Adapter Pattern](./APZHUB-Base-Adapter-Pattern.md)
- [OSS-100 Backlog](../backlog/OSS-100-Platform-Integration-SDK-Backlog.md)
