# Solution Architecture — APZQEP v1.1

| Field       | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Programme   | APZQEP-111                                                                          |
| Status      | COMPLETE — AWAITING PRODUCT BOARD APPROVAL                                          |
| Extends     | APZQEP v1.0 production baseline                                                     |
| Governed by | Document 000 · Lifecycle Standard · Engineering Standard · AI Operational Framework |

---

## 1. Current state (v1.0) — strengths & constraints

### Strengths

- Complete foundation chain with Platform Service boundaries and Workbench routers
- Manifest-first modules; permission models per capability
- Proven freeze/release discipline; Evidence + TE under honest LIMITED_AVAILABILITY
- Search adapter pattern exists (`search-qep`); event SDK available platform-wide

### Limitations / debt / deferred

| Area            | Constraint                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| Evidence        | ADR-0088 memory-only; ACL on list/search incomplete; no bus publish; thin obs |
| Test Execution  | L-OP-01 E2E gaps; outbox enqueue-only; OpenAPI gap                            |
| Operating model | No Suites, Runs, Defects domains                                              |
| Discovery       | Search incomplete; no QEP command palette; notifications not wired            |
| Insight         | Capability-local dashboards only; no QI engine                                |
| AI              | Explicitly out of v1.0 scope                                                  |
| Stubs           | 15+ catalogue modules reserved but unimplemented                              |

### Extension points (reuse)

- `@apzhub/platform-services` QEP factory pattern
- Module YAML + Workbench dynamic registration
- Platform Search Providers, Notification Framework, Command Framework, Event Bus
- Evidence `StoragePort` abstraction (ready for durable adapter)
- TE external ingestion API (automation bridge)

---

## 2. Target architecture vision

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Desktop Shell (permissioned)                 │
│  Home · Dashboards · Command Palette · Notifications · Search    │
└────────────────────────────┬────────────────────────────────────┘
                             │ APZHUB API Gateway
┌────────────────────────────▼────────────────────────────────────┐
│                    Platform Services (QEP)                        │
│  Req · Trace · Verify · Spec · Plan · Suite · Run · Execution    │
│  Defect · Evidence · Certification* · ReleaseReadiness*          │
│  QualityIntelligence · AI Orchestration                          │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
        ┌───────▼────────┐            ┌───────▼────────┐
        │ Event Bus      │            │ Search Index   │
        │ Notify/Audit   │            │ (derived)      │
        └────────────────┘            └────────────────┘
                │
        ┌───────▼────────────────────────────────────┐
        │ Adapters (Integration SDK) — 1.2+ ALM etc. │
        └────────────────────────────────────────────┘

* Certification Engine & deep Release product UI: designed now; primary delivery 1.2 unless Board accelerates
```

**Rules (unchanged):** Presentation → Application → Domain → Services → Adapters → Engines. Modules never call connectors. AI never bypasses Platform Services.

---

## 3. Logical building blocks

| Block                       | Responsibility                             | v1.1 delivery band           |
| --------------------------- | ------------------------------------------ | ---------------------------- |
| QE Core domains             | Suites, Runs, Defects + harden TE/Evidence | 120 / 130                    |
| Quality Intelligence Engine | Derived scores & time series               | 120 (skeleton) · 160 (depth) |
| AI Platform                 | Assistants, RAG, guardrails, approval      | 150                          |
| Experience layer            | Home, dashboards, UCP, IA                  | 140                          |
| Integration fabric          | ALM/docs/CI enrichment                     | 170                          |
| Operational excellence      | Obs, retention, GA path                    | 180                          |

---

## 4. Quality attributes

| Attribute              | Architectural response                                       |
| ---------------------- | ------------------------------------------------------------ |
| Scalability            | Stateless services; async events; derived QI; indexed search |
| Maintainability        | Domain packages; manifest contracts; no module coupling      |
| AI integration         | Model abstraction; prompt registry; eval; human gate         |
| Usability              | Role IA; UCP; context panels; tokens/themes                  |
| Operational excellence | Health hierarchy; structured logs; correlation IDs           |
| Release confidence     | QI scores + readiness views + evidence completeness          |
| Portfolio              | QI + future multi-product adapters (2.0)                     |

---

## 5. Non-goals

- Redesign of frozen v1.0 domain packages “for cleanliness”
- AI as system of record
- QI as authoritative business data
- Bypassing Lifecycle Freeze/Release for speed
- Embedding engine brands in UX

---

## 6. Traceability to planning

| APZQEP-110 theme        | Architecture response |
| ----------------------- | --------------------- |
| T1 Trust & Operability  | 120 Foundation        |
| T2 Test Operating Model | 130 Core              |
| T3 Discovery            | 120 cross-cutting     |
| T4 Insight Surfaces     | 140 + QI              |
| T5 AI Assist MVP        | 150                   |
| T6 Enterprise Depth     | 160 / 170 / 1.2+      |

---

## Related documents

- [DOMAIN-MODEL.md](./DOMAIN-MODEL.md)
- [INFORMATION-ARCHITECTURE.md](./INFORMATION-ARCHITECTURE.md)
- [UX-ARCHITECTURE.md](./UX-ARCHITECTURE.md)
- [AI-ARCHITECTURE.md](./AI-ARCHITECTURE.md)
- [QUALITY-INTELLIGENCE-ENGINE.md](./QUALITY-INTELLIGENCE-ENGINE.md)
- [DATA-ARCHITECTURE.md](./DATA-ARCHITECTURE.md)
- [ENGINEERING-PROGRAMMES.md](./ENGINEERING-PROGRAMMES.md)
- [IMPLEMENTATION-ROADMAP.md](./IMPLEMENTATION-ROADMAP.md)
