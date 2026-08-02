# Core Quality Engineering Architecture — APZQEP-140-000

| Field          | Value                                       |
| -------------- | ------------------------------------------- |
| Programme      | APZQEP-140-000                              |
| Title          | Core Quality Engineering Architecture       |
| Status         | **COMPLETE** (architecture only)            |
| Classification | Product Capability Architecture             |
| Engineering    | **NONE**                                    |
| Timestamp      | 20260802T163547Z                            |
| Consumes       | APZQEP-120 Platform Foundation (**CLOSED**) |

---

## Purpose

Transform APZQEP from a completed **platform** into an **Enterprise Quality Engineering Product** by defining how user-facing capabilities consume the runtime — without redesigning it.

```text
APZQEP-120 Platform Foundation (COMPLETE)
        │
        ▼
APZQEP-140 Core Quality Engineering (product capabilities)
        │
        ▼
Future APZQEP-160 Intelligence & AI
```

## Non-negotiable platform rules (consume only)

| Rule                                                       | Source    |
| ---------------------------------------------------------- | --------- |
| Business domains publish facts; consumers subscribe        | S07–S12   |
| Search / discovery via Quality Knowledge Index only        | S11       |
| Notifications subscribe; never call business services      | S12       |
| Commands execute via registered handlers; discover via QKI | S13       |
| Outbox + Processing for reliable delivery/execution        | S08–S09   |
| Modules → Platform Services → Connectors → Engines         | 008 / 009 |

**This programme SHALL NOT redesign** governance, baselines, or platform packages.

---

## Capability set (authoritative for APZQEP-140)

| ID    | Capability                  | Primary product nouns                                                  |
| ----- | --------------------------- | ---------------------------------------------------------------------- |
| **A** | Test Management             | Suites, Libraries, Shared Assets, Reusable Components                  |
| **B** | Run Management              | Runs, Planning, Scheduling, Assignments, Sessions                      |
| **C** | Test Execution              | Manual / Automated / Hybrid execution, Results, Evidence links, Status |
| **D** | Defect & Quality Findings   | Defects, Lifecycle, Links, Findings, Risk                              |
| **E** | Requirements & Traceability | Requirements, Coverage, Relationships, Trace matrix                    |
| **F** | Reporting                   | Operational / Executive dashboards, Analytics, Portfolio views         |

> Board framing A–D (streams) is **refined** here into A–F for clearer domain ownership. Streams remain valid stakeholder grouping (see [CAPABILITY-MAP.md](./CAPABILITY-MAP.md)).

---

## Runtime consumption pattern (every capability)

```text
UI Module / Command / API
        │
        ▼
Platform Service (capability owner)     ← business rules, SoR writes
        │
        ├── publish Domain Events → Outbox → Processing
        │         ├── Capability processors
        │         ├── QKI projection processors
        │         └── Notification processors (subscribers)
        │
        └── Command Handlers (registered) ← Command Platform
```

| Concern                       | Platform surface                     |
| ----------------------------- | ------------------------------------ |
| Write / rules                 | Capability Platform Service          |
| Read / search / discovery     | Quality Knowledge Index              |
| Notify                        | Notification & Subscription Platform |
| User actions                  | Enterprise Command Platform          |
| Evidence binaries / integrity | Evidence Platform (existing)         |

---

## Architectural principles

1. **One SoR per datum** — capability services own their entities; QKI is projection-only.
2. **Event-first side effects** — notify, index, activity, cross-capability reactions via events.
3. **No capability-to-capability direct coupling** — integrate via events, shared IDs, or platform services.
4. **Tenant + project isolation** on every API, command, projection, and notification.
5. **Permission-driven UI** — nav, commands, and reports filtered by RBAC.
6. **Self-hosted OSS first** — no mandatory EE backend dependencies.
7. **AI / QI are consumers** — touchpoints reserved; not in APZQEP-140 critical path.

---

## Document map

| Document                                                                   | Role                               |
| -------------------------------------------------------------------------- | ---------------------------------- |
| [CAPABILITY-MAP.md](./CAPABILITY-MAP.md)                                   | Per-capability architecture sheets |
| [DOMAIN-MODEL.md](./DOMAIN-MODEL.md)                                       | Entities, relationships, ownership |
| [USER-EXPERIENCE-ARCHITECTURE.md](./USER-EXPERIENCE-ARCHITECTURE.md)       | Nav, workspaces, roles             |
| [EVENT-ARCHITECTURE.md](./EVENT-ARCHITECTURE.md)                           | Business events & consumers        |
| [API-ARCHITECTURE.md](./API-ARCHITECTURE.md)                               | Capability API boundaries          |
| [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md)                   | Waves, gates, release              |
| [ENGINEERING-PROGRAMME-BREAKDOWN.md](./ENGINEERING-PROGRAMME-BREAKDOWN.md) | Slices / programmes                |
| [PRODUCT-BOARD-REVIEW.md](./PRODUCT-BOARD-REVIEW.md)                       | Board decision surface             |

---

## Success criteria (architecture)

- Product Board can approve the complete Core QE architecture
- Subsequent engineering programmes need **no architectural redesign**
- Implementation can proceed **capability by capability**
