# SPR-005 — Knowledge Manifest Specification (`knowledge.sources`)

> **Story:** DF-004 — Manifest-driven Knowledge Source registration  
> **Package:** `@apzhub/platform-runtime` (schema) · `@apzhub/knowledge-discovery-framework` (extraction)  
> **Status:** Implemented  
> **Authority:** [ADR-0028](../adr/ADR-0028-knowledge-source-model.md) · [Knowledge Source Architecture](./SPR-005-KDF-knowledge-sources.md) · [Registry relationship](../architecture/knowledge-registry-relationship.md)

---

## Purpose

Capability manifests may declare **Knowledge Sources** under the canonical block **`knowledge.sources`**. The Manifest Engine validates these declarations; the Knowledge & Discovery Framework extracts them at bootstrap and registers references in the Knowledge Registry.

Knowledge Sources **consume** platform manifests. They do not duplicate Action, Navigation, Capability, or other manifest definitions. The Runtime remains the source of truth.

**DF-004 scope:** Schema, validation, extraction, and atomic registration only. No indexing, search, persistence, provider execution, or orchestration.

---

## Manifest block

### Envelope

```yaml
knowledge:
  sources:
    - id: example.module.search
      label: Example Search
      kind: registry-projection
      tier: T0
      priority: 50
      status: active # optional — defaults to active
      permission: example.read # optional
      version: "1.0.0" # optional — falls back to capability version
      provides:
        - custom
```

### Field reference

| Field        | Required | Type    | Rules                                                 |
| ------------ | -------- | ------- | ----------------------------------------------------- |
| `id`         | Yes      | string  | Lowercase dot notation: `^[a-z][a-z0-9.-]*$`          |
| `label`      | Yes      | string  | Non-empty human-readable name                         |
| `kind`       | Yes      | enum    | See §3                                                |
| `tier`       | Yes      | enum    | `T0` · `T1` · `T2` · `T3` · `T4`                      |
| `priority`   | Yes      | integer | `≥ 0` — orchestrator dispatch order (lower = earlier) |
| `status`     | No       | enum    | `active` · `planned` · `disabled` (default: `active`) |
| `permission` | No       | string  | Permission gate applied before source invocation      |
| `version`    | No       | string  | Descriptor version; defaults to capability `version`  |
| `provides`   | Yes      | array   | Non-empty list of document kinds (see §4)             |

### Strict schema

Unknown keys are rejected (`.strict()` Zod schema). The block is optional on all manifest envelope types that spread `optionalKnowledgeFields`.

---

## Source kinds (`kind`)

| Value                 | Description                                 |
| --------------------- | ------------------------------------------- |
| `registry-projection` | Projects from an existing platform registry |
| `metadata-index`      | Capability or module metadata index         |
| `session-store`       | Session-scoped knowledge (recency, pins)    |
| `connector-api`       | External system connector                   |
| `event-index`         | Event stream index                          |
| `semantic-index`      | Semantic / vector index (future)            |
| `ai-provider`         | AI-assisted discovery provider (future)     |

---

## Document kinds (`provides`)

| Value          | Typical source       |
| -------------- | -------------------- |
| `command`      | Action Registry      |
| `navigation`   | Workbench navigation |
| `capability`   | Capability metadata  |
| `workspace`    | Workbench workspace  |
| `preference`   | User preferences     |
| `notification` | Notifications        |
| `activity`     | Activity feed        |
| `document`     | Document store       |
| `project`      | Project entities     |
| `person`       | People / directory   |
| `custom`       | Extension kind       |

---

## Platform-runtime implementation

| Export                            | Module                              | Role                                                               |
| --------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `knowledgeSourceManifestSchema`   | `manifest-engine/schemas/knowledge` | Per-entry validation                                               |
| `knowledgeBlockSchema`            | same                                | `knowledge.sources` block                                          |
| `optionalKnowledgeFields`         | same                                | Spread into component, module, service, integration, event schemas |
| `collectKnowledgeSourceManifests` | same                                | Returns `sources` array (empty when absent)                        |
| `hasKnowledgeSources`             | same                                | Type guard for manifests with non-empty sources                    |

Manifest envelopes that include `optionalKnowledgeFields`:

- Component
- Module
- Service
- Integration
- Event

---

## Extraction rules

Extraction is implemented in `@apzhub/knowledge-discovery-framework`:

| Rule                     | Behaviour                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| Active capabilities only | Default `activeOnly: true` — skips `lifecycleState` not in `active` / `healthy` |
| Atomic extraction        | Any validation or duplicate-id error yields **zero** extracted sources          |
| Duplicate ids            | Same `id` across two capabilities → `DUPLICATE_ID` issue                        |
| Invalid entry            | Zod validation → `VALIDATION` issue with field path                             |
| Mapping                  | `origin: "manifest"`, `capabilityId` set from hosting capability                |
| Registration             | `registerManySourcesAtomic()` — all-or-nothing                                  |

### Extraction API

```typescript
extractKnowledgeSourcesFromCapabilities(
  records: readonly KnowledgeCapabilityRecord[],
  options?: { activeOnly?: boolean },
): KnowledgeSourceExtractionResult;

populateKnowledgeRegistryFromCapabilities(
  registry: KnowledgeRegistry,
  records: readonly KnowledgeCapabilityRecord[],
  options?: { activeOnly?: boolean },
): ManifestKnowledgePopulationResult;
```

`KnowledgeCapabilityRecord` is a minimal bootstrap input:

```typescript
interface KnowledgeCapabilityRecord {
  readonly id: string;
  readonly version: string;
  readonly lifecycleState: string;
  readonly manifest: unknown;
}
```

---

## Validation errors

| Code           | When                                               |
| -------------- | -------------------------------------------------- |
| `VALIDATION`   | Manifest entry fails Zod schema                    |
| `DUPLICATE_ID` | Same source `id` declared by multiple capabilities |

Errors include `capabilityId`, optional `sourceId`, optional `field`, and `message`.

---

## Non-goals (DF-004)

| Out of scope                 | Deferred to  |
| ---------------------------- | ------------ |
| Provider implementation      | DF-007+      |
| Runtime orchestrator changes | ADR required |
| `apps/web` wiring            | DF-015       |
| Server DTO filter            | DF-005       |
| Query orchestration          | DF-006       |

---

## Tests

| Suite                     | Location                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Manifest schema           | `packages/platform-runtime/src/manifest-engine/knowledge-manifest.test.ts`                |
| Extraction + registration | `packages/knowledge-discovery-framework/src/extraction/extract-knowledge-sources.test.ts` |
| Bootstrap integration     | `packages/knowledge-discovery-framework/src/server/bootstrap-knowledge-registry.test.ts`  |

---

_SPR-005 Knowledge Manifest Specification — DF-004._
