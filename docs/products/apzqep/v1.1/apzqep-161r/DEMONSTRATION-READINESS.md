# Demonstration Readiness — APZQEP-161R

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-161R      |
| Timestamp | 20260803T152830Z |

## Scenario scorecard

| Scenario                 | Result        | Notes                                                          |
| ------------------------ | ------------- | -------------------------------------------------------------- |
| Create project           | **PARTIAL**   | V1.0 project capability exists; not automation-specific wizard |
| Register provider        | **PARTIAL**   | Playwright pre-registered; no operator “add provider” UI       |
| Execute Playwright suite | **PASS**      | Dry-run PASS; live suite PARTIAL pending env + browser install |
| Collect evidence         | **PASS**      | Artifacts + evidence refs + publish event                      |
| Review screenshots       | **PARTIAL**   | Listed as artifacts; no image viewer                           |
| Review traces            | **PARTIAL**   | Trace artifact metadata only                                   |
| Review videos            | **PARTIAL**   | Video artifact metadata only                                   |
| Review logs              | **PARTIAL**   | Log/console artifact metadata; no live console                 |
| Generate report          | **PARTIAL**   | Execution summary present; Cap F reporting separate            |
| Display dashboards       | **NOT READY** | Wave 164 scope                                                 |
| Explain failure          | **PARTIAL**   | Failed state + summary; limited structured diagnosis           |
| Show execution history   | **PASS**      | Queue/history table                                            |
| Export evidence          | **NOT READY** | No export API/UI in Wave 1                                     |

## Demo narrative (recommended)

Use [DEMO-SCRIPT.md](./DEMO-SCRIPT.md): provider registry → dry-run execution → lifecycle → artifacts/evidence refs → history. Explicitly frame dry-run as Wave 1 certification path; live browser as optional opt-in.

## Aggregate demonstration readiness

**PARTIAL → acceptable for technical / architecture demos; not yet a polished customer “theatre” demo.**

Board may still certify operational readiness while scheduling execution-experience polish before customer-facing showcases.
