# APZHUB Integration SDK — Provider Development Guide

> **Audience:** Adapter authors  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (Architecture Frozen)  
> **Authority:** [Reference Standard](../architecture/APZHUB-Integration-SDK-Reference-Standard.md)

---

## Prerequisites

1. Read foundation [026 — Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)
2. Read [Freeze Notice](../architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md)
3. Prefer subpath imports over the root barrel

---

## Official adapter pattern

1. Create `integrations/{vendor}/` with `integration.yaml` **before** code
2. Depend on `@apzhub/integration-sdk` (`workspace:*`)
3. Implement `AdapterBase` (or domain SDK extending it)
4. Register capabilities, health, diagnostics, version reporting
5. Isolate vendor SDK/client inside the adapter package
6. Translate errors via SDK error model
7. Certify with `@apzhub/integration-sdk/harness`

```text
Platform Services → Integration SDK → Your Adapter → Vendor API
```

---

## Required surfaces

| Surface                 | Expectation                                          |
| ----------------------- | ---------------------------------------------------- |
| Capability registration | Discoverable capability IDs + metadata               |
| Authentication          | SecretProvider / credential refs — no plaintext logs |
| Connection              | Lifecycle via connection manager patterns            |
| Configuration           | Validate before connect                              |
| Diagnostics             | Sanitised; no secrets                                |
| Health                  | Aggregatable health checks                           |
| Lifecycle               | Bootstrap / dispose with reasons                     |
| Version reporting       | Vendor + SDK compatibility reporting                 |
| Errors                  | Translated — never raw vendor errors to UI           |

---

## Forbidden

- Importing sibling vendor adapters
- Exposing vendor types through Platform Service contracts
- Publishing to Event Bus from the adapter (deferred platform concern)
- Embedding HTTP ingress servers in the adapter for platform webhooks
- Storing plaintext secrets in fixtures committed to the repo

---

## Certification checklist

```bash
pnpm --filter @apzhub/integration-{vendor} test
pnpm certify:integration-sdk   # programme gate (SDK + reference providers)
```

Use harness helpers: `createAdapterHarness`, `assessAdapterCompliance`, `certifyAdapter`, `validateAdapterBoundary`.

---

## Compatibility

See [Compatibility Guide](../guides/APZHUB-Integration-SDK-Compatibility-Guide.md) for certified and future providers.
