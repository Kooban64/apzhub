# Knowledge & Discovery — Domain Model

> **Story:** DF-002  
> **Package:** `@apzhub/knowledge-discovery-framework`  
> **Authority:** [SPR-005-KDF-knowledge-sources.md](../specs/SPR-005-KDF-knowledge-sources.md) · [Three-layer model](./knowledge-discovery-three-layer-model.md)

---

## Terminology mapping

| DF-001 specification        | DF-002 domain type  | Notes                         |
| --------------------------- | ------------------- | ----------------------------- |
| Knowledge Entity            | `KnowledgeDocument` | User-facing discoverable item |
| Knowledge Source descriptor | `KnowledgeSource`   | Registry metadata             |
| Knowledge Source adapter    | `KnowledgeProvider` | Query participant             |
| KnowledgeSourceRegistry     | `KnowledgeRegistry` | Registration index            |

Story IDs and ADRs retain DF-001 naming in historical documents; code uses the domain model above.

---

## Type reference

### KnowledgeSource

Registered contributor descriptor.

| Field        | Type                              | Required                          |
| ------------ | --------------------------------- | --------------------------------- |
| `id`         | string                            | Yes — stable dot-notation id      |
| `label`      | string                            | Yes — grouped result label        |
| `kind`       | `KnowledgeSourceKind`             | Yes — integration mechanism       |
| `tier`       | `KnowledgeSourceTier`             | Yes — T0–T4                       |
| `priority`   | number                            | Yes — orchestrator dispatch order |
| `permission` | string                            | No — gate before invocation       |
| `status`     | `active` · `planned` · `disabled` | Yes                               |
| `provides`   | `KnowledgeDocumentKind[]`         | Yes                               |

### KnowledgeDocument

Normalised discoverable item. Must declare `actionRef` and/or `navigation` when materialised for user selection (enforced in DF-006+).

| Field                                                  | Type                                |
| ------------------------------------------------------ | ----------------------------------- |
| `documentId`                                           | Globally unique id                  |
| `sourceId`                                             | Contributing source                 |
| `kind`                                                 | Document kind                       |
| `title`                                                | Display title                       |
| `description`, `keywords`, `category`, `icon`, `score` | Optional presentation               |
| `navigation`                                           | Workbench route / deep link / panel |
| `actionRef`                                            | Action Registry id for `execute()`  |
| `metadata`, `permission`                               | Optional                            |

### KnowledgeQuery

| Field         | Type              |
| ------------- | ----------------- |
| `text`        | Query string      |
| `limit`       | Max results       |
| `filters`     | Extension filters |
| `workspaceId` | Workspace scope   |

Search orchestration is **not implemented** in DF-002.

### KnowledgeResult

| Field                   | Type                                         |
| ----------------------- | -------------------------------------------- |
| `status`                | `ok` · `empty` · `not_implemented` · `error` |
| `sourceId`              | Provider source id                           |
| `documents`             | Result items                                 |
| `message`, `durationMs` | Diagnostics                                  |

### KnowledgeProvider

```typescript
interface KnowledgeProvider {
  readonly source: KnowledgeSource;
  query(query: KnowledgeQuery, context: KnowledgeContext): Promise<KnowledgeResult>;
}
```

`ScaffoldKnowledgeProvider` (DF-002) returns `{ status: "not_implemented" }`.

### KnowledgeRegistry

Registration-only registry ([Registry Pattern](./APZHUB-Registry-Pattern.md)):

- `registerSource`, `registerProvider`
- `getSource`, `getProvider`, `listSources`, `listProviders`
- `getDiagnostics`, `clear`

Implementations: `DefaultKnowledgeRegistry`, `PlaceholderKnowledgeRegistry`.

### KnowledgeContext

Runtime query context — permissions, workspace, session signals (ranking hooks in DF-009).

### KnowledgeDiagnostics

| Field                     | Purpose                        |
| ------------------------- | ------------------------------ |
| `status`                  | `scaffold` · `ready` · `empty` |
| `registeredSourceCount`   | Source count                   |
| `registeredProviderCount` | Provider count                 |
| `duplicateSourceIds`      | Conflict observability         |
| `issues`                  | Structured duplicate messages  |

---

## Dependency injection

```typescript
interface KnowledgeDiscoveryContext {
  readonly status: KnowledgeDiscoveryFrameworkStatus;
  readonly registry: KnowledgeRegistry;
}

createKnowledgeDiscoveryContext(options?: { registry?: KnowledgeRegistry })
```

---

## Package exports

| Export path | Contents                                     |
| ----------- | -------------------------------------------- |
| `.`         | Full domain model + registry + DI            |
| `./server`  | Server composition root (bootstrap deferred) |
| `./react`   | React composition root (hooks deferred)      |

---

_Knowledge & Discovery Domain Model — DF-002._
