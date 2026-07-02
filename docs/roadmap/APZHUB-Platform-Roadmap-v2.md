# APZHUB Platform Roadmap v2

> **Platform Version:** 2.0 (baseline established)  
> **Status:** Active roadmap — Milestones 5–10  
> **Authority:** [Document 003](../003-overall-system-architecture-design-principles.md) · [Platform Reference Architecture](../architecture/APZHUB-Platform-Reference-Architecture.md)  
> **Rule:** Future milestones **extend** Platform 2.0. They do **not** redesign it.

---

## Overview

Platform Version 2.0 (Milestones 1–4) delivers the permanent foundation: Runtime, Workbench, Action Framework, and application integration. Roadmap v2 describes the next platform evolution through **Milestone 10**.

Business capabilities remain **Milestone 9+**. Enterprise operations mature at **Milestone 10**.

```text
Platform 2.0 ✅ (M1–M4)
        ↓
M5  Knowledge & Discovery Framework
        ↓
M6  Notification Framework
        ↓
M7  Activity Framework
        ↓
M8  Identity & Administration
        ↓
M9  Business Capabilities
        ↓
M10 Enterprise Operations
```

---

## Milestone 5 — Knowledge & Discovery Framework

> **Sprint:** SPR-005 (in progress — DF-001 complete)  
> **Authority:** [Document 020 — Unified Search, Knowledge & Discovery](../020-unified-search-knowledge-discovery-framework.md)

### Objectives

Implement the **Knowledge & Discovery Framework** — a unified knowledge layer extending APZHUB beyond keyword search while consuming existing registries. No new execution pipeline.

### Vision

The Knowledge & Discovery Framework will eventually support:

- Keyword search
- Fuzzy search
- Semantic search
- AI-assisted discovery
- Recently used
- Frequently used
- Pinned items
- Recommendations
- Cross-capability discovery

SPR-005 establishes foundation scaffolds — not full AI or semantic search.

### Platform capabilities (planned)

| Capability                        | Scope                                  |
| --------------------------------- | -------------------------------------- |
| Knowledge source registration     | Knowledge Source model and registry    |
| Knowledge discovery orchestration | Query routing across sources           |
| Action Registry integration       | Commands discoverable as entities      |
| Workbench Registry integration    | Navigation/views discoverable          |
| Header search UI                  | Shell search slot                      |
| Discovery overlay                 | Unified knowledge results presentation |
| Ranking scaffold                  | Usage frequency, recency hooks         |
| Permission-aware filtering        | Same adapter pattern as actions        |

### Dependencies

| Dependency                    | Status                                        |
| ----------------------------- | --------------------------------------------- |
| Platform 2.0 (M1–M4)          | ✅ Required                                   |
| Action Framework registry     | ✅ Consume, do not duplicate                  |
| Workbench navigation registry | ✅ Consume                                    |
| Command Palette overlap       | Coordinate — actions as discovery results     |
| Event Bus (full audit/index)  | ⏳ Deferred — interface only in early stories |

### Constraints

- **No new execution pipeline** — selections route to existing `execute()` or navigation
- **No Runtime redesign** — provider kind may extend Manifest Engine via ADR
- **No Workbench redesign** — new surface follows Surface Pattern

### Expected deliverables

- `@apzhub/knowledge-discovery-framework` (repurpose `@apzhub/search` shell — [ADR-0027](../adr/ADR-0027-knowledge-discovery-framework-package.md))
- Knowledge Source API and T0 registry-projection sources
- Knowledge discovery overlay UI in Desktop Shell
- Integration with Action Registry and palette
- Documentation, tests, sprint closeout

**Backlog:** [SPR-005-knowledge-discovery-framework-backlog.md](../backlog/SPR-005-knowledge-discovery-framework-backlog.md)

---

## Milestone 6 — Notification Framework

> **Authority:** [Document 021 — Notification, Activity & Attention](../021-notification-activity-attention-management-framework.md)

### Objectives

Implement notification, activity stream, and attention management per Document 021.

### Platform capabilities (planned)

- Notification layer UI in Desktop Shell
- Activity stream model and registry
- Attention engine (badge, priority)
- Event-to-notification mapping hooks
- Digest and quiet-hours interfaces (scaffold)

### Dependencies

| Dependency                                  | Status                              |
| ------------------------------------------- | ----------------------------------- |
| Workbench Framework (panel/overlay regions) | ✅                                  |
| Knowledge & Discovery Framework (M5)        | Recommended — find notifications    |
| Event Bus (Document 029)                    | ⏳ Parallel or prerequisite sprint  |
| Identity (M8)                               | Partial — user-scoped notifications |

### Expected deliverables

- Notification Framework package
- Provider API
- Shell notification region
- Documentation and tests

---

## Milestone 7 — Activity Framework

> **Authority:** [Document 021](../021-notification-activity-attention-management-framework.md) · [Document 012](../012-event-driven-architecture-background-processing-workflow-framework.md)

