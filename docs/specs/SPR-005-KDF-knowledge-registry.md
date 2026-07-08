# SPR-005 — Knowledge Registry Specification

> **Story:** DF-003  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Status:** Implemented — registration layer complete  
> **Authority:** [Registry Pattern](../architecture/APZHUB-Registry-Pattern.md) · [ADR-0028](../adr/ADR-0028-knowledge-source-model.md) · [ADR-0013](../adr/ADR-0013-registry-fail-fast-policy.md)

---

## Purpose

The **Knowledge Registry** manages registered **Knowledge Sources** and **Knowledge Providers**. It validates descriptors, detects duplicates, supports atomic batch registration, and exposes diagnostics and metadata.

The registry **must not** search, index, persist, execute queries, or invoke `provider.query()`.

---

## Responsibilities

| Responsibility          | Implementation                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Register sources        | `registerSource`, `registerManySources`, `registerManySourcesAtomic`                     |
| Register providers      | `registerProvider`, `registerManyProviders`, `registerManyProvidersAtomic`               |
| Validate descriptors    | `validateKnowledgeSource`, `validateKnowledgeProvider`                                   |
| Duplicate detection     | Throws `KnowledgeRegistryDuplicateError` on single register; atomic batch returns issues |
| Replace source metadata | `replaceSource`                                                                          |
| Registry metadata       | `getMetadata`, `listMetadata`, `getRegistryMetadata`                                     |
| Diagnostics             | `getDiagnostics`                                                                         |
| Bootstrap context       | `recordFrameworkVersion`, `recordManifestCapabilities`                                   |

---

## Interface

```typescript
interface KnowledgeRegistry {
  registerSource(source: KnowledgeSource): void;
  registerManySources(sources: readonly KnowledgeSource[]): void;
  registerManySourcesAtomic(
    sources: readonly KnowledgeSource[],
  ): KnowledgeBatchRegistrationResult;
  registerProvider(provider: KnowledgeProvider): void;
  registerManyProviders(providers: readonly KnowledgeProvider[]): void;
  registerManyProvidersAtomic(
    providers: readonly KnowledgeProvider[],
  ): KnowledgeBatchRegistrationResult;
  replaceSource(source: KnowledgeSource): void;
  getSource(sourceId: string): KnowledgeSource | undefined;
  getProvider(sourceId: string): KnowledgeProvider | undefined;
  getMetadata(sourceId: string): KnowledgeSourceMetadata | undefined;
  listSources(): readonly KnowledgeSource[];
  listProviders(): readonly KnowledgeProvider[];
  listMetadata(): readonly KnowledgeSourceMetadata[];
  getDiagnostics(): KnowledgeDiagnostics;
  getRegistryMetadata(): KnowledgeRegistryMetadata;
  recordFrameworkVersion(version: string): void;
  recordManifestCapabilities(capabilityIds: readonly string[]): void;
  clear(): void;
}
```

---

## Validation rules

| Field      | Rule                                                         |
| ---------- | ------------------------------------------------------------ |
| `id`       | Required; lowercase dot notation `/^[a-z][a-z0-9.-]*$/`      |
| `label`    | Required non-empty                                           |
| `kind`     | Valid `KnowledgeSourceKind` enum                             |
| `tier`     | Valid `T0`–`T4`                                              |
| `status`   | `active` · `planned` · `disabled`                            |
| `priority` | Finite number ≥ 0                                            |
| `provides` | Non-empty array of valid document kinds                      |
| `version`  | Optional; non-empty when present                             |
| Provider   | Must expose `query` function — **never invoked by registry** |

---

## Duplicate policy

| Operation                             | Behaviour                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `registerSource` / `registerProvider` | **Fail fast** — throws `KnowledgeRegistryDuplicateError`                          |
| `registerMany*`                       | Validates batch; throws on first duplicate conflict with existing registry        |
| `registerMany*Atomic`                 | **All or nothing** — returns `{ ok: false, errors }` without partial registration |

Aligned with Action Registry atomic batch pattern (AF-003).

---

## Immutability

Registered sources are deep-frozen via `freezeKnowledgeSource()`. Callers must not mutate objects after registration. Updates use `replaceSource()`.

---

## Implementations

| Class                          | Role                                      |
| ------------------------------ | ----------------------------------------- |
| `DefaultKnowledgeRegistry`     | Production in-memory registry (DF-003)    |
| `PlaceholderKnowledgeRegistry` | No-op scaffold for tests and early wiring |

Factory: `createDefaultKnowledgeRegistry()` · DI via `createKnowledgeDiscoveryContext()`.

---

## Prohibited behaviours

| Prohibited                   | Reason                                           |
| ---------------------------- | ------------------------------------------------ |
| Call `provider.query()`      | Query execution belongs to orchestrator (DF-006) |
| Persist to database          | Deferred M8+                                     |
| Build search index           | Index layer is future milestone                  |
| Duplicate Runtime registries | Sources consume registries — ADR-0028            |

---

## Story traceability

| Feature                                 | Story                  |
| --------------------------------------- | ---------------------- |
| Registry core                           | **DF-003** (this spec) |
| Manifest `knowledge.sources` extraction | DF-004 ✅              |
| Server DTO filter                       | DF-005                 |
| Query orchestration                     | DF-006                 |

---

_SPR-005 Knowledge Registry Specification — DF-003._
