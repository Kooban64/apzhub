# PROGRAMME-BREAKDOWN — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Wave 3 programme family (proposed)

| Programme          | Nature                         | Status under this Auth   |
| ------------------ | ------------------------------ | ------------------------ |
| **APZQEP-163-000** | Architecture definition        | **This programme**       |
| PBR-APZQEP-163-000 | Board approval of architecture | NOT STARTED              |
| **APZQEP-163**     | Engineering                    | NOT STARTED / needs Auth |
| APZQEP-163R        | Operational readiness          | NOT AUTHORISED           |
| PBR-APZQEP-163     | Wave 3 certification           | NOT AUTHORISED           |

## Relationship to APZQEP-160

| APZQEP-160 working title         | This pack                                         |
| -------------------------------- | ------------------------------------------------- |
| Wave 3 — AI Quality Intelligence | Wave 3 — Enterprise Quality Intelligence Platform |

APZQEP-160 documents remain historical. Board approval of this pack should record the refined title for subsequent engineering Auth without silently rewriting 160.

## Downstream waves

| Wave | Programme (roadmap)           | Consumes QI?       |
| ---- | ----------------------------- | ------------------ |
| 4    | APZQEP-164 Dashboards         | Yes — projections  |
| 5    | APZQEP-165 Continuous Quality | Yes                |
| 6    | APZQEP-166 Ecosystem          | Possibly providers |

## Package catalogue impact (future)

| Package                                 | Role       |
| --------------------------------------- | ---------- |
| `@apzhub/platform-quality-intelligence` | Platform   |
| `@apzhub/qep-quality-intelligence`      | QEP facade |
| `modules/qep-quality-intelligence`      | Module     |