### Objectives

Implement the Activity Framework — unified activity timeline, audit visibility, and cross-capability activity aggregation.

### Platform capabilities (planned)

- Activity stream registry
- Activity presentation in shell (feed, timeline)
- Correlation with notifications (M6)
- Action audit trail surfacing (from Action Framework audit hook)
- Workflow activity hooks (interface)

### Dependencies

| Dependency                  | Status                           |
| --------------------------- | -------------------------------- |
| Notification Framework (M6) | Recommended                      |
| Event Bus                   | ⏳ For persistent activity store |
| Action Framework audit hook | ✅ Extension point exists        |

---

## Milestone 8 — Identity & Administration

> **Authority:** [Document 007 — IAM & RBAC](../007-identity-authentication-authorisation-rbac-architecture.md)

### Objectives

Complete identity, authorisation, and administration infrastructure.

### Platform capabilities (planned)

- Full RBAC permission population from auth session
- Role and permission administration UI
- Server session sync (PostgreSQL) — ADR-0021 extension
- Registry permission enforcement at production depth
- SSO / enterprise IdP integration hooks
- Audit log persistence

### Dependencies

| Dependency                                | Status   |
| ----------------------------------------- | -------- |
| Auth scaffold (M1)                        | ✅       |
| Permission adapter structure (M3, M4)     | ✅       |
| Platform data architecture (Document 011) | Required |

### Impact on Platform 2.0

Resolves deferred items:

- RBAC keys declared but not populated
- Auth adapter allow-all in development
- Session server sync

---

## Milestone 9 — Business Capabilities

> **Authority:** [Document 008](../008-module-plugin-connector-architecture.md) · [Document 025](../025-module-sdk-module-manifest-module-development-standard.md)

### Objectives

First business capabilities on the platform — real modules with views, services, and actions.

### Platform capabilities (planned)

- Capability view mount pipeline
- Module SDK production readiness
- Example business module (scaffold → production)
- Platform Service wiring for `handler: service:…` actions
- Integration adapter framework in production use

### Dependencies

| Dependency            | Status                                 |
| --------------------- | -------------------------------------- |
| Platform 2.0 complete | ✅                                     |
| M8 Identity (RBAC)    | ✅ Required for production permissions |
| Discovery (M5)        | Recommended for findability            |

### Rule

No business modules before M9 planning approval (Constitution Principle 1).

---

## Milestone 10 — Enterprise Operations

> **Authority:** [Document 014](../014-observability-monitoring-telemetry-health-framework.md) · [Document 015](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [Document 013](../013-security-architecture-zero-trust-framework.md)

### Objectives

Enterprise-grade operations — observability, deployment, compliance, and support readiness for commercial deployment.

### Platform capabilities (planned)

- Production observability (metrics, tracing, logging)
- CI/CD hardening and deployment automation
- Secrets management integration
- Backup, DR, and rollback runbooks
- Compliance programme (SOC 2 / ISO mapping)
- Support tier documentation
- Multi-tenant readiness assessment
- Performance and scalability validation

### Dependencies

| Dependency               | Status                                |
| ------------------------ | ------------------------------------- |
| M9 Business capabilities | Recommended — realistic load profiles |
| M8 Identity              | Required                              |
| Event Bus production     | Recommended                           |

---

## Dependency graph

```text
M1 Foundation ─────────────────────────────────────────────┐
M2 Runtime ────────────────────────────────────────────────┤
M3 Workbench ──────────────────────────────────────────────┤ Platform 2.0 ✅
M4 Action Framework ───────────────────────────────────────┘
        │
        ├──► M5 Knowledge & Discovery Framework
        │         │
        │         ├──► M6 Notification Framework
        │         │         │
        │         │         └──► M7 Activity Framework
        │         │
        └──► M8 Identity & Administration
                      │
                      └──► M9 Business Capabilities
                                │
                                └──► M10 Enterprise Operations
```

---

## Technical debt carried into M5+

From Platform 2.0 closeout — not blocking M5 planning:

| ID         | Item                          | Target milestone                |
| ---------- | ----------------------------- | ------------------------------- |
| TD-AF20-01 | Manifest bridge id resolution | M5 hardening or dedicated story |
| TD-AF20-02 | Theme service handler         | M9 or platform service story    |
| TD-AF20-03 | Duplicate theme controls      | UX story                        |
| M8         | RBAC population               | M8                              |
| M9         | View mount pipeline           | M9                              |

---

## Sprint 005 gate

**Do not begin SPR-005 implementation** until:

1. Platform 2.0 baseline approved (this roadmap + readiness review)
2. Owner approves [SPR-005 backlog](../backlog/SPR-005-knowledge-discovery-framework-backlog.md) — ✅ Sprint 005 approved; DF-001 complete
3. DF-001 ADRs and specs approved

---

_APZHUB Platform Roadmap v2 — post Platform 2.0 evolution._
