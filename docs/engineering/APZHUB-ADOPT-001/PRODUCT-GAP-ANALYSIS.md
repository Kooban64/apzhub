# PRODUCT-GAP-ANALYSIS

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ADOPT-001 |
| Timestamp | 20260803T084305Z |

## Cross-cutting gaps (all seven)

| ID   | Class         | Gap                                                        | Business impact                                | Technical impact            | Operational impact | Priority | Dependencies        |
| ---- | ------------- | ---------------------------------------------------------- | ---------------------------------------------- | --------------------------- | ------------------ | -------- | ------------------- |
| G-01 | Governance    | No PRODUCT-STATUS.md                                       | High — no authoritative face                   | Medium                      | High               | P1       | Board / Owner       |
| G-02 | Governance    | No Product Board resolutions                               | High — release authority unclear under ENG-003 | Medium                      | High               | P1       | G-01                |
| G-03 | Engineering   | No ES-001…003 / Baseline 1.2 citation packs                | Medium                                         | High — future eng ambiguous | Medium             | P1       | ENG-002 baseline    |
| G-04 | Operations    | No standing product OPS programme                          | High — not ops-led                             | Medium                      | High               | P1       | G-01                |
| G-05 | Evidence      | Operational monitoring / enhancement registers absent      | Medium                                         | Low                         | High               | P2       | G-04                |
| G-06 | Governance    | ENG-002 “nascent” vs historical Production ACCEPTED        | High — status confusion                        | Medium                      | Medium             | P1       | Board clarification |
| G-07 | Documentation | Catalogue / dual-pack / acceptance conflicts (esp. AN, WF) | High                                           | Medium                      | Medium             | P1       | Owner / Board       |

Effort estimates are **high-level planning only** (S/M/L), not implementation commitments.

## Per-product highlights

| Product          | Top gaps                                                             | Effort (planning)    | Adoption readiness |
| ---------------- | -------------------------------------------------------------------- | -------------------- | ------------------ |
| APZ Projects     | G-01…06; security pack EI; catalogue UI wording conflict             | M                    | PARTIALLY READY    |
| APZ Support      | G-01…06; adapter version drift 0.6 vs 0.8                            | M                    | PARTIALLY READY    |
| APZ Time         | G-01…06; stale catalogue “not started”                               | M                    | PARTIALLY READY    |
| APZ Documents    | G-01…06; dual-folder authority                                       | M                    | PARTIALLY READY    |
| APZ Analytics    | G-01…07; catalogue omission; release acceptance EI                   | L (governance first) | **NOT READY**      |
| APZ Workflow     | G-01…07; catalogue omission; release acceptance EI; execute deferred | L (governance first) | **NOT READY**      |
| APZ Law Platform | G-01…06; maturity label conflict; FIN-001 deferred                   | M                    | PARTIALLY READY    |

## What is not a gap in this programme

Missing product features, architecture redesign desires, or Version N+1 scope — out of assessment scope. No engineering actions authorised to close gaps.
