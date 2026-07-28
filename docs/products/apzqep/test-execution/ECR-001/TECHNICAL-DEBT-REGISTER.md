# Technical Debt Register — APZQEP-ECR-001

Document only — **no remediation authorised**.

| ID    | Debt                                                         | Wave / area     | Severity | Recommended future action                             |
| ----- | ------------------------------------------------------------ | --------------- | -------- | ----------------------------------------------------- |
| TD-01 | OpenAPI artefacts for `/api/v1/qep/executions` not published | 100D / docs     | High     | Dedicated OpenAPI programme before/with Certification |
| TD-02 | Outbox enqueue without dispatcher/worker                     | 100D / events   | High     | Platform event dispatch programme                     |
| TD-03 | EvidenceAccessPort default-allow when uninjected             | 100D / security | High     | Wire Platform evidence accessibility check            |
| TD-04 | No Postgres repository integration tests                     | 100D / quality  | High     | Add DB contract tests in Compose CI                   |
| TD-05 | SearchPublicationPort no-op by default                       | 100D / search   | Medium   | Wire search provider when Search programme authorises |
| TD-06 | event.yaml not registered under Document 029                 | Events          | Medium   | Event registration programme                          |
| TD-07 | DTOs live in-package not `@apzhub/qep-contracts`             | 100C            | Medium   | Contracts promotion programme                         |
| TD-08 | Playwright Workbench uses mocked APIs                        | 100E            | Medium   | Optional live E2E under Certification                 |
| TD-09 | Package version remains `0.0.0`                              | Packaging       | Low      | Version bump under Certification/Freeze               |
| TD-10 | Accepted Wave deviations (path, steps projection, etc.)      | 100C–E          | Low      | Retain as documented latitude                         |

Refactoring opportunities noted but not scheduled.
