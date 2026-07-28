# Risk Review — Platform-1.4-OR-001

> **Date:** 2026-07-23 · Review + residual update · **No remediation**

## Inherited (ENG-001B-P3)

| ID      | Risk                             | Residual after OR-001                                                           |
| ------- | -------------------------------- | ------------------------------------------------------------------------------- |
| R-P3-01 | Stale worker overwrite           | Low — fencing validated in unit + probe fence simulation                        |
| R-P3-02 | Dual runtime double-dispatch     | Low–Med — flag default OFF confirmed                                            |
| R-P3-03 | Uncertain timeout duplicates     | Med — unchanged                                                                 |
| R-P3-04 | Postgres fencing unverified live | **Reduced for engine pattern**; **remains Med for product tables** (undeployed) |
| R-P3-05 | Event bus outage                 | Low — unchanged                                                                 |

## New operational risks

| ID      | Risk                                                                   | Severity | Treatment under OR-001                                           |
| ------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| OR-R-01 | Deploying/enabling durable runtime before migrations 0065–0067 applied | **High** | Recorded; do not enable flag; propose migration deploy programme |
| OR-R-02 | Operators assume live SKIP LOCKED product validation complete          | **Med**  | Documented honesty in POSTGRESQL-VALIDATION                      |
| OR-R-03 | Admin HTTP bound to in-memory store in some bootstraps                 | **Med**  | Known limitation; verify bind in deploy runbook before prod      |

## Proposed remediation programmes (not authorised here)

1. **Platform-1.4-MIG-001** (proposed name) — Apply migrations 0062–0067 (or verified subset) to target environments with backup/rollback.
2. **Platform-1.4-QA-LIVE-001** — Add Owner-approved live SKIP LOCKED / multi-worker CI against `DATABASE_URL`.
3. Then **Platform-1.4-CERT-001** — Certification after OR acceptance + migration evidence.
