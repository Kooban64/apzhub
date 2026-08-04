# REGRESSION-PLAN — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

## Layers

| Layer                   | Scope                                                        | When                              |
| ----------------------- | ------------------------------------------------------------ | --------------------------------- |
| Platform regression     | `@apzhub/platform-orchestration` public API + kernel         | Every slice touching package      |
| Wave regression         | Waves 1–4 packages still green; no peer redesign             | Every integration slice (S11–S15) |
| Contract regression     | Automation/SCM/QI/Evidence/Dashboard/Gate/Approval contracts | S02, S06, S11–S14                 |
| API regression          | Orchestration REST envelope, authz, idempotency              | S16+                              |
| Workspace regression    | Shell/permissions/a11y for orchestration views               | S15, S17                          |
| Quality Flow regression | Lifecycle transitions, cancel, timeout, resume               | S04+                              |
| Integration regression  | End-to-end fake-peer Quality Flow happy/fail paths           | S11–S14, S18                      |

## Strategy

1. Prefer contract tests with deterministic fakes over live engines in slice CI.
2. Keep Wave 1–4 package tests in CI; orchestration must not break them.
3. S18 runs full matrix + Playwright for approval-critical UX.
4. Record baseline commits per slice for bisect/rollback.
