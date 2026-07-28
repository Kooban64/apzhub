# Architecture Review — Platform 1.3 Confirmation

> **Programme:** Platform-1.3-ARCH-001  
> **Baseline:** Platform 1.2.0 architecture freeze · Integration SDK 1.0.0 freeze  
> **Date:** 2026-07-22

---

## 1. Layering (003) — confirmed

```text
Presentation (Workbench / Modules)
  → Platform Services (business logic only)
    → Service Connector / Integration Adapter
      → Backend Engine (CE / self-hosted first)
```

No approved 1.3 epic requires Presentation→Engine, Module→Connector, or Service→Backend bypass. **No redesign.**

---

## 2. Area review

| Area                  | 1.2.0 status                                            | 1.3 fit                           | Notes                                                |
| --------------------- | ------------------------------------------------------- | --------------------------------- | ---------------------------------------------------- |
| **Platform Runtime**  | Frozen (`platform-runtime`, registries)                 | Compatible                        | Manifest-first discovery unchanged                   |
| **Workbench**         | Frozen framework + permission adapter                   | Compatible                        | Realtime/UX polish stay in shell/module presentation |
| **Identity**          | Better Auth + APZHUB permissions                        | Compatible                        | No new identity SoR in 1.3                           |
| **Administration**    | Separate SoR from Observe/Identity                      | Compatible                        | Do not merge Observe live into Admin                 |
| **Platform Services** | Interface-first gateway facets                          | Compatible                        | Additive ops only (approve, embed, evaluate)         |
| **Integration SDK**   | **1.0.0 frozen** (ADR-0065)                             | Compatible                        | Additive adapter capabilities; no SDK thaw           |
| **Products**          | Projects/Time/Support/Law/Docs/TCMS                     | Compatible                        | Polish + depth within CE adapters                    |
| **Notifications**     | Metadata SoR frozen; delivery absence                   | Compatible **with ADR-0071**      | Delivery ≠ Email SoR                                 |
| **Search**            | Publication chain frozen; Time/Law publishers present   | Compatible                        | Live drain = wiring, not redesign                    |
| **Observe**           | Metadata SoR; evaluation/delivery absence               | Compatible **with ADR-0070**      | Stay metadata SoR + additive evaluator plane         |
| **Realtime**          | Event bus present; no production WS/SSE product surface | Compatible **with ADR-0072**      | Gateway→Services→Bus; no module sockets              |
| **Analytics**         | ADR-0066/0067; Metabase embed planned                   | Compatible                        | Live embed via AnalyticsService                      |
| **Workflow**          | Execute gated; designer freeze-gated                    | Compatible **with ENG milestone** | Designer adjacency only; Execute stays gated         |
| **Configuration**     | Frozen Config SoR                                       | Compatible                        | No Config redesign                                   |
| **Law Platform**      | 1.0.0; FIN-001 STOP                                     | Compatible                        | UX polish only; no FIN/Email                         |

---

## 3. Package boundaries — confirmed

| Boundary                         | Ruling                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `@apzhub/search-*` + Meilisearch | Retain frozen publication path; wire Time/Law composition hooks                            |
| `@apzhub/observe-*`              | Retain metadata SoR; add evaluation/delivery **plane** via ADR — do not invent Grafana SoR |
| `@apzhub/notification-*`         | Retain metadata SoR; add delivery providers via ADR — not Email product SoR                |
| `@apzhub/platform-event-bus`     | Fan-in for Support realtime; modules publish events only                                   |
| `@apzhub/workflow-*` + n8n       | Execute remains gated; no new execute APIs                                                 |
| `@apzhub/analytics-*` + Metabase | Embed issuance in connector; registry honesty                                              |
| Integration SDK packages         | Additive capability flags only                                                             |

---

## 4. Service boundaries — confirmed

- Modules call Platform Service interfaces only.
- Audit, search indexing, notifications remain centralised in services/events.
- Connectors translate engines; never expose Plane/Zammad/Kimai/n8n/Metabase branding in UI.
- Backend IDs stay connector-internal; platform IDs remain authoritative for platform metadata.

---

## 5. Integration boundaries — confirmed

| Engine                    | 1.3 use                                       | Constraint                                      |
| ------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Meilisearch               | Live composition/drain                        | Via Search Integration + orchestrator only      |
| Zammad CE                 | Support realtime / optional attachment delete | CE only; no EE                                  |
| Kimai CE                  | Time approvals/reporting                      | CE APIs only                                    |
| Plane CE                  | Sprint / My Work depth                        | Via ProjectService                              |
| Metabase                  | Live embed                                    | Via AnalyticsService + adapter                  |
| n8n                       | Designer adjacency                            | Execute gated                                   |
| SMTP / WS / SSE providers | Notify delivery                               | Platform delivery framework — **not** Email SoR |

---

## 6. Runtime capability — confirmed

| Capability                                 | Sufficient for 1.3 Must?    |
| ------------------------------------------ | --------------------------- |
| Gateway + RequestPipeline + authz          | Yes                         |
| Event bus + domain events (Support)        | Yes (realtime fan-in)       |
| Search orchestrator + journal + admin HTTP | Yes (drain wiring)          |
| Observe CRUD + ops alert strategy          | Yes (extend with evaluator) |
| Notification metadata + Attention routing  | Yes (add providers)         |
| Async jobs / workers pattern (012)         | Yes (evaluation + delivery) |

---

## 7. Scalability — confirmed

| Concern            | Assessment                                                                          |
| ------------------ | ----------------------------------------------------------------------------------- |
| Search drain       | Single-path orchestrator adequate for 1.3; multi-instance coordination out of scope |
| Observe evaluation | Must be async (012); no PromQL in request path                                      |
| Realtime           | Prefer SSE; shared-host capacity (OPS capacity check)                               |
| Notify delivery    | Workers + retry/DLQ; secrets in connector boundary                                  |
| Host coexistence   | Respect ENVIRONMENT.md / OPS capacity (P13-R-03)                                    |

**No structural scalability redesign required for 1.3 scope.**

---

## 8. Structural redesign required?

**No.** All approved epics are additive extensions, freeze thaws via ADR + named ENG, or presentation/process work within frozen boundaries.

---

## Related freezes

- [Search Publication Freeze](../APZHUB-Search-Publication-Architecture-Freeze-Notice.md)
- [Observability Freeze](../APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Notification Freeze](../APZHUB-Notification-Architecture-Freeze-Notice.md)
- [Workflow Engine Freeze](../APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md)
- [ADR-0065 Integration SDK Freeze](../../adr/ADR-0065-integration-sdk-v1-architecture-freeze.md)
