# APZHUB Integration SDK Operational Readiness Guide

> **SDK:** `@apzhub/integration-sdk` **1.0.0** · Architecture Frozen  
> **Milestone:** OSS-100-11  
> **Audience:** Platform operators, adapter maintainers

---

## Bootstrap

- Adapters bootstrap via SDK factory / AdapterBase patterns
- Configuration validation precedes connect
- Deny insecure defaults (TLS certificate validation on)
- Secrets resolved through SecretProvider — never embedded in config blobs logged to diagnostics

---

## Configuration

- Connection configs use credential **references**
- Environment-specific vendor base URLs stay in adapter/connection config
- PlaceholderVault is experimental — production deployments must supply a real SecretProvider

---

## Provider discovery

- Capability registration enables discovery of adapter capabilities
- Manifest-first (`integration.yaml`) remains the contract before code
- Platform Services resolve adapters through composition — not ad-hoc imports

---

## Diagnostics & health

- Use DiagnosticsProvider / HealthProvider surfaces
- Sanitize all diagnostic payloads (forbidden secret keys)
- Health aggregation supports degraded/unavailable vendor states without crashing the platform

---

## Compatibility reporting

- VersionProvider + compatibility helpers report SDK/vendor alignment
- Release lanes should run `pnpm certify:integration-sdk`
- Provider harness re-certification remains available via `testing/sdk-v1`

---

## Operational limitations

| Limitation                          | Guidance                                               |
| ----------------------------------- | ------------------------------------------------------ |
| No Event Bus publish in SDK         | Platform owns bus; adapters emit source envelopes only |
| No webhook HTTP ingress             | Platform ingress deferred                              |
| No provisioning                     | Deferred beyond OSS-100-11                             |
| No durable checkpoint stores in SDK | Caller/platform-owned                                  |
| PlaceholderVault                    | Replace for production secret backends                 |

---

## Commands

```bash
pnpm --filter @apzhub/integration-sdk typecheck
pnpm --filter @apzhub/integration-sdk lint
pnpm certify:integration-sdk
pnpm audit:integration-sdk-wave
```
