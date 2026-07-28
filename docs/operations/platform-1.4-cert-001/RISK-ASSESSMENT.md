# Risk Assessment — Platform-1.4-CERT-001

## Residual risks

| ID   | Risk                                                      | Severity | Mitigation / disposition                                       | Owner             |
| ---- | --------------------------------------------------------- | -------- | -------------------------------------------------------------- | ----------------- |
| R-01 | Operator runs `pnpm build` with `NODE_ENV=development`    | Medium   | OQ-BLD-001 · handbook · CI uses `NODE_ENV=test`                | Ops / Tooling     |
| R-02 | Durable delivery not enabled in production (flag OFF)     | Medium   | Intentional; separate Approval for enablement                  | Owner             |
| R-03 | Process-local delivery remains default path               | Medium   | Documented freeze; restart durability limited until enablement | Platform Ops      |
| R-04 | Product Playwright residuals (Support Soft/visual)        | Low      | OQ-PW-001 · product backlogs                                   | Product owners    |
| R-05 | ENG-001B-P5 / SMTP / Email SoR / WebSockets not delivered | Low      | Explicit exclusions · not in 1.4 CERT scope                    | Future programmes |
| R-06 | Optional build-script hardening deferred                  | Low      | Backlog · separate Repository/Tooling authorisation            | Tooling           |

## Risk posture

No unmitigated Platform defect blocks certification. Remaining items are **operational qualifications**, intentional freezes, or **product-owned** residuals.

## Enablement risk note

Enabling `APZHUB_NOTIFICATION_DURABLE_RUNTIME` is **outside** this certification and requires a named Owner Approval programme. Certification does **not** authorise enablement.
