# APZHUB Integration SDK Architecture Freeze Notice

**Programme:** Platform Integration SDK (OSS-100)  
**Effective:** 2026-07-18 (OSS-100-11)  
**Package:** `@apzhub/integration-sdk` **1.0.0**  
**Status:** **Architecture Frozen**

---

## Frozen architecture

```text
Platform Services
        ↓
Integration SDK
        ↓
Provider Adapter
        ↓
Vendor API
```

Supporting certified path elements (also frozen in role):

```text
Adapter → Auth / Connection / Transport / Mapping / Events contracts
        → Diagnostics / Health / Lifecycle / Error translation
        → Harness & Certification (dev/CI only)
```

No alternative adapter foundation path is permitted for new OSS/vendor adapters.

---

## What is frozen

| Surface                        | Freeze scope                                                                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package                        | `@apzhub/integration-sdk` **1.0.0**                                                                                                                                                                  |
| Version constant               | `INTEGRATION_SDK_VERSION = "1.0.0"`                                                                                                                                                                  |
| Export subpaths                | `.` · `auth` · `connection` · `health` · `diagnostics` · `lifecycle` · `errors` · `transport` · `mapping` · `events` · `harness` · `adapter` · `observability` · `resilience` · `version` · `client` |
| Adapter contracts              | `AdapterBase`, manifests, capability registration, factory patterns                                                                                                                                  |
| Auth / secrets                 | Auth providers, credential resolver, SecretProvider ports                                                                                                                                            |
| Connection                     | Connection manager, registry, lifecycle                                                                                                                                                              |
| Diagnostics / health / version | Provider interfaces + aggregation                                                                                                                                                                    |
| Errors / observability         | Error model, metrics contracts, integration logger                                                                                                                                                   |
| Transport / mapping / events   | HTTP transport, mapping framework, webhook/polling contracts                                                                                                                                         |
| Harness                        | Development harness, compliance, certification helpers                                                                                                                                               |

---

## Dependency rules (frozen)

1. Integration SDK must not depend on vendor adapters or `@apzhub/platform-services`
2. Provider adapters depend on Integration SDK (prefer subpath imports)
3. Products / modules must not import vendor SDKs or adapter internals
4. Vendor APIs are isolated behind provider adapters
5. Canonical SDK models remain stable under semver 1.x
6. No reverse dependencies (adapters ↛ SDK internals beyond public exports)

---

## Extension points (permitted without thaw)

- New provider adapters under `integrations/` following the Reference Standard
- Documentation and certification evidence updates that do not alter SDK runtime behaviour
- Backward-compatible MINOR additions after ADR + owner approval

---

## Prohibited modifications

Without ADR + owner approval + architecture review + new milestone:

- Breaking public API changes under 1.x
- Embedding Event Bus publish, HTTP webhook ingress, or provisioning into the SDK
- Adding durable checkpoint/dedup/replay stores as SDK runtime requirements
- Vendor SDK leakage into products or platform-services
- Replacing AdapterBase / capability model with an alternate foundation

---

## Future evolution process

1. Formal ADR
2. Explicit owner approval
3. Architecture review against this Freeze Notice and the Reference Standard
4. New approved milestone (not OSS-100-11)
5. Semver bump per versioning policy (PATCH / MINOR / MAJOR)

---

## Classification retained

**PRODUCTION_READY_WITH_LIMITATIONS** (ADR-0058 catalogue; promoted at 1.0.0 by ADR-0065).

Accepted absences: Event Bus publish · webhook HTTP ingress · provisioning · durable checkpoint stores · production Vault (PlaceholderVault only).

---

## See also

- [Integration SDK Reference Standard](./APZHUB-Integration-SDK-Reference-Standard.md)
- [ADR-0065](../adr/ADR-0065-integration-sdk-v1-architecture-freeze.md)
- [OSS-100-11 Completion Report](../sprint/OSS-100-11-completion-report.md)
