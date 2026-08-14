# F3 deepen — Provider Evidence Matrix (handover)

| Field       | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Status      | **LOCAL PROOF** 2026-08-09                                                 |
| Bar         | Domain-complete RC matrix for live usage — report ingest + Playwright live |
| Not claimed | Embedding every vendor binary/SaaS; consumer product overlays              |

## Done when

- No `placeholder` providers in registry
- Security, performance, code quality gates required for READY
- RC domain tiles reflect evidence (not hardcoded empties)
- One change can reach READY 100% with human still required for GO

## Proof

- Providers: 11 active, 0 placeholder
- Ingest + link: security, code_quality, performance (+ prior automation/ci/a11y)
- Evaluate → READY 100%, compositionSatisfied true
- Domains pass: requirements, automation, security, performance, accessibility, coverage, code_quality
- Brand mask: no tool names on RC tile labels

## Ops note

CI tools feed APZQEP via **report ingest** (SARIF / k6 summary / mocha-ish JSON). Playwright remains the in-process live runner (`APZHUB_AUTOMATION_LIVE=true`).
