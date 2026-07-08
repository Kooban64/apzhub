# APZHUB Law Platform — Validation Strategy

> **Product:** Law Firm Platform v1.0  
> **Platform baseline:** [Platform Version 5.0](../releases/APZHUB-Platform-v5.0.md) — **frozen**  
> **Phase:** Platform Validation Phase 1 — planning only  
> **Authority:** [Product Validation Strategy](./APZHUB-Product-Validation-Strategy.md) · [Law Platform v1.0](../releases/APZHUB-Law-Platform-v1.0.md)

---

## Purpose

This document defines **measurable validation goals** for each APZHUB platform framework when exercised by the Law Firm Platform. Every completed Law Platform story must increase confidence in the platform — not merely add legal features.

**Validation rule:** Every story explicitly states which platform framework(s) it validates.

---

## Validation principles

| Principle                             | Application                                                  |
| ------------------------------------- | ------------------------------------------------------------ |
| Consume, don't redesign               | Legal modules use manifests and public APIs only             |
| Platform 5.0 frozen                   | Framework changes = bug fixes or critical defects only       |
| Traceability                          | Story → framework → measurable goal                          |
| Incremental confidence                | Each milestone raises validation score for target frameworks |
| No M8 dependency for Phase 1 planning | Implementation may use dev permission adapter until M8       |

---

## Framework validation goals

### Platform Runtime

| Goal                     | Metric                                       | Target                    |
| ------------------------ | -------------------------------------------- | ------------------------- |
| Legal manifest discovery | All legal services discovered at bootstrap   | 100% registered           |
| Lifecycle transitions    | Legal services reach `active` state          | Zero bootstrap failures   |
| Health aggregation       | `/api/health` includes legal service summary | Field present + `healthy` |
| Fail-fast validation     | Invalid legal manifest blocks startup        | Integration test passes   |
| Diagnostics              | Legal services expose `getDiagnostics()`     | All services compliant    |

**Confidence increase:** Proves Runtime scales to multi-capability legal domain without orchestrator changes.

---

### Workbench Framework

| Goal                       | Metric                                              | Target           |
| -------------------------- | --------------------------------------------------- | ---------------- |
| Multi-workspace navigation | Matter + Clients + Admin workspaces on Activity Bar | ≥3 workspaces    |
| View routing               | Sidebar selection updates route and active view     | E2E pass         |
| Session restore            | Matter view restored after reload                   | E2E pass         |
| Permission filtering       | Disallowed views stripped server-side               | Integration test |
| Context Panel              | Activity tab shows matter timeline                  | E2E pass         |

**Confidence increase:** Proves Workbench handles complex legal navigation without engine redesign.

---

### Action Framework

| Goal               | Metric                                                        | Target                       |
| ------------------ | ------------------------------------------------------------- | ---------------------------- |
| Manifest actions   | Legal actions in palette, toolbar, context menu               | ≥10 legal actions registered |
| Execution pipeline | All legal actions route through shared executor               | Zero bypass paths            |
| Permission gating  | Restricted actions hidden for unauthorized roles              | Integration test             |
| Audit events       | Successful legal actions publish `capability.action.executed` | E2E event count > 0          |
| Action delegation  | Knowledge/notification/activity `actionRef` works             | E2E delegation pass          |

**Confidence increase:** Proves Action Framework scales to high-density legal command sets.

---

### Knowledge & Discovery Framework

| Goal                   | Metric                                                | Target                             |
| ---------------------- | ----------------------------------------------------- | ---------------------------------- |
| Multi-provider query   | Clients + matters + documents searchable in one query | Overlay returns merged results     |
| Palette knowledge mode | Legal entities findable from command palette          | E2E pass                           |
| Provider registration  | ≥3 legal KnowledgeProviders bootstrap                 | Health `knowledge` count increases |
| Selection delegation   | Navigate to matter from search result                 | E2E pass                           |
| Ranking                | Matter-scoped results rank above global               | Unit test on ranking strategy      |

