# SPR-005 — Knowledge Source Architecture

> **Story:** DF-001 — Knowledge Source Architecture  
> **Sprint:** SPR-005 — Knowledge & Discovery Framework  
> **Status:** Specification — **no implementation**  
> **Authority:** [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md) · [Registry Pattern](../architecture/APZHUB-Registry-Pattern.md)  
> **ADRs:** [0027](../adr/ADR-0027-knowledge-discovery-framework-package.md) · [0028](../adr/ADR-0028-knowledge-source-model.md) · [0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md)

---

## 1. Purpose

This specification defines the **Knowledge Source Architecture** — the model that identifies, classifies, and integrates every source of discoverable knowledge across APZHUB.

The Knowledge & Discovery Framework is broader than search. It provides a **unified knowledge layer** that eventually supports keyword search, fuzzy search, semantic search, AI-assisted discovery, usage signals, pins, recommendations, and cross-capability discovery — while consuming existing platform registries and routing selections through the existing Action Framework execution pipeline.

**DF-001 scope:** Architecture and taxonomy only. No search implementation. No indexing implementation. No production code.

---

## 2. Vision

Users discover **work** — not databases, applications, or backend products.

```text
User query / browse intent
        ↓
Knowledge Discovery Orchestrator
        ↓
Knowledge Sources (tiered, permission-filtered)
        ↓
Unified Knowledge Results
        ↓
Existing execution paths (Action execute · Workbench navigation)
```

Platform registries remain authoritative for platform metadata. Business systems remain authoritative for business records. The Knowledge & Discovery Framework **projects** knowledge from these sources — it does not replace them.

---

## 3. Knowledge Source specification

### 3.1 Definition

A **Knowledge Source** is a registered, permission-aware contributor that exposes discoverable **Knowledge Entities** to the Knowledge & Discovery Framework.

| Property       | Description                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Source id**  | Stable lowercase dot-notation identifier (e.g. `platform.actions`, `platform.navigation`) |
| **Label**      | Human-readable source name for grouped results                                            |
| **Tier**       | Lifecycle maturity and persistence model (see §4)                                         |
| **Kind**       | Integration mechanism (see §4.2)                                                          |
| **Priority**   | Orchestrator dispatch order (lower = earlier)                                             |
| **Permission** | Optional permission gate applied before source invocation                                 |
| **Status**     | `active` · `planned` · `disabled`                                                         |
| **Provides**   | Entity kinds this source can return (see §3.3)                                            |

### 3.2 Knowledge Entity

Every discoverable item normalises to a **Knowledge Entity**:

```typescript
interface KnowledgeEntity {
  readonly entityId: string; // globally unique within platform namespace
  readonly sourceId: string; // contributing Knowledge Source
  readonly kind: KnowledgeEntityKind; // taxonomy kind (§4.3)
  readonly title: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly category?: string;
  readonly icon?: string;
  readonly score?: number; // orchestrator-assigned rank
  readonly navigation?: KnowledgeNavigationTarget;
  readonly actionRef?: KnowledgeActionRef;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly permission?: string;
}

interface KnowledgeNavigationTarget {
  readonly type: "workbench-route" | "deep-link" | "panel";
  readonly target: string; // route id, URL path, or panel id
  readonly workspaceId?: string;
}

interface KnowledgeActionRef {
  readonly actionId: string; // Action Registry id — routes to execute()
  readonly handlerContext?: Readonly<Record<string, unknown>>;
}
```

**Rules:**

1. Every entity **must** declare either `navigation` or `actionRef` (or both when action opens navigation).
2. Entities **must not** embed executable handler logic — only references.
3. Entity ids **must** be stable across sessions for ranking, pins, and recency.
4. Permission filtering occurs **before** entity materialisation reaches the client.

### 3.3 Entity kinds (initial catalogue)

