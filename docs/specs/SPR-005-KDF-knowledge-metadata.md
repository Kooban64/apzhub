# SPR-005 — Knowledge Registry Metadata Specification

> **Story:** DF-003  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Authority:** [Knowledge Registry Spec](./SPR-005-KDF-knowledge-registry.md) · [Domain Model](../architecture/knowledge-discovery-domain-model.md)

---

## Purpose

Each registered Knowledge Source exposes **registry metadata** for observability, health reporting, and future server DTO hydration (DF-005). Metadata is computed at registration time from source descriptors and provider presence — **not** from query results.

---

## Per-source metadata — `KnowledgeSourceMetadata`

| Field                  | Type                              | Description                                                 |
| ---------------------- | --------------------------------- | ----------------------------------------------------------- |
| `sourceId`             | string                            | Stable knowledge source identifier                          |
| `providerRegistered`   | boolean                           | Whether a `KnowledgeProvider` is registered for this source |
| `providerId`           | string?                           | Provider id when registered (equals `sourceId`)             |
| `version`              | string?                           | Declared source version from descriptor                     |
| `declaredCapabilities` | `KnowledgeDocumentKind[]`         | Document kinds the source may project (`provides`)          |
| `healthStatus`         | `KnowledgeSourceHealthStatus`     | Derived health classification                               |
| `diagnostics`          | `KnowledgeSourceEntryDiagnostics` | Per-source diagnostic detail                                |

### Health status derivation

| Condition                              | `healthStatus` |
| -------------------------------------- | -------------- |
| `status: disabled`                     | `disabled`     |
| `status: planned`                      | `planned`      |
| `status: active` + provider registered | `healthy`      |
| `status: active` + no provider         | `degraded`     |
| Other                                  | `unknown`      |

Health reflects **registration completeness** — not runtime query success.

### Per-source diagnostics — `KnowledgeSourceEntryDiagnostics`

| Field                  | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `providerRegistered`   | Mirrors top-level flag                                      |
| `validationIssueCount` | Count of validation issues (0 after successful register)    |
| `message`              | Optional human-readable note (e.g. source without provider) |

---

## Registry metadata — `KnowledgeRegistryMetadata`

Aggregate metadata returned by `getRegistryMetadata()`:

| Field                     | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `frameworkVersion`        | Knowledge & Discovery Framework version recorded at bootstrap |
| `manifestCapabilityCount` | Count of manifest capabilities contributing sources           |
| `manifestCapabilities`    | Sorted capability ids (when recorded)                         |
| `sourceMetadata`          | Ordered list of per-source metadata                           |

---

## Registry diagnostics — `KnowledgeDiagnostics`

Aggregate diagnostics returned by `getDiagnostics()`:

| Field                     | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| `status`                  | `empty` · `ready` · `degraded` · `scaffold` (placeholder only)  |
| `registeredSourceCount`   | Total registered sources                                        |
| `registeredProviderCount` | Total registered providers                                      |
| `sourceIds`               | Sorted registered source ids                                    |
| `validationIssueCount`    | Reserved for bootstrap validation (0 after successful register) |
| `healthSummary`           | Counts by `healthStatus`                                        |
| `duplicateSourceIds`      | Reserved — duplicates fail fast on register                     |
| `issues`                  | Structured registration issues                                  |
| `frameworkVersion`        | Framework version from bootstrap                                |
| `manifestCapabilityCount` | Manifest capability count                                       |
| `message`                 | Optional summary (e.g. degraded sources)                        |

### Health summary

```typescript
interface KnowledgeHealthSummary {
  healthy: number;
  degraded: number;
  planned: number;
  disabled: number;
  unknown: number;
}
```

---

## API access

```typescript
const registry = createDefaultKnowledgeRegistry();
registry.registerSource(source);

registry.getMetadata("platform.actions");
registry.listMetadata();
registry.getRegistryMetadata();
registry.getDiagnostics();
```

---

## Future server DTO (DF-005)

Server filter will produce serialisable DTO from registry metadata and permission adapter — client receives read-only hydration snapshot. Metadata shape defined here is authoritative for DTO mapping.

---

_SPR-005 Knowledge Registry Metadata Specification — DF-003._
