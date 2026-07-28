# APZHUB Release 1.1 — Programme Plan

> **Programme:** APZHUB-RELEASE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Standard:** [Platform Delivery Standard](../../engineering/platform-delivery/PLATFORM-DELIVERY-STANDARD.md)

---

## Purpose

Define how Release **1.1** work is authorised and sequenced after Owner Acceptance of this planning pack.

---

## Governing rules

1. Platform **1.0.0** remains Production Baseline until **1.1.0** is certified.
2. No implementation from this document alone.
3. Every delivery uses PDS stages + quality gates.
4. Frozen artefacts (Integration SDK **1.0.0**, GHA Reference Adapter, Search Publication freezes, etc.) require ADR + Owner to change.
5. Engine brands never become primary UX.
6. Prefer **Enhance** existing certified products over new products in 1.1.

---

## Suggested programme waves (naming only — not authorised)

| Wave      | Focus                                                                 | Example programme names (illustrative)                                                                |
| --------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **1.1-A** | Law OBS + UX polish                                                   | OBS closed via **APZHUB-1.1-001/002** (**ACCEPTED**); UX polish not authorised                        |
| **1.1-B** | Support notification/Event Bus gaps                                   | **APZHUB-1.1-003** **ACCEPTED / CLOSED**                                                              |
| **1.1-C** | Cross-product automation slice                                        | **APZHUB-1.1-004** **ACCEPTED / CLOSED**                                                              |
| **1.1-D** | Time enhance slice                                                    | APZ-TIME-1.1… (not authorised)                                                                        |
| **1.1-E** | Workflow / Analytics / TCMS / Documents / Projects selective enhances | Not authorised                                                                                        |
| **1.1-F** | Platform 1.1.0 packaging & certification                              | **APZHUB-1.1-006** filed — recommendation **PRODUCTION_READY_WITH_LIMITATIONS** (Awaiting Acceptance) |

Exact IDs are Owner-gated at Approval time.

---

## Entry criteria (to start a 1.1 delivery programme)

| #   | Criterion                                                |
| --- | -------------------------------------------------------- |
| 1   | This planning pack **ACCEPTED**                          |
| 2   | Named Owner Approval for the specific programme          |
| 3   | Classification + KL reference cited                      |
| 4   | Architecture freeze impact assessed                      |
| 5   | Tests/docs/acceptance criteria defined before code (015) |

---

## Exit criteria (Platform 1.1.0)

| #   | Criterion                                                                   |
| --- | --------------------------------------------------------------------------- |
| 1   | Selected 1.1 themes delivered or explicitly deferred with KL update         |
| 2   | Product SemVer evidence packs updated where products change                 |
| 3   | Platform **1.1.0** certification pack under `docs/releases/platform/1.1.0/` |
| 4   | PORTFOLIO-RELEASE-REGISTER updated                                          |
| 5   | QA-002 hygiene retained                                                     |

---

## STOP

Await Owner Acceptance of **APZHUB-RELEASE-001**, then separate Approvals per wave.