| Kind           | Description                                  | Primary source (planned)    |
| -------------- | -------------------------------------------- | --------------------------- |
| `command`      | Executable platform action                   | Action Registry             |
| `navigation`   | Workbench workspace or sidebar route         | Workbench Registry          |
| `capability`   | Module or platform service metadata          | Capability Registry         |
| `workspace`    | Activity bar workspace entry                 | Workbench Registry          |
| `preference`   | User preference or setting (future)          | Identity / Admin (M8)       |
| `notification` | Attention item (future)                      | Notification Framework (M6) |
| `activity`     | Activity stream entry (future)               | Activity Framework (M7)     |
| `document`     | Business document (future)                   | Business capabilities (M9)  |
| `project`      | Business project (future)                    | Business capabilities (M9)  |
| `person`       | Directory entry (future)                     | Identity (M8)               |
| `custom`       | Extension kind for manifest-declared sources | Manifest registration       |

SPR-005 foundation implements `command`, `navigation`, `workspace`, and `capability` projection from existing registries.

---

## 4. Knowledge Source taxonomy

### 4.1 Tier model

Knowledge Sources are classified by **tier** — indicating persistence, authority, and sprint ownership.

| Tier   | Name               | Authority                                           | Index model                         | Sprint           |
| ------ | ------------------ | --------------------------------------------------- | ----------------------------------- | ---------------- |
| **T0** | Platform Registry  | Existing registries (Action, Workbench, Capability) | Live projection — no separate index | SPR-005          |
| **T1** | Platform Metadata  | Platform data layer (Document 011)                  | Derived metadata index (deferred)   | M8               |
| **T2** | Session Signals    | Client session + future user prefs                  | Session-local store                 | SPR-005 scaffold |
| **T3** | Business Knowledge | Business modules + connectors                       | Event-driven async index            | M9               |
| **T4** | Semantic / AI      | Vector stores, AI providers                         | Embedding index + AI ranking        | Post-M5 stubs    |

```text
T0 Registry projection ──► immediate, authoritative, no duplication
T1 Platform metadata   ──► PostgreSQL FTS / platform index (deferred)
T2 Session signals     ──► recency, frequency, pins (scaffold in SPR-005)
T3 Business knowledge  ──► connector APIs + event index (M9+)
T4 Semantic / AI       ──► interfaces only in early SPR-005 stories
```

### 4.2 Source kinds (integration mechanism)

| Kind                  | Description                                        | Query model                    |
| --------------------- | -------------------------------------------------- | ------------------------------ |
| `registry-projection` | Reads snapshot from existing platform registry DTO | Synchronous scan at query time |
| `metadata-index`      | Queries platform-owned derived index               | Index lookup (deferred)        |
| `session-store`       | Reads/writes session-local usage signals           | In-memory client scope         |
| `connector-api`       | Delegates to Platform Service                      | Service call (M9+)             |
| `event-index`         | Queries async-maintained index                     | Index lookup (M9+)             |
| `semantic-index`      | Vector / embedding search                          | Stub in SPR-005                |
| `ai-provider`         | AI-assisted ranking or synthesis                   | Stub in SPR-005                |

### 4.3 Category alignment (Document 020)

Search categories from Document 020 map to entity kinds and tiers:

| Document 020 category               | Entity kinds              | Tier                  |
| ----------------------------------- | ------------------------- | --------------------- |
| Commands                            | `command`                 | T0                    |
| Settings / Navigation               | `navigation`, `workspace` | T0                    |
| Knowledge                           | `document`, `capability`  | T0 scaffold · T3 full |
| People                              | `person`                  | T1 / M8               |
| Notifications                       | `notification`            | M6                    |
| Activity                            | `activity`                | M7                    |
| Projects, Documents, Support, Tasks | business kinds            | M9                    |

---

## 5. Registry integration model

The Knowledge & Discovery Framework **consumes** existing registries. It does not duplicate registry storage or introduce a parallel registry bootstrap.

### 5.1 Integration pattern

```text
Runtime.bootstrap()
        ↓
Existing registries hydrate (Action · Workbench · Capability)
        ↓
Server permission filter → DTO snapshots
        ↓
Knowledge Source adapters (registry-projection kind)
        ↓
KnowledgeSourceRegistry (provider descriptors only)
        ↓
Client hydration → KnowledgeDiscoveryOrchestrator
        ↓
Shell surfaces (header search · overlay · palette integration)
```

### 5.2 Registry-to-source mapping

