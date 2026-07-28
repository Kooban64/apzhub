# APZHUB-QA-CERT-003 — Platform 1.2.0 Final Portfolio Certification

> **Programme:** APZHUB-QA-CERT-003  
> **Classification:** QUALITY CERTIFICATION  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0**  
> **Root version:** `0.1.0-foundation`  
> **Date:** 2026-07-21  
> **Rule:** Certification only — no engineering, no source modifications  
> **Overall status:** **CERTIFICATION FAILED**  
> **Status:** Executed — hard residual reviewed under [APZHUB-QA-CERT-004](../platform-1.2.0-visual-review/README.md)  
> **Follow-on:** [APZHUB-QA-CERT-004](../platform-1.2.0-visual-review/README.md) **ACCEPTED** · official freeze [APZHUB-RELEASE-001](../../releases/platform-1.2.0/README.md)

## Pack

| Document                  | Path                                                           |
| ------------------------- | -------------------------------------------------------------- |
| Final Certification       | [FINAL-CERTIFICATION.md](./FINAL-CERTIFICATION.md)             |
| Quality Summary           | [QUALITY-SUMMARY.md](./QUALITY-SUMMARY.md)                     |
| Playwright Results        | [PLAYWRIGHT-RESULTS.md](./PLAYWRIGHT-RESULTS.md)               |
| Vitest Results            | [VITEST-RESULTS.md](./VITEST-RESULTS.md)                       |
| Architecture Verification | [ARCHITECTURE-VERIFICATION.md](./ARCHITECTURE-VERIFICATION.md) |
| Compatibility Report      | [COMPATIBILITY-REPORT.md](./COMPATIBILITY-REPORT.md)           |
| Known Limitations         | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                 |
| Residual Risks            | [RESIDUAL-RISKS.md](./RESIDUAL-RISKS.md)                       |
| Owner Acceptance          | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                   |
| Completion Report         | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                 |

## Preconditions verified

| Check                               | Result                        |
| ----------------------------------- | ----------------------------- |
| APZHUB-ENG-0022 Owner Decision      | **ACCEPTED** (this programme) |
| Punch-list engineering              | **COMPLETE**                  |
| Source modifications under CERT-003 | **None**                      |

## Overall status

# CERTIFICATION FAILED

Lint, TypeScript, and Vitest **PASS**. Portfolio full Playwright **FAIL** (1 hard · 6 flaky · 119 passed).

## Evidence

| Artefact          | Path                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Programme summary | [20260721T193500Z-APZHUB-QA-CERT-003-SUMMARY.json](../../operations/evidence/portfolio-recert/20260721T193500Z-APZHUB-QA-CERT-003-SUMMARY.json) |
| Path PASS         | [20260721T192226Z-R12-QA-01-path-PASS.json](../../operations/evidence/portfolio-recert/20260721T192226Z-R12-QA-01-path-PASS.json)               |
| Full FAIL         | [20260721T193400Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T193400Z-R12-QA-01-full-FAIL.json)               |
| Host logs         | `/tmp/qa-cert-003/{lint,typecheck,vitest,openapi-*,path-recert,full-recert}.log`                                                                |
