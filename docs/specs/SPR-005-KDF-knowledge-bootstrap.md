# SPR-005 — Knowledge Registry Bootstrap Specification

> **Story:** DF-004 — Manifest-driven Knowledge Source registration  
> **Package:** `@apzhub/knowledge-discovery-framework/server`  
> **Status:** Implemented  
> **Authority:** [Knowledge Manifest spec](./SPR-005-KDF-knowledge-manifest.md) · [Registry spec](./SPR-005-KDF-knowledge-registry.md) · [Registry relationship](../architecture/knowledge-registry-relationship.md)

---

## Purpose

Define the **Knowledge Registry bootstrap** sequence: discover platform and manifest Knowledge Sources, register them atomically, and emit diagnostics. Bootstrap registers descriptors only — it does not execute providers, run queries, or persist state.

---

## Entry point

```typescript
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

const result = bootstrapKnowledgeRegistry({
  frameworkVersion: "0.5.0",
  capabilityRecords: capabilityIndex,
  activeOnly: true, // default
  registry: optionalExistingRegistry,
});
```

### Result shape

```typescript
interface BootstrapKnowledgeRegistryResult {
  readonly ok: boolean;
  readonly registry: KnowledgeRegistry;
  readonly diagnostics: KnowledgeRegistryBootstrapDiagnostics;
  readonly platform: RegisterPlatformKnowledgeSourcesResult;
  readonly capabilities: ManifestKnowledgePopulationResult;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}
```

---

## Bootstrap pipeline

```text
bootstrapKnowledgeRegistry()
        │
        ├─► registerPlatformKnowledgeSourceCatalogue()
        │         │
        │         └─► registerManySourcesAtomic(T0 built-ins)
        │                   platform.actions
        │                   platform.navigation
        │                   platform.capabilities
        │
        ├─► populateKnowledgeRegistryFromCapabilities()
        │         │
        │         ├─► extractKnowledgeSourcesFromCapabilities()
        │         │         scan capability manifests
        │         │         validate knowledge.sources
        │         │         detect duplicate ids
        │         │
        │         └─► registerManySourcesAtomic(extracted)
        │                   recordManifestCapabilities()
        │
        └─► buildKnowledgeRegistryBootstrapDiagnostics()
```

### Ordering guarantees

1. **Platform catalogue first** — built-in T0 references always attempted before manifest extraction.
2. **Fail-fast platform registration** — if catalogue registration fails, manifest extraction is skipped.
3. **Atomic manifest batch** — extraction or registration failure leaves manifest sources unregistered (platform catalogue may already be present).
4. **No provider execution** — bootstrap never calls `provider.query()`.

---

## Platform catalogue (T0)

Built-in sources reference existing Platform 2.0 registries without duplicating manifest definitions:

| Source id               | Label        | Provides                  |
| ----------------------- | ------------ | ------------------------- |
| `platform.actions`      | Actions      | `command`                 |
| `platform.navigation`   | Navigation   | `navigation`, `workspace` |
| `platform.capabilities` | Capabilities | `capability`              |

All catalogue entries use `kind: registry-projection`, `tier: T0`, `origin: builtin`.

---

## Capability input

Bootstrap accepts `capabilityRecords` from the caller (typically the Runtime capability index at a future integration point). DF-004 does **not** modify the Runtime orchestrator pipeline.

Each record supplies:

- `id` — capability identifier
- `version` — used when manifest omits `version`
- `lifecycleState` — filtered when `activeOnly` is true
- `manifest` — raw manifest object (may include `knowledge.sources`)

---

## Bootstrap diagnostics

```typescript
interface KnowledgeRegistryBootstrapDiagnostics {
  readonly status: "ready" | "empty" | "degraded" | "failed";
  readonly platformCatalogueRegistered: number;
  readonly manifestSourcesRegistered: number;
  readonly manifestCapabilitiesScanned: number;
  readonly registry: KnowledgeDiagnostics;
  readonly metadata: KnowledgeRegistryMetadata;
}
```

| Bootstrap `status` | Meaning                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `ready`            | Registry has sources; all active sources have providers             |
| `empty`            | No sources registered                                               |
| `degraded`         | Sources registered but some lack providers (expected until DF-007+) |
| `failed`           | Bootstrap error (validation, duplicate, catalogue failure)          |

Registry `scaffold` status maps to bootstrap `empty`.

---

## Failure modes

| Scenario                              | `ok`    | Registry state                                             |
| ------------------------------------- | ------- | ---------------------------------------------------------- |
| Platform catalogue registration fails | `false` | Unchanged or partial (atomic batch rolled back)            |
| Manifest validation fails             | `false` | Platform catalogue may be registered; manifest sources not |
| Duplicate manifest source id          | `false` | No manifest sources registered                             |
| Success                               | `true`  | Platform + manifest sources registered                     |

---

## Status constants

| Constant                               | Value         | Meaning                          |
| -------------------------------------- | ------------- | -------------------------------- |
| `KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS` | `"bootstrap"` | Package exposes bootstrap APIs   |
| `KNOWLEDGE_DISCOVERY_SERVER_STATUS`    | `"bootstrap"` | Server subpath exports bootstrap |

---

## Integration boundary (future)

DF-004 implements the bootstrap function; **Runtime wiring** is deferred:

```text
Runtime.bootstrap()          ← source of truth (unchanged in DF-004)
        │
        └─► capability index ──► bootstrapKnowledgeRegistry()   (DF-015 / ADR)
```

Callers may invoke `bootstrapKnowledgeRegistry()` directly in tests and future server integration without modifying the orchestrator pipeline.

---

## Tests

| Suite                                         | Coverage                                                 |
| --------------------------------------------- | -------------------------------------------------------- |
| `bootstrap-knowledge-registry.test.ts`        | End-to-end bootstrap, failure paths, metadata            |
| `register-platform-knowledge-sources.test.ts` | T0 catalogue atomic registration                         |
| `extract-knowledge-sources.test.ts`           | Extraction + `populateKnowledgeRegistryFromCapabilities` |

---

## Non-goals (DF-004)

- Server DTO permission filter (DF-005)
- Client hydration (DF-010)
- `apps/web` health endpoint wiring (DF-015)
- Provider implementations (DF-007, DF-008)

---

_SPR-005 Knowledge Registry Bootstrap Specification — DF-004._