| Platform registry                             | Knowledge Source id     | Adapter                                                         | Duplicates registry?    |
| --------------------------------------------- | ----------------------- | --------------------------------------------------------------- | ----------------------- |
| Action Registry (`@apzhub/command-framework`) | `platform.actions`      | `ActionRegistryKnowledgeSource`                                 | **No** — reads snapshot |
| Workbench Navigation Registry                 | `platform.navigation`   | `WorkbenchNavigationKnowledgeSource`                            | **No**                  |
| Capability Registry                           | `platform.capabilities` | `CapabilityRegistryKnowledgeSource`                             | **No** — metadata only  |
| Shortcut Registry                             | —                       | Not a separate source; shortcuts surface via `command` entities | **No**                  |

### 5.3 KnowledgeSourceRegistry

Follows the [Registry Pattern](../architecture/APZHUB-Registry-Pattern.md):

| Aspect             | Implementation (planned DF-003+)                                           |
| ------------------ | -------------------------------------------------------------------------- |
| Package            | `@apzhub/knowledge-discovery-framework`                                    |
| Key                | `source.id`                                                                |
| Registration       | Server bootstrap + optional manifest declarations                          |
| Client hook        | `useKnowledgeDiscovery()` (planned DF-010)                                 |
| Execution consumer | **None** — orchestrator returns entities; shell routes to Action/Workbench |
| Server filter      | Permission adapter (mirror AF-005 pattern)                                 |

**Manifest extension (planned DF-004):**

```yaml
knowledge:
  sources:
    - id: example.custom
      label: Example Custom Source
      kind: registry-projection # or connector-api in M9+
      tier: T3
      permission: example.read
      priority: 100
      provides: [custom]
```

Manifest block name **`knowledge.sources`** is canonical. Early backlog references to `discovery.providers` are superseded by this field ([ADR-0028](../adr/ADR-0028-knowledge-source-model.md)).

### 5.4 DTO hydration

Mirror Action Framework and Workbench hydration:

```typescript
interface KnowledgeSourceRegistryDto {
  readonly version: 1;
  readonly sources: readonly KnowledgeSourceDescriptor[];
  readonly diagnostics: KnowledgeSourceDiagnostics;
}

interface KnowledgeSourceDescriptor {
  readonly id: string;
  readonly label: string;
  readonly kind: KnowledgeSourceKind;
  readonly tier: KnowledgeSourceTier;
  readonly priority: number;
  readonly permission?: string;
  readonly status: "active" | "planned" | "disabled";
  readonly provides: readonly KnowledgeEntityKind[];
}
```

Server: `filterKnowledgeSourceRegistryDto(dto, permissionAdapter)` — strips disallowed sources before client hydration (planned DF-005).

### 5.5 Anti-patterns

| Anti-pattern                                   | Why rejected                                        |
| ---------------------------------------------- | --------------------------------------------------- |
| Copy Action Registry into search index         | Duplication; permission drift                       |
| Knowledge Source executes actions              | Violates Registry Pattern; bypasses CommandExecutor |
| Client registers sources at runtime            | Violates server authority                           |
| New bootstrap pipeline in Runtime              | Platform 2.0 constraint — extend via adapters only  |
| Business logic in registry-projection adapters | Adapters map metadata only                          |

---

## 6. Indexing strategy

**DF-001 defines strategy only.** No index implementation in DF-001.

### 6.1 Indexing principles (Document 020 §13–14)

1. The platform search/knowledge index is **derived data** — never System of Record.
2. Index updates are **asynchronous** via platform events ([ADR-0007](../adr/ADR-0007-event-driven-communication.md)).
3. Permission changes **must** trigger re-index or filter refresh.
4. Backend search engines (PostgreSQL FTS, OpenSearch, Meilisearch, Qdrant) remain **replaceable** behind source adapters.

### 6.2 Indexing modes by tier

| Tier | Indexing mode                                                          | SPR-005 scope          |
| ---- | ---------------------------------------------------------------------- | ---------------------- |
| T0   | **No persistent index** — live registry projection at query time       | ✅ Foundation          |
| T2   | **Session-local index** — recency, frequency counters in client memory | ✅ Scaffold (DF-009)   |
| T1   | **Platform metadata index** — PostgreSQL FTS per Document 011          | ⏳ Deferred M8         |
| T3   | **Event-driven business index** — connector events → index workers     | ⏳ Deferred M9         |
| T4   | **Embedding index** — vector store for semantic search                 | ⏳ Interface stub only |

