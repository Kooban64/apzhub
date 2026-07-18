# Programme Recommendation Report

> **Date:** 2026-07-18  
> **After:** OSS-100-12 Owner Acceptance  
> **Nature:** Recommendation only — **not authorised for implementation**  
> **State:** **Recommended, Awaiting Approval**  
> **Authority:** Repository + ACTIVE-BACKLOG + AI-MANIFEST bootstrap

---

## 1. Bootstrap Summary

| Step                            | Result                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| AI-MANIFEST                     | Read                                                                      |
| CURRENT-MILESTONE               | **OSS-100-12 ACCEPTED / CLOSED**                                          |
| CURRENT-STATE                   | Aligns with disk for event-bus **0.1.0**, outbox **0.1.0**, SDK **1.0.0** |
| ACTIVE-BACKLOG                  | Next awaiting item: **OSS-100-12+** (product provisioning flows)          |
| Completion / Acceptance reports | OSS-100-12 completion + acceptance **ACCEPTED / CLOSED**                  |
| Capability Inventory            | Event Bus accepted; provisioning remainder listed as awaiting             |
| Conversation history            | Not used for status                                                       |

---

## 2. Repository Verification

| Check                                  | Result                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| `@apzhub/platform-event-bus`           | **0.1.0** on disk                                            |
| `@apzhub/platform-outbox`              | **0.1.0** on disk                                            |
| `@apzhub/integration-sdk`              | **1.0.0** Architecture Frozen                                |
| `@apzhub/platform-services`            | **0.25.0**                                                   |
| `@apzhub/integration-plane` / `zammad` | **0.6.0** / **0.6.0**                                        |
| Integrations on disk                   | plane, zammad, meilisearch, n8n, github-actions              |
| Absent                                 | Kimai, Paperless, Metabase, Grafana stack, GitLab CI adapter |
| OSS-100-12 acceptance                  | **ACCEPTED / CLOSED**                                        |

---

## 3. Current Approved Programme

**None.**

No implementation programme is authorised.  
**Recommended (not approved):** **OSS-100-12+** — Product Provisioning Flows (from ACTIVE-BACKLOG).

---

## 4. Why this programme is next

| Criterion                | Assessment                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exists in ACTIVE-BACKLOG | Yes — **OSS-100-12+** (product provisioning flows)                                                                                                                                          |
| Not completed            | Yes — remainder after Event Bus slice; still awaiting                                                                                                                                       |
| Not superseded           | Yes                                                                                                                                                                                         |
| No freeze conflict       | Additive platform/governance work; does not rewrite frozen Search / SDK public API / SoR waves                                                                                              |
| Aligns with repository   | Governance provisioning foundation exists (`@apzhub/platform-governance`); Event Bus + outbox now available for async provisioning callbacks/status; commercial onboarding still incomplete |

**Selection:** recommend the **product provisioning flows** track remaining under **OSS-100-12+**. This is the first non-closed, non-deferred, named item in the owner-ratified ACTIVE-BACKLOG priority list after OSS-100-12 closure.

**Related roadmap note (not a substitute ID):** Platform Core v2 roadmap describes the same capability class as **PCv2-03 — Commercial Provisioning**. This recommendation uses the **ACTIVE-BACKLOG ID `OSS-100-12+`** only. Owner may bind an approved sprint guide to that ID (and optionally cross-reference PCv2-03 in the guide) without inventing a new backlog ID here.

**Not selected (and why):**

| Candidate                                       | Reason                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M17 CI/CD                                       | In PCS-001 sequencing but **not** listed as an ACTIVE-BACKLOG programme row with an actionable ID |
| GitLab CI                                       | Explicitly **future** — no assigned milestone ID in ACTIVE-BACKLOG                                |
| AI Assist                                       | Explicitly **deferred**                                                                           |
| Kimai / OSS Wave 3                              | Wave-level; no authorised Kimai sprint ID in ACTIVE-BACKLOG                                       |
| APZCONFIG-007 / APZNOTIFY-007 / APZWORKFLOW-012 | Roadmap only — “do not implement”                                                                 |
| PRH-012+                                        | Awaiting direction; not a single named programme                                                  |
| PCv2-08 / BullMQ                                | Explicitly excluded from recent programmes; not the next backlog row                              |
| PCv2-03 as invented sole ID                     | Roadmap name exists, but ACTIVE-BACKLOG programme ID is **OSS-100-12+** — do not invent           |

---

## 5. Dependencies

- `@apzhub/platform-governance` — existing feature flags / capability enablement foundation
- `@apzhub/platform-outbox` **0.1.0** — durable async status / callbacks
- `@apzhub/platform-event-bus` **0.1.0** — ingress / event dispatch for provisioning lifecycle events
- `@apzhub/integration-sdk` **1.0.0** (frozen) — do not break public contracts
- ADR-0044 Governance & Provisioning Framework (accepted)

---

## 6. Risks

| Risk                                                        | Mitigation                                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Scope creep into full commercial SaaS / billing / licensing | Owner sprint guide must bound **OSS-100-12+** to product/tenant enablement flows only (exclude PCv2-10 licensing, billing) |
| Confusion with Integration SDK freeze                       | Keep product provisioning in platform packages; no SDK public API break without ADR                                        |
| Overlap with Identity Administration                        | Identity SoR frozen; provisioning must not reopen authentication/directory sync                                            |
| Duplicate of first-login bootstrap                          | Clarify boundary vs existing governance / first-login enablement                                                           |

---

## 7. Estimated implementation scope

MVP (indicative — subject to approved sprint guide):

1. Tenant / product enablement workflow beyond first-login bootstrap
2. Provisioning status model + API (poll / callback hooks) using outbox + Event Bus where appropriate
3. Governance-driven product activation orchestration
4. Health / diagnostics / audit for provisioning operations
5. Tests + audit/certify command
6. Docs / CURRENT-* / Acceptance Report

Explicit non-goals for this recommendation: Kimai adapter, GitLab CI, BullMQ / PCv2-08, billing/licensing (PCv2-10), AI Assist, frozen SoR rewrites, Integration SDK public contract changes.

---

## 8. Expected deliverables

- Sprint guide for **OSS-100-12+** (owner-approved scope statement)
- Implementation package(s) / wiring as defined in that guide
- Tests + certification/audit
- Completion Report + Programme Acceptance Report
- CURRENT-STATE / CURRENT-MILESTONE / ACTIVE-BACKLOG / AI-MANIFEST updates

---

## 9. Expected completion criteria

- Scope matches owner-approved OSS-100-12+ sprint guide
- Tests pass; audit/certify PASS when defined
- No Integration SDK breaking changes (or ADR + owner if unavoidable)
- Frozen Search / SoR waves unmodified
- Programme Acceptance Report PASS
- Owner Acceptance → CLOSED

---

**STOP.** Do not implement. Await explicit Owner Approval of **OSS-100-12+**.
