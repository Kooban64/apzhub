# Knowledge & Discovery Framework — Developer Onboarding

> **Audience:** Engineers adding Knowledge Providers, ranking strategies, or Knowledge Experiences  
> **Prerequisite:** [Getting started](./getting-started.md) · [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)  
> **Architecture:** [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md)

---

## What you need to understand

The Knowledge & Discovery Framework answers four questions:

1. **What can be discovered?** — Knowledge Sources registered at server bootstrap
2. **Which sources can this user query?** — `filterKnowledgeSourceRegistryDto()` with `WorkbenchPermissionAdapter`
3. **How are queries executed?** — Orchestrator dispatches to providers → merge → rank → `KnowledgeService`
4. **How do users act on results?** — Presentation Layer delegates to Action `execute()` or Workbench navigation

Knowledge Experiences are **read-only consumers** of `useKnowledgeService()`. They must not import the orchestrator or `KnowledgeQueryClient`.

---

## Canonical mental model

```text
Knowledge Sources
        ↓
Knowledge Registry
        ↓
Knowledge Query API (internal)
        ↓
Knowledge Service ← useKnowledgeService() [public]
        ↓
Knowledge Presentation Layer
        ↓
Knowledge Experiences
        ↓
Action execute() · Workbench navigation
```

---

## Task 1 — Understand the framework

Read in order:

1. [Document 020](../020-unified-search-knowledge-discovery-framework.md) — product vision
2. [knowledge-discovery-framework.md](../architecture/knowledge-discovery-framework.md) — architecture
3. [knowledge-views-model.md](../architecture/knowledge-views-model.md) — layering terminology
4. [packages/knowledge-discovery-framework/README.md](../../packages/knowledge-discovery-framework/README.md) — package API
5. [SPR-005 spec index](../specs/SPR-005-spec-index.md) — story specifications

Run the platform locally and verify:

```bash
pnpm dev
# Sign in → /workspace/home
# Inspect dev diagnostics:
#   data-testid="knowledge-discovery-diagnostics"
curl -s localhost:3300/api/health | jq .knowledge
# E2E palette knowledge mode (test hook):
#   /workspace/home?paletteMode=knowledge → Ctrl+Shift+P → search "theme"
```

---

## Task 2 — Add a Knowledge Provider

**When to use:** A new Knowledge Source needs a query adapter (e.g. projecting a new registry DTO into documents).

### Steps

1. **Define the source** — add to platform catalogue or manifest `knowledge.sources` (see Capability guide).
2. **Implement `KnowledgeProvider`** in `packages/knowledge-discovery-framework/src/provider/<name>/`:

```typescript
export function createMyKnowledgeProvider(deps: MyDeps): KnowledgeProvider {
  return {
    async query(input) {
      // Return KnowledgeResult with KnowledgeDocument[] references
      // Use actionRef or navigation — do not execute
    },
  };
}
```

3. **Register at bootstrap** — call register helper after `bootstrapKnowledgeRegistry()` (see `registerActionRegistryKnowledgeProvider` pattern).
4. **Map documents** — normalise to `KnowledgeDocument` with stable `documentId`.
5. **Add unit tests** — provider query, empty input, permission boundaries, diagnostics.
6. **Update spec** — add provider section to relevant SPR-005 spec if public contract changes.

**Do not:**

- Duplicate Action or Navigation definitions in provider output
- Call `execute()` or Workbench engines from provider code
- Expose provider directly to Experience surfaces

---

## Task 3 — Register a Knowledge Source

### Platform builtin (T0)

Add entry to `platform-knowledge-source-catalogue.ts` and register via `registerPlatformKnowledgeSources()`.

### Manifest capability

Declare in capability YAML:

```yaml
knowledge:
  sources:
    - id: my-capability.docs
      label: Documentation
      kind: registry-projection
      tier: T2
      provides: [content]
      status: active
```

Extraction runs at `bootstrapKnowledgeRegistry({ capabilityRecords })`. Wire a matching provider before queries succeed.

### Server → client path

```text
bootstrapKnowledgeRegistry()
        ↓
mapKnowledgeSourceRegistryDto()
        ↓
filterKnowledgeSourceRegistryDto(dto, permissionAdapter)
        ↓
KnowledgeDiscoveryProvider(dto, service)
```

---

## Task 4 — Expose through the Knowledge Service

Experiences and apps consume the **Knowledge Service** — not the orchestrator.

### Server/app wiring

```typescript
import { createKnowledgeServiceFromHydration } from "@apzhub/knowledge-discovery-framework";

const service = createKnowledgeServiceFromHydration({
  knowledgeDto: filteredDto,
  actionDto,
  workbenchDto,
});
```

Reference: `apps/web/lib/use-app-knowledge-service.ts`.

### React

```typescript
<KnowledgeDiscoveryProvider dto={knowledgeDto} service={knowledgeService}>
  <ExperienceSurface />
</KnowledgeDiscoveryProvider>

const { query, documents, status, serviceDiagnostics } = useKnowledgeService();
await query({ text: "search term" });
```