### 6.3 T0 registry projection (SPR-005 default)

For Action and Workbench sources:

```text
Query arrives
        ↓
Orchestrator invokes registry-projection source
        ↓
Source reads in-memory registry snapshot (already hydrated)
        ↓
Keyword / fuzzy match on title, keywords, label
        ↓
Returns KnowledgeEntity[] with actionRef / navigation
```

**No write path.** No background worker. No PostgreSQL table in SPR-005.

### 6.4 Future platform metadata index (T1 — documented, not implemented)

When implemented (M8+):

```text
Platform event (entity created | updated | permission changed)
        ↓
Index worker (async)
        ↓
Platform metadata index (PostgreSQL FTS initial engine)
        ↓
metadata-index Knowledge Source queries index
```

Index schema, migration, and worker implementation are **out of scope** for SPR-005.

### 6.5 Session signal store (T2 — scaffold)

`recordKnowledgeSelection(entityId)` maintains:

- Recency list (bounded FIFO)
- Frequency counters
- Future: pin set (interface stub)

Applied as **ranking boost** in orchestrator merge — not a searchable index.

---

## 7. Search strategy (overview)

**Overview only.** Implementation begins DF-006.

### 7.1 Query flow

```text
User input (header search · palette · overlay)
        ↓
KnowledgeDiscoveryOrchestrator.query({ text, context, permissions })
        ↓
For each active source (priority order):
    source.search(query) → KnowledgeEntity[]
        ↓
Merge · deduplicate by entityId
        ↓
Apply ranking boosts (recency · frequency · workspace context)
        ↓
Permission filter (authoritative — server already filtered sources; entity-level re-check)
        ↓
Return grouped results by sourceId / kind
```

### 7.2 Search modes (roadmap)

| Mode              | SPR-005           | Mechanism                                             |
| ----------------- | ----------------- | ----------------------------------------------------- |
| Keyword           | ✅ Foundation     | Substring match on title, keywords, label             |
| Fuzzy             | ✅ Foundation     | Normalised edit distance / token overlap              |
| Semantic          | ⏳ Stub           | `SemanticKnowledgeSource` interface — NOT_IMPLEMENTED |
| AI-assisted       | ⏳ Stub           | `AiKnowledgeSource` interface — NOT_IMPLEMENTED       |
| Recent / frequent | ✅ Scaffold       | T2 session signals boost ranking                      |
| Pinned            | ⏳ Stub           | Interface only                                        |
| Recommendations   | ⏳ Stub           | Interface only                                        |
| Cross-capability  | ✅ Provider model | Multiple sources in single query                      |

### 7.3 Deduplication

When the same logical item appears from multiple sources (e.g. command also navigates):

- Dedupe key: `entityId` (namespaced: `{sourceId}:{localId}`)
- Prefer higher `score`; tie-break by source `priority`

### 7.4 Palette integration (ADR decision)

Command Palette and header search **share** Action Registry knowledge via `platform.actions` source. Palette may optionally consume orchestrator results (DF-013). Single source of truth — no duplicate action lists in UI.

### 7.5 Performance targets (Document 020 §23)

- T0 queries: target < 50ms for registry sizes at Platform 2.0 scale
- Debounced client input: 150–300ms
- Incremental result rendering in overlay
- No connector calls in SPR-005 foundation path

---

## 8. AI extension points (documentation only)

No AI service integration in SPR-005. Extension interfaces are defined for future milestones.

### 8.1 SemanticKnowledgeSource

```typescript
interface SemanticKnowledgeSource {
  readonly id: string;
  readonly status: "planned" | "active";
  search(query: SemanticQuery): Promise<SemanticSearchResult>;
}

interface SemanticQuery {
  readonly text: string;
  readonly embedding?: readonly number[]; // optional pre-computed
  readonly limit?: number;
  readonly filters?: Readonly<Record<string, unknown>>;
}

interface SemanticSearchResult {
  readonly status: "ok" | "not_implemented" | "error";
  readonly entities: readonly KnowledgeEntity[];
  readonly diagnostics?: Readonly<Record<string, unknown>>;
}
```

