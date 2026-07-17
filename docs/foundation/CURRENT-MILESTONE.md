# APZHUB Current Milestone

> **Purpose:** Where development currently stops and what requires owner approval  
> **Last updated:** 2026-07-17  
> **Current status:** Active — **APZOBSERVE-006 COMPLETE** (Observability Wave Certification & Architecture Freeze — programme **closed/frozen**); **PRODUCTION_READY_WITH_LIMITATIONS** retained. Administration / Configuration / Notification / Workflow / Identity programmes closed/frozen. **APZSEARCH-016** remains deferred. **APZCONFIG-007** / **APZNOTIFY-007** / **APZWORKFLOW-012** roadmap only.

---

## Where development stops

**Current milestone:** **APZOBSERVE-006 — Observability Wave Certification & Architecture Freeze** — **COMPLETE**

**Outcome:** Platform Observability programme **closed/frozen**. Reference Standard published. Architecture freeze in force. `pnpm audit:observe-wave` PASS. Classification **PRODUCTION_READY_WITH_LIMITATIONS** retained. Metadata governance only — **no Grafana/Prometheus/Loki/OTel/AlertManager, collection/ingest, alert delivery, Event Bus, AI.**

**Stop condition:** Await owner approval before **APZMETRICS-001 — Platform Metrics Foundation**. Do **not** implement metrics/providers/Observability path changes without ADR + owner approval. Identity/Administration remain frozen.

**Also awaiting owner (unchanged):** **APZCONFIG-007**, **APZNOTIFY-007**, **APZWORKFLOW-012**, **APZSEARCH-016**, `@apzhub/integration-sdk` **1.0.0**, Platform Event Bus, webhook ingress, provisioning, GitLab CI, AI Assist (deferred).

---

## Last completed milestones

| Milestone | Deliverable | Status |
| --- | --- | --- |
| **APZOBSERVE-006** | Observability Wave Certification & Architecture Freeze | Complete — programme **closed/frozen**; `audit:observe-wave` |
| **APZOBSERVE-005** | Observability Vertical Certification | Complete — **PRODUCTION_READY_WITH_LIMITATIONS**; `certify:observe-vertical` |
| **APZOBSERVE-004** | Observability Administration Workbench | Complete — `audit:observe-workbench`; `/workspace/observability` |
| **APZOBSERVE-003** | Observability HTTP API & Production Typed Client | Complete — `audit:observe-http-client`; OpenAPI **1.8.0** |
| **APZOBSERVE-002** | Observability Platform Services, Gateway & Authorization | Complete — `audit:observe-platform-services`; contracts/core **0.2.0**; platform-services **0.24.0** |
| **APZOBSERVE-001** | Platform Observability Foundation | Complete — `audit:observe-foundation`; persistence **0.1.0**; migrations **0054/0055** |
| **APZIDENTITY-006** | Identity Wave Certification & Architecture Freeze | Complete — programme **closed/frozen** |
| **APZADMIN-006** | Administration Wave Certification & Architecture Freeze | Complete — programme **closed/frozen** |

---

## Recommended next (not authorised)

**APZMETRICS-001 — Platform Metrics Foundation** (**do not implement**).

---

## See also

- [APZOBSERVE-006 Completion Report](../sprint/APZOBSERVE-006-completion-report.md)
- [Observability Architecture Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Observability Reference Standard](../architecture/APZHUB-Observability-Reference-Standard.md)
- [APZOBSERVE-005 Completion Report](../sprint/APZOBSERVE-005-completion-report.md)
