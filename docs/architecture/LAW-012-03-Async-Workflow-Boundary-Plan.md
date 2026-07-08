# LAW-012-03 — Async Workflow Boundary Plan

> **Status:** Plan only — no forced workflow rewrite in LAW-012-03

---

## Current state (LAW-012-02)

| Layer                 | Model                                              |
| --------------------- | -------------------------------------------------- |
| `*WorkflowService`    | **Synchronous** methods                            |
| Repository interfaces | **Synchronous**                                    |
| PostgreSQL adapters   | Async I/O bridged via `runSync()` (`Atomics.wait`) |

### Sync bridge risk (TD-P04)

- Blocks the Node.js thread during PostgreSQL I/O
- Acceptable for foundation / low concurrency dev
- **Not suitable** for high-throughput server routes or long-running queries
- Hides async failure modes from callers

---

## Target model

```text
UI / Command
    ↓
AsyncWorkflowFacade (new — LAW-012-05+)
    ↓ await
*WorkflowServiceAsync OR repository async ports
    ↓
PostgreSQL adapter (native async)
    ↓
UoW + outbox (same transaction)
```

---

## Migration path (incremental)

| Phase          | Scope                                                         | Breaking?            |
| -------------- | ------------------------------------------------------------- | -------------------- |
| **LAW-012-03** | Document risk; keep `runSync`                                 | No                   |
| **LAW-012-05** | Add parallel `AsyncClientWorkflowService` behind new commands | No                   |
| **LAW-012-06** | Server routes use async facade; client keeps sync             | Partial              |
| **LAW-012-07** | Deprecate sync repositories; remove `runSync`                 | Yes (owner approval) |

---

## Minimal safe change implemented (LAW-012-03)

- **No workflow signature changes**
- Outbox + UoW wired inside existing sync repository path
- Tenant session binding at executor construction (not per-method async)

---

## Decision criteria for async cutover

Proceed when **all** are true:

1. Auth tenant binding is stable
2. PostgreSQL is default repository mode in production
3. Server-side command execution path is identified (API or RSC actions)
4. Owner approves breaking change window

---

## Recommendation

Keep sync workflows through LAW-012-04 (Document/Task persistence). Revisit async boundary before public API exposure (LAW-013+).