**Default stub:** `{ status: "not_implemented", entities: [] }` — no throw.

### 8.2 AiKnowledgeSource

```typescript
interface AiKnowledgeSource {
  readonly id: string;
  readonly status: "planned" | "active";
  suggest(query: AiDiscoveryQuery): Promise<AiDiscoveryResult>;
  summarise?(entityId: string): Promise<AiSummaryResult>; // Document 020 §18 preview
}

interface AiDiscoveryQuery {
  readonly text: string;
  readonly context?: KnowledgeDiscoveryContext;
  readonly mode: "suggest" | "answer" | "relate";
}
```

**Constraints (Document 020 §22, Document 013):**

- AI consumes the same orchestrator and permission model — **no bypass**
- AI ranking is a **boost layer** — does not replace permission filter
- Self-hosted first — no proprietary hosted search/AI dependency required for platform operation

### 8.3 Ranking extension hook

```typescript
interface KnowledgeRankingHook {
  boost(entity: KnowledgeEntity, context: KnowledgeRankingContext): number;
}

interface KnowledgeRankingContext {
  readonly recentEntityIds: readonly string[];
  readonly frequencyMap: Readonly<Record<string, number>>;
  readonly pinnedEntityIds?: readonly string[];
  readonly activeWorkspaceId?: string;
  readonly userPreferences?: Readonly<Record<string, unknown>>; // Document 023 stub
}
```

Planned implementations: built-in recency/frequency (DF-009); AI hook stub (DF-014).

### 8.4 Orchestrator diagnostics

Every query records:

- Source invocation count and duration
- Entities returned per source
- Planned/disabled source skips
- Ranking boost applied

Exposed via health summary (optional `knowledge` field in `/api/health` — DF-015).

---

## 9. Execution routing (summary)

Selections from knowledge results **must not** introduce a new execution pipeline.

| Result type          | Route                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| `actionRef` present  | `useCommandRegistry().execute(actionId)` → existing CommandExecutor → Workbench bridge |
| `navigation` present | Workbench navigation API (existing request bus)                                        |
| Both present         | Action executes; navigation may follow per action handler                              |

See [ADR-0029](../adr/ADR-0029-knowledge-discovery-execution-routing.md).

---

## 10. Package boundary (summary)

| Owns                           | Does not own             |
| ------------------------------ | ------------------------ |
| KnowledgeSourceRegistry        | Action Registry storage  |
| KnowledgeDiscoveryOrchestrator | CommandExecutor          |
| Registry-projection adapters   | Workbench Manager        |
| Client hydration hooks         | Palette UI components    |
| Ranking scaffold               | PostgreSQL index workers |
| AI/Semantic interfaces (stubs) | Business entity storage  |

Package: `@apzhub/knowledge-discovery-framework` ([ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md)).

---

## 11. Story traceability

| Topic                            | Implementing story         |
| -------------------------------- | -------------------------- |
| Knowledge Source spec & taxonomy | **DF-001** (this document) |
| Package scaffold                 | DF-002                     |
| KnowledgeSourceRegistry          | DF-003                     |
| Manifest `knowledge.sources`     | DF-004                     |
| Server filter DTO                | DF-005                     |
| Orchestrator (keyword + fuzzy)   | DF-006                     |
| Action Registry source           | DF-007                     |
| Workbench navigation source      | DF-008                     |
| Ranking scaffold                 | DF-009                     |
| Client hydration                 | DF-010                     |
| Header search UI                 | DF-011                     |
| Discovery overlay                | DF-012                     |
| Palette integration              | DF-013                     |
| Semantic / AI stubs              | DF-014                     |
| Application integration          | DF-015                     |

---

## 12. Acceptance criteria (DF-001)

- [x] Knowledge Source specification defined
- [x] Knowledge Source taxonomy (tier + kind + entity kinds) defined
- [x] Registry integration model documented — no duplication
- [x] Indexing strategy documented — no implementation
- [x] Search strategy overview documented — no implementation
- [x] AI extension points documented — interfaces only
- [x] ADRs 0027–0029 authored
- [x] Sprint planning updated for Knowledge & Discovery Framework naming
- [ ] Owner review before DF-002

---

_SPR-005 Knowledge Source Architecture — DF-001 specification. Planning only._