**Confidence increase:** Proves Knowledge layer supports cross-entity legal search without custom search UI.

---

### Event & Notification Framework

| Goal                | Metric                                                    | Target           |
| ------------------- | --------------------------------------------------------- | ---------------- |
| Event registration  | Legal domain events in EventRegistry                      | ≥15 event types  |
| Publish discipline  | Legal services publish — never direct NotificationService | Code review gate |
| Notification routes | In-app routes for assignment, deadline, status events     | ≥10 routes       |
| Badge + panel       | Legal notifications appear in shell Experiences           | E2E pass         |
| Mark read           | Panel mark-read syncs badge                               | E2E pass         |
| Parallel fan-out    | Same event produces notification + activity               | E2E pass         |

**Confidence increase:** Proves Event Bus handles legal event volume and notification UX at scale.

---

### Activity & Timeline Framework

| Goal              | Metric                                             | Target             |
| ----------------- | -------------------------------------------------- | ------------------ |
| Activity types    | Legal events map to activity types                 | ≥10 activity types |
| Context Panel     | Matter activity visible in Activity tab            | E2E pass           |
| Date grouping     | Presentation layer groups legal activity by date   | Component test     |
| Personal timeline | User actions appear on personal scope              | E2E pass           |
| Independence      | Activity items ≠ notification items for same event | Integration test   |

**Confidence increase:** Proves Activity/Timeline supports matter-centric history without custom timeline engine.

---

## Cross-framework validation scenarios

| Scenario                        | Frameworks validated                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Create matter end-to-end        | Action → Event Bus → Notification + Activity → Workbench navigation → Knowledge index |
| Assign task with notification   | Event → Notification → actionRef delegation → Action                                  |
| Search matter and open document | Knowledge → Workbench navigation → Action                                             |
| Session restore on matter view  | Workbench session → permission filter                                                 |
| Operator health check           | Runtime health → all framework fields                                                 |

---

## Validation scoring (planned)

Each milestone closeout assigns a **confidence level** per framework:

| Level                         | Meaning                             |
| ----------------------------- | ----------------------------------- |
| **L0 — Untested**             | No legal workload yet               |
| **L1 — Smoke**                | Single happy-path E2E               |
| **L2 — Functional**           | Core scenarios + unit coverage      |
| **L3 — Production candidate** | Full E2E suite + operator checklist |
| **L4 — Validated**            | Production readiness review PASS    |

Target at LAW-012 closeout: **L3 minimum** on all six frameworks.

---

## Phase 1 (this document) vs implementation phases

| Phase                                | Scope                                          |
| ------------------------------------ | ---------------------------------------------- |
| **Phase 1 — Planning**               | Architecture, backlog, readiness — **current** |
| **Phase 2 — LAW-001 implementation** | Foundation scaffold — first engineering gate   |
| **Phase 3 — LAW-002–LAW-011**        | Incremental legal modules                      |
| **Phase 4 — LAW-012**                | Production readiness + validation report       |

**Stop:** No implementation until owner approves first Law Platform engineering story.

---

## Out of scope for validation (explicit)

- Platform framework feature additions
- Milestone 8 Identity/Admin implementation
- External email/SMS notification delivery
- Persistent activity/notification stores (document gap; not block Phase 2)
- Commercial GA certification

---

## Related documents

| Document             | Path                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| Law capability map   | [APZHUB-Law-Capability-Map.md](../architecture/APZHUB-Law-Capability-Map.md)    |
| Law Platform backlog | [LAW-Platform-Backlog.md](../backlog/LAW-Platform-Backlog.md)                   |
| Law readiness review | [APZHUB-Law-Platform-Readiness.md](../reviews/APZHUB-Law-Platform-Readiness.md) |

---

_APZHUB Law Platform Validation Strategy — Platform Validation Phase 1._
