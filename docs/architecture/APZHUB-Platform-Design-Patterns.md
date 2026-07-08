# APZHUB Platform Design Patterns

> **Platform Version:** 3.0  
> **Status:** Authoritative pattern reference  
> **Authority:** [Platform Reference Architecture](./APZHUB-Platform-Reference-Architecture.md) · [Platform Governance](../governance/APZHUB-Platform-Governance.md)  
> **Scope:** All platform frameworks M2–M10

---

## Purpose

This document defines the **canonical design patterns** used across APZHUB platform frameworks. Every new framework (Knowledge & Discovery, Event & Notification, Activity, and future layers) **must** conform to these patterns unless an accepted ADR documents an exception.

Patterns are derived from implemented frameworks: Platform Runtime, Workbench, Action Framework, and Knowledge & Discovery Framework.

---

## Pattern index

| Pattern                                                   | Primary frameworks                                 |
| --------------------------------------------------------- | -------------------------------------------------- |
| [Registry Pattern](#registry-pattern)                     | Runtime, Workbench, Action, Knowledge              |
| [DTO Pattern](#dto-pattern)                               | Workbench, Action, Knowledge                       |
| [Hydration Pattern](#hydration-pattern)                   | Workbench, Action, Knowledge                       |
| [Provider Pattern](#provider-pattern)                     | Knowledge, Event & Notification (planned)          |
| [Service Pattern](#service-pattern)                       | Knowledge, Event & Notification (planned)          |
| [Presentation Layer Pattern](#presentation-layer-pattern) | Knowledge, Event & Notification (planned)          |
| [Experience Pattern](#experience-pattern)                 | Action surfaces, Knowledge, Notification (planned) |
| [Manifest Pattern](#manifest-pattern)                     | Runtime, all capability declarations               |
| [Bootstrap Pattern](#bootstrap-pattern)                   | Runtime, Action, Knowledge                         |
| [Health Pattern](#health-pattern)                         | Runtime, Action, Knowledge                         |
| [Diagnostics Pattern](#diagnostics-pattern)               | All platform packages                              |
| [Extension Pattern](#extension-pattern)                   | All platform frameworks                            |

---

## Registry Pattern

### Purpose

Maintain an authoritative in-memory index of platform metadata. Registries **register** — they do not **execute**.

### Responsibilities

- Accept normalised descriptors at bootstrap
- Validate identity, conflicts, and schema
- Expose read/query APIs and diagnostics
- Never perform user-facing execution

### Rules

- Server-side registration authority
- Atomic batch registration where required
- Conflict observability in diagnostics
- No client-side mutation after hydration
- Registration ≠ execution

### Example

```text
bootstrapKnowledgeRegistry({ capabilityRecords })
        ↓
registerActionRegistryKnowledgeProvider(registry, actionDto)
        ↓
registry.hasProvider("platform.actions") === true
```

**Frameworks:** Capability Registry (Runtime), Workbench Registry, ActionRegistry, Knowledge Registry.

### Future use

Event Registry, Notification Registry, Activity Registry (M6–M7).

---

## DTO Pattern

### Purpose

Serialise registry state into **versioned, permission-filtered** payloads for client hydration. DTOs are Knowledge Views / client boundaries — not authoritative registries.

### Responsibilities

- Map internal registry → transport shape
- Apply permission filter server-side
- Carry `schemaVersion` and framework version metadata
- Remain immutable after creation

### Rules

- Never send raw registry to client
- Filter before serialisation (ADR-0023 pattern)
- Validate at client boundary
- DTOs are read-only projections

### Example

```text
mapKnowledgeSourceRegistryDto(registry)
        ↓
filterKnowledgeSourceRegistryDto(dto, permissionAdapter)
        ↓
KnowledgeSourceRegistryDto → RSC props
```

**Frameworks:** WorkbenchRegistryDto, ActionRegistryDto, KnowledgeSourceRegistryDto.

### Future use

EventRegistryDto, NotificationRegistryDto (M6).

---

## Hydration Pattern

### Purpose

Reconstruct a **read-only client index** from server DTOs inside React providers (or equivalent client boundary).

### Responsibilities

- `create*RegistryFromDto(dto)` factory
- Provider composes registry + context
- Hook exposes typed read API
- Report synchronisation / hydration diagnostics

### Rules

- One-way server → client (delta sync deferred)
- Provider required for hooks
- Hydration failures surface as registry status, not silent empty state
- Parallel DTO loading in app layout where independent

### Example

```tsx
<KnowledgeDiscoveryProvider dto={knowledgeDto} service={knowledgeService}>
  <AppShell />
</KnowledgeDiscoveryProvider>;

const { sources, isReady } = useKnowledgeRegistry();
```

**Frameworks:** WorkbenchProvider, CommandRegistryProvider, KnowledgeDiscoveryProvider.

### Future use

EventNotificationProvider (M6).

---

## Provider Pattern

### Purpose

Adapt a registered source or upstream registry into framework-specific **query or delivery behaviour** without duplicating authoritative data.

### Responsibilities

- Implement narrow interface (`query()`, `deliver()`, etc.)
- Project references — not executable handlers
- Register against stable source id
- Return diagnostics-compatible results

### Rules

- Providers **consume** registries — never replace them
- No direct Action/Workbench engine calls from providers
- Permission boundaries enforced before provider invocation (via DTO filter)
- One provider per registered source (typical)

### Example

```text
ActionRegistryKnowledgeProvider
  projects ActionRegistryDto → KnowledgeDocument[] with actionRef
```

**Frameworks:** Knowledge Providers (M5).

### Future use

Event-to-notification mappers, activity projection providers (M6–M7).

---

## Service Pattern

### Purpose

Establish a **stable public client boundary** between Experience surfaces and internal orchestration/execution adapters.

### Responsibilities

- Wrap internal clients (query client, delivery client)
- Expose `query()` / `subscribe()` + `getDiagnostics()`
- Factory functions for app wiring
- React hook as public consumer API

### Rules

- Experiences use Service hook — not internal client or orchestrator
- Internal adapters swappable (in-process today, HTTP future)
- Service diagnostics feed health endpoint
- Deprecated hooks may wrap Service temporarily

### Example

```typescript
// Public
const { query, documents, serviceDiagnostics } = useKnowledgeService();

// Internal — not for Experiences
KnowledgeQueryClient → Orchestrator
```

**Frameworks:** Knowledge Service (M5).

### Future use

`useNotificationService()`, `useEventSubscription()` (M6).

---

## Presentation Layer Pattern

### Purpose

Reusable **presentation logic** between Service/query results and UI surfaces. Not a UI surface itself.

### Responsibilities

- Group, sort, map results to surface view models
- Delegate selection/action routing (no execution)
- Surface-specific diagnostics builders
- Shared across multiple Experiences

### Rules

- Lives in `@apzhub/workspace` (or future presentation package) — not in framework core
- No registry mutation
- No direct executor calls — delegation to injected handlers
- Experiences may share Presentation Layer without sharing UI components

### Example

```text
groupKnowledgeDocuments() → mapKnowledgeGroupsToPaletteItems()
        ↓
delegateKnowledgeOverlaySelection() → handlers.onSelectAction / onSelectNavigation
```

**Frameworks:** Knowledge Presentation Layer (M5).

### Future use

Notification grouping, attention priority mapping (M6).

---

## Experience Pattern

### Purpose

User-facing shell surfaces that consume Service + Presentation Layer and render UI.

### Responsibilities

- Compose hooks (`use*Service`, `use*Registry`)
- Map to design system components
- Inject selection/delivery handlers
- Emit surface diagnostics

### Rules

- Thin composition — logic in Service and Presentation Layer
- Enable flags on DesktopShell (`enableCommandPalette`, etc.)
- Follow Workbench Surface Pattern ([APZHUB-Workbench-Surface-Pattern.md](./APZHUB-Workbench-Surface-Pattern.md))
- Multiple Experiences per framework allowed

### Example

| Experience             | Framework                      | Consumes                   |
| ---------------------- | ------------------------------ | -------------------------- |
| Command Palette        | Action                         | `useCommandRegistry()`     |
| Palette knowledge mode | Knowledge                      | `useKnowledgeService()`    |
| Knowledge Overlay      | Knowledge                      | `useKnowledgeService()`    |
| Notification centre    | Event & Notification (planned) | `useNotificationService()` |

### Future use

Toast layer, notification drawer, activity feed (M6–M7).

---

## Manifest Pattern

### Purpose

Declare capability behaviour in **versioned YAML** discovered at Runtime bootstrap.

### Responsibilities

- Unified manifest envelope (ADR-0011)
- Kind-specific blocks (`workbench`, `knowledge`, `event`, …)
- Zod validation at Manifest Engine
- Extraction into registry records

### Rules

- Manifests are source of truth for registration
- Optional blocks only — backward compatible extensions
- Breaking schema changes require ADR + version bump
- Capabilities declare — platform bootstraps

### Example

```yaml
knowledge:
  sources:
    - id: platform.actions
      kind: registry-projection
      provides: [command]
```

**Frameworks:** All capabilities via Runtime.

### Future use

`event` / `notification` manifest blocks (M6).

---

## Bootstrap Pattern

### Purpose

Server-side atomic assembly of registries from Runtime + extracted manifest data.

### Responsibilities

- Run after `Runtime.bootstrap()` success
- Map capabilities → framework records
- Register providers and catalogue entries
- Produce bootstrap diagnostics

### Rules

- Fail-fast on invalid bootstrap (ADR-0013 where applicable)
- Idempotent within process lifetime
- App composition root orchestrates parallel bootstraps
- No bootstrap in client bundles for server-only packages

### Example

```text
ensurePlatformRuntimeReady()
        ↓
bootstrapKnowledgeRegistry({ capabilityRecords })
        ↓
register*Provider(registry, upstreamDto)
        ↓
map*RegistryDto + filter
```

**Frameworks:** Action bootstrap, Knowledge bootstrap.

### Future use

Event & Notification bootstrap (M6).

---

## Health Pattern

### Purpose

Expose framework hydration and readiness through **`/api/health`** and structured summary types.

### Responsibilities

- `load*HealthSummary()` server functions
- Map to `@apzhub/types` response shapes
- Allow-all adapter for unauthenticated visibility counts where appropriate
- Aggregate in `apps/web/app/api/health/route.ts`

### Rules

- Health reports hydration — not operational analytics dashboards
- Optional fields per framework (graceful degradation)
- Status: healthy | degraded | unhealthy
- No secrets in health responses

### Example

```json
{
  "knowledge": {
    "frameworkStatus": "service",
    "queryAvailable": true,
    "registeredCount": 4,
    "filteredCount": 3
  }
}
```

**Frameworks:** Runtime, commands, knowledge.

### Future use

`events`, `notifications` health fields (M6).

---

## Diagnostics Pattern

### Purpose

Structured observability for bootstrap, hydration, query lifecycle, and dev/test verification.

### Responsibilities

- `getDiagnostics()` on registries and services
- Client query lifecycle diagnostics
- Hidden dev-only DOM attributes in non-production (`data-testid`)
- E2E verification without production UI

### Rules

- Diagnostics never replace health endpoint for ops
- Production UI diagnostics hidden (`NODE_ENV === 'production'`)
- Stable `data-*` attributes for E2E where applicable
- Diagnostics are read-only

### Example

```html
<aside
  hidden
  data-testid="knowledge-discovery-diagnostics"
  data-query-available="true"
  ...
/>
```

**Frameworks:** All M2–M5 frameworks.

### Future use

Notification diagnostics, event subscription metrics (M6).

---

## Extension Pattern

### Purpose

Allow future capabilities without architectural redesign — scaffolds, registries, and gateway interfaces.

### Responsibilities

- Strategy/provider registries (e.g. RankingStrategyRegistry)
- Gateway stubs with `NOT_IMPLEMENTED` routing
- Composition root factories (`create*Context()`)
- Document deferred interfaces in specs

### Rules

- Scaffolds register but do not change default behaviour
- Extension points documented in architecture + ADR
- No breaking changes to public Service hooks
- New behaviour via new registrations — not forked pipelines

### Example

```text
RankingStrategyRegistry
  ├── KeywordRankingStrategy (active)
  ├── FuzzyRankingStrategy (active)
  └── SemanticRankingStrategy (scaffold)
```

**Frameworks:** Action gateways, Knowledge ranking scaffolds.

### Future use

Event handlers, notification channels, digest schedulers (M6).

---

## Applying patterns to new frameworks

When implementing Milestone 6 (Event & Notification Framework):

1. Define Event + Notification registries (Registry Pattern)
2. Map to DTOs with permission filter (DTO Pattern)
3. Hydrate client via provider (Hydration Pattern)
4. Map events → notifications via providers (Provider Pattern)
5. Expose `useNotificationService()` (Service Pattern)
6. Build presentation helpers in workspace (Presentation Layer Pattern)
7. Render notification centre / badges (Experience Pattern)
8. Declare `event` blocks in manifests (Manifest Pattern)
9. Bootstrap server-side after Runtime (Bootstrap Pattern)
10. Add health + dev diagnostics (Health + Diagnostics Patterns)
11. Register channel/delivery scaffolds (Extension Pattern)

**Constraint:** Modules publish events — they do not send notifications directly ([Document 021](../021-notification-activity-attention-management-framework.md)).

---

_APZHUB Platform Design Patterns — authoritative reference for Platform Version 3.0._
