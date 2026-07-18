# Programme Recommendation Report

> **Date:** 2026-07-18  
> **After:** PCv2-02 Owner Acceptance  
> **Nature:** Recommendation only — **not authorised for implementation**  
> **Authority:** Repository + ACTIVE-BACKLOG + AI-MANIFEST bootstrap

---

## 1. Bootstrap Summary

| Step                            | Result                                                                      |
| ------------------------------- | --------------------------------------------------------------------------- |
| AI-MANIFEST                     | Read                                                                        |
| CURRENT-MILESTONE               | **PCv2-02 ACCEPTED / CLOSED**                                               |
| CURRENT-STATE                   | Aligns with disk for outbox **0.1.0**, SDK **1.0.0**                        |
| ACTIVE-BACKLOG                  | Awaiting items include **OSS-100-12+** (Provisioning / Event Bus / ingress) |
| Completion / Acceptance reports | PCv2-02 completion + acceptance present                                     |
| Capability Inventory            | Integrations unchanged; outbox MVP recorded                                 |
| Conversation history            | Not used for status                                                         |

---

## 2. Repository Verification

| Check                                  | Result                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| `@apzhub/platform-outbox`              | **0.1.0** on disk                                            |
| `@apzhub/integration-sdk`              | **1.0.0** Architecture Frozen                                |
| `@apzhub/integration-plane` / `zammad` | **0.6.0** / **0.6.0**                                        |
| `@apzhub/platform-services`            | **0.25.0**                                                   |
| Integrations on disk                   | plane, zammad, meilisearch, n8n, github-actions              |
| Absent                                 | Kimai, Paperless, Metabase, Grafana stack, GitLab CI adapter |
| PCv2-02 acceptance                     | Accepted / closed                                            |

---

## 3. Current Approved Programme

**None.**

No implementation programme is authorised.  
**Recommended (not approved):** **OSS-100-12** — Event Bus / webhook ingress (from ACTIVE-BACKLOG **OSS-100-12+**).

---

## 4. Why this programme is next

| Criterion                | Assessment                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Exists in ACTIVE-BACKLOG | Yes — **OSS-100-12+** (Provisioning / Event Bus / ingress)                                                                    |
| Not completed            | Yes — planned / awaiting approval                                                                                             |
| Not superseded           | Yes                                                                                                                           |
| No freeze conflict       | Additive platform runtime; does not rewrite frozen Search / SDK public API (contracts already in OSS-100-08)                  |
| Aligns with repository   | PCv2-02 outbox handlers are acknowledge-only; SDK webhook/polling contracts exist without ingress; ENF bus is in-process only |

**Selection among the 100-12+ bucket:** recommend the **Event Bus / webhook ingress** track (not provisioning). Provisioning remains listed in the same backlog bucket and may follow as a later 100-12+ slice or PCv2-03; recommending both would violate “single programme”.

**Not selected (and why):**

| Candidate                                       | Reason                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| M17 CI/CD                                       | In PCS-001 sequencing but **not** listed as an ACTIVE-BACKLOG programme row with an actionable ID |
| GitLab CI                                       | “Future” — no assigned milestone ID in ACTIVE-BACKLOG                                             |
| AI Assist                                       | Explicitly **deferred**                                                                           |
| Kimai / OSS Wave 3                              | Wave-level; no authorised Kimai sprint ID in ACTIVE-BACKLOG                                       |
| APZCONFIG-007 / APZNOTIFY-007 / APZWORKFLOW-012 | Roadmap only — “do not implement”                                                                 |
| PRH-012+                                        | Awaiting direction; not a single named programme                                                  |

---

## 5. Dependencies

- `@apzhub/integration-sdk` **1.0.0** (frozen) — webhook/polling contracts (OSS-100-08)
- `@apzhub/platform-outbox` **0.1.0** (PCv2-02) — durable drain path for outbox → bus relay
- `@apzhub/event-notification-framework` — in-process Event Bus (SPR-006 complete; durable transport deferred)
- Platform HTTP / gateway patterns for internal ingress (no business logic in edge proxy)

---

## 6. Risks

| Risk                                         | Mitigation                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Scope creep into provisioning + full PCv2-08 | Owner approval must bound OSS-100-12 to **ingress + Event Bus relay only** |
| Breaking Integration SDK freeze              | Prefer platform packages + composition; no breaking SDK API without ADR    |
| Duplicate of Search journal / outbox         | Clear boundary: ingress/bus ≠ search publication journal                   |
| Security (untrusted webhooks)                | Signature verification, tenant scope, rate limits, no secrets in logs      |

---

## 7. Estimated implementation scope

MVP (indicative — subject to approved sprint guide):

1. Platform webhook ingress endpoint(s) (internal/gateway path) validating SDK event envelopes
2. Durable or outbox-backed relay into platform Event Bus subscribers
3. Wire optional outbox handler to publish domain events (replace acknowledge-only for selected types)
4. Health/diagnostics for ingress + relay
5. Tests + audit command
6. Docs / CURRENT-* / Acceptance Report

Explicit non-goals for this recommendation: commercial provisioning UI, BullMQ platform, Kimai adapter, GitLab CI, notification delivery providers (APZNOTIFY-007).

---

## 8. Expected deliverables

- Sprint guide for **OSS-100-12** (owner-approved scope statement)
- Implementation package(s) / wiring as defined in that guide
- Tests + certification/audit
- Completion Report + Programme Acceptance Report
- CURRENT-STATE / CURRENT-MILESTONE / ACTIVE-BACKLOG / AI-MANIFEST updates

---

## 9. Expected completion criteria

- Scope matches owner-approved OSS-100-12 sprint guide
- Tests pass; audit/certify PASS
- No Integration SDK breaking changes (or ADR + owner if unavoidable)
- Frozen Search / SoR waves unmodified
- Programme Acceptance Report PASS
- Owner Acceptance → CLOSED

---

**STOP.** Do not implement. Await explicit owner approval of **OSS-100-12**.
