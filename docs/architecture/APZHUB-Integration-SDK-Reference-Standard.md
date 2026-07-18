# APZHUB Integration SDK Reference Standard

**Status:** Official APZHUB Integration SDK Reference Standard  
**Declared:** OSS-100-11 (2026-07-18)  
**Package:** `@apzhub/integration-sdk` **1.0.0**  
**Architecture:** **Frozen** ([Freeze Notice](./APZHUB-Integration-SDK-Architecture-Freeze-Notice.md))  
**Classification:** PRODUCTION_READY_WITH_LIMITATIONS

---

## Purpose

Authoritative engineering reference for building and consuming APZHUB integration adapters. The Integration SDK is the shared foundation between Platform Services and vendor-specific provider adapters.

---

## Architecture

```text
Platform Services → Integration SDK → Provider Adapter → Vendor API
```

Inversion of control: Platform Services depend on adapter interfaces; adapters consume SDK ports (auth, connection, transport, mapping, events, diagnostics). Vendor SDKs stay inside adapters.

---

## Package catalogue

| Package                              | Version   | Role                                       |
| ------------------------------------ | --------- | ------------------------------------------ |
| `@apzhub/integration-sdk`            | **1.0.0** | Shared foundation (this standard)          |
| `@apzhub/integration-plane`          | **0.6.0** | Projects Reference Adapter                 |
| `@apzhub/integration-zammad`         | **0.6.0** | Support Reference Adapter                  |
| `@apzhub/integration-meilisearch`    | **0.1.0** | Search Reference Adapter                   |
| `@apzhub/integration-n8n`            | **0.1.0** | Workflow Engine Reference Adapter          |
| `@apzhub/integration-github-actions` | **0.1.0** | CI/CD Reference Adapter                    |
| `@apzhub/integration-search-sdk`     | **0.1.0** | Search Integration SDK (domain layer)      |
| `@apzhub/search-integration`         | **0.2.0** | Cross-product Search publication framework |
| `@apzhub/search-orchestrator`        | **0.1.0** | Search publication orchestration           |

---

## Dependency rules

- SDK ↛ vendor adapters / platform-services / product packages
- Adapters → SDK public exports only (prefer subpaths)
- Products → Platform Services / typed clients — never vendor SDKs
- Canonical models defined in SDK remain stable for 1.x

---

## Capability model

Adapters register capabilities via AdapterBase / capability registration APIs. Discovery and certification enumerate capability IDs. Capabilities must declare identity, health relevance, and configuration metadata as required by the harness.

---

## Adapter lifecycle

Bootstrap → configure → connect → ready → degrade/recover → dispose. Lifecycle participants integrate with platform lifecycle bridges without embedding platform Event Bus publish.

---

## Authentication & connection

- Credential kinds + SecretProvider ports
- Credential refs — never plaintext secrets in logs/diagnostics
- Connection manager + registry
- TLS defaults: certificate validation on

---

## Diagnostics, health, version

- DiagnosticsProvider with sanitised fields
- HealthProvider aggregation
- VersionProvider + compatibility negotiation helpers
- Forbidden diagnostic keys for secrets

---

## Error translation & observability

- Structured error model / `SdkResult`
- ErrorTranslator boundary — no raw vendor errors to users
- Metrics contracts + integration logger with redaction

---

## Transport, mapping, events

- Shared HTTP transport + policies + mock transport
- Mapping Provider Framework (registry, pipeline, transformers)
- Webhook verification & polling contracts (no ingress/runtime workers in SDK)

---

## Provider registration & bootstrap

- Adapter factory / constructor patterns
- Manifest-first integration metadata (foundation 026)
- Bootstrap configuration validation before connect

---

## Test harnesses

- `@apzhub/integration-sdk/harness` — development harness, compliance, certification, mocks, scaffold, CI helpers
- Orthogonal to production adapter operations (ADR-0057)

---

## Security model

- SecretProvider isolation
- Masking / sanitizers / logger redaction
- Diagnostics forbidden keys
- No credentials in events safe-log fields
- Provider isolation from products

---

## Versioning policy (post-1.0.0)

| Bump      | When                                                                |
| --------- | ------------------------------------------------------------------- |
| **PATCH** | Compatible bug fixes, docs, internal hardening                      |
| **MINOR** | Backward-compatible additions (ADR + owner for significant surface) |
| **MAJOR** | Breaking API changes — ADR + owner + architecture review required   |

`INTEGRATION_SDK_VERSION` must match `package.json` version.

---

## Explicit non-goals (frozen absence)

- Platform Event Bus publish
- HTTP webhook ingress servers
- Provisioning / upgrade automation
- Durable checkpoint / dedup / replay stores
- Production Vault implementation (PlaceholderVault experimental only)

---

## See also

- [Freeze Notice](./APZHUB-Integration-SDK-Architecture-Freeze-Notice.md)
- [Provider Development Guide](../developer/APZHUB-Integration-SDK-Provider-Development-Guide.md)
- [Compatibility Guide](../guides/APZHUB-Integration-SDK-Compatibility-Guide.md)
- [Operational Readiness Guide](../guides/APZHUB-Integration-SDK-Operational-Readiness-Guide.md)