**Deprecated:** `useKnowledgeQuery()`, direct `KnowledgeQueryClient`, `queryClient` provider prop.

---

## Task 5 — Create a Knowledge Experience

**When to use:** New user-facing discovery surface (search bar, help panel, recommendations strip).

### Pattern

1. Consume `useKnowledgeService()` for query lifecycle and documents.
2. Consume `useKnowledgeRegistry()` for source labels if grouping.
3. Reuse **Knowledge Presentation Layer** helpers from `@apzhub/workspace`:
   - `groupKnowledgeDocuments()`
   - `delegateKnowledgeOverlaySelection()` or `createWorkbenchKnowledgeSelectionHandlers()`
4. Render UI in workspace or app — do not add execution logic to the Experience.
5. Wire selection handlers to Action Framework and Workbench (see `useWorkbenchKnowledgeSelectionHandlers()`).

### Reference implementations

| Experience                     | File                                                                        |
| ------------------------------ | --------------------------------------------------------------------------- |
| Knowledge Overlay              | `packages/workspace/src/knowledge-overlay/knowledge-overlay-experience.tsx` |
| Command Palette knowledge mode | `packages/workspace/src/command-palette/workbench-command-palette.tsx`      |

### DesktopShell integration

```typescript
<DesktopShell
  enableCommandPalette
  commandPaletteMode="knowledge"  // or "commands" (default)
/>
```

Requires `KnowledgeDiscoveryProvider`, `CommandRegistryProvider`, and `WorkbenchProvider` ancestors.

---

## Task 6 — Add a Ranking Strategy (optional)

**When to use:** New ordering behaviour post-merge (e.g. recency when session data available).

1. Implement `RankingStrategy` interface in `packages/knowledge-discovery-framework/src/ranking/`.
2. Register in `RankingStrategyRegistry` via `createKnowledgeDiscoveryContext()`.
3. Add unit tests — strategy in isolation + engine integration.
4. Do **not** modify `DefaultRankingEngine` merge contract unless ADR approved.

Scaffold examples: `SemanticRankingStrategy`, `RecencyRankingStrategy` (DF-014).

---

## Testing expectations

| Change type         | Required tests                               |
| ------------------- | -------------------------------------------- |
| Provider            | Unit — query, empty, errors, document shape  |
| Registry/bootstrap  | Unit — registration, validation, diagnostics |
| Knowledge Service   | Unit — query delegation, diagnostics         |
| React hook          | Component — lifecycle, provider guard        |
| Presentation helper | Unit — grouping, delegation, edge cases      |
| App wiring          | Integration — hydration, health summary      |
| Experience / shell  | Component + E2E when user-visible            |

Quality gates (all PRs):

```bash
pnpm lint && pnpm typecheck && pnpm build
pnpm test && pnpm test:coverage
pnpm test:e2e   # when UI or app wiring affected
```

E2E reference: `testing/playwright/e2e/spr-005-knowledge-discovery-framework.spec.ts`.

---

## Documentation standards

| Change           | Documentation action                                       |
| ---------------- | ---------------------------------------------------------- |
| New public API   | Update package README + architecture doc                   |
| New provider     | Update provider spec or knowledge-sources spec             |
| New Experience   | Update knowledge-views-model + relevant surface spec       |
| Behaviour change | ADR if architectural; completion report for sprint stories |
| Terminology      | Use canonical stack — see below                            |

### Canonical terminology

Use consistently:

```text
Knowledge Sources → Knowledge Registry → Knowledge Query API
→ Knowledge Presentation Layer → Knowledge Experiences
```

| Avoid                           | Use instead                  |
| ------------------------------- | ---------------------------- |
| Discovery provider (legacy)     | Knowledge Provider           |
| Overlay primitives              | Knowledge Presentation Layer |
| `useKnowledgeQuery()` (primary) | `useKnowledgeService()`      |
| Direct orchestrator in UI       | Knowledge Service            |

---

## Governance cross-references

| Guide                                                                                | KDF section                     |
| ------------------------------------------------------------------------------------ | ------------------------------- |
| [Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)                 | Package map, testing, doc index |
| [Capability Development Guide](../governance/APZHUB-Capability-Development-Guide.md) | Manifest `knowledge.sources`    |
| [Runtime Development Guide](../governance/APZHUB-Runtime-Development-Guide.md)       | Bootstrap, health endpoint      |
| [Workbench Development Guide](../governance/APZHUB-Workbench-Development-Guide.md)   | Knowledge Experiences in shell  |

---

## Checklist — new Knowledge Provider

- [ ] Source registered (catalogue or manifest)
- [ ] Provider implements `query()` returning references only
- [ ] Registered at bootstrap alongside existing providers
- [ ] Unit tests pass
- [ ] Permission filtering respected via DTO boundary
- [ ] No Experience → orchestrator dependency introduced
- [ ] Documentation updated

---

_Knowledge & Discovery Framework Developer Onboarding — SPR-005._
