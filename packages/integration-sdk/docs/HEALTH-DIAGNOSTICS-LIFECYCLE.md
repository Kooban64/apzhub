# Integration SDK — Health, Diagnostics & Lifecycle (OSS-100-03)

> **Package:** `@apzhub/integration-sdk` v0.3.0  
> **Authority:** [Integration Health & Diagnostics Model](../../../docs/architecture/APZHUB-Integration-Health-Diagnostics-Model.md)

---

## Overview

OSS-100-03 delivers platform participation providers for operations:

| Provider                          | Purpose                                                           |
| --------------------------------- | ----------------------------------------------------------------- |
| `HealthProvider`                  | Standard health check suite (logical — no HTTP)                   |
| `DiagnosticsProvider`             | Unified auth + connection + health diagnostics                    |
| `VersionProvider`                 | Metadata-based version probe and compatibility                    |
| `IntegrationLifecycleParticipant` | Enable / disable / shutdown hooks                                 |
| Platform bridge                   | Maps to `@apzhub/platform-lifecycle` shape without package import |

---

## Quick start

```typescript
import { createIntegrationOperationsStack } from "@apzhub/integration-sdk";
import {
  InMemoryConnectionRegistry,
  InMemorySecretProvider,
  DefaultCredentialResolver,
} from "@apzhub/integration-sdk";

const registry = new InMemoryConnectionRegistry();
const stack = createIntegrationOperationsStack({
  integrationId: "my-engine",
  capabilityId: "my-capability",
  registry,
  credentialResolver: new DefaultCredentialResolver({
    secretProvider: new InMemorySecretProvider({ secrets: { "ref/id": "..." } }),
  }),
});

const health = await stack.healthProvider.check({
  context: { correlationId: "...", tenantId: "..." },
  integrationId: "my-engine",
});

const diagnostics = await stack.diagnosticsProvider.collect({
  integrationId: "my-engine",
  context: { correlationId: "...", tenantId: "..." },
});
```

---

## Subpath exports

| Export                                | Module                                |
| ------------------------------------- | ------------------------------------- |
| `@apzhub/integration-sdk/health`      | HealthProvider, aggregation           |
| `@apzhub/integration-sdk/version`     | VersionProvider, compatibility        |
| `@apzhub/integration-sdk/diagnostics` | DiagnosticsProvider (unified)         |
| `@apzhub/integration-sdk/lifecycle`   | LifecycleParticipant, platform bridge |

---

## Health checks (logical)

| Check             | Source                                               |
| ----------------- | ---------------------------------------------------- |
| `configuration`   | Connection lifecycle + configuredAt                  |
| `connectivity`    | Base URL format validation                           |
| `authentication`  | Credential ref + connection state                    |
| `authorization`   | Connected state                                      |
| `version`         | Connection metadata + VersionProvider                |
| `circuit_breaker` | Pass/warn/fail — reflects breaker state (OSS-100-04) |

Aggregation: critical fail → `unavailable`; warn → `degraded`; all pass → `healthy`.

---

## Version compatibility

Declare range in connection metadata:

```text
engineVersion: "1.2.0"
engineVersionMin: "1.0.0"
engineVersionMax: "2.0.0"
```

No network probe in OSS-100-03 — version read from metadata only.

---

## Platform lifecycle bridge

```typescript
import {
  buildIntegrationLifecycleParticipation,
  toPlatformCapabilityParticipation,
} from "@apzhub/integration-sdk/lifecycle";

const snapshot = buildIntegrationLifecycleParticipation({ ... });
const platformRecord = toPlatformCapabilityParticipation(snapshot);
// Pass platformRecord to platform-lifecycle consumer
```

---

## Security

Diagnostics never include raw secrets. Use `containsLikelySecret()` guards in tests.

---

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [CONNECTION-MANAGEMENT.md](./CONNECTION-MANAGEMENT.md)
- [OSS-100-03 Completion Report](../../../docs/sprint/OSS-100-03-completion-report.md)
