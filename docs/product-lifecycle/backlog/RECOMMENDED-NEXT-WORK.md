# Recommended Next Work (Exactly One Item)

> **Programme:** APZHUB-BACKLOG-001  
> **Date:** 2026-07-20  
> **Authority:** Advisory recommendation only  
> **Does NOT approve** engineering  
> **Does NOT invent** Owner Approval  
> **Future programme ID (Owner-assigned when selected):** APZHUB-ENG-0001

---

## Recommendation

| Field                     | Value                                |
| ------------------------- | ------------------------------------ |
| **Identifier**            | **R12-PERSIST-01**                   |
| **Title**                 | Automation journal → Postgres SoR    |
| **Category**              | Technical Debt / Platform Capability |
| **Priority (planning)**   | P1                                   |
| **Ready for Engineering** | **YES**                              |

---

## Reason

1. **Sequence honesty** — Approved [IMPLEMENTATION-SEQUENCE](../../releases/1.2-planning/IMPLEMENTATION-SEQUENCE.md) Wave 3 (persistence) follows completed Themes A–C; Platform **1.2.0** closed without Theme D.
2. **Residual KL** — Closes part of **PL12-KL-04** (automation journal not Postgres SoR) and **TD-12-01**.
3. **Customer value** — Maps to **CB-05** (durable automation history).
4. **Unlocks** — Preferred prerequisite for **R12-AUTO-01** (selective AU-* intents).
5. **Dependencies met** — Automation Foundation (**APZHUB-1.1-004**) **ACCEPTED / CLOSED**.
6. **Delivery pattern** — Fits proven single-item programme model (PIR recommendation #1).
7. **Not STOP** — Does not touch Email SoR, FIN-001, Workflow Execute, or Integration SDK unfreeze.
8. **Architecture fit** — Platform Service / persistence honesty; no module-to-connector bypass; SoR rule (011) strengthened.

---

## Dependencies

| Dependency                                          | Status                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| Automation Foundation (APZHUB-1.1-004)              | **Met**                                                                    |
| Event Bus / outbox MVP                              | Available (maintain; not rewrite)                                          |
| Integration SDK freeze                              | **Binding** — no unfreeze                                                  |
| Platform 1.2.0 baseline                             | **Do not mutate** packaging; additive engineering under new programme only |
| Owner Approval of R12-PERSIST-01 as APZHUB-ENG-0001 | **Required before any code**                                               |

---

## Expected repository impact

| Area                                              | Impact                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Persistence                                       | Automation journal storage moves toward Postgres System of Record        |
| Platform Services / Workflow-Automation adjacency | Service-layer orchestration + validation; no UI business logic           |
| Migrations                                        | Likely new Postgres migration(s) under platform schema conventions       |
| Known Limitations                                 | Update PL12-KL-04 (or successor) honesty when Accepted                   |
| Tests                                             | Unit + integration + contract; Platform Delivery Standard stages         |
| Docs                                              | Programme pack under continuous delivery (ENG-0001); KL/register updates |
| STOP surfaces                                     | **None**                                                                 |

---

## Affected packages (expected)

| Package / area                                                    | Likely touch                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Automation / workflow platform persistence packages               | Primary                                                              |
| Related `@apzhub/*` platform-services facets (if journal exposed) | Secondary                                                            |
| `apps/web`                                                        | Minimal or none (unless admin/diagnostics surface already exists)    |
| Integration adapters                                              | **None** (unless journal reads engine metadata — still via services) |
| Integration SDK core                                              | **None** (frozen)                                                    |

_Exact package list is confirmed in ENG-0001 design stage — not authorised here._

---

## Affected products

| Product                                       | Impact                                            |
| --------------------------------------------- | ------------------------------------------------- |
| **APZHUB Platform**                           | Persistence honesty for automation journal        |
| **APZ Workflow** (commercial)                 | Durable history adjacency — **no Execute unlock** |
| Cross-product Automation Foundation consumers | Reliable journal SoR                              |
| Support / Projects / Law                      | Indirect — enables later AUTO-01 intents          |

---

## Affected platforms

| Platform                                     | Impact                                 |
| -------------------------------------------- | -------------------------------------- |
| Platform PostgreSQL (metadata / journal SoR) | Primary SoR path                       |
| Redis / Event Bus                            | Secondary (events after persist — 012) |
| Host coexistence (`apz-stack`)               | No disruptive remaps                   |

---

## Acceptance criteria summary (for future ENG-0001)

1. Automation journal durable in Postgres as System of Record (not ephemeral-only).
2. Platform Service boundary respected — modules do not write journal storage directly.
3. Migrations, tests, and health/observability evidence per Platform Delivery Standard.
4. Known Limitations / debt registers updated; no overclaim of AUTO-01 or Execute.
5. No Email SoR · FIN-001 · Workflow Execute · SDK unfreeze.
6. Owner Acceptance of ENG-0001 before Production claim for the change.

---

## Estimated engineering programme size

| Estimate   | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| Size       | **M** (medium single-item programme)                        |
| Complexity | **M**                                                       |
| Risk       | **M** (data migration / dual-read care)                     |
| Pattern    | One Owner-approved programme → implement → certify → Accept |

---

## Explicit non-approval

This document **recommends** R12-PERSIST-01 for Owner selection.

It does **not**:

- Approve APZHUB-ENG-0001
- Authorise implementation
- Begin Release 1.3
- Modify Platform **1.2.0** packaging
- Select a second item

**Owner action required:** Approve exactly one backlog item (this recommendation or an alternate Ready=YES candidate) as **APZHUB-ENG-0001**.
