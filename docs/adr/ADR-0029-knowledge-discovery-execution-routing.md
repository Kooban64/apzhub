# ADR-0029 — Knowledge Discovery Execution Routing

> **Status:** Accepted  
> **Date:** 2026-06-28  
> **Sprint:** SPR-005 — DF-001  
> **Decided by:** Project owner (Sprint 005 authorisation)  
> **Related:** [ADR-0026](./ADR-0026-command-execution-model.md) · [ADR-0027](./ADR-0027-knowledge-discovery-framework-package.md) · [Document 019](../019-universal-command-palette-action-framework.md) · [Document 020](../020-unified-search-knowledge-discovery-framework.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)

## Problem

The Knowledge & Discovery Framework presents unified results from multiple sources. Without explicit routing rules, implementers may introduce a parallel execution path — direct handler invocation from search results, bypassing CommandExecutor permission gates and audit hooks established in Platform 2.0.

Platform 2.0 baseline constraint: **no new execution pipeline**.

## Decision

### Routing rules

Knowledge result selection **must** route through existing Platform 2.0 execution paths:

| Entity field                      | Route                                                 | Consumer                                                                           |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `actionRef.actionId`              | `CommandRegistry.execute(actionId, context)`          | `DefaultActionExecutor` → `WorkbenchCommandBridge` → Workbench Request Bus         |
| `navigation` (workbench-route)    | Workbench navigation API                              | Existing request transport ([ADR-0020](./ADR-0020-workbench-request-transport.md)) |
| `navigation` (deep-link)          | App router / Workbench deep link handler              | Permission re-validation on open (Document 020 §19)                                |
| Both `actionRef` and `navigation` | Action executes first; navigation follows per handler | No shortcut around executor                                                        |

### Prohibited patterns

| Pattern                                   | Reason                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Knowledge Source invokes handler directly | Bypasses CommandExecutor and permission model                                                                   |
| Overlay calls Workbench Manager internals | Violates API layering                                                                                           |
| New `KnowledgeExecutor` dispatch layer    | Parallel pipeline — rejected                                                                                    |
| Client-side permission-only filtering     | Server must filter before hydration ([Document 020 §11](./020-unified-search-knowledge-discovery-framework.md)) |
| Semantic/AI source executes actions       | AI consumes orchestrator results; routes through same paths                                                     |

### Orchestrator boundary

`KnowledgeDiscoveryOrchestrator`:

- **May:** query sources, merge entities, apply ranking, return DTO results
- **Must not:** execute actions, mutate registries, call connectors, emit audit events (deferred Event Bus)

### Palette and header search interaction

| Surface                        | Query                                            | Execution                                  |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------ |
| Command Palette (Ctrl+Shift+P) | May use orchestrator or Action Registry list API | Existing palette execute path              |
| Header search                  | Orchestrator query                               | Overlay selection → routes per table above |
| Discovery overlay              | Orchestrator query                               | Same routing as header search              |

Single source of truth for commands: Action Registry via `platform.actions` knowledge source (DF-007). Palette does not maintain a duplicate action index (DF-013).

### AI and semantic extension routing

When T4 sources are implemented:

1. Semantic/AI sources return `KnowledgeEntity[]` only — same shape as T0 sources.
2. AI summarisation/preview (Document 020 §18) fetches content via Platform Services — not direct connector calls from UI.
3. AI **must not** bypass permission filtering ([Document 013](../013-security-architecture-zero-trust-framework.md)).

SPR-005 stubs return `{ status: "not_implemented" }` — orchestrator skips or reports in diagnostics.

### Session signal hooks

`recordKnowledgeSelection(entityId)` (DF-009):

- Updates T2 session store only
- **Does not** execute entity
- Called **after** successful selection routing

## Alternatives

| Alternative                                       | Why rejected                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| KnowledgeExecutor parallel to CommandExecutor     | Two execution authorities; audit gap                                        |
| Direct bridge invocation from overlay             | Skips actor attribution ([ADR-0026](./ADR-0026-command-execution-model.md)) |
| Merge palette and orchestrator into one component | UI concern; orchestrator remains separate service                           |

## Consequences

- DF-012 overlay selection handlers call existing hooks only
- DF-013 documents palette-orchestrator interaction without duplicate lists
- DF-014 stubs conform to routing rules (entities only, no execute)
- Health endpoint may expose knowledge diagnostics — not execution metrics (DF-015)
- Platform Reference Architecture M5+ section references this ADR

---

_ADR-0029 — Knowledge Discovery Execution Routing — Accepted at DF-001._
