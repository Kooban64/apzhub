# APZHUB — Testing Health & Readiness Guide

**Milestone:** APZTCMS-011  
**Source:** `packages/platform-services/src/services/testing/testing-readiness.ts`  
**Status:** Honest capability reporting — no false "ready" for unwired features

---

## Readiness indicators

`createTestingReadinessIndicators` returns:

```typescript
interface TestingReadinessIndicators {
  readonly enabled: boolean;
  readonly persistence: "provided" | "postgres" | "in-memory-test";
  readonly domain: "provided" | "created";
  readonly binaryEvidenceStorage: "out-of-scope";
  readonly eventBus: "not-wired";
  readonly httpRoutes: "not-wired";
  readonly generatedAt: string;
}
```

Available on `TestingPlatformServicesBundle.readiness` after factory creation.

---

## Field semantics

| Field                   | APZTCMS-011 value                                                          | Meaning                                       |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `enabled`               | `true` when bundle created                                                 | Testing platform services constructed         |
| `persistence`           | `postgres` (production factory) or `in-memory-test` (explicit test opt-in) | Which persistence backend backs domain        |
| `domain`                | `created` or `provided`                                                    | Whether factory built domain from persistence |
| `binaryEvidenceStorage` | always `"out-of-scope"`                                                    | No S3/MinIO/Azure wiring                      |
| `eventBus`              | always `"not-wired"`                                                       | No event publish/subscribe                    |
| `httpRoutes`            | always `"not-wired"`                                                       | No `/api/v1/testing-*` handlers               |

---

## Gateway-level health

`services/testing/service.yaml` declares `health.enabled: true` at manifest level. Runtime health for APZTCMS-011 is **structural**:

1. **`TESTING_SERVICE_ENABLED=true`** at app bootstrap
2. Testing bundle passed to `createPlatformServices`
3. Postgres connectivity for production factory
4. `gateway.testing.*` responds without `PROVIDER_CAPABILITY_UNSUPPORTED`

Future APZTCMS-012 may add `/api/v1/health` sub-checks for testing dependency chain.

---

## Production readiness checklist

| Check                        | APZTCMS-011              |
| ---------------------------- | ------------------------ |
| Platform contracts **0.8.0** | ✅                       |
| Platform services **0.8.0**  | ✅                       |
| Domain packages unchanged    | ✅ 0.6.0 / 0.7.0 / 0.5.0 |
| Postgres persistence factory | ✅                       |
| Pipeline + authz map         | ✅                       |
| HTTP API                     | ❌ APZTCMS-012           |
| Workbench live client        | ❌ mock unchanged        |
| Event Bus                    | ❌                       |
| Binary evidence              | ❌                       |
| AI assist                    | ❌ deferred              |

---

## Administration workspace (future)

When Administration Workspace surfaces module health (014), testing should report:

- Persistence mode
- Unwired capabilities (`httpRoutes`, `eventBus`, `binaryEvidenceStorage`)
- Last readiness timestamp (`generatedAt`)

Do not report "healthy" for HTTP or Event Bus until wired.

---

## Related

- [Testing Bootstrap Configuration Guide](./APZHUB-Testing-Bootstrap-Configuration-Guide.md)
- [Testing Platform Service Architecture](./APZHUB-Testing-Platform-Service-Architecture.md)
- [APZTCMS-011 Completion Report](../sprint/APZTCMS-011-completion-report.md)
